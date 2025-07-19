import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';

const ClientPolicies: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="My Policies"
        description="View and manage your insurance policies"
        actions={
          <Button variant="primary">
            Request Policy Change
          </Button>
        }
      />
      <div className="text-neutral-600">
        Policy management functionality will be implemented here.
      </div>
    </div>
  );
};

export default ClientPolicies;