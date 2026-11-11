'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function ExpensesPage() {
  const ADMIN_PIN = '0000';

  // খরচের গুগল শিট ও প্রণামীর গুগল শিটের লিংক (আদায় ও ব্যয়ের সমন্বয়ের জন্য)
  const EXPENSES_CSV_URL = 'https://docs.google.com/spreadsheets/d/1g0RHelPy7pBIOncuU7UAOcXz9llWjiRoBZBybMblxg4/gviz/tq?tqx=out:csv';
  const EXPENSES_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1g0RHelPy7pBIOncuU7UAOcXz9llWjiRoBZBybMblxg4/edit?usp=sharing';
  const PRONAMI_CSV_URL = 'https://docs.google.com/spreadsheets/d/1JRNTuGcVo940s1-qNtI4lWwS8VzZ3XxpNtzPF1IBX2A/gviz/tq?tqx=out:csv';

  const pujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন'];
  const years = Array.from({ length: 12 }, (_, i) => 2025 + i);

  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [searchQuery, setSearchQuery] = useState('');

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // ডাটা স্টেট
  const [expenses, setExpenses] = useState([]);
  const [pronamiRecords, setPronamiRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // খরচ ও প্রণামী উভয় শিট থেকে ডাটা আনা
  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      // ১. খরচের ডাটা আনা
      const expRes = await fetch(EXPENSES_CSV_URL);
      const expText = await expRes.text();
      const expLines = expText.trim().split(/\r?\n/);
      const parsedExpenses = [];

      for (let i = 1; i < expLines.length; i++) {
        const line = expLines[i];
        if (!line.trim()) continue;
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
          v.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );
        if (cols.length >= 5 && cols[0]) {
          parsedExpenses.push({
            id: i,
            title: cols[0],
            category: cols[1] || 'বিবিধ',
            cost: Number(cols[2]) || 0,
            puja: cols[3] || 'কার্তিক পূজা',
            year: Number(cols[4]) || 2025,
          });
        }
      }
      setExpenses(parsedExpenses);

      // ২. প্রণামীর ডাটা আনা (মোট আয়ের হিসাবের জন্য)
      const proRes = await fetch(PRONAMI_CSV_URL);
      const proText = await proRes.text();
      const proLines = proText.trim().split(/\r?\n/);
      const parsedPronami = [];

      for (let i = 1; i < proLines.length; i++) {
        const line = proLines[i];
        if (!line.trim()) continue;
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
          v.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );
        if (cols.length >= 5 && cols[0]) {
          parsedPronami.push({
            puja: cols[1] || 'কার্তিক পূজা',
            year: Number(cols[2]) || 2025,
            paid: Number(cols[4]) || 0,
          });
        }
      }
      setPronamiRecords(parsedPronami);

    } catch (error) {
      console.error('ডাটা লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // ১. নির্বাচিত পূজার মোট খরচ
  const currentExpenses = expenses.filter(
    (e) => e.puja === selectedPuja && Number(e.year) === Number(selectedYear)
  );
  const totalExpense = currentExpenses.reduce((sum, item) => sum + item.cost, 0);

  // ২. নির্বাচিত পূজার মোট আদায় (প্রণামী শিট থেকে)
  const currentIncomeRecords = pronamiRecords.filter(
    (r) => r.puja === selectedPuja && Number(r.year) === Number(selectedYear)
  );
  const totalIncome = currentIncomeRecords.reduce((sum, item) => sum + item.paid, 0);

  // ৩. অবশিষ্ট তহবিল / ব্যালেন্স (আদায় - খরচ)
  const netBalance = totalIncome - totalExpense;

  // সার্চ ফিল্টার
  const filteredExpenses = currentExpenses.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {/* টপ বার (প্রিন্টে লুকানো থাকবে) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/" className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium text-sm">
            ← হোমে ফিরে যান
          </Link>

          <div className="flex items-center gap-2">
            {/* 🖨️ প্রিন্ট / PDF বাটন */}
            <button
              onClick={() => window.print()}
              title="তালিকাটি প্রিন্ট বা PDF হিসেবে সেভ করুন"
              className="text-xs bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-3.5 py-1.5 rounded-full font-semibold transition flex items-center gap-1 shadow-2xs"
            >
              <span>🖨️</span> প্রিন্ট / PDF
            </button>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a
                  href={EXPENSES_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে খরচ এডিট করুন
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
                className="text-xs text-purple-700 hover:text-purple-900 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchData}
              disabled={isLoading}
              title="নতুন ডাটা লোড করতে ক্লিক করুন"
              className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white p-6 md:p-8 rounded-3xl shadow-md mb-8">
          <div className="flex items-center gap-2 print:hidden">
            <span className="bg-white/20 text-purple-200 text-xs px-2.5 py-1 rounded font-bold">ব্যয়-বিবরণ</span>
            <span className="bg-green-500/80 text-white text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ হিসাব
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">
            নবীন মহাজন পাড়া — পূজার খরচের খাতা
          </h1>
          <p className="text-purple-100 text-xs md:text-sm mt-1">
            প্রতিমা, ডেকোরেশন, প্রসাদ ও বিবিধ খাতে ব্যয় এবং অবশিষ্ট তহবিলের পূর্ণাঙ্গ বিবরণী।
          </p>
        </div>

        {/* মূল বক্স */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 md:p-6">
          
          {/* ফিল্টার: পূজা ও বছর নির্বাচন (প্রিন্টে লুকানো থাকবে) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b print:hidden">
            <div>
              <h2 className="text-lg font-bold text-gray-800">📋 {selectedPuja}র হিসাব</h2>
              <p className="text-xs text-gray-500">
                পূজা ও বছর পরিবর্তন করে আর্থিক বিবরণী দেখুন।
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

          {/* ৩টি কার্ড: মোট আদায়, মোট খরচ, এবং অবশিষ্ট তহবিল (স্বয়ংক্রিয় হিসাব) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            
            {/* কার্ড ১: মোট আদায় */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
              <span className="text-xs text-blue-700 font-bold uppercase">মোট আদায় (প্রণামী)</span>
              <div className="text-xl md:text-2xl font-black text-blue-900 mt-1">
                {totalIncome} ৳
              </div>
              <span className="text-[10px] text-blue-600 mt-0.5 block">পূজার মোট সংগৃহীত অর্থ</span>
            </div>

            {/* কার্ড ২: মোট খরচ */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <span className="text-xs text-red-700 font-bold uppercase">মোট খরচ (ব্যয়)</span>
              <div className="text-xl md:text-2xl font-black text-red-900 mt-1">
                {totalExpense} ৳
              </div>
              <span className="text-[10px] text-red-600 mt-0.5 block">মোট {currentExpenses.length}টি খাতে ব্যয়</span>
            </div>

            {/* কার্ড ৩: অবশিষ্ট তহবিল (উদ্বৃত্ত বা ঘাটতি) */}
            <div className={`rounded-2xl p-4 text-center border ${
              netBalance >= 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-300'
            }`}>
              <span className={`text-xs font-bold uppercase ${
                netBalance >= 0 ? 'text-green-700' : 'text-amber-800'
              }`}>
                অবশিষ্ট তহবিল / ব্যালেন্স
              </span>
              <div className={`text-xl md:text-2xl font-black mt-1 ${
                netBalance >= 0 ? 'text-green-800' : 'text-red-700'
              }`}>
                {netBalance >= 0 ? `${netBalance} ৳` : `- ${Math.abs(netBalance)} ৳`}
              </div>
              <span className={`text-[10px] font-bold mt-0.5 block ${
                netBalance >= 0 ? 'text-green-600' : 'text-amber-800'
              }`}>
                {netBalance >= 0 ? '✓ তহবিলে জমা (উদ্বৃত্ত)' : '⚠️ ঘাটতি'}
              </span>
            </div>

          </div>

          {/* 🔍 সার্চ বার (প্রিন্টে লুকানো থাকবে) */}
          <div className="relative mb-5 print:hidden">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="খরচের বিবরণ বা ক্যাটাগরি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm border border-gray-300 rounded-xl outline-none focus:border-purple-600 bg-gray-50 focus:bg-white transition"
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

          {/* তালিকা টেবিল (টাকার চিহ্ন ৳ ছাড়া খাঁটি সংখ্যা) */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <span className="text-2xl animate-spin">⏳</span>
                <span>গুগল শিট থেকে ব্যয়ের হিসাব লোড হচ্ছে...</span>
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
                    <th className="py-2.5 px-3">খরচের বিবরণ / খাত</th>
                    <th className="py-2.5 px-3">ক্যাটাগরি</th>
                    <th className="py-2.5 px-3 text-right">খরচ (টাকা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">
                        {searchQuery
                          ? `"${searchQuery}" এর সাথে কোনো খরচের রেকর্ড মিলছে না।`
                          : `${selectedPuja} (${selectedYear}) তে গুগল শিটে কোনো খরচের এন্ট্রি নেই।`}
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 text-center text-gray-400 text-xs">{index + 1}</td>
                        <td className="py-3 px-3 font-semibold text-gray-800">{item.title}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2.5 py-0.5 rounded-full border border-purple-200">
                            {item.category}
                          </span>
                        </td>
                        {/* ৳ চিহ্ন সরিয়ে পরিষ্কার সংখ্যা রাখা হলো */}
                        <td className="py-3 px-3 text-right font-bold text-red-600">
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
                className="w-full p-2.5 border border-gray-300 rounded-lg text-center tracking-widest text-2xl font-bold outline-none focus:border-purple-600 mb-2"
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
                  className="px-4 py-2 text-sm bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-lg"
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