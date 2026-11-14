'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// বাংলা সংখ্যা (৫০০) বা কমা (1,000) থাকলে স্বয়ংক্রিয়ভাবে ইংরেজি সংখ্যায় রূপান্তর
const toNumber = (str) => {
  if (!str) return 0;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const en = String(str)
    .replace(/[০-৯]/g, (d) => bn.indexOf(d))
    .replace(/,/g, '')
    .trim();
  return Number(en) || 0;
};

export default function PronamiPage() {
  const ADMIN_PIN = '0000';
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1JRNTuGcVo940s1-qNtI4lWwS8VzZ3XxpNtzPF1IBX2A/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1JRNTuGcVo940s1-qNtI4lWwS8VzZ3XxpNtzPF1IBX2A/edit?usp=sharing';
  const UPCOMING_CSV_URL = 'https://docs.google.com/spreadsheets/d/1MfcYYDbAsRddIz5zszFvcT9EzIX-8QZ8KTs8doOyW1Q/gviz/tq?tqx=out:csv';

  const defaultPujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন'];
  const years = Array.from({ length: 12 }, (_, i) => 2025 + i);

  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchGoogleSheetData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [response, upcomingRes] = await Promise.all([
        fetch(`${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`${UPCOMING_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }).catch(() => null),
      ]);

      let upcomingPujaName = '';
      if (upcomingRes && upcomingRes.ok) {
        const upText = await upcomingRes.text();
        const upLines = upText.trim().split(/\r?\n/);
        if (upLines.length >= 2) {
          const upCols = upLines[1].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
            v.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
          );
          if (upCols[0]) upcomingPujaName = upCols[0];
          if (upCols[2]) {
            const convertedYear = toNumber(upCols[2].match(/[০-৯\d]{4}/)?.[0]);
            if (convertedYear) setSelectedYear(convertedYear);
          }
        }
      }

      const csvText = await response.text();
      const lines = csvText.trim().split(/\r?\n/);
      const parsedRecords = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
          val.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );

        if (cols.length >= 5 && cols[0]) {
          parsedRecords.push({
            id: i,
            name: cols[0],
            puja: cols[1] || 'কার্তিক পূজা',
            year: toNumber(cols[2]) || new Date().getFullYear(),
            pledged: toNumber(cols[3]),
            paid: toNumber(cols[4]),
          });
        }
      }

      setRecords(parsedRecords);

      // আসন্ন পূজা শিট ও বর্তমান শিটের সব পূজা মিলিয়ে অটো সিলেক্ট
      if (upcomingPujaName) {
        const allPujas = Array.from(
          new Set([...defaultPujas, ...parsedRecords.map((r) => r.puja).filter(Boolean)])
        );
        const matchedPuja = allPujas.find((p) => upcomingPujaName.includes(p));
        if (matchedPuja) setSelectedPuja(matchedPuja);
      }
    } catch (error) {
      console.error('গুগল শিট লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheetData();
  }, []);

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

  // গুগল শিটে নতুন কোনো পূজা যোগ করলে তা স্বয়ংক্রিয়ভাবে ড্রপডাউনে আসবে
  const pujas = Array.from(
    new Set([...defaultPujas, ...records.map((r) => r.puja).filter(Boolean)])
  );

  const allYearRecords = records.filter(
    (r) => r.puja === selectedPuja && Number(r.year) === Number(selectedYear)
  );

  const totalPledged = allYearRecords.reduce((sum, r) => sum + r.pledged, 0);
  const totalPaid = allYearRecords.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = totalPledged - totalPaid;

  const filteredRecords = allYearRecords.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-4xl mx-auto py-6 md:py-8 px-2.5 sm:px-4">
        
        {/* টপ বার */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-5 print:hidden">
          <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-900 font-medium text-xs sm:text-sm">
            ← হোমে ফিরে যান
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => window.print()}
              title="তালিকাটি প্রিন্ট বা PDF হিসেবে সেভ করুন"
              className="text-[11px] sm:text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-2.5 sm:px-3.5 py-1.5 rounded-full font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <span>🖨️</span> প্রিন্ট / PDF
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <a
                  href={GOOGLE_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] sm:text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 sm:px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিট এডিট
                </a>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="text-[11px] sm:text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1.5 rounded-full"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-[11px] sm:text-xs text-amber-800 hover:text-amber-950 bg-amber-100/80 border border-amber-300 px-2.5 sm:px-3 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchGoogleSheetData}
              disabled={isLoading}
              title="নতুন ডাটা লোড করতে ক্লিক করুন"
              className="text-[11px] sm:text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 sm:px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? '...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white p-5 md:p-8 rounded-3xl shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 print:hidden">
              <span className="bg-amber-800/60 text-yellow-200 text-[11px] px-2.5 py-0.5 rounded font-bold">হিসাব-নিকাশ</span>
              <span className="bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ শিট
              </span>
            </div>
            <span className="text-[11px] text-amber-200 font-semibold">
              নবজাগরণ একতা সংঘ
            </span>
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mt-2">
            নবীন মহাজন পাড়া — {selectedPuja} ({selectedYear})
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm mt-1">
            পূজার প্রণামী ও চাঁদা আদায়ের পূর্ণাঙ্গ খাতা
          </p>
        </div>

        {/* মূল বক্স */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-3 sm:p-5 md:p-6">
          
          {/* ফিল্টার */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5 pb-4 border-b print:hidden">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">📋 প্রণামীর তালিকা</h2>
              <p className="text-xs text-gray-500">
                পূজা ও বছর নির্বাচন করে যেকোনো সদস্যের হিসাব দেখুন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                <span className="text-xs font-semibold text-gray-600">পূজা:</span>
                <select
                  value={selectedPuja}
                  onChange={(e) => setSelectedPuja(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 text-xs sm:text-sm rounded-lg p-1.5 sm:p-2 font-medium outline-none"
                >
                  {pujas.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-600">বছর:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-gray-100 border border-gray-300 text-xs sm:text-sm rounded-lg p-1.5 sm:p-2 font-medium outline-none"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* সামারি কার্ড */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="text-[10px] sm:text-xs text-blue-700 font-semibold">ধার্য টাকা</div>
              <div className="text-base sm:text-xl font-bold text-blue-800 mt-0.5">{totalPledged} ৳</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="text-[10px] sm:text-xs text-green-700 font-semibold">মোট আদায়</div>
              <div className="text-base sm:text-xl font-bold text-green-800 mt-0.5">{totalPaid} ৳</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 sm:p-3 text-center">
              <div className="text-[10px] sm:text-xs text-red-700 font-semibold">মোট বকেয়া</div>
              <div className="text-base sm:text-xl font-bold text-red-800 mt-0.5">{totalDue} ৳</div>
            </div>
          </div>

          {/* 🔍 লাইভ সার্চ বার */}
          <div className="relative mb-4 print:hidden">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="নাম দিয়ে খুঁজুন (যেমন: সুমন, নয়ন, দিপক)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl outline-none focus:border-amber-600 bg-gray-50 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* টেবিল */}
          <div className="w-full">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <span className="text-2xl animate-spin">⏳</span>
                <span>গুগল শিট থেকে লাইভ হিসাব লোড হচ্ছে...</span>
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে।
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 text-[11px] sm:text-xs uppercase">
                  <tr>
                    <th className="py-2.5 px-1 sm:px-3 w-7 sm:w-10 text-center">#</th>
                    <th className="py-2.5 px-1.5 sm:px-3">নাম</th>
                    <th className="py-2.5 px-1 sm:px-3 text-right">ধার্য</th>
                    <th className="py-2.5 px-1 sm:px-3 text-right">দিয়েছে</th>
                    <th className="py-2.5 px-1 sm:px-3 text-right">বকেয়া</th>
                    <th className="py-2.5 px-1 sm:px-3 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400 text-sm">
                        {searchQuery
                          ? `"${searchQuery}" নামে কাউকে পাওয়া যায়নি।`
                          : `${selectedPuja} (${selectedYear}) তে কোনো এন্ট্রি নেই।`}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r, index) => {
                      const due = r.pledged - r.paid;

                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-1 sm:px-3 text-center text-gray-400 text-[11px] sm:text-xs">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-1.5 sm:px-3 font-semibold text-gray-800 leading-tight">
                            {r.name}
                          </td>
                          <td className="py-2.5 px-1 sm:px-3 text-right font-medium text-gray-600">
                            {r.pledged > 0 ? r.pledged : '—'}
                          </td>
                          <td className="py-2.5 px-1 sm:px-3 text-right font-bold text-green-700">
                            {r.paid}
                          </td>
                          <td className="py-2.5 px-1 sm:px-3 text-right font-bold text-red-600">
                            {due > 0 ? due : '০'}
                          </td>
                          <td className="py-2.5 px-1 sm:px-3 text-center whitespace-nowrap">
                            {due <= 0 && r.pledged > 0 ? (
                              <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                ✓ পরিশোধিত
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                                {r.paid > 0 ? `বাকি ${due}` : '✕ বকেয়া'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
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
                  className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg"
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