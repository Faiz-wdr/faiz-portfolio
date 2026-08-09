import { NextRequest, NextResponse } from "next/server";
import { getWheelSpins, getAnalyticsEvents, getGiftClaims } from "@/lib/db";

// Helper to verify admin password from authorization headers
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

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalEvents = await getAnalyticsEvents();
    const totalSpins = await getWheelSpins();
    const giftClaims = await getGiftClaims();
    const now = new Date();

    // Visitors (events of type 'Visitor')
    const visitorEvents = totalEvents.filter(e => e.event === "Visitor");
    
    // Unique Visitors (unique sessionIds across all Visitor events or all events)
    const uniqueSessionIds = new Set(totalEvents.map(e => e.sessionId));
    const uniqueVisitorsCount = uniqueSessionIds.size;

    // Specific event counts
    const wheelOpensCount = totalEvents.filter(e => e.event === "Wheel Open").length;
    const wheelSpinsCount = totalEvents.filter(e => e.event === "Wheel Spin").length;
    const claimButtonClicksCount = totalEvents.filter(e => e.event === "Claim Button Click").length;
    
    // Today's Visitors (Visitor events in the last 24 hours / today)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayVisitorsCount = visitorEvents.filter(e => {
      const d = new Date(e.timestamp);
      return d >= startOfToday;
    }).length;

    // This Month's Visitors (Visitor events since start of current month)
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthVisitorsCount = visitorEvents.filter(e => {
      const d = new Date(e.timestamp);
      return d >= startOfThisMonth;
    }).length;

    const giftTypes = [
      { key: "PersonalOs Pro", label: "PersonalOs Pro" },
      { key: "Personal Website", label: "Personal Website" },
      { key: "Resume Review", label: "Resume Review" },
      { key: "Ui Audit", label: "Ui Audit" },
      { key: "Coffee Chat", label: "Coffee Chat" },
      { key: "Surprise", label: "Surprise" }
    ];

    const giftSummaries = giftTypes.map(gt => {
      const spinsForGift = totalSpins.filter(s => s.giftId === gt.key);
      const won = spinsForGift.length;
      const claimed = spinsForGift.filter(s => s.claimed).length;
      return {
        label: gt.label,
        won,
        claimed
      };
    });

    // Removed file fallback read

    // 3. Return payload
    return new NextResponse(
      JSON.stringify({
        success: true,
        stats: {
          visitors: visitorEvents.length,
          uniqueVisitors: uniqueVisitorsCount,
          wheelOpens: wheelOpensCount,
          wheelSpins: wheelSpinsCount,
          claimButtonClicks: claimButtonClicksCount,
          claimsSubmitted: giftClaims.length,
          todayVisitors: todayVisitorsCount,
          thisMonthVisitors: thisMonthVisitorsCount,
        },
        giftSummaries,
        wheelSpins: totalSpins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        giftClaims: giftClaims.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
