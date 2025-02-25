import { randomUUID } from "crypto";
import { type NextRequest } from "next/server";
import { Webhook } from "svix";
import { env } from "~/env.mjs";
import { db } from "~/server/db";

type UserWebhookEvent = {
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
    profile_image_url: string | null;
    has_image: boolean;
    // Include all other fields from Clerk user data
  };
  type: string;
};

export async function POST(req: NextRequest) {
  console.log("Webhook received", new Date().toISOString());
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  try {
    // Get the headers
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    console.log("Webhook headers:", { svix_id, svix_timestamp, svix_signature });

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing svix headers");
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const rawBody = await req.text();
    console.log("Raw webhook body:", rawBody.substring(0, 200) + "...");

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: UserWebhookEvent;

    // Verify the webhook payload
    try {
      evt = wh.verify(rawBody, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as UserWebhookEvent;
      console.log("Webhook verified successfully");
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occured verifying webhook", {
        status: 400,
      });
    }

    if (evt.type !== "user.created") {
      console.log("Ignoring non-user.created event:", evt.type);
      return new Response("", { status: 200 });
    }

    console.log("Processing user.created event:", JSON.stringify(evt.data));

    const { email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error("No email found in webhook data");
      return new Response("No email found", { status: 400 });
    }

    console.log("Connecting to database...");
    
    // Test database connection
    try {
      const testConnection = await db.$queryRaw`SELECT 1 as test`;
      console.log("Database connection test:", testConnection);
    } catch (dbConnErr) {
      console.error("Database connection test failed:", dbConnErr);
    }

    // Generate a UUID
    const userId = randomUUID();
    console.log("Generated UUID:", userId);

    try {
      console.log("Creating user with data:", {
        id: userId,
        email,
        name: [first_name, last_name].filter(Boolean).join(" ") || email,
        imageUrl: evt.data.image_url ?? evt.data.profile_image_url,
      });
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        console.log("User with this email already exists:", JSON.stringify(existingUser));
        // Update the existing user
        const updatedUser = await db.user.update({
          where: { email },
          data: { 
            name: [first_name, last_name].filter(Boolean).join(" ") || email,
            imageUrl: evt.data.image_url ?? evt.data.profile_image_url,
          }
        });
        console.log("User updated successfully:", JSON.stringify(updatedUser));
      } else {
        // Create a new user
        const newUser = await db.user.create({
          data: {
            id: userId,
            email,
            name: [first_name, last_name].filter(Boolean).join(" ") || email,
            imageUrl: evt.data.image_url ?? evt.data.profile_image_url,
            role: "RECRUITER"
          }
        });
        console.log("New user created successfully:", JSON.stringify(newUser));
      }
      
      // List all users in the database for verification
      console.log("Checking all users in database...");
      try {
        const allUsers = await db.user.findMany({
          take: 10
        });
        console.log("All users in database (up to 10):", JSON.stringify(allUsers));
      } catch (err) {
        console.error("Error listing users:", err);
      }
      
      return new Response("User created or updated", { status: 201 });
    } catch (err) {
      console.error("Error creating/updating user in database:", err);
      // Log specific error details if available
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      return new Response(`Error creating/updating user: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 500 });
    }
  } catch (uncaughtErr) {
    console.error("Uncaught error in webhook handler:", uncaughtErr);
    return new Response("Internal server error", { status: 500 });
  }
} 