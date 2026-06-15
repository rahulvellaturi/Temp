import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AdminModalShellProps {
  children: React.ReactNode;
  onClose?: () => void;
  maxWidthClass?: string;
}

/**
 * Centered dialog without a dark fullscreen overlay (client + admin).
 */
const AppModalShell: React.FC<AdminModalShellProps> = ({
  children,
  onClose,
  maxWidthClass = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`pointer-events-auto w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl ring-1 ring-neutral-200`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default AppModalShell;
/** @deprecated Use AppModalShell — kept for existing imports */
export { AppModalShell as AdminModalShell };
