import { extractSkillsFromJobDescription, generateAssessmentCase } from '~/lib/gemini';
import { model } from '~/lib/gemini/client';

// Mock the Gemini client
jest.mock('~/lib/gemini/client');
const mockModel = model as jest.Mocked<typeof model>;

describe('Gemini AI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractSkillsFromJobDescription', () => {
    test('successfully extracts skills from job description', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            positionName: 'Frontend Developer',
            categories: [
              {
                name: 'Programming',
                numId: 1,
                skills: [
                  {
                    name: 'JavaScript',
                    numId: 1,
                    competencies: [
                      { name: 'DOM Manipulation', numId: 1, selected: true },
                      { name: 'ES6+ Features', numId: 2, selected: true },
                    ],
                  },
                ],
              },
            ],
          }),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse as any);

      const skillsData = {
        categories: [
          {
            name: 'Programming',
            numId: 1,
            skills: [
              {
                name: 'JavaScript',
                numId: 1,
                competencies: [
                  { name: 'DOM Manipulation', numId: 1 },
                  { name: 'ES6+ Features', numId: 2 },
                ],
              },
            ],
          },
        ],
      };

      const jobDescription = 'Looking for a frontend developer with JavaScript experience';
      const result = await extractSkillsFromJobDescription(jobDescription, skillsData);

      expect(result.positionName).toBe('Frontend Developer');
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0]?.skills[0]?.competencies).toHaveLength(2);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(jobDescription)
      );
    });

    test('handles malformed JSON response gracefully', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid JSON response',
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse as any);

      const skillsData = { categories: [] };
      const jobDescription = 'Test job description';

      await expect(
        extractSkillsFromJobDescription(jobDescription, skillsData)
      ).rejects.toThrow();
    });

    test('handles API errors gracefully', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('API Error'));

      const skillsData = { categories: [] };
      const jobDescription = 'Test job description';

      await expect(
        extractSkillsFromJobDescription(jobDescription, skillsData)
      ).rejects.toThrow('API Error');
    });
  });

  describe('generateAssessmentCase', () => {
    test('successfully generates assessment case', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            title: 'Frontend Development Assessment',
            context: 'Build a React application',
            questions: [
              {
                context: 'Component implementation',
                question: 'How would you implement a reusable button component?',
                competencies_assessed: [
                  { name: 'React Components', numId: 1, skillNumId: 1 },
                ],
              },
            ],
          }),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse as any);

      const jobDescription = 'Frontend developer role';
      const skillsData = {
        categories: [
          {
            name: 'Frontend',
            numId: 1,
            skills: [
              {
                name: 'React',
                numId: 1,
                competencies: [
                  { name: 'React Components', numId: 1, selected: true },
                ],
              },
            ],
          },
        ],
      };

      const result = await generateAssessmentCase(jobDescription, skillsData);

      expect(result.title).toBe('Frontend Development Assessment');
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0]?.competencies_assessed).toHaveLength(1);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining(jobDescription)
      );
    });

    test('handles empty skills data', async () => {
      const mockResponse = {
        response: {
          text: () => JSON.stringify({
            title: 'General Assessment',
            context: 'Basic assessment',
            questions: [],
          }),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse as any);

      const jobDescription = 'General role';
      const skillsData = { categories: [] };

      const result = await generateAssessmentCase(jobDescription, skillsData);

      expect(result.title).toBe('General Assessment');
      expect(result.questions).toHaveLength(0);
    });
  });
});