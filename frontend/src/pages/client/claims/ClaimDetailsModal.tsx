import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Phone,
  Mail,
} from 'lucide-react';
import { formatCurrency, formatDate, formatFileSize } from '@/lib/formatters';
import { getStatusColor, getPolicyIcon } from '@/lib/statusUtils';

export interface ClaimDetails {
  id: string;
  claimNumber: string;
  policyId: string;
  policyType: 'AUTO' | 'HOME' | 'LIFE' | 'HEALTH';
  policyNumber: string;
  type: string;
  status: string;
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

interface ClaimDetailsModalProps {
  claim: ClaimDetails;
  isOpen: boolean;
  onClose: () => void;
}

const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Claim Details"
      subtitle={claim.claimNumber}
      icon={getPolicyIcon(claim.policyType)}
      size="2xl"
      backdrop="none"
      className="max-w-6xl"
      headerClassName="pb-4"
      bodyClassName="p-0"
    >
      <div className="claims-modal-body">
        <div className="flex items-center justify-between mb-4 px-0">
          <p className="text-sm text-neutral-600">
            {claim.type} · {claim.policyNumber}
          </p>
          <StatusBadge
            status={claim.status}
            variant={getStatusColor(claim.status) as 'default' | 'success' | 'warning' | 'error' | 'info'}
          />
        </div>
        <div className="claims-modal-grid">
          <div className="claims-modal-main">
            <div className="claims-details-section">
              <h3 className="claims-details-title">Claim Details</h3>
              <div className="claims-details-grid">
                <div className="claims-details-card">
                  <p className="claims-details-label">Claim Amount</p>
                  <p className="claims-details-value">{formatCurrency(claim.amount)}</p>
                  {claim.estimatedAmount != null && claim.estimatedAmount > 0 && (
                    <p className="claims-details-secondary">
                      Est: {formatCurrency(claim.estimatedAmount)}
                    </p>
                  )}
                </div>
                <div className="claims-details-card">
                  <p className="claims-details-label">Incident Date</p>
                  <p className="claims-details-value">{formatDate(claim.incidentDate)}</p>
                </div>
                <div className="claims-details-card">
                  <p className="claims-details-label">Submitted</p>
                  <p className="claims-details-value">{formatDate(claim.submittedDate)}</p>
                </div>
                <div className="claims-details-card">
                  <p className="claims-details-label">Location</p>
                  <p className="claims-details-location">{claim.location || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="claims-details-section">
              <h3 className="claims-details-title">Description</h3>
              <div className="claims-description-container">
                <p className="claims-description-text">{claim.description}</p>
              </div>
            </div>

            <div className="claims-details-section">
              <h3 className="claims-details-title">Claim Timeline</h3>
              <div className="claims-timeline">
                {claim.timeline.map((event) => (
                  <div key={event.id} className="claims-timeline-item">
                    <div
                      className={`claims-timeline-icon-container ${
                        event.status === 'COMPLETED'
                          ? 'claims-timeline-icon-completed'
                          : event.status === 'PENDING'
                            ? 'claims-timeline-icon-pending'
                            : 'claims-timeline-icon-default'
                      }`}
                    >
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

            <div className="claims-details-section">
              <h3 className="claims-details-title">Documents</h3>
              <div className="claims-documents-list">
                {claim.documents.map((doc) => (
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

          <div className="claims-modal-sidebar">
            {claim.adjusterName && (
              <div className="claims-adjuster-card">
                <h3 className="claims-adjuster-title">Your Adjuster</h3>
                <div className="claims-adjuster-info">
                  <p className="claims-adjuster-name">{claim.adjusterName}</p>
                  {claim.adjusterPhone && (
                    <div className="claims-adjuster-contact">
                      <Phone className="claims-adjuster-contact-icon" />
                      <span>{claim.adjusterPhone}</span>
                    </div>
                  )}
                  {claim.adjusterEmail && (
                    <div className="claims-adjuster-contact">
                      <Mail className="claims-adjuster-contact-icon" />
                      <span>{claim.adjusterEmail}</span>
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
    </Modal>
  );
};

export default React.memo(ClaimDetailsModal);
