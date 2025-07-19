import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-neutral-800">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600">
          Welcome to the AssureMe admin portal
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Users
          </h3>
          <p className="text-neutral-600">
            Manage client accounts and staff
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Policies
          </h3>
          <p className="text-neutral-600">
            Manage insurance policies
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Claims
          </h3>
          <p className="text-neutral-600">
            Process and manage claims
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-2">
            Reports
          </h3>
          <p className="text-neutral-600">
            View analytics and reports
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;