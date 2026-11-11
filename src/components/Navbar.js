'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // নেভবারে 'পূজার খরচ' সহ পূর্ণাঙ্গ মেনু তালিকা
  const navLinks = [
    { name: 'হোম', href: '/' },
    { name: 'পূজার সময়সূচী', href: '/schedule' },
    { name: 'সংঘের বিবরণ', href: '/sangha' },
    { name: 'পূজার প্রণামী', href: '/pronami' },
    { name: 'পূজার খরচ', href: '/expenses' },
    { name: 'গ্যালারি', href: '/gallery' },
    { name: 'স্মরণিকা', href: '/smaranika' },
  ];

  return (
    <nav className="bg-red-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16 relative">
        
        {/* মোবাইলের স্পেস */}
        <div className="w-8 md:hidden"></div>

        {/* মাঝখানে পাড়ার নাম */}
        <Link 
          href="/" 
          className="font-bold text-lg md:text-2xl tracking-wide md:static absolute left-1/2 -translate-x-1/2 md:translate-x-0 hover:text-yellow-200 transition"
        >
          নবীন মহাজন পাড়া
        </Link>

        {/* ল্যাপটপ/ডেস্কটপ মেনু (অ্যাক্টিভ পেজ হাইলাইট ও হোভার সহ) */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 rounded-lg transition duration-200 ${
                  isActive
                    ? 'text-yellow-300 font-bold bg-red-800/90 border-b-2 border-yellow-300 shadow-inner'
                    : 'text-white/90 hover:text-yellow-300 hover:bg-red-800/40 font-medium'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* মোবাইল মেনু বাটন */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-2xl focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* মোবাইল ড্রপডাউন মেনু */}
      {isOpen && (
        <div className="md:hidden bg-red-800 px-4 pt-2 pb-4 space-y-1.5 text-center text-sm shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 px-3 rounded-lg transition ${
                  isActive
                    ? 'bg-red-900 text-yellow-300 font-bold border-l-4 border-yellow-400'
                    : 'text-white hover:text-yellow-300 hover:bg-red-700/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}