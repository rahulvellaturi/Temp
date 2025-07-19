import React from 'react';
import { NavLink } from 'react-router-dom';
import BaseLayout from '@/components/common/BaseLayout';

const AdminLayout: React.FC = () => {
  const navigation = (
    <nav className="flex space-x-4">
      {[
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/policies', label: 'Policies' },
        { to: '/admin/claims', label: 'Claims' }
      ].map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${
              isActive 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-600 hover:text-neutral-800'
            }`
          }
          end={to === '/admin'}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <BaseLayout
      title="AssureMe"
      subtitle="Admin Portal"
      navigation={navigation}
    />
  );
};

export default AdminLayout;