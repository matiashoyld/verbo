/**
 * Generate a safe fallback ID that won't conflict with real database IDs
 * Returns a negative ID that includes information about the entity type
 */
export const generateFallbackId = (index: number, entityType: string): number => {
  // Use negative numbers to distinguish from real IDs
  // Add a multiplier based on entity type to avoid collisions between different entity types
  const typeMultiplier = 
    entityType === 'category' ? 10000 :
    entityType === 'skill' ? 20000 : 30000; // 30000 for competency
  
  return -(index + 1 + typeMultiplier);
}; 