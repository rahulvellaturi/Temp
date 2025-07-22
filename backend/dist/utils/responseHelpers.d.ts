import { Response } from 'express';
export declare const sendSuccess: (res: Response, data: any, message?: string, statusCode?: number) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, message: string, statusCode?: number, details?: any) => Response<any, Record<string, any>>;
export declare const sendPaginatedResponse: (res: Response, data: any[], totalCount: number, page: number, limit: number, message?: string) => Response<any, Record<string, any>>;
export declare const sendCreated: (res: Response, data: any, message?: string) => Response<any, Record<string, any>>;
export declare const sendUpdated: (res: Response, data: any, message?: string) => Response<any, Record<string, any>>;
export declare const sendDeleted: (res: Response, message?: string) => Response<any, Record<string, any>>;
//# sourceMappingURL=responseHelpers.d.ts.map