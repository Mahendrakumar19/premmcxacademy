'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ImageSlider from '@/components/ImageSlider';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { generateCourseImagePlaceholder } from '@/lib/course-placeholder';

interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  displayname?: string;
  categoryname?: string;
  enrollmentcount?: number;
  price?: number | string;
  displayPrice?: number | string;
  cost?: string;
  currency?: string;
  gst?: string | number;
  courseimage?: string;
  imageurl?: string;
  overviewfiles?: Array<{ fileurl: string }>;
  requiresPayment?: boolean;
  paymentaccount?: string | null;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const { addToCart } = useCart();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Force no-cache with timestamp to bypass browser cache
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/courses?t=${timestamp}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ API Error (Status: ' + res.status + '):', errorData);
        
        // More detailed error message for specific status codes
        if (res.status === 500) {
          console.error('⚠️ Server error - Moodle might not be configured. Check MOODLE_TOKEN and MOODLE_URL environment variables');
        }
        
        throw new Error(`API returned ${res.status}: ${errorData?.error || 'Failed to fetch courses'}`);
      }
      
      const data = await res.json();
      
      // Check for Moodle error response
      if (data.error || data.errorcode) {
        console.error('❌ Moodle Error:', data);
        throw new Error(data.error || 'Moodle API error');
      }
      
      // Handle raw Moodle data directly, filter out course 1 (site course - PremMCXTrainingAcademy)
      const filteredData = Array.isArray(data) ? data.filter(c => {
        // Filter out course ID 1 (site course) and courses with format 'site'
        return c.id !== 1 && c.format !== 'site';
      }) : [];
      
      console.log('🎓 Filtered courses:', filteredData.length, filteredData.map(c => ({ id: c.id, name: c.fullname, price: c.displayPrice })));
      setCourses(filteredData);

      // Debug helper: expose fetched/filtered data on page for quick diagnostics
      try {
        (window as any).__DEBUG_COURSES = { fetched: data, filtered: filteredData };
      } catch (e) {
        // ignore in non-browser contexts
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      // Set courses to empty array but don't throw - let page still render
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(courses.map((c) => c.categoryname || 'General').filter(Boolean)))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (course.categoryname || 'General') === selectedCategory;
    
    // Price range filtering - handle non-numeric prices gracefully
    let coursePrice = 0;
    if (course.displayPrice) {
      // Try to extract numeric value, if it's not a number, default to 0 (free)
      const numericPrice = parseFloat(String(course.displayPrice).replace(/[^\d.]/g, ''));
      coursePrice = isNaN(numericPrice) ? 0 : numericPrice;
    }
    const matchesPrice = coursePrice >= priceRange[0] && coursePrice <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddToCart = (course: Course) => {
    const rawImageUrl = course.courseimage || 
                     course.imageurl || 
                     course.overviewfiles?.[0]?.fileurl || 
                     '/placeholder-course.jpg';
    
    // If it's a Moodle image URL, use the proxy
    const imageUrl = (rawImageUrl?.includes('lms.prem') || rawImageUrl?.includes('pluginfile')) 
      ? `/api/proxy-image?url=${encodeURIComponent(rawImageUrl)}`
      : rawImageUrl;
    
    // Calculate final price with GST
    const basePrice = parseFloat(String(course.displayPrice || course.price || '0'));
    const gstRate = course.gst ? parseInt(String(course.gst)) : 0;
    // Pass base price to cart, GST will be calculated there
    const cartPrice = basePrice;
    
    // Check if user is logged in
    if (status === 'unauthenticated') {
      // Store the course to add after login
      sessionStorage.setItem('pendingAddToCart', JSON.stringify({
        courseId: course.id,
        courseName: course.fullname,
        cost: String(cartPrice.toFixed(2)),
        currency: course.currency || 'INR',
        gst: gstRate,
        thumbnailUrl: imageUrl,
      }));
      
      // Redirect to login page
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/')}`);
      return;
    }
    
    // User is logged in - add to cart
    addToCart({
      courseId: course.id,
      courseName: course.fullname,
      cost: String(cartPrice.toFixed(2)),
      currency: course.currency || 'INR',
      gst: gstRate,
      thumbnailUrl: imageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Image Slider Hero Section */}
      <ImageSlider />

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore Our Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive training programs designed to elevate your trading skills
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search courses by name, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Courses' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                // Get image URL from backend (if any)
                const rawImageUrl = course.courseimage || 
                                 course.overviewfiles?.[0]?.fileurl || 
                                 null;
                
                // If it's a Moodle image URL, use the proxy
                const isMoodleUrl = rawImageUrl && (
                  rawImageUrl.includes('lms.prem') || 
                  rawImageUrl.includes('pluginfile') ||
                  rawImageUrl.includes('draftfile') ||
                  rawImageUrl.includes('/course/overview') ||
                  rawImageUrl.includes('http')
                );
                
                const moodleImageUrl = isMoodleUrl && rawImageUrl
                  ? `/api/proxy-image?url=${encodeURIComponent(rawImageUrl)}`
                  : rawImageUrl;
                
                // Generate placeholder image based on course
                const placeholderImageUrl = generateCourseImagePlaceholder(course.fullname, course.id);
                
                // Use Moodle image if available, otherwise use placeholder
                const imageUrl = moodleImageUrl || placeholderImageUrl;
                
                return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
                >
                  {/* Course Header - Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={course.fullname}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                    
                    {/* Category Badge */}
                    {course.categoryname && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-indigo-600">
                          {course.categoryname}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.fullname}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 group-hover:line-clamp-none group-hover:text-gray-700 group-hover:bg-gray-50 group-hover:p-3 group-hover:rounded transition-all">
                      {course.summary.replace(/<[^>]*>/g, '')}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>{course.enrollmentcount || 0} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="mb-4">
                        {course.displayPrice && parseFloat(String(course.displayPrice)) > 0 ? (
                          <div>
                            {(() => {
                              const basePrice = parseFloat(String(course.displayPrice));
                              return (
                                <span className="text-2xl font-bold text-indigo-600">
                                  ₹ {basePrice.toLocaleString('en-IN')}
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-green-600">Free</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/courses/${course.id}`)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(course)}
                          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                          title="Buy Now"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </section>

      {/* Get Started Today Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Trading Journey?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of successful traders who have transformed their careers with PremMCX Academy
          </p>
          <a
            href="https://forms.gle/cXqeQARFR8GcPUHn7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Get Started Today
          </a>
        </div>
      </section>
    </div>
  );
}
