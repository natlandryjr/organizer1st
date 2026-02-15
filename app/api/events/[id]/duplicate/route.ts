import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateSectionSeatNumbers(rows: number, cols: number): string[] {
  const seatNumbers: string[] = [];
  for (let row = 0; row < rows; row++) {
    const rowLetter = String.fromCharCode(65 + row);
    for (let col = 1; col <= cols; col++) {
      seatNumbers.push(`${rowLetter}${col}`);
    }
  }
  return seatNumbers;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const source = await prisma.event.findUnique({
      where: { id },
      include: {
        venueMap: {
          include: {
            sections: true,
            tables: true,
          },
        },
      },
    });

    if (!source) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name: `${source.name} (Copy)`,
          date: source.date,
          description: source.description,
          maxSeats: source.maxSeats,
          flyerUrl: source.flyerUrl,
        },
      });

      if (source.venueMap) {
        const vm = source.venueMap;

        const venueMap = await tx.venueMap.create({
          data: {
            name: vm.name,
            eventId: event.id,
            gridCols: vm.gridCols,
            gridRows: vm.gridRows,
            stageX: vm.stageX,
            stageY: vm.stageY,
            stageWidth: vm.stageWidth,
            stageHeight: vm.stageHeight,
          },
        });

        for (const sec of vm.sections) {
          const section = await tx.section.create({
            data: {
              name: sec.name,
              rows: sec.rows,
              cols: sec.cols,
              posX: sec.posX,
              posY: sec.posY,
              color: sec.color,
              venueMapId: venueMap.id,
            },
          });

          const seatNumbers = generateSectionSeatNumbers(sec.rows, sec.cols);
          await tx.seat.createMany({
            data: seatNumbers.map((seatNumber) => ({
              seatNumber,
              sectionId: section.id,
            })),
          });
        }

        for (const tab of vm.tables) {
          const table = await tx.table.create({
            data: {
              name: tab.name,
              seatCount: tab.seatCount,
              posX: tab.posX,
              posY: tab.posY,
              color: tab.color,
              venueMapId: venueMap.id,
            },
          });

          await tx.seat.createMany({
            data: Array.from({ length: tab.seatCount }, (_, i) => ({
              seatNumber: String(i + 1),
              tableId: table.id,
            })),
          });
        }
      }

      return event;
    });

    return NextResponse.json({ success: true, event: result });
  } catch (error) {
    console.error("Duplicate event error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate event" },
      { status: 500 }
    );
  }
}
