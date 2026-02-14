import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LayoutUpdatePayload = {
  gridCols?: number;
  gridRows?: number;
  stage?: { x: number; y: number; width: number; height: number };
  sections?: { id: string; posX: number; posY: number; color?: string | null }[];
  tables?: { id: string; posX: number; posY: number; color?: string | null }[];
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as LayoutUpdatePayload;

    const venueMap = await prisma.venueMap.findUnique({
      where: { id },
      include: { sections: true, tables: true },
    });

    if (!venueMap) {
      return NextResponse.json({ error: "Venue map not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (body.gridCols != null || body.gridRows != null || body.stage) {
        await tx.venueMap.update({
          where: { id },
          data: {
            ...(body.gridCols != null && { gridCols: body.gridCols }),
            ...(body.gridRows != null && { gridRows: body.gridRows }),
            ...(body.stage && {
              stageX: body.stage.x,
              stageY: body.stage.y,
              stageWidth: body.stage.width,
              stageHeight: body.stage.height,
            }),
          },
        });
      }

      if (body.sections) {
        for (const { id: sectionId, posX, posY, color } of body.sections) {
          await tx.section.update({
            where: { id: sectionId },
            data: {
              posX,
              posY,
              ...(color !== undefined && {
                color: color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null,
              }),
            },
          });
        }
      }

      if (body.tables) {
        for (const { id: tableId, posX, posY, color } of body.tables) {
          await tx.table.update({
            where: { id: tableId },
            data: {
              posX,
              posY,
              ...(color !== undefined && {
                color: color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null,
              }),
            },
          });
        }
      }
    });

    const updated = await prisma.venueMap.findUnique({
      where: { id },
      include: {
        sections: { include: { seats: true } },
        tables: { include: { seats: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Venue map layout update error:", error);
    return NextResponse.json(
      { error: "Failed to update layout" },
      { status: 500 }
    );
  }
}
