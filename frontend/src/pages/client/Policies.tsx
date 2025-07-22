import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useApi } from '@/hooks/useApi';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { FormField, FormInput } from '@/components/common/Form';
import mockDataService from '@/services/mockDataService';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Car,
  Home,
  Heart,
  Briefcase,
  Activity
} from 'lucide-react';

interface Policy {
  id: string;
  type: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH' | 'BUSINESS';
  policyNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  premium: number;
  coverage: number;
  deductible: number;
  startDate: string;
  endDate: string;
  nextPayment: string;
  description: string;
  beneficiaries?: string[];
  vehicles?: Array<{
    make: string;
    model: string;
    year: number;
    vin: string;
  }>;
  property?: {
    address: string;
    propertyType: string;
    squareFootage: number;
    yearBuilt: number;
  };
}

const Policies: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { execute: fetchPolicies, loading } = useApi();

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, statusFilter, typeFilter]);

  const loadPolicies = async () => {
    try {
      // Load policies from mock data service
      const userId = user?.id || '1'; // Default to user ID 1 for demo
      const userPolicies = mockDataService.getPoliciesByUserId(userId);
      
      setPolicies(userPolicies);
      setFilteredPolicies(userPolicies);
    } catch (error) {
      console.error('Failed to load policies:', error);
    }
  };

  const filterPolicies = () => {
    let filtered = [...policies];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(policy => policy.type === typeFilter);
    }

    setFilteredPolicies(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'warning',
      PENDING: 'warning',
      EXPIRED: 'error',
      CANCELLED: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPolicyIcon = (type: string) => {
    const icons = {
      AUTO: <Car className="h-5 w-5" />,
      HOME: <Home className="h-5 w-5" />,
      LIFE: <Heart className="h-5 w-5" />,
      HEALTH: <Activity className="h-5 w-5" />,
      BUSINESS: <Briefcase className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons] || <Shield className="h-5 w-5" />;
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

  const handleViewDetails = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowDetails(true);
  };

  const handleDownloadPolicy = (policy: Policy) => {
    // Simulate PDF download
    alert(`Downloading policy document for ${policy.policyNumber}`);
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
                  {getPolicyIcon(selectedPolicy.type)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {selectedPolicy.type.charAt(0) + selectedPolicy.type.slice(1).toLowerCase()} Insurance
                  </h2>
                  <p className="text-sm text-neutral-600">{selectedPolicy.policyNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge 
                  status={selectedPolicy.status} 
                  variant={getStatusColor(selectedPolicy.status) as any}
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
            {/* Policy Overview */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Policy Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Coverage Amount</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatCurrency(selectedPolicy.coverage)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Annual Premium</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatCurrency(selectedPolicy.premium)}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Deductible</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {selectedPolicy.deductible ? formatCurrency(selectedPolicy.deductible) : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Next Payment</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatDate(selectedPolicy.nextPayment)}
                  </p>
                </div>
              </div>
            </div>

            {/* Policy Dates */}
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Policy Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-900">Start Date</span>
                  </div>
                  <p className="text-neutral-700">{formatDate(selectedPolicy.startDate)}</p>
                </div>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-900">End Date</span>
                  </div>
                  <p className="text-neutral-700">{formatDate(selectedPolicy.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Policy-specific details */}
            {selectedPolicy.vehicles && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Covered Vehicles</h3>
                <div className="space-y-3">
                  {selectedPolicy.vehicles.map((vehicle, index) => (
                    <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-neutral-600">Make & Model</p>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">Year</p>
                          <p className="font-medium">{vehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">VIN</p>
                          <p className="font-medium font-mono text-sm">{vehicle.vin}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPolicy.property && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Property Details</h3>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-600">Address</p>
                      <p className="font-medium">{selectedPolicy.property.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Property Type</p>
                      <p className="font-medium">{selectedPolicy.property.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Square Footage</p>
                      <p className="font-medium">{selectedPolicy.property.squareFootage.toLocaleString()} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Year Built</p>
                      <p className="font-medium">{selectedPolicy.property.yearBuilt}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPolicy.beneficiaries && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Beneficiaries</h3>
                <div className="space-y-2">
                  {selectedPolicy.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                      <p className="font-medium">{beneficiary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleDownloadPolicy(selectedPolicy)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Policy
              </Button>
              <Button>
                Request Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Policies"
        description="Manage your insurance policies and coverage"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Quote
          </Button>
        }
      />

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Search Policies">
            <FormInput
              placeholder="Search by policy number, type..."
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
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </FormField>

          <FormField label="Policy Type">
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

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {getPolicyIcon(policy.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {policy.type.charAt(0) + policy.type.slice(1).toLowerCase()} Insurance
                  </h3>
                  <p className="text-sm text-neutral-600">{policy.policyNumber}</p>
                </div>
              </div>
              <StatusBadge 
                status={policy.status} 
                variant={getStatusColor(policy.status) as any}
              />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Coverage:</span>
                <span className="text-sm font-medium">{formatCurrency(policy.coverage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Premium:</span>
                <span className="text-sm font-medium">{formatCurrency(policy.premium)}/year</span>
              </div>
              {policy.nextPayment && (
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-600">Next Payment:</span>
                  <span className="text-sm font-medium">{formatDate(policy.nextPayment)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Expires:</span>
                <span className="text-sm font-medium">{formatDate(policy.endDate)}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(policy)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPolicy(policy)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No policies found</h3>
          <p className="text-neutral-600 mb-6">
            {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'Try adjusting your filters to see more policies.'
              : 'You don\'t have any insurance policies yet. Get started with a quote!'
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Quote
          </Button>
        </Card>
      )}

      {/* Policy Details Modal */}
      {showDetails && <PolicyDetailsModal />}
    </div>
  );
};

export default Policies;