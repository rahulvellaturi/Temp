import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = updateProfileSchema.parse(req.body);

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: validatedData,
  });

  const { password: _, ...userWithoutPassword } = updatedUser;

  res.json({
    message: 'Profile updated successfully',
    user: userWithoutPassword,
  });
}));

export default router;