'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { MoodleCourse } from '@/types/moodle';

interface CourseWithPrice extends MoodleCourse {
  price: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const [courses, setCourses] = useState<CourseWithPrice[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Extract price from course summary
  const extractPrice = (summary: string): number => {
    if (!summary) return 0;
    const match = summary.match(/₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
  };

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const res = await fetch('/api/moodle?action=courses');
        const data = await res.json();
        const coursesWithPrice = (data.data || []).map((course: MoodleCourse) => ({
          ...course,
          price: extractPrice(course.summary || ''),
        }));
        setCourses(coursesWithPrice);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  // Filter courses based on search, category, and price
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((course) =>
        course.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.summary && course.summary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((course) => course.categoryName === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter((course) => course.price >= priceRange[0] && course.price <= priceRange[1]);

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, priceRange]);

  const categories = ['All', ...new Set(courses.map((c) => c.categoryName).filter(Boolean))];
  const maxPrice = Math.max(...courses.map((c) => c.price), 10000);

  const handleAddToCart = (course: CourseWithPrice) => {
    addToCart({
      id: course.id,
      fullname: course.fullname,
      price: course.price,
      imageUrl: (course as any)?.courseimage,
      categoryName: course.categoryName,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Explore Our Courses</h1>
          <p className="text-gray-400">Find the perfect course to enhance your trading skills</p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">Search Courses</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-blue-500 bg-white border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No courses found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden">
                      {(course as any)?.courseimage && (
                        <img
                          src={(course as any).courseimage}
                          alt={course.fullname}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-40 hover:bg-opacity-20 transition-all duration-300" />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {course.categoryName || 'Course'}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.fullname}</h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.summary ? course.summary.replace(/<[^>]*>/g, '') : 'No description available'}
                      </p>

                      {/* Course Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-600">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{course.enrolledusercount || 0}</div>
                          <div>Students</div>
                        </div>
                        <div className="text-center border-l border-r border-gray-200">
                          <div className="font-semibold text-gray-900">{course.shortname}</div>
                          <div>Code</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">⭐</div>
                          <div>Rated</div>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between gap-2">
                        <div>
                          {course.price > 0 ? (
                            <div>
                              <span className="text-2xl font-bold text-green-600">₹{course.price.toLocaleString()}</span>
                              <span className="text-sm text-gray-500 ml-2">One-time</span>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold text-green-600">FREE</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => router.push(`/courses/${course.id}`)}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(course)}
                          disabled={isInCart(course.id)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            isInCart(course.id)
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                          }`}
                        >
                          {isInCart(course.id) ? '✓ In Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
