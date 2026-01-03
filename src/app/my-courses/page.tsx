"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getUserCourses } from "@/lib/moodle-api";

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  courseimage?: string;
  progress?: number;
}

function MyCoursesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrolledMessage, setShowEnrolledMessage] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/my-courses');
      return;
    }
    if (session?.user) {
      loadCourses();
      const enrolled = searchParams.get('enrolled');
      if (enrolled === 'true') {
        setShowEnrolledMessage(true);
        setTimeout(() => setShowEnrolledMessage(false), 5000);
      }
    }
  }, [status, session, router, searchParams]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const userId = (session?.user as unknown as { id?: number })?.id;
      const token = (session?.user as unknown as { token?: string })?.token;
      
      if (!userId || !token) {
        console.error('No user ID or token available');
        return;
      }

      console.log('Fetching enrolled courses for user:', userId);
      const enrolledCourses = await getUserCourses(userId, token);
      console.log('Enrolled courses:', enrolledCourses);
      setCourses(enrolledCourses);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enrollment Success Message */}
        {showEnrolledMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Successfully enrolled! Your course is now available below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Continue learning from where you left off or explore new content
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">&apos;You haven&apos;t enrolled in any courses yet. Start learning today!</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {course.courseimage ? (
                    <>
                      <img
                        src={course.courseimage}
                        alt={course.fullname}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-sm font-medium">{course.shortname}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Badge */}
                  {course.progress !== undefined && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-gray-900">
                        {course.progress}% Complete
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.fullname}
                  </h3>
                  
                  {course.summary && (
                    <p 
                      className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1"
                      dangerouslySetInnerHTML={{ __html: course.summary }}
                    />
                  )}

                  {/* Progress Bar */}
                  {course.progress !== undefined && course.progress > 0 && (
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/learn/${course.id}`}
                    className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center rounded-lg transition-colors duration-200"
                  >
                    {course.progress && course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyCoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    }>
      <MyCoursesContent />
    </Suspense>
  );
}
