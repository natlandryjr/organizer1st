import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getCookieName } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: eventId } = await params;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { subject?: string; body?: string };

    const subject = body.subject?.trim();
    const emailBody = body.body?.trim();

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!emailBody) {
      return NextResponse.json(
        { error: "Email body is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizationId: payload.organizationId },
      include: { venueMap: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.venueMap) {
      return NextResponse.json(
        { error: "Event has no venue map" },
        { status: 400 }
      );
    }

    const venueMapId = event.venueMap.id;

    const bookings = await prisma.booking.findMany({
      where: {
        seats: {
          some: {
            OR: [
              { section: { venueMapId } },
              { table: { venueMapId } },
            ],
          },
        },
      },
    });

    const uniqueEmails = new Set<string>();
    for (const b of bookings) {
      if (b.attendeeEmail?.trim()) {
        uniqueEmails.add(b.attendeeEmail.trim());
      }
    }

    const recipients = Array.from(uniqueEmails);
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No attendee emails found" },
        { status: 400 }
      );
    }

    const isHtml = emailBody.startsWith("<") && emailBody.includes(">");

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of recipients) {
      try {
        await sendEmail(email, subject, emailBody, isHtml);
        results.push({ email, success: true });
      } catch (err) {
        results.push({
          email,
          success: false,
          error: err instanceof Error ? err.message : "Failed to send",
        });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
      success: true,
      sent,
      total: recipients.length,
      failed: failed.length,
      failedEmails: failed.map((f) => ({ email: f.email, error: f.error })),
    });
  } catch (error) {
    console.error("Email attendees API error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
