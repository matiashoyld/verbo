import { createAssessmentGenerationPrompt } from "~/lib/prompts";
import { GeneratedAssessment } from "~/types/prompts";
import { model } from "./client";
import { generateFallbackId } from "./utils";

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
    // Track all competencies being used with their IDs for later lookup
    const competencyIdMap = new Map<string, { numId: number | null, categoryNumId: number | null, skillNumId: number | null }>();

    // Transform the skills data to the format expected by the prompt
    const formattedSkills = skillsData.categories.map((category, categoryIndex) => {
      // Use actual numId if available, otherwise generate a fallback ID
      const categoryNumId = category.numId ?? generateFallbackId(categoryIndex, 'category');
      
      return {
        numId: categoryNumId,
        name: category.name,
        skills: category.skills
          .filter(skill => skill.competencies.some(comp => comp.selected))
          .map((skill, skillIndex) => {
            // Use actual numId if available, otherwise generate a fallback ID
            const skillNumId = skill.numId ?? generateFallbackId(skillIndex, 'skill');
            
            return {
              numId: skillNumId,
              name: skill.name,
              competencies: skill.competencies
                .filter(comp => comp.selected)
                .map((competency, competencyIndex) => {
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

    // Construct prompt for the AI using the extracted prompt
    const prompt = createAssessmentGenerationPrompt(jobDescription, formattedSkills);

    // Call the Gemini API with the constructed prompt
    const aiResult = await model.generateContent(prompt);
    const response = await aiResult.response;
    const text = response.text();

    // Initialize variables for extracted data
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
              skillNumId: mappedId?.skillNumId || null,
            };
          });
          
          questions.push({
            context: questionContext,
            question: questionText,
            competencies_assessed: skillsAssessed,
            skills_assessed: skillsAssessed,
          });
        }
      }
    }

    // Fallback: Try to extract JSON directly if markdown approach fails
    if (!context || questions.length === 0) {
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
              skills_assessed?: Array<{ numId?: number; name?: string }>;
              competencies_assessed?: Array<{ numId?: number; name?: string }>;
            }) => {
              // Support both old and new field names for backward compatibility
              const competenciesArray = q.competencies_assessed || q.skills_assessed || [];
              
              const competencies_assessed = Array.isArray(competenciesArray) 
                ? competenciesArray.map((c: { numId?: number; name?: string }) => {
                    const competencyName = c.name?.toLowerCase() || "";
                    const mappedCompetency = competencyIdMap.get(competencyName);
                    
                    return {
                      numId: c.numId || mappedCompetency?.numId || null,
                      name: c.name || "Unknown Competency",
                      skillNumId: mappedCompetency?.skillNumId || null,
                    };
                  })
                : [];
                
              return {
                context: q.context || "",
                question: q.question || "",
                competencies_assessed,
                skills_assessed: competencies_assessed
              };
            });
          }
        }
      } catch (jsonError) {
        // JSON extraction fallback failed, continue to final fallback
      }
    }
    
    // Final fallback: if we still don't have usable data, create a basic structure
    if (!context || questions.length === 0) {
      // Create a minimal viable response using whatever text we can extract
      context = "Based on the job description, complete the following assessment tasks to demonstrate your skills.";
      
      // Create at least one question from the response
      const lines = text.split('\n').filter(line => line.trim().length > 20);
      if (lines.length > 2) {
        questions.push({
          context: lines[0] || "",
          question: lines[1] || "",
          competencies_assessed: Array.from(competencyIdMap.entries())
            .slice(0, 2)
            .map(([key, value]) => ({
              numId: value?.numId || null,
              name: key,
              skillNumId: value?.skillNumId || null,
            })),
          skills_assessed: Array.from(competencyIdMap.entries())
            .slice(0, 2)
            .map(([key, value]) => ({
              numId: value?.numId || null,
              name: key,
              skillNumId: value?.skillNumId || null,
            }))
        });
      } else {
        questions.push({
          context: "Technical assessment scenario",
          question: "Demonstrate your technical skills by solving this problem",
          competencies_assessed: [],
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

    return result;
  } catch (error) {
    throw new Error(`Failed to generate assessment: ${error instanceof Error ? error.message : String(error)}`);
  }
} 