'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function SanghaPage() {
  const ADMIN_PIN = '0000';
  
  // তোমার মাসিক চাঁদার গুগল শিট লিংক
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1FkY0Kq9EI7Xbepcjq9zlZGC2vqhANNAGFiz1MBxy0-4/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1FkY0Kq9EI7Xbepcjq9zlZGC2vqhANNAGFiz1MBxy0-4/edit?usp=sharing';

  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'অগাস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const years = Array.from({ length: 12 }, (_, i) => 2025 + i);

  // স্বয়ংক্রিয়ভাবে বর্তমান মাস ও বছর বের করার স্মার্ট কোড
  const currentMonthName = months[new Date().getMonth()];
  const currentYearNumber = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYearNumber);
  const [searchQuery, setSearchQuery] = useState('');

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // ডাটা ও লোডিং স্টেট
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchGoogleSheetData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
      const csvText = await response.text();

      const lines = csvText.trim().split(/\r?\n/);
      const parsedRecords = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
          val.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );

        if (cols.length >= 4 && cols[0]) {
          parsedRecords.push({
            id: i,
            name: cols[0],
            month: cols[1] || currentMonthName,
            year: Number(cols[2]) || currentYearNumber,
            status: cols[3] || 'বকেয়া',
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

  const currentMonthRecords = records.filter(
    (r) => r.month === selectedMonth && Number(r.year) === Number(selectedYear)
  );

  const paidCount = currentMonthRecords.filter((r) => r.status.includes('পরিশোধিত')).length;
  const dueCount = currentMonthRecords.length - paidCount;

  const filteredRecords = currentMonthRecords.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* টপ বার */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm">
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
                  <span>📊</span> শিটে চাঁদা এডিট করুন
                </a>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-full font-medium"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchGoogleSheetData}
              disabled={isLoading}
              title="নতুন ডাটা লোড করতে ক্লিক করুন"
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার */}
        <div className="bg-red-700 text-white p-6 rounded-2xl shadow-md mb-8">
          <div className="flex items-center gap-2">
            <span className="bg-red-800 text-amber-200 text-xs px-2.5 py-1 rounded font-bold">আমাদের সংগঠন</span>
            <span className="bg-green-500/80 text-white text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ গুগল শিট
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">নবজাগরণ একতা সংঘ</h1>
          <p className="text-red-100 text-sm mt-2">
            নবীন মহাজন পাড়ার সকল পূজা ও সামাজিক উন্নয়নমূলক কাজ এই সংগঠনের মাধ্যমেই পরিচালিত হয়।
          </p>
        </div>

        {/* চাঁদার হিসাব ও তালিকা */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-bold text-gray-800">💳 মাসিক চাঁদা ট্র্যাকার (৫০ ৳)</h2>
              <p className="text-xs text-gray-500">
                মাস ও বছর নির্বাচন করে চাঁদা আদায়ের লাইভ হিসাব দেখুন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-gray-600">মাস:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-xs md:text-sm rounded-lg p-2 font-medium outline-none"
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
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

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <div className="text-xs text-green-700 font-semibold">{selectedMonth} {selectedYear} আদায়</div>
              <div className="text-xl font-bold text-green-800 mt-1">{paidCount * 50} ৳</div>
              <div className="text-[11px] text-green-600">{paidCount} জন পরিশোধ করেছেন</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-xs text-red-700 font-semibold">{selectedMonth} {selectedYear} বাকি</div>
              <div className="text-xl font-bold text-red-800 mt-1">{dueCount * 50} ৳</div>
              <div className="text-[11px] text-red-600">{dueCount} জনের বাকি</div>
            </div>
          </div>

          <div className="relative mb-5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="সদস্যের নাম দিয়ে খুঁজুন (যেমন: প্রদ্যুত, জয়, শেখর)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm border border-gray-300 rounded-xl outline-none focus:border-red-600 bg-gray-50 focus:bg-white transition"
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

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <span className="text-2xl animate-spin">⏳</span>
                <span>গুগল শিট থেকে চাঁদার হিসাব লোড হচ্ছে...</span>
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে। শিটটির শেয়ারিং পারমিশন 'Anyone with the link' আছে কি না চেক করুন।
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">সদস্যের নাম</th>
                    <th className="py-2.5 px-3 text-center">{selectedMonth} {selectedYear} (৫০ ৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-400 text-sm">
                        {searchQuery
                          ? `"${searchQuery}" নামে কাউকে পাওয়া যায়নি।`
                          : `${selectedMonth} ${selectedYear}-এর জন্য গুগল শিটে কোনো রেকর্ড নেই।`}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((member, index) => {
                      const isPaid = member.status.includes('পরিশোধিত');

                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="py-3 px-3 text-center text-gray-400 text-xs">{index + 1}</td>
                          <td className="py-3 px-3 font-semibold text-gray-800">{member.name}</td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-full inline-block ${
                                isPaid
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {isPaid ? '✓ ৫০ ৳ পরিশোধিত' : '✕ বকেয়া'}
                            </span>
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
    </main>
  );
}