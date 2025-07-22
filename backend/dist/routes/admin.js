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
// All admin routes require authentication and admin role
router.use(auth_1.authenticate);
router.use(auth_1.authorizeAdmin);
// Validation schemas
const updateUserStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
const updateUserRoleSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.UserRole),
});
const processChangeRequestSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ChangeRequestStatus),
    adminNotes: zod_1.z.string().optional(),
});
const updateClaimStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ClaimStatus),
    payoutAmount: zod_1.z.number().positive().optional(),
});
const assignAdjusterSchema = zod_1.z.object({
    adjusterId: zod_1.z.string().uuid(),
});
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin, Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of users with pagination
 */
router.get('/users', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (role)
        whereClause.role = role;
    if (isActive !== undefined)
        whereClause.isActive = isActive === 'true';
    const [users, totalCount] = await Promise.all([
        database_1.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.user.count({ where: whereClause }),
    ]);
    res.json({
        users,
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / take),
    });
}));
/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (Admin only)
 *     tags: [Admin, Users]
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.put('/users/:id/status', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = updateUserStatusSchema.parse(req.body);
    const updatedUser = await database_1.prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: validatedData.isActive },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
        },
    });
    // Log audit trail
    await database_1.prisma.auditLog.create({
        data: {
            adminUserId: req.user.id,
            action: 'UPDATE_USER_STATUS',
            targetType: 'User',
            targetId: req.params.id,
            details: { isActive: validatedData.isActive },
        },
    });
    res.json({
        message: 'User status updated successfully',
        user: updatedUser,
    });
}));
/**
 * @swagger
 * /api/admin/policies:
 *   get:
 *     summary: Get all policies (Admin only)
 *     tags: [Admin, Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: policyType
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of policies with pagination
 */
router.get('/policies', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { search, policyType, status, userId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            { policyNumber: { contains: search, mode: 'insensitive' } },
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
    }
    if (policyType)
        whereClause.policyType = policyType;
    if (status)
        whereClause.status = status;
    if (userId)
        whereClause.userId = userId;
    const [policies, totalCount] = await Promise.all([
        database_1.prisma.policy.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.policy.count({ where: whereClause }),
    ]);
    res.json({
        policies,
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / take),
    });
}));
/**
 * @swagger
 * /api/admin/policy-requests:
 *   get:
 *     summary: Get all policy change requests (Admin only)
 *     tags: [Admin, Policies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of policy change requests
 */
router.get('/policy-requests', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const whereClause = {};
    if (status)
        whereClause.status = status;
    const [requests, totalCount] = await Promise.all([
        database_1.prisma.policyChangeRequest.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                policy: {
                    select: {
                        policyNumber: true,
                        policyType: true,
                    }
                }
            },
            skip,
            take,
            orderBy: { submittedAt: 'desc' },
        }),
        database_1.prisma.policyChangeRequest.count({ where: whereClause }),
    ]);
    res.json({
        requests,
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / take),
    });
}));
/**
 * @swagger
 * /api/admin/policy-requests/{id}/status:
 *   put:
 *     summary: Process policy change request (Admin only)
 *     tags: [Admin, Policies]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Change request processed successfully
 */
router.put('/policy-requests/:id/status', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = processChangeRequestSchema.parse(req.body);
    const updatedRequest = await database_1.prisma.policyChangeRequest.update({
        where: { id: req.params.id },
        data: {
            status: validatedData.status,
            adminNotes: validatedData.adminNotes,
            processedAt: new Date(),
            processedBy: req.user.id,
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            },
            policy: true,
        },
    });
    // If approved, apply changes to policy (simplified example)
    if (validatedData.status === client_1.ChangeRequestStatus.APPROVED) {
        // This would contain complex logic to apply the changes
        // For now, we'll just log it
        console.log('Policy change approved, applying changes:', updatedRequest.requestDetails);
    }
    // Log audit trail
    await database_1.prisma.auditLog.create({
        data: {
            adminUserId: req.user.id,
            action: 'PROCESS_POLICY_CHANGE_REQUEST',
            targetType: 'PolicyChangeRequest',
            targetId: req.params.id,
            details: {
                status: validatedData.status,
                adminNotes: validatedData.adminNotes,
            },
        },
    });
    res.json({
        message: 'Change request processed successfully',
        request: updatedRequest,
    });
}));
/**
 * @swagger
 * /api/admin/claims:
 *   get:
 *     summary: Get all claims (Admin only)
 *     tags: [Admin, Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: adjusterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of claims with pagination
 */
router.get('/claims', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { search, status, adjusterId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const whereClause = {};
    if (search) {
        whereClause.OR = [
            { claimNumber: { contains: search, mode: 'insensitive' } },
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName: { contains: search, mode: 'insensitive' } } },
        ];
    }
    if (status)
        whereClause.status = status;
    if (adjusterId)
        whereClause.assignedAdjusterId = adjusterId;
    const [claims, totalCount] = await Promise.all([
        database_1.prisma.claim.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                policy: {
                    select: {
                        policyNumber: true,
                        policyType: true,
                    }
                },
                assignedAdjuster: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            skip,
            take,
            orderBy: { submittedAt: 'desc' },
        }),
        database_1.prisma.claim.count({ where: whereClause }),
    ]);
    res.json({
        claims,
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / take),
    });
}));
/**
 * @swagger
 * /api/admin/claims/{id}/status:
 *   put:
 *     summary: Update claim status (Admin only)
 *     tags: [Admin, Claims]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SUBMITTED, UNDER_REVIEW, ADJUSTER_ASSIGNED, APPROVED, REJECTED, PAID, CLOSED]
 *               payoutAmount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Claim status updated successfully
 */
router.put('/claims/:id/status', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = updateClaimStatusSchema.parse(req.body);
    const updatedClaim = await database_1.prisma.claim.update({
        where: { id: req.params.id },
        data: {
            status: validatedData.status,
            payoutAmount: validatedData.payoutAmount,
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            },
            policy: {
                select: {
                    policyNumber: true,
                    policyType: true,
                }
            }
        }
    });
    // Log audit trail
    await database_1.prisma.auditLog.create({
        data: {
            adminUserId: req.user.id,
            action: 'UPDATE_CLAIM_STATUS',
            targetType: 'Claim',
            targetId: req.params.id,
            details: {
                status: validatedData.status,
                payoutAmount: validatedData.payoutAmount,
            },
        },
    });
    res.json({
        message: 'Claim status updated successfully',
        claim: updatedClaim,
    });
}));
/**
 * @swagger
 * /api/admin/claims/{id}/assign-adjuster:
 *   put:
 *     summary: Assign adjuster to claim (Admin only)
 *     tags: [Admin, Claims]
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
 *               - adjusterId
 *             properties:
 *               adjusterId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Adjuster assigned successfully
 */
router.put('/claims/:id/assign-adjuster', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validatedData = assignAdjusterSchema.parse(req.body);
    // Verify adjuster exists and has appropriate role
    const adjuster = await database_1.prisma.user.findFirst({
        where: {
            id: validatedData.adjusterId,
            role: { in: [client_1.UserRole.CLAIMS_ADJUSTER, client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN] },
            isActive: true,
        },
    });
    if (!adjuster) {
        return res.status(404).json({ error: 'Adjuster not found or invalid role' });
    }
    const updatedClaim = await database_1.prisma.claim.update({
        where: { id: req.params.id },
        data: {
            assignedAdjusterId: validatedData.adjusterId,
            status: client_1.ClaimStatus.ADJUSTER_ASSIGNED,
        },
        include: {
            assignedAdjuster: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        }
    });
    // Log audit trail
    await database_1.prisma.auditLog.create({
        data: {
            adminUserId: req.user.id,
            action: 'ASSIGN_CLAIM_ADJUSTER',
            targetType: 'Claim',
            targetId: req.params.id,
            details: { adjusterId: validatedData.adjusterId },
        },
    });
    res.json({
        message: 'Adjuster assigned successfully',
        claim: updatedClaim,
    });
}));
exports.default = router;
//# sourceMappingURL=admin.js.map