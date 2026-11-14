import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ১. মোবাইলের উপরের স্ট্যাটাস বার পূজার লাল রঙে রাঙানোর সেটিংস
export const viewport = {
  themeColor: "#b91c1c",
  width: "device-width",
  initialScale: 1,
};

// ২. হোয়াটসঅ্যাপ, মেসেঞ্জার ও ফেসবুকে লিংক শেয়ার করলে প্রিমিয়াম প্রিভিউ কার্ড
export const metadata = {
  title: "নবীন মহাজন পাড়া | অফিশিয়াল ওয়েবসাইট",
  description: "নবজাগরণ একতা সংঘ — পূজার সময়সূচী, প্রণামী, মাসিক চাঁদা, ব্যয়ের হিসাব ও স্মরণিকা।",
  openGraph: {
    title: "🪔 নবীন মহাজন পাড়া — অফিশিয়াল ওয়েবসাইট",
    description: "পূজার সময়সূচী, প্রণামী, মাসিক চাঁদা ও খরচের লাইভ হিসাব দেখুন এক ক্লিকেই!",
    url: "https://nmp-website.netlify.app",
    siteName: "নবীন মহাজন পাড়া",
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col justify-between bg-gray-50 text-gray-800">
        
        {/* পেজের মূল বিষয়বস্তু */}
        <div className="flex-1">
          {children}
        </div>

        {/* প্রতিটি পেজের নিচে স্থায়ী ফুটার */}
        <footer className="text-center py-6 text-xs text-gray-500 border-t border-gray-200 bg-white mt-12">
          <p className="font-medium text-gray-600">
            Designed & Developed by <span className="font-bold text-red-700">Joy Dey</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            © ২০২৬ নবীন মহাজন পাড়া • সর্বস্বত্ব সংরক্ষিত
          </p>
        </footer>

      </body>
    </html>
  );
}