import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!db) {
      return NextResponse.json([]);
    }

    const documents = await db.document.findMany({
      where: { authorId: userId, isArchived: false, parentId: null },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(documents);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!db) {
      return new NextResponse("Database not configured", { status: 503 });
    }

    const body = await req.json();
    const { title, parentId, workspaceId } = body;

    const document = await db.document.create({
      data: {
        title: title || "Untitled",
        parentId: parentId || null,
        workspaceId,
        authorId: userId,
      },
    });

    return NextResponse.json(document);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
