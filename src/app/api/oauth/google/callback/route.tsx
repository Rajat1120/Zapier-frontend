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
    console.log("Granted scopes:", tokenResponse.data.scope);

    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    // store token in DB
    await updateGoogle_Tokens({
      access_token,
      refresh_token,
      scopes,
      expires_in,
      token,
      email: userInfoRes.data.email,
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error_description ||
      error?.response?.data?.error ||
      error?.message ||
      "Unknown error during token exchange";

    console.error("OAuth Callback Error:", errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
