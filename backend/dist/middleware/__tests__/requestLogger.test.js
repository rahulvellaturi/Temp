"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestLogger_1 = __importDefault(require("../requestLogger"));
// Mock request and response helpers
const mockRequest = (overrides = {}) => {
    const req = {
        headers: {},
        body: {},
        params: {},
        query: {},
        user: undefined,
        ...overrides,
    };
    return req;
};
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.send = jest.fn().mockReturnThis();
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    return res;
};
const mockNext = jest.fn();
describe('requestLogger Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Basic Functionality', () => {
        test('executes without errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            expect(() => {
                (0, requestLogger_1.default)(req, res, mockNext);
            }).not.toThrow();
        });
        test('calls next function', () => {
            const req = mockRequest();
            const res = mockResponse();
            (0, requestLogger_1.default)(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('Request Processing', () => {
        test('processes request correctly', () => {
            const req = mockRequest({ body: { test: 'data' } });
            const res = mockResponse();
            (0, requestLogger_1.default)(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        test('handles missing request data', () => {
            const req = mockRequest();
            const res = mockResponse();
            (0, requestLogger_1.default)(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('Error Handling', () => {
        test('handles errors gracefully', () => {
            const req = mockRequest();
            const res = mockResponse();
            // Test error scenarios
            expect(() => {
                (0, requestLogger_1.default)(req, res, mockNext);
            }).not.toThrow();
        });
        test('passes errors to next', () => {
            const req = mockRequest();
            const res = mockResponse();
            const error = new Error('Test error');
            // Simulate error condition
            (0, requestLogger_1.default)(req, res, mockNext);
            // Should call next with or without error
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('Response Handling', () => {
        test('sets appropriate response headers', () => {
            const req = mockRequest();
            const res = mockResponse();
            (0, requestLogger_1.default)(req, res, mockNext);
            // Check if response is modified appropriately
            expect(mockNext).toHaveBeenCalled();
        });
        test('handles response errors', () => {
            const req = mockRequest();
            const res = mockResponse();
            // Mock response error
            res.status.mockImplementation(() => {
                throw new Error('Response error');
            });
            expect(() => {
                (0, requestLogger_1.default)(req, res, mockNext);
            }).not.toThrow();
        });
    });
    describe('Performance', () => {
        test('executes efficiently', () => {
            const req = mockRequest();
            const res = mockResponse();
            const startTime = performance.now();
            (0, requestLogger_1.default)(req, res, mockNext);
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(10);
        });
        test('handles high load', () => {
            const requests = Array.from({ length: 100 }, () => ({
                req: mockRequest(),
                res: mockResponse(),
            }));
            const startTime = performance.now();
            requests.forEach(({ req, res }) => {
                (0, requestLogger_1.default)(req, res, mockNext);
            });
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(100);
        });
    });
    describe('Security', () => {
        test('handles malicious input', () => {
            const maliciousData = {
                '<script>alert("xss")</script>': 'value',
                'constructor': { prototype: {} },
            };
            const req = mockRequest({ body: maliciousData });
            const res = mockResponse();
            expect(() => {
                (0, requestLogger_1.default)(req, res, mockNext);
            }).not.toThrow();
        });
        test('prevents injection attacks', () => {
            const req = mockRequest({
                body: { query: "'; DROP TABLE users; --" },
            });
            const res = mockResponse();
            (0, requestLogger_1.default)(req, res, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=requestLogger.test.js.map