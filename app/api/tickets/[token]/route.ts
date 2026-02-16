import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/qrcode";

/**
 * GET /api/tickets/[token]
 * Fetch booking by magic link token. No auth required — token is the secret.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: {
      seats: {
        include: {
          section: true,
          table: true,
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Link expired or invalid" }, { status: 404 });
  }

  // Get event via seat -> section/table -> venueMap -> event
  let event: { id: string; name: string; date: Date | null; location: string | null } | null = null;
  const firstSeat = booking.seats[0];
  if (firstSeat?.section) {
    const vm = await prisma.venueMap.findUnique({
      where: { id: firstSeat.section.venueMapId },
      include: { event: { select: { id: true, name: true, date: true, location: true } } },
    });
    event = vm?.event ?? null;
  } else if (firstSeat?.table) {
    const vm = await prisma.venueMap.findUnique({
      where: { id: firstSeat.table.venueMapId },
      include: { event: { select: { id: true, name: true, date: true, location: true } } },
    });
    event = vm?.event ?? null;
  }

  const qrDataUrl = await generateQrDataUrl(booking.id, 220);

  return NextResponse.json({
    booking: {
      id: booking.id,
      attendeeName: booking.attendeeName,
      attendeeEmail: booking.attendeeEmail,
      seats: booking.seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        section: s.section ? { name: s.section.name } : null,
        table: s.table ? { name: s.table.name } : null,
      })),
    },
    event,
    qrDataUrl,
  });
}
