import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      attendeeName?: string;
      attendeeEmail?: string;
    };

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(body.attendeeName != null &&
          body.attendeeName.trim() !== "" && {
            attendeeName: body.attendeeName.trim(),
          }),
        ...(body.attendeeEmail != null &&
          body.attendeeEmail.trim() !== "" && {
            attendeeEmail: body.attendeeEmail.trim(),
          }),
      },
      include: {
        seats: {
          include: { section: true, table: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { seats: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.seat.updateMany({
        where: { bookingId: id },
        data: { status: SeatStatus.AVAILABLE, bookingId: null },
      });
      await tx.booking.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    console.error("Delete booking error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
