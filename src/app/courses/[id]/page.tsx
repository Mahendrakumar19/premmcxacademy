"use client";
import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCourseById, getCourseContents } from "@/lib/moodle-api";

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  categoryname?: string;
  visible: number;
  format: string;
  showgrades: boolean;
  enablecompletion?: boolean;
  startdate?: number;
  enddate?: number;
  price?: number;
  enrolled?: boolean;
}

interface CourseModule {
  id: number;
  name: string;
  modname: string;
  url?: string;
  description?: string;
}

interface CourseSection {
  id: number;
  name: string;
  summary: string;
  modules?: CourseModule[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, [resolvedParams.id, session]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const courseId = parseInt(resolvedParams.id);
      const courseData = await getCourseById(courseId);
      const price = extractPriceFromSummary(courseData?.summary || '');

      let isEnrolled = false;
      if (session?.user) {
        try {
          const response = await fetch(`/api/courses/check-enrollment?courseId=${courseId}`);
          if (response.ok) {
            const data = await response.json();
            isEnrolled = data.enrolled || false;
          }
        } catch (err) {
          isEnrolled = false;
        }
      }

      setCourse({
        ...courseData,
        price,
        enrolled: isEnrolled
      });
      setEnrolled(isEnrolled);

      if (isEnrolled) {
        try {
          const contents = await getCourseContents(courseId);
          setSections(contents);
        } catch (err) {
          console.error("Failed to load course contents:", err);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load course");
      console.error("Course load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const extractPriceFromSummary = (summary: string): number => {
    if (!summary) return 0;
    const priceMatch = summary.match(/₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, ""));
    }
    return 0;
  };

  const handleEnroll = () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/courses/${resolvedParams.id}`);
      return;
    }
    router.push(`/checkout?courseId=${resolvedParams.id}`);
  };

  const handleContinueLearning = () => {
    router.push(`/learn/${resolvedParams.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error ? "Error Loading Course" : "Course Not Found"}
            </h1>
            <p className="text-gray-600 mb-6">{error || "This course could not be found."}</p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/courses"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
              {enrolled && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                  ✓ Enrolled
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.fullname}</h1>
              <p className="text-gray-600 mb-4">{course.shortname}</p>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: course.summary }}
              />
            </div>

            {enrolled && sections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Contents</h2>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3">
                        <h3 className="font-semibold text-gray-900">{section.name}</h3>
                      </div>
                      {section.modules && section.modules.length > 0 ? (
                        <ul className="p-4 space-y-2">
                          {section.modules.map((module) => (
                            <li key={module.id} className="flex items-start gap-3">
                              <span className="text-lg mt-0.5">{getModuleIcon(module.modname)}</span>
                              <div className="flex-1">
                                <p className="text-gray-900 font-medium">{module.name}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-gray-500">No modules</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 sticky top-6">
              <div className="mb-8">
                {course.price && course.price > 0 ? (
                  <div className="text-4xl font-bold text-orange-600">
                    ₹{course.price.toLocaleString("en-IN")}
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-green-600">FREE</div>
                )}
              </div>

              {enrolled ? (
                <button
                  onClick={handleContinueLearning}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {course.price && course.price > 0 ? "Buy Now" : "Enroll Free"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getModuleIcon(modname: string): string {
  const icons: { [key: string]: string } = {
    resource: "📄", url: "🔗", page: "📝", folder: "📁", assign: "📋",
    quiz: "✏️", forum: "💬", label: "🏷️", book: "📚", h5pactivity: "🎮",
    scorm: "📦", choice: "✅", feedback: "📊", glossary: "📖", lesson: "🎓",
  };
  return icons[modname] || "📌";
}
