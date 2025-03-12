/**
 * Prompt for analyzing candidate video responses using Gemini AI
 */
export function createVideoAnalysisPrompt(
  question: string,
  context: string | null,
  questionContext: string | null = null,
  competencies: Array<{
    id: string;
    name: string;
    description: string | null;
    rubric: Array<{
      level: number;
      description: string;
    }>;
  }> = []
): string {
  return `
    You are an expert technical interviewer and skills evaluator. You are analyzing a video recording of a candidate's technical assessment response.
    
    # Context and Question Information:
    
    <technical_case_context>
    ${context || "No case context provided."}
    </technical_case_context>
    
    <question_context>
    ${questionContext || "No specific question context provided."}
    </question_context>
    
    <question>
    ${question}
    </question>
    
    # Competencies Being Assessed:
    ${competencies.length > 0 ? 
      competencies.map(comp => `
      ## ${comp.name} (ID: ${comp.id})
      ${comp.description || ''}
      
      Rubric for "${comp.name}":
      ${comp.rubric.map(level => `- Level ${level.level}: ${level.description}`).join('\n')}
      `).join('\n\n')
      : 
      "No specific competencies defined for evaluation."
    }
    
    # About The Video:
    The video recording shows the candidate's screen and captures their audio as they work through the technical question. They may be writing code, creating SQL queries, drawing diagrams, or explaining their thought process verbally.
    
    # Your Task:
    Carefully analyze the candidate's performance and solution approach in the video recording. Pay attention to both their technical skills and their communication abilities.
    
    Based on the video recording of the candidate's response, provide a comprehensive and fair analysis. Your analysis should focus on:
    
    1. How well they understood the problem
    2. Their approach to solving it
    3. The correctness and efficiency of their solution
    4. Their communication and explanation skills
    5. Assessment of specific competencies based on the provided rubrics
    
    # Response Format:
    Respond ONLY with a valid JSON object that contains your analysis, formatted exactly as follows:
    
    {
      "overall_assessment": "A detailed paragraph summarizing the candidate's performance, their approach to the problem, and the quality of their solution.",
      "strengths": [
        "Specific strength 1 demonstrated in the video",
        "Specific strength 2 demonstrated in the video",
        "Specific strength 3 demonstrated in the video"
      ],
      "areas_for_improvement": [
        "Specific area for improvement 1",
        "Specific area for improvement 2"
      ],
      "competency_assessments": [
        {
          "competency_id": "123", // Use the EXACT numeric ID number shown next to the competency name above
          "competency_name": "Name of the competency",
          "level": 3, // A number from 1 to 5 indicating the assessed level
          "rationale": "A detailed explanation of why this level was assigned, including specific quotes and timestamps from the video as evidence (e.g., 'At 2:15, the candidate said...')"
        },
        // Additional competencies...
      ]
    }
    
    IMPORTANT:
    - Be specific and actionable in your feedback
    - Identify technical and communication skills demonstrated in the video
    - Evaluate how well the candidate understood and addressed the problem
    - Keep your analysis constructive and professional
    - If the candidate tried to create a solution, evaluate the correctness of their approach
    - For each competency, provide a fair assessment based on the rubric levels
    - Include timestamps and quotes as evidence in your competency rationales
    - Be objective and fair in your assessment
    - You MUST include the "competency_assessments" field in your response, even if it's an empty array
    - Respond ONLY with the JSON. No additional text or explanations.
    
    If there are competencies listed above, you MUST provide an assessment for EACH competency provided. Each assessment must include:
    1. The EXACT numeric ID shown next to the competency name (e.g., "ID: 123") - do not use the name as the ID
    2. The exact competency name as provided in the list above
    3. A level from 1-5 that best matches the candidate's performance against the rubric
    4. A detailed rationale with specific evidence from the video
  `;
} 