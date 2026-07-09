import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  if (!db) {
    // No database configured, just acknowledge the webhook
    return new NextResponse(null, { status: 200 });
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  const eventType = evt.type;

  // Handle user.created
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new NextResponse("No email found", { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    // Create user in database
    await db.user.create({
      data: {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
      },
    });

    // Create default workspace for the user
    const workspace = await db.workspace.create({
      data: {
        name: `${name || "My"}'s Workspace`,
        icon: "📝",
      },
    });

    // Add user as owner of the workspace
    await db.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: id,
        role: "OWNER",
      },
    });
  }

  // Handle user.updated
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await db.user.update({
      where: { clerkId: id },
      data: {
        email: email || undefined,
        name,
        imageUrl: image_url,
      },
    });
  }

  // Handle user.deleted
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      await db.user.delete({
        where: { clerkId: id },
      }).catch(() => {
        // User might not exist in DB yet
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
