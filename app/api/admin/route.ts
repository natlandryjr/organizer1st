import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

type SectionConfig = {
  name: string;
  rows: number;
  cols: number;
  posX?: number;
  posY?: number;
  color?: string | null;
};

type TableConfig = {
  name: string;
  seatCount: number;
  posX?: number;
  posY?: number;
  color?: string | null;
};

type StageConfig = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type SeatingConfig = {
  mapName: string;
  gridCols?: number;
  gridRows?: number;
  stage?: StageConfig;
  sections: SectionConfig[];
  tables: TableConfig[];
};

type CreateEventPayload = {
  eventName: string;
  eventDate: string;
  eventDescription: string;
  maxSeats?: number | null;
  flyerUrl?: string | null;
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

    const { eventName, eventDate, eventDescription, maxSeats, flyerUrl, seatingConfig } = body;

    if (!eventName || !eventDate || !eventDescription || !seatingConfig) {
      return NextResponse.json(
        {
          error: "Missing required fields: eventName, eventDate, eventDescription, seatingConfig",
        },
        { status: 400 }
      );
    }

    const {
      mapName,
      gridCols = 24,
      gridRows: gridRowsInput = 24,
      stage = {},
      sections = [],
      tables = [],
    } = seatingConfig;

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

    // Auto-layout: compute initial positions for sections/tables if not provided
    const stageH = stage.height ?? 0;
    const TABLE_STAGE_MARGIN = 3;
    const TABLE_ZONE_ROWS = 8;
    const sectionStartY = stageH + TABLE_STAGE_MARGIN + TABLE_ZONE_ROWS;

    // Assign default table positions (spread across table zone)
    let tableCol = 2;
    for (const t of tables) {
      if (!t.posX && !t.posY) {
        t.posX = Math.min(tableCol, gridCols - 1);
        t.posY = stageH + TABLE_STAGE_MARGIN + 2;
        tableCol += 4;
      }
    }

    // Stack sections vertically if they all have default (0,0) positions
    let nextSectionY = sectionStartY;
    for (const s of sections) {
      if (!s.posX && !s.posY) {
        s.posX = 0;
        s.posY = nextSectionY;
        nextSectionY += (s.rows || 10) + 1; // +1 row gap between sections
      }
    }

    // Compute minimum gridRows to fit all content
    let minRows = sectionStartY;
    for (const s of sections) {
      const bottom = (s.posY || 0) + (s.rows || 10);
      if (bottom > minRows) minRows = bottom;
    }
    const gridRows = Math.max(gridRowsInput, minRows + 2);

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name: eventName,
          date: eventDateParsed,
          description: eventDescription,
          maxSeats: maxSeats != null && maxSeats > 0 ? maxSeats : null,
          flyerUrl: flyerUrl && flyerUrl.trim() ? flyerUrl.trim() : null,
          organizationId: DEFAULT_ORGANIZATION_ID,
        },
      });

      const venueMap = await tx.venueMap.create({
        data: {
          name: mapName,
          eventId: event.id,
          gridCols,
          gridRows,
          stageX: stage.x ?? 0,
          stageY: stage.y ?? 0,
          stageWidth: stage.width ?? 0,
          stageHeight: stage.height ?? 0,
        },
      });

      const defaultTicketType = await tx.ticketType.create({
        data: {
          eventId: event.id,
          name: "General Admission",
          price: 5000,
          quantity: null,
        },
      });

      for (const sectionConfig of sections) {
        const { name, rows = 10, cols = 10, posX = 0, posY = 0, color } = sectionConfig;

        const section = await tx.section.create({
          data: {
            name,
            rows,
            cols,
            posX,
            posY,
            color: color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null,
            venueMapId: venueMap.id,
            ticketTypeId: defaultTicketType.id,
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
        const { name, seatCount, posX = 0, posY = 0, color } = tableConfig;

        const table = await tx.table.create({
          data: {
            name,
            seatCount,
            posX,
            posY,
            color: color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null,
            venueMapId: venueMap.id,
            ticketTypeId: defaultTicketType.id,
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
