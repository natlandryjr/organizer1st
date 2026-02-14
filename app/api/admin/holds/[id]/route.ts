import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SeatStatus } from "@prisma/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hold = await prisma.hold.findUnique({
      where: { id },
      include: { seats: true },
    });

    if (!hold) {
      return NextResponse.json({ error: "Hold not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.seat.updateMany({
        where: { holdId: id },
        data: { status: SeatStatus.AVAILABLE, holdId: null },
      });
      await tx.hold.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Release hold error:", error);
    return NextResponse.json(
      { error: "Failed to release hold" },
      { status: 500 }
    );
  }
}
