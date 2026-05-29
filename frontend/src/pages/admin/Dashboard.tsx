import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { addNotification } from '@/store/slices/uiSlice';
import { buildAdminReportCsv, downloadCsv, getAdminQuickActions } from '@/lib/roleDashboardConfig';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import CardDetailModal from '@/components/common/CardDetailModal';
import { Reveal3D } from '@/components/common/Parallax';
import mockDataService from '@/services/mockDataService';
import { cn } from '@/lib/utils';
import {
  Users,
  Shield,
  FileText,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Settings,
  Bell,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  pendingClaims: number;
  totalRevenue: number;
  monthlyRevenue: number;
  userGrowth?: number;
  policyGrowth?: number;
  claimResolutionRate?: number;
  averageClaimTime?: number;
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTERED' | 'POLICY_CREATED' | 'CLAIM_FILED' | 'PAYMENT_RECEIVED' | 'CLAIM_APPROVED';
  description: string;
  timestamp: string;
  user: string;
  amount?: number;
}

type CardId =
  | 'totalUsers'
  | 'activePolicies'
  | 'pendingClaims'
  | 'monthlyRevenue'
  | 'userActivity'
  | 'claimResolution'
  | 'revenueOverview';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const countBy = <T,>(items: T[], key: (item: T) => string): Record<string, number> =>
  items.reduce((acc, item) => {
    const k = key(item);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

/** A metric card that lifts/scales on hover and opens a detail popup on click. */
const ClickableCard: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, children, className }) => (
  <motion.div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    whileHover={{ y: -6, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={cn('cursor-pointer outline-none focus:ring-2 focus:ring-primary/40 rounded-lg', className)}
  >
    {children}
  </motion.div>
);

// Small presentational helpers used inside the detail popups
const StatGrid: React.FC<{ items: { label: string; value: string; hint?: string }[] }> = ({ items }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
    {items.map((it) => (
      <div key={it.label} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
        <p className="text-xs font-medium text-neutral-500">{it.label}</p>
        <p className="mt-1 text-lg font-bold text-neutral-900">{it.value}</p>
        {it.hint && <p className="text-xs text-neutral-500">{it.hint}</p>}
      </div>
    ))}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-neutral-500">{children}</h4>
);

const quickActionIcon = (id: string) => {
  if (id.includes('policy') || id === 'policies' || id === 'billing-policies') return <Shield className="h-6 w-6" />;
  if (id.includes('user') || id === 'users') return <Users className="h-6 w-6" />;
  if (id.includes('claim') || id.includes('underwriting')) return <FileText className="h-6 w-6" />;
  if (id.includes('report')) return <BarChart3 className="h-6 w-6" />;
  return <Activity className="h-6 w-6" />;
};

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCard, setActiveCard] = useState<CardId | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [exporting, setExporting] = useState(false);

  const roleQuickActions = useMemo(() => getAdminQuickActions(user?.role), [user?.role]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const adminStats = mockDataService.getAdminStats() as AdminStats;
      setStats(adminStats);

      const mockActivity: RecentActivity[] = [
        { id: '1', type: 'USER_REGISTERED', description: 'New client registration', timestamp: '2024-01-20T10:30:00Z', user: 'Sarah Johnson' },
        { id: '2', type: 'CLAIM_FILED', description: 'Auto insurance claim filed', timestamp: '2024-01-20T09:45:00Z', user: 'Michael Chen', amount: 5000 },
        { id: '3', type: 'POLICY_CREATED', description: 'Home insurance policy created', timestamp: '2024-01-20T09:15:00Z', user: 'Emily Davis', amount: 1200 },
        { id: '4', type: 'PAYMENT_RECEIVED', description: 'Premium payment received', timestamp: '2024-01-20T08:30:00Z', user: 'Robert Wilson', amount: 800 },
        { id: '5', type: 'CLAIM_APPROVED', description: 'Water damage claim approved', timestamp: '2024-01-20T08:00:00Z', user: 'Lisa Anderson', amount: 12000 },
        { id: '6', type: 'USER_REGISTERED', description: 'New client registration', timestamp: '2024-01-19T16:20:00Z', user: 'David Martinez' },
      ];
      setRecentActivity(mockActivity);
      if (isRefresh) {
        dispatch(
          addNotification({
            type: 'success',
            title: 'Dashboard updated',
            message: 'Latest metrics and activity have been refreshed.',
            duration: 3000,
          })
        );
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (isRefresh) {
        dispatch(
          addNotification({
            type: 'error',
            title: 'Refresh failed',
            message: 'Could not reload dashboard data. Please try again.',
            duration: 4000,
          })
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const csv = buildAdminReportCsv(stats);
      downloadCsv(`assureme-admin-report-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      dispatch(
        addNotification({
          type: 'success',
          title: 'Report downloaded',
          message: 'Admin dashboard summary exported as CSV.',
          duration: 4000,
        })
      );
    } finally {
      setExporting(false);
    }
  };

  const handleQuickAction = (action: ReturnType<typeof getAdminQuickActions>[0]) => {
    if (!action.path) {
      handleExportReport();
      return;
    }
    if (action.openAction) {
      navigate(`${action.path}?action=${action.openAction}`);
      return;
    }
    navigate(action.path);
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      USER_REGISTERED: <Users className="h-4 w-4 text-green-500" />,
      POLICY_CREATED: <Shield className="h-4 w-4 text-blue-500" />,
      CLAIM_FILED: <FileText className="h-4 w-4 text-orange-500" />,
      PAYMENT_RECEIVED: <Wallet className="h-4 w-4 text-green-500" />,
      CLAIM_APPROVED: <CheckCircle className="h-4 w-4 text-green-500" />,
    };
    return icons[type] || <Activity className="h-4 w-4 text-neutral-500" />;
  };

  const getQuickActionColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    return colors[color] || 'bg-neutral-50 text-neutral-600 border-neutral-200';
  };

  // --- Detail data for the popups (sample records back the headline stats) ---
  const users = mockDataService.getUsers();
  const policies = mockDataService.getPolicies();
  const claims = mockDataService.getClaims();
  const payments = mockDataService.getPayments();

  const activeRate = stats.totalUsers ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0';
  const avgPerPolicy = stats.totalPolicies ? stats.totalRevenue / stats.totalPolicies : 0;
  const pendingClaimList = claims.filter((c: any) => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.status));

  const cardConfig: Record<
    CardId,
    { title: string; subtitle: string; icon: React.ReactNode; accent: string; render: () => React.ReactNode }
  > = {
    totalUsers: {
      title: 'Total Users',
      subtitle: 'Everyone registered on the platform',
      icon: <Users className="h-5 w-5" />,
      accent: 'bg-blue-50 text-blue-600',
      render: () => {
        const byRole = countBy(users as any[], (u) => u.role);
        return (
          <div>
            <StatGrid
              items={[
                { label: 'Total users', value: stats.totalUsers.toLocaleString() },
                { label: 'Active', value: stats.activeUsers.toLocaleString(), hint: `${activeRate}% of total` },
                { label: 'Inactive', value: (stats.totalUsers - stats.activeUsers).toLocaleString() },
              ]}
            />
            <SectionTitle>By role</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byRole).map(([role, count]) => (
                <span key={role} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                  {role}: {count}
                </span>
              ))}
            </div>
            <SectionTitle>Recent users</SectionTitle>
            <div className="divide-y divide-neutral-100">
              {(users as any[]).map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{u.role}</span>
                    <StatusBadge status={u.status || (u.isActive ? 'ACTIVE' : 'INACTIVE')} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    activePolicies: {
      title: 'Active Policies',
      subtitle: 'Policies currently in force',
      icon: <Shield className="h-5 w-5" />,
      accent: 'bg-green-50 text-green-600',
      render: () => {
        const byType = countBy(policies as any[], (p) => p.policyType || p.type);
        return (
          <div>
            <StatGrid
              items={[
                { label: 'Active', value: stats.activePolicies.toLocaleString() },
                { label: 'Total', value: stats.totalPolicies.toLocaleString() },
                { label: 'Inactive', value: (stats.totalPolicies - stats.activePolicies).toLocaleString() },
              ]}
            />
            <SectionTitle>By type</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byType).map(([type, count]) => (
                <span key={type} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                  {type}: {count}
                </span>
              ))}
            </div>
            <SectionTitle>Sample policies</SectionTitle>
            <div className="divide-y divide-neutral-100">
              {(policies as any[]).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{p.policyNumber}</p>
                    <p className="text-xs text-neutral-500">{p.policyType || p.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-700">{formatCurrency(p.premium || p.premiumAmount || 0)}/yr</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    pendingClaims: {
      title: 'Pending Claims',
      subtitle: 'Claims awaiting review or a decision',
      icon: <FileText className="h-5 w-5" />,
      accent: 'bg-orange-50 text-orange-600',
      render: () => (
        <div>
          <StatGrid
            items={[
              { label: 'Pending', value: stats.pendingClaims.toLocaleString() },
              { label: 'Total claims', value: stats.totalClaims.toLocaleString() },
              { label: 'Avg. handling', value: stats.averageClaimTime ? `${stats.averageClaimTime} days` : '—' },
            ]}
          />
          <SectionTitle>Open claims</SectionTitle>
          {pendingClaimList.length === 0 ? (
            <p className="text-sm text-neutral-500">No open claims in the sample set.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {(pendingClaimList as any[]).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{c.claimNumber}</p>
                    <p className="text-xs text-neutral-500">{c.type || c.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-700">{formatCurrency(c.amount || c.payoutAmount || 0)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    monthlyRevenue: {
      title: 'Monthly Revenue',
      subtitle: 'Revenue collected this month',
      icon: <Wallet className="h-5 w-5" />,
      accent: 'bg-emerald-50 text-emerald-600',
      render: () => (
        <div>
          <StatGrid
            items={[
              { label: 'This month', value: formatCurrency(stats.monthlyRevenue) },
              { label: 'Total revenue', value: formatCurrency(stats.totalRevenue) },
              { label: 'Avg / policy', value: formatCurrency(avgPerPolicy) },
            ]}
          />
          <SectionTitle>Recent payments</SectionTitle>
          <div className="divide-y divide-neutral-100">
            {(payments as any[]).slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{p.description || p.type || 'Payment'}</p>
                  <p className="text-xs text-neutral-500">{p.paymentDate ? formatDate(p.paymentDate) : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(p.amount || 0)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    userActivity: {
      title: 'User Activity',
      subtitle: 'Active vs. inactive engagement',
      icon: <Activity className="h-5 w-5" />,
      accent: 'bg-blue-50 text-blue-600',
      render: () => (
        <div>
          <StatGrid
            items={[
              { label: 'Active users', value: stats.activeUsers.toLocaleString() },
              { label: 'Active rate', value: `${activeRate}%` },
              { label: 'Inactive', value: (stats.totalUsers - stats.activeUsers).toLocaleString() },
            ]}
          />
          <SectionTitle>Engagement</SectionTitle>
          <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
            <div className="h-3 rounded-full bg-green-500" style={{ width: `${activeRate}%` }} />
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {activeRate}% of {stats.totalUsers.toLocaleString()} users were active recently.
          </p>
        </div>
      ),
    },
    claimResolution: {
      title: 'Claim Resolution',
      subtitle: 'How claims are progressing',
      icon: <CheckCircle className="h-5 w-5" />,
      accent: 'bg-indigo-50 text-indigo-600',
      render: () => {
        const byStatus = countBy(claims as any[], (c) => c.status);
        const resolved = (byStatus['APPROVED'] || 0) + (byStatus['PAID'] || 0) + (byStatus['CLOSED'] || 0);
        const rate = claims.length ? Math.round((resolved / claims.length) * 100) : 0;
        return (
          <div>
            <StatGrid
              items={[
                { label: 'Resolution rate', value: `${rate}%`, hint: 'sample set' },
                { label: 'Total claims', value: stats.totalClaims.toLocaleString() },
                { label: 'Pending', value: stats.pendingClaims.toLocaleString() },
              ]}
            />
            <SectionTitle>By status</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([status, count]) => (
                <span key={status} className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                  <StatusBadge status={status} /> {count}
                </span>
              ))}
            </div>
          </div>
        );
      },
    },
    revenueOverview: {
      title: 'Revenue Overview',
      subtitle: 'Premium revenue at a glance',
      icon: <Wallet className="h-5 w-5" />,
      accent: 'bg-emerald-50 text-emerald-600',
      render: () => {
        const premiumByType = (policies as any[]).reduce((acc: Record<string, number>, p) => {
          const t = p.policyType || p.type;
          acc[t] = (acc[t] || 0) + (p.premium || p.premiumAmount || 0);
          return acc;
        }, {});
        return (
          <div>
            <StatGrid
              items={[
                { label: 'Total revenue', value: formatCurrency(stats.totalRevenue) },
                { label: 'This month', value: formatCurrency(stats.monthlyRevenue) },
                { label: 'Avg / policy', value: formatCurrency(avgPerPolicy) },
              ]}
            />
            <SectionTitle>Premium by policy type (sample)</SectionTitle>
            <div className="space-y-2">
              {Object.entries(premiumByType).map(([type, amount]) => (
                <div key={type} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2">
                  <span className="text-sm text-neutral-700">{type}</span>
                  <span className="text-sm font-medium text-neutral-900">{formatCurrency(amount as number)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-48 rounded bg-neutral-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  const active = activeCard ? cardConfig[activeCard] : null;

  return (
    <div className="space-y-6">
      <Reveal3D>
        <PageHeader
          title={`Welcome back, ${user?.firstName || 'Admin'}!`}
          description="Monitor your insurance business operations and analytics"
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => loadDashboardData(true)} loading={refreshing}>
                <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button onClick={handleExportReport} loading={exporting}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          }
        />
      </Reveal3D>

      {/* Key Metrics */}
      <Reveal3D>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ClickableCard onClick={() => setActiveCard('totalUsers')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Users</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
                  <div className="mt-2 flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{activeRate}% active</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveCard('activePolicies')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Active Policies</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.activePolicies.toLocaleString()}</p>
                  <div className="mt-2 flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">of {stats.totalPolicies.toLocaleString()} total</span>
                  </div>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveCard('pendingClaims')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Pending Claims</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.pendingClaims}</p>
                  <div className="mt-2 flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">of {stats.totalClaims} total</span>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveCard('monthlyRevenue')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.monthlyRevenue)}</p>
                  <div className="mt-2 flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Revenue growth</span>
                  </div>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </ClickableCard>
        </div>
      </Reveal3D>

      {/* Performance Metrics */}
      <Reveal3D>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ClickableCard onClick={() => setActiveCard('userActivity')}>
            <Card className="h-full p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">User Activity</h3>
                <Activity className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Active Users</span>
                  <span className="font-medium">{stats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${activeRate}%` }} />
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>{activeRate}% active</span>
                  <span>{(stats.totalUsers - stats.activeUsers).toLocaleString()} inactive</span>
                </div>
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveCard('claimResolution')}>
            <Card className="h-full p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Claim Resolution</h3>
                <CheckCircle className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Total Claims</span>
                  <span className="font-medium">{stats.totalClaims.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-200">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '96%' }} />
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>{stats.pendingClaims} pending</span>
                  <span>{stats.totalClaims} total</span>
                </div>
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveCard('revenueOverview')}>
            <Card className="h-full p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Revenue Overview</h3>
                <Wallet className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">This Month</span>
                  <span className="font-medium text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Average per Policy</span>
                  <span className="font-medium">{formatCurrency(avgPerPolicy)}</span>
                </div>
              </div>
            </Card>
          </ClickableCard>
        </div>
      </Reveal3D>

      {/* Quick Actions & Recent Activity */}
      <Reveal3D>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
              <Settings className="h-5 w-5 text-neutral-500" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {roleQuickActions.map((action) => (
                <motion.button
                  key={action.id}
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleQuickAction(action)}
                  className={`w-full rounded-lg border-2 border-dashed p-4 text-left transition-shadow hover:shadow-md ${getQuickActionColor(action.color)}`}
                >
                  <div className="flex items-center space-x-3">
                    {quickActionIcon(action.id)}
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm opacity-75">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
              <Bell className="h-5 w-5 text-neutral-500" />
            </div>
            <div className="max-h-80 space-y-4 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 rounded-lg p-3 hover:bg-neutral-50">
                  <div className="mt-0.5 flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-neutral-900">{activity.user}</p>
                      <span className="text-xs text-neutral-500">{formatDate(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{activity.description}</p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAllActivity(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View All Activity
              </Button>
            </div>
          </Card>
        </div>
      </Reveal3D>

      {/* System Alerts */}
      <Reveal3D>
        <Card className="border-l-4 border-l-orange-500 bg-orange-50 p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-900">System Notifications</h4>
              <div className="mt-2 space-y-2 text-sm text-orange-800">
                <p>• {stats.pendingClaims} claims require immediate attention</p>
                <p>• Monthly backup scheduled for tonight at 2:00 AM</p>
                <p>• {(stats.totalUsers - stats.activeUsers).toLocaleString()} users haven't logged in for 30+ days</p>
              </div>
            </div>
          </div>
        </Card>
      </Reveal3D>

      {/* 3D detail popup */}
      <CardDetailModal
        open={active !== null}
        onClose={() => setActiveCard(null)}
        title={active?.title}
        subtitle={active?.subtitle}
        icon={active?.icon}
        accent={active?.accent}
      >
        {active?.render()}
      </CardDetailModal>

      <CardDetailModal
        open={showAllActivity}
        onClose={() => setShowAllActivity(false)}
        title="All Recent Activity"
        subtitle="Complete activity feed for your role"
        icon={<Bell className="h-5 w-5" />}
        accent="bg-orange-50 text-orange-600"
      >
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 rounded-lg border border-neutral-100 p-3">
              <div className="mt-0.5 flex-shrink-0">{getActivityIcon(activity.type)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">{activity.user}</p>
                  <span className="text-xs text-neutral-500">{formatDate(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-neutral-600">{activity.description}</p>
                {activity.amount != null && (
                  <p className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardDetailModal>
    </div>
  );
};

export default AdminDashboard;
