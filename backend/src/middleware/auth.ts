import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  };
}

// JWT Authentication Middleware
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
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
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
export const authorizeClient = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CLAIMS_ADJUSTER, UserRole.BILLING_SPECIALIST];
  
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Admin access required' 
    });
  }

  next();
};

// Resource ownership check (for clients accessing their own data)
export const authorizeResourceOwner = (resourceUserIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admins can access any resource
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Admins can access any resource (with some restrictions based on specific endpoints)
    const adminRoles = [UserRole.ADMIN, UserRole.CLAIMS_ADJUSTER, UserRole.BILLING_SPECIALIST];
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