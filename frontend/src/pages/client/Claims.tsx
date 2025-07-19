import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useApi } from '@/hooks/useApi';
import { useGenericForm } from '@/hooks/useGenericForm';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { FormField, FormInput } from '@/components/common/Form';
import { getClaimsData, getAvailablePolicies, getClaimTypes } from '@/services/staticDataService';
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

  // Load data from static data service
  const availablePolicies = getAvailablePolicies();
  const claimTypes = getClaimTypes();

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
      // Load claims data from static data service
      const claimsData = getClaimsData();
      setClaims(claimsData);
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
      <div className="claims-modal-overlay">
        <div className="claims-modal-container">
          <div className="claims-modal-header">
            <div className="claims-modal-header-content">
              <div className="claims-modal-title-section">
                <div className="claims-modal-title-icon">
                  {getPolicyIcon(selectedClaim.policyType)}
                </div>
                <div>
                  <h2 className="claims-modal-title">
                    Claim {selectedClaim.claimNumber}
                  </h2>
                  <p className="claims-modal-subtitle">
                    {selectedClaim.type} - {selectedClaim.policyNumber}
                  </p>
                </div>
              </div>
              <div className="claims-modal-header-actions">
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

          <div className="claims-modal-body">
            <div className="claims-modal-grid">
              {/* Main Content */}
              <div className="claims-modal-main">
                {/* Claim Overview */}
                <div className="claims-details-section">
                  <h3 className="claims-details-title">Claim Details</h3>
                  <div className="claims-details-grid">
                    <div className="claims-details-card">
                      <p className="claims-details-label">Claim Amount</p>
                      <p className="claims-details-value">
                        {formatCurrency(selectedClaim.amount)}
                      </p>
                      {selectedClaim.estimatedAmount && (
                        <p className="claims-details-secondary">
                          Est: {formatCurrency(selectedClaim.estimatedAmount)}
                        </p>
                      )}
                    </div>
                    <div className="claims-details-card">
                      <p className="claims-details-label">Incident Date</p>
                      <p className="claims-details-value">
                        {formatDate(selectedClaim.incidentDate)}
                      </p>
                    </div>
                    <div className="claims-details-card">
                      <p className="claims-details-label">Submitted</p>
                      <p className="claims-details-value">
                        {formatDate(selectedClaim.submittedDate)}
                      </p>
                    </div>
                    <div className="claims-details-card">
                      <p className="claims-details-label">Location</p>
                      <p className="claims-details-location">
                        {selectedClaim.location || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="claims-details-section">
                  <h3 className="claims-details-title">Description</h3>
                  <div className="claims-description-container">
                    <p className="claims-description-text">{selectedClaim.description}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="claims-details-section">
                  <h3 className="claims-details-title">Claim Timeline</h3>
                  <div className="claims-timeline">
                    {selectedClaim.timeline.map((event) => (
                      <div key={event.id} className="claims-timeline-item">
                        <div className={`claims-timeline-icon-container ${
                          event.status === 'COMPLETED' ? 'claims-timeline-icon-completed' : 
                          event.status === 'PENDING' ? 'claims-timeline-icon-pending' :
                          'claims-timeline-icon-default'
                        }`}>
                          {event.status === 'COMPLETED' ? (
                            <CheckCircle className="claims-timeline-icon" />
                          ) : event.status === 'PENDING' ? (
                            <Clock className="claims-timeline-icon" />
                          ) : (
                            <AlertTriangle className="claims-timeline-icon" />
                          )}
                        </div>
                        <div className="claims-timeline-content">
                          <div className="claims-timeline-header">
                            <h4 className="claims-timeline-event">{event.event}</h4>
                            <span className="claims-timeline-date">{formatDate(event.date)}</span>
                          </div>
                          <p className="claims-timeline-description">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="claims-details-section">
                  <h3 className="claims-details-title">Documents</h3>
                  <div className="claims-documents-list">
                    {selectedClaim.documents.map((doc) => (
                      <div key={doc.id} className="claims-document-item">
                        <div className="claims-document-info">
                          <FileText className="claims-document-icon" />
                          <div className="claims-document-details">
                            <p className="claims-document-name">{doc.name}</p>
                            <p className="claims-document-meta">
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
              <div className="claims-modal-sidebar">
                {/* Adjuster Info */}
                {selectedClaim.adjusterName && (
                  <div className="claims-adjuster-card">
                    <h3 className="claims-adjuster-title">Your Adjuster</h3>
                    <div className="claims-adjuster-info">
                      <p className="claims-adjuster-name">{selectedClaim.adjusterName}</p>
                      {selectedClaim.adjusterPhone && (
                        <div className="claims-adjuster-contact">
                          <Phone className="claims-adjuster-contact-icon" />
                          <span>{selectedClaim.adjusterPhone}</span>
                        </div>
                      )}
                      {selectedClaim.adjusterEmail && (
                        <div className="claims-adjuster-contact">
                          <Mail className="claims-adjuster-contact-icon" />
                          <span>{selectedClaim.adjusterEmail}</span>
                        </div>
                      )}
                    </div>
                    <div className="claims-adjuster-actions">
                      <Button variant="outline" size="sm" className="claims-adjuster-button">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Adjuster
                      </Button>
                      <Button variant="outline" size="sm" className="claims-adjuster-button">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="claims-actions-card">
                  <h3 className="claims-actions-title">Actions</h3>
                  <div className="claims-actions-list">
                    <Button variant="outline" size="sm" className="claims-action-button">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button variant="outline" size="sm" className="claims-action-button">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                    <Button variant="outline" size="sm" className="claims-action-button">
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
      <div className="claims-modal-overlay">
        <div className="new-claim-modal-container">
          <div className="new-claim-modal-header">
            <div className="new-claim-modal-header-content">
              <h2 className="new-claim-modal-title">File New Claim</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewClaimForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleNewClaim)} className="new-claim-form">
            {/* Policy Selection */}
            <FormField
              label="Select Policy"
              error={errors.policyId?.message}
              required
            >
              <select
                {...register('policyId')}
                className={`claims-form-select ${
                  errors.policyId ? 'claims-form-select-error' : 'claims-form-select-default'
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
                  className={`claims-form-select ${
                    errors.type ? 'claims-form-select-error' : 'claims-form-select-default'
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
                className={`claims-form-textarea ${
                  errors.description ? 'claims-form-textarea-error' : 'claims-form-textarea-default'
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
                    className="claims-form-textarea claims-form-textarea-default"
                    placeholder="List any witnesses with their contact information..."
                  />
                </FormField>
              </>
            )}

            {/* Submit Button */}
            <div className="new-claim-form-actions">
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
    <div className="claims-container">
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
      <div className="claims-stats-grid">
        <Card className="claims-stat-card">
          <div className="claims-stat-content">
            <div className="claims-stat-info">
              <p className="claims-stat-label">Total Claims</p>
              <p className="claims-stat-value">{claims.length}</p>
            </div>
            <FileText className="claims-stat-icon claims-stat-icon-blue" />
          </div>
        </Card>

        <Card className="claims-stat-card">
          <div className="claims-stat-content">
            <div className="claims-stat-info">
              <p className="claims-stat-label">Under Review</p>
              <p className="claims-stat-value">
                {claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING'].includes(c.status)).length}
              </p>
            </div>
            <Clock className="claims-stat-icon claims-stat-icon-yellow" />
          </div>
        </Card>

        <Card className="claims-stat-card">
          <div className="claims-stat-content">
            <div className="claims-stat-info">
              <p className="claims-stat-label">Approved</p>
              <p className="claims-stat-value">
                {claims.filter(c => ['APPROVED', 'PAID'].includes(c.status)).length}
              </p>
            </div>
            <CheckCircle className="claims-stat-icon claims-stat-icon-green" />
          </div>
        </Card>

        <Card className="claims-stat-card">
          <div className="claims-stat-content">
            <div className="claims-stat-info">
              <p className="claims-stat-label">Total Paid</p>
              <p className="claims-stat-value">
                {formatCurrency(claims.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0))}
              </p>
            </div>
            <DollarSign className="claims-stat-icon claims-stat-icon-green" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="claims-filters">
        <div className="claims-filters-grid">
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
              className="form-select-base form-select-default"
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
              className="form-select-base form-select-default"
            >
              <option value="ALL">All Types</option>
              <option value="AUTO">Auto</option>
              <option value="HOME">Home</option>
              <option value="LIFE">Life</option>
              <option value="HEALTH">Health</option>
            </select>
          </FormField>

          <div className="claims-filter-actions">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="claims-clear-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Claims List */}
      <div className="claims-list">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="claims-list-item">
            <div className="claims-item-content">
              <div className="claims-item-main">
                <div className="claims-item-icon-container">
                  {getPolicyIcon(claim.policyType)}
                </div>
                <div className="claims-item-details">
                  <div className="claims-item-header">
                    <h3 className="claims-item-number">{claim.claimNumber}</h3>
                    <StatusBadge 
                      status={claim.status} 
                      variant={getStatusColor(claim.status) as any}
                    />
                  </div>
                  <p className="claims-item-meta">
                    {claim.type} • {claim.policyNumber}
                  </p>
                  <p className="claims-item-description">
                    {claim.description}
                  </p>
                  <div className="claims-item-info-row">
                    <div className="claims-item-info-item">
                      <Calendar className="h-4 w-4" />
                      <span>Filed: {formatDate(claim.submittedDate)}</span>
                    </div>
                    <div className="claims-item-info-item">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(claim.amount)}</span>
                    </div>
                    {claim.location && (
                      <div className="claims-item-info-item">
                        <MapPin className="h-4 w-4" />
                        <span className="claims-item-location">{claim.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="claims-item-actions">
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
        <Card className="claims-empty-state">
          <FileText className="claims-empty-icon" />
          <h3 className="claims-empty-title">No claims found</h3>
          <p className="claims-empty-description">
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