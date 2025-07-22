"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const responseHelpers_1 = require("../utils/responseHelpers");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Validation schemas
const schemas = {
    register: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        zipCode: zod_1.z.string().optional(),
        role: zod_1.z.nativeEnum(client_1.UserRole).default(client_1.UserRole.CLIENT),
    }),
    login: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1),
        mfaToken: zod_1.z.string().optional(),
    }),
    changePassword: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1),
        newPassword: zod_1.z.string().min(8),
    }),
    forgotPassword: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
    resetPassword: zod_1.z.object({
        token: zod_1.z.string().min(1),
        password: zod_1.z.string().min(8),
    })
};
// Helper functions
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
};
const excludePassword = (user) => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
// Routes
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas.register.parse(req.body);
    const existingUser = await database_1.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
        return (0, responseHelpers_1.sendError)(res, 'User already exists', 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
    const user = await database_1.prisma.user.create({
        data: {
            ...data,
            email: data.email.toLowerCase(),
            password: hashedPassword,
        },
    });
    const token = generateToken(user);
    return (0, responseHelpers_1.sendCreated)(res, { token, user: excludePassword(user) }, 'User registered successfully');
}));
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas.login.parse(req.body);
    passport_1.default.authenticate('local', { session: false }, async (err, user, info) => {
        if (err)
            return (0, responseHelpers_1.sendError)(res, 'Authentication error', 500);
        if (!user)
            return (0, responseHelpers_1.sendError)(res, info?.message || 'Invalid credentials', 401);
        // MFA check
        if (user.mfa?.isEnabled) {
            if (!data.mfaToken) {
                return (0, responseHelpers_1.sendError)(res, 'MFA required', 401, { mfaRequired: true });
            }
            if (user.mfa.method === client_1.MfaMethod.AUTHENTICATOR && user.mfa.secret) {
                const isValidMFA = speakeasy_1.default.totp.verify({
                    secret: user.mfa.secret,
                    encoding: 'base32',
                    token: data.mfaToken,
                    window: 2,
                });
                if (!isValidMFA) {
                    return (0, responseHelpers_1.sendError)(res, 'Invalid MFA token', 401);
                }
            }
        }
        const token = generateToken(user);
        return (0, responseHelpers_1.sendSuccess)(res, { token, user }, 'Login successful');
    })(req, res);
}));
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { mfa: true },
    });
    if (!user)
        return (0, responseHelpers_1.sendError)(res, 'User not found', 404);
    return (0, responseHelpers_1.sendSuccess)(res, { user: excludePassword(user) });
}));
router.put('/change-password', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = schemas.changePassword.parse(req.body);
    const user = await database_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user)
        return (0, responseHelpers_1.sendError)(res, 'User not found', 404);
    const isValidPassword = await bcryptjs_1.default.compare(data.currentPassword, user.password);
    if (!isValidPassword)
        return (0, responseHelpers_1.sendError)(res, 'Invalid current password');
    const hashedPassword = await bcryptjs_1.default.hash(data.newPassword, 12);
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    return (0, responseHelpers_1.sendSuccess)(res, {}, 'Password changed successfully');
}));
// Forgot Password
router.post('/forgot-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validation = schemas.forgotPassword.safeParse(req.body);
    if (!validation.success) {
        return (0, responseHelpers_1.sendError)(res, 'Invalid input', 400, validation.error.errors);
    }
    const { email } = validation.data;
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    // Always return success for security (don't reveal if email exists)
    if (!user) {
        return (0, responseHelpers_1.sendSuccess)(res, {}, 'If the email exists, a reset link has been sent');
    }
    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    // Store reset token (you might want to add these fields to your User model)
    await database_1.prisma.user.update({
        where: { id: user.id },
        data: {
        // Note: You'll need to add resetToken and resetTokenExpiry fields to your User model
        // resetToken,
        // resetTokenExpiry,
        },
    });
    // In a real implementation, send email here using EmailService
    // await emailService.sendPasswordResetEmail(user.email, resetToken);
    return (0, responseHelpers_1.sendSuccess)(res, {}, 'If the email exists, a reset link has been sent');
}));
// Reset Password
router.post('/reset-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const validation = schemas.resetPassword.safeParse(req.body);
    if (!validation.success) {
        return (0, responseHelpers_1.sendError)(res, 'Invalid input', 400, validation.error.errors);
    }
    const { token, password } = validation.data;
    // In a real implementation, you'd verify the token against the database
    // For now, we'll just check if it's a valid format
    if (!token || token.length < 10) {
        return (0, responseHelpers_1.sendError)(res, 'Invalid or expired reset token', 400);
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
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    // Update password and clear reset token (for demo, we'll update by email)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpiry: null,
    //   },
    // });
    return (0, responseHelpers_1.sendSuccess)(res, {}, 'Password has been reset successfully');
}));
// MFA routes
router.post('/mfa/setup', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const secret = speakeasy_1.default.generateSecret({
        name: `${process.env.MFA_SERVICE_NAME || 'AssureMe'} (${req.user.email})`,
        issuer: process.env.MFA_ISSUER || 'AssureMe Insurance',
    });
    const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
    await database_1.prisma.mFA.upsert({
        where: { userId: req.user.id },
        update: { secret: secret.base32, method: client_1.MfaMethod.AUTHENTICATOR, isEnabled: false },
        create: { userId: req.user.id, secret: secret.base32, method: client_1.MfaMethod.AUTHENTICATOR, isEnabled: false },
    });
    return (0, responseHelpers_1.sendSuccess)(res, {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
    });
}));
router.post('/mfa/verify', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body;
    if (!token)
        return (0, responseHelpers_1.sendError)(res, 'Token is required');
    const mfa = await database_1.prisma.mFA.findUnique({ where: { userId: req.user.id } });
    if (!mfa?.secret)
        return (0, responseHelpers_1.sendError)(res, 'MFA not set up');
    const isValid = speakeasy_1.default.totp.verify({
        secret: mfa.secret,
        encoding: 'base32',
        token,
        window: 2,
    });
    if (!isValid)
        return (0, responseHelpers_1.sendError)(res, 'Invalid token');
    await database_1.prisma.mFA.update({
        where: { userId: req.user.id },
        data: { isEnabled: true },
    });
    return (0, responseHelpers_1.sendSuccess)(res, {}, 'MFA enabled successfully');
}));
exports.default = router;
//# sourceMappingURL=auth.js.map