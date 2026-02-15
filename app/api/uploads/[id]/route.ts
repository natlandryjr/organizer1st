import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(upload.data, {
      headers: {
        "Content-Type": upload.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}
