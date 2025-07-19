import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useGenericForm } from '@/hooks/useGenericForm';
import { useDataLoader } from '@/hooks/useDataLoader';
import unifiedMockDataService from '@/services/unifiedMockDataService';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { FormField, FormInput } from '@/components/common/Form';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Banknote,
  Receipt,
  RefreshCw,
  Shield,
  Lock
} from 'lucide-react';
import { paymentSchemas } from '@/lib/validations';

interface Payment {
  id: string;
  paymentNumber: string;
  policyId: string;
  policyNumber: string;
  policyType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'OVERDUE';
  paymentMethod: string;
  description: string;
  invoiceNumber?: string;
  lastFourDigits?: string;
  transactionId?: string;
  failureReason?: string;
  isAutoPayEnabled: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_ACCOUNT';
  lastFour: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  cardBrand?: string;
  isDefault: boolean;
  nickname: string;
}

interface NewPaymentData {
  policyId: string;
  amount: number;
  paymentMethodId: string;
  saveCard?: boolean;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardholderName?: string;
}

const Payments: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMakePayment, setShowMakePayment] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Load data using unified service
  const { data: payments, loading, setData: setPayments } = useDataLoader(
    () => unifiedMockDataService.fetchPaymentsAsync(),
    { initialData: [] }
  );

  // Available policies for payment
  const availablePolicies = unifiedMockDataService.getAvailablePolicies();

  const paymentForm = useGenericForm({
    schema: paymentSchemas.makePayment,
    defaultValues: {
      policyId: '',
      amount: 0,
      paymentMethodId: '',
      saveCard: false,
    },
    showSuccessMessage: true,
    successMessage: 'Payment processed successfully!',
  });

  const paymentMethodForm = useGenericForm({
    schema: paymentSchemas.addPaymentMethod,
    defaultValues: {
      cardNumber: '',
      expiryMonth: undefined,
      expiryYear: undefined,
      cvv: '',
      cardholderName: '',
      nickname: '',
      isDefault: false,
    },
    showSuccessMessage: true,
    successMessage: 'Payment method added successfully!',
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter]);

  const loadPaymentMethods = async () => {
    try {
      const methods = unifiedMockDataService.getPaymentMethodsByUserId(user?.id || '1');
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'warning',
      PROCESSING: 'info',
      COMPLETED: 'success',
      FAILED: 'error',
      REFUNDED: 'default',
      OVERDUE: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const handleMakePayment = async (data: NewPaymentData) => {
    try {
      console.log('Processing payment:', data);
      setShowMakePayment(false);
      await loadPayments();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const handleAddPaymentMethod = async (data: any) => {
    try {
      console.log('Adding payment method:', data);
      setShowAddPaymentMethod(false);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  };

  const PaymentDetailsModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Payment {selectedPayment.paymentNumber}
                </h2>
                <p className="text-sm text-neutral-600">
                  {selectedPayment.policyNumber} - {selectedPayment.policyType}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge 
                  status={selectedPayment.status} 
                  variant={getStatusColor(selectedPayment.status) as any}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Payment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Amount</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Due Date</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatDate(selectedPayment.dueDate)}
                </p>
              </div>
              {selectedPayment.paidDate && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Paid Date</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatDate(selectedPayment.paidDate)}
                  </p>
                </div>
              )}
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Payment Method</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {selectedPayment.paymentMethod}
                  {selectedPayment.lastFourDigits && ` ••••${selectedPayment.lastFourDigits}`}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Payment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Description:</span>
                  <span className="font-medium">{selectedPayment.description}</span>
                </div>
                {selectedPayment.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Invoice Number:</span>
                    <span className="font-medium">{selectedPayment.invoiceNumber}</span>
                  </div>
                )}
                {selectedPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Transaction ID:</span>
                    <span className="font-medium font-mono text-sm">{selectedPayment.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Auto Pay:</span>
                  <span className="font-medium">
                    {selectedPayment.isAutoPayEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Failure Reason */}
            {selectedPayment.status === 'FAILED' && selectedPayment.failureReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Payment Failed</h4>
                    <p className="text-sm text-red-700 mt-1">{selectedPayment.failureReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
              {selectedPayment.status === 'FAILED' && (
                <Button>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MakePaymentModal = () => {
    const { register, handleSubmit, formState: { errors }, watch } = paymentForm;
    const watchPolicyId = watch('policyId');
    const selectedPolicy = availablePolicies.find(p => p.id === watchPolicyId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Make Payment</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMakePayment(false)}
              >
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleMakePayment)} className="p-6 space-y-6">
            {/* Policy Selection */}
            <FormField
              label="Select Policy"
              error={errors.policyId?.message}
              required
            >
              <select
                {...register('policyId')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.policyId ? 'border-red-500' : 'border-neutral-300'
                }`}
              >
                <option value="">Choose a policy...</option>
                {availablePolicies.map(policy => (
                  <option key={policy.id} value={policy.id}>
                    {policy.number} - {policy.type} (Balance: {formatCurrency(policy.balance)})
                  </option>
                ))}
              </select>
            </FormField>

            {/* Amount */}
            <FormField
              label="Payment Amount"
              error={errors.amount?.message}
              required
            >
              <FormInput
                {...register('amount', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                placeholder={selectedPolicy ? selectedPolicy.balance.toString() : "0.00"}
                error={!!errors.amount}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
              {selectedPolicy && (
                <p className="text-sm text-neutral-600 mt-1">
                  Outstanding balance: {formatCurrency(selectedPolicy.balance)}
                </p>
              )}
            </FormField>

            {/* Payment Method */}
            <FormField
              label="Payment Method"
              error={errors.paymentMethodId?.message}
              required
            >
              <select
                {...register('paymentMethodId')}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.paymentMethodId ? 'border-red-500' : 'border-neutral-300'
                }`}
              >
                <option value="">Select payment method...</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.nickname} - {method.cardBrand || method.bankName} ••••{method.lastFour}
                    {method.isDefault && ' (Default)'}
                  </option>
                ))}
                <option value="new">Add New Payment Method</option>
              </select>
            </FormField>

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your payment information is encrypted and processed securely. 
                    We never store your full credit card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMakePayment(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                <Lock className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AddPaymentMethodModal = () => {
    const { register, handleSubmit, formState: { errors } } = paymentMethodForm;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => currentYear + i);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Add Payment Method</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPaymentMethod(false)}
              >
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleAddPaymentMethod)} className="p-6 space-y-6">
            {/* Card Number */}
            <FormField
              label="Card Number"
              error={errors.cardNumber?.message}
              required
            >
              <FormInput
                {...register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                error={!!errors.cardNumber}
                leftIcon={<CreditCard className="h-4 w-4" />}
              />
            </FormField>

            {/* Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Expiry Month"
                error={errors.expiryMonth?.message}
                required
              >
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

              <FormField
                label="Expiry Year"
                error={errors.expiryYear?.message}
                required
              >
                <select
                  {...register('expiryYear', { valueAsNumber: true })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.expiryYear ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* CVV */}
            <FormField
              label="Security Code (CVV)"
              error={errors.cvv?.message}
              required
            >
              <FormInput
                {...register('cvv')}
                placeholder="123"
                maxLength={4}
                error={!!errors.cvv}
                leftIcon={<Shield className="h-4 w-4" />}
              />
            </FormField>

            {/* Cardholder Name */}
            <FormField
              label="Cardholder Name"
              error={errors.cardholderName?.message}
              required
            >
              <FormInput
                {...register('cardholderName')}
                placeholder="John Doe"
                error={!!errors.cardholderName}
              />
            </FormField>

            {/* Nickname */}
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

            {/* Default */}
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

            {/* Security Notice */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Secure Storage</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your card information is encrypted and stored securely. 
                    We comply with PCI DSS standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddPaymentMethod(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                <Shield className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Payments"
        description="Manage your payments and billing information"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAddPaymentMethod(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
            <Button onClick={() => setShowMakePayment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Payments</p>
              <p className="text-2xl font-bold text-neutral-900">{payments.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-neutral-900">
                {payments.filter(p => p.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">This Month</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(
                  payments
                    .filter(p => p.paidDate && new Date(p.paidDate).getMonth() === new Date().getMonth())
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </p>
            </div>
            <Banknote className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Auto Pay</p>
              <p className="text-2xl font-bold text-neutral-900">
                {payments.filter(p => p.isAutoPayEnabled).length}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Outstanding Balances */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Outstanding Balances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availablePolicies.map(policy => (
            <div key={policy.id} className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-neutral-900">{policy.type}</h4>
                <span className="text-sm text-neutral-600">{policy.number}</span>
              </div>
              <p className="text-lg font-bold text-neutral-900 mb-3">
                {formatCurrency(policy.balance)}
              </p>
              <Button size="sm" className="w-full" onClick={() => setShowMakePayment(true)}>
                Pay Now
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Payment Methods</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPaymentMethod(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Method
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map(method => (
            <div key={method.id} className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-neutral-500" />
                  <span className="font-medium">{method.nickname}</span>
                </div>
                {method.isDefault && (
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                {method.cardBrand || method.bankName} ••••{method.lastFour}
              </p>
              {method.expiryMonth && method.expiryYear && (
                <p className="text-xs text-neutral-500 mt-1">
                  Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Search Payments">
            <FormInput
              placeholder="Search by payment number, policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              clearable
              onClear={() => setSearchTerm('')}
            />
          </FormField>

          <FormField label="Status">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </FormField>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Policy</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Due Date</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Method</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-900">{payment.paymentNumber}</p>
                      <p className="text-sm text-neutral-600">{payment.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{payment.policyNumber}</p>
                      <p className="text-sm text-neutral-600">{payment.policyType}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="py-3 px-4">{formatDate(payment.dueDate)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={payment.status} 
                      variant={getStatusColor(payment.status) as any}
                    />
                  </td>
                  <td className="py-3 px-4">
                    {payment.paymentMethod}
                    {payment.lastFourDigits && (
                      <span className="text-sm text-neutral-500"> ••••{payment.lastFourDigits}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status === 'FAILED' && (
                        <Button size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No payments found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your filters to see more payments.'
                : 'You haven\'t made any payments yet.'
              }
            </p>
            <Button onClick={() => setShowMakePayment(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Make Your First Payment
            </Button>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showDetails && <PaymentDetailsModal />}
      {showMakePayment && <MakePaymentModal />}
      {showAddPaymentMethod && <AddPaymentMethodModal />}
    </div>
  );
};

export default Payments;