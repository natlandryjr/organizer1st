import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const accountId = request.nextUrl.searchParams.get("account_id");
  if (!accountId) {
    return NextResponse.json(
      { error: "Missing account_id" },
      { status: 400 }
    );
  }

  try {
    const pending = await prisma.stripeConnectPending.findUnique({
      where: { accountId },
    });

    if (!pending || pending.organizationId !== payload.organizationId) {
      return NextResponse.json(
        { error: "Invalid or expired Stripe connection" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: payload.organizationId },
        data: { stripeAccountId: accountId },
      });
      await tx.stripeConnectPending.delete({
        where: { accountId },
      });
    });

    return NextResponse.redirect(
      new URL("/dashboard/stripe-return?success=1", request.url)
    );
  } catch (error) {
    console.error("Stripe return error:", error);
    return NextResponse.json(
      { error: "Failed to save Stripe account" },
      { status: 500 }
    );
  }
}
