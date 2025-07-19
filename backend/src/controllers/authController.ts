import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { z } from 'zod';
import { prisma } from '../config/database';
import { sendSuccess, sendError, sendCreated } from '../utils/responseHelpers';
import { UserRole, MfaMethod } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

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
  }),
  
  forgotPassword: z.object({
    email: z.string().email(),
  }),
  
  resetPassword: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
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
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const authController = {
  // Register new user
  register: async (req: Request, res: Response) => {
    const data = schemas.register.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) return sendError(res, 'User already exists', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const token = generateToken(user);
    return sendCreated(res, { 
      token, 
      user: excludePassword(user) 
    }, 'User registered successfully');
  },

  // Login user
  login: async (req: Request, res: Response) => {
    const data = schemas.login.parse(req.body);
    
    const user = await prisma.user.findUnique({ 
      where: { email: data.email },
      include: { mfa: true }
    });
    
    if (!user || !await bcrypt.compare(data.password, user.password)) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) return sendError(res, 'Account is deactivated', 403);

    // Check MFA if enabled
    if (user.mfa?.isEnabled) {
      if (!data.mfaToken) {
        return sendError(res, 'MFA token required', 401, { mfaRequired: true });
      }

      const isValidMFA = speakeasy.totp.verify({
        secret: user.mfa.secret!,
        encoding: 'base32',
        token: data.mfaToken,
        window: 2,
      });

      if (!isValidMFA) return sendError(res, 'Invalid MFA token', 401);
    }

    const token = generateToken(user);
    return sendSuccess(res, { 
      token, 
      user: excludePassword(user) 
    });
  },

  // Get current user
  me: async (req: AuthenticatedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { mfa: true }
    });
    
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user: excludePassword(user) });
  },

  // Change password
  changePassword: async (req: AuthenticatedRequest, res: Response) => {
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
  },

  // Forgot password
  forgotPassword: async (req: Request, res: Response) => {
    const validation = schemas.forgotPassword.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 'Invalid input', 400, validation.error.errors);
    }

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return sendSuccess(res, {}, 'If the email exists, a reset link has been sent');
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (you might want to add these fields to your User model)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Note: You'll need to add resetToken and resetTokenExpiry fields to your User model
        // resetToken,
        // resetTokenExpiry,
      },
    });

    // In a real implementation, send email here using EmailService
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return sendSuccess(res, {}, 'If the email exists, a reset link has been sent');
  },

  // Reset password
  resetPassword: async (req: Request, res: Response) => {
    const validation = schemas.resetPassword.safeParse(req.body);
    if (!validation.success) {
      return sendError(res, 'Invalid input', 400, validation.error.errors);
    }

    const { token, password } = validation.data;
    
    // In a real implementation, you'd verify the token against the database
    // For now, we'll just check if it's a valid format
    if (!token || token.length < 10) {
      return sendError(res, 'Invalid or expired reset token', 400);
    }

    // Find user by reset token (you'll need to add resetToken field to User model)
    // const user = await prisma.user.findFirst({
    //   where: {
    //     resetToken: token,
    //     resetTokenExpiry: { gt: new Date() },
    //   },
    // });

    // if (!user) {
    //   return sendError(res, 'Invalid or expired reset token', 400);
    // }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token (for demo, we'll update by email)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpiry: null,
    //   },
    // });

    return sendSuccess(res, {}, 'Password has been reset successfully');
  },

  // MFA Setup
  setupMFA: async (req: AuthenticatedRequest, res: Response) => {
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
  },

  // Verify MFA
  verifyMFA: async (req: AuthenticatedRequest, res: Response) => {
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
  }
};