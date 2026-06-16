import React, { useCallback, useMemo, useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import { Claim, ClaimStatus } from '@/types';
import unifiedMockDataService from '@/services/unifiedMockDataService';
import { useDataLoader } from '@/hooks/useDataLoader';
import { downloadCsvFile } from '@/lib/exportUtils';
import { toast } from '@/components/ui/toaster';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle, FileText, DollarSign, Calendar, User, Mail } from 'lucide-react';

const loadClaims = () => unifiedMockDataService.fetchClaimsAsync();

const AdminClaims: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('ALL');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>('ALL');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { data: claims, loading: isLoading, setData: setClaims } = useDataLoader(
    loadClaims,
    { initialData: [] }
  );

  const claimsList = claims ?? [];

  const filteredClaims = useMemo(() => {
    let filtered = claimsList;

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (claim) =>
          claim.id.toLowerCase().includes(query) ||
          claim.claimNumber.toLowerCase().includes(query) ||
          claim.description.toLowerCase().includes(query) ||
          `${claim.user?.firstName ?? ''} ${claim.user?.lastName ?? ''}`.toLowerCase().includes(query) ||
          (claim.user?.email ?? '').toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((claim) => claim.status === statusFilter);
    }

    if (policyTypeFilter !== 'ALL') {
      filtered = filtered.filter((claim) => claim.policy?.policyType === policyTypeFilter);
    }

    return filtered;
  }, [claimsList, searchTerm, statusFilter, policyTypeFilter]);

  const handleStatusChange = useCallback(
    (claimId: string, newStatus: ClaimStatus) => {
      setClaims(
        claimsList.map((claim) =>
          claim.id === claimId ? { ...claim, status: newStatus } : claim
        )
      );

      setSelectedClaim((prev) =>
        prev?.id === claimId ? { ...prev, status: newStatus } : prev
      );
    },
    [claimsList, setClaims]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getPolicyTypeColor = (policyType: string) => {
    switch (policyType) {
      case 'AUTO':
        return 'bg-blue-100 text-blue-800';
      case 'HOME':
        return 'bg-green-100 text-green-800';
      case 'HEALTH':
        return 'bg-purple-100 text-purple-800';
      case 'LIFE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportClaims = () => {
    downloadCsvFile(
      'claims-export.csv',
      ['Claim Number', 'Status', 'Client', 'Type', 'Amount'],
      filteredClaims.map((c) => [
        c.claimNumber,
        c.status,
        `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim(),
        c.policy?.policyType ?? '',
        c.payoutAmount ?? 0,
      ])
    );
    toast.success('Export started', 'Claims CSV is downloading.');
  };

  if (isLoading && claimsList.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Claims Management" subtitle="Manage and review insurance claims" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claims Management"
        subtitle="Manage and review insurance claims"
        action={
          <Button variant="primary" size="sm" onClick={handleExportClaims}>
            <FileText className="w-4 h-4 mr-2" />
            Export Claims
          </Button>
        }
      />

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search Claims</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by ID, description, or claimant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status Filter</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'ALL')}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ADJUSTER_ASSIGNED">Adjuster Assigned</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PAID">Paid</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Type Filter</label>
            <select
              value={policyTypeFilter}
              onChange={(e) => setPolicyTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="ALL">All Types</option>
              <option value="AUTO">Auto</option>
              <option value="HOME">Home</option>
              <option value="HEALTH">Health</option>
              <option value="LIFE">Life</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredClaims.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No claims found</h3>
            <p className="text-neutral-600">Try adjusting your search criteria.</p>
          </Card>
        ) : (
          filteredClaims.map((claim) => (
            <Card key={claim.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-neutral-900">{claim.claimNumber}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPolicyTypeColor(
                        claim.policy?.policyType || ''
                      )}`}
                    >
                      {claim.policy?.policyType}
                    </span>
                    <StatusBadge status={claim.status} />
                  </div>

                  <p className="text-neutral-700 mb-3">{claim.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatCurrency(claim.payoutAmount || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {claim.user?.firstName} {claim.user?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted: {formatDate(claim.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{claim.documents?.length || 0} documents</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClaim(claim);
                      setShowClaimModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>

                  {claim.status === 'SUBMITTED' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(claim.id, 'APPROVED')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(claim.id, 'REJECTED')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}

                  {(claim.status === 'UNDER_REVIEW' || claim.status === 'ADJUSTER_ASSIGNED') && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusChange(claim.id, 'APPROVED')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showClaimModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Claim Details - {selectedClaim.claimNumber}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPolicyTypeColor(
                        selectedClaim.policy?.policyType || ''
                      )}`}
                    >
                      {selectedClaim.policy?.policyType}
                    </span>
                    <StatusBadge status={selectedClaim.status} />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowClaimModal(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Claim Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Description</label>
                      <p className="text-neutral-900">{selectedClaim.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Claim Amount</label>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(selectedClaim.payoutAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Policy Number</label>
                      <p className="text-neutral-900">{selectedClaim.policy?.policyNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Assigned Adjuster</label>
                      <p className="text-neutral-900">
                        {selectedClaim.assignedAdjuster?.firstName}{' '}
                        {selectedClaim.assignedAdjuster?.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Claimant Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">
                        {selectedClaim.user?.firstName} {selectedClaim.user?.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">{selectedClaim.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">
                        Incident: {formatDate(selectedClaim.incidentDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">Location: {selectedClaim.incidentLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedClaim.status === 'SUBMITTED' && (
                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(selectedClaim.id, 'APPROVED');
                      setShowClaimModal(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Claim
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedClaim.id, 'UNDER_REVIEW')}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Move to Review
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleStatusChange(selectedClaim.id, 'REJECTED');
                      setShowClaimModal(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Claim
                  </Button>
                </div>
              )}

              {(selectedClaim.status === 'UNDER_REVIEW' ||
                selectedClaim.status === 'ADJUSTER_ASSIGNED') && (
                <div className="flex gap-3 pt-4 border-t border-neutral-200">
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(selectedClaim.id, 'APPROVED');
                      setShowClaimModal(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Claim
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleStatusChange(selectedClaim.id, 'REJECTED');
                      setShowClaimModal(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Claim
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
