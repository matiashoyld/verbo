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
    1. Come up with a name for the position. Should be in the form of "Job Title"
    2. Identify the relevant competencies that match this position. Include competencies that are either explicitly mentioned OR strongly implied by the role.
    
    YOUR RESPONSE MUST BE VALID JSON. Do not include any explanations, markdown formatting or additional text.
    You must respond with nothing but a valid, parseable JSON object in this exact format:
    
    {
      "position_name": "Job Title",
      "selected_competencies": [
        {
          "category_numId": 123, // Database numId of the category
          "skill_numId": 456, // Database numId of the skill within that category
          "competency_numIds": [789, 101] // Database numIds of selected competencies within that skill
        },
        // Additional selections...
      ]
    }
    
    EXTREMELY IMPORTANT RULES:
    - Your response MUST CONTAIN ONLY the JSON object and NOTHING else
    - Do not include "[backticks]json" or any other markdown formatting
    - Do not include any text before or after the JSON
    - Use ONLY the provided numIds from the data structure - these are actual database IDs
    - If a numId is null in the provided data, you can still include that item, but use null as the numId
    - ONLY return competencies that are relevant to the job description
    - Ensure your output is valid JSON that can be parsed with JSON.parse()
  `;
} 