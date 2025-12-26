"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import type { MoodleCourse } from "@/types/moodle";

export default function Home() {
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/moodle?action=courses');
        const payload = await res.json();
        setCourses(payload.data || []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ['All', 'Basic', 'Advanced', 'Scalping', 'Options Trading', 'Intraday'];
  const popularCourses = courses.filter(c => c.isPopular);
  const featuredCourses = courses.filter(c => c.isFeatured);
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledusercount || 0), 0);

  const filteredCourses = activeCategory === 'All' 
    ? courses 
    : courses.filter(c => c.categoryName === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative">
        
        <main className="relative mx-auto max-w-7xl px-6 py-12">
          {/* Hero Section */}
          <header className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 bg-green-50 rounded-full px-6 py-2 text-sm border border-green-200">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <span className="text-green-600 font-semibold">Live Trading Sessions Available</span>
            </div>
            
            <h1 className="mb-6 text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Master <span className="text-orange-500">MCX Trading</span><br />
              <span className="text-gray-700">With India&apos;s Premier Academy</span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600">
              Join {totalStudents}+ traders learning from industry experts. Get live market analysis, proven strategies, and personal mentorship.
            </p>
          </header>

          {/* Category Filters */}
          <div className="mb-10 bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <h3 className="mb-4 text-sm font-bold text-gray-700 uppercase tracking-wide">Sub-category ({categories.length - 1})</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200">
                View All →
              </button>
            </div>
          </div>

          {/* Popular Courses Section */}
          {popularCourses.length > 0 && (
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Popular courses</h2>
                <button className="bg-white rounded-lg px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 border border-gray-200 transition-all">
                  See All →
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {popularCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      fullname={course.fullname}
                      summary={course.summary}
                      shortname={course.shortname}
                      enrolledusercount={course.enrolledusercount}
                      price={course.price}
                      originalPrice={course.originalPrice}
                      discountPercent={course.discountPercent}
                      courseType={course.courseType}
                      hasLimitedOffer={course.hasLimitedOffer}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Featured Courses Section */}
          {featuredCourses.length > 0 && (
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Featured courses</h2>
                <button className="bg-white rounded-lg px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 border border-gray-200 transition-all">
                  See All →
                </button>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    fullname={course.fullname}
                    summary={course.summary}
                    shortname={course.shortname}
                    enrolledusercount={course.enrolledusercount}
                    price={course.price}
                    originalPrice={course.originalPrice}
                    discountPercent={course.discountPercent}
                    courseType={course.courseType}
                    hasLimitedOffer={course.hasLimitedOffer}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Courses Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All courses</h2>
              <p className="mt-2 text-gray-600 text-sm">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                {activeCategory !== 'All' && ` in ${activeCategory}`}
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500"></div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    fullname={course.fullname}
                    summary={course.summary}
                    shortname={course.shortname}
                    enrolledusercount={course.enrolledusercount}
                    price={course.price}
                    originalPrice={course.originalPrice}
                    discountPercent={course.discountPercent}
                    courseType={course.courseType}
                    hasLimitedOffer={course.hasLimitedOffer}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-200">
                <div className="mb-4 text-6xl">📚</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">No courses found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </section>

          {/* Contact Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-md p-10 text-center border border-gray-100">
            <h3 className="mb-3 text-2xl font-bold text-gray-900">Have a query?</h3>
            <p className="mb-6 text-gray-600">Contact us and we will get back to you on your number</p>
            <button className="rounded-lg bg-orange-500 hover:bg-orange-600 px-8 py-3 text-base font-semibold text-white transition-all shadow-md">
              Contact Us
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
