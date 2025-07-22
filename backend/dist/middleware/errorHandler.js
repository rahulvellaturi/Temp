"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;
    // Log error for debugging
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    // Zod validation errors
    if (error instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }
    // Prisma errors
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                statusCode = 409;
                message = 'Resource already exists';
                const target = error.meta?.target;
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
exports.errorHandler = errorHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map