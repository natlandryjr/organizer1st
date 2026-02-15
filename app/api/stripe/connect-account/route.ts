import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const refreshUrl = `${baseUrl}/dashboard/settings`;

  try {
    const stripe = new Stripe(stripeSecretKey);

    const account = await stripe.accounts.create({
      type: "express",
    });

    await prisma.$transaction(async (tx) => {
      await tx.stripeConnectPending.deleteMany({
        where: { organizationId: payload.organizationId },
      });
      await tx.stripeConnectPending.create({
        data: {
          accountId: account.id,
          organizationId: payload.organizationId,
        },
      });
    });

    const returnUrl = `${baseUrl}/api/stripe/connect-return?account_id=${account.id}`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe connect error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe connect link" },
      { status: 500 }
    );
  }
}
