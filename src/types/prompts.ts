/**
 * Types for LLM prompts
 */

// Shared types between prompt modules
export interface DatabaseCategory {
  name: string;
  numId?: number;
  skills: Array<{
    name: string;
    numId?: number;
    competencies: Array<{
      name: string;
      numId?: number;
    }>;
  }>;
}

export interface IndexedCategory {
  numId: number | null;
  name: string;
  skills: Array<{
    numId: number | null;
    name: string;
    competencies: Array<{
      numId: number | null;
      name: string;
    }>;
  }>;
}

export interface FormattedSkill {
  numId: number | null;
  name: string;
  skills: Array<{
    numId: number | null;
    name: string;
    competencies: Array<{
      numId: number | null;
      name: string;
    }>;
  }>;
}

/**
 * Competency assessment result from video analysis
 */
export interface CompetencyAssessment {
  competency_id: string;
  competency_name: string;
  level: number; // 1-5 based on rubric
  rationale: string; // Explanation with timestamps and quotes
}

/**
 * Response structure from video analysis
 */
export interface VideoAnalysisResult {
  overall_assessment: string;
  strengths: string[];
  areas_for_improvement: string[];
  competency_assessments: CompetencyAssessment[];
}

// Types from gemini.ts

/**
 * Structure for indexed database data with numerical IDs
 */
export interface IndexedSkillsData {
  categories: Array<{
    numId: number | null;
    name: string;
    skills: Array<{
      numId: number | null;
      name: string;
      competencies: Array<{
        numId: number | null;
        name: string;
      }>;
    }>;
  }>;
}

/**
 * Response structure from the AI containing indices
 */
export interface IndexedAIResponse {
  selected_competencies: Array<{
    category_numId: number | null;
    skill_numId: number | null;
    competency_numIds: Array<number | null>;
  }>;
}

/**
 * Frontend category structure with selected competencies
 */
export interface AISkillCategory {
  name: string;
  numId?: number;
  skills: Array<{
    name: string;
    numId?: number;
    competencies: Array<{
      name: string;
      numId?: number;
      selected: boolean;
    }>;
  }>;
}

/**
 * Complete result structure for the frontend
 */
export interface AISkillsResult {
  categories: AISkillCategory[];
}

/**
 * Single assessment question with competencies assessed
 */
export interface AssessmentQuestion {
  context: string;
  question: string;
  competencies_assessed: Array<{
    numId: number | null;
    name: string;
    skillNumId?: number | null; // Parent skill numId
  }>;
  skills_assessed?: Array<{
    numId: number | null;
    name: string;
    skillNumId?: number | null; // Parent skill numId
  }>;
}

/**
 * Complete assessment structure with context and questions
 */
export interface GeneratedAssessment {
  context: string;
  questions: Array<{
    context: string;
    question: string;
    competencies_assessed: Array<{
      numId: number | null;
      name: string;
      skillNumId?: number | null; // Parent skill numId
    }>;
    skills_assessed?: Array<{
      numId: number | null;
      name: string;
      skillNumId?: number | null; // Parent skill numId
    }>;
  }>;
  _internal?: {
    competencyIdMap: Record<string, { 
      numId: number | null;
      categoryNumId: number | null;
      skillNumId: number | null;
    }>;
  };
} 