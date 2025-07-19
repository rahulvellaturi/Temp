import { Request } from 'express';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
}

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  
  return {
    skip,
    take: limit,
    page
  };
};

export const buildSearchFilter = (search: string, fields: string[]) => {
  if (!search) return {};
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const
      }
    }))
  };
};

export const buildWhereClause = (filters: Record<string, any>) => {
  const whereClause: Record<string, any> = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      whereClause[key] = value;
    }
  });
  
  return whereClause;
};

export const parseQueryFilters = (req: Request, allowedFilters: string[]) => {
  const filters: Record<string, any> = {};
  
  allowedFilters.forEach(filter => {
    if (req.query[filter]) {
      filters[filter] = req.query[filter];
    }
  });
  
  return filters;
};