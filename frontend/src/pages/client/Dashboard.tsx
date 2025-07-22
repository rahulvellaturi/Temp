import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useApi } from '@/hooks/useApi';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import mockDataService from '@/services/mockDataService';
import { 
  Shield, 
  FileText, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

interface Policy {
  id: string;
  type: string;
  policyNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED';
  premium: number;
  coverage: number;
  nextPayment: string;
  expiryDate: string;
}

interface Claim {
  id: string;
  policyId: string;
  claimNumber: string;
  type: string;
  amount: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'DENIED' | 'PAID';
  submittedDate: string;
  description: string;
}

interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  dueDate: string;
  policyType: string;
  method: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState({
    policies: [] as Policy[],
    claims: [] as Claim[],
    payments: [] as Payment[],
    stats: {
      totalPolicies: 0,
      activeClaims: 0,
      pendingPayments: 0,
      totalCoverage: 0,
    }
  });

  const { execute: fetchDashboard, loading } = useApi();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load data from mock data service
      const userId = user?.id || '1'; // Default to user ID 1 for demo
      const dashboardData = mockDataService.getDashboardData(userId);

      setDashboardData({
        policies: dashboardData.policies,
        claims: dashboardData.claims,
        payments: dashboardData.payments,
        stats: dashboardData.stats,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const getStatusColor = (status: string, type: 'policy' | 'claim' | 'payment') => {
    const statusMap = {
      policy: {
        ACTIVE: 'success',
        INACTIVE: 'warning',
        PENDING: 'warning',
        EXPIRED: 'error'
      },
      claim: {
        SUBMITTED: 'info',
        UNDER_REVIEW: 'warning',
        APPROVED: 'success',
        DENIED: 'error',
        PAID: 'success'
      },
      payment: {
        PENDING: 'warning',
        COMPLETED: 'success',
        FAILED: 'error'
      }
    };
    return statusMap[type][status as keyof typeof statusMap[typeof type]] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        description="Here's an overview of your insurance portfolio"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Policies</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboardData.stats.totalPolicies}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active Claims</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboardData.stats.activeClaims}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending Payments</p>
              <p className="text-2xl font-bold text-neutral-900">{dashboardData.stats.pendingPayments}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Coverage</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(dashboardData.stats.totalCoverage)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Policies */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Active Policies</h3>
            <Link to={ROUTES.CLIENT.POLICIES}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {dashboardData.policies.slice(0, 3).map((policy) => (
              <div key={policy.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-neutral-900">{policy.type}</h4>
                    <p className="text-sm text-neutral-600">{policy.policyNumber}</p>
                  </div>
                  <StatusBadge 
                    status={policy.status} 
                    variant={getStatusColor(policy.status, 'policy') as any}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-neutral-600">Coverage: </span>
                    <span className="font-medium">{formatCurrency(policy.coverage)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Premium: </span>
                    <span className="font-medium">{formatCurrency(policy.premium)}/year</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Next Payment: </span>
                    <span className="font-medium">{formatDate(policy.nextPayment)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Expires: </span>
                    <span className="font-medium">{formatDate(policy.expiryDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Claims */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Claims</h3>
            <Link to={ROUTES.CLIENT.CLAIMS}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                File Claim
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {dashboardData.claims.length > 0 ? (
              dashboardData.claims.map((claim) => (
                <div key={claim.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-neutral-900">{claim.type}</h4>
                      <p className="text-sm text-neutral-600">{claim.claimNumber}</p>
                    </div>
                    <StatusBadge 
                      status={claim.status} 
                      variant={getStatusColor(claim.status, 'claim') as any}
                    />
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-3">{claim.description}</p>
                  
                  <div className="flex justify-between text-sm">
                    <span>
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      {formatCurrency(claim.amount)}
                    </span>
                    <span>
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {formatDate(claim.submittedDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                <p>No claims filed yet</p>
                <p className="text-sm">File a claim when you need to make a claim on your policy</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Payments Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Payments</h3>
          <Link to={ROUTES.CLIENT.PAYMENTS}>
            <Button variant="outline" size="sm">
              View All Payments
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Policy</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Method</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-neutral-100">
                  <td className="py-3 px-4">{payment.policyType}</td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 px-4">{formatDate(payment.dueDate)}</td>
                  <td className="py-3 px-4">{payment.method}</td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={payment.status} 
                      variant={getStatusColor(payment.status, 'payment') as any}
                    />
                  </td>
                  <td className="py-3 px-4">
                    {payment.status === 'PENDING' && (
                      <Button size="sm" variant="outline">
                        Pay Now
                      </Button>
                    )}
                    {payment.status === 'COMPLETED' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {payment.status === 'FAILED' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={ROUTES.CLIENT.CLAIMS}>
            <div className="p-4 border border-neutral-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <FileText className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-medium text-neutral-900">File a Claim</h4>
              <p className="text-sm text-neutral-600">Submit a new insurance claim</p>
            </div>
          </Link>

          <Link to={ROUTES.CLIENT.PAYMENTS}>
            <div className="p-4 border border-neutral-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <CreditCard className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-medium text-neutral-900">Make a Payment</h4>
              <p className="text-sm text-neutral-600">Pay your premium online</p>
            </div>
          </Link>

          <Link to={ROUTES.CLIENT.DOCUMENTS}>
            <div className="p-4 border border-neutral-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-medium text-neutral-900">View Documents</h4>
              <p className="text-sm text-neutral-600">Access policy documents</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Alerts/Notifications */}
      {dashboardData.stats.pendingPayments > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
            <div>
              <h4 className="font-medium text-yellow-900">Payment Reminder</h4>
              <p className="text-yellow-700 mt-1">
                You have {dashboardData.stats.pendingPayments} pending payment{dashboardData.stats.pendingPayments > 1 ? 's' : ''}. 
                Pay now to keep your coverage active.
              </p>
              <Link to={ROUTES.CLIENT.PAYMENTS}>
                <Button variant="outline" size="sm" className="mt-3 border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                  View Payments
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;