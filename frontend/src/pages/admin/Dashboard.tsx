import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useApi } from '@/hooks/useApi';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import mockDataService from '@/services/mockDataService';
import { 
  Users, 
  Shield, 
  FileText, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  Settings,
  Plus,
  Eye,
  Download,
  RefreshCw
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
  userGrowth: number;
  policyGrowth: number;
  claimResolutionRate: number;
  averageClaimTime: number;
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTERED' | 'POLICY_CREATED' | 'CLAIM_FILED' | 'PAYMENT_RECEIVED' | 'CLAIM_APPROVED';
  description: string;
  timestamp: string;
  user: string;
  amount?: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

const AdminDashboard: React.FC = () => {
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
    userGrowth: 0,
    policyGrowth: 0,
    claimResolutionRate: 0,
    averageClaimTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const { execute: fetchStats } = useApi();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data from mock data service
      const adminStats = mockDataService.getAdminStats();
      const recentActivity = mockDataService.getRecentActivity();
      const quickActions = mockDataService.getQuickActions();
      
      setStats(adminStats);
      setRecentActivity(recentActivity);
      
      // Mock activity data
      const mockActivity = [
        {
          id: '1',
          type: 'USER_REGISTERED',
          description: 'New client registration',
          timestamp: '2024-01-20T10:30:00Z',
          user: 'Sarah Johnson',
        },
        {
          id: '2',
          type: 'CLAIM_FILED',
          description: 'Auto insurance claim filed',
          timestamp: '2024-01-20T09:45:00Z',
          user: 'Michael Chen',
          amount: 5000,
        },
        {
          id: '3',
          type: 'POLICY_CREATED',
          description: 'Home insurance policy created',
          timestamp: '2024-01-20T09:15:00Z',
          user: 'Emily Davis',
          amount: 1200,
        },
        {
          id: '4',
          type: 'PAYMENT_RECEIVED',
          description: 'Premium payment received',
          timestamp: '2024-01-20T08:30:00Z',
          user: 'Robert Wilson',
          amount: 800,
        },
        {
          id: '5',
          type: 'CLAIM_APPROVED',
          description: 'Water damage claim approved',
          timestamp: '2024-01-20T08:00:00Z',
          user: 'Lisa Anderson',
          amount: 12000,
        },
        {
          id: '6',
          type: 'USER_REGISTERED',
          description: 'New client registration',
          timestamp: '2024-01-19T16:20:00Z',
          user: 'David Martinez',
        },
      ];

      setStats(adminStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Create Policy',
      description: 'Create a new insurance policy',
      icon: <Shield className="h-6 w-6" />,
      action: 'CREATE_POLICY',
      color: 'blue',
    },
    {
      id: '2',
      title: 'Add User',
      description: 'Add a new client or agent',
      icon: <Users className="h-6 w-6" />,
      action: 'ADD_USER',
      color: 'green',
    },
    {
      id: '3',
      title: 'Review Claims',
      description: 'Review pending claims',
      icon: <FileText className="h-6 w-6" />,
      action: 'REVIEW_CLAIMS',
      color: 'orange',
    },
    {
      id: '4',
      title: 'Generate Report',
      description: 'Create analytics report',
      icon: <BarChart3 className="h-6 w-6" />,
      action: 'GENERATE_REPORT',
      color: 'purple',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      USER_REGISTERED: <Users className="h-4 w-4 text-green-500" />,
      POLICY_CREATED: <Shield className="h-4 w-4 text-blue-500" />,
      CLAIM_FILED: <FileText className="h-4 w-4 text-orange-500" />,
      PAYMENT_RECEIVED: <DollarSign className="h-4 w-4 text-green-500" />,
      CLAIM_APPROVED: <CheckCircle className="h-4 w-4 text-green-500" />,
    };
    return icons[type as keyof typeof icons] || <Activity className="h-4 w-4 text-neutral-500" />;
  };

  const getQuickActionColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    return colors[color as keyof typeof colors] || 'bg-neutral-50 text-neutral-600 border-neutral-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-neutral-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Admin'}!`}
        description="Monitor your insurance business operations and analytics"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Users</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.userGrowth}% this month</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Policies</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.activePolicies.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.policyGrowth}% this month</span>
              </div>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending Claims</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.pendingClaims}</p>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-600">Avg {stats.averageClaimTime} days</span>
              </div>
            </div>
            <FileText className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Revenue growth</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">User Activity</h3>
            <Activity className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Active Users</span>
              <span className="font-medium">{stats.activeUsers.toLocaleString()}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-neutral-600">
              <span>{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active</span>
              <span>{stats.totalUsers - stats.activeUsers} inactive</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Claim Resolution</h3>
            <CheckCircle className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Resolution Rate</span>
              <span className="font-medium">{stats.claimResolutionRate}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${stats.claimResolutionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Avg {stats.averageClaimTime} days</span>
              <span>{stats.totalClaims} total</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Revenue Overview</h3>
            <DollarSign className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Total Revenue</span>
              <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">This Month</span>
              <span className="font-medium text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Average per Policy</span>
              <span className="font-medium">{formatCurrency(stats.totalRevenue / stats.totalPolicies)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
            <Settings className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className={`p-4 border-2 border-dashed rounded-lg cursor-pointer hover:shadow-md transition-all ${getQuickActionColor(action.color)}`}
              >
                <div className="flex items-center space-x-3">
                  {action.icon}
                  <div>
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm opacity-75">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
            <Bell className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-neutral-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {activity.user}
                    </p>
                    <span className="text-xs text-neutral-500">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{activity.description}</p>
                  {activity.amount && (
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(activity.amount)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View All Activity
            </Button>
          </div>
        </Card>
      </div>

      {/* System Alerts */}
      <Card className="p-6 border-l-4 border-l-orange-500 bg-orange-50">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-orange-900">System Notifications</h4>
            <div className="mt-2 space-y-2 text-sm text-orange-800">
              <p>• {stats.pendingClaims} claims require immediate attention</p>
              <p>• Monthly backup scheduled for tonight at 2:00 AM</p>
              <p>• {stats.totalUsers - stats.activeUsers} users haven't logged in for 30+ days</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;