import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorizeClient, AuthenticatedRequest } from '../middleware/auth';
import { PaymentStatus } from '@prisma/client';

const router = express.Router();

// Validation schemas
const makePaymentSchema = z.object({
  policyId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentMethodToken: z.string().min(1),
});

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.id },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      }
    },
    orderBy: { paymentDate: 'desc' },
  });

  res.json({ payments });
}));

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Make a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMethodToken
 *             properties:
 *               policyId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               paymentMethodToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment processed successfully
 */
router.post('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = makePaymentSchema.parse(req.body);

  // If policyId provided, verify it belongs to user
  if (validatedData.policyId) {
    const policy = await prisma.policy.findFirst({
      where: { 
        id: validatedData.policyId,
        userId: req.user!.id 
      },
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
  }

  // Here you would integrate with a payment gateway (e.g., Stripe)
  // For now, we'll simulate a successful payment
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      policyId: validatedData.policyId,
      amount: validatedData.amount,
      status: PaymentStatus.COMPLETED, // In real implementation, this would be PENDING until gateway confirms
      method: 'Credit Card',
      transactionId,
    },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      }
    }
  });

  res.status(201).json({
    message: 'Payment processed successfully',
    payment,
  });
}));

/**
 * @swagger
 * /api/payments/billing/statements:
 *   get:
 *     summary: Get user's billing statements
 *     tags: [Payments, Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of billing statements
 */
router.get('/billing/statements', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const statements = await prisma.billingStatement.findMany({
    where: { userId: req.user!.id },
    include: {
      policy: {
        select: {
          policyNumber: true,
          policyType: true,
        }
      }
    },
    orderBy: { statementDate: 'desc' },
  });

  res.json({ statements });
}));

export default router;