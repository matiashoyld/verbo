import { createSkillExtractionPrompt } from "~/lib/prompts";
import { AISkillsResult, IndexedAIResponse, IndexedSkillsData } from "~/types/prompts";
import { model } from "./client";

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
      numId?: number | null;
      skills: Array<{
        name: string;
        numId?: number | null;
        competencies: Array<{
          name: string;
          numId?: number | null;
        }>;
      }>;
    }>;
  }
): Promise<AISkillsResult> {
  console.log("[SKILLS EXTRACTION] Starting skills extraction process");
  try {
    // Transform the input data to include database numIds
    const indexedData: IndexedSkillsData = {
      categories: allDatabaseData.categories.map((category) => ({
        numId: category.numId || null,
        name: category.name,
        skills: category.skills.map((skill) => ({
          numId: skill.numId || null,
          name: skill.name,
          competencies: skill.competencies.map((competency) => ({
            numId: competency.numId || null,
            name: competency.name,
          })),
        })),
      })),
    };

    console.log("[SKILLS EXTRACTION] Data indexed, constructing prompt");
    // Construct prompt for the AI with indexed data structure
    const prompt = createSkillExtractionPrompt(jobDescription, indexedData);

    console.log("[SKILLS EXTRACTION] Calling Gemini API");
    // Call the Gemini API with the constructed prompt
    const aiResult = await model.generateContent(prompt);
    const response = await aiResult.response;
    const text = response.text();
    console.log("[SKILLS EXTRACTION] Received response from Gemini");

    // Find and extract the JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[SKILLS EXTRACTION] Failed to match JSON in response text");
      console.log("[SKILLS EXTRACTION] Response text:", text.substring(0, 500) + "...");
      throw new Error("Failed to extract skills from job description: No JSON found in response");
    }

    const jsonString = jsonMatch[0];
    console.log("[SKILLS EXTRACTION] JSON extracted, attempting to parse");
    
    try {
      // Parse the indexed response
      const parsedIndexResponse = JSON.parse(jsonString) as IndexedAIResponse;
      
      // Validate the response structure
      if (!parsedIndexResponse.selected_competencies || !Array.isArray(parsedIndexResponse.selected_competencies)) {
        console.error("[SKILLS EXTRACTION] Invalid response format", parsedIndexResponse);
        throw new Error("Invalid response format: missing or malformed 'selected_competencies'");
      }

      // Extract the position name
      const positionName = parsedIndexResponse.position_name || "Untitled Position";
      console.log("[SKILLS EXTRACTION] Position name extracted:", positionName);

      // Reconstruct the complete data structure from the indices
      const outputResult: AISkillsResult = {
        positionName: positionName,
        categories: [],
      };
      
      // Map to track categories we've already added to avoid duplicates
      const addedCategories = new Map<number, number>();
      
      // Process each set of selections
      for (const selection of parsedIndexResponse.selected_competencies) {
        // Get the category and skill from the indexed data
        const categoryId = selection.category_numId;
        const category = indexedData.categories.find(c => c.numId === categoryId);
        if (!category) {
          continue;
        }
        
        const skillId = selection.skill_numId;
        const skill = category.skills.find(s => s.numId === skillId);
        if (!skill) {
          continue;
        }
        
        // Get or create the category in our result
        let categoryIndex = addedCategories.get(categoryId || -1);
        if (categoryIndex === undefined) {
          categoryIndex = outputResult.categories.length;
          addedCategories.set(categoryId || -1, categoryIndex);
          outputResult.categories.push({
            name: category.name,
            numId: category.numId as number | undefined, // Cast to match the expected type
            skills: [],
          });
        }
        
        // Get the result category we're working with
        const resultCategory = outputResult.categories[categoryIndex];
        if (!resultCategory) {
          continue;
        }
        
        // Find if the skill is already added to this category
        const existingSkillIndex = resultCategory.skills.findIndex(
          (s) => s.name === skill.name
        );
        
        // Create or get the skill object
        let skillObject: {
          name: string;
          numId?: number;
          competencies: Array<{ name: string; numId?: number; selected: boolean }>;
        };
        
        if (existingSkillIndex === -1) {
          // Add new skill to the category
          skillObject = {
            name: skill.name,
            numId: skill.numId as number | undefined, // Cast to match the expected type
            competencies: [],
          };
          resultCategory.skills.push(skillObject);
        } else {
          // Use existing skill
          skillObject = resultCategory.skills[existingSkillIndex]!;
        }
        
        // Add the selected competencies
        for (const competencyId of selection.competency_numIds) {
          const competency = skill.competencies.find(c => c.numId === competencyId);
          if (!competency) {
            continue;
          }
          
          // Check if this competency is already added
          const existingCompetency = skillObject.competencies.find(c => c.name === competency.name);
          if (!existingCompetency) {
            skillObject.competencies.push({
              name: competency.name,
              numId: competency.numId as number | undefined, // Cast to match the expected type
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

      console.log("[SKILLS EXTRACTION] Successfully completed extraction");
      return outputResult;
    } catch (parseError) {
      console.error("[SKILLS EXTRACTION] JSON parse error:", parseError);
      console.log("[SKILLS EXTRACTION] JSON string that failed to parse:", jsonString);
      throw new Error(`Failed to parse AI response JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error) {
    console.error("[SKILLS EXTRACTION] Error in extraction process:", error);
    throw new Error(`Failed to extract skills: ${error instanceof Error ? error.message : String(error)}`);
  }
} 