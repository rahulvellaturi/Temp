import { Request, Response, NextFunction } from 'express';
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
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authorize: (allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorizeClient: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorizeAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorizeResourceOwner: (resourceUserIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map