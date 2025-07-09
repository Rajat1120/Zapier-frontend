import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { updateGoogle_Tokens } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  const { scopes, token } = JSON.parse(decodeURIComponent(state));

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    // store token in DB
    await updateGoogle_Tokens({
      access_token,
      refresh_token,
      scopes,
      expires_in,
      token,
    });

    return new NextResponse(
      `<html>
     <body>
       <script>
         window.opener.postMessage("oauth-success", window.origin);
         window.close();
       </script>
     </body>
   </html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    );
  }
}
