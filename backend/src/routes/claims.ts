import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorizeClient, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createClaimSchema = z.object({
  policyId: z.string().uuid(),
  incidentDate: z.string().transform((str) => new Date(str)),
  incidentLocation: z.string().min(1),
  description: z.string().min(10),
  involvedParties: z.array(z.object({
    name: z.string().min(1),
    contact: z.string().optional(),
    role: z.string().optional(),
  })).optional(),
});

/**
 * @swagger
 * /api/claims:
 *   get:
 *     summary: Get all claims for authenticated user
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user claims
 */
router.get('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const claims = await prisma.claim.findMany({
    where: { userId: req.user!.id },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      },
      documents: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  res.json({ claims });
}));

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Get single claim details
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim details
 *       404:
 *         description: Claim not found
 */
router.get('/:id', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const claim = await prisma.claim.findFirst({
    where: { 
      id: req.params.id,
      userId: req.user!.id 
    },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      },
      documents: true,
      messages: {
        where: { isInternal: false },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            }
          }
        },
        orderBy: { timestamp: 'asc' },
      },
      involvedParties: true,
      assignedAdjuster: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        }
      }
    },
  });

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  res.json({ claim });
}));

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Submit new claim
 *     tags: [Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - policyId
 *               - incidentDate
 *               - incidentLocation
 *               - description
 *             properties:
 *               policyId:
 *                 type: string
 *                 format: uuid
 *               incidentDate:
 *                 type: string
 *                 format: date-time
 *               incidentLocation:
 *                 type: string
 *               description:
 *                 type: string
 *               involvedParties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     contact:
 *                       type: string
 *                     role:
 *                       type: string
 *     responses:
 *       201:
 *         description: Claim submitted successfully
 */
router.post('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = createClaimSchema.parse(req.body);

  // Verify policy belongs to user
  const policy = await prisma.policy.findFirst({
    where: { 
      id: validatedData.policyId,
      userId: req.user!.id 
    },
  });

  if (!policy) {
    return res.status(404).json({ error: 'Policy not found' });
  }

  // Generate claim number
  const claimCount = await prisma.claim.count();
  const claimNumber = `CLM-${Date.now()}-${(claimCount + 1).toString().padStart(4, '0')}`;

  // Create claim
  const claim = await prisma.claim.create({
    data: {
      claimNumber,
      policyId: policy.id,
      userId: req.user!.id,
      incidentDate: validatedData.incidentDate,
      incidentLocation: validatedData.incidentLocation,
      description: validatedData.description,
      involvedParties: validatedData.involvedParties ? {
        create: validatedData.involvedParties
      } : undefined,
    },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      },
      involvedParties: true,
    }
  });

  res.status(201).json({
    message: 'Claim submitted successfully',
    claim,
  });
}));

export default router;