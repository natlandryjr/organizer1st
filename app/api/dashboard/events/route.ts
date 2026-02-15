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
    const events = await prisma.event.findMany({
      where: { organizationId: payload.organizationId },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
        description: true,
        location: true,
        status: true,
        flyerUrl: true,
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Dashboard events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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
      description: string;
      date: string;
      location?: string;
      status?: "DRAFT" | "PUBLISHED";
      flyerUrl?: string | null;
      venueId?: string | null;
      ticketTypes?: { name: string; price: number; quantity?: number | null }[];
      promoCodes?: { code: string; discountType: "PERCENT" | "FLAT"; discountValue: number }[];
    };

    const { name, description, date, location, status, flyerUrl, venueId, ticketTypes = [], promoCodes = [] } = body;

    if (!name?.trim() || !description?.trim() || !date) {
      return NextResponse.json(
        { error: "Name, description, and date are required" },
        { status: 400 }
      );
    }

    const validTicketTypes = ticketTypes.filter(
      (t) => t.name?.trim() && typeof t.price === "number" && t.price >= 0
    );
    if (validTicketTypes.length === 0) {
      return NextResponse.json(
        { error: "At least one ticket type is required" },
        { status: 400 }
      );
    }

    const event = await prisma.$transaction(async (tx) => {
      const ev = await tx.event.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          date: new Date(date),
          location: location?.trim() || null,
          status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          flyerUrl: flyerUrl?.trim() || null,
          venueId: venueId?.trim() || null,
          organizationId: payload.organizationId,
        },
      });

      for (const tt of validTicketTypes) {
        await tx.ticketType.create({
          data: {
            eventId: ev.id,
            name: tt.name.trim(),
            price: Math.round(tt.price),
            quantity: tt.quantity != null && tt.quantity > 0 ? tt.quantity : null,
          },
        });
      }

      for (const pc of promoCodes) {
        if (pc.code?.trim() && pc.discountType && typeof pc.discountValue === "number") {
          const val = pc.discountType === "PERCENT"
            ? Math.min(100, Math.max(0, pc.discountValue))
            : Math.max(0, pc.discountValue);
          await tx.promoCode.create({
            data: {
              eventId: ev.id,
              code: pc.code.trim().toUpperCase(),
              discountType: pc.discountType,
              discountValue: Math.round(val),
            },
          });
        }
      }

      return ev;
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Dashboard event create error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
