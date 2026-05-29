import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  CreditCard,
  ClipboardCheck,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { logout } from '@/store/slices/authSlice';
import { getInitials } from '@/lib/utils';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  action?: 'logout';
  danger?: boolean;
}

// A friendly, business-facing label for each role. The product refers to the
// policy-managing admins as "Policy Provider" and claims adjusters as
// "Underwriter", so we surface those names here.
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Policy Provider',
  ADMIN: 'Policy Provider',
  CLAIMS_ADJUSTER: 'Underwriter',
  BILLING_SPECIALIST: 'Billing Specialist',
  CLIENT: 'Client',
};

const LOGOUT_ITEM: MenuItem = {
  label: 'Sign out',
  icon: <LogOut className="h-4 w-4" />,
  action: 'logout',
  danger: true,
};

// Role-specific menus. Every link points at a real route so nothing dead-ends.
const ROLE_MENUS: Record<string, MenuItem[]> = {
  // Policy Provider (ADMIN / SUPER_ADMIN)
  POLICY_PROVIDER: [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, to: '/admin' },
    { label: 'Manage Users', icon: <Users className="h-4 w-4" />, to: '/admin/users' },
    { label: 'Manage Policies', icon: <Shield className="h-4 w-4" />, to: '/admin/policies' },
    { label: 'Review Claims', icon: <FileText className="h-4 w-4" />, to: '/admin/claims' },
    LOGOUT_ITEM,
  ],
  // Underwriter (CLAIMS_ADJUSTER)
  UNDERWRITER: [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, to: '/admin' },
    { label: 'Underwriting Queue', icon: <ClipboardCheck className="h-4 w-4" />, to: '/admin/claims' },
    { label: 'Policies', icon: <Shield className="h-4 w-4" />, to: '/admin/policies' },
    LOGOUT_ITEM,
  ],
  // Billing Specialist
  BILLING: [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, to: '/admin' },
    { label: 'Billing & Policies', icon: <CreditCard className="h-4 w-4" />, to: '/admin/policies' },
    { label: 'Review Claims', icon: <FileText className="h-4 w-4" />, to: '/admin/claims' },
    LOGOUT_ITEM,
  ],
  // Client portal
  CLIENT: [
    { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, to: '/client' },
    { label: 'My Policies', icon: <Shield className="h-4 w-4" />, to: '/client/policies' },
    { label: 'My Claims', icon: <FileText className="h-4 w-4" />, to: '/client/claims' },
    { label: 'Profile', icon: <UserIcon className="h-4 w-4" />, to: '/client/profile' },
    LOGOUT_ITEM,
  ],
};

const menuGroupForRole = (role?: string): keyof typeof ROLE_MENUS => {
  switch (role) {
    case 'CLAIMS_ADJUSTER':
      return 'UNDERWRITER';
    case 'BILLING_SPECIALIST':
      return 'BILLING';
    case 'CLIENT':
      return 'CLIENT';
    case 'ADMIN':
    case 'SUPER_ADMIN':
    default:
      return 'POLICY_PROVIDER';
  }
};

const UserMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const roleLabel = ROLE_LABELS[user.role] || 'Member';
  const items = ROLE_MENUS[menuGroupForRole(user.role)];

  const handleSelect = (item: MenuItem) => {
    setOpen(false);
    if (item.action === 'logout') {
      dispatch(logout());
      navigate('/login');
      return;
    }
    if (item.to) navigate(item.to);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-700 text-sm font-semibold text-white shadow-sm">
          {getInitials(user.firstName, user.lastName)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-neutral-800">{fullName}</span>
          <span className="block text-xs leading-tight text-neutral-500">{roleLabel}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.96, rotateX: -12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{ transformOrigin: 'top right', transformPerspective: 800 }}
            className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-900">{fullName}</p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {roleLabel}
              </span>
            </div>
            <div className="py-1">
              {items.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={() => handleSelect(item)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    item.danger
                      ? 'text-destructive hover:bg-destructive-50'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className={item.danger ? 'text-destructive' : 'text-neutral-400'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
