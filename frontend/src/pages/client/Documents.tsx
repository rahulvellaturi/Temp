import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { useDataLoader } from '@/hooks/useDataLoader';
import unifiedMockDataService from '@/services/unifiedMockDataService';
import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/common/StatusBadge';
import { FormField, FormInput } from '@/components/common/Form';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Upload,
  Calendar,
  Folder,
  File,
  Image,
  FileSpreadsheet,
  FileImage,
  Archive,
  Shield,
  Lock,
  Share,
  Star,
  Trash2,
  Plus
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'POLICY' | 'CLAIM' | 'PAYMENT' | 'ID_CARD' | 'CERTIFICATE' | 'OTHER';
  category: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModified: string;
  policyId?: string;
  policyNumber?: string;
  claimId?: string;
  claimNumber?: string;
  isConfidential: boolean;
  isFavorite: boolean;
  description?: string;
  tags: string[];
  downloadUrl: string;
  thumbnailUrl?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
}

interface DocumentCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  description: string;
}

const Documents: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [loading, setLoading] = useState(true);

  const documentCategories: DocumentCategory[] = [
    {
      id: 'POLICY',
      name: 'Policy Documents',
      icon: <Shield className="h-5 w-5" />,
      count: 0,
      description: 'Insurance policy documents and certificates'
    },
    {
      id: 'CLAIM',
      name: 'Claims',
      icon: <FileText className="h-5 w-5" />,
      count: 0,
      description: 'Claim forms and related documentation'
    },
    {
      id: 'PAYMENT',
      name: 'Billing & Payments',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      count: 0,
      description: 'Invoices, receipts, and payment records'
    },
    {
      id: 'ID_CARD',
      name: 'ID Cards',
      icon: <FileImage className="h-5 w-5" />,
      count: 0,
      description: 'Digital insurance ID cards'
    },
    {
      id: 'CERTIFICATE',
      name: 'Certificates',
      icon: <Star className="h-5 w-5" />,
      count: 0,
      description: 'Coverage certificates and endorsements'
    },
    {
      id: 'OTHER',
      name: 'Other Documents',
      icon: <Folder className="h-5 w-5" />,
      count: 0,
      description: 'Miscellaneous documents and files'
    }
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter, categoryFilter]);

  const loadDocuments = async () => {
    try {
      // Mock documents data
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Auto Insurance Policy - 2024',
          type: 'POLICY',
          category: 'Auto Insurance',
          fileType: 'PDF',
          fileSize: 2048576,
          uploadDate: '2024-01-01',
          lastModified: '2024-01-15',
          policyId: '1',
          policyNumber: 'AUTO-2024-001',
          isConfidential: true,
          isFavorite: true,
          description: 'Complete auto insurance policy documentation for Toyota Camry 2022',
          tags: ['auto', 'policy', '2024', 'toyota'],
          downloadUrl: '/documents/auto-policy-2024.pdf',
          status: 'ACTIVE'
        },
        {
          id: '2',
          name: 'Home Insurance Certificate',
          type: 'CERTIFICATE',
          category: 'Home Insurance',
          fileType: 'PDF',
          fileSize: 512000,
          uploadDate: '2024-01-15',
          lastModified: '2024-01-15',
          policyId: '2',
          policyNumber: 'HOME-2024-002',
          isConfidential: false,
          isFavorite: false,
          description: 'Certificate of insurance for home property',
          tags: ['home', 'certificate', 'property'],
          downloadUrl: '/documents/home-certificate.pdf',
          status: 'ACTIVE'
        },
        {
          id: '3',
          name: 'Auto Insurance ID Card',
          type: 'ID_CARD',
          category: 'Auto Insurance',
          fileType: 'PNG',
          fileSize: 245760,
          uploadDate: '2024-01-01',
          lastModified: '2024-01-01',
          policyId: '1',
          policyNumber: 'AUTO-2024-001',
          isConfidential: false,
          isFavorite: true,
          description: 'Digital insurance ID card for vehicle',
          tags: ['auto', 'id-card', 'digital'],
          downloadUrl: '/documents/auto-id-card.png',
          thumbnailUrl: '/documents/thumbnails/auto-id-card-thumb.png',
          status: 'ACTIVE'
        },
        {
          id: '4',
          name: 'Claim Documentation - Water Damage',
          type: 'CLAIM',
          category: 'Home Insurance',
          fileType: 'ZIP',
          fileSize: 10485760,
          uploadDate: '2024-01-10',
          lastModified: '2024-01-18',
          claimId: '2',
          claimNumber: 'CLM-2024-002',
          isConfidential: true,
          isFavorite: false,
          description: 'Complete documentation package for water damage claim',
          tags: ['claim', 'water-damage', 'home', 'photos'],
          downloadUrl: '/documents/claim-water-damage.zip',
          status: 'ACTIVE'
        },
        {
          id: '5',
          name: 'Payment Receipt - January 2024',
          type: 'PAYMENT',
          category: 'Auto Insurance',
          fileType: 'PDF',
          fileSize: 156432,
          uploadDate: '2024-01-16',
          lastModified: '2024-01-16',
          policyId: '1',
          policyNumber: 'AUTO-2024-001',
          isConfidential: false,
          isFavorite: false,
          description: 'Payment receipt for January 2024 premium',
          tags: ['payment', 'receipt', 'january', '2024'],
          downloadUrl: '/documents/payment-receipt-jan-2024.pdf',
          status: 'ACTIVE'
        },
        {
          id: '6',
          name: 'Life Insurance Policy - Previous Year',
          type: 'POLICY',
          category: 'Life Insurance',
          fileType: 'PDF',
          fileSize: 1048576,
          uploadDate: '2023-03-01',
          lastModified: '2023-03-01',
          isConfidential: true,
          isFavorite: false,
          description: 'Archived life insurance policy from previous year',
          tags: ['life', 'policy', '2023', 'archived'],
          downloadUrl: '/documents/life-policy-2023.pdf',
          status: 'ARCHIVED'
        }
      ];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    setFilteredDocuments(filtered);
  };

  const getFileIcon = (fileType: string) => {
    const icons = {
      PDF: <FileText className="h-8 w-8 text-red-500" />,
      PNG: <FileImage className="h-8 w-8 text-blue-500" />,
      JPG: <FileImage className="h-8 w-8 text-blue-500" />,
      JPEG: <FileImage className="h-8 w-8 text-blue-500" />,
      ZIP: <Archive className="h-8 w-8 text-yellow-500" />,
      DOC: <FileText className="h-8 w-8 text-blue-600" />,
      DOCX: <FileText className="h-8 w-8 text-blue-600" />,
      XLS: <FileSpreadsheet className="h-8 w-8 text-green-600" />,
      XLSX: <FileSpreadsheet className="h-8 w-8 text-green-600" />,
    };
    return icons[fileType as keyof typeof icons] || <File className="h-8 w-8 text-neutral-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (document: Document) => {
    setSelectedDocument(document);
    setShowDetails(true);
  };

  const handleDownload = (document: Document) => {
    // Simulate download
    alert(`Downloading ${document.name}`);
  };

  const handleToggleFavorite = (documentId: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, isFavorite: !doc.isFavorite }
          : doc
      )
    );
  };

  const DocumentDetailsModal = () => {
    if (!selectedDocument) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedDocument.fileType)}
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    {selectedDocument.name}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {selectedDocument.fileType} • {formatFileSize(selectedDocument.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFavorite(selectedDocument.id)}
                >
                  <Star className={`h-4 w-4 ${selectedDocument.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
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
            {/* Document Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Category</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {selectedDocument.category}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Type</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {selectedDocument.type.replace('_', ' ')}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Upload Date</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatDate(selectedDocument.uploadDate)}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Last Modified</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatDate(selectedDocument.lastModified)}
                </p>
              </div>
            </div>

            {/* Related Information */}
            {(selectedDocument.policyNumber || selectedDocument.claimNumber) && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3">Related Information</h3>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  {selectedDocument.policyNumber && (
                    <div className="flex justify-between mb-2">
                      <span className="text-neutral-600">Policy Number:</span>
                      <span className="font-medium">{selectedDocument.policyNumber}</span>
                    </div>
                  )}
                  {selectedDocument.claimNumber && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Claim Number:</span>
                      <span className="font-medium">{selectedDocument.claimNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedDocument.description && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3">Description</h3>
                <div className="p-4 border border-neutral-200 rounded-lg">
                  <p className="text-neutral-700">{selectedDocument.description}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedDocument.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {selectedDocument.isConfidential && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lock className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Confidential Document</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This document contains sensitive information and should be handled securely.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedDocument)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update category counts
  const updatedCategories = documentCategories.map(category => ({
    ...category,
    count: documents.filter(doc => doc.type === category.id).length
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Center"
        description="Access and manage your insurance documents"
        actions={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Documents</p>
              <p className="text-2xl font-bold text-neutral-900">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Favorites</p>
              <p className="text-2xl font-bold text-neutral-900">
                {documents.filter(d => d.isFavorite).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Confidential</p>
              <p className="text-2xl font-bold text-neutral-900">
                {documents.filter(d => d.isConfidential).length}
              </p>
            </div>
            <Lock className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Size</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatFileSize(documents.reduce((sum, d) => sum + d.fileSize, 0))}
              </p>
            </div>
            <Archive className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Document Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Document Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {updatedCategories.map(category => (
            <div
              key={category.id}
              className="p-4 border border-neutral-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer"
              onClick={() => setCategoryFilter(category.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-primary">
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                </div>
                <span className="text-sm font-bold text-neutral-900">{category.count}</span>
              </div>
              <p className="text-sm text-neutral-600">{category.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Search Documents">
            <FormInput
              placeholder="Search by name, description, tags..."
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
              <option value="POLICY">Policy Documents</option>
              <option value="CLAIM">Claims</option>
              <option value="PAYMENT">Billing & Payments</option>
              <option value="ID_CARD">ID Cards</option>
              <option value="CERTIFICATE">Certificates</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField>

          <FormField label="Category">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="ALL">All Categories</option>
              <option value="Auto Insurance">Auto Insurance</option>
              <option value="Home Insurance">Home Insurance</option>
              <option value="Life Insurance">Life Insurance</option>
              <option value="Health Insurance">Health Insurance</option>
            </select>
          </FormField>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Documents Display */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">
            Documents ({filteredDocuments.length})
          </h3>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="border border-neutral-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(document)}
              >
                <div className="flex items-start justify-between mb-3">
                  {getFileIcon(document.fileType)}
                  <div className="flex space-x-1">
                    {document.isFavorite && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                    {document.isConfidential && (
                      <Lock className="h-4 w-4 text-red-500" />
                    )}
                    <StatusBadge 
                      status={document.status} 
                      variant={document.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </div>
                </div>
                
                <h4 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                  {document.name}
                </h4>
                
                <div className="text-sm text-neutral-600 space-y-1">
                  <p>{document.category}</p>
                  <p>{formatFileSize(document.fileSize)}</p>
                  <p>{formatDate(document.uploadDate)}</p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(document);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(document);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(document)}
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(document.fileType)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-neutral-900">{document.name}</h4>
                      {document.isFavorite && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                      {document.isConfidential && (
                        <Lock className="h-4 w-4 text-red-500" />
                      )}
                      <StatusBadge 
                        status={document.status} 
                        variant={document.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <span>{document.category}</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>{formatDate(document.uploadDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(document);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(document);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No documents found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || typeFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'Try adjusting your filters to see more documents.'
                : 'Your documents will appear here once they are uploaded.'
              }
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Document
            </Button>
          </div>
        )}
      </Card>

      {/* Document Details Modal */}
      {showDetails && <DocumentDetailsModal />}
    </div>
  );
};

export default Documents;