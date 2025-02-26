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

// Types for the assessment generator
export interface AssessmentQuestion {
  context: string;
  question: string;
  skills_assessed: Array<{
    id: number;
    name: string;
  }>;
}

export interface GeneratedAssessment {
  context: string;
  questions: AssessmentQuestion[];
}

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
    
    // Construct prompt for the AI - EXACTLY matching prompt.txt
    const prompt = `# Technical Assessment Case Study Generator

## Overview
You will generate a comprehensive technical assessment case study based on the provided job description and skills list. The output will be a JSON document that presents a realistic scenario with targeted questions to assess specific skills and competencies.

## Input Format
You will receive two main inputs:

1. **Job Description**:
   A text description of a job role, including responsibilities, requirements, and context.

2. **Skills List**:
   A structured JSON object containing categories, skills, and competencies to assess, formatted as:
   \`\`\`json
   [
     {
       "id": 23,
       "name": "Databases & SQL",
       "skills": [
         {
           "id": 0,
           "name": "SQL Fundamentals",
           "competencies": [
             {
               "id": 0,
               "name": "SELECT Queries"
             },
             {
               "id": 1,
               "name": "CASE/IF"
             }
             // Additional competencies...
           ]
         },
         // Additional skills...
       ]
     },
     // Additional categories...
   ]
   \`\`\`

## Output Format
Your out put should be two different blocks enclosed in \`\`\` \`\`\` tags.

The first block should be a markdown formatted text block with the following content:

\`\`\`markdown
"A detailed description of the scenario, including company background, role context, and available data/resources"
\`\`\

The second block of text should be a JSON object with the following structure:

\`\`\`json
{
  "questions": [
    {
      "context": "Brief context specific to this question",
      "question": "The actual question to be answered by the candidate",
      "skills_assessed": [
        {
          "id": 0,
          "name": "Skill Name"
        },
        {
          "id": 1,
          "name": "Another Skill"
        }
      ]
    },
    // Additional questions following the same structure
  ]
}
\`\`\`

## Guidelines for Creating the Case Study

### For the Main Context:
1. Choose a realistic company and role that matches the job description
2. Create a detailed scenario relevant to the industry and position
3. Include specific datasets, tools, or resources the candidate would use (include sample data tables if relevant)
4. Make the scenario detailed enough to support 6-8 questions that assess different skills
5. Ensure the context provides sufficient information for answering the questions
6. Don't add a title. Just start with the context.

### For Each Question:
1. Create a specific sub-context that focuses on a particular aspect of the main scenario
2. Formulate a clear, challenging question that requires demonstrating specific skills
3. Tag each question with 2-4 relevant skills from the provided skills list using their exact IDs and names
4. Vary question types to assess different aspects: technical implementation, analysis, design, communication, etc.
5. Ensure questions progressively build in complexity
6. For technical questions (like SQL), ensure they have enough context to be answerable
7. Each question should be something that can be answered in 5-10 minutes.

### Skill Assessment Distribution:
1. Cover at least 75% of the skills provided in the input list
2. Prioritize skills that appear more relevant to the job description
3. Ensure a balanced distribution of skills across all questions
4. Include at least one question that assesses multiple skill categories

## Formatting Guidelines
1. The output should be just the two blocks of text.
2. For the "context" field, use markdown formatting. Feel free to use bullets, tables and other markdown elements to make the context more engaging.
3. For the "skills_assessed" array, always include both the "id" and "name" exactly as they appear in the input skills list
4. Do not include comments (like "// Additional questions...") in the final JSON output
5. Ensure all questions are completely formulated and ready for assessment without placeholders

## Example
Using a Data Scientist job description and a skills list with categories like "Databases & SQL" and "Data Analysis", the output would be:

\`\`\`markdown
You are working as a Data Scientist at Meta. You're analyzing one of the platform's core features - the **one-on-one video calling** system that connects billions of users worldwide through Facebook Messenger. The feature has been a cornerstone of Meta's communication tools for years, enabling friends and family to have face-to-face conversations regardless of physical distance. To help inform strategic decisions about the feature's evolution, you have access to two comprehensive datasets:

### Table: \`video_calls\`

| Column           | Description                         |
|-----------------|-------------------------------------|
| caller          | User ID initiating the call         |
| recipient       | User ID receiving the call          |
| ds              | Date of the call                    |
| call_id         | Unique call identifier              |
| duration_seconds| Length of the call in seconds       |

Here is some example data:

| caller | recipient | ds         | call_id | duration_seconds |
|--------|-----------|------------|---------|------------------|
| 458921 | 672104    | 2023-01-01 | v8k2p9  | 183             |
| 458921 | 891345    | 2023-01-01 | m4n7v2  | 472             |
| 672104 | 234567    | 2023-01-02 | x9h5j4  | 256             |
| 891345 | 345678    | 2023-01-02 | q2w3e4  | 67              |
| 345678 | 891345    | 2023-01-03 | t7y8u9  | 124             |
| 234567 | 458921    | 2023-01-03 | p3l5k8  | 538             |

### Table: \`daily_active_users\`

| Column           | Description                               |
|-----------------|-------------------------------------------|
| user_id         | Unique identifier for the user            |
| ds              | Date the user was active/logged in        |
| country         | User's country                            |
| daily_active_flag| Indicates if user was active that day (1) |

Below you can see an example data:

| user_id | ds         | country | daily_active_flag |
|---------|-----------|---------|--------------------|
| 458921  | 2023-01-01| France  | 1                 |
| 672104  | 2023-01-01| France  | 1                 |
| 891345  | 2023-01-01| Spain   | 1                 |
| 234567  | 2023-01-02| France  | 1                 |
| 345678  | 2023-01-02| France  | 1                 |
| 458921  | 2023-01-03| France  | 1                 |

The company is considering launching a **group video chat** feature. You'll be using these tables for analysis on user behavior, potential demand, and how to measure success.
\`\`\`

\`\`\`json
{
  "questions": [
    {
      "context": "Using the \`video_calls\` table.",
      "question": "Write a SQL query to calculate how many users started a call with more than three different people in the last 7 days. Explain how you would optimize this query if it needed to run against a massive dataset.",
      "skills_assessed": [
        {
          "id": 0,
          "name": "SQL Fundamentals"
        },
        {
          "id": 1,
          "name": "Database Optimization"
        }
      ]
    }
  ]
}
\`\`\`

## Instructions
1. Analyze the job description to understand the role, industry, and key responsibilities
2. Review the skills list to identify important capabilities to assess
3. Create a realistic, detailed scenario relevant to the job that includes any necessary data structures, tables, or resources
4. Generate 6-8 questions that collectively assess the key skills
5. Format the output as the specified JSON structure with proper JSON syntax
6. Ensure the case study is challenging but realistic for the target role
7. Verify that the JSON output is valid before submission

## Job Description:
${jobDescription}

## Skills List:
${JSON.stringify(formattedSkills, null, 2)}
`;

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