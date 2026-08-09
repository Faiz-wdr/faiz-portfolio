import { NextRequest, NextResponse } from "next/server";
import { addGiftClaim } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, giftId, gift, email, name, notes } = body;

    if (!sessionId || !giftId || !gift || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newClaim = await addGiftClaim({
      sessionId,
      giftId,
      gift,
      email,
      name,
      notes: notes || "",
    });

    // Automatically mark the spin as claimed
    try {
      const { claimWheelSpin } = await import("@/lib/db");
      await claimWheelSpin(sessionId, giftId);
    } catch (_) {}

    return NextResponse.json({ success: true, claim: newClaim });
  } catch (error) {
    console.error("Error creating gift claim:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
