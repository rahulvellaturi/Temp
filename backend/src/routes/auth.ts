import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { z } from 'zod';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { UserRole, MfaMethod } from '@prisma/client';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.CLIENT),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfaToken: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
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
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      ...validatedData,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
    },
  });

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: userWithoutPassword,
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               mfaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or MFA required
 */
router.post('/login', asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    // Check if MFA is enabled
    if (user.mfa?.isEnabled) {
      if (!validatedData.mfaToken) {
        return res.status(401).json({ 
          error: 'MFA required',
          mfaRequired: true 
        });
      }

      // Verify MFA token
      let isValidMFA = false;
      
      if (user.mfa.method === MfaMethod.AUTHENTICATOR && user.mfa.secret) {
        isValidMFA = speakeasy.totp.verify({
          secret: user.mfa.secret,
          encoding: 'base32',
          token: validatedData.mfaToken,
          window: 2,
        });
      }
      // Add SMS MFA verification here if needed

      if (!isValidMFA) {
        return res.status(401).json({ error: 'Invalid MFA token' });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user,
    });
  })(req, res);
}));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { mfa: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
}));

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
router.put('/change-password', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const validatedData = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(validatedData.currentPassword, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Invalid current password' });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password changed successfully' });
}));

/**
 * @swagger
 * /api/auth/mfa/setup:
 *   post:
 *     summary: Setup MFA for user
 *     tags: [Authentication, MFA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: MFA setup data
 */
router.post('/mfa/setup', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const secret = speakeasy.generateSecret({
    name: `${process.env.MFA_SERVICE_NAME || 'AssureMe'} (${req.user!.email})`,
    issuer: process.env.MFA_ISSUER || 'AssureMe Insurance',
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // Save secret temporarily (not enabled until verified)
  await prisma.mFA.upsert({
    where: { userId: req.user!.id },
    update: {
      secret: secret.base32,
      method: MfaMethod.AUTHENTICATOR,
      isEnabled: false,
    },
    create: {
      userId: req.user!.id,
      secret: secret.base32,
      method: MfaMethod.AUTHENTICATOR,
      isEnabled: false,
    },
  });

  res.json({
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32,
  });
}));

/**
 * @swagger
 * /api/auth/mfa/verify:
 *   post:
 *     summary: Verify and enable MFA
 *     tags: [Authentication, MFA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: MFA enabled successfully
 *       400:
 *         description: Invalid token
 */
router.post('/mfa/verify', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const mfa = await prisma.mFA.findUnique({
    where: { userId: req.user!.id },
  });

  if (!mfa || !mfa.secret) {
    return res.status(400).json({ error: 'MFA not set up' });
  }

  // Verify token
  const isValid = speakeasy.totp.verify({
    secret: mfa.secret,
    encoding: 'base32',
    token,
    window: 2,
  });

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  // Enable MFA
  await prisma.mFA.update({
    where: { userId: req.user!.id },
    data: { isEnabled: true },
  });

  res.json({ message: 'MFA enabled successfully' });
}));

/**
 * @swagger
 * /api/auth/mfa/disable:
 *   post:
 *     summary: Disable MFA
 *     tags: [Authentication, MFA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: MFA disabled successfully
 *       400:
 *         description: Invalid password
 */
router.post('/mfa/disable', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  // Disable MFA
  await prisma.mFA.update({
    where: { userId: req.user!.id },
    data: { isEnabled: false },
  });

  res.json({ message: 'MFA disabled successfully' });
}));

export default router;