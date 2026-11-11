'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function PronamiPage() {
  const ADMIN_PIN = '0000';
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1JRNTuGcVo940s1-qNtI4lWwS8VzZ3XxpNtzPF1IBX2A/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1JRNTuGcVo940s1-qNtI4lWwS8VzZ3XxpNtzPF1IBX2A/edit?usp=sharing';

  const pujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন'];
  const years = Array.from({ length: 12 }, (_, i) => 2025 + i);

  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');
  const [selectedYear, setSelectedYear] = useState(2026);
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
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
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
            year: Number(cols[2]) || 2026,
            pledged: Number(cols[3]) || 0,
            paid: Number(cols[4]) || 0,
          });
        }
      }

      setRecords(parsedRecords);
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
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {/* টপ বার */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-900 font-medium text-sm">
            ← হোমে ফিরে যান
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a
                  href={GOOGLE_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে হিসাব এডিট করুন
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
                className="text-xs text-amber-800 hover:text-amber-950 bg-amber-100/80 border border-amber-300 px-3 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchGoogleSheetData}
              disabled={isLoading}
              title="নতুন ডাটা লোড করতে ক্লিক করুন"
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white p-6 rounded-2xl shadow-md mb-8">
          <div className="flex items-center gap-2">
            <span className="bg-amber-800/60 text-yellow-200 text-xs px-2.5 py-1 rounded font-bold">হিসাব-নিকাশ</span>
            <span className="bg-green-500/80 text-white text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ গুগল শিট
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">পূজার প্রণামী ও চাঁদার খাতা</h1>
          <p className="text-amber-100 text-sm mt-2">
            গুগল শিট থেকে স্বয়ংক্রিয়ভাবে লাইভ হিসাব দেখানো হচ্ছে।
          </p>
        </div>

        {/* মূল বক্স */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
          
          {/* ফিল্টার */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-bold text-gray-800">📋 প্রণামীর তালিকা</h2>
              <p className="text-xs text-gray-500">
                পূজা ও বছর নির্বাচন করে যেকোনো সদস্যের হিসাব দেখুন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-600">পূজা:</span>
                <select
                  value={selectedPuja}
                  onChange={(e) => setSelectedPuja(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-xs md:text-sm rounded-lg p-2 font-medium outline-none"
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
                  className="bg-gray-100 border border-gray-300 text-xs md:text-sm rounded-lg p-2 font-medium outline-none"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* সামারি কার্ড */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-[11px] md:text-xs text-blue-700 font-semibold">ধার্য / দেওয়ার কথা</div>
              <div className="text-lg md:text-xl font-bold text-blue-800 mt-1">{totalPledged} ৳</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <div className="text-[11px] md:text-xs text-green-700 font-semibold">মোট আদায় হয়েছে</div>
              <div className="text-lg md:text-xl font-bold text-green-800 mt-1">{totalPaid} ৳</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-[11px] md:text-xs text-red-700 font-semibold">মোট বকেয়া</div>
              <div className="text-lg md:text-xl font-bold text-red-800 mt-1">{totalDue} ৳</div>
            </div>
          </div>

          {/* 🔍 লাইভ সার্চ বার */}
          <div className="relative mb-5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="নাম দিয়ে খুঁজুন (যেমন: সুমন, রকি, দিপক)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm border border-gray-300 rounded-xl outline-none focus:border-amber-600 bg-gray-50 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 font-bold"
                title="সার্চ ক্লিয়ার করুন"
              >
                ✕
              </button>
            )}
          </div>

          {/* তালিকা টেবিল (টাকার চিহ্ন ৳ সরিয়ে শুধু খাঁটি সংখ্যা রাখা হলো) */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <span className="text-2xl animate-spin">⏳</span>
                <span>গুগল শিট থেকে লাইভ হিসাব লোড হচ্ছে...</span>
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে। শিটটির শেয়ারিং পারমিশন 'Anyone with the link' আছে কি না চেক করুন।
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">নাম</th>
                    <th className="py-2.5 px-3 text-right">ধার্য টাকা</th>
                    <th className="py-2.5 px-3 text-right">দিয়েছে</th>
                    <th className="py-2.5 px-3 text-right">বকেয়া</th>
                    <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
                          <td className="py-3 px-3 text-center text-gray-400 text-xs">{index + 1}</td>
                          <td className="py-3 px-3 font-semibold text-gray-800">{r.name}</td>
                          
                          {/* ধার্য টাকা (৳ চিহ্ন ছাড়া) */}
                          <td className="py-3 px-3 text-right font-medium text-gray-600">
                            {r.pledged > 0 ? r.pledged : '—'}
                          </td>
                          
                          {/* দিয়েছে টাকা (৳ চিহ্ন ছাড়া) */}
                          <td className="py-3 px-3 text-right font-bold text-green-700">
                            {r.paid}
                          </td>
                          
                          {/* বকেয়া টাকা (৳ চিহ্ন ছাড়া) */}
                          <td className="py-3 px-3 text-right font-bold text-red-600">
                            {due > 0 ? due : '০'}
                          </td>
                          
                          <td className="py-3 px-3 text-center">
                            {due <= 0 && r.pledged > 0 ? (
                              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                ✓ পরিশোধিত
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
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

      {/* অ্যাডমিন পিন কোড ইনপুট মডাল */}
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