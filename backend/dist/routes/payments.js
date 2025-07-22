"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Validation schemas
const makePaymentSchema = zod_1.z.object({
    policyId: zod_1.z.string().uuid().optional(),
    amount: zod_1.z.number().positive(),
    paymentMethodToken: zod_1.z.string().min(1),
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
router.get('/', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const payments = await database_1.prisma.payment.findMany({
        where: { userId: req.user.id },
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
router.post('/', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = makePaymentSchema.parse(req.body);
    // If policyId provided, verify it belongs to user
    if (validatedData.policyId) {
        const policy = await database_1.prisma.policy.findFirst({
            where: {
                id: validatedData.policyId,
                userId: req.user.id
            },
        });
        if (!policy) {
            return res.status(404).json({ error: 'Policy not found' });
        }
    }
    // Here you would integrate with a payment gateway (e.g., Stripe)
    // For now, we'll simulate a successful payment
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = await database_1.prisma.payment.create({
        data: {
            userId: req.user.id,
            policyId: validatedData.policyId,
            amount: validatedData.amount,
            status: client_1.PaymentStatus.COMPLETED, // In real implementation, this would be PENDING until gateway confirms
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
router.get('/billing/statements', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const statements = await database_1.prisma.billingStatement.findMany({
        where: { userId: req.user.id },
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
exports.default = router;
//# sourceMappingURL=payments.js.map