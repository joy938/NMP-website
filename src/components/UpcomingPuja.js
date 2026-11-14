'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UpcomingPuja() {
  const ADMIN_PIN = '0000';

  // তোমার আসন্ন পূজার গুগল শিট লিংক
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1MfcYYDbAsRddIz5zszFvcT9EzIX-8QZ8KTs8doOyW1Q/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1MfcYYDbAsRddIz5zszFvcT9EzIX-8QZ8KTs8doOyW1Q/edit?usp=sharing';

  // ডিফল্ট ব্যাকআপ তথ্য
  const defaultInfo = {
    title: 'শ্রী শ্রী কার্তিক পূজা',
    dateText: '১৭ নভেম্বর, ২০২৬',
    targetDate: '2026-11-17T09:00:00',
    venue: 'নবীন মহাজন পাড়া পূজা প্রাঙ্গণ',
    notice: 'সকল পাড়াবাসী ও ভক্তবৃন্দকে সপরিবারে উপস্থিত থাকার জন্য বিনীত নিমন্ত্রণ জানানো হচ্ছে।',
  };

  const [info, setInfo] = useState(defaultInfo);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // গুগল শিট থেকে লাইভ তথ্য লোড
  useEffect(() => {
    const fetchUpcomingPuja = async () => {
      try {
        const response = await fetch(`${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
        const csvText = await response.text();

        const lines = csvText.trim().split(/\r?\n/);
        if (lines.length >= 2) {
          // ২য় লাইন (Row 2) থেকে তথ্য নেওয়া
          const cols = lines[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
            val.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
          );

          if (cols.length >= 4 && cols[0]) {
            const rawTargetDate = cols[2] || '2026-11-17';
            const formattedDate = rawTargetDate.includes('T') ? rawTargetDate : `${rawTargetDate}T09:00:00`;

            setInfo({
              title: cols[0],
              dateText: cols[1] || 'আসন্ন পূজা',
              targetDate: formattedDate,
              venue: cols[3] || 'নবীন মহাজন পাড়া পূজা প্রাঙ্গণ',
              notice: cols[4] || 'সকলের উপস্থিতি কামনা করছি।',
            });
          }
        }
      } catch (err) {
        console.error('গুগল শিট থেকে আসন্ন পূজার তথ্য লোড ব্যর্থ:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingPuja();
  }, []);

  // লাইভ কাউন্টডাউন হিসাব
  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(info.targetDate) - +new Date();
      if (difference > 0) {
        setIsFinished(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setIsFinished(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [info.targetDate]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('ভুল পিন কোড!');
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      
      {/* কার্ড কন্টেইনার */}
      <div className="bg-gradient-to-br from-amber-500/10 via-red-500/5 to-amber-500/10 border-2 border-amber-400 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* টপ ব্যাজ */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full shadow-sm ${
              isFinished 
                ? 'bg-amber-600 text-white' 
                : 'bg-red-700 text-yellow-200'
            }`}>
              {isFinished ? '✨ পূজা সমাপন' : '✨ আসন্ন মহাপূজা'}
            </span>
            <span className="bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ শিট
            </span>
          </div>

          {/* অ্যাডমিন কন্ট্রোল */}
          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a
                  href={GOOGLE_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে পরবর্তী পূজা সেট করুন
                </a>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-full"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-amber-800 hover:text-amber-950 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-full font-semibold transition"
              >
                🔒 এডিট
              </button>
            )}
          </div>
        </div>

        {/* সাধারণ ভিউ */}
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-black text-red-800 tracking-tight">
            {info.title}
          </h2>
          <div className="text-amber-800 font-bold text-base md:text-lg mt-2 flex flex-wrap justify-center items-center gap-3">
            <span>📅 {info.dateText}</span>
            <span>•</span>
            <span>📍 {info.venue}</span>
          </div>
          <p className="text-gray-600 text-xs md:text-sm mt-3 max-w-lg mx-auto italic">
            "{info.notice}"
          </p>

          {/* সময় শেষ হলে উৎসবের শুভেচ্ছা বার্তা, নয়তো লাইভ টাইমার */}
          {isFinished ? (
            <div className="bg-amber-100/80 border border-amber-300 rounded-2xl p-5 max-w-lg mx-auto my-6 text-center shadow-inner">
              <span className="text-3xl block mb-1">🎉</span>
              <h3 className="font-bold text-red-800 text-base md:text-lg">
                {info.title} সফলভাবে সম্পন্ন হয়েছে!
              </h3>
              <p className="text-xs md:text-sm text-amber-900 mt-1 font-medium">
                সকল পাড়াবাসী ও ভক্তবৃন্দকে জানাই আন্তরিক প্রীতি ও শুভেচ্ছা। পরবর্তী পূজার দিনক্ষণ ও সময়সূচী শীঘ্রই জানানো হবে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto my-7">
              <div className="bg-white/90 border border-amber-200 rounded-2xl p-2.5 md:p-3 shadow-md">
                <span className="text-2xl md:text-4xl font-black text-red-700 block">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">দিন</span>
              </div>
              <div className="bg-white/90 border border-amber-200 rounded-2xl p-2.5 md:p-3 shadow-md">
                <span className="text-2xl md:text-4xl font-black text-red-700 block">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">ঘণ্টা</span>
              </div>
              <div className="bg-white/90 border border-amber-200 rounded-2xl p-2.5 md:p-3 shadow-md">
                <span className="text-2xl md:text-4xl font-black text-red-700 block">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">মিনিট</span>
              </div>
              <div className="bg-white/90 border border-amber-200 rounded-2xl p-2.5 md:p-3 shadow-md">
                <span className="text-2xl md:text-4xl font-black text-amber-600 block">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">সেকেন্ড</span>
              </div>
            </div>
          )}

          {/* শর্টকাট বোতামসমূহ */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link
              href="/schedule"
              className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>📅</span> পূজার সম্পূর্ণ নির্ঘণ্ট দেখুন
            </Link>
            <Link
              href="/pronami"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>💳</span> প্রণামীর খাতা দেখুন
            </Link>
          </div>
        </div>

      </div>

      {/* অ্যাডমিন পিন মডাল */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">অ্যাডমিন প্রবেশ</h3>
            <p className="text-xs text-gray-500 mb-4">গুগল শিট খুলতে ৪ ডিজিটের পিন লিখুন।</p>
            
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                placeholder="••••"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-center tracking-widest text-2xl font-bold outline-none focus:border-red-600 mb-2"
                autoFocus
              />
              {pinError && <p className="text-xs text-red-600 mb-3">{pinError}</p>}
              
              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinError(''); setPinInput(''); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg"
                >
                  প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}