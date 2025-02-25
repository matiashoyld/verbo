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
  console.log("Webhook received");
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

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
    return new Response("Error occured", {
      status: 400,
    });
  }

  if (evt.type !== "user.created") {
    console.log("Ignoring non-user.created event:", evt.type);
    return new Response("", { status: 200 });
  }

  console.log("Processing user.created event:", evt.data);

  const { email_addresses, first_name, last_name, image_url, profile_image_url } = evt.data;
  const email = email_addresses[0]?.email_address;
  const profileImageUrl = profile_image_url || image_url;

  if (!email) {
    return new Response("No email found", { status: 400 });
  }

  try {
    const newUser = await db.user.create({
      data: {
        id: randomUUID(),
        email,
        name: [first_name, last_name].filter(Boolean).join(" ") || email,
        role: "RECRUITER", // Default to RECRUITER role
        created_at: new Date(),
        updated_at: new Date()
      },
    });
    
    console.log("User created successfully in database:", newUser);
    return new Response("User created", { status: 201 });
  } catch (err) {
    console.error("Error creating user in database:", err);
    return new Response("Error creating user", { status: 500 });
  }
} 