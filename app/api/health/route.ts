import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Absensi QR API",
    architecture: "Next.js Application Service + Supabase PostgreSQL Database Service",
    timestamp: new Date().toISOString()
  });
}
