import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "https://l4t55h-3000.csb.app/api/auth/google-auth",
});

export async function getGoogleAuthUrl() {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "email"],
  });
  return url;
}

export async function getGoogleAccessToken(code: string) {
  try {
    const { tokens } = await client.getToken(code);
    return tokens.id_token;
  } catch (error: any) {
    console.error("Error getting access token:", error.message);
    throw error; // Rethrow the error to be handled by the caller
  }
}

export async function getGoogleUserInfo(accessToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: accessToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error: any) {
    console.error("Error verifying ID token:", error.message);
    throw error; // Rethrow the error to be handled by the caller
  }
}