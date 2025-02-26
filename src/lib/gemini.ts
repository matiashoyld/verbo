import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  createAssessmentGenerationPrompt,
  createSkillExtractionPrompt
} from "~/lib/prompts";
import {
  AISkillsResult,
  GeneratedAssessment,
  IndexedAIResponse,
  IndexedSkillsData
} from "~/types/prompts";

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Create a model instance with the appropriate model name
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

// Types for indexed database structure have been moved to src/types/prompts.ts

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

    // Construct prompt for the AI with indexed data structure using the extracted prompt
    const prompt = createSkillExtractionPrompt(jobDescription, indexedData);

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

/**
 * Generates a technical assessment case using Gemini AI
 * @param jobDescription The job description for context
 * @param skillsData Structured data containing selected skills and competencies
 */
export async function generateAssessmentCase(
  jobDescription: string,
  skillsData: {
    categories: Array<{
      name: string;
      skills: Array<{
        name: string;
        competencies: Array<{
          name: string;
          selected: boolean;
        }>;
      }>;
    }>;
  }
): Promise<GeneratedAssessment> {
  try {
    console.log("\n==== ASSESSMENT GENERATION PROCESS STARTING ====");
    console.log("Generating assessment case with Gemini AI...");
    
    // Transform the skills data to the format expected by the prompt
    const formattedSkills = skillsData.categories.map((category, categoryIndex) => {
      return {
        id: categoryIndex,
        name: category.name,
        skills: category.skills
          .filter(skill => skill.competencies.some(comp => comp.selected))
          .map((skill, skillIndex) => {
            return {
              id: skillIndex,
              name: skill.name,
              competencies: skill.competencies
                .filter(comp => comp.selected)
                .map((competency, compIndex) => {
                  return {
                    id: compIndex,
                    name: competency.name,
                  };
                }),
            };
          }),
      };
    }).filter(category => category.skills.length > 0);

    console.log(`Processed data for Assessment: ${formattedSkills.length} categories with selected skills`);
    
    // Construct prompt for the AI using the extracted prompt
    const prompt = createAssessmentGenerationPrompt(jobDescription, formattedSkills);

    console.log("\nSending request to Gemini AI for assessment generation...");
    const aiResult = await model.generateContent(prompt);
    const response = await aiResult.response;
    const text = response.text();

    console.log("\n==== RECEIVED RESPONSE FROM GEMINI AI ====");
    console.log("Processing response...");

    // Extract markdown and JSON blocks from the response
    const markdownMatch = text.match(/```markdown\s*([\s\S]*?)\s*```/);
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (!markdownMatch || !jsonMatch) {
      console.error("Could not extract markdown or JSON blocks from Gemini response");
      throw new Error("Failed to generate assessment case: invalid response format");
    }

    // Since we've checked that markdownMatch and jsonMatch are not null, we can safely access their elements
    // TypeScript doesn't recognize the above check as guaranteeing non-nullness of array elements
    // so we add additional null checks
    const contextMarkdown = markdownMatch[1] ? markdownMatch[1].trim() : '';
    const jsonString = jsonMatch[1] ? jsonMatch[1].trim() : '';

    console.log("\n==== EXTRACTED MARKDOWN CONTEXT ====");
    console.log(contextMarkdown.substring(0, 200) + "...");
    console.log("\n==== EXTRACTED JSON QUESTIONS ====");
    console.log(jsonString.substring(0, 200) + "...");

    // Parse the JSON questions
    const parsedQuestions = JSON.parse(jsonString);
    
    // Validate the questions structure
    if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
      throw new Error("Invalid response format: missing or malformed 'questions' array");
    }

    // Create combined response
    const generatedAssessment: GeneratedAssessment = {
      context: contextMarkdown,
      questions: parsedQuestions.questions
    };

    return generatedAssessment;
  } catch (error) {
    console.error("Error generating assessment case:", error);
    throw new Error(`Failed to generate assessment case: ${error instanceof Error ? error.message : String(error)}`);
  }
} 