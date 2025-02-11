export class PromptStore {
  static getQuestionGenerationPrompt(numberOfQuestions: number): string {
    return `You are a teaching assistant creating questions based on a document. Create exactly ${numberOfQuestions} questions that test understanding of key concepts.
    
    The questions should assess the student's general understanding of the material and the key concepts. Don't make questions that are too specific to the document.

    IMPORTANT: Your response must be ONLY a JSON object in this exact format, with no additional text or explanation:

    {
      "questions": [
        {
          "id": "1",
          "text": "First question here?"
        },
        {
          "id": "2",
          "text": "Second question here?"
        }
      ]
    }

    Requirements:
    1. Response must be valid JSON
    2. Must have exactly ${numberOfQuestions} questions
    3. Each question must have "id" (string) and "text" (string)
    4. No additional text or explanation outside the JSON`;
  }

  static getSummaryGenerationPrompt(questions: Array<{ id: string; text: string }>): string {
    return `You are a teaching assistant analyzing a document. Create a detailed summary in markdown format that includes:

    1. Main points and key concepts
    2. Important details and findings
    3. Methodology (if applicable)
    4. Conclusions and implications
    5. Answers to the following questions:
    ${questions.map(q => `- ${q.text}`).join('\n')}

    The output should be a markdown formatted summary of the document. No additional text or explanation outside the markdown. No backticks.

    IMPORTANT: Your response must be in markdown format and should be comprehensive enough to be used for future question generation while being more concise than the original document. `;
  }

  static getSystemPrompt(): string {
    return `You are an AI teaching assistant powered by Gemini 2.0 Flash.
You help educators and students by analyzing educational content, generating insightful questions, and creating comprehensive summaries.
Your responses are clear, accurate, and focused on promoting deep understanding of the material.`;
  }

  static getContentAnalysisPrompt(): string {
    return `Analyze the following educational content and provide insights on:
1. Key learning objectives
2. Main concepts covered
3. Difficulty level
4. Prerequisites (if any)
5. Suggested learning outcomes

Provide your analysis in a structured markdown format.`;
  }

  static getFeedbackGenerationPrompt(): string {
    return `Generate constructive feedback for a student response. Consider:
1. Accuracy of understanding
2. Completeness of answer
3. Areas for improvement
4. Positive aspects to reinforce

Format your feedback in a supportive and encouraging tone using markdown.`;
  }

  static getResponseAnalysisPrompt(question: string, transcription: string, summary: string): string {
    return `You are an AI teaching assistant analyzing a my verbal response to a question about a paper that I read.

    <paper_summary>
    ${summary}
    </paper_summary>

    <question>
    ${question}
    </question>

    <transcription_of_my_response>
    ${transcription}
    </transcription_of_my_response>

    Analyze my response and provide feedback in the following JSON format. Be concise but specific in your analysis:

    {
      "keyTakeaway": "In one or two sentences provide an overall assesment of my response.",
      "strengths": [
        "First key strength demonstrated in my response",
        "Second key strength demonstrated in my response",
        "Third key strength demonstrated in my response (if applicable)"
      ],
      "improvements": [
        "First specific area for improvement",
        "Second specific area for improvement",
        "Third specific area for improvement (if applicable)"
      ]
    }

    IMPORTANT:
    1. Response must be valid JSON
    2. Strengths should highlight specific positive aspects of my response
    3. Improvements should be constructive and actionable
    4. Keep all text entries concise but specific
    5. No additional text or explanation outside the JSON
    6. IMPORTANT:Everything should be written in the second person (you, your, etc.)
    7. Consider the context from the paper summary when evaluating the response`;
  }
} 