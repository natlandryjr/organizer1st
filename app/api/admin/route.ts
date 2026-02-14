import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SectionConfig = {
  name: string;
  rows: number;
  cols: number;
};

type TableConfig = {
  name: string;
  seatCount: number;
};

type SeatingConfig = {
  mapName: string;
  sections: SectionConfig[];
  tables: TableConfig[];
};

type CreateEventPayload = {
  eventName: string;
  eventDate: string;
  eventDescription: string;
  seatingConfig: SeatingConfig;
};

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateEventPayload;

    const { eventName, eventDate, eventDescription, seatingConfig } = body;

    if (!eventName || !eventDate || !eventDescription || !seatingConfig) {
      return NextResponse.json(
        {
          error: "Missing required fields: eventName, eventDate, eventDescription, seatingConfig",
        },
        { status: 400 }
      );
    }

    const { mapName, sections = [], tables = [] } = seatingConfig;

    if (!mapName) {
      return NextResponse.json(
        { error: "seatingConfig.mapName is required" },
        { status: 400 }
      );
    }

    const eventDateParsed = new Date(eventDate);
    if (isNaN(eventDateParsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid eventDate format" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name: eventName,
          date: eventDateParsed,
          description: eventDescription,
        },
      });

      const venueMap = await tx.venueMap.create({
        data: {
          name: mapName,
          eventId: event.id,
        },
      });

      for (const sectionConfig of sections) {
        const { name, rows = 10, cols = 10 } = sectionConfig;

        const section = await tx.section.create({
          data: {
            name,
            rows,
            cols,
            venueMapId: venueMap.id,
          },
        });

        const seatNumbers = generateSectionSeatNumbers(rows, cols);
        await tx.seat.createMany({
          data: seatNumbers.map((seatNumber) => ({
            seatNumber,
            sectionId: section.id,
          })),
        });
      }

      for (const tableConfig of tables) {
        const { name, seatCount } = tableConfig;

        const table = await tx.table.create({
          data: {
            name,
            seatCount,
            venueMapId: venueMap.id,
          },
        });

        await tx.seat.createMany({
          data: Array.from({ length: seatCount }, (_, i) => ({
            seatNumber: String(i + 1),
            tableId: table.id,
          })),
        });
      }

      return tx.event.findUnique({
        where: { id: event.id },
        include: {
          venueMap: {
            include: {
              sections: { include: { seats: true } },
              tables: { include: { seats: true } },
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      event: result,
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Failed to create event and seating map" },
      { status: 500 }
    );
  }
}
