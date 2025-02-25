import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    console.log("Testing database connection from API route...");
    
    // Test raw query
    const testResult = await db.$queryRaw`SELECT 1 as test`;
    console.log("Raw query result:", testResult);
    
    // Test category count
    const categoryCount = await db.category.count();
    console.log(`Found ${categoryCount} categories`);
    
    // Get all categories
    const categories = await db.category.findMany({
      take: 5, // Limit to 5 for safety
    });
    
    // Sanitize response data (important for security)
    const sanitizedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
    }));
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        testResult,
        categoryCount,
        categories: sanitizedCategories,
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 