import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import { stageDimensionsForCapacity } from "../lib/stage-utils";

const prisma = new PrismaClient();

const TOTAL_SEATS = 200;

const DEMO_EMAIL = "demo@organizer1st.com";
const DEMO_PASSWORD = "Demo1234!";
const SAMPLE_ORG_NAME = "Sample Organizer";
const SAMPLE_EVENT_NAME = "Sample Event";

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

async function main() {
  // Check if sample org already exists (idempotent seed)
  let org = await prisma.organization.findFirst({
    where: { name: SAMPLE_ORG_NAME },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: { name: SAMPLE_ORG_NAME },
    });
    console.log(`Created organization: ${org.name} (${org.id})`);
  } else {
    console.log(`Organization already exists: ${org.name}`);
  }

  // Create demo user if not exists
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (!existingUser) {
    const hashedPassword = await hashPassword(DEMO_PASSWORD);
    await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        password: hashedPassword,
        name: "Demo Organizer",
        organizationId: org.id,
      },
    });
    console.log(`Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo user already exists: ${DEMO_EMAIL}`);
  }

  // Create sample event if not exists (200 seats: 10 tables×4 + 2 sections×80)
  const existingEvent = await prisma.event.findFirst({
    where: {
      organizationId: org.id,
      name: SAMPLE_EVENT_NAME,
    },
  });

  if (!existingEvent) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 14); // 2 weeks from now
    eventDate.setHours(19, 0, 0, 0); // 7 PM
    const eventEndDate = new Date(eventDate);
    eventEndDate.setHours(22, 0, 0, 0); // 10 PM

    const { width: stageWidth, height: stageHeight } = stageDimensionsForCapacity(TOTAL_SEATS, 24, 56);
    const TABLE_ZONE_START = stageHeight + 3;
    const SECTION_START_Y = TABLE_ZONE_START + 8;

    await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name: SAMPLE_EVENT_NAME,
          date: eventDate,
          endDate: eventEndDate,
          description:
            "Try this sample event! Book seats, explore the seating chart, and see how Organizer1st works. Log in as the demo organizer to edit events, manage attendees, and more.",
          maxSeats: TOTAL_SEATS,
          status: "PUBLISHED",
          organizationId: org!.id,
        },
      });

      const venueMap = await tx.venueMap.create({
        data: {
          name: "Main Hall",
          eventId: event.id,
          gridCols: 24,
          gridRows: 56,
          stageX: 0,
          stageY: 0,
          stageWidth,
          stageHeight,
        },
      });

      const ticketType = await tx.ticketType.create({
        data: {
          eventId: event.id,
          name: "General Admission",
          price: 5000, // $50
          quantity: null,
        },
      });

      // 2 sections of 80 seats each (8 rows × 10 cols = 80)
      const sectionConfigs = [
        { name: "Section A", rows: 8, cols: 10, posX: 0, posY: SECTION_START_Y, color: "#6366f1" },
        { name: "Section B", rows: 8, cols: 10, posX: 0, posY: SECTION_START_Y + 9, color: "#22c55e" },
      ];

      for (const sc of sectionConfigs) {
        const section = await tx.section.create({
          data: {
            name: sc.name,
            rows: sc.rows,
            cols: sc.cols,
            posX: sc.posX,
            posY: sc.posY,
            color: sc.color,
            venueMapId: venueMap.id,
            ticketTypeId: ticketType.id,
          },
        });
        const seatNumbers = generateSectionSeatNumbers(sc.rows, sc.cols);
        await tx.seat.createMany({
          data: seatNumbers.map((seatNumber) => ({
            seatNumber,
            sectionId: section.id,
          })),
        });
      }

      // 10 tables of 4 seats each (40 seats total)
      const tableY1 = TABLE_ZONE_START + 1;
      const tableY2 = TABLE_ZONE_START + 4;
      const tablePositions = [
        { x: 2, y: tableY1 }, { x: 6, y: tableY1 }, { x: 10, y: tableY1 }, { x: 14, y: tableY1 }, { x: 18, y: tableY1 },
        { x: 2, y: tableY2 }, { x: 6, y: tableY2 }, { x: 10, y: tableY2 }, { x: 14, y: tableY2 }, { x: 18, y: tableY2 },
      ];

      for (let i = 0; i < 10; i++) {
        const { x, y } = tablePositions[i];
        const table = await tx.table.create({
          data: {
            name: `Table ${i + 1}`,
            seatCount: 4,
            posX: x,
            posY: y,
            color: "#f59e0b",
            venueMapId: venueMap.id,
            ticketTypeId: ticketType.id,
          },
        });
        await tx.seat.createMany({
          data: Array.from({ length: 4 }, (_, j) => ({
            seatNumber: String(j + 1),
            tableId: table.id,
          })),
        });
      }

      console.log(`Created sample event: ${event.name} (${event.id}) - 200 seats`);
    });
  } else {
    console.log(`Sample event already exists: ${SAMPLE_EVENT_NAME}`);
  }

  console.log("\nSeed complete. Demo credentials:");
  console.log(`  Email: ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Login at /login to edit the sample organization and event.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
