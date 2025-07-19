import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = null;

  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
  
  // Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        const target = error.meta?.target as string[];
        details = `Duplicate value for: ${target?.join(', ') || 'unknown field'}`;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference';
        details = 'Referenced resource does not exist';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Invalid relation';
        details = 'The change you are trying to make would violate a relation constraint';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
        details = process.env.NODE_ENV === 'development' ? error.message : null;
    }
  }
  
  // Custom application errors
  else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Multer errors (file upload)
  else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
    details = 'Maximum file size is 10MB';
  }
  else if (error.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files';
  }
  else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Don't expose sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'Internal Server Error';
      details = null;
    }
  }

  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      timestamp: new Date().toISOString() 
    }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};