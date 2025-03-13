import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Get the authenticated user's role
  getUserRole: protectedProcedure
    .query(async ({ ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),
    
  // Update the authenticated user's role to CANDIDATE
  updateUserToCandidate: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { userId } = ctx;
      console.log("Attempting to update user role to CANDIDATE for user:", userId);

      if (!userId) {
        console.error("User not authenticated - cannot update role");
        throw new Error("User not authenticated");
      }

      try {
        // First check the current role
        const existingUser = await ctx.db.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, email: true }
        });
        
        if (!existingUser) {
          console.error(`User ${userId} not found in database`);
          throw new Error("User not found");
        }
        
        console.log(`Current user role for ${existingUser.email}: ${existingUser.role}`);
        
        // Only update if not already a candidate
        if (existingUser.role === "CANDIDATE") {
          console.log(`User ${existingUser.email} is already a CANDIDATE, no update needed`);
          return existingUser;
        }

        // Explicitly update role to CANDIDATE
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { role: "CANDIDATE" },
          select: { id: true, role: true, email: true }
        });

        console.log(`Successfully updated user ${updatedUser.email} to role: ${updatedUser.role}`);
        return updatedUser;
      } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
      }
    }),
    
  // Get all candidates with their top competencies
  getCandidates: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Get all users with CANDIDATE role
        const candidates = await ctx.db.user.findMany({
          where: { 
            role: "CANDIDATE" 
          },
          select: { 
            id: true, 
            name: true, 
            email: true, 
            imageUrl: true,
            submissions: {
              select: {
                id: true,
                questions: {
                  select: {
                    competencyAssessments: {
                      select: {
                        level: true,
                        questionCompetency: {
                          select: {
                            competency: {
                              select: {
                                id: true,
                                name: true,
                                skill: {
                                  select: {
                                    id: true,
                                    name: true
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
        
        // Process candidates to include their top competencies
        return candidates.map(candidate => {
          // Flatten all competency assessments from all submissions and questions
          const allCompetencyAssessments = candidate.submissions.flatMap(submission => 
            submission.questions.flatMap(question => 
              question.competencyAssessments
            )
          );
          
          // Create a map to track competency levels
          const competencyMap = new Map();
          
          // Populate the map with competency data
          allCompetencyAssessments.forEach(assessment => {
            const competency = assessment.questionCompetency.competency;
            const competencyId = competency.id;
            
            if (!competencyMap.has(competencyId)) {
              competencyMap.set(competencyId, {
                id: competencyId,
                name: competency.name,
                skillName: competency.skill.name,
                totalLevel: 0,
                count: 0
              });
            }
            
            const competencyData = competencyMap.get(competencyId);
            competencyData.totalLevel += assessment.level;
            competencyData.count += 1;
          });
          
          // Convert the map to an array and calculate average levels
          const competenciesArray = Array.from(competencyMap.values())
            .map(comp => ({
              id: comp.id,
              name: comp.name,
              skillName: comp.skillName,
              level: Number((comp.totalLevel / comp.count).toFixed(1))
            }))
            .sort((a, b) => b.level - a.level); // Sort by highest level first
          
          // Take top 3 competencies
          const topCompetencies = competenciesArray.slice(0, 3);
          
          return {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            imageUrl: candidate.imageUrl,
            topCompetencies
          };
        });
      } catch (error) {
        console.error("Error fetching candidates:", error);
        throw error;
      }
    })
}); 