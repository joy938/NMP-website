'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';

const EXPENSES_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1tilHw5ch_Br3JS_Y8e0pRGrD5selpwlIIbVLyS2CN7Q/export?format=csv';
const SANGHA_CHANDA_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1FkY0Kq9EI7Xbepcjq9zlZGC2vqhANNAGFiz1MBxy0-4/export?format=csv';
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwWS9HYlJRD2wnkyGoQdos7ExG4uBqFAAJPEJK2VeUyQsnIF1dk-rxBrImwnUIEFimI/exec';

const ADMIN_PIN = '0000';

const normalizeBn = (str) => (str || '').normalize('NFC').toLowerCase().trim();

const toEnglishNumber = (str) => {
  if (!str) return '';
  const bnDigits = '০১২৩৪৫৬৭৮৯';
  return String(str)
    .replace(/[০-৯]/g, (d) => bnDigits.indexOf(d))
    .replace(/,/g, '')
    .trim();
};

const toBanglaNumber = (num) => {
  if (num === null || num === undefined || num === '') return '০';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const formatted = Number(num).toLocaleString('en-IN');
  return formatted.replace(/\d/g, (d) => bnDigits[Number(d)]);
};

const getTodayBanglaDate = () => {
  const months = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];
  const now = new Date();
  return `${toBanglaNumber(now.getDate())} ${months[now.getMonth()]}, ${toBanglaNumber(now.getFullYear())}`;
};

const parseCSV = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
};

export default function SanghaExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Add Expense Modal state (Admin only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dateInput, setDateInput] = useState(getTodayBanglaDate());
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('nmp_is_admin');
      if (savedAuth === 'true') setIsAdmin(true);
    }
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const timestamp = Date.now();
      const [expRes, chandaRes] = await Promise.all([
        fetch(`${EXPENSES_CSV_URL}&t=${timestamp}`, { cache: 'no-store' }),
        fetch(`${SANGHA_CHANDA_CSV_URL}&t=${timestamp}`, { cache: 'no-store' }),
      ]);

      if (!expRes.ok || !chandaRes.ok) {
        throw new Error('Sheet fetch failed');
      }

      const [expText, chandaText] = await Promise.all([
        expRes.text(),
        chandaRes.text(),
      ]);

      // Parse Sangha Expenses (Cols: বিবরণ, খরচ, তারিখ) preserving exact sheet rowIndex
      const expRows = parseCSV(expText);
      const parsedExpenses = [];
      for (let i = 1; i < expRows.length; i++) {
        const cols = expRows[i];
        if (cols[0] || cols[1]) {
          parsedExpenses.push({
            id: i,
            rowIndex: i + 1,
            description: cols[0] || '',
            amount: parseFloat(toEnglishNumber(cols[1])) || 0,
            date: cols[2] || '',
          });
        }
      }
      setExpenses(parsedExpenses);

      // Parse Total 50 Tk Chanda Income (Cols: নাম, মাস, বছর, স্ট্যাটাস)
      const chandaRows = parseCSV(chandaText);
      let incomeSum = 0;
      for (let i = 1; i < chandaRows.length; i++) {
        const row = chandaRows[i];
        if (!row[0]) continue;
        const status = normalizeBn(row[3] || '');
        if (
          status === 'প' ||
          status.includes('পরিশোধ') ||
          status === '50' ||
          status === '৫০'
        ) {
          incomeSum += 50;
        }
      }
      setTotalIncome(incomeSum);
    } catch (error) {
      console.error('Error fetching sangha expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      sessionStorage.removeItem('nmp_is_admin');
      setIsAdmin(false);
      setShowAddModal(false);
    } else {
      setPinInput('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      sessionStorage.setItem('nmp_is_admin', 'true');
      setIsAdmin(true);
      setShowPinModal(false);
      setPinError('');
    } else {
      setPinError('ভুল পিন! আবার চেষ্টা করুন।');
    }
  };

  const openAddModal = () => {
    setDescInput('');
    setAmountInput('');
    setDateInput(getTodayBanglaDate());
    setSubmitMessage('');
    setShowAddModal(true);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const cleanDesc = descInput.trim();
    const cleanAmount = parseFloat(toEnglishNumber(amountInput));
    const cleanDate = dateInput.trim() || getTodayBanglaDate();

    if (!cleanDesc || isNaN(cleanAmount) || cleanAmount <= 0) {
      setSubmitMessage('অনুগ্রহ করে সঠিক বিবরণ ও টাকার পরিমাণ লিখুন।');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'add',
          description: cleanDesc,
          amount: cleanAmount,
          date: cleanDate,
        }),
      });

      setSubmitMessage('সফলভাবে সংরক্ষণ হয়েছে!');
      setTimeout(() => {
        setShowAddModal(false);
        fetchData(true);
      }, 1200);
    } catch (err) {
      console.error('Error saving expense:', err);
      setSubmitMessage('সংরক্ষণ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (item) => {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      `"${item.description}" (${toBanglaNumber(item.amount)} টাকা) — এই খরচটি কি মুছে ফেলতে চান?`
    );
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'delete',
          rowIndex: item.rowIndex,
          description: item.description,
          date: item.date,
        }),
      });

      setTimeout(() => {
        setDeletingId(null);
        fetchData(true);
      }, 1200);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setDeletingId(null);
      alert('মুছে ফেলতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    }
  };

  const filteredExpenses = useMemo(() => {
    const q = normalizeBn(searchQuery);
    if (!q) return expenses;
    return expenses.filter(
      (item) =>
        normalizeBn(item.description).includes(q) ||
        normalizeBn(item.date).includes(q)
    );
  }, [expenses, searchQuery]);

  const totalExpense = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  );

  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  const remainingFund = totalIncome - totalExpense;

  return (
    <div className="min-h-screen relative print:bg-transparent">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Print Watermark */}
      <div className="hidden print:flex fixed inset-0 items-center justify-center pointer-events-none z-0 opacity-10">
        <img src="/logo.png" alt="Watermark" className="w-80 h-80 object-contain" />
      </div>

      <div className="max-w-4xl mx-auto py-6 px-3 sm:px-6 print:py-0 relative z-10">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader />
          </div>
        ) : (
          <>
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5 print:hidden">
              <Link
                href="/sangha"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 hover:text-red-800 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm"
              >
                ← সংঘের বিবরণে ফিরুন
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
                  >
                    + নতুন খরচ যোগ করুন
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-amber-800 border border-amber-300 hover:bg-amber-50 shadow-sm transition cursor-pointer"
                >
                  🖨️ প্রিন্ট / PDF
                </button>

                <button
                  onClick={handleAdminClick}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border shadow-sm transition cursor-pointer ${
                    isAdmin
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                  }`}
                >
                  {isAdmin ? '🔓 অ্যাডমিন (লগআউট)' : '🔒 অ্যাডমিন'}
                </button>

                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-sm transition cursor-pointer disabled:opacity-60"
                >
                  {refreshing ? 'রিফ্রেশ হচ্ছে...' : '🔄 রিফ্রেশ'}
                </button>
              </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-4 border-b border-gray-300 pb-3">
              <h1 className="text-xl font-bold text-gray-900">
                নবজাগরণ একতা সংঘ — সংঘের খরচের হিসাব
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                নবীন মহাজন পাড়া • প্রিন্টের তারিখ: {getTodayBanglaDate()}
              </p>
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-md mb-5 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="inline-block text-[11px] font-semibold bg-white/20 px-2.5 py-0.5 rounded-full mb-2">
                    নবজাগরণ একতা সংঘ
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    সংঘের আয়ের ও খরচের হিসাব
                  </h1>
                  <p className="text-xs sm:text-sm text-amber-100 mt-1">
                    মাসিক ৫০ টাকা চাঁদা থেকে আদায় ও সংঘের যাবতীয় খরচের স্বচ্ছ বিবরণ
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
              <div className="bg-white/95 rounded-xl p-2.5 sm:p-4 border border-emerald-200 shadow-sm text-center">
                <p className="text-[10px] sm:text-xs font-semibold text-emerald-700">
                  মোট চাঁদা আদায়
                </p>
                <p className="text-sm sm:text-xl font-bold text-emerald-800 mt-1">
                  {toBanglaNumber(totalIncome)} টাকা
                </p>
              </div>

              <div className="bg-white/95 rounded-xl p-2.5 sm:p-4 border border-red-200 shadow-sm text-center">
                <p className="text-[10px] sm:text-xs font-semibold text-red-700">
                  মোট সংঘের খরচ
                </p>
                <p className="text-sm sm:text-xl font-bold text-red-800 mt-1">
                  {toBanglaNumber(totalExpense)} টাকা
                </p>
              </div>

              <div
                className={`bg-white/95 rounded-xl p-2.5 sm:p-4 border shadow-sm text-center ${
                  remainingFund >= 0 ? 'border-amber-300' : 'border-red-300'
                }`}
              >
                <p className="text-[10px] sm:text-xs font-semibold text-amber-800">
                  অবশিষ্ট ফান্ড
                </p>
                <p
                  className={`text-sm sm:text-xl font-bold mt-1 ${
                    remainingFund >= 0 ? 'text-amber-900' : 'text-red-700'
                  }`}
                >
                  {toBanglaNumber(remainingFund)} টাকা
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-4 print:hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খরচের বিবরণ বা তারিখ দিয়ে খুঁজুন..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
              />
            </div>

            {/* Expenses Table */}
            <div className="bg-white/95 print:bg-transparent rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-amber-50/80 print:bg-transparent border-b border-amber-200 flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-amber-900">
                  খরচের তালিকা ({toBanglaNumber(filteredExpenses.length)} টি)
                </h2>
                {searchQuery && (
                  <span className="text-xs font-semibold text-red-700">
                    মোট: {toBanglaNumber(filteredTotal)} টাকা
                  </span>
                )}
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  কোনো খরচের তথ্য পাওয়া যায়নি।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-amber-100/70 print:bg-transparent text-amber-900 border-b border-amber-200">
                        <th className="py-2.5 px-3 font-bold w-10 text-center">#</th>
                        <th className="py-2.5 px-3 font-bold">বিবরণ</th>
                        <th className="py-2.5 px-3 font-bold text-right">খরচ</th>
                        <th className="py-2.5 px-3 font-bold text-right">তারিখ</th>
                        {isAdmin && (
                          <th className="py-2.5 px-2 font-bold text-center print:hidden w-12">
                            মুছুন
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b border-amber-100 even:bg-orange-100/50 print:even:bg-transparent"
                        >
                          <td className="py-2.5 px-3 text-center text-gray-500 font-medium">
                            {toBanglaNumber(idx + 1)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-gray-800">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-700 whitespace-nowrap">
                            {toBanglaNumber(item.amount)} টাকা
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-600 whitespace-nowrap">
                            {item.date}
                          </td>
                          {isAdmin && (
                            <td className="py-2.5 px-2 text-center print:hidden">
                              <button
                                onClick={() => handleDeleteExpense(item)}
                                disabled={deletingId === item.id}
                                title="খরচটি মুছে ফেলুন"
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition cursor-pointer disabled:opacity-40"
                              >
                                {deletingId === item.id ? '⏳' : '🗑️'}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Admin PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-xl border border-amber-200">
            <h3 className="text-base font-bold text-gray-800 mb-3">
              অ্যাডমিন লগইন
            </h3>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="অ্যাডমিন পিন দিন..."
                autoFocus
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {pinError && (
                <p className="text-xs text-red-600 font-medium">{pinError}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                >
                  প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal (Admin Only) */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-emerald-900">
                নতুন সংঘের খরচ যোগ করুন
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  খরচের বিবরণ
                </label>
                <input
                  type="text"
                  required
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="খরচের বিবরণ লিখুন..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  খরচের পরিমাণ (টাকা)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="যেমন: 1000"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  তারিখ
                </label>
                <input
                  type="text"
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  placeholder="যেমন: ২৪ নভেম্বর, ২০২৬"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {submitMessage && (
                <p
                  className={`text-xs font-semibold ${
                    submitMessage.includes('সফল')
                      ? 'text-emerald-700'
                      : 'text-red-600'
                  }`}
                >
                  {submitMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}