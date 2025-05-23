import { createTRPCContext } from '~/server/api/trpc';
import { appRouter } from '~/server/api/root';
import { createCallerFactory } from '@trpc/server';

// Mock the database
jest.mock('~/server/db', () => ({
  db: {
    position: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    competency: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    commonPosition: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

describe('tRPC Router Integration', () => {
  const createCaller = createCallerFactory(appRouter);

  describe('Context Creation', () => {
    test('creates context with authenticated user', async () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer test-token',
        },
      } as any;

      const mockAuth = {
        userId: 'user-123',
        sessionId: 'session-123',
      };

      // Mock the auth function
      const { auth } = await import('@clerk/nextjs/server');
      (auth as jest.Mock).mockReturnValue(mockAuth);

      const ctx = await createTRPCContext({
        req: mockReq,
        resHeaders: new Headers(),
      });

      expect(ctx.userId).toBe('user-123');
    });

    test('creates context with unauthenticated user', async () => {
      const mockReq = {
        headers: {},
      } as any;

      const mockAuth = {
        userId: null,
        sessionId: null,
      };

      // Mock the auth function
      const { auth } = await import('@clerk/nextjs/server');
      (auth as jest.Mock).mockReturnValue(mockAuth);

      const ctx = await createTRPCContext({
        req: mockReq,
        resHeaders: new Headers(),
      });

      expect(ctx.userId).toBeNull();
    });
  });

  describe('Router Methods', () => {
    test('public procedures work without authentication', async () => {
      const caller = createCaller({
        userId: null,
        db: {} as any,
      });

      // Mock the database call
      const { db } = await import('~/server/db');
      (db.commonPosition.findMany as jest.Mock).mockResolvedValue([
        { id: '1', title: 'Software Engineer' },
        { id: '2', title: 'Product Manager' },
      ]);

      const result = await caller.positions.getCommonPositions();

      expect(result).toEqual([
        { id: '1', title: 'Software Engineer' },
        { id: '2', title: 'Product Manager' },
      ]);
    });

    test('protected procedures require authentication', async () => {
      const caller = createCaller({
        userId: null,
        db: {} as any,
      });

      await expect(caller.positions.getPositions()).rejects.toThrow('UNAUTHORIZED');
    });

    test('protected procedures work with authentication', async () => {
      const caller = createCaller({
        userId: 'user-123',
        db: {} as any,
      });

      // Mock the database call
      const { db } = await import('~/server/db');
      (db.position.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pos-1',
          title: 'Frontend Developer',
          createdAt: new Date(),
          _count: { questions: 5 },
        },
      ]);

      const result = await caller.positions.getPositions();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'pos-1');
      expect(result[0]).toHaveProperty('title', 'Frontend Developer');
    });
  });

  describe('Input Validation', () => {
    test('validates input schemas correctly', async () => {
      const caller = createCaller({
        userId: 'user-123',
        db: {} as any,
      });

      // Test with invalid input - should throw validation error
      await expect(
        caller.positions.getPositionById({
          id: '', // Empty string should fail validation
        })
      ).rejects.toThrow();

      // Test with valid input
      const { db } = await import('~/server/db');
      (db.position.findUnique as jest.Mock).mockResolvedValue({
        id: 'pos-1',
        title: 'Test Position',
        jobDescription: 'Test description',
        context: 'Test context',
        createdAt: new Date(),
        questions: [],
      });

      const result = await caller.positions.getPositionById({
        id: 'valid-uuid-string',
      });

      expect(result).toHaveProperty('id', 'pos-1');
    });

    test('validates complex input schemas', async () => {
      const caller = createCaller({
        userId: 'user-123',
        db: {} as any,
      });

      const { db } = await import('~/server/db');
      (db.position.create as jest.Mock).mockResolvedValue({ id: 'new-pos' });
      (db.positionQuestion.create as jest.Mock).mockResolvedValue({ id: 'new-question' });

      const validInput = {
        title: 'Software Engineer',
        jobDescription: 'We are looking for a software engineer...',
        skills: [
          {
            category: 'Programming',
            categoryNumId: 1,
            skills: [
              {
                name: 'JavaScript',
                numId: 1,
                competencies: [
                  {
                    name: 'DOM Manipulation',
                    numId: 1,
                    selected: true,
                  },
                ],
              },
            ],
          },
        ],
        assessment: {
          title: 'Technical Assessment',
          context: 'This is a test assessment',
          questions: [
            {
              context: 'Programming question',
              question: 'What is a closure?',
              competencies_assessed: [
                {
                  numId: 1,
                  name: 'DOM Manipulation',
                  skillNumId: 1,
                },
              ],
            },
          ],
        },
      };

      const result = await caller.positions.createPosition(validInput);
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      const caller = createCaller({
        userId: 'user-123',
        db: {} as any,
      });

      const { db } = await import('~/server/db');
      (db.position.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await expect(caller.positions.getPositions()).rejects.toThrow('Database connection failed');
    });

    test('handles not found errors', async () => {
      const caller = createCaller({
        userId: 'user-123',
        db: {} as any,
      });

      const { db } = await import('~/server/db');
      (db.position.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        caller.positions.getPositionById({ id: 'non-existent-id' })
      ).rejects.toThrow('Position not found');
    });
  });

  describe('Middleware', () => {
    test('enforces authentication middleware', async () => {
      const caller = createCaller({
        userId: null,
        db: {} as any,
      });

      // All protected procedures should throw UNAUTHORIZED
      await expect(caller.positions.createPosition({} as any)).rejects.toThrow('UNAUTHORIZED');
      await expect(caller.positions.getPositions()).rejects.toThrow('UNAUTHORIZED');
      await expect(caller.positions.deletePosition({ id: 'test' })).rejects.toThrow('UNAUTHORIZED');
    });

    test('passes through for public procedures', async () => {
      const caller = createCaller({
        userId: null,
        db: {} as any,
      });

      const { db } = await import('~/server/db');
      (db.commonPosition.findMany as jest.Mock).mockResolvedValue([]);

      // Public procedures should work without authentication
      const result = await caller.positions.getCommonPositions();
      expect(result).toEqual([]);
    });
  });
});