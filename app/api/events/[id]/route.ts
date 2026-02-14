import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venueMap: {
          include: {
            sections: {
              include: {
                seats: { include: { hold: true } },
              },
            },
            tables: {
              include: {
                seats: { include: { hold: true } },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { maxSeats?: number | null; flyerUrl?: string | null };

    const event = await prisma.event.update({
      where: { id },
      data: {
        maxSeats:
          body.maxSeats === null || body.maxSeats === undefined
            ? null
            : body.maxSeats > 0
              ? body.maxSeats
              : null,
        ...(body.flyerUrl !== undefined && {
          flyerUrl:
            body.flyerUrl === null || (typeof body.flyerUrl === "string" && body.flyerUrl.trim() === "")
              ? null
              : typeof body.flyerUrl === "string"
                ? body.flyerUrl.trim()
                : null,
        }),
      },
      include: {
        venueMap: {
          include: {
            sections: { include: { seats: { include: { hold: true } } } },
            tables: { include: { seats: { include: { hold: true } } } },
          },
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    console.error("Events API PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
