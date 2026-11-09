'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// ৪৬ জনের মূল তালিকা
const baseDonors = [
  { name: 'জিকু দে', pledged: 1000 },
  { name: 'নবীন সমিতি', pledged: 1000 },
  { name: 'সুশান্ত দে', pledged: 650 },
  { name: 'রকি কান্তি দে', pledged: 501 },
  { name: 'সুজিত দে', pledged: 500 },
  { name: 'শুভ দে', pledged: 500 },
  { name: 'অনাথ দে', pledged: 500 },
  { name: 'রকি দেব', pledged: 500 },
  { name: 'মিন্টু দে', pledged: 500 },
  { name: 'প্রবীর দে', pledged: 500 },
  { name: 'কিরণ দে', pledged: 500 },
  { name: 'উজ্জ্বল দে', pledged: 500 },
  { name: 'গত বছর টাকা', pledged: 500 },
  { name: 'দিপক দে', pledged: 500 },
  { name: 'বিশাল দে', pledged: 500 },
  { name: 'অজয় দে', pledged: 500 },
  { name: 'সুমন দে', pledged: 500 },
  { name: 'রিপন দে', pledged: 500 },
  { name: 'রানা দে', pledged: 500 },
  { name: 'তরুণ দে বাপ্পা', pledged: 401 },
  { name: 'জয় দে', pledged: 400 },
  { name: 'সুভাষ দে', pledged: 400 },
  { name: 'শম্ভু দে', pledged: 400 },
  { name: 'লিটন সেন', pledged: 400 },
  { name: 'রনি সেন', pledged: 351 },
  { name: 'সুব্রত দে', pledged: 301 },
  { name: 'রাজু দে', pledged: 301 },
  { name: 'হৃদয় দে', pledged: 300 },
  { name: 'নয়ন দে', pledged: 300 },
  { name: 'বাসু রঞ্জন দে', pledged: 300 },
  { name: 'প্রদীপ দে', pledged: 300 },
  { name: 'নির্ণয় সেন', pledged: 300 },
  { name: 'মিশু দে', pledged: 300 },
  { name: 'রাসেল দে', pledged: 300 },
  { name: 'দুর্জয় সেন', pledged: 300 },
  { name: 'অমল দে', pledged: 300 },
  { name: 'শিবু দে', pledged: 200 },
  { name: 'নিরুপমা দে', pledged: 200 },
  { name: 'বিটুল সেন', pledged: 200 },
  { name: 'বিপুল দে', pledged: 200 },
  { name: 'সৈকত সেন', pledged: 200 },
  { name: 'সমর দে', pledged: 150 },
  { name: 'হেমলতা দে', pledged: 100 },
  { name: 'নিলু দে', pledged: 100 },
  { name: 'কমল দে', pledged: 0 },
  { name: 'বিমল দে', pledged: 0 },
];

export default function PronamiPage() {
  const ADMIN_PIN = '0000';

  const pujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন'];
  const years = Array.from({ length: 12 }, (_, i) => 2025 + i);

  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');
  const [selectedYear, setSelectedYear] = useState(2025);

  // সার্চ স্টেট
  const [searchQuery, setSearchQuery] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  const defaultRecords = [
    ...baseDonors.map((d, idx) => ({
      id: `2025-${idx + 1}`,
      name: d.name,
      puja: 'কার্তিক পূজা',
      year: 2025,
      pledged: d.pledged,
      paid: d.pledged,
    })),
    ...baseDonors.map((d, idx) => ({
      id: `2026-${idx + 1}`,
      name: d.name,
      puja: 'কার্তিক পূজা',
      year: 2026,
      pledged: d.pledged,
      paid: 0,
    })),
  ];

  const [records, setRecords] = useState(defaultRecords);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [donorName, setDonorName] = useState('');
  const [pledgedAmount, setPledgedAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editPledgedInput, setEditPledgedInput] = useState('');
  const [editPaidInput, setEditPaidInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('puja_pronami_records_v3');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    localStorage.setItem('puja_pronami_records_v3', JSON.stringify(newRecords));
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('ভুল পিন কোড! আবার চেষ্টা করুন।');
    }
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    const newRecord = {
      id: Date.now(),
      name: donorName.trim(),
      puja: selectedPuja,
      year: selectedYear,
      pledged: Number(pledgedAmount) || 0,
      paid: Number(paidAmount) || 0,
    };

    const updated = [...records, newRecord];
    saveRecords(updated);
    setDonorName('');
    setPledgedAmount('');
    setPaidAmount('');
    setShowAddForm(false);
  };

  const startEditing = (record) => {
    setEditingId(record.id);
    setEditPledgedInput(record.pledged);
    setEditPaidInput(record.paid);
  };

  const handleUpdateRecord = (id) => {
    if (!isAdmin) return;
    const updated = records.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          pledged: Number(editPledgedInput),
          paid: Number(editPaidInput),
        };
      }
      return r;
    });
    saveRecords(updated);
    setEditingId(null);
  };

  const handleDeleteRecord = (id) => {
    if (!isAdmin) return;
    if (confirm('আপনি কি এই এন্ট্রিটি মুছে ফেলতে চান?')) {
      const updated = records.filter((r) => r.id !== id);
      saveRecords(updated);
    }
  };

  // নির্বাচিত পূজা ও বছরের সম্পূর্ণ হিসাব
  const allYearRecords = records.filter(
    (r) => r.puja === selectedPuja && r.year === selectedYear
  );

  const totalPledged = allYearRecords.reduce((sum, r) => sum + r.pledged, 0);
  const totalPaid = allYearRecords.reduce((sum, r) => sum + r.paid, 0);
  const totalDue = totalPledged - totalPaid;

  // সার্চ অনুযায়ী ফিল্টার করা তালিকা
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

          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold">
                  🔓 অ্যাডমিন মোড চালু
                </span>
                <button
                  onClick={() => setIsAdmin(false)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full font-medium"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-full font-semibold shadow-sm transition flex items-center gap-1"
              >
                🔒 অ্যাডমিন লগইন
              </button>
            )}
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-amber-600 to-red-600 text-white p-6 rounded-2xl shadow-md mb-8">
          <span className="bg-amber-800/60 text-yellow-200 text-xs px-2.5 py-1 rounded font-bold">হিসাব-নিকাশ</span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">পূজার প্রণামী ও চাঁদার খাতা</h1>
          <p className="text-amber-100 text-sm mt-2">
            কে কোন পূজায় কত টাকা দিল এবং বকেয়ার স্বচ্ছ তালিকা।
          </p>
        </div>

        {/* মূল বক্স */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
          
          {/* ফিল্টার: পূজা ও বছর */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-bold text-gray-800">📋 প্রণামীর তালিকা</h2>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'আপনি অ্যাডমিন মোডে আছেন। যেকারো টাকা এডিট ও নতুন নাম যোগ করতে পারেন।' : 'সাধারণ দর্শন মোড।'}
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

          {/* নতুন নাম যোগ করার ফর্ম (অ্যাডমিন) */}
          {isAdmin && (
            <div className="mb-6">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  + নতুন নাম যোগ করুন ({selectedPuja})
                </button>
              ) : (
                <form onSubmit={handleAddRecord} className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                  <div className="font-bold text-xs text-amber-800">
                    {selectedPuja} ({selectedYear}) এর জন্য নতুন এন্ট্রি:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="সদস্য / দাতার নাম..."
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="p-2 text-sm border border-gray-300 rounded-lg outline-none bg-white"
                      autoFocus
                    />
                    <input
                      type="number"
                      placeholder="ধার্য টাকা (৳)"
                      value={pledgedAmount}
                      onChange={(e) => setPledgedAmount(e.target.value)}
                      className="p-2 text-sm border border-gray-300 rounded-lg outline-none bg-white"
                    />
                    <input
                      type="number"
                      placeholder="কত টাকা দিয়েছে (৳)"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="p-2 text-sm border border-gray-300 rounded-lg outline-none bg-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-lg"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-1.5 rounded-lg font-medium"
                    >
                      যোগ করুন
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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

          {/* তালিকা টেবিল */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">নাম</th>
                  <th className="py-2.5 px-3 text-right">ধার্য টাকা</th>
                  <th className="py-2.5 px-3 text-right">দিয়েছে</th>
                  <th className="py-2.5 px-3 text-right">বকেয়া</th>
                  <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                  {isAdmin && <th className="py-2.5 px-3 text-center">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-gray-400 text-sm">
                      {searchQuery
                        ? `"${searchQuery}" নামে কাউকে পাওয়া যায়নি।`
                        : `${selectedPuja} (${selectedYear}) তে কোনো এন্ট্রি নেই।`}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r, index) => {
                    const isEditing = editingId === r.id;
                    const due = isEditing
                      ? Number(editPledgedInput) - Number(editPaidInput)
                      : r.pledged - r.paid;

                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 text-center text-gray-400 text-xs">{index + 1}</td>
                        <td className="py-3 px-3 font-semibold text-gray-800">{r.name}</td>
                        
                        {/* ধার্য টাকা */}
                        <td className="py-3 px-3 text-right font-medium text-gray-600">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPledgedInput}
                              onChange={(e) => setEditPledgedInput(e.target.value)}
                              className="w-20 p-1 text-xs border border-amber-500 rounded outline-none text-right font-bold"
                              placeholder="ধার্য"
                              autoFocus
                            />
                          ) : (
                            r.pledged > 0 ? `${r.pledged} ৳` : '—'
                          )}
                        </td>

                        {/* দিয়েছে টাকা */}
                        <td className="py-3 px-3 text-right font-bold text-green-700">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPaidInput}
                              onChange={(e) => setEditPaidInput(e.target.value)}
                              className="w-20 p-1 text-xs border border-green-500 rounded outline-none text-right font-bold"
                              placeholder="দিয়েছে"
                            />
                          ) : (
                            `${r.paid} ৳`
                          )}
                        </td>

                        {/* বকেয়া */}
                        <td className="py-3 px-3 text-right font-bold text-red-600">
                          {due > 0 ? `${due} ৳` : '০ ৳'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {due <= 0 && (isEditing ? Number(editPledgedInput) : r.pledged) > 0 ? (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                              ✓ পরিশোধিত
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                              {(isEditing ? Number(editPaidInput) : r.paid) > 0 ? `বাকি ${due} ৳` : '✕ বকেয়া'}
                            </span>
                          )}
                        </td>

                        {/* অ্যাকশন বাটন */}
                        {isAdmin && (
                          <td className="py-3 px-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleUpdateRecord(r.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-2 py-1 rounded shadow-sm"
                                  title="সেভ করুন"
                                >
                                  ✓ সেভ
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded"
                                  title="বাতিল করুন"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => startEditing(r)}
                                  title="টাকা এডিট করুন"
                                  className="text-amber-700 hover:text-amber-900 text-xs font-semibold"
                                >
                                  ✏️ এডিট
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(r.id)}
                                  title="মুছে ফেলুন"
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* অ্যাডমিন পিন কোড ইনপুট মডাল */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">অ্যাডমিন প্রবেশ</h3>
            <p className="text-xs text-gray-500 mb-4">হিসাব পরিবর্তন বা নতুন নাম যোগ করতে ৪ ডিজিটের পিন লিখুন।</p>
            
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