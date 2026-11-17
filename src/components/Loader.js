export default function Loader({ text = 'তথ্য লোড হচ্ছে...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 print:hidden">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* চারপাশে ঘুরতে থাকা লাল স্পিনার */}
        <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-red-700 animate-spin" />
        {/* মাঝখানে সংঘের লোগো */}
        <img
          src="/logo.png"
          alt="Loading"
          className="w-12 h-12 rounded-full object-contain animate-pulse"
        />
      </div>
      <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500 animate-pulse">
        {text}
      </p>
    </div>
  );
}