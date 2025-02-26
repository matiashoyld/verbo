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
 * Single assessment question with skills assessed
 */
export interface AssessmentQuestion {
  context: string;
  question: string;
  skills_assessed: Array<{
    numId: number | null;
    name: string;
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
    skills_assessed?: Array<{
      numId: number | null;
      name: string;
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