import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import AppModalShell from '@/components/common/AdminModalShell';
import Button from '@/components/common/Button';
import { FormField, FormInput } from '@/components/common/Form';
import { formatCurrency } from '@/lib/formatters';
import { CreditCard, DollarSign, Lock } from 'lucide-react';

interface PolicyOption {
  id: string;
  number: string;
  type: string;
  balance: number;
}

interface PaymentMethodOption {
  id: string;
  nickname: string;
  cardBrand?: string;
  bankName?: string;
  lastFour: string;
  isDefault: boolean;
}

interface MakePaymentFormValues {
  policyId: string;
  amount: number;
  paymentMethodId: string;
  saveCard?: boolean;
}

interface MakePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: ReturnType<UseFormReturn<MakePaymentFormValues>['handleSubmit']>;
  form: UseFormReturn<MakePaymentFormValues>;
  availablePolicies: PolicyOption[];
  paymentMethods: PaymentMethodOption[];
  isLoading?: boolean;
}

const MakePaymentModal: React.FC<MakePaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  availablePolicies,
  paymentMethods,
  isLoading = false,
}) => {
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const watchPolicyId = watch('policyId');
  const selectedPolicy = availablePolicies.find((p) => p.id === watchPolicyId);

  if (!isOpen) return null;

  return (
    <AppModalShell onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Make Payment</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <FormField label="Select Policy" error={errors.policyId?.message} required>
          <select
            {...register('policyId')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.policyId ? 'border-red-500' : 'border-neutral-300'
            }`}
          >
            <option value="">Choose a policy...</option>
            {availablePolicies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.number} - {policy.type} (Balance: {formatCurrency(policy.balance)})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Payment Amount" error={errors.amount?.message} required>
          <FormInput
            {...register('amount', { valueAsNumber: true })}
            type="number"
            min="0"
            step="0.01"
            placeholder={selectedPolicy ? selectedPolicy.balance.toString() : '0.00'}
            error={!!errors.amount}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
          {selectedPolicy && (
            <p className="text-sm text-neutral-600 mt-1">
              Outstanding balance: {formatCurrency(selectedPolicy.balance)}
            </p>
          )}
        </FormField>

        <FormField label="Payment Method" error={errors.paymentMethodId?.message} required>
          <select
            {...register('paymentMethodId')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.paymentMethodId ? 'border-red-500' : 'border-neutral-300'
            }`}
          >
            <option value="">Select payment method...</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.nickname} - {method.cardBrand || method.bankName} ••••{method.lastFour}
                {method.isDefault && ' (Default)'}
              </option>
            ))}
            <option value="new">Add New Payment Method</option>
          </select>
        </FormField>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and processed securely. We never store your
                full credit card details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            <Lock className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </form>
    </AppModalShell>
  );
};

export default React.memo(MakePaymentModal);
