'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

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
      const res = await fetch('/api/courses', { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error('Failed to fetch courses');
      }
      const data = await res.json();
      
      // Check for Moodle error response
      if (data.error || data.errorcode) {
        console.error('Moodle Error:', data);
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
      console.error('Error fetching courses:', error);
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
    
    // Price range filtering - use displayPrice
    const coursePrice = course.displayPrice ? parseFloat(String(course.displayPrice)) : 0;
    const matchesPrice = coursePrice >= priceRange[0] && coursePrice <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddToCart = (course: Course) => {
    const imageUrl = course.courseimage || 
                     course.imageurl || 
                     course.overviewfiles?.[0]?.fileurl || 
                     '/placeholder-course.jpg';
    
    // Check if user is logged in
    if (status === 'unauthenticated') {
      // Store the course to add after login
      sessionStorage.setItem('pendingAddToCart', JSON.stringify({
        courseId: course.id,
        courseName: course.fullname,
        cost: String(course.displayPrice || course.price || '0'),
        currency: course.currency || 'INR',
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
      cost: String(course.displayPrice || course.price || '0'),
      currency: course.currency || 'INR',
      thumbnailUrl: imageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>India&apos;s #1 MCX Trading Academy</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Master MCX Trading
              <span className="block text-yellow-300">With Expert Guidance</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master share and commodity trading with expert guidance on natural gas, crude oil, gold, and silver through our proven intraday price action courses and live market analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
              >
                Explore Courses
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button 
                onClick={() => router.push('/live-classes')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14 0H4v8h12V6z" />
                </svg>
                Live Classes
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Active Students', value: '10,000+' },
                { label: 'Expert Instructors', value: '50+' },
                { label: 'Course Hours', value: '5,000+' },
                { label: 'Success Rate', value: '95%' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20">
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
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
                >
                  {/* Course Header Gradient */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    
                    {/* Category Badge */}
                    {course.categoryname && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-indigo-600">
                          {course.categoryname}
                        </span>
                      </div>
                    )}
                    
                    {/* Price Badge with Money Icon */}
                    {/* <div className="absolute top-4 right-4">
                      {course.displayPrice && parseFloat(String(course.displayPrice)) > 0 ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-bold text-gray-900">
                            {course.currency === 'INR' ? '₹' : ' '}{parseFloat(String(course.displayPrice)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-green-500/95 backdrop-blur-sm rounded-full shadow-lg">
                          <span className="text-xs font-bold text-white">FREE</span>
                        </div>
                      )}
                    </div> */}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.fullname}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
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
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        {course.displayPrice && parseFloat(String(course.displayPrice)) > 0 ? (
                          <div>
                            <span className="text-2xl font-bold text-indigo-600">₹ {parseFloat(String(course.displayPrice)).toLocaleString('en-IN')}</span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-green-600">Free</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/courses/${course.id}`)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(course)}
                          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                          title="Add to Cart / Enroll"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Trading Journey?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of successful traders who have transformed their careers with PremMCX Academy
          </p>
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}
