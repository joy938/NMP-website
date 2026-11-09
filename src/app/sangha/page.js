'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// নবজাগরণ একতা সংঘের ৫২ জন সদস্যের তালিকা
const memberNames = [
  'প্রদ্যুত কান্তি দে', 'নিলয় সেন', 'নির্ণয় সেন', 'সৌরভ দে', 'বিপক দে', 
  'সুশান্ত দে', 'অনিক দে', 'জয় দে', 'বিশাল দে', 'অন্তু দে', 
  'দীপ্ত দে', 'শেখর দে', 'রাসেল দে', 'মনু', 'দিপক দে', 
  'শঙ্কর দে', 'সজল দে', 'রনি সেন', 'বিপুল দে', 'মাইকেল দে', 
  'নয়ন দে', 'তরুণ দে', 'রাজীব দে', 'মিশু দে', 'বাবু দে', 
  'ঋতম দে', 'রকি কান্তি দে', 'সমর দে', 'অন্তর দে', 'সুব্রত দে', 
  'রিশু কান্তি দে', 'প্রবাল দে', 'সতীর্থ সেন', 'পল্লব দে', 'অরুপ দে', 
  'অজয় দে', 'সৈকত সেন', 'পবন দে', 'ইমন শীল', 'রিপন কান্তি দে', 
  'নয়ন সেন', 'প্রবীর কান্তি দে', 'নোবেল দে', 'মিন্টু দে', 'হৃদয় দে', 
  'শুভ দে', 'শাপলা দে', 'রঞ্জন দে', 'নীলকমল দে', 'নিপ্পন দে', 
  'দুর্জয় সেন', 'রুবেল কান্তি দে'
];

export default function SanghaPage() {
  const ADMIN_PIN = '0000';

  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'অগাস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const years = Array.from({ length: 12 }, (_, i) => 2025 + i);

  const [selectedMonth, setSelectedMonth] = useState('নভেম্বর');
  const [selectedYear, setSelectedYear] = useState(2026);

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  // ৫২ জন সদস্যের ডিফল্ট তালিকা তৈরি
  const defaultMembers = memberNames.map((name, index) => ({
    id: index + 1,
    name: name,
    paidRecords: [],
  }));

  const [members, setMembers] = useState(defaultMembers);
  const [newMemberName, setNewMemberName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sangha_members_v2');
    if (saved) {
      try {
        setMembers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveMembers = (newMembers) => {
    setMembers(newMembers);
    localStorage.setItem('sangha_members_v2', JSON.stringify(newMembers));
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

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember = {
      id: Date.now(),
      name: newMemberName.trim(),
      paidRecords: [],
    };

    const updated = [...members, newMember];
    saveMembers(updated);
    setNewMemberName('');
    setShowAddForm(false);
  };

  const togglePayment = (memberId) => {
    if (!isAdmin) {
      alert('এটি পরিবর্তন করার ক্ষমতা শুধুমাত্র অ্যাডমিনের আছে। আগে লগইন করুন!');
      return;
    }

    const currentKey = `${selectedMonth}-${selectedYear}`;
    const updated = members.map((m) => {
      if (m.id === memberId) {
        const isPaid = m.paidRecords.includes(currentKey);
        const newPaidRecords = isPaid
          ? m.paidRecords.filter((k) => k !== currentKey)
          : [...m.paidRecords, currentKey];
        return { ...m, paidRecords: newPaidRecords };
      }
      return m;
    });
    saveMembers(updated);
  };

  const currentKey = `${selectedMonth}-${selectedYear}`;
  const paidCount = members.filter((m) => m.paidRecords.includes(currentKey)).length;
  const dueCount = members.length - paidCount;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* টপ বার */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-800 font-medium text-sm">
            ← হোমে ফিরে যান
          </Link>

          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
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
                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন লগইন
              </button>
            )}
          </div>
        </div>

        {/* হেডার */}
        <div className="bg-red-700 text-white p-6 rounded-2xl shadow-md mb-8">
          <span className="bg-red-800 text-amber-200 text-xs px-2.5 py-1 rounded font-bold">আমাদের সংগঠন</span>
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
                {isAdmin ? 'আপনি অ্যাডমিন মোডে আছেন। বাটনে ক্লিক করে পরিশোধ বা বকেয়া পরিবর্তন করতে পারবেন।' : 'সাধারণ দর্শন মোড। শুধুমাত্র দেখার জন্য উন্মুক্ত।'}
              </p>
            </div>

            {/* মাস ও বছর ড্রপডাউন */}
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

          {/* স্ট্যাটাস কার্ড */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <div className="text-xs text-green-700 font-semibold">{selectedMonth} {selectedYear} আদায়</div>
              <div className="text-xl font-bold text-green-800 mt-1">{paidCount * 50} ৳</div>
              <div className="text-[11px] text-green-600">{paidCount} জন দিয়েছেন</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-xs text-red-700 font-semibold">{selectedMonth} {selectedYear} বাকি</div>
              <div className="text-xl font-bold text-red-800 mt-1">{dueCount * 50} ৳</div>
              <div className="text-[11px] text-red-600">{dueCount} জনের বাকি</div>
            </div>
          </div>

          {/* নতুন সদস্য যোগ বাটন (অ্যাডমিন) */}
          {isAdmin && (
            <div className="mb-6">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-red-700 hover:bg-red-800 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-1"
                >
                  + নতুন সদস্য যোগ করুন
                </button>
              ) : (
                <form onSubmit={handleAddMember} className="bg-gray-50 border border-red-200 p-4 rounded-xl flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    placeholder="সদস্যের নাম লিখুন..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full sm:flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-red-600"
                    autoFocus
                  />
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="submit"
                      className="bg-red-700 hover:bg-red-800 text-white text-sm px-4 py-2 rounded-lg font-medium"
                    >
                      যোগ করুন
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddForm(false); setNewMemberName(''); }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-2 rounded-lg"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* সদস্যদের তালিকা টেবিল */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3">সদস্যের নাম</th>
                  <th className="py-2.5 px-3 text-center">{selectedMonth} {selectedYear}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member, index) => {
                  const isPaid = member.paidRecords.includes(currentKey);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 text-center text-gray-400 text-xs">{index + 1}</td>
                      <td className="py-3 px-3 font-semibold text-gray-800">{member.name}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => togglePayment(member.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                            isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-90'
                          } ${
                            isPaid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {isPaid ? '✓ ৫০ ৳ পরিশোধিত' : '✕ বকেয়া'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
            <p className="text-xs text-gray-500 mb-4">হিসাব পরিবর্তন করতে ৪ ডিজিটের পিন লিখুন।</p>
            
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