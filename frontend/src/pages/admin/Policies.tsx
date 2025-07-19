import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useApi } from '@/hooks/useApi';
import { useGenericForm } from '@/hooks/useGenericForm';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { FormField, FormInput } from '@/components/common/Form';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Car,
  Home,
  Heart,
  Activity,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import { policySchemas } from '@/lib/validations';

interface Policy {
  id: string;
  policyNumber: string;
  type: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  clientId: string;
  clientName: string;
  clientEmail: string;
  agentId?: string;
  agentName?: string;
  premium: number;
  coverage: number;
  deductible: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  description: string;
  terms: Record<string, any>;
  createdDate: string;
  lastModified: string;
  claimsCount: number;
  totalClaimsAmount: number;
}

interface NewPolicyData {
  type: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH' | 'BUSINESS';
  clientId: string;
  agentId?: string;
  premium: number;
  coverage: number;
  deductible: number;
  startDate: string;
  endDate: string;
  description: string;
}

const AdminPolicies: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showEditPolicy, setShowEditPolicy] = useState(false);
  const [loading, setLoading] = useState(true);

  const { execute: fetchPolicies } = useApi();

  const newPolicyForm = useGenericForm({
    schema: policySchemas.requestQuote,
    defaultValues: {
      type: 'AUTO',
      coverage: 100000,
      deductible: 500,
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      }
    },
    showSuccessMessage: true,
    successMessage: 'Policy created successfully!',
  });

  // Mock clients and agents data
  const availableClients = [
    { id: '1', name: 'John Doe', email: 'john.doe@email.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@email.com' },
    { id: '4', name: 'Emily Davis', email: 'emily.davis@email.com' },
    { id: '6', name: 'Robert Wilson', email: 'robert.wilson@email.com' },
  ];

  const availableAgents = [
    { id: '3', name: 'Michael Chen', email: 'michael.chen@assureme.com' },
    { id: '7', name: 'Lisa Anderson', email: 'lisa.anderson@assureme.com' },
  ];

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, typeFilter, statusFilter]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      
      // Mock policies data
      const mockPolicies: Policy[] = [
        {
          id: '1',
          policyNumber: 'AUTO-2024-001',
          type: 'AUTO',
          status: 'ACTIVE',
          clientId: '1',
          clientName: 'John Doe',
          clientEmail: 'john.doe@email.com',
          agentId: '3',
          agentName: 'Michael Chen',
          premium: 1200,
          coverage: 100000,
          deductible: 500,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          renewalDate: '2024-12-31',
          description: 'Comprehensive auto insurance for Toyota Camry 2022',
          terms: { vehicleYear: 2022, vehicleMake: 'Toyota', vehicleModel: 'Camry' },
          createdDate: '2023-12-15',
          lastModified: '2024-01-15',
          claimsCount: 1,
          totalClaimsAmount: 5000,
        },
        {
          id: '2',
          policyNumber: 'HOME-2024-002',
          type: 'HOME',
          status: 'ACTIVE',
          clientId: '1',
          clientName: 'John Doe',
          clientEmail: 'john.doe@email.com',
          agentId: '3',
          agentName: 'Michael Chen',
          premium: 800,
          coverage: 250000,
          deductible: 1000,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          renewalDate: '2024-12-31',
          description: 'Homeowners insurance for single-family residence',
          terms: { propertyType: 'Single Family', squareFootage: 2000, yearBuilt: 1995 },
          createdDate: '2023-12-20',
          lastModified: '2024-01-10',
          claimsCount: 1,
          totalClaimsAmount: 12000,
        },
        {
          id: '3',
          policyNumber: 'LIFE-2024-003',
          type: 'LIFE',
          status: 'ACTIVE',
          clientId: '1',
          clientName: 'John Doe',
          clientEmail: 'john.doe@email.com',
          premium: 2400,
          coverage: 500000,
          deductible: 0,
          startDate: '2024-01-01',
          endDate: '2044-01-01',
          renewalDate: '2025-01-01',
          description: 'Term life insurance policy',
          terms: { termLength: 20, beneficiaries: ['Jane Doe', 'John Doe Jr.'] },
          createdDate: '2023-11-30',
          lastModified: '2023-11-30',
          claimsCount: 0,
          totalClaimsAmount: 0,
        },
        {
          id: '4',
          policyNumber: 'AUTO-2024-004',
          type: 'AUTO',
          status: 'ACTIVE',
          clientId: '2',
          clientName: 'Sarah Johnson',
          clientEmail: 'sarah.johnson@email.com',
          agentId: '7',
          agentName: 'Lisa Anderson',
          premium: 1400,
          coverage: 150000,
          deductible: 250,
          startDate: '2024-01-15',
          endDate: '2025-01-15',
          renewalDate: '2025-01-15',
          description: 'Full coverage auto insurance for BMW X3 2023',
          terms: { vehicleYear: 2023, vehicleMake: 'BMW', vehicleModel: 'X3' },
          createdDate: '2024-01-10',
          lastModified: '2024-01-15',
          claimsCount: 0,
          totalClaimsAmount: 0,
        },
        {
          id: '5',
          policyNumber: 'HOME-2024-005',
          type: 'HOME',
          status: 'ACTIVE',
          clientId: '2',
          clientName: 'Sarah Johnson',
          clientEmail: 'sarah.johnson@email.com',
          premium: 1000,
          coverage: 300000,
          deductible: 1500,
          startDate: '2024-02-01',
          endDate: '2025-02-01',
          renewalDate: '2025-02-01',
          description: 'Condo insurance policy',
          terms: { propertyType: 'Condominium', squareFootage: 1200, yearBuilt: 2010 },
          createdDate: '2024-01-25',
          lastModified: '2024-02-01',
          claimsCount: 0,
          totalClaimsAmount: 0,
        },
        {
          id: '6',
          policyNumber: 'HEALTH-2024-006',
          type: 'HEALTH',
          status: 'PENDING',
          clientId: '4',
          clientName: 'Emily Davis',
          clientEmail: 'emily.davis@email.com',
          premium: 3600,
          coverage: 50000,
          deductible: 2000,
          startDate: '2024-03-01',
          endDate: '2025-03-01',
          renewalDate: '2025-03-01',
          description: 'Individual health insurance plan',
          terms: { planType: 'Individual', networkType: 'PPO' },
          createdDate: '2024-02-15',
          lastModified: '2024-02-20',
          claimsCount: 0,
          totalClaimsAmount: 0,
        },
        {
          id: '7',
          policyNumber: 'AUTO-2023-007',
          type: 'AUTO',
          status: 'EXPIRED',
          clientId: '6',
          clientName: 'Robert Wilson',
          clientEmail: 'robert.wilson@email.com',
          premium: 1100,
          coverage: 75000,
          deductible: 1000,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          renewalDate: '2023-12-31',
          description: 'Basic auto insurance for Honda Civic 2019',
          terms: { vehicleYear: 2019, vehicleMake: 'Honda', vehicleModel: 'Civic' },
          createdDate: '2022-12-15',
          lastModified: '2023-12-31',
          claimsCount: 2,
          totalClaimsAmount: 8500,
        },
      ];

      setPolicies(mockPolicies);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = () => {
    let filtered = [...policies];

    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(policy => policy.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }

    setFilteredPolicies(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      PENDING: 'info',
      EXPIRED: 'error',
      CANCELLED: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      AUTO: <Car className="h-4 w-4" />,
      HOME: <Home className="h-4 w-4" />,
      LIFE: <Heart className="h-4 w-4" />,
      HEALTH: <Activity className="h-4 w-4" />,
      BUSINESS: <Shield className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Shield className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowDetails(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowEditPolicy(true);
  };

  const handleCreatePolicy = async (data: any) => {
    try {
      console.log('Creating policy:', data);
      setShowCreatePolicy(false);
      await loadPolicies();
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  const handleStatusChange = async (policyId: string, newStatus: string) => {
    try {
      console.log('Changing policy status:', policyId, newStatus);
      await loadPolicies();
    } catch (error) {
      console.error('Failed to change policy status:', error);
    }
  };

  const PolicyDetailsModal = () => {
    if (!selectedPolicy) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {getTypeIcon(selectedPolicy.type)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {selectedPolicy.policyNumber}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <StatusBadge 
                      status={selectedPolicy.type} 
                      variant="default"
                    />
                    <StatusBadge 
                      status={selectedPolicy.status} 
                      variant={getStatusColor(selectedPolicy.status) as any}
                    />
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Policy Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Premium</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(selectedPolicy.premium)}
                </p>
                <p className="text-sm text-neutral-600">per year</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Coverage</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(selectedPolicy.coverage)}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Deductible</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(selectedPolicy.deductible)}
                </p>
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Client Name</p>
                  <p className="font-medium">{selectedPolicy.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Email</p>
                  <p className="font-medium">{selectedPolicy.clientEmail}</p>
                </div>
                {selectedPolicy.agentName && (
                  <>
                    <div>
                      <p className="text-sm text-neutral-600">Agent</p>
                      <p className="font-medium">{selectedPolicy.agentName}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Policy Details */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Policy Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Start Date</p>
                  <p className="font-medium">{formatDate(selectedPolicy.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">End Date</p>
                  <p className="font-medium">{formatDate(selectedPolicy.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Renewal Date</p>
                  <p className="font-medium">{formatDate(selectedPolicy.renewalDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Created Date</p>
                  <p className="font-medium">{formatDate(selectedPolicy.createdDate)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-3">Description</h3>
              <p className="text-neutral-700 p-4 bg-neutral-50 rounded-lg">
                {selectedPolicy.description}
              </p>
            </div>

            {/* Claims Summary */}
            {selectedPolicy.claimsCount > 0 && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Claims Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">Total Claims</p>
                    <p className="text-2xl font-bold text-red-900">{selectedPolicy.claimsCount}</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">Claims Amount</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(selectedPolicy.totalClaimsAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleEditPolicy(selectedPolicy)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Policy
              </Button>
              {selectedPolicy.status === 'ACTIVE' ? (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedPolicy.id, 'INACTIVE')}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Suspend Policy
                </Button>
              ) : selectedPolicy.status === 'INACTIVE' ? (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(selectedPolicy.id, 'ACTIVE')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Activate Policy
                </Button>
              ) : null}
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreatePolicyModal = () => {
    const { register, handleSubmit, formState: { errors } } = newPolicyForm;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">Create New Policy</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreatePolicy(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleCreatePolicy)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Policy Type" required>
                <select className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="AUTO">Auto Insurance</option>
                  <option value="HOME">Home Insurance</option>
                  <option value="LIFE">Life Insurance</option>
                  <option value="HEALTH">Health Insurance</option>
                  <option value="BUSINESS">Business Insurance</option>
                </select>
              </FormField>

              <FormField label="Client" required>
                <select className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Select Client</option>
                  {availableClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Agent">
                <select className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Select Agent (Optional)</option>
                  {availableAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.email}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Annual Premium" required>
                <FormInput
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1200.00"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
              </FormField>

              <FormField label="Coverage Amount" required>
                <FormInput
                  type="number"
                  min="0"
                  placeholder="100000"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
              </FormField>

              <FormField label="Deductible" required>
                <FormInput
                  type="number"
                  min="0"
                  placeholder="500"
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
              </FormField>

              <FormField label="Start Date" required>
                <FormInput
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField label="End Date" required>
                <FormInput
                  type="date"
                />
              </FormField>
            </div>

            <FormField label="Description" required>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Enter policy description..."
              />
            </FormField>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreatePolicy(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Policy
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-48"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-neutral-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Management"
        description="Manage insurance policies and coverage details"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadPolicies}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Policies
            </Button>
            <Button onClick={() => setShowCreatePolicy(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Policies</p>
              <p className="text-2xl font-bold text-neutral-900">{policies.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Active</p>
              <p className="text-2xl font-bold text-neutral-900">
                {policies.filter(p => p.status === 'ACTIVE').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-neutral-900">
                {policies.filter(p => p.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Expired</p>
              <p className="text-2xl font-bold text-neutral-900">
                {policies.filter(p => p.status === 'EXPIRED').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Premium</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(policies.reduce((sum, p) => sum + p.premium, 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Search Policies">
            <FormInput
              placeholder="Search by policy number, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              clearable
              onClear={() => setSearchTerm('')}
            />
          </FormField>

          <FormField label="Type">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Types</option>
              <option value="AUTO">Auto</option>
              <option value="HOME">Home</option>
              <option value="LIFE">Life</option>
              <option value="HEALTH">Health</option>
              <option value="BUSINESS">Business</option>
            </select>
          </FormField>

          <FormField label="Status">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
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

      {/* Policies Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Policy</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Client</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Premium</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Coverage</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Renewal</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-900">{policy.policyNumber}</p>
                      <p className="text-sm text-neutral-600 line-clamp-1">{policy.description}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-900">{policy.clientName}</p>
                      <p className="text-sm text-neutral-600">{policy.clientEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(policy.type)}
                      <span className="text-sm font-medium">{policy.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge 
                      status={policy.status} 
                      variant={getStatusColor(policy.status) as any}
                    />
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {formatCurrency(policy.premium)}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {formatCurrency(policy.coverage)}
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600">
                    {formatDate(policy.renewalDate)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(policy)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPolicy(policy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No policies found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your filters to see more policies.'
                : 'Start by creating your first policy.'
              }
            </p>
            <Button onClick={() => setShowCreatePolicy(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Policy
            </Button>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showDetails && <PolicyDetailsModal />}
      {showCreatePolicy && <CreatePolicyModal />}
    </div>
  );
};

export default AdminPolicies;