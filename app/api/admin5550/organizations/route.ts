import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true, events: true, venues: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(orgs);
  } catch (error) {
    console.error("Admin organizations list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name: string };
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }
    const org = await prisma.organization.create({
      data: { name },
    });
    return NextResponse.json(org);
  } catch (error) {
    console.error("Admin create organization error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
