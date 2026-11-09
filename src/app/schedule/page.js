'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function SchedulePage() {
  const ADMIN_PIN = '0000';

  // তোমার সময়সূচীর গুগল শিট লিংক
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1SjJ-aX9FCOVaydDqCyOzZSK9OR5TbWpsAmKfjQ-ptxg/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1SjJ-aX9FCOVaydDqCyOzZSK9OR5TbWpsAmKfjQ-ptxg/edit?usp=sharing';

  const pujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন'];
  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');
  const [searchQuery, setSearchQuery] = useState('');

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // ডাটা ও লোডিং স্টেট
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // গুগল শিট থেকে সময়সূচী ডাটা লোড
  const fetchScheduleData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      const csvText = await response.text();

      const lines = csvText.trim().split(/\r?\n/);
      const parsedSchedules = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
          val.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );

        if (cols.length >= 4 && cols[0]) {
          parsedSchedules.push({
            id: i,
            event: cols[0],
            date: cols[1] || 'নির্ধারিত দিন',
            time: cols[2] || 'নির্ধারিত সময়',
            puja: cols[3] || 'কার্তিক পূজা',
          });
        }
      }

      setSchedules(parsedSchedules);
    } catch (error) {
      console.error('সময়সূচী লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
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

  // নির্বাচিত পূজা অনুযায়ী ফিল্টার
  const currentPujaSchedules = schedules.filter((item) => item.puja === selectedPuja);

  // সার্চ ফিল্টার
  const filteredSchedules = currentPujaSchedules.filter((item) =>
    item.event.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    item.date.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    item.time.toLowerCase().includes(searchQuery.toLowerCase().trim())
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
            {/* অ্যাডমিন এডিট বাটন */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <a
                  href={GOOGLE_SHEET_EDIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে সময় এডিট করুন
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
                className="text-xs text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            {/* রিফ্রেশ বাটন */}
            <button
              onClick={fetchScheduleData}
              disabled={isLoading}
              title="নতুন সময়সূচী লোড করতে ক্লিক করুন"
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-red-700 to-amber-600 text-white p-6 rounded-2xl shadow-md mb-8">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-yellow-100 text-xs px-2.5 py-1 rounded font-bold">পূজার নির্ঘণ্ট</span>
            <span className="bg-green-500/80 text-white text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> লাইভ গুগল শিট
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">পূজার সময়সূচী ও কার্যক্রম</h1>
          <p className="text-red-100 text-sm mt-2">
            গুগল শিট থেকে স্বয়ংক্রিয়ভাবে লাইভ সময়সূচী দেখানো হচ্ছে।
          </p>
        </div>

        {/* বিশেষ নোটিশ বক্স */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-start gap-3">
          <span className="text-2xl">📢</span>
          <div>
            <h3 className="font-bold text-amber-900 text-sm">সাধারণ অবগতি ও অনুরোধ:</h3>
            <p className="text-xs text-amber-800 mt-0.5">
              সকল ভক্তবৃন্দ ও পাড়াবাসীকে যথাসময়ে উপস্থিত হয়ে পুষ্পাঞ্জলি প্রদান ও মহাপ্রসাদ গ্রহণ করার জন্য বিনীত অনুরোধ জানানো হচ্ছে।
            </p>
          </div>
        </div>

        {/* পূজা সিলেক্ট করার ট্যাব বাটনসমূহ */}
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
              <span>📅</span> {selectedPuja}র সময়সূচী
            </h2>
            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-full">
              {currentPujaSchedules.length} টি কার্যক্রম
            </span>
          </div>

          {/* 🔍 সার্চ বার */}
          <div className="relative mb-5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="কার্যক্রম বা সময় দিয়ে খুঁজুন (যেমন: অঞ্জলি, আরতি, সকাল)..."
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

          {/* সময়সূচী কার্ড লিস্ট */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <span className="text-2xl animate-spin">⏳</span>
                <span>গুগল শিট থেকে সময়সূচী লোড হচ্ছে...</span>
              </div>
            ) : isError ? (
              <div className="py-8 text-center text-red-600 text-sm">
                গুগল শিট লোড করতে সমস্যা হয়েছে। শিটটির শেয়ারিং পারমিশন 'Anyone with the link' আছে কি না চেক করুন।
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