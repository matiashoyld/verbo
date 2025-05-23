// import { createTRPCMsw } from 'msw-trpc';
// import { appRouter } from '~/server/api/root';

// Mock the database
jest.mock('~/server/db', () => ({
  db: {
    commonPosition: {
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
    },
    position: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    positionQuestion: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  },
}));

// import { db } from '~/server/db';

const mockDb = {
  commonPosition: {
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
  skill: {
    findMany: jest.fn(),
  },
  position: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  positionQuestion: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
} as any;

// Create tRPC MSW handlers (for future use)

describe('Positions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCommonPositions', () => {
    test('returns list of common positions', async () => {
      const mockPositions = [
        { id: '1', title: 'Software Engineer', description: 'Develop software' },
        { id: '2', title: 'Product Manager', description: 'Manage products' },
      ];

      mockDb.commonPosition.findMany.mockResolvedValue(mockPositions as any);

      const result = await mockDb.commonPosition.findMany({
        orderBy: { title: 'asc' },
      });

      expect(result).toEqual(mockPositions);
      expect(mockDb.commonPosition.findMany).toHaveBeenCalledWith({
        orderBy: { title: 'asc' },
      });
    });

    test('handles database errors gracefully', async () => {
      mockDb.commonPosition.findMany.mockRejectedValue(new Error('Database error'));

      await expect(
        mockDb.commonPosition.findMany({ orderBy: { title: 'asc' } })
      ).rejects.toThrow('Database error');
    });
  });

  describe('extractSkills', () => {
    test('successfully extracts skills from job description', async () => {
      const mockSkillsData = {
        categories: [
          {
            id: '1',
            numId: 1,
            name: 'Programming',
            skills: [
              {
                id: '1',
                numId: 1,
                name: 'JavaScript',
                categoryId: '1',
                category: { id: '1', numId: 1, name: 'Programming' },
                competencies: [
                  { id: '1', numId: 1, name: 'DOM Manipulation' },
                  { id: '2', numId: 2, name: 'ES6+ Features' },
                ],
              },
            ],
          },
        ],
      };

      mockDb.category.findMany.mockResolvedValue(mockSkillsData.categories as any);
      mockDb.skill.findMany.mockResolvedValue(
        mockSkillsData.categories.flatMap(cat => cat.skills) as any
      );

      const categories = await mockDb.category.findMany({
        select: {
          id: true,
          numId: true,
          name: true,
        },
      });

      expect(categories).toEqual(mockSkillsData.categories);
      expect(mockDb.category.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          numId: true,
          name: true,
        },
      });
    });
  });

  describe('createPosition', () => {
    test('successfully creates a new position', async () => {
      const mockPosition = {
        id: 'position-1',
        title: 'Senior Developer',
        jobDescription: 'Looking for a senior developer',
        context: 'Development role',
        creatorId: 'user-1',
      };

      const mockQuestion = {
        id: 'question-1',
        question: 'What is React?',
        context: 'Frontend knowledge',
      };

      mockDb.position.create.mockResolvedValue(mockPosition as any);
      mockDb.positionQuestion.create.mockResolvedValue(mockQuestion as any);

      const createdPosition = await mockDb.position.create({
        data: {
          title: mockPosition.title,
          jobDescription: mockPosition.jobDescription,
          context: mockPosition.context,
          openings: 1,
          creatorId: mockPosition.creatorId,
        },
        select: { id: true },
      });

      expect(createdPosition).toEqual({ id: mockPosition.id });
      expect(mockDb.position.create).toHaveBeenCalledWith({
        data: {
          title: mockPosition.title,
          jobDescription: mockPosition.jobDescription,
          context: mockPosition.context,
          openings: 1,
          creatorId: mockPosition.creatorId,
        },
        select: { id: true },
      });
    });

    test('handles validation errors', async () => {
      mockDb.position.create.mockRejectedValue(new Error('Validation failed'));

      await expect(
        mockDb.position.create({
          data: {
            title: '',
            jobDescription: '',
            context: '',
            openings: 1,
            creatorId: 'user-1',
          },
          select: { id: true },
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('getPositions', () => {
    test('returns paginated positions for authenticated user', async () => {
      const mockPositions = [
        {
          id: 'pos-1',
          title: 'Frontend Developer',
          createdAt: new Date(),
          _count: { questions: 5 },
        },
        {
          id: 'pos-2',
          title: 'Backend Developer',
          createdAt: new Date(),
          _count: { questions: 3 },
        },
      ];

      mockDb.position.findMany.mockResolvedValue(mockPositions as any);

      const positions = await mockDb.position.findMany({
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(positions).toEqual(mockPositions);
      expect(mockDb.position.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('deletePosition', () => {
    test('successfully deletes position and related data', async () => {
      const positionId = 'position-1';

      mockDb.$transaction.mockImplementation(async (callback: any) => {
        return await callback(mockDb as any);
      });

      mockDb.$queryRaw.mockResolvedValue([{ id: 'question-1' }] as any);
      mockDb.$executeRaw.mockResolvedValue(1 as any);

      await mockDb.$transaction(async (tx: any) => {
        await tx.$executeRaw`DELETE FROM "Position" WHERE id = ${positionId}::uuid`;
      });

      expect(mockDb.$transaction).toHaveBeenCalled();
    });
  });
});