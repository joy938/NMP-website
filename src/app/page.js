import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import UpcomingPuja from '../components/UpcomingPuja';

export default function Home() {
  // তোমার পাড়ার অফিশিয়াল ফেসবুক, মেসেঞ্জার ও হোয়াটসঅ্যাপ গ্রুপের লিংক
  const FACEBOOK_GROUP_LINK = "https://www.facebook.com/share/g/18qkaaH1Nw/";
  const MESSENGER_GROUP_LINK = "https://m.me/j/YEaDiAW7fWW_VYHH/?send_source=gc%3Acopy_invite_link_t";
  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/BvN5tcgY2rW2Xl2kmem1Tl";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
      <div>
        <Navbar />
        <Banner />
        <UpcomingPuja />

        {/* পাড়ার সামাজিক যোগাযোগ সেকশন */}
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm text-center">
            <span className="text-2xl block mb-2">🤝</span>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              নবীন মহাজন পাড়ার সাথে যুক্ত থাকুন
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-md mx-auto">
              পাড়ার যেকোনো অনুষ্ঠান, জরুরি তথ্য ও সমাজকল্যাণমূলক আলোচনার জন্য আমাদের অফিশিয়াল গ্রুপগুলোতে যুক্ত হোন।
            </p>

            {/* ফেসবুক, মেসেঞ্জার ও হোয়াটসঅ্যাপ ৩টি বাটন পাশাপাশি */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              
              {/* ১. ফেসবুক গ্রুপ */}
              <a
                href={FACEBOOK_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <span>👥</span> ফেসবুক গ্রুপ
              </a>

              {/* ২. মেসেঞ্জার গ্রুপ */}
              <a
                href={MESSENGER_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0084FF] hover:bg-[#0073e6] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <span>⚡</span> মেসেঞ্জার গ্রুপ
              </a>

              {/* ৩. হোয়াটসঅ্যাপ গ্রুপ */}
              <a
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
              >
                <span>💬</span> হোয়াটসঅ্যাপ গ্রুপ
              </a>

            </div>
          </div>
        </section>
      </div>

      {/* ফুটার ক্রেডিট */}
      <footer className="text-center py-6 text-xs text-gray-500 border-t border-gray-200 bg-white mt-8">
        <p className="font-medium text-gray-600">
          Designed & Developed by <span className="font-bold text-red-700">Joy Dey</span>
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          © ২০২৬ নবীন মহাজন পাড়া • সর্বস্বত্ব সংরক্ষিত
        </p>
      </footer>
    </main>
  );
}