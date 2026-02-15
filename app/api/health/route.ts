import { NextResponse } from "next/server";

/**
 * Lightweight health check for Fly.io and load balancers.
 * Does NOT connect to the database - use for startup/liveness checks.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
