import React from 'react';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'bordered';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
  variant = 'default',
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const variantClasses = {
    default: 'space-y-6',
    card: 'p-6 bg-white rounded-lg border border-neutral-200 shadow-sm space-y-6',
    bordered: 'p-6 border border-neutral-200 rounded-lg space-y-6',
  };

  const headerClasses = [
    'border-b border-neutral-200 pb-4 mb-6',
    collapsible ? 'cursor-pointer hover:bg-neutral-50 -m-2 p-2 rounded' : '',
  ].join(' ');

  return (
    <section className={`${variantClasses[variant]} ${className}`}>
      {(title || description) && (
        <header className={headerClasses} onClick={handleToggle}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-neutral-600">
                  {description}
                </p>
              )}
            </div>
            {collapsible && (
              <button
                type="button"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isCollapsed ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </header>
      )}
      
      {(!collapsible || !isCollapsed) && (
        <div className="space-y-6">
          {children}
        </div>
      )}
    </section>
  );
};

export default FormSection;