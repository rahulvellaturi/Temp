import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CardDetailModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Tailwind classes for the header icon chip, e.g. "bg-blue-50 text-blue-600". */
  accent?: string;
  children?: React.ReactNode;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  accent = 'bg-primary/10 text-primary',
  children,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ perspective: 1400 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="pointer-events-auto"
            initial={{ opacity: 0, scale: 0.8, rotateX: -45, y: 80 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotateX: 35, y: 50 }}
            transition={{ type: 'spring', stiffness: 170, damping: 19 }}
            style={{ transformPerspective: 1400, transformStyle: 'preserve-3d' }}
            className="relative z-[61] w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-neutral-200"
          >
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center gap-3">
                {icon && (
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                    {icon}
                  </span>
                )}
                <div>
                  {title && <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>}
                  {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(88vh-5rem)] overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CardDetailModal;
