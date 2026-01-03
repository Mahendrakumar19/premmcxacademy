'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface LiveClass {
  id: string;
  title: string;
  topic: string;
  instructor: string;
  instructorImage?: string;
  startTime: string;
  endTime: string;
  zoomMeetingUrl: string;
  zoomMeetingId: string;
  status: 'upcoming' | 'live' | 'completed';
  description: string;
  maxParticipants?: number;
  currentParticipants?: number;
  courseId?: number;
  recordingUrl?: string;
}

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchLiveClasses();
    }
  }, [status, router]);

  const fetchLiveClasses = async () => {
    try {
      const res = await fetch('/api/live-classes', {
        headers: {
          'Authorization': `Bearer ${session?.user?.id}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch live classes');

      const data = await res.json();
      setLiveClasses(Array.isArray(data) ? data : data.classes || []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      // Set some demo data for development
      setLiveClasses(getDemoClasses());
    } finally {
      setLoading(false);
    }
  };

  const getDemoClasses = (): LiveClass[] => {
    const now = new Date();
    const upcoming = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const completed = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const live = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    return [
      {
        id: '1',
        title: 'Crude Oil Trading Fundamentals',
        topic: 'Understanding crude oil price movements and technical analysis',
        instructor: 'Raj Kumar',
        instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raj',
        startTime: upcoming.toISOString(),
        endTime: new Date(upcoming.getTime() + 90 * 60 * 1000).toISOString(),
        zoomMeetingUrl: 'https://zoom.us/j/123456789',
        zoomMeetingId: '123456789',
        status: 'upcoming',
        description: 'Learn advanced techniques for trading crude oil with live market analysis and real-time trading examples.',
        maxParticipants: 200,
        currentParticipants: 142,
        courseId: 1
      },
      {
        id: '2',
        title: 'Natural Gas Price Action Strategy',
        topic: 'Price action trading in natural gas futures',
        instructor: 'Priya Sharma',
        instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        startTime: live.toISOString(),
        endTime: new Date(live.getTime() + 120 * 60 * 1000).toISOString(),
        zoomMeetingUrl: 'https://zoom.us/j/987654321',
        zoomMeetingId: '987654321',
        status: 'live',
        description: 'Join us for a live trading session where we analyze natural gas price movements and execute trades in real-time.',
        maxParticipants: 150,
        currentParticipants: 128,
        courseId: 2
      },
      {
        id: '3',
        title: 'Gold Trading Masterclass',
        topic: 'Advanced gold trading strategies',
        instructor: 'Amit Patel',
        instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
        startTime: completed.toISOString(),
        endTime: new Date(completed.getTime() + 120 * 60 * 1000).toISOString(),
        zoomMeetingUrl: 'https://zoom.us/j/456789123',
        zoomMeetingId: '456789123',
        status: 'completed',
        description: 'Learn professional strategies for trading gold and managing risk in commodity markets.',
        maxParticipants: 100,
        currentParticipants: 87,
        recordingUrl: 'https://example.com/recordings/gold-trading-masterclass'
      },
      {
        id: '4',
        title: 'Silver Trading Tactics',
        topic: 'Intraday silver trading techniques',
        instructor: 'Neha Singh',
        instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
        startTime: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() + 6.5 * 60 * 60 * 1000).toISOString(),
        zoomMeetingUrl: 'https://zoom.us/j/789123456',
        zoomMeetingId: '789123456',
        status: 'upcoming',
        description: 'Discover intraday trading techniques specifically designed for silver futures trading with real-time examples.',
        maxParticipants: 180,
        currentParticipants: 156,
        courseId: 4
      }
    ];
  };

  const filteredClasses = liveClasses.filter(
    cls => filter === 'all' || cls.status === filter
  );

  const handleJoinClass = (liveClass: LiveClass) => {
    if (liveClass.status === 'completed' && liveClass.recordingUrl) {
      window.open(liveClass.recordingUrl, '_blank');
    } else if (liveClass.zoomMeetingUrl) {
      window.open(liveClass.zoomMeetingUrl, '_blank');
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <span className="text-white font-semibold">LIVE CLASSES</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Interactive Zoom Classes</h1>
            <p className="text-xl text-blue-100">
              Join live trading sessions with expert instructors and learn real-time trading strategies
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {(['all', 'upcoming', 'live', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  filter === status
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Classes Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No {filter} classes found</h3>
              <p className="text-gray-600">Check back later for new live classes</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((liveClass) => (
                <div
                  key={liveClass.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
                >
                  {/* Header with Status */}
                  <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{liveClass.title}</h3>
                        <p className="text-blue-100 text-sm">{liveClass.topic}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(liveClass.status)} text-xs font-bold`}>
                      {liveClass.status === 'live' && (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          LIVE NOW
                        </>
                      )}
                      {liveClass.status === 'upcoming' && 'UPCOMING'}
                      {liveClass.status === 'completed' && 'COMPLETED'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Instructor Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {liveClass.instructorImage && (
                        <img
                          src={liveClass.instructorImage}
                          alt={liveClass.instructor}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Instructor</p>
                        <p className="text-xs text-gray-600">{liveClass.instructor}</p>
                      </div>
                    </div>

                    {/* Time and Participants */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600 border-t border-b border-gray-100 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{formatTime(liveClass.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v-1h8v1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1h-2v1a1 1 0 001 1h2a1 1 0 001-1v-1h-2z" />
                        </svg>
                        <span>
                          {liveClass.currentParticipants || 0} / {liveClass.maxParticipants || '∞'} joined
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{liveClass.description}</p>

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoinClass(liveClass)}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        liveClass.status === 'live'
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                          : liveClass.status === 'upcoming'
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {liveClass.status === 'live' && 'Join Now'}
                      {liveClass.status === 'upcoming' && 'Register & Set Reminder'}
                      {liveClass.status === 'completed' && liveClass.recordingUrl ? 'Watch Recording' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Live Classes Work</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📅',
                title: 'Register in Advance',
                description: 'Sign up for upcoming classes and receive email reminders before the session starts.'
              },
              {
                icon: '🎥',
                title: 'Join via Zoom',
                description: 'Click the join button to automatically connect to the Zoom meeting with one click.'
              },
              {
                icon: '💾',
                title: 'Access Recordings',
                description: 'All classes are recorded. Access past sessions anytime to review and learn at your pace.'
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
