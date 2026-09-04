import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center p-4 text-[#242321]">
      <div className="bg-white border border-[#E4DED4] rounded-2xl shadow-warm-lg max-w-md w-full p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#E8E0D2] text-[#8B7355] flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7" />
        </div>

        <span className="text-[10px] font-bold text-[#8B7355] bg-[#8B7355]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
          404 Not Found
        </span>

        <h1 className="font-heading text-2xl font-bold text-[#242321]">
          Document or Page Not Found
        </h1>

        <p className="text-xs text-[#6F6A62] leading-relaxed">
          The requested page or document intelligence resource could not be located in our repository.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2.5 bg-[#8B7355] hover:bg-[#5F4B35] text-white font-semibold text-xs rounded-xl shadow-warm-sm transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/documents"
            className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F1EDE5] text-[#242321] font-semibold text-xs rounded-xl border border-[#E4DED4] transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#8B7355]" />
            Document Library
          </Link>
        </div>
      </div>
    </div>
  );
};
