import { Request } from 'express';
export interface PaginationParams {
    skip: number;
    take: number;
    page: number;
}
export declare const getPaginationParams: (req: Request) => PaginationParams;
export declare const buildSearchFilter: (search: string, fields: string[]) => {
    OR?: undefined;
} | {
    OR: {
        [x: string]: {
            contains: string;
            mode: "insensitive";
        };
    }[];
};
export declare const buildWhereClause: (filters: Record<string, any>) => Record<string, any>;
export declare const parseQueryFilters: (req: Request, allowedFilters: string[]) => Record<string, any>;
//# sourceMappingURL=queryHelpers.d.ts.map