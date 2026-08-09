import { NextRequest, NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return token === adminPassword;
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await resetDb();
    return NextResponse.json({ success: true, message: "Database reset successfully!" });
  } catch (error: any) {
    console.error("Database reset error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset database" }, { status: 500 });
  }
}
