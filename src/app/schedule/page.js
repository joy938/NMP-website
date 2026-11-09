'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function SchedulePage() {
  const ADMIN_PIN = '0000';

  const pujas = ['কার্তিক পূজা', 'সরস্বতী পূজা', 'বাসন্তী পূজা', 'কীর্তন'];
  const [selectedPuja, setSelectedPuja] = useState('কার্তিক পূজা');

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  // ডিফল্ট সময়সূচী ডাটা
  const defaultScheduleData = {
    'কার্তিক পূজা': [
      { id: 1, event: 'শুভ অধিবাস ও ঘট স্থাপন', time: 'সন্ধ্যা ৬:৩০ মি.', date: 'পূজার পূর্ববর্তী দিন' },
      { id: 2, event: 'পূজারম্ভ ও চণ্ডীপাঠ', time: 'সকাল ৯:০০ টা', date: 'পূজার দিন' },
      { id: 3, event: 'পুষ্পাঞ্জলি প্রদান', time: 'সকাল ১১:৩০ মি.', date: 'পূজার দিন' },
      { id: 4, event: 'মহাপ্রসাদ বিতরণ', time: 'দুপুর ১:৩০ মি.', date: 'পূজার দিন' },
      { id: 5, event: 'সন্ধ্যা আরতি ও সাংস্কৃতিক অনুষ্ঠান', time: 'সন্ধ্যা ৭:০০ টা', date: 'পূজার দিন' },
      { id: 6, event: 'প্রতিমা বিসর্জন ও শোভাযাত্রা', time: 'বিকেল ৪:০০ টা', date: 'পরবর্তী দিন' },
    ],
    'সরস্বতী পূজা': [
      { id: 1, event: 'বাণী বন্দনা ও পূজা আরম্ভ', time: 'সকাল ৮:০০ টা', date: 'শ্রীপঞ্চমী তিথি' },
      { id: 2, event: 'পুষ্পাঞ্জলি প্রদান (প্রথম পর্ব)', time: 'সকাল ১০:০০ টা', date: 'শ্রীপঞ্চমী তিথি' },
      { id: 3, event: 'শিশুদের হাতেখড়ি অনুষ্ঠান', time: 'সকাল ১১:০০ টা', date: 'শ্রীপঞ্চমী তিথি' },
      { id: 4, event: 'ফল ও খিচুড়ি প্রসাদ বিতরণ', time: 'দুপুর ১:০০ টা', date: 'শ্রীপঞ্চমী তিথি' },
      { id: 5, event: 'সন্ধ্যা আরতি ও প্রসাদ বিতরণ', time: 'সন্ধ্যা ৬:৩০ মি.', date: 'শ্রীপঞ্চমী তিথি' },
    ],
    'বাসন্তী পূজা': [
      { id: 1, event: 'শ্রীশ্রী বাসন্তী দেবীর বোধন ও অধিবাস', time: 'সন্ধ্যা ৬:০০ টা', date: 'ষষ্ঠী তিথি' },
      { id: 2, event: 'মহাসপ্তমী বিহিত পূজা ও অঞ্জলি', time: 'সকাল ৯:৩০ মি.', date: 'সপ্তমী তিথি' },
      { id: 3, event: 'মহাষ্টমী পূজা ও কুমারী পূজা', time: 'সকাল ১০:০০ টা', date: 'অষ্টমী তিথি' },
      { id: 4, event: 'সন্ধিপূজা সমাপন', time: 'তিথির নির্ধারিত সময়ে', date: 'অষ্টমী-নবমী সন্ধিক্ষণ' },
      { id: 5, event: 'মহানবমী পূজা ও মহাপ্রসাদ', time: 'দুপুর ১২:৩০ মি.', date: 'নবমী তিথি' },
      { id: 6, event: 'বিজয়া দশমী ও প্রতিমা বিসর্জন', time: 'বিকেল ৪:৩০ মি.', date: 'দশমী তিথি' },
    ],
    'কীর্তন': [
      { id: 1, event: 'শুভ অধিবাস', time: 'সন্ধ্যা ৭:০০ টা', date: 'অধিবাস রজনী' },
      { id: 2, event: 'অষ্টপ্রহরব্যাপী হরিনাম সংকীর্তন আরম্ভ', time: 'ভোর ৫:০০ টা', date: 'প্রথম দিন' },
      { id: 3, event: 'মধ্যাহ্ন ভোগারতি ও মহাপ্রসাদ', time: 'দুপুর ১:০০ টা', date: 'প্রতিদিন' },
      { id: 4, event: 'সন্ধ্যা আরতি ও নামসুধা পরিবেশন', time: 'সন্ধ্যা ৬:৩০ মি.', date: 'প্রতিদিন' },
      { id: 5, event: 'কুঞ্জভঙ্গ ও দধিভাণ্ড ভঞ্জন', time: 'দুপুর ১২:০০ টা', date: 'সমাপনী দিন' },
      { id: 6, event: 'শান্তিজল গ্রহণ ও বিদায় পর্ব', time: 'দুপুর ২:০০ টা', date: 'সমাপনী দিন' },
    ],
  };

  const [schedules, setSchedules] = useState(defaultScheduleData);

  // এডিট স্টেট
  const [editingId, setEditingId] = useState(null);
  const [editEvent, setEditEvent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // নতুন আইটেম যোগ করার ফর্ম স্টেট
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('puja_schedule_data');
    if (saved) {
      try {
        setSchedules(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveSchedules = (newSchedules) => {
    setSchedules(newSchedules);
    localStorage.setItem('puja_schedule_data', JSON.stringify(newSchedules));
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

  // এডিট শুরু
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditEvent(item.event);
    setEditDate(item.date);
    setEditTime(item.time);
  };

  // এডিট সেভ
  const handleSaveEdit = (id) => {
    const currentList = schedules[selectedPuja] || [];
    const updatedList = currentList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          event: editEvent,
          date: editDate,
          time: editTime,
        };
      }
      return item;
    });

    const updatedSchedules = { ...schedules, [selectedPuja]: updatedList };
    saveSchedules(updatedSchedules);
    setEditingId(null);
  };

  // আইটেম মুছে ফেলা
  const handleDeleteItem = (id) => {
    if (!isAdmin) return;
    if (confirm('আপনি কি এই সময়সূচীটি মুছে ফেলতে চান?')) {
      const currentList = schedules[selectedPuja] || [];
      const updatedList = currentList.filter((item) => item.id !== id);
      const updatedSchedules = { ...schedules, [selectedPuja]: updatedList };
      saveSchedules(updatedSchedules);
    }
  };

  // নতুন সময়সূচী যোগ
  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newEvent.trim()) return;

    const currentList = schedules[selectedPuja] || [];
    const newItem = {
      id: Date.now(),
      event: newEvent.trim(),
      date: newDate.trim() || 'নির্ধারিত দিন',
      time: newTime.trim() || 'নির্ধারিত সময়',
    };

    const updatedSchedules = { ...schedules, [selectedPuja]: [...currentList, newItem] };
    saveSchedules(updatedSchedules);
    setNewEvent('');
    setNewDate('');
    setNewTime('');
    setShowAddForm(false);
  };

  const currentSchedule = schedules[selectedPuja] || [];

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
                className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন লগইন
              </button>
            )}
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-red-700 to-amber-600 text-white p-6 rounded-2xl shadow-md mb-8">
          <span className="bg-white/20 text-yellow-100 text-xs px-2.5 py-1 rounded font-bold">পূজার নির্ঘণ্ট</span>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-2">পূজার সময়সূচী ও কার্যক্রম</h1>
          <p className="text-red-100 text-sm mt-2">
            নবীন মহাজন পাড়ার সকল পূজা ও ধর্মীয় অনুষ্ঠানের দিন, তিথি ও অঞ্জলির সময়।
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
                onClick={() => { setSelectedPuja(puja); setEditingId(null); }}
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
          <div className="border-b pb-3 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📅</span> {selectedPuja}র সময়সূচী
              </h2>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'আপনি অ্যাডমিন মোডে আছেন। যেকোনো সময় ও কার্যক্রম এডিট করতে পারবেন।' : 'সাধারণ দর্শন মোড।'}
              </p>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
              >
                + নতুন কার্যক্রম যোগ
              </button>
            )}
          </div>

          {/* নতুন কার্যক্রম যোগ করার ফর্ম (অ্যাডমিন) */}
          {isAdmin && showAddForm && (
            <form onSubmit={handleAddNewItem} className="bg-red-50 border border-red-200 p-4 rounded-xl mb-5 space-y-2">
              <div className="text-xs font-bold text-red-800 mb-1">
                {selectedPuja}তে নতুন কার্যক্রম যোগ করুন:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="কার্যক্রমের নাম (যেমন: পুষ্পাঞ্জলি)..."
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  className="p-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="দিন / তিথি (যেমন: পূজার দিন)..."
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="p-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="সময় (যেমন: সকাল ১০:০০ টা)..."
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="p-2 text-xs border border-gray-300 rounded-lg outline-none bg-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-800 text-white text-xs px-4 py-1.5 rounded-lg font-medium"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          )}

          {/* সময়সূচী লিস্ট */}
          <div className="space-y-3">
            {currentSchedule.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                এই পূজায় কোনো সময়সূচী যুক্ত করা নেই।
              </div>
            ) : (
              currentSchedule.map((item, index) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-gray-50 hover:bg-amber-50/50 rounded-xl border border-gray-200/70 transition gap-3"
                  >
                    {isEditing ? (
                      /* এডিট মোড */
                      <div className="w-full flex flex-col sm:flex-row gap-2 items-center">
                        <input
                          type="text"
                          value={editEvent}
                          onChange={(e) => setEditEvent(e.target.value)}
                          className="w-full sm:flex-1 p-1.5 text-xs border border-red-500 rounded outline-none font-bold bg-white"
                          placeholder="কার্যক্রমের নাম"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full sm:w-36 p-1.5 text-xs border border-gray-300 rounded outline-none bg-white"
                          placeholder="দিন / তিথি"
                        />
                        <input
                          type="text"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full sm:w-36 p-1.5 text-xs border border-gray-300 rounded outline-none bg-white font-semibold"
                          placeholder="সময়"
                        />
                        <div className="flex gap-1 justify-end w-full sm:w-auto">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm"
                          >
                            ✓ সেভ
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2.5 py-1.5 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* সাধারণ প্রদর্শন মোড */
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-700 font-bold rounded-full text-xs shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm md:text-base text-gray-800">{item.event}</h4>
                            <span className="text-xs text-gray-500">{item.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:self-center self-end">
                          <span className="bg-white border border-red-200 text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-2xs">
                            ⏰ {item.time}
                          </span>

                          {isAdmin && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => startEditing(item)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-1.5 py-1 rounded hover:bg-blue-50"
                                title="এডিট করুন"
                              >
                                ✏️ এডিট
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-xs text-red-500 hover:text-red-700 px-1.5 py-1 rounded hover:bg-red-50"
                                title="মুছে ফেলুন"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* অ্যাডমিন পিন মডাল */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">অ্যাডমিন প্রবেশ</h3>
            <p className="text-xs text-gray-500 mb-4">সময়সূচী পরিবর্তন করতে ৪ ডিজিটের পিন লিখুন।</p>
            
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