import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Events list API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
