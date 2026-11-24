'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Loader from '@/components/Loader';

const normalizeBn = (str) =>
  String(str || '').normalize('NFC').toLowerCase().trim();

const normalizePuja = (str) =>
  String(str || '')
    .normalize('NFC')
    .replace(/শ্রী\s*শ্রী/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const toBnDigits = (str) =>
  String(str).replace(/\d/g, (d) => ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][d]);

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
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== '')) rows.push(row);
  }
  return rows;
};

export default function SchedulePage() {
  const ADMIN_PIN = '0000';

  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1SjJ-aX9FCOVaydDqCyOzZSK9OR5TbWpsAmKfjQ-ptxg/gviz/tq?tqx=out:csv';
  const YEARLY_SCHEDULE_CSV_URL = 'https://docs.google.com/spreadsheets/d/1SjJ-aX9FCOVaydDqCyOzZSK9OR5TbWpsAmKfjQ-ptxg/gviz/tq?tqx=out:csv&gid=303533417';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1SjJ-aX9FCOVaydDqCyOzZSK9OR5TbWpsAmKfjQ-ptxg/edit?usp=sharing';
  const UPCOMING_CSV_URL = 'https://docs.google.com/spreadsheets/d/1MfcYYDbAsRddIz5zszFvcT9EzIX-8QZ8KTs8doOyW1Q/gviz/tq?tqx=out:csv';

  const defaultPujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন', 'শীতলা পূজা'];
  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');
  const [searchQuery, setSearchQuery] = useState('');

  const [showMantraModal, setShowMantraModal] = useState(false);
  const [activeMantraKey, setActiveMantraKey] = useState('');
  const [mantras, setMantras] = useState([]);

  const [showYearlyModal, setShowYearlyModal] = useState(false);
  const [yearlyDates, setYearlyDates] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchScheduleData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [response, upcomingRes, yearlyRes] = await Promise.all([
        fetch(`${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`${UPCOMING_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }).catch(() => null),
        fetch(`${YEARLY_SCHEDULE_CSV_URL}&t=${Date.now()}`, { cache: 'no-store' }).catch(() => null),
      ]);

      let upcomingPujaName = '';
      if (upcomingRes && upcomingRes.ok) {
        const upText = await upcomingRes.text();
        const upRows = parseCSV(upText);
        if (upRows.length >= 2 && upRows[1][0]) {
          upcomingPujaName = upRows[1][0];
        }
      }

      if (yearlyRes && yearlyRes.ok) {
        const yrText = await yearlyRes.text();
        const yrRows = parseCSV(yrText);
        const parsedYearly = [];
        const parsedMantras = [];

        for (let i = 1; i < yrRows.length; i++) {
          const cols = yrRows[i];
          if (!cols[0]) continue;

          parsedYearly.push({
            id: i,
            name: cols[0],
            banglaDate: cols[1] || '',
            englishDate: cols[2] || '',
          });

          if (cols[3] || cols[4]) {
            parsedMantras.push({
              key: cols[0],
              label: cols[0],
              pushpanjali: cols[3] || '',
              pranam: cols[4] || '',
            });
          }
        }
        setYearlyDates(parsedYearly);
        setMantras(parsedMantras);
      }

      const csvText = await response.text();
      const rows = parseCSV(csvText);
      const parsedSchedules = [];

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length >= 4 && cols[0]) {
          parsedSchedules.push({
            id: i,
            event: cols[0],
            date: cols[1] || 'নির্ধারিত দিন',
            time: cols[2] || 'নির্ধারিত সময়',
            puja: cols[3] || 'কার্তিক পূজা',
          });
        }
      }

      setSchedules(parsedSchedules);

      if (upcomingPujaName) {
        const allPujas = Array.from(
          new Set([...defaultPujas, ...parsedSchedules.map((s) => s.puja).filter(Boolean)])
        );
        const normUp = normalizePuja(upcomingPujaName);
        const matchedPuja =
          allPujas.find((p) => normalizePuja(p) === normUp) ||
          allPujas.find((p) => normUp.includes(normalizePuja(p)) || normalizePuja(p).includes(normUp));
        if (matchedPuja) setSelectedPuja(matchedPuja);
      }
    } catch (error) {
      console.error('সময়সূচী লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('nmp_is_admin') === 'true') {
      setIsAdmin(true);
    }
    fetchScheduleData();
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

  const openMantraModal = () => {
    const matched = mantras.find(
      (m) => normalizePuja(m.key) === normalizePuja(selectedPuja)
    );
    setActiveMantraKey(matched ? matched.key : mantras[0]?.key || '');
    setShowMantraModal(true);
  };

  const activeMantra =
    mantras.find((m) => m.key === activeMantraKey) || mantras[0] || null;

  const detectedYear = yearlyDates
    .map((y) => `${y.englishDate} ${y.banglaDate}`.match(/(20\d{2}|২০\d{2})/)?.[0])
    .find(Boolean);

  const yearlyTitle = detectedYear
    ? `${toBnDigits(detectedYear)} পূজার সূচি`
    : 'বাৎসরিক পূজার সূচি';

  const pujas = Array.from(
    new Set([...defaultPujas, ...schedules.map((s) => s.puja).filter(Boolean)])
  );

  const currentPujaSchedules = schedules.filter(
    (item) => normalizePuja(item.puja) === normalizePuja(selectedPuja)
  );

  const filteredSchedules = currentPujaSchedules.filter(
    (item) =>
      normalizeBn(item.event).includes(normalizeBn(searchQuery)) ||
      normalizeBn(item.date).includes(normalizeBn(searchQuery)) ||
      normalizeBn(item.time).includes(normalizeBn(searchQuery))
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-50 text-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {/* টপ বার */}
        <div className="flex justify-between items-center gap-2 mb-6">
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
                  <span>📊</span> শিটে সময় এডিট করুন
                </a>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-full"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchScheduleData}
              disabled={isLoading}
              title="নতুন সময়সূচী লোড করতে ক্লিক করুন"
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* ২টি স্কয়ার বাটন বক্স (হালকা লাল ও সোনালী আভাসহ) */}
        <div className="max-w-md sm:max-w-lg mx-auto grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setShowYearlyModal(true)}
            className="bg-gradient-to-br from-white via-red-50/50 to-red-100/60 border border-red-200 border-t-4 border-t-red-600 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 p-4 sm:p-6 aspect-square flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <span className="text-[11px] bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-md mb-2">
              বাৎসরিক তালিকা
            </span>
            <h3 className="text-sm sm:text-lg font-extrabold text-red-700 leading-snug">
              {yearlyTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
              সারা বছরের পূজার সম্ভাব্য তারিখ
            </p>
            <span className="mt-3 text-xs font-bold text-red-600">
              দেখুন →
            </span>
          </button>

          <button
            type="button"
            onClick={openMantraModal}
            className="bg-gradient-to-br from-white via-amber-50/60 to-amber-100/70 border border-amber-200 border-t-4 border-t-amber-500 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 p-4 sm:p-6 aspect-square flex flex-col items-center justify-center text-center cursor-pointer"
          >
            <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md mb-2">
              পূজার মন্ত্র
            </span>
            <h3 className="text-sm sm:text-lg font-extrabold text-amber-700 leading-snug">
              অঞ্জলি ও প্রণাম মন্ত্র
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5 leading-relaxed">
              সকল পূজার পুষ্পাঞ্জলি ও প্রণাম
            </p>
            <span className="mt-3 text-xs font-bold text-amber-600">
              পড়ুন →
            </span>
          </button>
        </div>

        {/* পূজা সিলেক্ট করার ট্যাব */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
          {pujas.map((puja) => {
            const isActive = selectedPuja === puja;
            return (
              <button
                key={puja}
                onClick={() => setSelectedPuja(puja)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm ${
                  isActive
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {puja}
              </button>
            );
          })}
        </div>

        {/* মূল বক্স */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 md:p-6">
          <div className="border-b pb-3 mb-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📅</span> {selectedPuja}র সময়সূচী
            </h2>
            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-full">
              {currentPujaSchedules.length} টি কার্যক্রম
            </span>
          </div>

          {/* সার্চ বার */}
          <div className="relative mb-5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="কার্যক্রম বা সময় দিয়ে খুঁজুন..."
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

          {/* সময়সূচী কার্ড লিস্ট */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <Loader />
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে।
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                {searchQuery
                  ? `"${searchQuery}" এর সাথে কোনো কার্যক্রম মিলছে না।`
                  : `${selectedPuja}র জন্য গুগল শিটে কোনো কার্যক্রম যুক্ত নেই।`}
              </div>
            ) : (
              filteredSchedules.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-xl border border-gray-200/70 transition gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-700 font-bold rounded-full text-xs shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm md:text-base text-gray-800">{item.event}</h4>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                  </div>

                  <div className="sm:self-center self-end">
                    <span className="inline-block bg-white border border-red-200 text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-2xs">
                      ⏰ {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* বাৎসরিক পূজার সূচি মডাল */}
      {showYearlyModal && (
        <div
          onClick={() => setShowYearlyModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-amber-200"
          >
            <div className="bg-gradient-to-r from-red-700 to-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold">{yearlyTitle}</h3>
                <p className="text-[11px] sm:text-xs text-amber-100">বাৎসরিক পূজা ও অনুষ্ঠানের আনুমানিক তারিখ</p>
              </div>
              <button
                onClick={() => setShowYearlyModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {yearlyDates.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-6">
                  তথ্য লোড হচ্ছে অথবা শিটে কোনো তথ্য নেই।
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {yearlyDates.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                        {item.banglaDate && (
                          <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                            {item.banglaDate}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-red-700 bg-white border border-red-200 px-2.5 py-1 rounded-lg text-right shrink-0">
                        {item.englishDate}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-4 text-[11px] text-gray-500 text-center">
                পঞ্জিকা ও তিথি অনুযায়ী তারিখ পরিবর্তন হতে পারে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* পুষ্পাঞ্জলি ও প্রণাম মন্ত্র মডাল (গুগল শিট থেকে লোড হবে) */}
      {showMantraModal && (
        <div
          onClick={() => setShowMantraModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-200"
          >
            <div className="bg-gradient-to-r from-red-700 to-amber-600 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold">পুষ্পাঞ্জলি ও প্রণাম মন্ত্র</h3>
                <p className="text-[11px] sm:text-xs text-amber-100">অঞ্জলি দেওয়ার সময় ফোনে দেখে পড়ুন</p>
              </div>
              <button
                onClick={() => setShowMantraModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {!activeMantra ? (
                <p className="text-center text-sm text-gray-500 py-6">
                  শিটে এখনো কোনো মন্ত্র যুক্ত করা হয়নি।
                </p>
              ) : (
                <>
                  {/* পূজা বাছাই ট্যাব */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
                    {mantras.map((m) => (
                      <button
                        key={m.key}
                        onClick={() => setActiveMantraKey(m.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                          activeMantraKey === m.key
                            ? 'bg-red-700 text-white shadow-sm'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {activeMantra.pushpanjali && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5">
                        <h4 className="text-xs font-bold text-red-700 mb-1.5">পুষ্পাঞ্জলি মন্ত্র:</h4>
                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                          {activeMantra.pushpanjali}
                        </p>
                      </div>
                    )}

                    {activeMantra.pranam && (
                      <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3.5">
                        <h4 className="text-xs font-bold text-amber-800 mb-1.5">প্রণাম মন্ত্র:</h4>
                        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                          {activeMantra.pranam}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
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