// Define types that match the actual API response for positions
export type PositionQuestion = {
  id: string;
  question: string;
  context: string | null;
};

// This type is used by the API response
export type Position = {
  id: string;
  title: string;
  jobDescription: string;
  context: string | null;
  creatorId?: string;
  creatorName?: string | null;
  createdAt?: string;
  questions: PositionQuestion[];
}; 