'use client';

import { useEffect, useRef } from 'react';

interface ZoomMeetingEmbedProps {
  meetingId: string;
  meetingUrl: string;
  userName: string;
  userEmail: string;
  signature?: string;
  onMeetingStart?: () => void;
  onMeetingEnd?: () => void;
}

/**
 * Zoom Meeting Embed Component
 * Can be used to embed Zoom Web SDK in the page or redirect to join URL
 */
export default function ZoomMeetingEmbed({
  meetingId,
  meetingUrl,
  userName,
  userEmail,
  signature,
  onMeetingStart,
  onMeetingEnd
}: ZoomMeetingEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // For now, we'll use a button to open Zoom in a new window
  // In production, you can use the Zoom Web SDK for embedding
  const handleJoinMeeting = () => {
    window.open(meetingUrl, '_blank', 'width=1200,height=800');
    if (onMeetingStart) {
      onMeetingStart();
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <svg className="w-20 h-20 text-indigo-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Join?</h3>
        <p className="text-gray-600 mb-6 max-w-sm">
          Click the button below to join the Zoom meeting. Your browser will open the Zoom client.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleJoinMeeting}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14 0H4v8h12V6z" />
            </svg>
            Join Zoom Meeting
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 110 6a5.972 5.972 0 011.742-.29A6 6 0 0113.477 14.89z" clipRule="evenodd" />
            </svg>
            Meeting ID: {meetingId}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">Alternative: Open manually</p>
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline"
          >
            {meetingUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
