import { NextRequest, NextResponse } from "next/server";
import { addWheelSpin } from "@/lib/db";
import { parseUserAgent } from "@/lib/ua";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, gift, giftId, claimed, claimId, status, country: clientCountry } = body;

    if (!sessionId || !gift || !giftId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent");
    const { browser, device } = parseUserAgent(userAgent);

    const country = request.headers.get("x-vercel-ip-country") || 
                    request.headers.get("cf-ipcountry") || 
                    clientCountry || 
                    "Unknown";

    const newSpin = await addWheelSpin({
      sessionId,
      gift,
      giftId,
      country,
      device,
      browser,
      claimed: !!claimed,
      claimId: claimId || "",
      status: status || "pending",
    });

    return NextResponse.json({ success: true, spin: newSpin });
  } catch (error) {
    console.error("Error in wheel-spins API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, giftId } = body;

    if (!sessionId || !giftId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { claimWheelSpin } = await import("@/lib/db");
    const success = await claimWheelSpin(sessionId, giftId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error updating wheel spin claim:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
