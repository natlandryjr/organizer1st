import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const venues = await prisma.venue.findMany({
      where: { organizationId: payload.organizationId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(venues);
  } catch (error) {
    console.error("Venues list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      name: string;
      layout: {
        canvasWidth: number;
        canvasHeight: number;
        components: unknown[];
      };
    };

    const { name, layout } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const venue = await prisma.venue.create({
      data: {
        name: name.trim(),
        layout: (layout ?? { canvasWidth: 800, canvasHeight: 600, components: [] }) as object,
        organizationId: payload.organizationId,
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Venue create error:", error);
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    );
  }
}
