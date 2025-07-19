import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-neutral-800">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-600 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;