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
const createClaimSchema = zod_1.z.object({
    policyId: zod_1.z.string().uuid(),
    incidentDate: zod_1.z.string().transform((str) => new Date(str)),
    incidentLocation: zod_1.z.string().min(1),
    description: zod_1.z.string().min(10),
    involvedParties: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        contact: zod_1.z.string().optional(),
        role: zod_1.z.string().optional(),
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
router.get('/', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const claims = await database_1.prisma.claim.findMany({
        where: { userId: req.user.id },
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
router.get('/:id', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const claim = await database_1.prisma.claim.findFirst({
        where: {
            id: req.params.id,
            userId: req.user.id
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
router.post('/', auth_1.authenticate, auth_1.authorizeClient, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = createClaimSchema.parse(req.body);
    // Verify policy belongs to user
    const policy = await database_1.prisma.policy.findFirst({
        where: {
            id: validatedData.policyId,
            userId: req.user.id
        },
    });
    if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
    }
    // Generate claim number
    const claimCount = await database_1.prisma.claim.count();
    const claimNumber = `CLM-${Date.now()}-${(claimCount + 1).toString().padStart(4, '0')}`;
    // Create claim
    const claim = await database_1.prisma.claim.create({
        data: {
            claimNumber,
            policyId: policy.id,
            userId: req.user.id,
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
exports.default = router;
//# sourceMappingURL=claims.js.map