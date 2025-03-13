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
}); 