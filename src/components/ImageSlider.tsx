'use client';

import { useState, useEffect } from 'react';

interface ImageSliderProps {
  images?: string[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Default images if none provided - use stored images from public folder
  const defaultImages = [
    '/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail.png',
    '/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail (320 x 190 px).png',
    '/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail(1).png',
  ];

  const displayImages = images && images.length > 0 ? images : defaultImages;

  // Auto-advance carousel every 5-7 seconds (random interval between 5000-7000ms)
  useEffect(() => {
    const interval = Math.floor(Math.random() * 2000) + 5000; // 5000-7000ms
    
    const timer = setInterval(() => {
      setFadeIn(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        setFadeIn(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [displayImages.length]);

  const goToSlide = (index: number) => {
    setFadeIn(false);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setFadeIn(true);
    }, 300);
  };

  return (
    <section className="relative overflow-hidden py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Slider Container - Professional Look */}
        <div className="relative w-full">
          {/* Slider */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black">
            {/* Inner container for image */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
              {/* Image with fade transition */}
              <div
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <img
                  src={displayImages[currentIndex]}
                  alt={`Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
                    const elem = e.currentTarget as HTMLImageElement;
                    const colors = ['from-blue-600 via-indigo-600 to-purple-600', 'from-indigo-600 via-purple-600 to-pink-600', 'from-purple-600 via-pink-600 to-orange-600'];
                    elem.style.display = 'none';
                    const parent = elem.parentElement;
                    if (parent) {
                      parent.className = `absolute inset-0 bg-gradient-to-br ${colors[currentIndex % colors.length]}`;
                    }
                  }}
                />
              </div>

              {/* Slide Counter - Minimal Design */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-white text-xs font-semibold border border-white/20">
                {currentIndex + 1}/{displayImages.length}
              </div>
            </div>
          </div>

          {/* Info Section Below Slider */}
          <div className="bg-white rounded-b-xl shadow-lg px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {['Master Trading Fundamentals', 'Learn from Expert Traders', 'Start Your Trading Journey'][currentIndex]}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm max-w-2xl">
                  {['Discover comprehensive courses on share market, options, and commodity trading with step-by-step guidance.', 'Gain insights from experienced traders with proven strategies and real market expertise.', 'Join thousands of successful traders who have transformed their careers with our proven methodology.'][currentIndex]}
                </p>
              </div>
              <div className="hidden md:block ml-4">
                <div className="flex gap-2">
                  {displayImages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        index === currentIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Cards Section Below Slider */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Featured Learning Videos</h3>
          <p className="text-gray-600 mb-8">Explore our most popular trading tutorials and market insights</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Video Card 1 */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-40 bg-gradient-to-br from-blue-600 to-indigo-600 overflow-hidden">
                <img 
                  src="/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail.png" 
                  alt="NIFTY Trading Basics"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300">
                  <svg className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs font-semibold">
                  12:45
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">NIFTY Trading Basics for Beginners</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">Learn the fundamentals of NIFTY index trading</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">Beginner</span>
                  <span className="text-xs text-gray-500">5.2K views</span>
                </div>
              </div>
            </div>

            {/* Video Card 2 */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-40 bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden">
                <img 
                  src="/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail (320 x 190 px).png" 
                  alt="MCX Gold Trading"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300">
                  <svg className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs font-semibold">
                  18:30
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">MCX Gold Trading Strategy</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">Advanced strategies for commodity trading</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">Intermediate</span>
                  <span className="text-xs text-gray-500">8.7K views</span>
                </div>
              </div>
            </div>

            {/* Video Card 3 */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-40 bg-gradient-to-br from-indigo-600 to-blue-600 overflow-hidden">
                <img 
                  src="/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail(1).png" 
                  alt="Options Trading"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300">
                  <svg className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs font-semibold">
                  22:15
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">Options Chain Strategy Breakdown</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">Master option chain analysis and strategies</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">Advanced</span>
                  <span className="text-xs text-gray-500">12.3K views</span>
                </div>
              </div>
            </div>

            {/* Video Card 4 */}
            <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-40 bg-gradient-to-br from-pink-600 to-purple-600 overflow-hidden">
                <img 
                  src="/Green and Red Bold Modern Stock Market Tutorial YouTube Thumbnail.png" 
                  alt="Intraday Trading"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300">
                  <svg className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded text-white text-xs font-semibold">
                  15:42
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">Intraday Price Action Trading</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">Real-time price action trading techniques</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">Intermediate</span>
                  <span className="text-xs text-gray-500">9.1K views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
