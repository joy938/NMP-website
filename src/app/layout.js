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

export const metadata = {
  title: "Nobin Mohajon Para",
  description: "নবীন মহাজন পাড়ার অফিশিয়াল ওয়েবসাইট",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col justify-between bg-gray-50 text-gray-800">
        
        {/* পেজের মূল বিষয়বস্তু */}
        <div className="flex-1">
          {children}
        </div>

        {/* প্রতিটি পেজের নিচে স্বয়ংক্রিয় স্থায়ী ফুটার */}
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