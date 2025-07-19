import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorizeClient, AuthenticatedRequest } from '../middleware/auth';
import { DocumentType } from '@prisma/client';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
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
router.get('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { policyId, claimId, documentType } = req.query;

  const whereClause: any = {
    userId: req.user!.id,
  };

  if (policyId) whereClause.policyId = policyId as string;
  if (claimId) whereClause.claimId = claimId as string;
  if (documentType) whereClause.documentType = documentType as DocumentType;

  const documents = await prisma.document.findMany({
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
router.post('/upload', authenticate, authorizeClient, upload.single('file'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const { policyId, claimId, documentType } = req.body;

  if (!documentType) {
    return res.status(400).json({ error: 'Document type is required' });
  }

  // Verify policy belongs to user if provided
  if (policyId) {
    const policy = await prisma.policy.findFirst({
      where: { 
        id: policyId,
        userId: req.user!.id 
      },
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
  }

  // Verify claim belongs to user if provided
  if (claimId) {
    const claim = await prisma.claim.findFirst({
      where: { 
        id: claimId,
        userId: req.user!.id 
      },
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
  }

  try {
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'assureme-documents',
          public_id: `${req.user!.id}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file!.buffer);
    }) as any;

    // Save document record
    const document = await prisma.document.create({
      data: {
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        url: uploadResult.secure_url,
        userId: req.user!.id,
        policyId: policyId || null,
        claimId: claimId || null,
        documentType: documentType as DocumentType,
        uploadedBy: req.user!.id,
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
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}));

export default router;