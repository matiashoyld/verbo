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

// Add API request timeout (30 seconds)
const API_TIMEOUT_MS = 30000;

/**
 * Helper function to create a promise that rejects after specified timeout
 */
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
}

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
  try {
    console.log("\n==== SKILL EXTRACTION PROCESS STARTING ====");
    console.log("Extracting skills from job description with Gemini AI...");
    
    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY environment variable is not set");
      throw new Error("Google AI API key is missing");
    }
    
    // Log API configuration (without exposing the full key)
    const apiKeyPrefix = process.env.GOOGLE_AI_API_KEY.substring(0, 4);
    console.log(`Using Gemini API with key prefix: ${apiKeyPrefix}***`);
    console.log(`Using model: gemini-2.0-flash-thinking-exp-01-21`);
    
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

    // Make API request with timing and detailed logging
    console.log("\nSending request to Gemini AI...");
    const startTime = Date.now();
    
    try {
      // Use Promise.race to implement a timeout
      const aiResult = await Promise.race([
        model.generateContent(prompt),
        createTimeout(API_TIMEOUT_MS)
      ]);
      
      console.log(`API request completed in ${Date.now() - startTime}ms`);
      
      // Process the response
      console.log("Getting response from Gemini AI result...");
      const response = await aiResult.response;
      
      console.log("Extracting text from response...");
      const text = response.text();
      
      console.log(`Received ${text.length} characters in response`);

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
        const categoryId = selection.category_numId;
        const category = indexedData.categories.find(c => c.numId === categoryId);
        if (!category) {
          console.warn(`Category with numId ${categoryId} not found`);
          continue;
        }
        
        const skillId = selection.skill_numId;
        const skill = category.skills.find(s => s.numId === skillId);
        if (!skill) {
          console.warn(`Skill with numId ${skillId} not found in category ${category.name}`);
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
          // Use existing skill - use a non-null assertion since we know it exists
          // (we just found its index in the array)
          skillObject = resultCategory.skills[existingSkillIndex]!;
        }
        
        // Add the selected competencies
        for (const competencyId of selection.competency_numIds) {
          const competency = skill.competencies.find(c => c.numId === competencyId);
          if (!competency) {
            console.warn(`Competency with numId ${competencyId} not found in skill ${skill.name}`);
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

      // Log the reconstructed result
      console.log("\n==== RECONSTRUCTED RESULT FROM INDICES ====");
      console.log(`Analysis complete: Extracted ${outputResult.categories.length} categories`);
      console.log(`Total skills extracted: ${outputResult.categories.reduce(
        (count, category) => count + category.skills.length, 0
      )}`);

      // Log each category and its skills, now with numIds
      console.log("\n==== EXTRACTED SKILLS BY CATEGORY ====");
      outputResult.categories.forEach(category => {
        console.log(`Category: ${category.name} (numId: ${category.numId ?? 'unknown'}) (${category.skills.length} skills)`);
        category.skills.forEach(skill => {
          console.log(`  - ${skill.name} (numId: ${skill.numId ?? 'unknown'}) (${skill.competencies.length} competencies)`);
          skill.competencies.forEach(comp => {
            console.log(`    • ${comp.name} (numId: ${comp.numId ?? 'unknown'})`);
          });
        });
      });
      console.log("======================================\n");

      return outputResult;
    } catch (apiError) {
      console.error("Error during Gemini API call:", apiError);
      console.error("API call elapsed time:", Date.now() - startTime, "ms");
      
      // Additional diagnostic information about the error
      if (apiError instanceof Error) {
        console.error("Error name:", apiError.name);
        console.error("Error message:", apiError.message);
        console.error("Error stack:", apiError.stack);
      } else {
        console.error("Non-Error object thrown:", apiError);
      }
      
      throw new Error(`Gemini API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
    }
  } catch (error) {
    console.error("Error in AI skill extraction:", error);
    // Add more error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
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
      numId?: number | null;
      skills: Array<{
        name: string;
        numId?: number | null;
        competencies: Array<{
          name: string;
          selected: boolean;
          numId?: number | null;
        }>;
      }>;
    }>;
  }
): Promise<GeneratedAssessment> {
  try {
    console.log("\n==== ASSESSMENT GENERATION PROCESS STARTING ====");
    console.log("Generating assessment case with Gemini AI...");
    
    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY environment variable is not set");
      throw new Error("Google AI API key is missing");
    }
    
    // Log API configuration (without exposing the full key)
    const apiKeyPrefix = process.env.GOOGLE_AI_API_KEY.substring(0, 4);
    console.log(`Using Gemini API with key prefix: ${apiKeyPrefix}***`);
    console.log(`Using model: gemini-2.0-flash-thinking-exp-01-21`);
    
    // Updated function to generate safe fallback IDs that won't conflict with real database IDs
    // Returns a negative ID that includes information about the entity type
    const generateFallbackId = (index: number, entityType: string): number => {
      // Use negative numbers to distinguish from real IDs
      // Add a multiplier based on entity type to avoid collisions between different entity types
      const typeMultiplier = 
        entityType === 'category' ? 10000 :
        entityType === 'skill' ? 20000 : 30000; // 30000 for competency
      
      return -(index + 1 + typeMultiplier);
    };

    // Track all competencies being used with their IDs for later lookup
    const competencyIdMap = new Map<string, { numId: number | null, categoryNumId: number | null, skillNumId: number | null }>();

    // Track missing ID counts for logging
    let missingCategoryIds = 0;
    let missingSkillIds = 0;
    let missingCompetencyIds = 0;

    // Transform the skills data to the format expected by the prompt
    const formattedSkills = skillsData.categories.map((category, categoryIndex) => {
      // Log when a category doesn't have a numId
      if (!category.numId) {
        console.warn(`Category without numId: ${category.name}`);
        missingCategoryIds++;
      }
      
      // Use actual numId if available, otherwise generate a fallback ID
      // This ensures we don't create large hash values that might be confused with real IDs
      const categoryNumId = category.numId ?? generateFallbackId(categoryIndex, 'category');
      
      return {
        numId: categoryNumId,
        name: category.name,
        skills: category.skills
          .filter(skill => skill.competencies.some(comp => comp.selected))
          .map((skill, skillIndex) => {
            // Log when a skill doesn't have a numId
            if (!skill.numId) {
              console.warn(`Skill without numId: ${skill.name} in category ${category.name}`);
              missingSkillIds++;
            }
            
            // Use actual numId if available, otherwise generate a fallback ID
            const skillNumId = skill.numId ?? generateFallbackId(skillIndex, 'skill');
            
            return {
              numId: skillNumId,
              name: skill.name,
              competencies: skill.competencies
                .filter(comp => comp.selected)
                .map((competency, competencyIndex) => {
                  // Log when a competency doesn't have a numId
                  if (!competency.numId) {
                    console.warn(`Competency without numId: ${competency.name} in skill ${skill.name}`);
                    missingCompetencyIds++;
                  }
                  
                  // Use actual numId if available, otherwise generate a fallback ID
                  const competencyNumId = competency.numId ?? generateFallbackId(competencyIndex, 'competency');
                  
                  // Record competency ID mapping for later lookup
                  competencyIdMap.set(competency.name.toLowerCase(), {
                    numId: competencyNumId,
                    categoryNumId: categoryNumId,
                    skillNumId: skillNumId
                  });
                  
                  return {
                    numId: competencyNumId,
                    name: competency.name,
                  };
                }),
            };
          }),
      };
    }).filter(category => category.skills.length > 0);

    // Log summary of missing numIds
    console.log(`Missing numId summary:
- Categories missing numId: ${missingCategoryIds}
- Skills missing numId: ${missingSkillIds}
- Competencies missing numId: ${missingCompetencyIds}`);

    // Log summary of numId usage
    const numIdStats = {
      categoriesWithNumId: formattedSkills.filter(cat => cat.numId && cat.numId > 0).length,
      totalCategories: formattedSkills.length,
      skillsWithNumId: 0,
      totalSkills: 0,
      competenciesWithNumId: 0,
      totalCompetencies: 0,
    };
    
    // Count skills and competencies with numIds
    formattedSkills.forEach(cat => {
      numIdStats.totalSkills += cat.skills.length;
      numIdStats.skillsWithNumId += cat.skills.filter(skill => !!skill.numId).length;
      
      cat.skills.forEach(skill => {
        numIdStats.totalCompetencies += skill.competencies.length;
        numIdStats.competenciesWithNumId += skill.competencies.filter(comp => !!comp.numId).length;
      });
    });
    
    console.log(`NumId statistics:
- Categories: ${numIdStats.categoriesWithNumId}/${numIdStats.totalCategories} (${Math.round(numIdStats.categoriesWithNumId/numIdStats.totalCategories*100)}%)
- Skills: ${numIdStats.skillsWithNumId}/${numIdStats.totalSkills} (${Math.round(numIdStats.skillsWithNumId/numIdStats.totalSkills*100)}%)
- Competencies: ${numIdStats.competenciesWithNumId}/${numIdStats.totalCompetencies} (${Math.round(numIdStats.competenciesWithNumId/numIdStats.totalCompetencies*100)}%)`);

    // Construct prompt for the AI using the extracted prompt
    const prompt = createAssessmentGenerationPrompt(jobDescription, formattedSkills);

    // Log the full prompt being sent to the AI
    console.log("\n==== FULL PROMPT SENT TO GEMINI AI ====");
    console.log(prompt);
    console.log("=====================================");

    // Call the Gemini API with the constructed prompt
    console.log("\nSending request to Gemini AI...");
    const startTime = Date.now();
    
    let text;
    try {
      // Use Promise.race to implement a timeout
      const aiResult = await Promise.race([
        model.generateContent(prompt),
        createTimeout(API_TIMEOUT_MS)
      ]);
      
      console.log(`API request completed in ${Date.now() - startTime}ms`);
      
      // Process the response
      console.log("Getting response from Gemini AI result...");
      const response = await aiResult.response;
      
      console.log("Extracting text from response...");
      text = response.text();
      
      console.log(`Received ${text.length} characters in response`);
    } catch (apiError) {
      console.error("Error during Gemini API call:", apiError);
      console.error("API call elapsed time:", Date.now() - startTime, "ms");
      
      // Additional diagnostic information about the error
      if (apiError instanceof Error) {
        console.error("Error name:", apiError.name);
        console.error("Error message:", apiError.message);
        console.error("Error stack:", apiError.stack);
      } else {
        console.error("Non-Error object thrown:", apiError);
      }
      
      throw new Error(`Gemini API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
    }

    // Improved extraction logic with multiple fallback approaches
    let context = "";
    let questions = [];

    // Try to extract markdown blocks from the response first (# Assessment Case, # Questions)
    const contextMatches = text.match(/# Assessment Case\s+([\s\S]*?)(?=# Questions|$)/);
    const questionsMatches = text.match(/# Questions\s+([\s\S]*)/);

    if (contextMatches && questionsMatches) {
      context = contextMatches[1]?.trim() || "";
      const questionsText = questionsMatches[1]?.trim() || "";

      // Parse questions from the questions text
      // Format expected: ## Question N: Title \n Context \n\n Question text \n\n Skills assessed: skill1, skill2
      const questionRegex = /## Question (\d+)(?::[^\n]*)?\s+([\s\S]*?)(?=## Question \d+|$)/g;
      let match;

      while ((match = questionRegex.exec(questionsText)) !== null) {
        // Ensure match[2] exists before trying to use it
        if (!match[2]) continue;
        
        const fullQuestionText = match[2].trim();
        
        // Parse out the context, question, and skills assessed
        const contextMatch = fullQuestionText.match(/([\s\S]*?)(?=\n\n)/);
        const questionMatch = fullQuestionText.match(/\n\n([\s\S]*?)(?=\n\nSkills assessed:|$)/);
        const skillsMatch = fullQuestionText.match(/Skills assessed:([\s\S]*)/);
        
        if (contextMatch?.[1] && questionMatch?.[1]) {
          const questionContext = contextMatch[1].trim();
          const questionText = questionMatch[1].trim();
          const skillsText = skillsMatch?.[1]?.trim() || "";
          
          // Parse skills from comma-separated list
          const skillsList = skillsText.split(',').map(s => s.trim()).filter(s => s);
          
          // Map skills to their IDs
          const skillsAssessed = skillsList.map((skill) => {
            const skillLower = skill.toLowerCase();
            const mappedId = competencyIdMap.get(skillLower);
            
            return {
              numId: mappedId?.numId || null,
              name: skill,
            };
          });
          
          questions.push({
            context: questionContext,
            question: questionText,
            skills_assessed: skillsAssessed,
          });
        }
      }
    }

    // Fallback: Try to extract JSON directly if markdown approach fails
    if (!context || questions.length === 0) {
      console.log("Structured extraction failed, trying direct JSON extraction...");
      try {
        // Find any JSON-like structure in the response
        const jsonMatches = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                            text.match(/(\{[\s\S]*"questions"[\s\S]*?\})/);
                            
        if (jsonMatches && jsonMatches[1]) {
          const extractedJson = jsonMatches[1];
          const parsedJson = JSON.parse(extractedJson);
          
          // Extract context from parsed JSON if available
          if (parsedJson && parsedJson.context) {
            context = parsedJson.context;
          } else if (text.includes("```markdown")) {
            // Try to extract markdown block if JSON doesn't have context
            const markdownMatch = text.match(/```markdown\s*([\s\S]*?)\s*```/);
            if (markdownMatch && markdownMatch[1]) {
              context = markdownMatch[1].trim();
            }
          }
          
          // If context is still empty, extract a reasonable portion from the beginning of the response
          if (!context) {
            // Get first substantial paragraph
            const firstParagraphs = text.split('\n\n').filter(p => p.trim().length > 50);
            if (firstParagraphs.length > 0) {
              context = firstParagraphs[0]?.trim() || "";
            }
          }
          
          // Extract questions array from JSON
          if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
            questions = parsedJson.questions.map((q: { 
              context?: string; 
              question?: string; 
              skills_assessed?: Array<{ numId?: number; name?: string }> 
            }) => {
              const skills_assessed = Array.isArray(q.skills_assessed) 
                ? q.skills_assessed.map((s: { numId?: number; name?: string }) => ({
                    numId: s.numId || null,
                    name: s.name || "Unknown Skill"
                  }))
                : [];
                
              return {
                context: q.context || "",
                question: q.question || "",
                skills_assessed
              };
            });
          }
        }
      } catch (jsonError) {
        console.warn("JSON extraction fallback failed:", jsonError);
      }
    }
    
    // Final fallback: if we still don't have usable data, create a basic structure
    if (!context || questions.length === 0) {
      console.warn("All extraction methods failed, using emergency fallback");
      
      // Create a minimal viable response using whatever text we can extract
      context = "Based on the job description, complete the following assessment tasks to demonstrate your skills.";
      
      // Create at least one question from the response
      const lines = text.split('\n').filter(line => line.trim().length > 20);
      if (lines.length > 2) {
        questions.push({
          context: lines[0] || "",
          question: lines[1] || "",
          skills_assessed: Array.from(competencyIdMap.entries())
            .slice(0, 2)
            .map(([key, value]) => ({
              numId: value?.numId || null,
              name: key
            }))
        });
      } else {
        questions.push({
          context: "Technical assessment scenario",
          question: "Demonstrate your technical skills by solving this problem",
          skills_assessed: []
        });
      }
    }

    // Construct final response with IDs preserved
    const result: GeneratedAssessment = {
      context,
      questions,
      _internal: {
        competencyIdMap: Object.fromEntries(
          Array.from(competencyIdMap.entries()).map(([key, value]) => [
            key, 
            { 
              numId: value.numId,
              categoryNumId: value.categoryNumId,
              skillNumId: value.skillNumId
            }
          ])
        )
      }
    };

    // Log summary of questions with skill IDs being generated
    console.log(`\n==== ASSESSMENT GENERATED ====`);
    console.log(`Generated ${questions.length} questions for assessment`);
    console.log(`Context length: ${context.length} characters`);
    
    let totalSkillsAssessed = 0;
    let totalSkillsWithIds = 0;
    
    questions.forEach((q: { 
      context: string; 
      question: string; 
      skills_assessed: Array<{ numId: number | null; name: string }>
    }, i: number) => {
      console.log(`Question ${i+1}: ${q.skills_assessed.length} skills assessed`);
      
      q.skills_assessed.forEach((skill: { numId: number | null; name: string }) => {
        totalSkillsAssessed++;
        if (skill.numId) {
          totalSkillsWithIds++;
          console.log(`  - ${skill.name} (ID: ${skill.numId})`);
        } else {
          console.log(`  - ${skill.name} (No ID found)`);
        }
      });
    });
    
    console.log(`\nTotal skills assessed: ${totalSkillsAssessed}`);
    console.log(`Skills with preserved IDs: ${totalSkillsWithIds} (${Math.round(totalSkillsWithIds/totalSkillsAssessed*100)}%)`);
    console.log(`=============================\n`);

    return result;
  } catch (error) {
    console.error("Error in AI assessment generation:", error);
    // Add more error details for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to generate assessment: ${error instanceof Error ? error.message : String(error)}`);
  }
}