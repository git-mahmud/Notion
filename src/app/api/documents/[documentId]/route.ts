import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!db) {
      return new NextResponse("Database not configured", { status: 503 });
    }

    const { documentId } = await params;

    const document = await db.document.findUnique({
      where: { id: documentId },
      include: { children: { orderBy: { position: "asc" } } },
    });

    if (!document) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(document);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!db) {
      return new NextResponse("Database not configured", { status: 503 });
    }

    const { documentId } = await params;
    const body = await req.json();

    const document = await db.document.update({
      where: { id: documentId },
      data: body,
    });

    return NextResponse.json(document);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!db) {
      return new NextResponse("Database not configured", { status: 503 });
    }

    const { documentId } = await params;

    await db.document.delete({ where: { id: documentId } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
