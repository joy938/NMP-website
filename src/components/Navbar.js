'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-red-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16 relative">
        
        {/* মোবাইলের স্পেস */}
        <div className="w-8 md:hidden"></div>

        {/* মাঝখানে পাড়ার নাম */}
        <Link href="/" className="font-bold text-lg md:text-2xl tracking-wide md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0">
          নবীন মহাজন পাড়া
        </Link>

        {/* ল্যাপটপ মেনু */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-yellow-300">হোম</Link>
          <Link href="/schedule" className="hover:text-yellow-300">পূজার সময়সূচী</Link>
          <Link href="/sangha" className="hover:text-yellow-300">সংঘের বিবরণ</Link>
          <Link href="/pronami" className="hover:text-yellow-300">পূজার প্রণামী</Link>
          <Link href="/smaranika" className="hover:text-yellow-300 flex items-center gap-1">
            <span>🪔</span> স্মরণিকা
          </Link>
        </div>

        {/* মোবাইল বাটন */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-2xl">
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* মোবাইল ড্রপডাউন মেনু */}
      {isOpen && (
        <div className="md:hidden bg-red-800 px-4 pt-2 pb-4 space-y-2 text-center text-sm">
          <Link href="/" onClick={() => setIsOpen(false)} className="block py-1 hover:text-yellow-300">হোম</Link>
          <Link href="/schedule" onClick={() => setIsOpen(false)} className="block py-1 hover:text-yellow-300">পূজার সময়সূচী</Link>
          <Link href="/sangha" onClick={() => setIsOpen(false)} className="block py-1 hover:text-yellow-300">সংঘের বিবরণ</Link>
          <Link href="/pronami" onClick={() => setIsOpen(false)} className="block py-1 hover:text-yellow-300">পূজার প্রণামী</Link>
          <Link href="/smaranika" onClick={() => setIsOpen(false)} className="block py-1 text-yellow-200 hover:text-yellow-300 font-bold">🪔 স্মরণিকা</Link>
        </div>
      )}
    </nav>
  );
}