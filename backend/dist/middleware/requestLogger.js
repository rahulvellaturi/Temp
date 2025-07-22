"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log request
    console.log(`📨 ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
        console.log(`📤 ${statusColor} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map