import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getOrgId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.organizationId ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const organizationId = await getOrgId(request);
  if (!organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const event = await prisma.event.findFirst({
      where: { id, organizationId },
      include: {
        venueMap: true,
        ticketTypes: true,
        promoCodes: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Dashboard event get error:", error);
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
  const organizationId = await getOrgId(request);
  if (!organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      date?: string;
      location?: string | null;
      status?: "DRAFT" | "PUBLISHED";
      flyerUrl?: string | null;
      venueId?: string | null;
      ticketTypes?: { id?: string; name: string; price: number; quantity?: number | null }[];
      promoCodes?: { id?: string; code: string; discountType: "PERCENT" | "FLAT"; discountValue: number }[];
    };

    const event = await prisma.event.findFirst({
      where: { id, organizationId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ev = await tx.event.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name.trim() }),
          ...(body.description !== undefined && {
            description: body.description.trim(),
          }),
          ...(body.date !== undefined && { date: new Date(body.date) }),
          ...(body.location !== undefined && {
            location:
              body.location === null || body.location?.trim() === ""
                ? null
                : body.location?.trim() ?? null,
          }),
          ...(body.status !== undefined && {
            status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          }),
        ...(body.flyerUrl !== undefined && {
          flyerUrl:
            body.flyerUrl === null || body.flyerUrl?.trim() === ""
              ? null
              : body.flyerUrl?.trim() ?? null,
        }),
        ...(body.venueId !== undefined && {
          venueId:
            body.venueId === null || body.venueId?.trim() === ""
              ? null
              : body.venueId?.trim() ?? null,
        }),
      },
    });

      if (body.ticketTypes !== undefined) {
        const valid = body.ticketTypes.filter(
          (t) => t.name?.trim() && typeof t.price === "number" && t.price >= 0
        );
        if (valid.length > 0) {
          await tx.ticketType.deleteMany({ where: { eventId: id } });
          for (const tt of valid) {
            await tx.ticketType.create({
              data: {
                eventId: id,
                name: tt.name.trim(),
                price: Math.round(tt.price),
                quantity: tt.quantity != null && tt.quantity > 0 ? tt.quantity : null,
              },
            });
          }
        }
      }

      if (body.promoCodes !== undefined) {
        await tx.promoCode.deleteMany({ where: { eventId: id } });
        for (const pc of body.promoCodes) {
          if (pc.code?.trim() && pc.discountType && typeof pc.discountValue === "number") {
            const val = pc.discountType === "PERCENT"
              ? Math.min(100, Math.max(0, pc.discountValue))
              : Math.max(0, pc.discountValue);
            await tx.promoCode.create({
              data: {
                eventId: id,
                code: pc.code.trim().toUpperCase(),
                discountType: pc.discountType,
                discountValue: Math.round(val),
              },
            });
          }
        }
      }

      return ev;
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    console.error("Dashboard event update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const organizationId = await getOrgId(request);
  if (!organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const event = await prisma.event.findFirst({
      where: { id, organizationId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    console.error("Dashboard event delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
