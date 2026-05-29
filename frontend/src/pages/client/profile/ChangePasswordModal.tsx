import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import AppModalShell from '@/components/common/AdminModalShell';
import Button from '@/components/common/Button';
import { FormField, FormInput } from '@/components/common/Form';
import { Eye, EyeOff, X } from 'lucide-react';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChangePasswordFormValues) => Promise<void> | void;
  form: UseFormReturn<ChangePasswordFormValues>;
  isLoading?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <AppModalShell onClose={onClose} maxWidthClass="max-w-md">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Change Password</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <FormField label="Current Password" error={errors.currentPassword?.message} required>
          <div className="relative">
            <FormInput
              {...register('currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              error={!!errors.currentPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="New Password" error={errors.newPassword?.message} required>
          <div className="relative">
            <FormInput
              {...register('newPassword')}
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              error={!!errors.newPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Confirm New Password" error={errors.confirmPassword?.message} required>
          <div className="relative">
            <FormInput
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              error={!!errors.confirmPassword}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Change Password
          </Button>
        </div>
      </form>
    </AppModalShell>
  );
};

export default React.memo(ChangePasswordModal);
