import express from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, authorizeClient, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const sendMessageSchema = z.object({
  receiverId: z.string().uuid().optional(),
  claimId: z.string().uuid().optional(),
  content: z.string().min(1),
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get user's messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: claimId
 *         schema:
 *           type: string
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { claimId, unreadOnly } = req.query;

  const whereClause: any = {
    OR: [
      { senderId: req.user!.id },
      { receiverId: req.user!.id },
    ],
    isInternal: false, // Clients can't see internal messages
  };

  if (claimId) whereClause.claimId = claimId as string;
  if (unreadOnly === 'true') {
    whereClause.isRead = false;
    whereClause.receiverId = req.user!.id; // Only unread messages received by the user
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        }
      },
      receiver: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        }
      },
      claim: {
        select: {
          claimNumber: true,
        }
      }
    },
    orderBy: { timestamp: 'desc' },
  });

  res.json({ messages });
}));

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *               claimId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = sendMessageSchema.parse(req.body);

  // If claimId provided, verify claim belongs to user
  if (validatedData.claimId) {
    const claim = await prisma.claim.findFirst({
      where: { 
        id: validatedData.claimId,
        userId: req.user!.id 
      },
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
  }

  const message = await prisma.message.create({
    data: {
      senderId: req.user!.id,
      receiverId: validatedData.receiverId,
      claimId: validatedData.claimId,
      content: validatedData.content,
      isInternal: false, // Client messages are never internal
    },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        }
      },
      receiver: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
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
    message: 'Message sent successfully',
    messageData: message,
  });
}));

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark message as read
 *     tags: [Messages]
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
 *         description: Message marked as read
 */
router.put('/:id/read', authenticate, authorizeClient, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Verify user can access this message
  const message = await prisma.message.findFirst({
    where: {
      id: req.params.id,
      OR: [
        { senderId: req.user!.id },
        { receiverId: req.user!.id },
      ],
    },
  });

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Only mark as read if user is the receiver
  if (message.receiverId === req.user!.id) {
    const updatedMessage = await prisma.message.update({
      where: { id: req.params.id },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    });

    res.json({
      message: 'Message marked as read',
      messageData: updatedMessage,
    });
  } else {
    res.json({
      message: 'Message already marked as read or you are not the receiver',
      messageData: message,
    });
  }
}));

export default router;