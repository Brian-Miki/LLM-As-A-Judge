export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

// Base example data structure
export interface BaseExample {
  context: string;
  question: string;
  correctAnswer: string;
  tools?: Tool[];
  metadata?: Record<string, any>;
}

// Generated variation with hallucination
export interface HallucinationExample extends BaseExample {
  generatedAnswer: string;
  score?: JudgeScore;
  type: 'original' | 'hallucination' | 'partial';
}

export interface JudgeScore {
  choice: 'A' | 'B' | 'C' | 'D' | 'E';
  score: number;
  reasoning: string;
}

// Scoring criteria from OpenAI cookbook
export const CHOICE_SCORES = {
  A: 0.5,  // Subset of expert answer, fully consistent
  B: 0,    // Superset of expert answer (potential hallucination)
  C: 1,    // Exact match in details
  D: 0,    // Disagreement with expert answer
  E: 1     // Different but factually equivalent
};

export interface UploadResponse {
  success: boolean;
  data?: BaseExample[];
  error?: string;
} 