import React from 'react';
import AppModalShell from '@/components/common/AdminModalShell';
import Button from '@/components/common/Button';
import { FormField, FormInput } from '@/components/common/Form';
import { X } from 'lucide-react';

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
  isLoading?: boolean;
}

const MFASetupModal: React.FC<MFASetupModalProps> = ({
  isOpen,
  onClose,
  onEnable,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AppModalShell onClose={onClose} maxWidthClass="max-w-md">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Setup Two-Factor Authentication</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-center">
          <div className="w-32 h-32 bg-neutral-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <span className="text-neutral-500">QR Code</span>
          </div>
          <p className="text-sm text-neutral-600 mb-4">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg">
          <p className="text-sm text-neutral-600 mb-2">Manual entry code:</p>
          <code className="text-sm font-mono bg-white p-2 rounded border block">
            ABCD EFGH IJKL MNOP QRST UVWX YZ12 3456
          </code>
        </div>

        <FormField label="Verification Code" required>
          <FormInput placeholder="Enter 6-digit code" maxLength={6} />
        </FormField>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onEnable} loading={isLoading}>
            Enable MFA
          </Button>
        </div>
      </div>
    </AppModalShell>
  );
};

export default React.memo(MFASetupModal);
