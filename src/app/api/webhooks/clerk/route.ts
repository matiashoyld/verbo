/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { env } from "~/env";

export const runtime = "nodejs";

type WebhookBody = {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    image_url: string;
    first_name: string | null;
    last_name: string | null;
  };
  type: string;
};

async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== "POST") {
    console.error("Invalid request method:", req.method);
    return new Response("Only POST requests are allowed", {
      status: 405,
    });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers:", {
      svix_id: !!svix_id,
      svix_timestamp: !!svix_timestamp,
      svix_signature: !!svix_signature,
    });
    return new Response("Error occurred -- missing svix headers", {
      status: 400,
    });
  }

  // Get the body
  let payload: WebhookBody;
  try {
    const rawBody = await req.json();
    payload = rawBody as WebhookBody;
  } catch (err) {
    console.error("Error parsing webhook body:", err);
    return new Response("Error parsing request body", {
      status: 400,
    });
  }
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err, {
      body: payload,
      headers: {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature?.substring(0, 10) + "...", // Log partial signature for debugging
      },
    });
    return new Response("Error verifying webhook signature", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log("Processing webhook event:", eventType);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ");

    try {
      const result = await db.user.upsert({
        where: { id },
        create: {
          id,
          email,
          name,
          image: image_url,
        },
        update: {
          email,
          name,
          image: image_url,
        },
      });
      console.log("Successfully synchronized user:", { id, email });
      return new Response(JSON.stringify({ success: true, userId: result.id }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error syncing user to database:", error, {
        userId: id,
        email,
        name,
      });
      return new Response(JSON.stringify({ error: "Error syncing user to database" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  return new Response(JSON.stringify({ success: true, event: eventType }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const POST = handler; 