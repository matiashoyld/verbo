/**
 * Types for LLM prompts
 */

// Shared types between prompt modules
export interface DatabaseCategory {
  name: string;
  skills: Array<{
    name: string;
    competencies: Array<{
      name: string;
    }>;
  }>;
}

export interface IndexedCategory {
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
}

export interface FormattedSkill {
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
}

// Types from gemini.ts

/**
 * Structure for indexed database data with numerical IDs
 */
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

/**
 * Response structure from the AI containing indices
 */
export interface IndexedAIResponse {
  selected_competencies: Array<{
    category_id: number;
    skill_id: number;
    competency_ids: number[];
  }>;
}

/**
 * Frontend category structure with selected competencies
 */
export interface AISkillCategory {
  name: string;
  skills: Array<{
    name: string;
    competencies: Array<{
      name: string;
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
    id: number;
    name: string;
  }>;
}

/**
 * Complete assessment structure with context and questions
 */
export interface GeneratedAssessment {
  context: string;
  questions: AssessmentQuestion[];
} 