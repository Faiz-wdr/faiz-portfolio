"use server";

export interface GiftTokenResponse {
  token: string;
  redeemUrl: string;
}

/**
 * Requests a gift token from PersonalOS for the "PersonalOS Pro" campaign.
 * This runs securely on the server using environment variables to keep the API key safe.
 */
export async function createGiftToken(): Promise<GiftTokenResponse> {
  const apiUrl = process.env.PERSONALOS_API_URL;
  const apiKey = process.env.PERSONALOS_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("Missing PersonalOS environment variables:", {
      hasUrl: !!apiUrl,
      hasKey: !!apiKey,
    });
    throw new Error("PersonalOS configuration is missing on the server.");
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
      console.error(`[PersonalOS Service] Failed to create token. Status: ${response.status}. Error: ${errorText}`);
      throw new Error(`Failed to generate gift token (status ${response.status}).`);
    }

    const data = (await response.json()) as GiftTokenResponse;
    
    if (!data.token || !data.redeemUrl) {
      console.error("[PersonalOS Service] Received invalid response structure:", data);
      throw new Error("Invalid token response from PersonalOS API.");
    }

    console.log("[PersonalOS Service] Successfully generated gift token.");
    return data;
  } catch (error) {
    console.error("[PersonalOS Service] Network or operational error during token request:", error);
    throw error;
  }
}
