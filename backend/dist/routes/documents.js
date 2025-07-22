"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document and image types
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    },
});
/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user's documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: policyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: claimId
 *         schema:
 *           type: string
 *       - in: query
 *         name: documentType
 *         schema:
 *           type: string
 *           enum: [POLICY_CONTRACT, DECLARATION_PAGE, ENDORSEMENT, BILLING_STATEMENT, CLAIM_SUPPORT, ID_CARD, OTHER]
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { policyId, claimId, documentType } = req.query;
    const whereClause = {
        userId: req.user.id,
    };
    if (policyId)
        whereClause.policyId = policyId;
    if (claimId)
        whereClause.claimId = claimId;
    if (documentType)
        whereClause.documentType = documentType;
    const documents = await database_1.prisma.document.findMany({
        where: whereClause,
        include: {
            policy: {
                select: {
                    policyNumber: true,
                    policyType: true,
                }
            },
            claim: {
                select: {
                    claimNumber: true,
                }
            }
        },
        orderBy: { uploadedAt: 'desc' },
    });
    res.json({ documents });
}));
/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               policyId:
 *                 type: string
 *                 format: uuid
 *               claimId:
 *                 type: string
 *                 format: uuid
 *               documentType:
 *                 type: string
 *                 enum: [POLICY_CONTRACT, DECLARATION_PAGE, ENDORSEMENT, BILLING_STATEMENT, CLAIM_SUPPORT, ID_CARD, OTHER]
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.post('/upload', auth_1.authenticate, auth_1.authorizeClient, upload.single('file'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
    }
    const { policyId, claimId, documentType } = req.body;
    if (!documentType) {
        return res.status(400).json({ error: 'Document type is required' });
    }
    // Verify policy belongs to user if provided
    if (policyId) {
        const policy = await database_1.prisma.policy.findFirst({
            where: {
                id: policyId,
                userId: req.user.id
            },
        });
        if (!policy) {
            return res.status(404).json({ error: 'Policy not found' });
        }
    }
    // Verify claim belongs to user if provided
    if (claimId) {
        const claim = await database_1.prisma.claim.findFirst({
            where: {
                id: claimId,
                userId: req.user.id
            },
        });
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
    }
    try {
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: 'auto',
                folder: 'assureme-documents',
                public_id: `${req.user.id}_${Date.now()}`,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });
        // Save document record
        const document = await database_1.prisma.document.create({
            data: {
                filename: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                url: uploadResult.secure_url,
                userId: req.user.id,
                policyId: policyId || null,
                claimId: claimId || null,
                documentType: documentType,
                uploadedBy: req.user.id,
            },
            include: {
                policy: {
                    select: {
                        policyNumber: true,
                        policyType: true,
                    }
                },
                claim: {
                    select: {
                        claimNumber: true,
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Document uploaded successfully',
            document,
        });
    }
    catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
}));
exports.default = router;
//# sourceMappingURL=documents.js.map