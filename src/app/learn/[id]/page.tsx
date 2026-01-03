"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  contents?: { filename: string; fileurl: string; filesize?: number; timecreated?: number }[];
  modplural?: string;
  instance?: number;
}

interface ForumDiscussion {
  id: number;
  name: string;
  timemodified: number;
  usermodified: number;
  message: string;
  numreplies: number;
}

interface CourseSection {
  id: number;
  name: string;
  summary: string;
  modules?: CourseModule[];
}

export default function CourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [forumDiscussions, setForumDiscussions] = useState<ForumDiscussion[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') {
      return;
    }
    
    // Only redirect if truly unauthenticated (not loading)
    if (status === 'unauthenticated') {
      router.push(`/auth/login?callbackUrl=/learn/${resolvedParams.id}`);
      return;
    }
    
    // If authenticated, load course data
    if (session?.user) {
      loadCourseData();
    }
  }, [resolvedParams.id, session, status, router]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const courseId = parseInt(resolvedParams.id);
      const token = (session?.user as unknown as { token?: string })?.token;
      
      console.log('Loading course learning data for ID:', courseId);
      console.log('User token available:', !!token);
      
      // Get course info
      const courseData = await getCourseById(courseId);
      console.log('Course data:', courseData);
      setCourse(courseData);
      
      // Get course contents - prefer user token, but fall back to server proxy using MOODLE_COURSE_TOKEN
      let contents: any = null;
      if (token) {
        try {
          contents = await getCourseContents(courseId, token);
          // If Moodle returned an exception object, force fallback
          if (contents && (contents as any).exception) throw new Error('User token fetch failed');
        } catch (err) {
          console.log('⚠️ User token failed, fetching via server API with course token...');
          const res = await fetch(`/api/moodle?action=courseContents&id=${courseId}`, { cache: 'no-store' });
          if (res.ok) {
            const payload = await res.json();
            contents = payload.data;
          }
        }
      } else {
        // No user token available - use server-side course token proxy
        try {
          const res = await fetch(`/api/moodle?action=courseContents&id=${courseId}`, { cache: 'no-store' });
          if (res.ok) {
            const payload = await res.json();
            contents = payload.data;
          }
        } catch (err) {
          console.error('Failed to fetch course contents via server proxy:', err);
        }
      }

      const sectionsArray = Array.isArray(contents) ? contents : [];
      setSections(sectionsArray);

      // Set first module as selected if available
      if (sectionsArray.length > 0 && sectionsArray[0].modules && sectionsArray[0].modules.length > 0) {
        setSelectedModule(sectionsArray[0].modules[0]);
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = async (module: CourseModule) => {
    setSelectedModule(module);
    setForumDiscussions([]);
    
    // Fetch content based on module type
    if (module.modname === 'forum' && module.instance) {
      await loadForumDiscussions(module.instance);
    }
  };

  const loadForumDiscussions = async (forumId: number) => {
    setLoadingContent(true);
    try {
      const token = (session?.user as any)?.token;
      const res = await fetch(`/api/moodle/forum?forumid=${forumId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setForumDiscussions(data.discussions || []);
      }
    } catch (error) {
      console.error('Failed to load forum discussions:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  if (status === 'loading' || loading) {
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

  if (!session?.user) {
    return null;
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
                {sections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No course content available yet.</p>
                  </div>
                ) : (
                  sections.map((section) => (
                    <div key={section.id}>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                        {section.name || "Content"}
                      </p>
                      <ul className="space-y-1">
                        {section.modules?.map((module) => (
                          <li key={module.id}>
                            <button
                              onClick={() => handleModuleSelect(module)}
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
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedModule ? (
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getModuleIcon(selectedModule.modname)}</span>
                    <div>
                      <p className="text-sm text-gray-600">{selectedModule.modname}</p>
                      <h1 className="text-3xl font-bold text-gray-900">{selectedModule.name}</h1>
                    </div>
                  </div>
                </div>

                {selectedModule.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About this module</h2>
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedModule.description }}
                      className="text-gray-700 bg-gray-50 p-6 rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Forum Discussions */}
                {selectedModule.modname === 'forum' && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Discussions</h2>
                    {loadingContent ? (
                      <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading discussions...</p>
                      </div>
                    ) : forumDiscussions.length > 0 ? (
                      <div className="space-y-4">
                        {forumDiscussions.map((discussion) => (
                          <div key={discussion.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.name}</h3>
                            <div 
                              className="text-gray-600 mb-3 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: discussion.message }}
                            />
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {discussion.numreplies} {discussion.numreplies === 1 ? 'reply' : 'replies'}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(discussion.timemodified * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-5xl mb-4">💬</div>
                        <p className="text-gray-600">No discussions yet. Be the first to start one!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Module */}
                {selectedModule.modname === 'quiz' && selectedModule.url && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✏️</div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Assessment</h2>
                      <p className="text-gray-700 mb-6">Test your knowledge with this quiz</p>
                      <button
                        onClick={() => openExternal(selectedModule.url)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openExternal(selectedModule.url); }}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        role="link"
                        tabIndex={0}
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                )}

                {/* Assignment Module */}
                {selectedModule.modname === 'assign' && selectedModule.url && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-8 mb-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignment</h2>
                      <p className="text-gray-700 mb-6">Submit or view this assignment</p>
                      <button
                        onClick={() => openExternal(selectedModule.url)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openExternal(selectedModule.url); }}
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        role="link"
                        tabIndex={0}
                      >
                        View Assignment
                      </button>
                    </div>
                  </div>
                )}

                {/* Files */}
                {selectedModule.contents && selectedModule.contents.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Files</h2>
                    <ul className="space-y-2">
                      {selectedModule.contents.map((file, idx) => (
                        <li key={idx}>
                          <a
                            href={file.fileurl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-orange-300 transition-colors group cursor-pointer"
                          >
                            <span className="text-2xl">📄</span>
                            <div className="flex-1">
                              <span className="text-gray-900 group-hover:text-orange-600 font-medium block">
                                {file.filename}
                              </span>
                              {file.filesize && (
                                <span className="text-sm text-gray-500">
                                  {(file.filesize / 1024).toFixed(2)} KB
                                </span>
                              )}
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* URL Module */}
                {selectedModule.modname === 'url' && selectedModule.url && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🔗</div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">External Resource</h2>
                      <p className="text-gray-700 mb-6">Click below to access this resource</p>
                      <button
                        onClick={() => openExternal(selectedModule.url)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openExternal(selectedModule.url); }}
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        role="link"
                        tabIndex={0}
                      >
                        Open Resource
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-100 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg text-gray-600 mb-2">Select a module from the sidebar</p>
                <p className="text-sm text-gray-500">Choose any lesson, quiz, or resource to view its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function openExternal(rawUrl?: string) {
  if (!rawUrl) return;
  
  try {
    // Open file URL directly in new tab
    window.open(rawUrl, '_blank', 'noopener');
    console.log('🔗 Opening file:', rawUrl.split('?')[0]);
  } catch (err) {
    console.error('❌ Failed to open file:', err);
  }
}

function getModuleIcon(modname: string): string {
  const icons: { [key: string]: string } = {
    resource: "📄", url: "🔗", page: "📝", folder: "📁", assign: "📋",
    quiz: "✏️", forum: "💬", label: "🏷️", book: "📚", h5pactivity: "🎮",
    scorm: "📦", choice: "✅", feedback: "📊", glossary: "📖", lesson: "🎓",
  };
  return icons[modname] || "📌";
}

