import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const where = organizationId ? { organizationId } : {};
    const users = await prisma.user.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
      },
      orderBy: { email: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
      organizationId: string;
    };
    const { name, email, password, organizationId } = body;
    if (!name?.trim() || !email?.trim() || !password || !organizationId) {
      return NextResponse.json(
        { error: "Name, email, password, and organizationId are required" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashed,
        organizationId,
      },
    });
    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
