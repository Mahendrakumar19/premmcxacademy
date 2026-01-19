"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, use, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCourseContents } from '@/lib/moodle-api';
import { useCart } from '@/context/CartContext';

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
  cost?: string;
  displayPrice?: string | number;
  currency?: string;
  enrolled?: boolean;
  courseimage?: string;
  imageurl?: string;
  price?: string;
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
  const { addToCart } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseId = parseInt(resolvedParams.id);
      const userToken = (session?.user as unknown as { token?: string })?.token;

      console.log('=== Course Detail - Real-time Data Fetch ===');
      console.log('Course ID:', courseId);
      
      // Fetch course with real-time pricing from Moodle custom fields
      console.log('🔍 Fetching course with real-time pricing from Moodle...');
      const courseRes = await fetch(`/api/moodle?action=course&id=${courseId}&withPayment=true`, {
        cache: 'no-store'
      });
      
      if (!courseRes.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const coursePayload = await courseRes.json();
      console.log('📦 Live course data from Moodle:', coursePayload);
      
      const courseData = coursePayload.data;
      
      if (!courseData) {
        setError('Course not found');
        return;
      }

      // Real-time pricing from Moodle custom fields
      const cost = courseData.cost || '0';
      const currency = courseData.currency || 'INR';
      
      console.log('💰 Real-time pricing from Moodle custom fields:', { 
        cost, 
        currency,
        requiresPayment: courseData.requiresPayment,
        isFree: !cost || parseFloat(cost) === 0
      });

      // Check enrollment status in real-time
      let isEnrolled = false;
      if (session?.user) {
        try {
          console.log('🔍 Checking enrollment status in real-time...');
          const enrollResponse = await fetch(`/api/courses/check-enrollment?courseId=${courseId}`, {
            cache: 'no-store'
          });
          if (enrollResponse.ok) {
            const data = await enrollResponse.json();
            isEnrolled = data.enrolled || false;
            console.log('✅ Enrollment status:', isEnrolled);
          }
        } catch (err) {
          console.error('Error checking enrollment:', err);
        }
      }

      setCourse({
        ...courseData,
        cost,
        currency,
        enrolled: isEnrolled
      });
      setEnrolled(isEnrolled);

      // If enrolled, get course contents in real-time (prefer user token, fallback to server proxy)
      if (isEnrolled) {
        try {
          console.log('📚 Fetching course contents in real-time...');
          let contents: any = null;

          if (userToken) {
            try {
              contents = await getCourseContents(courseId, userToken);
              if (contents && (contents as any).exception) throw new Error('User token fetch failed');
            } catch (_err) {
              console.log('⚠️ User token failed, trying with course token...');
              const courseTokenResponse = await fetch(`/api/moodle?action=courseContents&id=${courseId}`, {
                cache: 'no-store'
              });
              if (courseTokenResponse.ok) {
                const data = await courseTokenResponse.json();
                contents = data.data;
              }
            }
          } else {
            // No user token - use server-side course token
            const courseTokenResponse = await fetch(`/api/moodle?action=courseContents&id=${courseId}`, {
              cache: 'no-store'
            });
            if (courseTokenResponse.ok) {
              const data = await courseTokenResponse.json();
              contents = data.data;
            }
          }

          setSections(Array.isArray(contents) ? contents : []);
        } catch (err) {
          console.error("Failed to load course contents:", err);
          setSections([]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Failed to load course");
      console.error("Course load error:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, session?.user, addToCart]);

  // Note: Enrollment is handled via checkout flow

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
              href="/"
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
          href="/"
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
            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 border border-indigo-100 sticky top-6">
              {/* Course Info Card */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Lifetime Access</p>
                      <p className="text-xs text-gray-600 mt-0.5">Learn at your own pace</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Certificate</p>
                      <p className="text-xs text-gray-600 mt-0.5">Upon completion</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 text-white">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Full Materials</p>
                      <p className="text-xs text-gray-600 mt-0.5">Videos, notes & resources</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              {enrolled ? (
                <button
                  onClick={handleContinueLearning}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m2-1l-2-1m2 1v2.5" />
                  </svg>
                  Continue Learning →
                </button>
              ) : (
                <div>
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        if (!course) return;
                        
                        // Check if user is logged in
                        if (status === 'unauthenticated') {
                          // Store the course to add after login
                          const imageUrl = course.courseimage || 
                                         course.imageurl || 
                                         '/placeholder-course.jpg';
                          
                          sessionStorage.setItem('pendingAddToCart', JSON.stringify({
                            courseId: course.id,
                            courseName: course.fullname,
                            cost: String(course.displayPrice || course.price || '0'),
                            currency: course.currency || 'INR',
                            thumbnailUrl: imageUrl,
                          }));
                          
                          // Redirect to login
                          router.push(`/auth/login?callbackUrl=${encodeURIComponent('/')}`);
                          return;
                        }
                        
                        // User is logged in - add to cart
                        const imageUrl = course.courseimage || 
                                       course.imageurl || 
                                       '/placeholder-course.jpg';
                        
                        addToCart({
                          courseId: course.id,
                          courseName: course.fullname,
                          cost: String(course.displayPrice || course.price || '0'),
                          currency: course.currency || 'INR',
                          thumbnailUrl: imageUrl,
                        });
                        
                        // Show success message and redirect to cart
                        alert('✅ Added to cart! Proceed to checkout to complete payment.');
                        router.push('/cart');
                      }}
                      className="w-full px-6 py-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </button>
                    
                    {/* Direct purchase button for single course */}
                    <button
                      onClick={() => {
                        if (!course) return;
                        
                        // Check if user is logged in
                        if (status === 'unauthenticated') {
                          // Store the course to add after login
                          const imageUrl = course.courseimage || 
                                         course.imageurl || 
                                         '/placeholder-course.jpg';
                          
                          sessionStorage.setItem('pendingAddToCart', JSON.stringify({
                            courseId: course.id,
                            courseName: course.fullname,
                            cost: String(course.displayPrice || course.price || '0'),
                            currency: course.currency || 'INR',
                            thumbnailUrl: imageUrl,
                          }));
                          
                          // Redirect to login
                          router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${course.id}`)}`);
                          return;
                        }
                        
                        // User is logged in - add to cart and go to checkout
                        const imageUrl = course.courseimage || 
                                       course.imageurl || 
                                       '/placeholder-course.jpg';
                        
                        addToCart({
                          courseId: course.id,
                          courseName: course.fullname,
                          cost: String(course.displayPrice || course.price || '0'),
                          currency: course.currency || 'INR',
                          thumbnailUrl: imageUrl,
                        });
                        
                        // Direct to checkout - skipping cart
                        router.push('/checkout');
                      }}
                      className="w-full px-6 py-4 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pay & Enroll Now
                    </button>
                  </div>
                  
                  <p className="text-center text-xs text-gray-600 mt-4">
                    💳 Add to cart and proceed to secure checkout
                  </p>
                </div>
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
