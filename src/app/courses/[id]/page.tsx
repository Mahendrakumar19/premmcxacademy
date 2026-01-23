"use client";
import React, { useState, use, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
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

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courseId = parseInt(resolvedParams.id);

      console.log('=== Loading Course Details ===');
      console.log('Course ID:', courseId);
      
      // Fetch course with pricing from Moodle
      console.log('🔍 Fetching course details...');
      const courseRes = await fetch(`/api/moodle?action=course&id=${courseId}&withPayment=true`, {
        cache: 'no-store'
      });
      
      if (!courseRes.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const coursePayload = await courseRes.json();
      console.log('📦 Course data:', coursePayload);
      
      const courseData = coursePayload.data;
      
      if (!courseData) {
        setError('Course not found');
        return;
      }

      // Get pricing from Moodle custom fields
      const cost = courseData.cost || '0';
      const currency = courseData.currency || 'INR';
      
      console.log('💰 Course pricing:', { cost, currency });

      // Check enrollment status
      let isEnrolled = false;
      if (session?.user) {
        try {
          console.log('🔍 Checking enrollment status...');
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

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err) || "Failed to load course");
      console.error("Course load error:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, session?.user]);

  // Call loadCourseData when component mounts or dependencies change
  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
          {enrolled && (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
              ✓ Enrolled
            </span>
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.fullname}</h1>
          <p className="text-lg text-gray-600 mb-6">{course.shortname}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-200">
            {/* Course Description */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
              <div
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: course.summary }}
              />
            </div>

            {/* Price and Add to Cart */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {course.cost && parseFloat(course.cost) > 0
                      ? `${course.currency || 'INR'} ${course.cost}`
                      : 'FREE'}
                  </p>
                </div>

                {enrolled ? (
                  <button
                    onClick={handleContinueLearning}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!course) return;

                      // Check if user is logged in
                      if (status === 'unauthenticated') {
                        const imageUrl =
                          course.courseimage || course.imageurl || '/placeholder-course.jpg';

                        sessionStorage.setItem(
                          'pendingAddToCart',
                          JSON.stringify({
                            courseId: course.id,
                            courseName: course.fullname,
                            cost: String(course.displayPrice || course.price || '0'),
                            currency: course.currency || 'INR',
                            thumbnailUrl: imageUrl,
                          })
                        );

                        router.push(
                          `/auth/login?callbackUrl=${encodeURIComponent(`/courses/${course.id}`)}`
                        );
                        return;
                      }

                      const imageUrl =
                        course.courseimage || course.imageurl || '/placeholder-course.jpg';

                      addToCart({
                        courseId: course.id,
                        courseName: course.fullname,
                        cost: String(course.displayPrice || course.price || '0'),
                        currency: course.currency || 'INR',
                        thumbnailUrl: imageUrl,
                      });

                      alert('✅ Added to cart! Proceed to checkout.');
                      router.push('/cart');
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
