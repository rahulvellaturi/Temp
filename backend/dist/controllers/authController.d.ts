import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const authController: {
    register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    me: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    changePassword: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    forgotPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    setupMFA: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    verifyMFA: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=authController.d.ts.map