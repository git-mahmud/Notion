import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Get the current authenticated user's Clerk ID.
 * Throws if not authenticated.
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

/**
 * Get the current authenticated user from the database.
 * Returns null if no database is configured.
 */
export async function getCurrentDbUser() {
  if (!db) return null;

  const { userId } = await auth();
  if (!userId) return null;

  let dbUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  // If user doesn't exist in DB yet (webhook hasn't fired), create from Clerk data
  if (!dbUser) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    dbUser = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
        imageUrl: clerkUser.imageUrl,
      },
    });
  }

  return dbUser;
}

/**
 * Get the user's default workspace.
 * Returns null if no database is configured.
 */
export async function getDefaultWorkspace(userId: string) {
  if (!db) return null;

  const membership = await db.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (membership) {
    return membership.workspace;
  }

  // Create default workspace
  const workspace = await db.workspace.create({
    data: {
      name: "My Workspace",
      icon: "📝",
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return workspace;
}
