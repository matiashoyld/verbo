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
    
    # Available Skills (with database IDs):
    ${JSON.stringify(indexedData, null, 2)}
    
    Based on the job description provided:
    1. Come up with a name for the position. Should be in the form of "Job Title @ Company Name"
    2. Identify the relevant competencies that match this position. Include competencies that are either explicitly mentioned OR strongly implied by the role.
    
    Respond ONLY with a valid JSON that lists the database numIds of the selected competencies:
    
    {
      "position_name": "Job Title @ Company Name",
      "selected_competencies": [
        {
          "category_numId": 123, // Database numId of the category
          "skill_numId": 456, // Database numId of the skill within that category
          "competency_numIds": [789, 101] // Database numIds of selected competencies within that skill
        },
        // Additional selections...
      ]
    }
    
    IMPORTANT:
    - Use ONLY the provided numIds from the data structure - these are actual database IDs
    - If a numId is null in the provided data, you can still include that item, but use null as the numId
    - ONLY return competencies that are relevant to the job description
    - Return ONLY the JSON with the selected database numIds. No explanations.
  `;
} 