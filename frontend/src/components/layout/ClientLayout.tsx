import React from 'react';
import { NavLink } from 'react-router-dom';
import BaseLayout from '@/components/common/BaseLayout';

const ClientLayout: React.FC = () => {
  const navigation = (
    <nav className="flex space-x-4">
      {[
        { to: '/client', label: 'Dashboard' },
        { to: '/client/policies', label: 'Policies' },
        { to: '/client/claims', label: 'Claims' },
        { to: '/client/payments', label: 'Payments' },
        { to: '/client/documents', label: 'Documents' },
        { to: '/client/profile', label: 'Profile' }
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
          end={to === '/client'}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <BaseLayout
      title="AssureMe"
      subtitle="Client Portal"
      navigation={navigation}
    />
  );
};

export default ClientLayout;