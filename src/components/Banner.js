'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const UPCOMING_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1MfcYYDbAsRddIz5zszFvcT9EzIX-8QZ8KTs8doOyW1Q/gviz/tq?tqx=out:csv';

const getTimeGreeting = (date) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return '☀️ সুপ্রভাত';
  if (hour >= 12 && hour < 16) return '🙏 শুভ মধ্যাহ্ন';
  if (hour >= 16 && hour < 19) return '🌤️ শুভ অপরাহ্ণ';
  if (hour >= 19 && hour < 22) return '🪔 শুভ সন্ধ্যা';
  return '🌙 শুভরাত্রি';
};

const getBanglaAndEnglishDate = (date) => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (num) => String(num).replace(/\d/g, (d) => banglaDigits[d]);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const isAfterPohelaBoishakh = month > 4 || (month === 4 && day >= 14);
  const bnYear = isAfterPohelaBoishakh ? year - 593 : year - 594;

  const boishakhStart = new Date(isAfterPohelaBoishakh ? year : year - 1, 3, 14);
  const current = new Date(year, month - 1, day);
  const diffDays = Math.floor((current - boishakhStart) / (1000 * 60 * 60 * 24));

  const falgunGregorianYear = isAfterPohelaBoishakh ? year + 1 : year;
  const isLeap =
    (falgunGregorianYear % 4 === 0 && falgunGregorianYear % 100 !== 0) ||
    falgunGregorianYear % 400 === 0;

  const bnMonths = [
    { name: 'বৈশাখ', days: 31 },
    { name: 'জ্যৈষ্ঠ', days: 31 },
    { name: 'আষাঢ়', days: 31 },
    { name: 'শ্রাবণ', days: 31 },
    { name: 'ভাদ্র', days: 31 },
    { name: 'আশ্বিন', days: 31 },
    { name: 'কার্তিক', days: 30 },
    { name: 'অগ্রহায়ণ', days: 30 },
    { name: 'পৌষ', days: 30 },
    { name: 'মাঘ', days: 30 },
    { name: 'ফাল্গুন', days: isLeap ? 30 : 29 },
    { name: 'চৈত্র', days: 30 },
  ];

  let remaining = diffDays;
  let bnMonthName = 'বৈশাখ';
  let bnDay = 1;

  for (const m of bnMonths) {
    if (remaining < m.days) {
      bnMonthName = m.name;
      bnDay = remaining + 1;
      break;
    }
    remaining -= m.days;
  }

  const engMonthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ];

  return `${toBn(bnDay)} ${bnMonthName}, ${toBn(bnYear)} • ${toBn(day)} ${engMonthsBn[month - 1]}, ${toBn(year)}`;
};

export default function Banner() {
  const [todayText, setTodayText] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [specialNotice, setSpecialNotice] = useState('');

  useEffect(() => {
    const now = new Date();
    setTodayText(getBanglaAndEnglishDate(now));
    setGreetingText(getTimeGreeting(now));

    const fetchNotice = async () => {
      try {
        const res = await fetch(`${UPCOMING_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const text = await res.text();
        const lines = text.trim().split(/\r?\n/);
        if (lines.length >= 2) {
          const cols = lines[1]
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          if (cols[5]) {
            setSpecialNotice(cols[5]);
          }
        }
      } catch (err) {
        console.error('বিশেষ ঘোষণা লোড হয়নি:', err);
      }
    };

    fetchNotice();
  }, []);

  return (
    <>
      {specialNotice && (
        <div className="bg-amber-300 text-red-950 border-b border-amber-400 py-1.5 overflow-hidden shadow-xs">
          <div className="whitespace-nowrap inline-block font-bold text-xs sm:text-sm animate-notice-scroll">
            📢 {specialNotice}
          </div>
        </div>
      )}

      <div id="home" className="bg-gradient-to-b from-red-600 to-amber-600 text-white py-14 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          {todayText && (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              {greetingText && (
                <span className="inline-flex items-center gap-1 bg-amber-300 border border-amber-200 text-red-950 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {greetingText}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white/95 border border-amber-200 text-red-700 text-xs font-bold px-3.5 py-1 rounded-full shadow-sm">
                📅 {todayText}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            নবীন মহাজন পাড়া
          </h1>
          <p className="text-base md:text-lg text-amber-100 max-w-xl mx-auto mb-8">
            ঐক্য, ঐতিহ্য ও ভ্রাতৃত্বের মেলবন্ধন — আমাদের সকল পূজা ও সামাজিক আয়োজনের তথ্য একসাথে।
          </p>

          {/* ব্যানারেই থাকা ৩টি অপশন কার্ড */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-left">
            
            {/* অপশন ১: নবজাগরণ একতা সংঘ (লোগো সহ) */}
            <Link 
              href="/sangha" 
              className="bg-white text-gray-800 p-5 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 active:scale-95 transition-all duration-300 border-t-4 border-red-600 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-md">সংগঠন</span>
                  <img 
                    src="/logo.png" 
                    alt="নবজাগরণ একতা সংঘ লোগো" 
                    className="w-10 h-10 rounded-full object-contain border border-red-100 shadow-2xs" 
                  />
                </div>
                <h3 className="text-lg font-bold text-red-700 mt-2 group-hover:text-red-800 transition">
                  নবজাগরণ একতা সংঘ
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  আমাদের পাড়ার সংগঠন — যার মাধ্যমে সকল পূজা ও অনুষ্ঠান পরিচালিত হয়।
                </p>
              </div>
              <div className="mt-4 text-red-600 font-bold text-xs flex items-center group-hover:translate-x-1 transition duration-200">
                বিস্তারিত দেখুন →
              </div>
            </Link>

            {/* অপশন ২: পূজার প্রণামী */}
            <Link 
              href="/pronami" 
              className="bg-white text-gray-800 p-5 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 active:scale-95 transition-all duration-300 border-t-4 border-amber-500 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">আদায় / চাঁদা</span>
                <h3 className="text-lg font-bold text-amber-700 mt-2.5 group-hover:text-amber-800 transition">
                  পূজার প্রণামী
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  কে কোন পূজায় কত টাকা দিল এবং বকেয়ার স্বচ্ছ ও নির্ভুল তালিকা।
                </p>
              </div>
              <div className="mt-4 text-amber-600 font-bold text-xs flex items-center group-hover:translate-x-1 transition duration-200">
                প্রণামীর হিসাব দেখুন →
              </div>
            </Link>

            {/* অপশন ৩: পূজার খরচের বিস্তারিত */}
            <Link 
              href="/expenses" 
              className="bg-white text-gray-800 p-5 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 active:scale-95 transition-all duration-300 border-t-4 border-purple-600 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-md">ব্যয়-বিবরণ</span>
                <h3 className="text-lg font-bold text-purple-700 mt-2.5 group-hover:text-purple-800 transition">
                  পূজার খরচের বিস্তারিত
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  প্রতিমা, ডেকোরেশন, প্রসাদ ও বিবিধ খাতে মোট কত খরচ হলো তার হিসাব।
                </p>
              </div>
              <div className="mt-4 text-purple-600 font-bold text-xs flex items-center group-hover:translate-x-1 transition duration-200">
                খরচের হিসাব দেখুন →
              </div>
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}