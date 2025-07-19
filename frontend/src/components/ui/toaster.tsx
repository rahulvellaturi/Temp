import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { removeNotification } from '@/store/slices/uiSlice';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// Toast item interface
interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
  isVisible?: boolean;
  isRemoving?: boolean;
}

// Toast component for individual toast items
const Toast: React.FC<{
  toast: ToastItem;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-remove after duration
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      case 'warning':
        return 'bg-white border-l-4 border-yellow-500 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-gray-500 shadow-lg';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3 last:mb-0
        ${isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      style={{
        maxWidth: '420px',
        minWidth: '300px',
      }}
    >
      <div className={`
        ${getColorClasses()}
        rounded-lg overflow-hidden pointer-events-auto
        ring-1 ring-black ring-opacity-5
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="
                  bg-white rounded-md inline-flex text-gray-400 
                  hover:text-gray-500 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-indigo-500 
                  transition-colors duration-200
                "
                onClick={handleRemove}
                aria-label="Close notification"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for timed toasts */}
        {toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-gray-100">
            <div 
              className={`
                h-full transition-all ease-linear
                ${toast.type === 'success' ? 'bg-green-500' : ''}
                ${toast.type === 'error' ? 'bg-red-500' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
              `}
              style={{
                animation: `shrink ${toast.duration}ms linear`,
                transformOrigin: 'left',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Main Toaster component
export function Toaster() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // Create or get toast container
  useEffect(() => {
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'fixed top-4 right-4 z-50 max-h-screen overflow-hidden';
      toastContainer.style.pointerEvents = 'none';
      document.body.appendChild(toastContainer);
    }
    
    setContainer(toastContainer);

    return () => {
      // Cleanup on unmount
      const existingContainer = document.getElementById('toast-container');
      if (existingContainer && existingContainer.childNodes.length === 0) {
        document.body.removeChild(existingContainer);
      }
    };
  }, []);

  // Sync Redux notifications with local toast state
  useEffect(() => {
    setToasts(notifications.map(notification => ({
      ...notification,
      isVisible: true,
      isRemoving: false,
    })));
  }, [notifications]);

  // Handle toast removal
  const handleRemoveToast = (id: string) => {
    dispatch(removeNotification(id));
  };

  // Clear all toasts
  const clearAllToasts = () => {
    notifications.forEach(notification => {
      dispatch(removeNotification(notification.id));
    });
  };

  if (!container || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="space-y-2 pointer-events-none">
      {/* Clear all button when multiple toasts */}
      {toasts.length > 2 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={clearAllToasts}
            className="
              pointer-events-auto px-3 py-1 text-xs font-medium 
              text-gray-600 bg-white border border-gray-300 
              rounded-md hover:bg-gray-50 hover:text-gray-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-indigo-500 transition-colors duration-200
              shadow-sm
            "
          >
            Clear All ({toasts.length})
          </button>
        </div>
      )}
      
      {/* Toast list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={handleRemoveToast}
          />
        ))}
      </div>
    </div>,
    container
  );
}

// Toast utility functions for easy usage
export const toast = {
  success: (title: string, message?: string, duration: number = 5000) => {
    const dispatch = useAppDispatch();
    dispatch({
      type: 'ui/addNotification',
      payload: {
        type: 'success',
        title,
        message,
        duration,
      },
    });
  },
  
  error: (title: string, message?: string, duration: number = 7000) => {
    const dispatch = useAppDispatch();
    dispatch({
      type: 'ui/addNotification',
      payload: {
        type: 'error',
        title,
        message,
        duration,
      },
    });
  },
  
  warning: (title: string, message?: string, duration: number = 6000) => {
    const dispatch = useAppDispatch();
    dispatch({
      type: 'ui/addNotification',
      payload: {
        type: 'warning',
        title,
        message,
        duration,
      },
    });
  },
  
  info: (title: string, message?: string, duration: number = 5000) => {
    const dispatch = useAppDispatch();
    dispatch({
      type: 'ui/addNotification',
      payload: {
        type: 'info',
        title,
        message,
        duration,
      },
    });
  },
};

// Custom hook for using toast notifications
export const useToast = () => {
  const dispatch = useAppDispatch();

  return {
    success: (title: string, message?: string, duration: number = 5000) => {
      dispatch({
        type: 'ui/addNotification',
        payload: {
          type: 'success',
          title,
          message,
          duration,
        },
      });
    },
    
    error: (title: string, message?: string, duration: number = 7000) => {
      dispatch({
        type: 'ui/addNotification',
        payload: {
          type: 'error',
          title,
          message,
          duration,
        },
      });
    },
    
    warning: (title: string, message?: string, duration: number = 6000) => {
      dispatch({
        type: 'ui/addNotification',
        payload: {
          type: 'warning',
          title,
          message,
          duration,
        },
      });
    },
    
    info: (title: string, message?: string, duration: number = 5000) => {
      dispatch({
        type: 'ui/addNotification',
        payload: {
          type: 'info',
          title,
          message,
          duration,
        },
      });
    },
    
    dismiss: (id: string) => {
      dispatch(removeNotification(id));
    },
    
    dismissAll: () => {
      dispatch({ type: 'ui/clearNotifications' });
    },
  };
};

// CSS for animations (add to your global CSS or Tailwind config)
const toastStyles = `
  @keyframes shrink {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const existingStyles = document.getElementById('toast-styles');
  if (!existingStyles) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'toast-styles';
    styleSheet.textContent = toastStyles;
    document.head.appendChild(styleSheet);
  }
}

export default Toaster;