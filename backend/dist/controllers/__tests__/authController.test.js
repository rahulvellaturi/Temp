"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authController_1 = require("../authController");
// Mock bcrypt
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));
// Mock user data
const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CLIENT',
    isActive: true,
};
// Mock database/service
const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
};
// Mock request and response
const mockRequest = () => {
    const req = {};
    req.body = {};
    req.params = {};
    req.query = {};
    req.headers = {};
    req.user = undefined;
    return req;
};
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    return res;
};
const mockNext = jest.fn();
describe('AuthController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });
    describe('login', () => {
        test('should login user with valid credentials', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            jsonwebtoken_1.default.sign.mockReturnValue('mock-token');
            await authController_1.authController.login(req, res, mockNext);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcryptjs_1.default.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ userId: '1', email: 'test@example.com', role: 'CLIENT' }, 'test-secret', { expiresIn: '24h' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful',
                token: 'mock-token',
                user: {
                    id: '1',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'CLIENT',
                },
            });
        });
        test('should return error for missing email', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = { password: 'password123' };
            await authController_1.authController.login(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email and password are required',
            });
        });
        test('should return error for missing password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = { email: 'test@example.com' };
            await authController_1.authController.login(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email and password are required',
            });
        });
        test('should return error for non-existent user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };
            mockUserService.findByEmail.mockResolvedValue(null);
            await authController_1.authController.login(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid email or password',
            });
        });
        test('should return error for invalid password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(false);
            await authController_1.authController.login(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid email or password',
            });
        });
        test('should return error for inactive user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            const inactiveUser = { ...mockUser, isActive: false };
            mockUserService.findByEmail.mockResolvedValue(inactiveUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            await authController_1.authController.login(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Account is disabled. Please contact support.',
            });
        });
        test('should handle database errors', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            const dbError = new Error('Database connection failed');
            mockUserService.findByEmail.mockRejectedValue(dbError);
            await authController_1.authController.login(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(dbError);
        });
        test('should handle bcrypt errors', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            const bcryptError = new Error('Bcrypt error');
            bcryptjs_1.default.compare.mockRejectedValue(bcryptError);
            await authController_1.authController.login(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(bcryptError);
        });
        test('should handle JWT errors', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            const jwtError = new Error('JWT error');
            jsonwebtoken_1.default.sign.mockImplementation(() => {
                throw jwtError;
            });
            await authController_1.authController.login(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(jwtError);
        });
    });
    describe('register', () => {
        test('should register new user successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'newuser@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'CLIENT',
            };
            mockUserService.findByEmail.mockResolvedValue(null);
            bcryptjs_1.default.hash.mockResolvedValue('hashedpassword');
            mockUserService.create.mockResolvedValue({
                id: '2',
                email: 'newuser@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'CLIENT',
            });
            jsonwebtoken_1.default.sign.mockReturnValue('new-token');
            await authController_1.authController.register(req, res, mockNext);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('newuser@example.com');
            expect(bcryptjs_1.default.hash).toHaveBeenCalledWith('password123', 12);
            expect(mockUserService.create).toHaveBeenCalledWith({
                email: 'newuser@example.com',
                password: 'hashedpassword',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'CLIENT',
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User registered successfully',
                token: 'new-token',
                user: {
                    id: '2',
                    email: 'newuser@example.com',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    role: 'CLIENT',
                },
            });
        });
        test('should return error for missing required fields', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'newuser@example.com',
                // Missing password, firstName, lastName
            };
            await authController_1.authController.register(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'All fields are required',
            });
        });
        test('should return error for invalid email format', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'invalid-email',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
            };
            await authController_1.authController.register(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid email format',
            });
        });
        test('should return error for weak password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'newuser@example.com',
                password: '123', // Too short
                firstName: 'Jane',
                lastName: 'Smith',
            };
            await authController_1.authController.register(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        });
        test('should return error for existing user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
            };
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            await authController_1.authController.register(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User already exists with this email',
            });
        });
        test('should handle hashing errors', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                email: 'newuser@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
            };
            mockUserService.findByEmail.mockResolvedValue(null);
            const hashError = new Error('Hashing failed');
            bcryptjs_1.default.hash.mockRejectedValue(hashError);
            await authController_1.authController.register(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(hashError);
        });
    });
    describe('logout', () => {
        test('should logout user successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await authController_1.authController.logout(req, res, mockNext);
            expect(res.clearCookie).toHaveBeenCalledWith('token');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Logged out successfully',
            });
        });
    });
    describe('verifyToken', () => {
        test('should verify valid token', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.headers.authorization = 'Bearer valid-token';
            const decodedToken = {
                userId: '1',
                email: 'test@example.com',
                role: 'CLIENT',
            };
            jsonwebtoken_1.default.verify.mockReturnValue(decodedToken);
            mockUserService.findById.mockResolvedValue(mockUser);
            await authController_1.authController.verifyToken(req, res, mockNext);
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                user: {
                    id: '1',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'CLIENT',
                },
            });
        });
        test('should return error for missing token', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await authController_1.authController.verifyToken(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided',
            });
        });
        test('should return error for invalid token format', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.headers.authorization = 'InvalidFormat';
            await authController_1.authController.verifyToken(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token format',
            });
        });
        test('should return error for invalid token', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.headers.authorization = 'Bearer invalid-token';
            const jwtError = new Error('Invalid token');
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw jwtError;
            });
            await authController_1.authController.verifyToken(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token',
            });
        });
        test('should return error for non-existent user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.headers.authorization = 'Bearer valid-token';
            const decodedToken = {
                userId: '999',
                email: 'nonexistent@example.com',
                role: 'CLIENT',
            };
            jsonwebtoken_1.default.verify.mockReturnValue(decodedToken);
            mockUserService.findById.mockResolvedValue(null);
            await authController_1.authController.verifyToken(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found',
            });
        });
    });
    describe('refreshToken', () => {
        test('should refresh token successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.user = { id: '1', email: 'test@example.com', role: 'CLIENT' };
            jsonwebtoken_1.default.sign.mockReturnValue('new-refresh-token');
            await authController_1.authController.refreshToken(req, res, mockNext);
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ userId: '1', email: 'test@example.com', role: 'CLIENT' }, 'test-secret', { expiresIn: '24h' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                token: 'new-refresh-token',
            });
        });
        test('should return error for missing user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            await authController_1.authController.refreshToken(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authenticated',
            });
        });
        test('should handle JWT signing errors', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.user = { id: '1', email: 'test@example.com', role: 'CLIENT' };
            const jwtError = new Error('JWT signing failed');
            jsonwebtoken_1.default.sign.mockImplementation(() => {
                throw jwtError;
            });
            await authController_1.authController.refreshToken(req, res, mockNext);
            expect(mockNext).toHaveBeenCalledWith(jwtError);
        });
    });
    describe('forgotPassword', () => {
        test('should send password reset email', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = { email: 'test@example.com' };
            mockUserService.findByEmail.mockResolvedValue(mockUser);
            jsonwebtoken_1.default.sign.mockReturnValue('reset-token');
            await authController_1.authController.forgotPassword(req, res, mockNext);
            expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ userId: '1', type: 'password-reset' }, 'test-secret', { expiresIn: '1h' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset email sent',
            });
        });
        test('should return error for missing email', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {};
            await authController_1.authController.forgotPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Email is required',
            });
        });
        test('should return success even for non-existent user (security)', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = { email: 'nonexistent@example.com' };
            mockUserService.findByEmail.mockResolvedValue(null);
            await authController_1.authController.forgotPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset email sent',
            });
        });
    });
    describe('resetPassword', () => {
        test('should reset password successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                token: 'valid-reset-token',
                password: 'newpassword123',
            };
            const decodedToken = {
                userId: '1',
                type: 'password-reset',
            };
            jsonwebtoken_1.default.verify.mockReturnValue(decodedToken);
            mockUserService.findById.mockResolvedValue(mockUser);
            bcryptjs_1.default.hash.mockResolvedValue('newhashed');
            mockUserService.update.mockResolvedValue({ ...mockUser, password: 'newhashed' });
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('valid-reset-token', 'test-secret');
            expect(bcryptjs_1.default.hash).toHaveBeenCalledWith('newpassword123', 12);
            expect(mockUserService.update).toHaveBeenCalledWith('1', { password: 'newhashed' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password reset successfully',
            });
        });
        test('should return error for missing token', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = { password: 'newpassword123' };
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token and password are required',
            });
        });
        test('should return error for missing password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = { token: 'reset-token' };
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token and password are required',
            });
        });
        test('should return error for invalid token', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                token: 'invalid-token',
                password: 'newpassword123',
            };
            const jwtError = new Error('Invalid token');
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw jwtError;
            });
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid or expired token',
            });
        });
        test('should return error for wrong token type', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                token: 'wrong-type-token',
                password: 'newpassword123',
            };
            const decodedToken = {
                userId: '1',
                type: 'access-token', // Wrong type
            };
            jsonwebtoken_1.default.verify.mockReturnValue(decodedToken);
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token type',
            });
        });
        test('should return error for non-existent user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                token: 'valid-reset-token',
                password: 'newpassword123',
            };
            const decodedToken = {
                userId: '999',
                type: 'password-reset',
            };
            jsonwebtoken_1.default.verify.mockReturnValue(decodedToken);
            mockUserService.findById.mockResolvedValue(null);
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found',
            });
        });
        test('should return error for weak password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                token: 'valid-reset-token',
                password: '123', // Too weak
            };
            await authController_1.authController.resetPassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        });
    });
    describe('changePassword', () => {
        test('should change password successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.user = { id: '1' };
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
            };
            mockUserService.findById.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(true);
            bcryptjs_1.default.hash.mockResolvedValue('newhashed');
            mockUserService.update.mockResolvedValue({ ...mockUser, password: 'newhashed' });
            await authController_1.authController.changePassword(req, res, mockNext);
            expect(bcryptjs_1.default.compare).toHaveBeenCalledWith('oldpassword', 'hashedpassword');
            expect(bcryptjs_1.default.hash).toHaveBeenCalledWith('newpassword123', 12);
            expect(mockUserService.update).toHaveBeenCalledWith('1', { password: 'newhashed' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Password changed successfully',
            });
        });
        test('should return error for missing user', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
            };
            await authController_1.authController.changePassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not authenticated',
            });
        });
        test('should return error for missing fields', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.user = { id: '1' };
            req.body = { currentPassword: 'oldpassword' }; // Missing newPassword
            await authController_1.authController.changePassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Current password and new password are required',
            });
        });
        test('should return error for incorrect current password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.user = { id: '1' };
            req.body = {
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123',
            };
            mockUserService.findById.mockResolvedValue(mockUser);
            bcryptjs_1.default.compare.mockResolvedValue(false);
            await authController_1.authController.changePassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Current password is incorrect',
            });
        });
        test('should return error for weak new password', async () => {
            const req = mockRequest();
            const res = mockResponse();
            req.user = { id: '1' };
            req.body = {
                currentPassword: 'oldpassword',
                newPassword: '123', // Too weak
            };
            await authController_1.authController.changePassword(req, res, mockNext);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'New password must be at least 6 characters long',
            });
        });
    });
});
//# sourceMappingURL=authController.test.js.map