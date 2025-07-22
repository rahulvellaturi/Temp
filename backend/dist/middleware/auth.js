"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeResourceOwner = exports.authorizeAdmin = exports.authorizeClient = exports.authorize = exports.authenticate = void 0;
const passport_1 = __importDefault(require("passport"));
const client_1 = require("@prisma/client");
// JWT Authentication Middleware
const authenticate = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Authentication error' });
        }
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Valid JWT token required'
            });
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.authenticate = authenticate;
// Role-based Authorization Middleware
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Client-only access (can only access their own data)
const authorizeClient = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== client_1.UserRole.CLIENT) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Client access only'
        });
    }
    next();
};
exports.authorizeClient = authorizeClient;
// Admin roles access
const authorizeAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const adminRoles = [client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.CLAIMS_ADJUSTER, client_1.UserRole.BILLING_SPECIALIST];
    if (!adminRoles.includes(req.user.role)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }
    next();
};
exports.authorizeAdmin = authorizeAdmin;
// Resource ownership check (for clients accessing their own data)
const authorizeResourceOwner = (resourceUserIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Super admins can access any resource
        if (req.user.role === client_1.UserRole.SUPER_ADMIN) {
            return next();
        }
        // Admins can access any resource (with some restrictions based on specific endpoints)
        const adminRoles = [client_1.UserRole.ADMIN, client_1.UserRole.CLAIMS_ADJUSTER, client_1.UserRole.BILLING_SPECIALIST];
        if (adminRoles.includes(req.user.role)) {
            return next();
        }
        // Clients can only access their own resources
        if (req.user.role === client_1.UserRole.CLIENT) {
            const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
            if (resourceUserId && resourceUserId !== req.user.id) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Can only access your own resources'
                });
            }
        }
        next();
    };
};
exports.authorizeResourceOwner = authorizeResourceOwner;
//# sourceMappingURL=auth.js.map