import { Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import { UserRole } from '@prisma/client';

export type AuthenticatedRequest = Request & {
  user: Express.User;
};

// JWT Authentication Middleware
export const authenticate: RequestHandler = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: Express.User | false, info: any) => {
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

// Role-based Authorization Middleware
export const authorize = (allowedRoles: UserRole[]): RequestHandler => {
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

// Client-only access (can only access their own data)
export const authorizeClient: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== UserRole.CLIENT) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Client access only' 
    });
  }

  next();
};

// Admin roles access
export const authorizeAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const adminRoles: UserRole[] = [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.CLAIMS_ADJUSTER,
    UserRole.BILLING_SPECIALIST,
  ];
  
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Admin access required' 
    });
  }

  next();
};

// Resource ownership check (for clients accessing their own data)
export const authorizeResourceOwner = (resourceUserIdParam: string = 'userId'): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admins can access any resource
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Admins can access any resource (with some restrictions based on specific endpoints)
    const adminRoles: UserRole[] = [
      UserRole.ADMIN,
      UserRole.CLAIMS_ADJUSTER,
      UserRole.BILLING_SPECIALIST,
    ];
    if (adminRoles.includes(req.user.role)) {
      return next();
    }

    // Clients can only access their own resources
    if (req.user.role === UserRole.CLIENT) {
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
