import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const where = organizationId ? { organizationId } : {};
    const venues = await prisma.venue.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(venues);
  } catch (error) {
    console.error("Admin venues list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name: string;
      organizationId: string;
      layout?: Record<string, unknown>;
    };
    const { name, organizationId, layout } = body;
    if (!name?.trim() || !organizationId) {
      return NextResponse.json(
        { error: "Name and organizationId are required" },
        { status: 400 }
      );
    }
    const venue = await prisma.venue.create({
      data: {
        name: name.trim(),
        organizationId,
        layout: (layout ?? { canvasWidth: 800, canvasHeight: 600, components: [] }) as object,
      },
    });
    return NextResponse.json(venue);
  } catch (error) {
    console.error("Admin create venue error:", error);
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    );
  }
}
