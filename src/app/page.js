import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import UpcomingPuja from '../components/UpcomingPuja';

export default function Home() {
  const FACEBOOK_GROUP_LINK = "https://www.facebook.com/share/g/18qkaaH1Nw/";
  const MESSENGER_GROUP_LINK = "https://m.me/j/YEaDiAW7fWW_VYHH";
  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/BvN5tcgY2rW2Xl2kmem1Tl";

  return (
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

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a
              href={FACEBOOK_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <span>👥</span> ফেসবুক গ্রুপ
            </a>

            <a
              href={MESSENGER_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0084FF] hover:bg-[#0073e6] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <span>⚡</span> মেসেঞ্জার গ্রুপ
            </a>

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
  );
}