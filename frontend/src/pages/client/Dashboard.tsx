import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import DataGrid from '@/components/common/DataGrid';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { addNotification } from '@/store/slices/uiSlice';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import CardDetailModal from '@/components/common/CardDetailModal';
import { Reveal3D } from '@/components/common/Parallax';
import { cn, getStatusColor } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import api from '@/lib/api';
import {
  Shield,
  FileText,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  RefreshCw,
} from 'lucide-react';

type StatCardId = 'policies' | 'claims' | 'payments' | 'coverage';

interface PolicyRow {
  id: string;
  type: string;
  policyNumber: string;
  status: string;
  premium: number;
  coverage: number;
  nextPayment: string;
  expiryDate: string;
}

interface ClaimRow {
  id: string;
  policyId: string;
  claimNumber: string;
  type: string;
  amount: number;
  status: string;
  submittedDate: string;
  description: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  policyType: string;
  method: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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

const ClientDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStat, setActiveStat] = useState<StatCardId | null>(null);

  const stats = useMemo(() => {
    const totalPolicies = policies.length;
    const activeClaims = claims.filter((c) =>
      ['SUBMITTED', 'UNDER_REVIEW', 'ADJUSTER_ASSIGNED'].includes(c.status)
    ).length;
    const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
    const totalCoverage = policies.reduce((sum, p) => sum + (p.coverage || 0), 0);
    return { totalPolicies, activeClaims, pendingPayments, totalCoverage };
  }, [policies, claims, payments]);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [policiesRes, claimsRes, paymentsRes] = await Promise.all([
        api.get('/policies'),
        api.get('/claims'),
        api.get('/payments'),
      ]);

      const rawPolicies = policiesRes.data?.policies || [];
      setPolicies(
        rawPolicies.map((p: any) => ({
          id: p.id,
          type: p.policyType || 'Policy',
          policyNumber: p.policyNumber,
          status: p.status,
          premium: p.premiumAmount ?? 0,
          coverage:
            typeof p.coverageDetails === 'object' && p.coverageDetails
              ? Number(Object.values(p.coverageDetails)[0]) || p.premiumAmount * 10
              : p.premiumAmount * 10,
          nextPayment: p.renewalDate || p.endDate,
          expiryDate: p.endDate,
        }))
      );

      const rawClaims = claimsRes.data?.claims || [];
      setClaims(
        rawClaims.map((c: any) => ({
          id: c.id,
          policyId: c.policyId,
          claimNumber: c.claimNumber,
          type: c.description?.slice(0, 40) || 'Claim',
          amount: c.payoutAmount ?? 0,
          status: c.status,
          submittedDate: c.submittedAt || c.incidentDate,
          description: c.description,
        }))
      );

      const rawPayments = paymentsRes.data?.payments || [];
      setPayments(
        rawPayments.map((p: any) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          dueDate: p.paymentDate || p.createdAt,
          policyType: p.method || 'Premium',
          method: p.method || '—',
        }))
      );
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      dispatch(
        addNotification({
          type: 'error',
          title: 'Could not load dashboard',
          message: 'Please refresh or try again shortly.',
          duration: 5000,
        })
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePayNow = (paymentId: string) => {
    dispatch(
      addNotification({
        type: 'info',
        title: 'Payment initiated',
        message: 'Redirecting you to complete this payment.',
        duration: 3000,
      })
    );
    navigate(`${ROUTES.CLIENT.PAYMENTS}?pay=${paymentId}`);
  };

  const statModalContent = useMemo(() => {
    switch (activeStat) {
      case 'policies':
        return {
          title: 'Your Policies',
          subtitle: `${stats.totalPolicies} policy(ies) on file`,
          icon: <Shield className="h-5 w-5" />,
          accent: 'bg-blue-50 text-blue-600',
          body: (
            <div className="divide-y divide-neutral-100">
              {policies.length === 0 ? (
                <p className="text-sm text-neutral-500">No policies yet.</p>
              ) : (
                policies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-neutral-900">{p.type}</p>
                      <p className="text-xs text-neutral-500">{p.policyNumber}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))
              )}
            </div>
          ),
        };
      case 'claims':
        return {
          title: 'Your Claims',
          subtitle: `${stats.activeClaims} active claim(s)`,
          icon: <FileText className="h-5 w-5" />,
          accent: 'bg-orange-50 text-orange-600',
          body: (
            <div className="divide-y divide-neutral-100">
              {claims.length === 0 ? (
                <p className="text-sm text-neutral-500">No claims filed.</p>
              ) : (
                claims.map((c) => (
                  <div key={c.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-neutral-900">{c.claimNumber}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-neutral-600">{c.description}</p>
                  </div>
                ))
              )}
            </div>
          ),
        };
      case 'payments':
        return {
          title: 'Payments',
          subtitle: `${stats.pendingPayments} pending`,
          icon: <CreditCard className="h-5 w-5" />,
          accent: 'bg-red-50 text-red-600',
          body: (
            <div className="divide-y divide-neutral-100">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-neutral-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-neutral-500">{formatDate(p.dueDate)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          ),
        };
      case 'coverage':
        return {
          title: 'Total Coverage',
          subtitle: 'Combined coverage across policies',
          icon: <TrendingUp className="h-5 w-5" />,
          accent: 'bg-green-50 text-green-600',
          body: (
            <div className="space-y-3">
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalCoverage)}</p>
              {policies.map((p) => (
                <div key={p.id} className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                  <span>{p.policyNumber}</span>
                  <span className="font-medium">{formatCurrency(p.coverage)}</span>
                </div>
              ))}
            </div>
          ),
        };
      default:
        return null;
    }
  }, [activeStat, policies, claims, payments, stats]);

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

  return (
    <div className="space-y-6">
      <Reveal3D>
        <PageHeader
          title={`Welcome back, ${user?.firstName}!`}
          description="Here's an overview of your insurance portfolio"
          actions={
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />
      </Reveal3D>

      <Reveal3D>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ClickableCard onClick={() => setActiveStat('policies')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Policies</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalPolicies}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveStat('claims')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Active Claims</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.activeClaims}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveStat('payments')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.pendingPayments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </ClickableCard>

          <ClickableCard onClick={() => setActiveStat('coverage')}>
            <Card className="h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Coverage</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalCoverage)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </ClickableCard>
        </div>
      </Reveal3D>

      <Reveal3D>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Active Policies</h3>
              <Link to={ROUTES.CLIENT.POLICIES}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {policies.length === 0 ? (
                <p className="text-center text-sm text-neutral-500">No policies yet.</p>
              ) : (
                policies.slice(0, 3).map((policy) => (
                  <div key={policy.id} className="rounded-lg border border-neutral-200 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-neutral-900">{policy.type}</h4>
                        <p className="text-sm text-neutral-600">{policy.policyNumber}</p>
                      </div>
                      <span className={cn('status-badge', getStatusColor(policy.status))}>
                        {policy.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Premium: </span>
                        <span className="font-medium">{formatCurrency(policy.premium)}/yr</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Expires: </span>
                        <span className="font-medium">{formatDate(policy.expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Claims</h3>
              <Link to={ROUTES.CLIENT.CLAIMS}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  File Claim
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {claims.length === 0 ? (
                <div className="py-8 text-center text-neutral-500">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                  <p>No claims filed yet</p>
                </div>
              ) : (
                claims.map((claim) => (
                  <div key={claim.id} className="rounded-lg border border-neutral-200 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-neutral-900">{claim.claimNumber}</h4>
                        <p className="text-sm text-neutral-600 line-clamp-2">{claim.description}</p>
                      </div>
                      <span className={cn('status-badge', getStatusColor(claim.status))}>
                        {claim.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        <DollarSign className="mr-1 inline h-4 w-4" />
                        {formatCurrency(claim.amount)}
                      </span>
                      <span>
                        <Calendar className="mr-1 inline h-4 w-4" />
                        {formatDate(claim.submittedDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </Reveal3D>

      <Reveal3D>
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Payments</h3>
            <Link to={ROUTES.CLIENT.PAYMENTS}>
              <Button variant="outline" size="sm">
                View All Payments
              </Button>
            </Link>
          </div>
          <DataGrid<PaymentRow>
            rowData={payments}
            columnDefs={[
              { headerName: 'Description', field: 'policyType', minWidth: 140 },
              {
                headerName: 'Amount',
                field: 'amount',
                minWidth: 100,
                valueFormatter: (p) => formatCurrency(p.value as number),
              },
              {
                headerName: 'Date',
                field: 'dueDate',
                minWidth: 110,
                valueFormatter: (p) => formatDate(p.value as string),
              },
              { headerName: 'Status', field: 'status', minWidth: 110 },
              {
                headerName: 'Action',
                colId: 'action',
                minWidth: 100,
                sortable: false,
                filter: false,
                cellRenderer: (p) =>
                  p.data?.status === 'PENDING' ? (
                    <button
                      type="button"
                      className="rounded border border-primary px-2 py-1 text-xs text-primary"
                      onClick={() => handlePayNow(p.data!.id)}
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span className="text-xs text-green-600">Paid</span>
                  ),
              },
            ]}
            height={280}
            pagination={false}
            emptyMessage="No recent payments."
          />
        </Card>
      </Reveal3D>

      <Reveal3D>
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-neutral-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { to: ROUTES.CLIENT.CLAIMS, icon: FileText, title: 'File a Claim', desc: 'Submit a new insurance claim' },
              { to: ROUTES.CLIENT.PAYMENTS, icon: CreditCard, title: 'Make a Payment', desc: 'Pay your premium online' },
              { to: ROUTES.CLIENT.DOCUMENTS, icon: Shield, title: 'View Documents', desc: 'Access policy documents' },
            ].map(({ to, icon: Icon, title, desc }) => (
              <motion.div key={to} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to={to}>
                  <div className="cursor-pointer rounded-lg border border-neutral-200 p-4 transition-colors hover:border-primary hover:shadow-md">
                    <Icon className="mb-3 h-8 w-8 text-primary" />
                    <h4 className="font-medium text-neutral-900">{title}</h4>
                    <p className="text-sm text-neutral-600">{desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Card>
      </Reveal3D>

      {stats.pendingPayments > 0 && (
        <Reveal3D>
          <Card className="border-yellow-200 bg-yellow-50 p-6">
            <div className="flex items-start">
              <AlertTriangle className="mr-3 mt-1 h-6 w-6 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-900">Payment Reminder</h4>
                <p className="mt-1 text-yellow-700">
                  You have {stats.pendingPayments} pending payment{stats.pendingPayments > 1 ? 's' : ''}. Pay now to
                  keep your coverage active.
                </p>
                <Link to={ROUTES.CLIENT.PAYMENTS}>
                  <Button variant="outline" size="sm" className="mt-3 border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                    View Payments
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Reveal3D>
      )}

      {statModalContent && (
        <CardDetailModal
          open={activeStat !== null}
          onClose={() => setActiveStat(null)}
          title={statModalContent.title}
          subtitle={statModalContent.subtitle}
          icon={statModalContent.icon}
          accent={statModalContent.accent}
        >
          {statModalContent.body}
        </CardDetailModal>
      )}
    </div>
  );
};

export default ClientDashboard;
