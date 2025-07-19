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
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Upload,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  Car,
  Home,
  Heart,
  Activity
} from 'lucide-react';
import { claimSchemas } from '@/lib/validations';

interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyType: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH';
  policyNumber: string;
  type: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'INVESTIGATING' | 'APPROVED' | 'DENIED' | 'PAID' | 'CLOSED';
  amount: number;
  estimatedAmount?: number;
  submittedDate: string;
  incidentDate: string;
  description: string;
  location?: string;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: number;
  }>;
  timeline: Array<{
    id: string;
    date: string;
    event: string;
    description: string;
    status: string;
  }>;
}

interface NewClaimData {
  policyId: string;
  type: string;
  incidentDate: string;
  location: string;
  description: string;
  estimatedAmount: number;
  policeReportNumber?: string;
  witnesses?: string;
}

const Claims: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);

  const { execute: fetchClaims, loading } = useApi();

  // Mock policies for claim filing
  const availablePolicies = [
    { id: '1', number: 'AUTO-2024-001', type: 'AUTO', description: 'Toyota Camry 2022' },
    { id: '2', number: 'HOME-2024-002', type: 'HOME', description: '123 Main St Property' },
    { id: '3', number: 'LIFE-2024-003', type: 'LIFE', description: 'Term Life Insurance' },
    { id: '4', number: 'HEALTH-2024-004', type: 'HEALTH', description: 'Individual Health Plan' },
  ];

  const claimTypes = {
    AUTO: ['Collision', 'Comprehensive', 'Liability', 'Uninsured Motorist', 'Personal Injury'],
    HOME: ['Fire Damage', 'Water Damage', 'Theft', 'Storm Damage', 'Vandalism', 'Personal Property'],
    LIFE: ['Death Benefit', 'Terminal Illness', 'Accidental Death'],
    HEALTH: ['Medical Treatment', 'Prescription Drugs', 'Emergency Care', 'Preventive Care', 'Mental Health']
  };

  const newClaimForm = useGenericForm({
    schema: claimSchemas.newClaim,
    defaultValues: {
      policyId: '',
      type: '',
      incidentDate: '',
      location: '',
      description: '',
      estimatedAmount: 0,
      policeReportNumber: '',
      witnesses: '',
    },
    showSuccessMessage: true,
    successMessage: 'Claim submitted successfully! You will receive updates via email.',
  });

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter, typeFilter]);

  const loadClaims = async () => {
    try {
      // Mock claims data
      const mockClaims: Claim[] = [
        {
          id: '1',
          claimNumber: 'CLM-2024-001',
          policyId: '1',
          policyType: 'AUTO',
          policyNumber: 'AUTO-2024-001',
          type: 'Collision',
          status: 'UNDER_REVIEW',
          amount: 5000,
          estimatedAmount: 5500,
          submittedDate: '2024-01-15',
          incidentDate: '2024-01-10',
          description: 'Rear-end collision on Highway 101 during morning commute. Significant damage to rear bumper and trunk.',
          location: 'Highway 101, San Francisco, CA',
          adjusterName: 'Sarah Johnson',
          adjusterPhone: '(555) 123-4567',
          adjusterEmail: 'sarah.johnson@assureme.com',
          documents: [
            { id: '1', name: 'Police_Report.pdf', type: 'PDF', uploadDate: '2024-01-15', size: 245760 },
            { id: '2', name: 'Damage_Photos.zip', type: 'ZIP', uploadDate: '2024-01-15', size: 2048000 },
            { id: '3', name: 'Repair_Estimate.pdf', type: 'PDF', uploadDate: '2024-01-16', size: 156432 }
          ],
          timeline: [
            { id: '1', date: '2024-01-15', event: 'Claim Submitted', description: 'Initial claim filed online', status: 'COMPLETED' },
            { id: '2', date: '2024-01-16', event: 'Documents Received', description: 'Police report and photos uploaded', status: 'COMPLETED' },
            { id: '3', date: '2024-01-17', event: 'Adjuster Assigned', description: 'Sarah Johnson assigned to case', status: 'COMPLETED' },
            { id: '4', date: '2024-01-18', event: 'Vehicle Inspection', description: 'Scheduled for January 22, 2024', status: 'PENDING' }
          ]
        },
        {
          id: '2',
          claimNumber: 'CLM-2024-002',
          policyId: '2',
          policyType: 'HOME',
          policyNumber: 'HOME-2024-002',
          type: 'Water Damage',
          status: 'APPROVED',
          amount: 12000,
          estimatedAmount: 12500,
          submittedDate: '2024-01-10',
          incidentDate: '2024-01-08',
          description: 'Pipe burst in basement causing extensive water damage to flooring and personal property.',
          location: '123 Main St, Basement',
          adjusterName: 'Mike Chen',
          adjusterPhone: '(555) 987-6543',
          adjusterEmail: 'mike.chen@assureme.com',
          documents: [
            { id: '4', name: 'Plumber_Report.pdf', type: 'PDF', uploadDate: '2024-01-10', size: 198432 },
            { id: '5', name: 'Damage_Assessment.pdf', type: 'PDF', uploadDate: '2024-01-12', size: 345678 },
            { id: '6', name: 'Receipts.zip', type: 'ZIP', uploadDate: '2024-01-14', size: 1024000 }
          ],
          timeline: [
            { id: '5', date: '2024-01-10', event: 'Claim Submitted', description: 'Water damage claim filed', status: 'COMPLETED' },
            { id: '6', date: '2024-01-11', event: 'Emergency Response', description: 'Water mitigation services approved', status: 'COMPLETED' },
            { id: '7', date: '2024-01-12', event: 'Property Inspection', description: 'Adjuster completed site visit', status: 'COMPLETED' },
            { id: '8', date: '2024-01-18', event: 'Claim Approved', description: 'Settlement approved for $12,000', status: 'COMPLETED' }
          ]
        },
        {
          id: '3',
          claimNumber: 'CLM-2024-003',
          policyId: '4',
          policyType: 'HEALTH',
          policyNumber: 'HEALTH-2024-004',
          type: 'Emergency Care',
          status: 'PAID',
          amount: 2500,
          submittedDate: '2024-01-05',
          incidentDate: '2024-01-03',
          description: 'Emergency room visit for chest pain and cardiac evaluation.',
          location: 'City General Hospital, Emergency Department',
          documents: [
            { id: '7', name: 'Medical_Records.pdf', type: 'PDF', uploadDate: '2024-01-05', size: 567890 },
            { id: '8', name: 'Hospital_Bill.pdf', type: 'PDF', uploadDate: '2024-01-06', size: 123456 }
          ],
          timeline: [
            { id: '9', date: '2024-01-05', event: 'Claim Submitted', description: 'Medical claim filed', status: 'COMPLETED' },
            { id: '10', date: '2024-01-06', event: 'Pre-Authorization', description: 'Treatment pre-authorized', status: 'COMPLETED' },
            { id: '11', date: '2024-01-08', event: 'Claim Processed', description: 'Payment approved and issued', status: 'COMPLETED' }
          ]
        }
      ];

      setClaims(mockClaims);
    } catch (error) {
      console.error('Failed to load claims:', error);
    }
  };

  const filterClaims = () => {
    let filtered = [...claims];

    if (searchTerm) {
      filtered = filtered.filter(claim => 
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.policyType === typeFilter);
    }

    setFilteredClaims(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      SUBMITTED: 'info',
      UNDER_REVIEW: 'warning',
      INVESTIGATING: 'warning',
      APPROVED: 'success',
      DENIED: 'error',
      PAID: 'success',
      CLOSED: 'default'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPolicyIcon = (type: string) => {
    const icons = {
      AUTO: <Car className="h-4 w-4" />,
      HOME: <Home className="h-4 w-4" />,
      LIFE: <Heart className="h-4 w-4" />,
      HEALTH: <Activity className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  const handleNewClaim = async (data: NewClaimData) => {
    try {
      // Simulate API call
      console.log('Filing new claim:', data);
      setShowNewClaimForm(false);
      // Reload claims after successful submission
      await loadClaims();
    } catch (error) {
      console.error('Failed to file claim:', error);
    }
  };

  const ClaimDetailsModal = () => {
    if (!selectedClaim) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {getPolicyIcon(selectedClaim.policyType)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Claim {selectedClaim.claimNumber}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {selectedClaim.type} - {selectedClaim.policyNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge 
                  status={selectedClaim.status} 
                  variant={getStatusColor(selectedClaim.status) as any}
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

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Claim Overview */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Claim Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Claim Amount</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatCurrency(selectedClaim.amount)}
                      </p>
                      {selectedClaim.estimatedAmount && (
                        <p className="text-xs text-neutral-500">
                          Est: {formatCurrency(selectedClaim.estimatedAmount)}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Incident Date</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatDate(selectedClaim.incidentDate)}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Submitted</p>
                      <p className="text-lg font-semibold text-neutral-900">
                        {formatDate(selectedClaim.submittedDate)}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-600">Location</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {selectedClaim.location || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Description</h3>
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <p className="text-neutral-700">{selectedClaim.description}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Claim Timeline</h3>
                  <div className="space-y-4">
                    {selectedClaim.timeline.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          event.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 
                          event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {event.status === 'COMPLETED' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : event.status === 'PENDING' ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-neutral-900">{event.event}</h4>
                            <span className="text-sm text-neutral-500">{formatDate(event.date)}</span>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Documents</h3>
                  <div className="space-y-3">
                    {selectedClaim.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-neutral-500" />
                          <div>
                            <p className="font-medium text-neutral-900">{doc.name}</p>
                            <p className="text-sm text-neutral-500">
                              {formatFileSize(doc.size)} • Uploaded {formatDate(doc.uploadDate)}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Adjuster Info */}
                {selectedClaim.adjusterName && (
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h3 className="font-medium text-neutral-900 mb-3">Your Adjuster</h3>
                    <div className="space-y-2">
                      <p className="font-medium text-neutral-900">{selectedClaim.adjusterName}</p>
                      {selectedClaim.adjusterPhone && (
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <Phone className="h-4 w-4" />
                          <span>{selectedClaim.adjusterPhone}</span>
                        </div>
                      )}
                      {selectedClaim.adjusterEmail && (
                        <div className="flex items-center space-x-2 text-sm text-neutral-600">
                          <Mail className="h-4 w-4" />
                          <span>{selectedClaim.adjusterEmail}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Adjuster
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <h3 className="font-medium text-neutral-900 mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Print Summary
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NewClaimModal = () => {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = newClaimForm;
    const watchPolicyId = watch('policyId');
    const selectedPolicy = availablePolicies.find(p => p.id === watchPolicyId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">File New Claim</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewClaimForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleNewClaim)} className="p-6 space-y-6">
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
                    {policy.number} - {policy.description}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Claim Type */}
            {selectedPolicy && (
              <FormField
                label="Claim Type"
                error={errors.type?.message}
                required
              >
                <select
                  {...register('type')}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.type ? 'border-red-500' : 'border-neutral-300'
                  }`}
                >
                  <option value="">Select claim type...</option>
                  {claimTypes[selectedPolicy.type as keyof typeof claimTypes]?.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </FormField>
            )}

            {/* Incident Date */}
            <FormField
              label="Date of Incident"
              error={errors.incidentDate?.message}
              required
            >
              <FormInput
                {...register('incidentDate')}
                type="date"
                error={!!errors.incidentDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </FormField>

            {/* Location */}
            <FormField
              label="Location of Incident"
              error={errors.location?.message}
            >
              <FormInput
                {...register('location')}
                placeholder="Enter the location where the incident occurred"
                error={!!errors.location}
                leftIcon={<MapPin className="h-4 w-4" />}
              />
            </FormField>

            {/* Description */}
            <FormField
              label="Description"
              error={errors.description?.message}
              required
              description="Provide a detailed description of what happened"
            >
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none ${
                  errors.description ? 'border-red-500' : 'border-neutral-300'
                }`}
                placeholder="Describe the incident in detail..."
              />
            </FormField>

            {/* Estimated Amount */}
            <FormField
              label="Estimated Damage Amount"
              error={errors.estimatedAmount?.message}
              description="Approximate cost of damages (if known)"
            >
              <FormInput
                {...register('estimatedAmount', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                error={!!errors.estimatedAmount}
                leftIcon={<DollarSign className="h-4 w-4" />}
              />
            </FormField>

            {/* Additional Fields for Auto Claims */}
            {selectedPolicy?.type === 'AUTO' && (
              <>
                <FormField
                  label="Police Report Number"
                  error={errors.policeReportNumber?.message}
                  description="If applicable"
                >
                  <FormInput
                    {...register('policeReportNumber')}
                    placeholder="Enter police report number"
                    error={!!errors.policeReportNumber}
                  />
                </FormField>

                <FormField
                  label="Witnesses"
                  error={errors.witnesses?.message}
                  description="Names and contact information of any witnesses"
                >
                  <textarea
                    {...register('witnesses')}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    placeholder="List any witnesses with their contact information..."
                  />
                </FormField>
              </>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewClaimForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Submit Claim
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
        title="Claims Center"
        description="File new claims and track existing ones"
        actions={
          <Button onClick={() => setShowNewClaimForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            File New Claim
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Claims</p>
              <p className="text-2xl font-bold text-neutral-900">{claims.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Under Review</p>
              <p className="text-2xl font-bold text-neutral-900">
                {claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING'].includes(c.status)).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Approved</p>
              <p className="text-2xl font-bold text-neutral-900">
                {claims.filter(c => ['APPROVED', 'PAID'].includes(c.status)).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Paid</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(claims.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Search Claims">
            <FormInput
              placeholder="Search by claim number, type..."
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
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="PAID">Paid</option>
              <option value="CLOSED">Closed</option>
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

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {getPolicyIcon(claim.policyType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-neutral-900">{claim.claimNumber}</h3>
                    <StatusBadge 
                      status={claim.status} 
                      variant={getStatusColor(claim.status) as any}
                    />
                  </div>
                  <p className="text-sm text-neutral-600 mb-1">
                    {claim.type} • {claim.policyNumber}
                  </p>
                  <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
                    {claim.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Filed: {formatDate(claim.submittedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(claim.amount)}</span>
                    </div>
                    {claim.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-48">{claim.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(claim)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredClaims.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No claims found</h3>
          <p className="text-neutral-600 mb-6">
            {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'Try adjusting your filters to see more claims.'
              : 'You haven\'t filed any claims yet. File a claim when you need to report an incident.'
            }
          </p>
          <Button onClick={() => setShowNewClaimForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            File Your First Claim
          </Button>
        </Card>
      )}

      {/* Modals */}
      {showDetails && <ClaimDetailsModal />}
      {showNewClaimForm && <NewClaimModal />}
    </div>
  );
};

export default Claims;