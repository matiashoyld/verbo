import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Create a model instance with the appropriate model name
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

// Types for indexed database structure
export interface IndexedSkillsData {
  categories: Array<{
    id: number;
    name: string;
    skills: Array<{
      id: number;
      name: string;
      competencies: Array<{
        id: number;
        name: string;
      }>;
    }>;
  }>;
}

// Type for the AI response with indices
export interface IndexedAIResponse {
  selected_competencies: Array<{
    category_id: number;
    skill_id: number;
    competency_ids: number[];
  }>;
}

// Original output structure (what frontend expects)
export type AISkillCategory = {
  name: string;
  skills: Array<{
    name: string;
    competencies: Array<{
      name: string;
      selected: boolean;
    }>;
  }>;
};

export type AISkillsResult = {
  categories: AISkillCategory[];
};

/**
 * Extracts skills from job description using Gemini AI
 * @param jobDescription The job description to analyze
 * @param allDatabaseData Structured data from database containing all categories, skills, and competencies with indices
 */
export async function extractSkillsFromJobDescription(
  jobDescription: string,
  allDatabaseData: {
    categories: Array<{
      name: string;
      skills: Array<{
        name: string;
        competencies: Array<{
          name: string;
        }>;
      }>;
    }>;
  }
): Promise<AISkillsResult> {
  try {
    console.log("\n==== SKILL EXTRACTION PROCESS STARTING ====");
    console.log("Extracting skills from job description with Gemini AI...");
    
    // Transform the input data to include indices
    const indexedData: IndexedSkillsData = {
      categories: allDatabaseData.categories.map((category, categoryIndex) => ({
        id: categoryIndex,
        name: category.name,
        skills: category.skills.map((skill, skillIndex) => ({
          id: skillIndex,
          name: skill.name,
          competencies: skill.competencies.map((competency, competencyIndex) => ({
            id: competencyIndex,
            name: competency.name,
          })),
        })),
      })),
    };

    console.log(`Processed data for AI: ${indexedData.categories.length} categories`);
    console.log(`Total skills indexed: ${indexedData.categories.reduce(
      (count, category) => count + category.skills.length, 0
    )}`);
    console.log(`Total competencies indexed: ${indexedData.categories.reduce(
      (count, category) => 
        count + category.skills.reduce(
          (skillCount, skill) => skillCount + skill.competencies.length, 0
        ), 0
    )}`);

    // Construct prompt for the AI with indexed data structure
    const prompt = `
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

    // Log the full prompt being sent to the AI
    console.log("\n==== FULL PROMPT SENT TO GEMINI AI ====");
    console.log(prompt);
    console.log("=====================================");

    // Call the Gemini API with the constructed prompt
    console.log("\nSending request to Gemini AI...");
    const aiResult = await model.generateContent(prompt);
    const response = await aiResult.response;
    const text = response.text();

    console.log("\n==== COMPLETE RESPONSE FROM GEMINI AI ====");
    console.log(text);
    console.log("=========================================");

    // Find and extract the JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON object found in Gemini response");
      throw new Error("Failed to extract skills from job description");
    }

    const jsonString = jsonMatch[0];
    console.log("\n==== EXTRACTED JSON ====");
    console.log(jsonString);
    console.log("=======================");

    // Parse the indexed response
    const parsedIndexResponse = JSON.parse(jsonString) as IndexedAIResponse;
    
    // Validate the response structure
    if (!parsedIndexResponse.selected_competencies || !Array.isArray(parsedIndexResponse.selected_competencies)) {
      throw new Error("Invalid response format: missing or malformed 'selected_competencies'");
    }

    // Reconstruct the complete data structure from the indices
    const outputResult: AISkillsResult = {
      categories: [],
    };
    
    // Map to track categories we've already added to avoid duplicates
    const addedCategories = new Map<number, number>();
    
    // Process each set of selections
    for (const selection of parsedIndexResponse.selected_competencies) {
      // Get the category and skill from the indexed data
      const category = indexedData.categories[selection.category_id];
      if (!category) {
        console.warn(`Category with index ${selection.category_id} not found`);
        continue;
      }
      
      const skill = category.skills[selection.skill_id];
      if (!skill) {
        console.warn(`Skill with index ${selection.skill_id} not found in category ${category.name}`);
        continue;
      }
      
      // Get or create the category in our result
      let categoryIndex = addedCategories.get(selection.category_id);
      if (categoryIndex === undefined) {
        categoryIndex = outputResult.categories.length;
        addedCategories.set(selection.category_id, categoryIndex);
        outputResult.categories.push({
          name: category.name,
          skills: [],
        });
      }
      
      // Get the result category we're working with
      const resultCategory = outputResult.categories[categoryIndex];
      if (!resultCategory) {
        console.warn(`Result category with index ${categoryIndex} not found`);
        continue;
      }
      
      // Find if the skill is already added to this category
      const existingSkillIndex = resultCategory.skills.findIndex(
        (s) => s.name === skill.name
      );
      
      // Create or get the skill object
      let skillObject: {
        name: string;
        competencies: Array<{ name: string; selected: boolean }>;
      };
      
      if (existingSkillIndex === -1) {
        // Add new skill to the category
        skillObject = {
          name: skill.name,
          competencies: [],
        };
        resultCategory.skills.push(skillObject);
      } else {
        // Use existing skill - use a non-null assertion since we know it exists
        // (we just found its index in the array)
        skillObject = resultCategory.skills[existingSkillIndex]!;
      }
      
      // Add the selected competencies
      for (const competencyId of selection.competency_ids) {
        const competency = skill.competencies[competencyId];
        if (!competency) {
          console.warn(`Competency with index ${competencyId} not found in skill ${skill.name}`);
          continue;
        }
        
        // Check if this competency is already added
        const existingCompetency = skillObject.competencies.find(c => c.name === competency.name);
        if (!existingCompetency) {
          skillObject.competencies.push({
            name: competency.name,
            selected: true,
          });
        }
      }
    }
    
    // Filter out any categories with no skills or skills with no competencies
    outputResult.categories = outputResult.categories
      .map(category => ({
        ...category,
        skills: category.skills.filter(skill => skill.competencies.length > 0),
      }))
      .filter(category => category.skills.length > 0);

    // Log the reconstructed result
    console.log("\n==== RECONSTRUCTED RESULT FROM INDICES ====");
    console.log(`Analysis complete: Extracted ${outputResult.categories.length} categories`);
    console.log(`Total skills extracted: ${outputResult.categories.reduce(
      (count, category) => count + category.skills.length, 0
    )}`);

    // Log each category and its skills
    console.log("\n==== EXTRACTED SKILLS BY CATEGORY ====");
    outputResult.categories.forEach(category => {
      console.log(`Category: ${category.name} (${category.skills.length} skills)`);
      category.skills.forEach(skill => {
        console.log(`  - ${skill.name} (${skill.competencies.length} competencies)`);
        skill.competencies.forEach(comp => {
          console.log(`    • ${comp.name}`);
        });
      });
    });
    console.log("======================================\n");

    return outputResult;
  } catch (error) {
    console.error("Error in AI skill extraction:", error);
    throw new Error(`Failed to extract skills: ${error instanceof Error ? error.message : String(error)}`);
  }
} 