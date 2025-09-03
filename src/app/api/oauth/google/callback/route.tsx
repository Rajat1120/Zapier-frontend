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
    const grantedScopes = tokenResponse.data.scope ? tokenResponse.data.scope.split(' ') : scopes;
    
    console.log("Requested scopes:", scopes);
    console.log("Granted scopes:", grantedScopes);
    
    // Verify that the granted scopes include what we actually need
    if (state.includes('gmail')) {
      const requiredGmailScopes = [
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/gmail.labels'
      ];
      const missingScopes = requiredGmailScopes.filter(scope => !grantedScopes.includes(scope));
      
      if (missingScopes.length > 0) {
        console.error('❌ Missing required Gmail scopes:', missingScopes);
        return NextResponse.json({ 
          error: `Gmail access requires additional permissions. Missing scopes: ${missingScopes.join(', ')}` 
        }, { status: 400 });
      }
    }

    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    // store token in DB - use granted scopes, not requested scopes
    await updateGoogle_Tokens({
      access_token,
      refresh_token,
      scopes: grantedScopes, // Use actual granted scopes
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
