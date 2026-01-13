import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json(session ?? {});
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, password } = body;

    if (action === "moodle_token") {
      const moodleUrl = process.env.MOODLE_URL;
      
      const response = await fetch(
        `${moodleUrl}/login/token.php?service=moodle_mobile_app`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username,
            password,
            service: "moodle_mobile_app",
          }),
        }
      );

      const data = await response.json();

      if (data.token) {
        // Also get site info to get the userid
        const siteInfoRes = await fetch(
          `${moodleUrl}/webservice/rest/server.php?wstoken=${data.token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`
        );
        const siteInfo = await siteInfoRes.json();
        
        return NextResponse.json({ 
          token: data.token,
          userid: siteInfo.userid 
        });
      } else {
        return NextResponse.json(
          { error: data.error || "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Session API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
