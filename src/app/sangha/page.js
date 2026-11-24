'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Loader from '@/components/Loader';

const ADMIN_PIN = '0000';
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1FkY0Kq9EI7Xbepcjq9zlZGC2vqhANNAGFiz1MBxy0-4/export?format=csv';
const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1FkY0Kq9EI7Xbepcjq9zlZGC2vqhANNAGFiz1MBxy0-4/edit?usp=sharing';

const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const years = Array.from({ length: 26 }, (_, i) => 2025 + i);

const normalizeBn = (str) =>
  String(str || '').normalize('NFC').toLowerCase().trim();

const toNumber = (str) => {
  if (!str) return 0;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const en = String(str)
    .replace(/[০-৯]/g, (d) => bn.indexOf(d))
    .replace(/,/g, '')
    .trim();
  return Number(en) || 0;
};

const normalizeMonth = (str) => {
  const m = normalizeBn(str);
  if (m === 'অগাস্ট' || m === 'আগস্ট') return 'আগস্ট';
  if (m === 'জানুয়ারী' || m === 'জানুয়ারি') return 'জানুয়ারি';
  if (m === 'ফেব্রুয়ারী' || m === 'ফেব্রুয়ারি') return 'ফেব্রুয়ারি';
  return m;
};

const isPaidStatus = (status) => {
  const s = normalizeBn(status);
  return s === 'প' || s.includes('পরিশোধ') || s === '50' || s === '৫০';
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
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== '')) rows.push(row);
  }
  return rows;
};

export default function SanghaPage() {
  const currentMonthName = months[new Date().getMonth()];
  const currentYearNumber = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYearNumber);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [dueCopied, setDueCopied] = useState(false);

  const fetchGoogleSheetData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Sheet fetch failed');
      const csvText = await response.text();

      const rows = parseCSV(csvText);
      const parsedRecords = [];

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length >= 4 && cols[0]) {
          parsedRecords.push({
            id: i,
            name: cols[0],
            month: cols[1] || currentMonthName,
            year: toNumber(cols[2]) || currentYearNumber,
            status: cols[3] || 'ব',
          });
        }
      }

      setRecords(parsedRecords);
      try {
        localStorage.setItem('nmp_cache_sangha', JSON.stringify(parsedRecords));
      } catch {}
    } catch (error) {
      console.error('গুগল শিট লোড করতে সমস্যা হয়েছে:', error);
      if (!silent) setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('nmp_is_admin') === 'true') {
      setIsAdmin(true);
    }

    let hasCache = false;
    try {
      const cached = localStorage.getItem('nmp_cache_sangha');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
          setIsLoading(false);
          hasCache = true;
        }
      }
    } catch {}

    fetchGoogleSheetData(hasCache);
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

  const currentMonthRecords = records.filter(
    (r) => normalizeMonth(r.month) === normalizeMonth(selectedMonth) && Number(r.year) === Number(selectedYear)
  );

  const paidCount = currentMonthRecords.filter((r) => isPaidStatus(r.status)).length;
  const dueCount = currentMonthRecords.length - paidCount;

  const filteredRecords = currentMonthRecords.filter((r) =>
    normalizeBn(r.name).includes(normalizeBn(searchQuery))
  );

  const handleCopyDueList = async () => {
    const dueMembers = currentMonthRecords.filter((r) => !isPaidStatus(r.status));
    if (dueMembers.length === 0) {
      alert('এই মাসে কোনো বকেয়া নেই!');
      return;
    }

    const lines = dueMembers.map((m, idx) => `${idx + 1}. ${m.name}`);
    const text =
      `📌 *নবজাগরণ একতা সংঘ — বকেয়া তালিকা*\n` +
      `মাস: ${selectedMonth} ${selectedYear}\n\n` +
      lines.join('\n') +
      `\n\nমোট বাকি: ${dueMembers.length} জন (${dueMembers.length * 50} ৳)`;

    try {
      await navigator.clipboard.writeText(text);
      setDueCopied(true);
      setTimeout(() => setDueCopied(false), 2000);
    } catch {
      alert('কপি করা যায়নি।');
    }
  };

  const memberYearRecords = selectedMember
    ? months.map((m) => {
        const found = records.find(
          (r) =>
            r.name === selectedMember &&
            normalizeMonth(r.month) === normalizeMonth(m) &&
            Number(r.year) === Number(selectedYear)
        );
        return {
          month: m,
          status: found ? (isPaidStatus(found.status) ? 'paid' : 'due') : 'none',
        };
      })
    : [];

  const memberPaidMonths = memberYearRecords.filter((x) => x.status === 'paid').length;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* টপ বার */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm">
            ← হোমে ফিরে যান
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/sangha/expenses"
              className="text-xs bg-white hover:bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <span>🧾</span> সংঘের খরচ
            </Link>

            {isAdmin ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyDueList}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  {dueCopied ? '✓ কপি হয়েছে!' : '📋 বকেয়া কপি'}
                </button>
                <a
                  href={GOOGLE_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে চাঁদা এডিট করুন
                </a>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-full font-medium cursor-pointer"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition cursor-pointer"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={() => fetchGoogleSheetData(false)}
              disabled={isLoading}
              title="নতুন ডাটা লোড করতে ক্লিক করুন"
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার (লোগো সহ) */}
        <div className="bg-red-700 text-white p-5 sm:p-6 rounded-2xl shadow-md mb-8 flex items-center gap-4">
          <img
            src="/logo.png"
            alt="নবজাগরণ একতা সংঘ লোগো"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-md object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-800 text-amber-200 text-xs px-2.5 py-1 rounded font-bold">আমাদের সংগঠন</span>
              <span className="bg-green-500/80 text-white text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ গুগল শিট
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold mt-2">নবজাগরণ একতা সংঘ</h1>
            <p className="text-red-100 text-xs sm:text-sm mt-1">
              নবীন মহাজন পাড়ার সকল পূজা ও সামাজিক উন্নয়নমূলক কাজ এই সংগঠনের মাধ্যমেই পরিচালিত হয়।
            </p>
          </div>
        </div>

        {/* চাঁদার হিসাব ও তালিকা */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-bold text-gray-800">💳 মাসিক চাঁদা ট্র্যাকার (৫০ ৳)</h2>
              <p className="text-xs text-gray-500">
                মাস ও বছর নির্বাচন করে চাঁদা আদায়ের লাইভ হিসাব দেখুন (যেকোনো নামে ট্যাপ করলে ১২ মাসের হিসাব দেখাবে)।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
              <div className="text-xs text-green-700 font-semibold">{selectedMonth} {selectedYear} আদায়</div>
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
              placeholder="সদস্যের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm border border-gray-300 rounded-xl outline-none focus:border-red-600 bg-gray-50 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                title="সার্চ ক্লিয়ার করুন"
              >
                ✕
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <Loader text="হিসাব লোড হচ্ছে..." />
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে।
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
                          ? `"${searchQuery}" নামে কাউকে পাওয়া যায়নি।`
                          : `${selectedMonth} ${selectedYear}-এর জন্য গুগল শিটে কোনো রেকর্ড নেই।`}
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((member, index) => {
                      const isPaid = isPaidStatus(member.status);

                      return (
                        <tr
                          key={member.id}
                          onClick={() => setSelectedMember(member.name)}
                          className="even:bg-orange-100/50 hover:bg-orange-100 transition-colors cursor-pointer"
                        >
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
                              {isPaid ? '✓ ৫০ ৳ পরিশোধিত' : '✕ বকেয়া'}
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

      {/* সদস্যের ১২ মাসের হিসাব মডাল */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-orange-100"
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">{selectedMember}</h3>
                <p className="text-xs text-gray-500">{selectedYear} সালের ১২ মাসের চাঁদার হিসাব</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4">
              {memberYearRecords.map((item) => (
                <div
                  key={item.month}
                  className={`p-2 rounded-xl border text-center text-xs font-semibold ${
                    item.status === 'paid'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : item.status === 'due'
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <div>{item.month}</div>
                  <div className="text-[11px] mt-0.5 font-bold">
                    {item.status === 'paid' ? '✓ ৫০ ৳' : item.status === 'due' ? '✕ বকেয়া' : '—'}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center text-xs font-bold text-amber-900">
              {selectedYear} সালে মোট পরিশোধ: {memberPaidMonths} মাস ({memberPaidMonths * 50} ৳)
            </div>
          </div>
        </div>
      )}

      {/* অ্যাডমিন পিন মডাল */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">অ্যাডমিন প্রবেশ</h3>
            <p className="text-xs text-gray-500 mb-4">গুগল শিট খুলতে ৪ ডিজিটের পিন লিখুন।</p>
            
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                inputMode="numeric"
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
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg cursor-pointer"
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