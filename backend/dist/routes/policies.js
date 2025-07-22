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
const router = express_1.default.Router();
// Validation schemas
const policyChangeRequestSchema = zod_1.z.object({
    requestType: zod_1.z.string().min(1),
    requestDetails: zod_1.z.record(zod_1.z.any()),
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
router.get('/', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const policies = await database_1.prisma.policy.findMany({
        where: { userId: req.user.id },
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
router.get('/:id', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const policy = await database_1.prisma.policy.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id
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
router.post('/:id/change-request', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = policyChangeRequestSchema.parse(req.body);
    // Verify policy belongs to user
    const policy = await database_1.prisma.policy.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id
        },
    });
    if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
    }
    const changeRequest = await database_1.prisma.policyChangeRequest.create({
        data: {
            policyId: policy.id,
            userId: req.user.id,
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
router.get('/requests', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const requests = await database_1.prisma.policyChangeRequest.findMany({
        where: { userId: req.user.id },
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
exports.default = router;
//# sourceMappingURL=policies.js.map