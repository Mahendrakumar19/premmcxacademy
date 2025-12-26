'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <Navbar />
      <main className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-8 text-9xl font-bold text-zinc-200">404</div>
          <h1 className="mb-4 text-4xl font-bold text-zinc-900">
            Page Not Found
          </h1>
          <p className="mb-8 text-lg text-zinc-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700"
            >
              Go Home
            </Link>
            <Link
              href="/courses"
              className="rounded-full border border-zinc-300 bg-white/80 px-6 py-3 font-medium text-zinc-900 transition-all hover:bg-zinc-100"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
