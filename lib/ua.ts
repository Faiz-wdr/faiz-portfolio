export function parseUserAgent(userAgent: string | null) {
  let browser = "Unknown";
  let device = "Desktop";

  if (!userAgent) {
    return { browser, device };
  }

  const ua = userAgent.toLowerCase();

  // Device detection
  if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipod")) {
    device = "Mobile";
  } else if (ua.includes("tablet") || ua.includes("ipad") || ua.includes("playbook") || ua.includes("silk")) {
    device = "Tablet";
  }

  // Browser detection
  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome") || ua.includes("crios")) {
    if (ua.includes("opr") || ua.includes("opera")) {
      browser = "Opera";
    } else {
      browser = "Chrome";
    }
  } else if (ua.includes("safari")) {
    browser = "Safari";
  } else if (ua.includes("firefox") || ua.includes("fxios")) {
    browser = "Firefox";
  }

  return { browser, device };
}
