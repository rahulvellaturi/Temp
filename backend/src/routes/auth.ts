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
import { sendSuccess, sendError, sendCreated } from '../utils/responseHelpers';
import { UserRole, MfaMethod } from '@prisma/client';

const router = express.Router();

// Validation schemas
const schemas = {
  register: z.object({
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
  }),
  
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    mfaToken: z.string().optional(),
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  })
};

// Helper functions
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const excludePassword = (user: any) => {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Routes
router.post('/register', asyncHandler(async (req, res) => {
  const data = schemas.register.parse(req.body);
  
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    return sendError(res, 'User already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    },
  });

  const token = generateToken(user);
  return sendCreated(res, { token, user: excludePassword(user) }, 'User registered successfully');
}));

router.post('/login', asyncHandler(async (req, res) => {
  const data = schemas.login.parse(req.body);

  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) return sendError(res, 'Authentication error', 500);
    if (!user) return sendError(res, info?.message || 'Invalid credentials', 401);

    // MFA check
    if (user.mfa?.isEnabled) {
      if (!data.mfaToken) {
        return sendError(res, 'MFA required', 401, { mfaRequired: true });
      }

      if (user.mfa.method === MfaMethod.AUTHENTICATOR && user.mfa.secret) {
        const isValidMFA = speakeasy.totp.verify({
          secret: user.mfa.secret,
          encoding: 'base32',
          token: data.mfaToken,
          window: 2,
        });
        
        if (!isValidMFA) {
          return sendError(res, 'Invalid MFA token', 401);
        }
      }
    }

    const token = generateToken(user);
    return sendSuccess(res, { token, user }, 'Login successful');
  })(req, res);
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { mfa: true },
  });

  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, { user: excludePassword(user) });
}));

router.put('/change-password', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = schemas.changePassword.parse(req.body);
  
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return sendError(res, 'User not found', 404);

  const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
  if (!isValidPassword) return sendError(res, 'Invalid current password');

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return sendSuccess(res, {}, 'Password changed successfully');
}));

// MFA routes
router.post('/mfa/setup', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const secret = speakeasy.generateSecret({
    name: `${process.env.MFA_SERVICE_NAME || 'AssureMe'} (${req.user!.email})`,
    issuer: process.env.MFA_ISSUER || 'AssureMe Insurance',
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  await prisma.mFA.upsert({
    where: { userId: req.user!.id },
    update: { secret: secret.base32, method: MfaMethod.AUTHENTICATOR, isEnabled: false },
    create: { userId: req.user!.id, secret: secret.base32, method: MfaMethod.AUTHENTICATOR, isEnabled: false },
  });

  return sendSuccess(res, {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32,
  });
}));

router.post('/mfa/verify', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { token } = req.body;
  if (!token) return sendError(res, 'Token is required');

  const mfa = await prisma.mFA.findUnique({ where: { userId: req.user!.id } });
  if (!mfa?.secret) return sendError(res, 'MFA not set up');

  const isValid = speakeasy.totp.verify({
    secret: mfa.secret,
    encoding: 'base32',
    token,
    window: 2,
  });

  if (!isValid) return sendError(res, 'Invalid token');

  await prisma.mFA.update({
    where: { userId: req.user!.id },
    data: { isEnabled: true },
  });

  return sendSuccess(res, {}, 'MFA enabled successfully');
}));

export default router;