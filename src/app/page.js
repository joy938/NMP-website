import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import UpcomingPuja from '../components/UpcomingPuja';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
      <div>
        <Navbar />
        <Banner />
        <UpcomingPuja />
      </div>

      {/* ফুটার ক্রেডিট */}
{/* ফুটার ক্রেডিট */}
      <footer className="text-center py-6 text-xs text-gray-500 border-t border-gray-200 bg-white mt-12">
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