import { PrismaClient } from "@prisma/client";

import { env } from "~/env.mjs";

const createPrismaClient = () => {
  try {
    // Display database URL info in development to help diagnose connection issues
    if (process.env.NODE_ENV === "development") {
      const urlDisplay = env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
      const directUrlDisplay = env.DIRECT_URL?.replace(/:[^:@]+@/, ":****@") || "Not set";
      console.log("Initializing Prisma client with DATABASE_URL:", urlDisplay);
      console.log("DIRECT_URL:", directUrlDisplay);
      
      // Verify we're using Supabase
      if (!env.DATABASE_URL.includes("supabase")) {
        console.error("WARNING: DATABASE_URL does not appear to be a Supabase URL!");
        console.error("Using .env and .env.local values may be inconsistent");
      }
    }
    
    // Ensure we're using the correct Supabase URL
    const databaseUrl = env.DATABASE_URL.includes("supabase") 
      ? env.DATABASE_URL 
      : process.env.DATABASE_URL?.includes("supabase")
        ? process.env.DATABASE_URL
        : env.DATABASE_URL; // fallback to whatever we have
    
    // Create Prisma client with connection timeout settings
    // These are the only settings that are supported in the type definition
    return new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      // For Supabase with PgBouncer, it's recommended to use neon's Postgres driver
      // and avoid long-running transactions
    });
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    throw error;
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we're running in a Node.js environment
let prisma: PrismaClient | undefined = undefined;

try {
  // This will throw in Edge Runtime
  if (typeof window === 'undefined') {
    prisma = globalForPrisma.prisma ?? createPrismaClient();
    
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }
} catch (error) {
  console.error("Error initializing Prisma (possibly in Edge Runtime):", error);
}

export const db = prisma as PrismaClient;

// Only attempt to connect in a Node.js environment, not Edge Runtime
try {
  if (process.env.NODE_ENV === "development" && typeof window === 'undefined' && db) {
    db.$connect()
      .then(() => {
        console.log("Successfully connected to the database");
      })
      .catch((error) => {
        console.error("Failed to connect to the database:", error);
      });
  }
} catch (error) {
  console.error("Error during database connection:", error);
}
