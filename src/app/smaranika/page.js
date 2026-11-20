'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Loader from '@/components/Loader';

// গুগল ড্রাইভ লিংককে স্বয়ংক্রিয়ভাবে সরাসরি ছবিতে রূপান্তর করার ফাংশন
const formatImageUrl = (url) => {
  if (!url) return '';
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    // গুগলের অফিশিয়াল হাই-রেজোলিউশন ইমেজ লিংক
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url;
};

// বাংলা সংখ্যাকে ইংরেজিতে রূপান্তর
const toEnglishDigits = (str) => {
  const bn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return String(str).replace(/[০-৯]/g, (d) => bn[d]);
};

// প্রয়াণের তারিখ আজকের তারিখের সাথে মিলছে কি না তা যাচাই
const isTodayAnniversary = (dateStr, today) => {
  if (!dateStr || !today) return false;

  const clean = toEnglishDigits(dateStr).normalize('NFC').toLowerCase();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();

  const monthGroups = [
    ['জানুয়ারি', 'জানুয়ারি', 'january', 'jan'],
    ['ফেব্রুয়ারি', 'ফেব্রুয়ারি', 'february', 'feb'],
    ['মার্চ', 'march', 'mar'],
    ['এপ্রিল', 'april', 'apr'],
    ['মে', 'may'],
    ['জুন', 'june', 'jun'],
    ['জুলাই', 'july', 'jul'],
    ['আগস্ট', 'august', 'aug'],
    ['সেপ্টেম্বর', 'september', 'sep'],
    ['অক্টোবর', 'october', 'oct'],
    ['নভেম্বর', 'november', 'nov'],
    ['ডিসেম্বর', 'december', 'dec'],
  ];

  let matchedMonth = -1;
  for (let i = 0; i < monthGroups.length; i++) {
    if (monthGroups[i].some((m) => clean.includes(m.normalize('NFC')))) {
      matchedMonth = i;
      break;
    }
  }

  if (matchedMonth !== -1) {
    const nums = clean.match(/\b\d{1,2}\b/g);
    if (nums && nums.length > 0) {
      const day = parseInt(nums[0], 10);
      return day === todayDay && matchedMonth === todayMonth;
    }
  }

  const slashMatch = clean.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    return day === todayDay && month === todayMonth;
  }

  return false;
};

// প্রয়াণের কত বছর হলো তা অটোমেটিক হিসাব
const getYearsAgoLabel = (yearStr, dateStr, today) => {
  if (!today) return '';
  const rawYear = toEnglishDigits(yearStr || dateStr).match(/\b(19\d{2}|20\d{2})\b/)?.[0];
  if (!rawYear) return '';
  const deathYear = parseInt(rawYear, 10);
  const diff = today.getFullYear() - deathYear;
  if (diff <= 0) return '';

  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n) => String(n).replace(/\d/g, (d) => bnDigits[d]);
  return `${toBn(diff)} বছর আগে`;
};

export default function SmaranikaPage() {
  const ADMIN_PIN = '0000';

  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/195i0GHHAcqHF4-ozdwHWMD9JFXad5XdZZUbHmzadeOM/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/195i0GHHAcqHF4-ozdwHWMD9JFXad5XdZZUbHmzadeOM/edit?usp=sharing';

  const [selectedYear, setSelectedYear] = useState('সব');
  const [searchQuery, setSearchQuery] = useState('');

  const [litDiyas, setLitDiyas] = useState({});
  const [today, setToday] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [souls, setSouls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchSmaranikaData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
      const csvText = await response.text();

      const lines = csvText.trim().split(/\r?\n/);
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
          val.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );

        if (cols.length >= 2 && cols[0]) {
          parsed.push({
            id: i,
            name: cols[0],
            date: cols[1] || 'তারিখ জানা নেই',
            year: cols[2] ? cols[2].trim() : '',
            photoUrl: formatImageUrl(cols[3] || ''), // গুগল ড্রাইভ লিংক ঠিক করা হলো
          });
        }
      }

      setSouls(parsed);
    } catch (error) {
      console.error('স্মরণিকা লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setToday(new Date());
    fetchSmaranikaData();

    const savedDiyas = localStorage.getItem('lit_diyas_status');
    if (savedDiyas) {
      try {
        setLitDiyas(JSON.parse(savedDiyas));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLightDiya = (id) => {
    const updated = { ...litDiyas, [id]: true };
    setLitDiyas(updated);
    localStorage.setItem('lit_diyas_status', JSON.stringify(updated));
  };

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

  const availableYears = Array.from(new Set(souls.map((s) => s.year).filter(Boolean))).sort(
    (a, b) => b - a
  );

  const filteredSouls = souls.filter((s) => {
    const matchesYear = selectedYear === 'সব' || s.year === selectedYear;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      s.date.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesYear && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-stone-50 text-gray-800">
      <Navbar />

      <div className="max-w-5xl mx-auto py-8 px-4">
        
        {/* টপ বার */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-amber-800 hover:text-amber-950 font-medium text-sm">
            ← হোমে ফিরে যান
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a
                  href={GOOGLE_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-amber-800 hover:bg-amber-900 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে নাম এডিট করুন
                </a>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-full"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-amber-900 hover:text-amber-950 bg-amber-100/70 border border-amber-300 px-3 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchSmaranikaData}
              disabled={isLoading}
              title="নতুন তথ্য লোড করতে ক্লিক করুন"
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-b from-stone-800 to-stone-900 text-white p-7 md:p-10 rounded-3xl shadow-xl mb-8 text-center border-t-4 border-amber-500 relative overflow-hidden">
          <span className="text-3xl block mb-2">🪔</span>
          <h1 className="text-3xl md:text-5xl font-black text-amber-100 tracking-wide">
            স্মরণিকা
          </h1>
          <p className="text-amber-200/90 text-sm md:text-base mt-2 font-medium">
            স্মৃতিপটে অম্লান — যাঁদের স্নেহ, আদর্শ ও স্মৃতি আমাদের হৃদয়ে চিরভাস্বর
          </p>
          <div className="mt-4 pt-3 border-t border-stone-700/60 max-w-lg mx-auto">
            <p className="text-stone-300 text-xs italic">
              "ওঁ দিব্যান্ লোকান্ স গচ্ছতু — পরলোকগত সকল পূণ্য আত্মার চিরশান্তি কামনা করি।"
            </p>
          </div>
        </div>

        {/* ফিল্টার ও সার্চ বার */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            
            {/* বছর নির্বাচন */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-stone-600 mr-1 shrink-0">সাল:</span>
              <button
                onClick={() => setSelectedYear('সব')}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  selectedYear === 'সব'
                    ? 'bg-stone-800 text-amber-200 shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                সব বছর
              </button>
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                    selectedYear === y
                      ? 'bg-stone-800 text-amber-200 shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* সার্চ বক্স */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs border border-stone-300 rounded-xl outline-none focus:border-amber-600 bg-stone-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>
        </div>

        {/* স্মরণিকা কার্ড গ্রিড */}
        {isLoading ? (
          <div className="py-16 text-center text-stone-500 text-sm flex flex-col items-center gap-2">
            <Loader />
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-600 text-sm">
            গুগল শিট লোড করতে সমস্যা হয়েছে। শিটটির শেয়ারিং পারমিশন 'Anyone with the link' আছে কি না চেক করুন।
          </div>
        ) : filteredSouls.length === 0 ? (
          <div className="bg-white p-12 text-center text-stone-400 rounded-2xl border border-stone-200 text-sm">
            {searchQuery
              ? `"${searchQuery}" নামে কাউকে পাওয়া যায়নি।`
              : `এই বছরে কোনো রেকর্ড যুক্ত নেই। গুগল শিটে নাম লিখলে এখানে চলে আসবে।`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredSouls.map((soul) => {
              const isLit = litDiyas[soul.id] || false;
              const isAnniversary = isTodayAnniversary(soul.date, today);
              const yearsAgo = getYearsAgoLabel(soul.year, soul.date, today);

              return (
                <div
                  key={soul.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between text-center relative overflow-hidden group ${
                    isAnniversary
                      ? 'border-amber-400 ring-2 ring-amber-300/70'
                      : 'border-amber-200/70'
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400"></div>

                  <div>
                    {/* আজ প্রয়াণ বার্ষিকী হলে বিশেষ ব্যাজ */}
                    {isAnniversary && (
                      <div className="mb-2.5 flex justify-center">
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                          🕯️ আজ পুণ্য স্মরণ দিবস
                        </span>
                      </div>
                    )}

                    {/* ছবি অথবা প্রদীপের ফ্রেম (গুগল ড্রাইভ লিংক দিলে ছবি দেখাবে) */}
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-amber-400 p-1 flex items-center justify-center bg-stone-50 shadow-inner overflow-hidden relative">
                      {soul.photoUrl ? (
                        <img
                          src={soul.photoUrl}
                          alt={soul.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement.innerHTML = '<span class="text-3xl">🪔</span>';
                          }}
                        />
                      ) : (
                        <span className="text-3xl">🪔</span>
                      )}
                    </div>

                    {/* নাম */}
                    <h3 className="font-bold text-base md:text-lg text-stone-900 tracking-tight">
                      {soul.name}
                    </h3>

                    {/* প্রয়াণের তারিখ ও কত বছর আগে */}
                    <p className="text-xs text-stone-600 mt-1 font-medium">
                      প্রয়াণ: <span className="text-stone-800 font-semibold">{soul.date}</span>
                      {yearsAgo && (
                        <span className="text-amber-700 font-semibold"> • {yearsAgo}</span>
                      )}
                    </p>
                  </div>

                  {/* প্রদীপ প্রজ্বলন বোতাম */}
                  <div className="mt-5 pt-3 border-t border-stone-100 flex flex-col items-center">
                    <button
                      onClick={() => handleLightDiya(soul.id)}
                      className={`text-xs px-4 py-2 rounded-full font-bold transition flex items-center gap-2 shadow-2xs ${
                        isLit
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-100 hover:bg-amber-50 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <span className={`text-base ${isLit ? 'animate-pulse' : ''}`}>🪔</span>
                      <span>{isLit ? 'প্রদীপ প্রজ্বলিত • শ্রদ্ধা নিবেদিত' : 'প্রদীপ প্রজ্বলন করুন'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                className="w-full p-2.5 border border-gray-300 rounded-lg text-center tracking-widest text-2xl font-bold outline-none focus:border-amber-600 mb-2"
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
                  className="px-4 py-2 text-sm bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-lg"
                >
                  প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}