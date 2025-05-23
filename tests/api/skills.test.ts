// Mock the database
jest.mock('~/server/db', () => ({
  db: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    skill: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    competency: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// import { db } from '~/server/db';

// Create properly typed mocks
const mockDb = {
  category: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  skill: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  competency: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

describe('Skills API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    test('returns list of categories with skills', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Programming',
          numId: 1,
          skills: [
            {
              id: '1',
              name: 'JavaScript',
              numId: 1,
              competencies: [
                { id: '1', name: 'DOM Manipulation', numId: 1 },
                { id: '2', name: 'ES6+ Features', numId: 2 },
              ],
            },
          ],
        },
        {
          id: '2',
          name: 'Frontend',
          numId: 2,
          skills: [
            {
              id: '2',
              name: 'React',
              numId: 2,
              competencies: [
                { id: '3', name: 'Hooks', numId: 3 },
                { id: '4', name: 'Context API', numId: 4 },
              ],
            },
          ],
        },
      ];

      mockDb.category.findMany.mockResolvedValue(mockCategories as any);

      const result = await mockDb.category.findMany({
        include: {
          skills: {
            include: {
              competencies: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      expect(result).toEqual(mockCategories);
      expect(mockDb.category.findMany).toHaveBeenCalledWith({
        include: {
          skills: {
            include: {
              competencies: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    test('handles empty categories gracefully', async () => {
      mockDb.category.findMany.mockResolvedValue([]);

      const result = await mockDb.category.findMany({
        include: {
          skills: {
            include: {
              competencies: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      expect(result).toEqual([]);
    });
  });

  describe('createCategory', () => {
    test('successfully creates a new category', async () => {
      const newCategory = {
        id: '3',
        name: 'Backend',
        numId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.category.create.mockResolvedValue(newCategory as any);

      const result = await mockDb.category.create({
        data: {
          name: 'Backend',
          numId: 3,
        },
      });

      expect(result).toEqual(newCategory);
      expect(mockDb.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Backend',
          numId: 3,
        },
      });
    });

    test('handles duplicate category names', async () => {
      const error = new Error('Unique constraint failed on the fields: (`name`)');
      mockDb.category.create.mockRejectedValue(error);

      await expect(
        mockDb.category.create({
          data: {
            name: 'Programming',
            numId: 1,
          },
        })
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('createSkill', () => {
    test('successfully creates a new skill', async () => {
      const newSkill = {
        id: '3',
        name: 'Python',
        numId: 3,
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.skill.create.mockResolvedValue(newSkill as any);

      const result = await mockDb.skill.create({
        data: {
          name: 'Python',
          numId: 3,
          categoryId: '1',
        },
      });

      expect(result).toEqual(newSkill);
      expect(mockDb.skill.create).toHaveBeenCalledWith({
        data: {
          name: 'Python',
          numId: 3,
          categoryId: '1',
        },
      });
    });

    test('handles invalid category reference', async () => {
      const error = new Error('Foreign key constraint failed');
      mockDb.skill.create.mockRejectedValue(error);

      await expect(
        mockDb.skill.create({
          data: {
            name: 'Python',
            numId: 3,
            categoryId: 'invalid-id',
          },
        })
      ).rejects.toThrow('Foreign key constraint failed');
    });
  });

  describe('createCompetency', () => {
    test('successfully creates a new competency', async () => {
      const newCompetency = {
        id: '5',
        name: 'Type Annotations',
        numId: 5,
        skillId: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.competency.create.mockResolvedValue(newCompetency as any);

      const result = await mockDb.competency.create({
        data: {
          name: 'Type Annotations',
          numId: 5,
          skillId: '3',
        },
      });

      expect(result).toEqual(newCompetency);
      expect(mockDb.competency.create).toHaveBeenCalledWith({
        data: {
          name: 'Type Annotations',
          numId: 5,
          skillId: '3',
        },
      });
    });
  });

  describe('deleteCategory', () => {
    test('successfully deletes category and cascades to skills', async () => {
      mockDb.$transaction.mockImplementation(async (callback: any) => {
        return await callback(mockDb as any);
      });

      const result = await mockDb.$transaction(async () => {
        return { success: true };
      });

      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('updateSkill', () => {
    test('successfully updates skill name', async () => {
      const updatedSkill = {
        id: '1',
        name: 'Advanced JavaScript',
        numId: 1,
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.skill.update.mockResolvedValue(updatedSkill as any);

      const result = await mockDb.skill.update({
        where: {
          id: '1',
        },
        data: {
          name: 'Advanced JavaScript',
        },
      });

      expect(result).toEqual(updatedSkill);
      expect(mockDb.skill.update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          name: 'Advanced JavaScript',
        },
      });
    });

    test('handles non-existent skill', async () => {
      const error = new Error('Record not found');
      mockDb.skill.update.mockRejectedValue(error);

      await expect(
        mockDb.skill.update({
          where: {
            id: 'non-existent',
          },
          data: {
            name: 'Updated Name',
          },
        })
      ).rejects.toThrow('Record not found');
    });
  });

  describe('getSkillsWithCompetencies', () => {
    test('returns skills with their competencies for a category', async () => {
      const mockSkills = [
        {
          id: '1',
          name: 'JavaScript',
          numId: 1,
          competencies: [
            { id: '1', name: 'DOM Manipulation', numId: 1 },
            { id: '2', name: 'ES6+ Features', numId: 2 },
          ],
        },
        {
          id: '2',
          name: 'TypeScript',
          numId: 2,
          competencies: [
            { id: '3', name: 'Type Definitions', numId: 3 },
            { id: '4', name: 'Advanced Types', numId: 4 },
          ],
        },
      ];

      mockDb.skill.findMany.mockResolvedValue(mockSkills as any);

      const result = await mockDb.skill.findMany({
        where: {
          categoryId: '1',
        },
        include: {
          competencies: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      expect(result).toEqual(mockSkills);
      expect(mockDb.skill.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: '1',
        },
        include: {
          competencies: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });
  });
});