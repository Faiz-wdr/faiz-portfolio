"use server";

export interface GiftTokenResponse {
  success: boolean;
  token?: string;
  redeemUrl?: string;
  error?: string;
}

/**
 * Requests a gift token from PersonalOS for the "PersonalOS Pro" campaign.
 * This runs securely on the server using environment variables to keep the API key safe.
 */
export async function createGiftToken(): Promise<GiftTokenResponse> {
  const apiUrl = process.env.PERSONALOS_API_URL;
  const apiKey = process.env.PERSONALOS_API_KEY;

  if (!apiUrl || !apiKey) {
    const errorMsg = `Configuration missing on the server. URL is ${!!apiUrl ? "configured" : "MISSING"} and Key is ${!!apiKey ? "configured" : "MISSING"}.`;
    console.error(`[PersonalOS Service] ${errorMsg}`);
    return {
      success: false,
      error: errorMsg
    };
  }

  const endpoint = `${apiUrl.replace(/\/$/, "")}/api/gifts/create-token`;
  
  console.log(`[PersonalOS Service] Sending token request to ${endpoint}...`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gift: "personalos-pro",
        campaign: "birthday2026",
      }),
      // Disable caching to guarantee we fetch a fresh token
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `API returned error status ${response.status}: ${errorText || "No details"}`;
      console.error(`[PersonalOS Service] ${errorMsg}`);
      return {
        success: false,
        error: errorMsg
      };
    }

    const data = await response.json();
    
    if (!data.token || !data.redeemUrl) {
      const errorMsg = "Received invalid response structure from PersonalOS API.";
      console.error(`[PersonalOS Service] ${errorMsg}`, data);
      return {
        success: false,
        error: errorMsg
      };
    }

    console.log("[PersonalOS Service] Successfully generated gift token.");
    return {
      success: true,
      token: data.token,
      redeemUrl: data.redeemUrl
    };
  } catch (error: any) {
    const errorMsg = `Network or connection failure: ${error.message || error}`;
    console.error("[PersonalOS Service] operational error during token request:", error);
    return {
      success: false,
      error: errorMsg
    };
  }
}
