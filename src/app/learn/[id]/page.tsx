"use client";
import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCourseById, getCourseContents } from "@/lib/moodle-api";

interface CourseModule {
  id: number;
  name: string;
  modname: string;
  url?: string;
  description?: string;
  contents?: { filename: string; fileurl: string }[];
}

interface CourseSection {
  id: number;
  name: string;
  summary: string;
  modules?: CourseModule[];
}

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);

  useEffect(() => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/learn/${resolvedParams.id}`);
      return;
    }
    loadCourseData();
  }, [resolvedParams.id, session]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseId = parseInt(resolvedParams.id);
      const courseData = await getCourseById(courseId);
      const contents = await getCourseContents(courseId);
      
      setCourse(courseData);
      setSections(contents);
      
      if (contents.length > 0 && contents[0].modules && contents[0].modules.length > 0) {
        setSelectedModule(contents[0].modules[0]);
      }
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Content Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 sticky top-6">
              <div className="mb-6">
                <Link
                  href={`/courses/${resolvedParams.id}`}
                  className="text-sm text-orange-600 hover:underline mb-4 block"
                >
                  ← Back to Course
                </Link>
                <h2 className="text-lg font-bold text-gray-900">{course?.fullname}</h2>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {sections.map((section) => (
                  <div key={section.id}>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                      {section.name || "Content"}
                    </p>
                    <ul className="space-y-1">
                      {section.modules?.map((module) => (
                        <li key={module.id}>
                          <button
                            onClick={() => setSelectedModule(module)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedModule?.id === module.id
                                ? "bg-orange-100 text-orange-600 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <span className="mr-2">{getModuleIcon(module.modname)}</span>
                            {module.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedModule ? (
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{getModuleIcon(selectedModule.modname)}</span>
                    <div>
                      <p className="text-sm text-gray-600">{selectedModule.modname}</p>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedModule.name}</h1>
                    </div>
                  </div>
                </div>

                {selectedModule.url && (
                  <a
                    href={selectedModule.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors mb-6"
                  >
                    Open Content
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}

                {selectedModule.description && (
                  <div className="prose max-w-none mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedModule.description }}
                      className="text-gray-700"
                    />
                  </div>
                )}

                {selectedModule.contents && selectedModule.contents.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Files</h2>
                    <ul className="space-y-2">
                      {selectedModule.contents.map((file, idx) => (
                        <li key={idx}>
                          <a
                            href={file.fileurl}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-lg">📄</span>
                            <span className="text-gray-700 hover:text-orange-600">
                              {file.filename}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-100 text-center">
                <p className="text-lg text-gray-600">No content available</p>
              </div>
            )}
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

