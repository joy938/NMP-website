'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';

const toNumber = (str) => {
  if (!str) return 0;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const en = String(str)
    .replace(/[০-৯]/g, (d) => bn.indexOf(d))
    .replace(/,/g, '')
    .trim();
  return Number(en) || 0;
};

export default function SanghaExpensesPage() {
  const ADMIN_PIN = '0000';

  const SANGHA_EXPENSES_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1tilHw5ch_Br3JS_Y8e0pRGrD5selpwlIIbVLyS2CN7Q/gviz/tq?tqx=out:csv';
  const SANGHA_EXPENSES_EDIT_URL =
    'https://docs.google.com/spreadsheets/d/1tilHw5ch_Br3JS_Y8e0pRGrD5selpwlIIbVLyS2CN7Q/edit?usp=sharing';
  const SANGHA_CHANDA_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1FkY0Kq9EI7Xbepcjq9zlZGC2vqhANNAGFiz1MBxy0-4/gviz/tq?tqx=out:csv';

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [totalChandaIncome, setTotalChandaIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [expRes, chandaRes] = await Promise.all([
        fetch(`${SANGHA_EXPENSES_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`${SANGHA_CHANDA_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      // ১. সংঘের খরচ শিট পড়া (বিবরণ, খরচ, তারিখ)
      const expText = await expRes.text();
      const expLines = expText.trim().split(/\r?\n/);
      const parsedExpenses = [];

      for (let i = 1; i < expLines.length; i++) {
        const line = expLines[i];
        if (!line.trim()) continue;
        const cols = line
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

        if (cols[0]) {
          parsedExpenses.push({
            id: i,
            title: cols[0],
            cost: toNumber(cols[1]),
            date: cols[2] || '—',
          });
        }
      }
      setExpenses(parsedExpenses);

      // ২. ৫০ টাকা মাসিক চাঁদা শিট থেকে সর্বমোট আদায় হিসাব
      const chandaText = await chandaRes.text();
      const chandaLines = chandaText.trim().split(/\r?\n/);
      let paidRows = 0;

      for (let i = 1; i < chandaLines.length; i++) {
        const line = chandaLines[i];
        if (!line.trim()) continue;
        const cols = line
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

        if (cols.length >= 4 && cols[3] && cols[3].includes('পরিশোধিত')) {
          paidRows++;
        }
      }
      setTotalChandaIncome(paidRows * 50);
    } catch (error) {
      console.error('সংঘের খরচ লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('nmp_is_admin') === 'true') {
      setIsAdmin(true);
    }
    fetchData();
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      sessionStorage.setItem('nmp_is_admin', 'true');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('ভুল পিন কোড!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('nmp_is_admin');
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.cost, 0);
  const netBalance = totalChandaIncome - totalExpense;

  const filteredExpenses = expenses.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <main className="min-h-screen bg-gray-50 print:bg-transparent text-gray-800 relative">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* প্রিন্ট / PDF ওয়াটারমার্ক */}
      <div className="hidden print:flex fixed inset-0 items-center justify-center pointer-events-none z-0">
        <img
          src="/logo.png"
          alt="Watermark"
          className="w-80 h-80 object-contain opacity-15"
        />
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 relative z-10">
        {/* টপ বার */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-6 print:hidden">
          <Link
            href="/sangha"
            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
          >
            ← সংঘের বিবরণে ফিরুন
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <span>🖨️</span> প্রিন্ট / PDF
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a
                  href={SANGHA_EXPENSES_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিট এডিট
                </a>
                <button
                  onClick={handleAdminLogout}
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
              onClick={fetchData}
              disabled={isLoading}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span>{' '}
              {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-red-700 text-white p-5 sm:p-6 rounded-2xl shadow-md mb-8 flex items-center gap-4">
          <img
            src="/logo.png"
            alt="নবজাগরণ একতা সংঘ লোগো"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-md object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 print:hidden">
              <span className="bg-red-800 text-amber-200 text-xs px-2.5 py-1 rounded font-bold">
                সংগঠনের হিসাব
              </span>
              <span className="bg-green-500/80 text-white text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ গুগল শিট
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold mt-2">
              নবজাগরণ একতা সংঘ — খরচের হিসাব
            </h1>
            <p className="text-red-100 text-xs sm:text-sm mt-1">
              মাসিক চাঁদার মোট আদায় ও সংগঠনের ব্যয়ের স্বচ্ছ হিসাব।
            </p>
          </div>
        </div>

        {/* মূল বক্স */}
        <div className="bg-white/95 print:bg-transparent rounded-2xl shadow print:shadow-none border border-gray-100 p-4 sm:p-6">
          {/* ৩টি সামারি কার্ড */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-2.5 sm:p-4 text-center">
              <span className="text-[10px] sm:text-xs text-blue-700 font-bold block">
                মোট চাঁদা আদায়
              </span>
              <div className="text-base sm:text-2xl font-black text-blue-900 mt-0.5">
                {totalChandaIncome} ৳
              </div>
            </div>

            <div className="bg-red-50/90 border border-red-200 rounded-xl p-2.5 sm:p-4 text-center">
              <span className="text-[10px] sm:text-xs text-red-700 font-bold block">
                সংঘের মোট খরচ
              </span>
              <div className="text-base sm:text-2xl font-black text-red-900 mt-0.5">
                {totalExpense} ৳
              </div>
            </div>

            <div
              className={`rounded-xl p-2.5 sm:p-4 text-center border ${
                netBalance >= 0
                  ? 'bg-green-50/90 border-green-200'
                  : 'bg-amber-50/90 border-amber-300'
              }`}
            >
              <span
                className={`text-[10px] sm:text-xs font-bold block ${
                  netBalance >= 0 ? 'text-green-700' : 'text-amber-800'
                }`}
              >
                {netBalance >= 0 ? 'অবশিষ্ট ফান্ড' : 'ঘাটতি'}
              </span>
              <div
                className={`text-base sm:text-2xl font-black mt-0.5 ${
                  netBalance >= 0 ? 'text-green-800' : 'text-red-700'
                }`}
              >
                {netBalance >= 0 ? `${netBalance} ৳` : `- ${Math.abs(netBalance)} ৳`}
              </div>
            </div>
          </div>

          {/* সার্চ বার */}
          <div className="relative mb-5 print:hidden">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="খরচের বিবরণ বা তারিখ দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm border border-gray-300 rounded-xl outline-none focus:border-red-600 bg-gray-50 focus:bg-white transition"
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
                <Loader text="হিসাব লোড হচ্ছে..." />
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে।
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100/90 text-gray-700 text-[11px] sm:text-xs uppercase">
                  <tr>
                    <th className="py-2.5 px-1.5 sm:px-3 w-8 sm:w-12 text-center">#</th>
                    <th className="py-2.5 px-1.5 sm:px-3">বিবরণ</th>
                    <th className="py-2.5 px-1.5 sm:px-3 text-center">তারিখ</th>
                    <th className="py-2.5 px-1.5 sm:px-3 text-right">খরচ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">
                        {searchQuery
                          ? `"${searchQuery}" নামে কোনো খরচ পাওয়া যায়নি।`
                          : 'গুগল শিটে এখনো কোনো খরচের এন্ট্রি নেই।'}
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item, index) => (
                      <tr
                        key={item.id}
                        className="even:bg-orange-100/50 hover:bg-orange-100 transition-colors"
                      >
                        <td className="py-2.5 px-1.5 sm:px-3 text-center text-gray-400 text-[11px] sm:text-xs">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-1.5 sm:px-3 font-semibold text-gray-800 leading-tight">
                          {item.title}
                        </td>
                        <td className="py-2.5 px-1.5 sm:px-3 text-center text-gray-600 text-[11px] sm:text-xs whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="py-2.5 px-1.5 sm:px-3 text-right font-bold text-red-600">
                          {item.cost}
                        </td>
                      </tr>
                    ))
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
                  onClick={() => {
                    setShowPinModal(false);
                    setPinError('');
                    setPinInput('');
                  }}
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