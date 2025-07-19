import React from 'react';

const ClientDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-neutral-800">
          Dashboard
        </h1>
        <p className="text-neutral-600">
          Welcome to your AssureMe client portal
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            My Policies
          </h3>
          <p className="text-neutral-600">
            View and manage your insurance policies
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Claims
          </h3>
          <p className="text-neutral-600">
            File and track your insurance claims
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Payments
          </h3>
          <p className="text-neutral-600">
            View billing statements and make payments
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;