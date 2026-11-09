import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import UpcomingPuja from '../components/UpcomingPuja';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <Banner />
      {/* আসন্ন পূজার আকর্ষণ ও লাইভ টাইমার */}
      <UpcomingPuja />
    </main>
  );
}