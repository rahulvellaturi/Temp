import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, CheckCircle, XCircle, Clock, AlertTriangle, FileText, DollarSign, Calendar, User, Phone, Mail } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import PageHeader from '@/components/common/PageHeader';
import { Claim, ClaimStatus } from '@/types';
import mockDataService from '@/services/mockDataService';

// Mock data for claims
const mockClaims: Claim[] = [
  {
    id: 'CLM001',
    claimNumber: 'CLM001',
    policyId: 'POL001',
    userId: 'USR001',
    status: 'SUBMITTED',
    payoutAmount: 5500.00,
    description: 'Rear-end collision on Highway 101',
    submittedAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    incidentDate: '2024-01-14T16:45:00Z',
    incidentLocation: 'Highway 101, San Francisco, CA',
    assignedAdjusterId: 'ADJ001',
    documents: [
      { id: 'DOC001', name: 'claim-photos.pdf', type: 'IMAGE', size: 2048000, url: '#' },
      { id: 'DOC002', name: 'police-report.pdf', type: 'DOCUMENT', size: 1024000, url: '#' },
      { id: 'DOC003', name: 'estimate.pdf', type: 'DOCUMENT', size: 512000, url: '#' }
    ],
    policy: { policyNumber: 'AUTO-001', policyType: 'AUTO' },
    user: { firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com' },
    assignedAdjuster: { firstName: 'Jane', lastName: 'Adjuster', email: 'jane.adjuster@assureme.com' }
  },
  {
    id: 'CLM002',
    claimNumber: 'CLM002',
    policyId: 'POL002',
    userId: 'USR002',
    status: 'APPROVED',
    payoutAmount: 12500.00,
    description: 'Water damage from burst pipe in basement',
    submittedAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
    incidentDate: '2024-01-09T08:15:00Z',
    incidentLocation: '123 Main St, Basement, Springfield, IL',
    assignedAdjusterId: 'ADJ002',
    documents: [
      { id: 'DOC004', name: 'water-damage-photos.pdf', type: 'IMAGE', size: 3072000, url: '#' },
      { id: 'DOC005', name: 'plumber-report.pdf', type: 'DOCUMENT', size: 1536000, url: '#' },
      { id: 'DOC006', name: 'repair-estimate.pdf', type: 'DOCUMENT', size: 768000, url: '#' }
    ],
    policy: { policyNumber: 'HOME-002', policyType: 'HOME' },
    user: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@email.com' },
    assignedAdjuster: { firstName: 'Bob', lastName: 'Claims', email: 'bob.claims@assureme.com' }
  },
  {
    id: 'CLM003',
    claimNumber: 'CLM003',
    policyId: 'POL003',
    userId: 'USR003',
    status: 'UNDER_REVIEW',
    payoutAmount: 8750.00,
    description: 'Emergency surgery - appendectomy',
    submittedAt: '2024-01-12T09:45:00Z',
    updatedAt: '2024-01-14T11:20:00Z',
    incidentDate: '2024-01-11T22:30:00Z',
    incidentLocation: 'City General Hospital, Emergency Room',
    assignedAdjusterId: 'ADJ001',
    documents: [
      { id: 'DOC007', name: 'medical-records.pdf', type: 'DOCUMENT', size: 2048000, url: '#' },
      { id: 'DOC008', name: 'hospital-bill.pdf', type: 'DOCUMENT', size: 512000, url: '#' },
      { id: 'DOC009', name: 'doctor-report.pdf', type: 'DOCUMENT', size: 1024000, url: '#' }
    ],
    policy: { policyNumber: 'HEALTH-003', policyType: 'HEALTH' },
    user: { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@email.com' },
    assignedAdjuster: { firstName: 'Jane', lastName: 'Adjuster', email: 'jane.adjuster@assureme.com' }
  },
  {
    id: 'CLM004',
    claimNumber: 'CLM004',
    policyId: 'POL004',
    userId: 'USR004',
    status: 'REJECTED',
    payoutAmount: 0,
    description: 'Minor fender bender in parking lot',
    submittedAt: '2024-01-08T11:15:00Z',
    updatedAt: '2024-01-10T14:45:00Z',
    incidentDate: '2024-01-07T17:20:00Z',
    incidentLocation: 'Walmart Parking Lot, 456 Commerce Blvd',
    assignedAdjusterId: 'ADJ003',
    documents: [
      { id: 'DOC010', name: 'incident-photos.pdf', type: 'IMAGE', size: 1536000, url: '#' },
      { id: 'DOC011', name: 'witness-statement.pdf', type: 'DOCUMENT', size: 256000, url: '#' }
    ],
    policy: { policyNumber: 'AUTO-004', policyType: 'AUTO' },
    user: { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com' },
    assignedAdjuster: { firstName: 'Tom', lastName: 'Reviewer', email: 'tom.reviewer@assureme.com' }
  },
  {
    id: 'CLM005',
    claimNumber: 'CLM005',
    policyId: 'POL005',
    userId: 'USR005',
    status: 'SUBMITTED',
    payoutAmount: 50000.00,
    description: 'Life insurance claim - accidental death',
    submittedAt: '2024-01-05T13:30:00Z',
    updatedAt: '2024-01-05T13:30:00Z',
    incidentDate: '2024-01-03T19:45:00Z',
    incidentLocation: 'Interstate 75, Mile Marker 142',
    assignedAdjusterId: 'ADJ002',
    documents: [
      { id: 'DOC012', name: 'death-certificate.pdf', type: 'DOCUMENT', size: 512000, url: '#' },
      { id: 'DOC013', name: 'police-report.pdf', type: 'DOCUMENT', size: 1024000, url: '#' },
      { id: 'DOC014', name: 'medical-examiner-report.pdf', type: 'DOCUMENT', size: 2048000, url: '#' }
    ],
    policy: { policyNumber: 'LIFE-005', policyType: 'LIFE' },
    user: { firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@email.com' },
    assignedAdjuster: { firstName: 'Bob', lastName: 'Claims', email: 'bob.claims@assureme.com' }
  }
];

const AdminClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'ALL'>('ALL');
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>('ALL');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load claims from mock data service
    const allClaims = mockDataService.getClaims();
    setClaims(allClaims);
    setFilteredClaims(allClaims);
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    let filtered = claims;

    if (searchTerm) {
      filtered = filtered.filter(claim =>
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (claim.user?.firstName + ' ' + claim.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }

    if (policyTypeFilter !== 'ALL') {
      filtered = filtered.filter(claim => claim.policy?.policyType === policyTypeFilter);
    }

    setFilteredClaims(filtered);
  }, [claims, searchTerm, statusFilter, policyTypeFilter]);

  const handleStatusChange = (claimId: string, newStatus: ClaimStatus) => {
    setClaims(prevClaims =>
      prevClaims.map(claim =>
        claim.id === claimId ? { ...claim, status: newStatus } : claim
      )
    );
    if (selectedClaim?.id === claimId) {
      setSelectedClaim(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'UNDER_REVIEW':
      case 'ADJUSTER_ASSIGNED':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'SUBMITTED':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Claims Management"
          subtitle="Manage and review insurance claims"
        />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <Button variant="primary" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export Claims
          </Button>
        }
      />

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search Claims
            </label>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Status Filter
            </label>
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
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type Filter
            </label>
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

      {/* Claims List */}
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
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {claim.claimNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPolicyTypeColor(claim.policy?.policyType || '')}`}>
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
                        <span>{claim.user?.firstName} {claim.user?.lastName}</span>
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

      {/* Claim Detail Modal */}
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPolicyTypeColor(selectedClaim.policy?.policyType || '')}`}>
                      {selectedClaim.policy?.policyType}
                    </span>
                    <StatusBadge status={selectedClaim.status} />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClaimModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Claim Information */}
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
                      <p className="text-2xl font-bold text-primary">{formatCurrency(selectedClaim.payoutAmount || 0)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Policy Number</label>
                      <p className="text-neutral-900">{selectedClaim.policy?.policyNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700">Assigned Adjuster</label>
                      <p className="text-neutral-900">{selectedClaim.assignedAdjuster?.firstName} {selectedClaim.assignedAdjuster?.lastName}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Claimant Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">{selectedClaim.user?.firstName} {selectedClaim.user?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">{selectedClaim.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">Incident: {formatDate(selectedClaim.incidentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-900">Location: {selectedClaim.incidentLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Timeline</h3>
                                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-neutral-600">
                        Incident occurred on {formatDate(selectedClaim.incidentDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-neutral-600">
                        Claim submitted on {formatDate(selectedClaim.submittedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-neutral-600">
                        Last updated on {formatDate(selectedClaim.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-neutral-600">
                        Current status: {selectedClaim.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                  </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedClaim.documents?.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg">
                      <FileText className="w-5 h-5 text-neutral-500" />
                      <span className="text-sm text-neutral-900 flex-1">{doc.name}</span>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  )) || <p className="text-neutral-500 text-sm">No documents uploaded</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Additional Information</h3>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Incident Location:</strong> {selectedClaim.incidentLocation}</p>
                    {selectedClaim.assignedAdjuster && (
                      <p><strong>Assigned Adjuster:</strong> {selectedClaim.assignedAdjuster.firstName} {selectedClaim.assignedAdjuster.lastName} ({selectedClaim.assignedAdjuster.email})</p>
                    )}
                    <p><strong>Policy Number:</strong> {selectedClaim.policy?.policyNumber}</p>
                    <p><strong>Policy Type:</strong> {selectedClaim.policy?.policyType}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
              
              {(selectedClaim.status === 'UNDER_REVIEW' || selectedClaim.status === 'ADJUSTER_ASSIGNED') && (
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