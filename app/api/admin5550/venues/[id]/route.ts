import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      organizationId?: string;
      layout?: Record<string, unknown>;
    };
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.organizationId !== undefined) data.organizationId = body.organizationId;
    if (body.layout !== undefined) data.layout = body.layout;
    const venue = await prisma.venue.update({
      where: { id },
      data,
    });
    return NextResponse.json(venue);
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }
    console.error("Admin update venue error:", error);
    return NextResponse.json(
      { error: "Failed to update venue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.venue.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }
    console.error("Admin delete venue error:", error);
    return NextResponse.json(
      { error: "Failed to delete venue" },
      { status: 500 }
    );
  }
}
