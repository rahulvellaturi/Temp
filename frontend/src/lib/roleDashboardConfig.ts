import { UserRole } from '@/types';

export interface DashboardQuickAction {
  id: string;
  title: string;
  description: string;
  path: string;
  /** When set, navigates to path with ?action=<value> to auto-open the target modal. */
  openAction?: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const ADMIN_ACTIONS: DashboardQuickAction[] = [
  {
    id: 'create-policy',
    title: 'Create Policy',
    description: 'Create a new insurance policy',
    path: '/admin/policies',
    openAction: 'create',
    color: 'blue',
  },
  {
    id: 'add-user',
    title: 'Add User',
    description: 'Add a new client or agent',
    path: '/admin/users',
    openAction: 'create',
    color: 'green',
  },
  {
    id: 'review-claims',
    title: 'Review Claims',
    description: 'Review pending claims',
    path: '/admin/claims',
    openAction: 'review',
    color: 'orange',
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Download analytics summary',
    path: '',
    color: 'purple',
  },
];

const UNDERWRITER_ACTIONS: DashboardQuickAction[] = [
  {
    id: 'underwriting-queue',
    title: 'Underwriting Queue',
    description: 'Review claims awaiting decision',
    path: '/admin/claims',
    color: 'orange',
  },
  {
    id: 'policies',
    title: 'Policies',
    description: 'View and assess policies',
    path: '/admin/policies',
    color: 'blue',
  },
  {
    id: 'generate-report',
    title: 'Claims Report',
    description: 'Export underwriting summary',
    path: '',
    color: 'purple',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Return to overview',
    path: '/admin',
    color: 'green',
  },
];

const BILLING_ACTIONS: DashboardQuickAction[] = [
  {
    id: 'billing-policies',
    title: 'Billing & Policies',
    description: 'Manage premiums and policies',
    path: '/admin/policies',
    color: 'blue',
  },
  {
    id: 'review-claims',
    title: 'Payment Claims',
    description: 'Claims affecting payouts',
    path: '/admin/claims',
    color: 'orange',
  },
  {
    id: 'generate-report',
    title: 'Revenue Report',
    description: 'Export revenue summary',
    path: '',
    color: 'purple',
  },
  {
    id: 'users',
    title: 'Clients',
    description: 'View client accounts',
    path: '/admin/users',
    color: 'green',
  },
];

export function getAdminQuickActions(role?: UserRole | string): DashboardQuickAction[] {
  switch (role) {
    case 'CLAIMS_ADJUSTER':
      return UNDERWRITER_ACTIONS;
    case 'BILLING_SPECIALIST':
      return BILLING_ACTIONS;
    case 'ADMIN':
    case 'SUPER_ADMIN':
    default:
      return ADMIN_ACTIONS;
  }
}

export function buildAdminReportCsv(stats: {
  totalUsers: number;
  activeUsers: number;
  activePolicies: number;
  pendingClaims: number;
  monthlyRevenue: number;
  totalRevenue: number;
}): string {
  const rows = [
    ['Metric', 'Value'],
    ['Total Users', String(stats.totalUsers)],
    ['Active Users', String(stats.activeUsers)],
    ['Active Policies', String(stats.activePolicies)],
    ['Pending Claims', String(stats.pendingClaims)],
    ['Monthly Revenue', String(stats.monthlyRevenue)],
    ['Total Revenue', String(stats.totalRevenue)],
    ['Generated At', new Date().toISOString()],
  ];
  return rows.map((r) => r.join(',')).join('\n');
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
