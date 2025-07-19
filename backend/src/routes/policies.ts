import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorizeClient, AuthenticatedRequest } from '../middleware/auth';
import { ChangeRequestStatus } from '@prisma/client';

const router = express.Router();

// Validation schemas
const policyChangeRequestSchema = z.object({
  requestType: z.string().min(1),
  requestDetails: z.record(z.any()),
});

/**
 * @swagger
 * /api/policies:
 *   get:
 *     summary: Get all policies for authenticated user
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user policies
 */
router.get('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const policies = await prisma.policy.findMany({
    where: { userId: req.user!.id },
    include: {
      documents: true,
    },
  });

  res.json({ policies });
}));

/**
 * @swagger
 * /api/policies/{id}:
 *   get:
 *     summary: Get single policy details
 *     tags: [Policies]
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
 *         description: Policy details
 *       404:
 *         description: Policy not found
 */
router.get('/:id', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const policy = await prisma.policy.findFirst({
    where: { 
      id: req.params.id,
      userId: req.user!.id 
    },
    include: {
      documents: true,
      claims: true,
      payments: true,
      changeRequests: {
        orderBy: { submittedAt: 'desc' }
      }
    },
  });

  if (!policy) {
    return res.status(404).json({ error: 'Policy not found' });
  }

  res.json({ policy });
}));

/**
 * @swagger
 * /api/policies/{id}/change-request:
 *   post:
 *     summary: Submit policy change request
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestType
 *               - requestDetails
 *             properties:
 *               requestType:
 *                 type: string
 *               requestDetails:
 *                 type: object
 *     responses:
 *       201:
 *         description: Change request submitted
 */
router.post('/:id/change-request', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = policyChangeRequestSchema.parse(req.body);

  // Verify policy belongs to user
  const policy = await prisma.policy.findFirst({
    where: { 
      id: req.params.id,
      userId: req.user!.id 
    },
  });

  if (!policy) {
    return res.status(404).json({ error: 'Policy not found' });
  }

  const changeRequest = await prisma.policyChangeRequest.create({
    data: {
      policyId: policy.id,
      userId: req.user!.id,
      requestType: validatedData.requestType,
      requestDetails: validatedData.requestDetails,
    },
  });

  res.status(201).json({
    message: 'Change request submitted successfully',
    requestId: changeRequest.id,
  });
}));

/**
 * @swagger
 * /api/policies/requests:
 *   get:
 *     summary: Get user's policy change requests
 *     tags: [Policies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of change requests
 */
router.get('/requests', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const requests = await prisma.policyChangeRequest.findMany({
    where: { userId: req.user!.id },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      }
    },
    orderBy: { submittedAt: 'desc' },
  });

  res.json({ requests });
}));

export default router;