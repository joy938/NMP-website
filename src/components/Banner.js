import Link from 'next/link';

export default function Banner() {
  return (
    <div id="home" className="bg-gradient-to-b from-red-600 to-amber-600 text-white py-14 px-4 text-center">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
          নবীন মহাজন পাড়া
        </h1>
        <p className="text-base md:text-lg text-amber-100 max-w-xl mx-auto mb-8">
          ঐক্য, ঐতিহ্য ও ভ্রাতৃত্বের মেলবন্ধন — আমাদের সকল পূজা ও সামাজিক আয়োজনের তথ্য একসাথে।
        </p>

        {/* ব্যানারেই থাকা ৩টি অপশন কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
          
          {/* অপশন ১: নবজাগরণ একতা সংঘ */}
          <Link 
            href="/sangha" 
            className="bg-white text-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition duration-200 border-t-4 border-red-600 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-1 rounded">সংগঠন</span>
              <h3 className="text-lg font-bold text-red-700 mt-2">নবজাগরণ একতা সংঘ</h3>
              <p className="text-xs text-gray-600 mt-1">
                আমাদের পাড়ার সংগঠন — যার মাধ্যমে সকল পূজা ও অনুষ্ঠান পরিচালিত হয়।
              </p>
            </div>
            <div className="mt-4 text-red-600 font-semibold text-xs flex items-center">
              বিস্তারিত দেখুন →
            </div>
          </Link>

          {/* অপশন ২: পূজার প্রণামী */}
          <Link 
            href="/pronami" 
            className="bg-white text-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition duration-200 border-t-4 border-amber-500 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded">আদায় / চাঁদা</span>
              <h3 className="text-lg font-bold text-amber-700 mt-2">পূজার প্রণামী</h3>
              <p className="text-xs text-gray-600 mt-1">
                কে কোন পূজায় কত টাকা দিল এবং বকেয়ার স্বচ্ছ তালিকা।
              </p>
            </div>
            <div className="mt-4 text-amber-600 font-semibold text-xs flex items-center">
              প্রণামীর হিসাব দেখুন →
            </div>
          </Link>

          {/* অপশন ৩: পূজার খরচের বিস্তারিত */}
          <Link 
            href="/expenses" 
            className="bg-white text-gray-800 p-5 rounded-xl shadow-lg hover:shadow-2xl transition duration-200 border-t-4 border-purple-600 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded">ব্যয়-বিবরণ</span>
              <h3 className="text-lg font-bold text-purple-700 mt-2">পূজার খরচের বিস্তারিত</h3>
              <p className="text-xs text-gray-600 mt-1">
                প্রতিমা, ডেকোরেশন, প্রসাদ ও বিবিধ খাতে মোট কত খরচ হলো তার হিসাব।
              </p>
            </div>
            <div className="mt-4 text-purple-600 font-semibold text-xs flex items-center">
              খরচের হিসাব দেখুন →
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}