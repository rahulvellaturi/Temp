import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorizeAdmin, AuthenticatedRequest } from '../middleware/auth';
import { UserRole, ClaimStatus, ChangeRequestStatus } from '@prisma/client';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

// Validation schemas
const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

const processChangeRequestSchema = z.object({
  status: z.nativeEnum(ChangeRequestStatus),
  adminNotes: z.string().optional(),
});

const updateClaimStatusSchema = z.object({
  status: z.nativeEnum(ClaimStatus),
  payoutAmount: z.number().positive().optional(),
});

const assignAdjusterSchema = z.object({
  adjusterId: z.string().uuid(),
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
router.get('/users', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, role, isActive, page = 1, limit = 20 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (role) whereClause.role = role;
  if (isActive !== undefined) whereClause.isActive = isActive === 'true';

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
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
    prisma.user.count({ where: whereClause }),
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
router.put('/users/:id/status', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = updateUserStatusSchema.parse(req.body);

  const updatedUser = await prisma.user.update({
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
  await prisma.auditLog.create({
    data: {
      adminUserId: req.user!.id,
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
router.get('/policies', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, policyType, status, userId, page = 1, limit = 20 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { policyNumber: { contains: search as string, mode: 'insensitive' } },
      { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
      { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
      { user: { email: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  if (policyType) whereClause.policyType = policyType;
  if (status) whereClause.status = status;
  if (userId) whereClause.userId = userId;

  const [policies, totalCount] = await Promise.all([
    prisma.policy.findMany({
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
    prisma.policy.count({ where: whereClause }),
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
router.get('/policy-requests', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereClause: any = {};
  if (status) whereClause.status = status;

  const [requests, totalCount] = await Promise.all([
    prisma.policyChangeRequest.findMany({
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
    prisma.policyChangeRequest.count({ where: whereClause }),
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
router.put('/policy-requests/:id/status', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = processChangeRequestSchema.parse(req.body);

  const updatedRequest = await prisma.policyChangeRequest.update({
    where: { id: req.params.id },
    data: {
      status: validatedData.status,
      adminNotes: validatedData.adminNotes,
      processedAt: new Date(),
      processedBy: req.user!.id,
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
  if (validatedData.status === ChangeRequestStatus.APPROVED) {
    // This would contain complex logic to apply the changes
    // For now, we'll just log it
    console.log('Policy change approved, applying changes:', updatedRequest.requestDetails);
  }

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      adminUserId: req.user!.id,
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
router.get('/claims', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, status, adjusterId, page = 1, limit = 20 } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { claimNumber: { contains: search as string, mode: 'insensitive' } },
      { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
      { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  if (status) whereClause.status = status;
  if (adjusterId) whereClause.assignedAdjusterId = adjusterId;

  const [claims, totalCount] = await Promise.all([
    prisma.claim.findMany({
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
    prisma.claim.count({ where: whereClause }),
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
router.put('/claims/:id/status', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = updateClaimStatusSchema.parse(req.body);

  const updatedClaim = await prisma.claim.update({
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
  await prisma.auditLog.create({
    data: {
      adminUserId: req.user!.id,
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
router.put('/claims/:id/assign-adjuster', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = assignAdjusterSchema.parse(req.body);

  // Verify adjuster exists and has appropriate role
  const adjuster = await prisma.user.findFirst({
    where: {
      id: validatedData.adjusterId,
      role: { in: [UserRole.CLAIMS_ADJUSTER, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
      isActive: true,
    },
  });

  if (!adjuster) {
    return res.status(404).json({ error: 'Adjuster not found or invalid role' });
  }

  const updatedClaim = await prisma.claim.update({
    where: { id: req.params.id },
    data: {
      assignedAdjusterId: validatedData.adjusterId,
      status: ClaimStatus.ADJUSTER_ASSIGNED,
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
  await prisma.auditLog.create({
    data: {
      adminUserId: req.user!.id,
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

export default router;