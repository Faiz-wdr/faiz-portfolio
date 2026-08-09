import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: "Admin access is not configured" }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true, token: adminPassword });
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in admin login:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
