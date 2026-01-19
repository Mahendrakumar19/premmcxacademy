"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, use, useCallback, useMemo } from "react";
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

  const loadCourseData = useCallback(async () => {
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
        } catch (_err) {
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

      // Automatically select and display the first module with video content
      if (sectionsArray.length > 0) {
        for (const section of sectionsArray) {
          if (section.modules && section.modules.length > 0) {
            // Find first video module or just first module
            const firstModule = section.modules[0];
            setSelectedModule(firstModule);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, session?.user]);

  useEffect(() => {
    // Session check not needed - middleware already protects this route
    // Just load the course data when the component mounts and session is available
    loadCourseData();
  }, [resolvedParams.id, session?.user, loadCourseData]);

  const handleModuleSelect = async (module: CourseModule) => {
    setSelectedModule(module);
    setForumDiscussions([]);
    
    // Debug: Log module data to console
    console.log('🔹 Selected module:', {
      id: module.id,
      name: module.name,
      modname: module.modname,
      hasUrl: !!module.url,
      url: module.url,
      hasContents: !!module.contents,
      contentsLength: module.contents?.length || 0,
      contents: module.contents,
      description: module.description ? `${module.description.substring(0, 100)}...` : 'No description',
    });
    
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

  // Don't require authentication check before rendering - let the page load immediately
  // Authentication is handled by middleware, not by this component
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Content Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 border border-gray-200 sticky top-6 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <Link
                  href={`/courses/${resolvedParams.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 mb-4 transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Course
                </Link>
                <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{course?.fullname}</h2>
              </div>

              <div className="border-t border-gray-200 my-4"></div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Course Content</p>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {sections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No course content available yet.</p>
                  </div>
                ) : (
                  sections.map((section) => (
                    <div key={section.id} className="mb-4">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 pl-1">
                        {section.name || "Content"}
                      </p>
                      <ul className="space-y-1.5">
                        {section.modules?.map((module) => (
                          <li key={module.id}>
                            <button
                              onClick={() => handleModuleSelect(module)}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                selectedModule?.id === module.id
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-105"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <span className="text-lg flex-shrink-0">{getModuleIcon(module.modname)}</span>
                              <span className="truncate">{module.name}</span>
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
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 px-8 py-6 text-white">
                  {selectedModule.modname !== 'page' && (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getModuleIcon(selectedModule.modname)}</span>
                        <h1 className="text-3xl font-bold">{selectedModule.name}</h1>
                      </div>
                      <p className="text-orange-100 text-sm font-medium capitalize">{selectedModule.modname} • {selectedModule.modplural || ''}</p>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8">

                {selectedModule.description && (
                  <div className="mb-8 pb-8 border-b border-gray-200">
                    {/* For page modules, render description directly (it may contain embedded videos) */}
                    {selectedModule.modname === 'page' ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: selectedModule.description }}
                        className="prose prose-lg max-w-none video-content text-gray-800"
                      />
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 000 2h12a1 1 0 100-2h3a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                          </svg>
                          Module Description
                        </h2>
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedModule.description }}
                          className="text-gray-700 bg-orange-50 p-6 rounded-lg border border-orange-200 prose prose-sm max-w-none"
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Forum Discussions */}
                {selectedModule.modname === 'forum' && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"></path>
                          <path d="M6 11a1 1 0 11-2 0 1 1 0 012 0zM12 11a1 1 0 11-2 0 1 1 0 012 0zM16 11a1 1 0 11-2 0 1 1 0 012 0z"></path>
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Course Discussions</h2>
                    </div>
                    {loadingContent ? (
                      <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading discussions...</p>
                      </div>
                    ) : forumDiscussions.length > 0 ? (
                      <div className="space-y-4">
                        {forumDiscussions.map((discussion) => (
                          <div key={discussion.id} className="bg-white rounded-lg border border-gray-300 p-6 hover:shadow-md hover:border-orange-300 transition-all group">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{discussion.name}</h3>
                            <div 
                              className="text-gray-700 mb-4 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: discussion.message }}
                            />
                            <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
                              <span className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <strong>{discussion.numreplies}</strong> {discussion.numreplies === 1 ? 'reply' : 'replies'}
                              </span>
                              <span className="flex items-center gap-2 hover:text-orange-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(discussion.timemodified * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-5xl mb-4">💬</div>
                        <p className="text-gray-700 font-medium">No discussions yet</p>
                        <p className="text-gray-500 text-sm mt-2">Be the first to start a discussion and engage with your classmates!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Content Display - Videos Only */}
                
                {selectedModule.url && selectedModule.modname === 'url' && (
                  <div className="mb-8">
                    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                      {(() => {
                        const url = selectedModule.url;
                        
                        // YouTube video
                        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                          const videoId = url.includes('youtu.be/') 
                            ? url.split('youtu.be/')[1]?.split('?')[0]
                            : new URL(url).searchParams.get('v');
                          
                          if (videoId) {
                            return (
                              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  className="absolute top-0 left-0 w-full h-full"
                                  title={selectedModule.name}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            );
                          }
                        }
                        
                        // Vimeo video
                        if (url.includes('vimeo.com/')) {
                          const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                          if (videoId) {
                            return (
                              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                  src={`https://player.vimeo.com/video/${videoId}`}
                                  className="absolute top-0 left-0 w-full h-full"
                                  title={selectedModule.name}
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            );
                          }
                        }
                        
                        // Direct video URL
                        if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
                          return (
                            <video
                              controls
                              controlsList="nodownload"
                              disablePictureInPicture
                              className="w-full"
                              src={url}
                              preload="metadata"
                            >
                              Your browser does not support video playback.
                            </video>
                          );
                        }
                        
                        // Fallback: Generic iframe for other URLs (use proxy if Moodle URL)
                        const iframeSrc = url.includes('lms.prem') || url.includes('pluginfile')
                          ? `/api/proxy-image?url=${encodeURIComponent(url)}`
                          : url;
                        return (
                          <iframe
                            src={iframeSrc}
                            className="w-full h-[600px]"
                            title={selectedModule.name}
                            allowFullScreen
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Embed Quiz/Assignment directly in iframe */}
                {selectedModule.url && (selectedModule.modname === 'quiz' || selectedModule.modname === 'assign') && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Interactive Content</h3>
                    </div>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg overflow-hidden bg-blue-50">
                      {(() => {
                        const iframeSrc = selectedModule.url.includes('lms.prem') || selectedModule.url.includes('pluginfile')
                          ? `/api/proxy-image?url=${encodeURIComponent(selectedModule.url)}`
                          : selectedModule.url;
                        return (
                          <iframe
                            src={iframeSrc}
                            className="w-full h-[600px]"
                            title={selectedModule.name}
                            allowFullScreen
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Show Videos/Media Inline - Filter to show only video content */}
                {selectedModule.contents && selectedModule.contents.length > 0 && (
                  <div className="space-y-6">
                    {selectedModule.contents
                      .map((file, idx) => {
                        const isVideo = file.filename.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i);
                        const isHTML = file.filename.match(/\.(html|htm)$/i);
                        const isPDF = file.filename.match(/\.pdf$/i);
                        
                        // Add authentication token to Moodle URLs via proxy
                        const authenticatedUrl = file.fileurl.includes('pluginfile.php') || file.fileurl.includes('lms.prem')
                          ? `/api/proxy-image?url=${encodeURIComponent(file.fileurl)}`
                          : file.fileurl;
                        
                        return (
                          <div key={idx} className="w-full">
                            {isVideo && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                    <path d="M6.3 12.3a1 1 0 001.4 0l2.3-2.3 2.3 2.3a1 1 0 001.4-1.4l-2.3-2.3 2.3-2.3a1 1 0 00-1.4-1.4l-2.3 2.3-2.3-2.3a1 1 0 00-1.4 1.4l2.3 2.3-2.3 2.3a1 1 0 000 1.4z"></path>
                                  </svg>
                                  <p className="text-sm font-semibold">{file.filename}</p>
                                </div>
                                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                                  <video
                                    controls
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    className="w-full"
                                    src={authenticatedUrl}
                                    preload="metadata"
                                  >
                                    Your browser does not support video playback.
                                  </video>
                                </div>
                              </div>
                            )}                            {isHTML && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                                  </svg>
                                  <p className="text-sm font-semibold">{file.filename}</p>
                                </div>
                                <div className="border-2 border-purple-300 rounded-lg overflow-hidden bg-purple-50">
                                  <iframe
                                    src={authenticatedUrl}
                                    className="w-full h-[600px]"
                                    title={file.filename}
                                    allowFullScreen
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                  />
                                </div>
                              </div>
                            )}
                            {isPDF && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"></path>
                                  </svg>
                                  <p className="text-sm font-semibold">{file.filename}</p>
                                </div>
                                <div className="border-2 border-red-300 rounded-lg overflow-hidden bg-red-50">
                                  <iframe
                                    src={authenticatedUrl}
                                    className="w-full h-[800px]"
                                    title={file.filename}
                                  />
                                </div>
                              </div>
                            )}
                            {!isVideo && !isHTML && !isPDF && (
                              <a
                                href={authenticatedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 px-4 py-3 rounded-lg text-blue-600 hover:text-blue-700 font-medium transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="text-left">
                                  <p className="text-sm font-semibold">Download</p>
                                  <p className="text-xs text-blue-500">{file.filename}</p>
                                </div>
                              </a>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show message when no content is available */}
                {!selectedModule.description && 
                 !selectedModule.url && 
                 (!selectedModule.contents || selectedModule.contents.length === 0) && 
                 selectedModule.modname !== 'forum' && (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No content available</p>
                    <p className="text-gray-500 text-sm mt-2">Check back later or contact your instructor</p>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-12 border border-gray-200 text-center">
                <div className="text-6xl mb-6">📚</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Select a module to begin</h2>
                <p className="text-gray-600 mb-2">Choose any lesson, quiz, discussion, or resource from the sidebar</p>
                <p className="text-sm text-gray-500">Your progress will be saved automatically</p>
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

