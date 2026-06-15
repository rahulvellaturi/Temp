import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import AppModalShell from '@/components/common/AdminModalShell';
import Button from '@/components/common/Button';
import { FormField, FormInput } from '@/components/common/Form';
import { CreditCard, Lock, Shield } from 'lucide-react';

interface AddPaymentMethodFormValues {
  cardNumber: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv: string;
  cardholderName: string;
  nickname: string;
  isDefault: boolean;
}

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: ReturnType<UseFormReturn<AddPaymentMethodFormValues>['handleSubmit']>;
  form: UseFormReturn<AddPaymentMethodFormValues>;
  isLoading?: boolean;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  isLoading = false,
}) => {
  const {
    register,
    formState: { errors },
  } = form;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

  if (!isOpen) return null;

  return (
    <AppModalShell onClose={onClose} maxWidthClass="max-w-md">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Add Payment Method</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <FormField label="Card Number" error={errors.cardNumber?.message} required>
          <FormInput
            {...register('cardNumber')}
            placeholder="1234 5678 9012 3456"
            error={!!errors.cardNumber}
            leftIcon={<CreditCard className="h-4 w-4" />}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Expiry Month" error={errors.expiryMonth?.message} required>
            <select
              {...register('expiryMonth', { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.expiryMonth ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Expiry Year" error={errors.expiryYear?.message} required>
            <select
              {...register('expiryYear', { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.expiryYear ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Security Code (CVV)" error={errors.cvv?.message} required>
          <FormInput
            {...register('cvv')}
            placeholder="123"
            maxLength={4}
            error={!!errors.cvv}
            leftIcon={<Shield className="h-4 w-4" />}
          />
        </FormField>

        <FormField label="Cardholder Name" error={errors.cardholderName?.message} required>
          <FormInput
            {...register('cardholderName')}
            placeholder="John Doe"
            error={!!errors.cardholderName}
          />
        </FormField>

        <FormField
          label="Nickname (Optional)"
          error={errors.nickname?.message}
          description="Give this card a memorable name"
        >
          <FormInput
            {...register('nickname')}
            placeholder="Personal Visa"
            error={!!errors.nickname}
          />
        </FormField>

        <div className="flex items-center">
          <input
            {...register('isDefault')}
            id="isDefault"
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-3 block text-sm text-neutral-900">
            Set as default payment method
          </label>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Lock className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Secure Storage</h4>
              <p className="text-sm text-green-700 mt-1">
                Your card information is encrypted and stored securely. We comply with PCI DSS
                standards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            <Shield className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </form>
    </AppModalShell>
  );
};

export default React.memo(AddPaymentMethodModal);
