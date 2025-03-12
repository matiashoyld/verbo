import { FormattedSkill } from '~/types/prompts';

/**
 * Prompt for generating assessment cases using Gemini AI
 */
export function createAssessmentGenerationPrompt(
  jobDescription: string, 
  formattedSkills: FormattedSkill[]
): string {
  return `# Technical Assessment Case Study Generator

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
       "numId": 23,
       "name": "Databases & SQL",
       "skills": [
         {
           "numId": 45,
           "name": "SQL Fundamentals",
           "competencies": [
             {
               "numId": 101,
               "name": "SELECT Queries"
             },
             {
               "numId": 102,
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

## Expected Output Format
You must return a JSON object with the following structure:
\`\`\`json
{
  "context": "string - the overall context of the assessment",
  "questions": [
    {
      "context": "string - specific context for this question",
      "question": "string - the actual question text",
      "competencies_assessed": [
        {
          "numId": number or null - the numerical ID of the competency,
          "name": "string - the name of the competency",
          "skillNumId": number or null - the numerical ID of the parent skill
        }
      ]
    }
  ]
}
\`\`\`

## Output Formatting Guidelines
- Return a single, valid JSON object following the above schema exactly
- The "context" field should provide overall background for the assessment case
- Each question should have its own specific context
- Each competency in "competencies_assessed" must have a numId when available
- Always include skillNumId when available to enable proper matching
- Use markdown formatting in text fields for better readability
- Do not include any explanation or additional text outside the JSON object

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
3. Tag each question with 2-4 relevant skills from the provided skills list using their exact numIds and names
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
3. For the "competencies_assessed" array, always include both the competency "numId" and its parent "skillNumId" exactly as they appear in the input skills list
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
      "competencies_assessed": [
        {
          "numId": 101,
          "name": "SELECT Queries",
          "skillNumId": 45
        },
        {
          "numId": 102,
          "name": "CASE/IF",
          "skillNumId": 45
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
} 