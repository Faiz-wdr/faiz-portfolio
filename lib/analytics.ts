// Client-side analytics helper

const SESSION_KEY = "faiz_portfolio_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export async function trackEvent(event: string, page = "/") {
  if (typeof window === "undefined") return;
  try {
    const sessionId = getSessionId();
    
    // Check if we have already fetched and stored client's country in this session
    let clientCountry = "Unknown";
    try {
      const storedCountry = sessionStorage.getItem("client_country");
      if (storedCountry) {
        clientCountry = storedCountry;
      } else {
        // Fetch country name via clean, fast public API
        const res = await fetch("https://ipapi.co/json/").then(r => r.json());
        if (res && res.country_name) {
          clientCountry = res.country_name;
          sessionStorage.setItem("client_country", clientCountry);
        }
      }
    } catch (_) {
      // Ignore geo-lookup errors and fallback to server-side header / "Unknown"
    }

    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        page,
        sessionId,
        country: clientCountry,
      }),
    });
  } catch (err) {
    console.error("Failed to track event:", err);
  }
}

export async function trackWheelSpin(params: {
  gift: string;
  giftId: string;
  claimed?: boolean;
  claimId?: string;
  status?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const sessionId = getSessionId();
    
    let clientCountry = "Unknown";
    try {
      const storedCountry = sessionStorage.getItem("client_country");
      if (storedCountry) {
        clientCountry = storedCountry;
      }
    } catch (_) {}

    await fetch("/api/wheel-spins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        country: clientCountry,
        ...params,
      }),
    });
  } catch (err) {
    console.error("Failed to track wheel spin:", err);
  }
}
