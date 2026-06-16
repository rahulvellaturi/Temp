import React, { useMemo, useState } from 'react';
import { useGenericForm } from '@/hooks/useGenericForm';
import { useDataLoader } from '@/hooks/useDataLoader';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import StatsCard, { StatsGrid } from '@/components/common/StatsCard';
import { FormField, FormInput } from '@/components/common/Form';
import { getClaimsData, getAvailablePolicies, getClaimTypes } from '@/services/staticDataService';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getStatusColor, getPolicyIcon } from '@/lib/statusUtils';
import ClaimDetailsModal, { ClientClaim } from '@/pages/client/claims/ClaimDetailsModal';
import NewClaimModal from '@/pages/client/claims/NewClaimModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { claimSchemas } from '@/lib/validations';

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

const loadClaims = async () => getClaimsData() as ClientClaim[];

const Claims: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState<ClientClaim | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);

  const { data: claims, loading, refetch } = useDataLoader(loadClaims, { initialData: [] });
  const claimsList = claims ?? [];

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

  const filteredClaims = useMemo(() => {
    let filtered = [...claimsList];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (claim) =>
          claim.claimNumber.toLowerCase().includes(query) ||
          claim.type.toLowerCase().includes(query) ||
          claim.description.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((claim) => claim.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((claim) => claim.policyType === typeFilter);
    }

    return filtered;
  }, [claimsList, searchTerm, statusFilter, typeFilter]);

  const handleViewDetails = (claim: ClientClaim) => {
    setSelectedClaim(claim);
    setShowDetails(true);
  };

  const handleNewClaim = async (data: NewClaimData) => {
    try {
      console.log('Filing new claim:', data);
      setShowNewClaimForm(false);
      newClaimForm.reset();
      await refetch();
    } catch (error) {
      console.error('Failed to file claim:', error);
    }
  };

  if (loading && claimsList.length === 0) {
    return (
      <div className="claims-container">
        <PageHeader title="Claims Center" description="File new claims and track existing ones" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

      <StatsGrid cols={4}>
        <StatsCard
          title="Total Claims"
          value={claimsList.length}
          format="number"
          icon={FileText}
          iconColor="blue"
        />
        <StatsCard
          title="Under Review"
          value={
            claimsList.filter((c) =>
              ['SUBMITTED', 'UNDER_REVIEW', 'INVESTIGATING'].includes(c.status)
            ).length
          }
          format="number"
          icon={Clock}
          iconColor="yellow"
        />
        <StatsCard
          title="Approved"
          value={claimsList.filter((c) => ['APPROVED', 'PAID'].includes(c.status)).length}
          format="number"
          icon={CheckCircle}
          iconColor="green"
        />
        <StatsCard
          title="Total Paid"
          value={claimsList.filter((c) => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0)}
          format="currency"
          icon={DollarSign}
          iconColor="green"
        />
      </StatsGrid>

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

      <div className="claims-list">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="claims-list-item">
            <div className="claims-item-content">
              <div className="claims-item-main">
                <div className="claims-item-icon-container">{getPolicyIcon(claim.policyType)}</div>
                <div className="claims-item-details">
                  <div className="claims-item-header">
                    <h3 className="claims-item-number">{claim.claimNumber}</h3>
                    <StatusBadge status={claim.status} variant={getStatusColor(claim.status) as any} />
                  </div>
                  <p className="claims-item-meta">
                    {claim.type} • {claim.policyNumber}
                  </p>
                  <p className="claims-item-description">{claim.description}</p>
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
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim)}>
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
              : "You haven't filed any claims yet. File a claim when you need to report an incident."}
          </p>
          <Button onClick={() => setShowNewClaimForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            File Your First Claim
          </Button>
        </Card>
      )}

      {selectedClaim && (
        <ClaimDetailsModal
          claim={selectedClaim}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}

      <NewClaimModal
        isOpen={showNewClaimForm}
        onClose={() => setShowNewClaimForm(false)}
        onSubmit={handleNewClaim}
        isLoading={loading}
        form={newClaimForm}
        availablePolicies={availablePolicies}
        claimTypes={claimTypes}
      />
    </div>
  );
};

export default Claims;
