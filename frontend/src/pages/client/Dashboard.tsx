import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'My Policies',
      description: 'View and manage your insurance policies',
      onClick: () => navigate('/client/policies')
    },
    {
      title: 'Claims',
      description: 'File and track your insurance claims',
      onClick: () => navigate('/client/claims')
    },
    {
      title: 'Payments',
      description: 'View billing statements and make payments',
      onClick: () => navigate('/client/payments')
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to your AssureMe client portal"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => (
          <Card
            key={item.title}
            title={item.title}
            description={item.description}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ClientDashboard;