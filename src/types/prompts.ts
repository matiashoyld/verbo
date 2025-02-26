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