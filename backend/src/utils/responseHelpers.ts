import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

export const sendError = (res: Response, message: string, statusCode = 400, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details })
  });
};

export const sendPaginatedResponse = (
  res: Response, 
  data: any[], 
  totalCount: number, 
  page: number, 
  limit: number,
  message?: string
) => {
  return res.json({
    success: true,
    message,
    data,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1
  });
};

export const sendCreated = (res: Response, data: any, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendUpdated = (res: Response, data: any, message = 'Resource updated successfully') => {
  return sendSuccess(res, data, message);
};

export const sendDeleted = (res: Response, message = 'Resource deleted successfully') => {
  return sendSuccess(res, {}, message);
};