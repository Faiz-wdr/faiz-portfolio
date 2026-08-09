import { NextRequest, NextResponse } from "next/server";
import { addAnalyticsEvent } from "@/lib/db";
import { parseUserAgent } from "@/lib/ua";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, page, sessionId, country: clientCountry } = body;

    if (!event || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent");
    const { browser, device } = parseUserAgent(userAgent);

    const country = request.headers.get("x-vercel-ip-country") || 
                    request.headers.get("cf-ipcountry") || 
                    clientCountry || 
                    "Unknown";

    const newEvent = await addAnalyticsEvent({
      event,
      page: page || "/",
      sessionId,
      device,
      browser,
      country,
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
