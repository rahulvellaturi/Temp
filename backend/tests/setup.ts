import { MongoMemoryServer } from 'mongodb-memory-server';
import { PrismaClient } from '@prisma/client';

// Global test setup
let mongoServer: MongoMemoryServer;
let prisma: PrismaClient;

beforeAll(async () => {
  // Start in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set test environment variables
  process.env.DATABASE_URL = mongoUri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  
  // Initialize Prisma client
  prisma = new PrismaClient();
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup
  await prisma.$disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clean database before each test
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
});

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
  }))
}));

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn(() => Promise.resolve({ 
        public_id: 'test-image-id',
        secure_url: 'https://test.cloudinary.com/test-image.jpg'
      }))
    }
  }
}));

// Global test utilities
global.testPrisma = prisma;