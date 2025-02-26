import { IndexedCategory } from '~/types/prompts';

/**
 * Prompt for extracting skills from job descriptions using Gemini AI
 */
export function createSkillExtractionPrompt(
  jobDescription: string, 
  indexedData: { categories: IndexedCategory[] }
): string {
  return `
    You're helping a recruitment platform extract relevant skills and competencies from a job description.
    
    # Job Description:
    ${jobDescription}
    
    # Available Skills (INDEXED):
    ${JSON.stringify(indexedData, null, 2)}
    
    Based on the job description, identify the relevant competencies that match this position.
    Include competencies that are either explicitly mentioned OR strongly implied by the role.
    
    Respond ONLY with a valid JSON that lists the indices of the selected competencies:
    
    {
      "selected_competencies": [
        {
          "category_id": 0, // Index of the category
          "skill_id": 0, // Index of the skill within that category
          "competency_ids": [0, 1] // Indices of selected competencies within that skill
        },
        // Additional selections...
      ]
    }
    
    IMPORTANT:
    - Use ONLY the provided indices from the data structure
    - Ensure all indices exist in the provided data
    - ONLY return competencies that are relevant to the job description
    - Return ONLY the JSON with the selected indices. No explanations.
  `;
} 