import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireRole, requireOwnership } from '../auth';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock user service
const mockUserService = {
  findById: jest.fn(),
};

// Mock request and response helpers
const mockRequest = (overrides: Partial<Request> = {}) => {
  const req = {
    headers: {},
    user: undefined,
    params: {},
    ...overrides,
  } as Request;
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authenticateToken', () => {
    test('should authenticate valid token from Authorization header', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: true,
      };

      const decodedToken = {
        userId: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockUserService.findById).toHaveBeenCalledWith('1');
      expect(req.user).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should authenticate valid token from cookie', async () => {
      const req = mockRequest({
        cookies: { token: 'cookie-token' },
      });
      const res = mockResponse();

      const mockUser = {
        id: '2',
        email: 'cookie@example.com',
        firstName: 'Cookie',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      };

      const decodedToken = {
        userId: '2',
        email: 'cookie@example.com',
        role: 'ADMIN',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('cookie-token', 'test-secret');
      expect(req.user).toEqual({
        id: '2',
        email: 'cookie@example.com',
        firstName: 'Cookie',
        lastName: 'User',
        role: 'ADMIN',
      });
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should return 401 for missing token', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token format in Authorization header', async () => {
      const req = mockRequest({
        headers: { authorization: 'InvalidFormat' },
      });
      const res = mockResponse();

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token format',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = mockResponse();

      const jwtError = new Error('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for expired token', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer expired-token' },
      });
      const res = mockResponse();

      const jwtError = new Error('jwt expired');
      jwtError.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for malformed token', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer malformed-token' },
      });
      const res = mockResponse();

      const jwtError = new Error('jwt malformed');
      jwtError.name = 'JsonWebTokenError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw jwtError;
      });

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token format',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for non-existent user', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      const decodedToken = {
        userId: '999',
        email: 'nonexistent@example.com',
        role: 'CLIENT',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(null);

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 for inactive user', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: false, // Inactive user
      };

      const decodedToken = {
        userId: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is disabled',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      const decodedToken = {
        userId: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      const dbError = new Error('Database connection failed');
      mockUserService.findById.mockRejectedValue(dbError);

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should prioritize Authorization header over cookie', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer header-token' },
        cookies: { token: 'cookie-token' },
      });
      const res = mockResponse();

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        isActive: true,
      };

      const decodedToken = {
        userId: '1',
        email: 'test@example.com',
        role: 'CLIENT',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      await authenticateToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('header-token', 'test-secret');
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should handle missing JWT_SECRET environment variable', async () => {
      delete process.env.JWT_SECRET;
      
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      await authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server configuration error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    test('should allow access for user with required role', () => {
      const req = mockRequest({
        user: { id: '1', role: 'ADMIN' },
      });
      const res = mockResponse();

      const middleware = requireRole('ADMIN');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should allow access for user with multiple allowed roles', () => {
      const req = mockRequest({
        user: { id: '1', role: 'AGENT' },
      });
      const res = mockResponse();

      const middleware = requireRole(['ADMIN', 'AGENT']);
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should deny access for user without required role', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
      });
      const res = mockResponse();

      const middleware = requireRole('ADMIN');
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should deny access for user not in allowed roles array', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
      });
      const res = mockResponse();

      const middleware = requireRole(['ADMIN', 'AGENT']);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should deny access for unauthenticated user', () => {
      const req = mockRequest(); // No user
      const res = mockResponse();

      const middleware = requireRole('ADMIN');
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle case-insensitive role comparison', () => {
      const req = mockRequest({
        user: { id: '1', role: 'admin' }, // lowercase
      });
      const res = mockResponse();

      const middleware = requireRole('ADMIN'); // uppercase
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should handle empty roles array', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
      });
      const res = mockResponse();

      const middleware = requireRole([]);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireOwnership', () => {
    test('should allow access for resource owner', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
        params: { userId: '1' },
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should allow access for admin regardless of ownership', () => {
      const req = mockRequest({
        user: { id: '2', role: 'ADMIN' },
        params: { userId: '1' }, // Different user
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should allow access for agent regardless of ownership', () => {
      const req = mockRequest({
        user: { id: '3', role: 'AGENT' },
        params: { userId: '1' }, // Different user
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should deny access for non-owner client', () => {
      const req = mockRequest({
        user: { id: '2', role: 'CLIENT' },
        params: { userId: '1' }, // Different user
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: You can only access your own resources',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should deny access for unauthenticated user', () => {
      const req = mockRequest({
        params: { userId: '1' },
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle missing resource ID parameter', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
        params: {}, // No userId parameter
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource ID parameter is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should work with different parameter names', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
        params: { clientId: '1' },
      });
      const res = mockResponse();

      const middleware = requireOwnership('clientId');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should work with nested parameter paths', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
        body: { data: { ownerId: '1' } },
      });
      const res = mockResponse();

      // Mock function to extract nested value
      const extractOwner = (req: Request) => req.body?.data?.ownerId;
      const middleware = requireOwnership(extractOwner);
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should handle custom resource ID extractor function', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
        body: { ownerId: '2' }, // Different owner
      });
      const res = mockResponse();

      const extractOwner = (req: Request) => req.body?.ownerId;
      const middleware = requireOwnership(extractOwner);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied: You can only access your own resources',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle extractor function returning undefined', () => {
      const req = mockRequest({
        user: { id: '1', role: 'CLIENT' },
        params: {},
      });
      const res = mockResponse();

      const extractOwner = (req: Request) => req.params?.nonExistentId;
      const middleware = requireOwnership(extractOwner);
      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource ID parameter is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle string comparison correctly', () => {
      const req = mockRequest({
        user: { id: 1, role: 'CLIENT' }, // Number ID
        params: { userId: '1' }, // String ID
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    test('should handle role comparison case-insensitively', () => {
      const req = mockRequest({
        user: { id: '2', role: 'admin' }, // lowercase
        params: { userId: '1' },
      });
      const res = mockResponse();

      const middleware = requireOwnership('userId');
      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('Integration scenarios', () => {
    test('should work with authenticateToken and requireRole together', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
      });
      const res = mockResponse();

      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      };

      const decodedToken = {
        userId: '1',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      // First authenticate
      await authenticateToken(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith();

      // Then check role
      const roleMiddleware = requireRole('ADMIN');
      roleMiddleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    test('should work with authenticateToken and requireOwnership together', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer valid-token' },
        params: { userId: '1' },
      });
      const res = mockResponse();

      const mockUser = {
        id: '1',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'CLIENT',
        isActive: true,
      };

      const decodedToken = {
        userId: '1',
        email: 'user@example.com',
        role: 'CLIENT',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      mockUserService.findById.mockResolvedValue(mockUser);

      // First authenticate
      await authenticateToken(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith();

      // Then check ownership
      const ownershipMiddleware = requireOwnership('userId');
      ownershipMiddleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });
});