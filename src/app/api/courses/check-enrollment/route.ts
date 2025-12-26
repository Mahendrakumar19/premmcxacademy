import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserCourses } from "@/lib/moodle-api";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get course ID from query params
    const courseId = request.nextUrl.searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const token = session.user.moodleToken;

    if (!token) {
      return NextResponse.json(
        { error: "Moodle token not available" },
        { status: 400 }
      );
    }

    // Get user's enrolled courses
    const userCourses = await getUserCourses(userId, token);
    
    // Check if user is enrolled in the requested course
    const isEnrolled = userCourses.some((course: any) => course.id === parseInt(courseId));

    return NextResponse.json({
      enrolled: isEnrolled,
      courses: userCourses
    });
  } catch (error: any) {
    console.error("Enrollment check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check enrollment" },
      { status: 500 }
    );
  }
}
