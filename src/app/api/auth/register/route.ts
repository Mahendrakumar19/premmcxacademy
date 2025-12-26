import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, firstname, lastname } = body;

    // Validate input
    if (!username || !password || !email || !firstname || !lastname) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create user in Moodle
    const moodleUrl = process.env.MOODLE_URL;
    const moodleToken = process.env.MOODLE_CREATE_USER_TOKEN;

    const response = await fetch(
      `${moodleUrl}/webservice/rest/server.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          wstoken: moodleToken!,
          wsfunction: "core_user_create_users",
          moodlewsrestformat: "json",
          "users[0][username]": username,
          "users[0][password]": password,
          "users[0][firstname]": firstname,
          "users[0][lastname]": lastname,
          "users[0][email]": email,
          "users[0][auth]": "manual",
        }),
      }
    );

    const data = await response.json();

    // Log the full response for debugging
    console.log("Moodle response:", JSON.stringify(data, null, 2));

    if (data[0]?.id) {
      return NextResponse.json(
        {
          success: true,
          message: "Account created successfully! Please login.",
          userId: data[0].id,
        },
        { status: 201 }
      );
    }

    if (data.exception) {
      // Provide more detailed error message
      const errorMsg = data.message || "Registration failed";
      const debugInfo = data.debuginfo || "";
      
      console.error("Moodle error:", errorMsg, debugInfo);
      
      // Check for specific access control error
      if (errorMsg.includes("Access control exception") || errorMsg.includes("accessexception")) {
        return NextResponse.json(
          { 
            error: "⚠️ Moodle Web Services Not Configured",
            details: "Please enable 'core_user_create_users' function in Moodle web services and grant 'moodle/user:create' capability. See AUTHENTICATION.md Section 2 for instructions."
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: errorMsg,
          details: debugInfo ? `Debug: ${debugInfo}` : undefined
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
