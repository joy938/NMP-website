'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function GalleryPage() {
  const ADMIN_PIN = '0000';

  // তোমার গ্যালারির গুগল শিট লিংক
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1oqiuDanj6k0jTiqPYzIdWe7nAVWuS1KPgOUNKjwOFiY/gviz/tq?tqx=out:csv';
  const GOOGLE_SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1oqiuDanj6k0jTiqPYzIdWe7nAVWuS1KPgOUNKjwOFiY/edit?usp=sharing';

  const [selectedAlbum, setSelectedAlbum] = useState('সব ছবি');
  const [selectedImage, setSelectedImage] = useState(null); // ফুলস্ক্রিন ছবির জন্য

  // অ্যাডমিন স্টেট
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // ডাটা ও লোডিং স্টেট
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // গুগল শিট থেকে ছবির ডাটা লোড
  const fetchGalleryData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      const csvText = await response.text();

      const lines = csvText.trim().split(/\r?\n/);
      const parsedPhotos = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) =>
          val.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        );

        if (cols.length >= 2 && cols[0]) {
          parsedPhotos.push({
            id: i,
            imageUrl: cols[0],
            caption: cols[1] || 'পূজার স্মৃতি',
            album: cols[2] ? cols[2].trim() : 'সাধারণ',
          });
        }
      }

      setPhotos(parsedPhotos);
    } catch (error) {
      console.error('গ্যালারি লোড করতে সমস্যা হয়েছে:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
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

  // শিট থেকে সমস্ত অ্যালবামের নাম বের করা
  const albums = ['সব ছবি', ...Array.from(new Set(photos.map((p) => p.album).filter(Boolean)))];

  // ফিল্টার করা ছবি
  const filteredPhotos = photos.filter(
    (p) => selectedAlbum === 'সব ছবি' || p.album === selectedAlbum
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="max-w-6xl mx-auto py-8 px-4">
        
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
                  className="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>📊</span> শিটে ছবি যোগ করুন
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
                className="text-xs text-red-700 hover:text-red-900 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition"
              >
                🔒 অ্যাডমিন
              </button>
            )}

            <button
              onClick={fetchGalleryData}
              disabled={isLoading}
              title="নতুন ছবি লোড করতে ক্লিক করুন"
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1"
            >
              <span className={isLoading ? 'animate-spin' : ''}>🔄</span> {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>
        </div>

        {/* হেডার ব্যানার */}
        <div className="bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-white p-7 md:p-9 rounded-3xl shadow-lg mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            ফটো গ্যালারি
          </h1>
          <p className="text-amber-100 text-xs md:text-sm mt-2 max-w-md mx-auto">
            আমাদের নবীন মহাজন পাড়ার সকল পূজা ও মহোৎসবের আনন্দঘন মুহূর্তের আলোকচিত্রমালা।
          </p>
        </div>

        {/* অ্যালবাম ফিল্টার বাটনসমূহ */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {albums.map((album) => {
            const isActive = selectedAlbum === album;
            return (
              <button
                key={album}
                onClick={() => setSelectedAlbum(album)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition shadow-xs ${
                  isActive
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {album}
              </button>
            );
          })}
        </div>

        {/* ছবি প্রদর্শন গ্রিড */}
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
            <span className="text-3xl animate-spin">⏳</span>
            <span>গুগল শিট থেকে ছবি লোড হচ্ছে...</span>
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-red-600 text-sm">
            গুগল শিট লোড করতে সমস্যা হয়েছে। শিটটির শেয়ারিং পারমিশন 'Anyone with the link' আছে কি না চেক করুন।
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="bg-white p-12 text-center text-gray-400 rounded-2xl border border-gray-200 text-sm">
            এই অ্যালবামে এখনো কোনো ছবি যুক্ত নেই। গুগল শিটে ছবির লিংক দিলে এখানে চলে আসবে।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedImage(photo)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition duration-300 group cursor-pointer flex flex-col justify-between"
              >
                {/* ইমেজ কন্টেইনার */}
                <div className="relative h-56 md:h-64 overflow-hidden bg-gray-100">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {/* অ্যালবাম ব্যাজ */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                    {photo.album}
                  </span>
                </div>

                {/* ক্যাপশন */}
                <div className="p-4">
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
                    {photo.caption}
                  </h3>
                  <span className="text-[11px] text-red-600 font-semibold mt-1 inline-block">
                    বড় করে দেখতে ক্লিক করুন ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ফুলস্ক্রিন লাইটবক্স মডাল (Fullscreen Lightbox) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* ক্লোজ বাটন */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white text-3xl font-bold bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
          >
            ✕
          </button>

          {/* বড় ছবি */}
          <div
            className="max-w-4xl max-h-[80vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.caption}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            {/* ছবির ক্যাপশন */}
            <div className="mt-3 text-center text-white">
              <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-bold mr-2">
                {selectedImage.album}
              </span>
              <span className="text-sm md:text-base font-semibold">
                {selectedImage.caption}
              </span>
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