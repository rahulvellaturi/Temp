"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDeleted = exports.sendUpdated = exports.sendCreated = exports.sendPaginatedResponse = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...data
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, details) => {
    return res.status(statusCode).json({
        success: false,
        error: message,
        ...(details && { details })
    });
};
exports.sendError = sendError;
const sendPaginatedResponse = (res, data, totalCount, page, limit, message) => {
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
exports.sendPaginatedResponse = sendPaginatedResponse;
const sendCreated = (res, data, message = 'Resource created successfully') => {
    return (0, exports.sendSuccess)(res, data, message, 201);
};
exports.sendCreated = sendCreated;
const sendUpdated = (res, data, message = 'Resource updated successfully') => {
    return (0, exports.sendSuccess)(res, data, message);
};
exports.sendUpdated = sendUpdated;
const sendDeleted = (res, message = 'Resource deleted successfully') => {
    return (0, exports.sendSuccess)(res, {}, message);
};
exports.sendDeleted = sendDeleted;
//# sourceMappingURL=responseHelpers.js.map