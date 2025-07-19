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



  return (
    <div
      className={`toast-item ${
        isVisible && !isRemoving 
          ? 'toast-item-visible' 
          : 'toast-item-exit'
      }`}
    >
      <div className={`toast-wrapper toast-${toast.type}`}>
        <div className="toast-content">
          <div className="toast-main">
            <div className="toast-icon-container">
              {getIcon()}
            </div>
            <div className="toast-body">
              <p className="toast-title">
                {toast.title}
              </p>
              {toast.message && (
                <p className="toast-message">
                  {toast.message}
                </p>
              )}
            </div>
            <div className="toast-close-container">
              <button
                className="toast-close-button"
                onClick={handleRemove}
                aria-label="Close notification"
              >
                <X className="toast-close-icon" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for timed toasts */}
        {toast.duration && toast.duration > 0 && (
          <div className="toast-progress-container">
            <div 
              className={`toast-progress-bar toast-progress-${toast.type}`}
              style={{
                animation: `toast-progress-shrink ${toast.duration}ms linear`,
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
      toastContainer.className = 'toast-container';
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
    <div className="toast-list">
      {/* Clear all button when multiple toasts */}
      {toasts.length > 2 && (
        <div className="toast-clear-all-container">
          <button
            onClick={clearAllToasts}
            className="toast-clear-all-button"
          >
            Clear All ({toasts.length})
          </button>
        </div>
      )}
      
      {/* Toast list */}
      <div className="toast-list-scrollable">
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



export default Toaster;