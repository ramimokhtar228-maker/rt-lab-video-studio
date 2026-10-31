import React from 'react';
import { Phone, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { PHONE_NUMBERS } from '../data/adData';

interface HeaderProps {
  onOpenBooking: () => void;
  activeTab: 'video' | 'packages' | 'studio' | 'gallery';
  setActiveTab: (tab: 'video' | 'packages' | 'studio' | 'gallery') => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-red-900/30">
      {/* Top emergency hotline bar */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-white text-xs sm:text-sm py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-rose-200">قريباً:</span>
            <span className="hidden sm:inline text-slate-200">انطلاق الفحص الشامل المخفض بـ 3 باقات متكاملة تناسب جميع الأعمار</span>
            <span className="sm:hidden text-slate-200">الفحص الشامل المخفض بـ 3 باقات</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-300">للحجز والاستفسار الفوري:</span>
            <div className="flex items-center gap-3">
              {PHONE_NUMBERS.map((p) => (
                <a
                  key={p.raw}
                  href={p.telLink}
                  className="flex items-center gap-1.5 font-bold hover:text-red-300 transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full text-xs"
                >
                  <Phone className="w-3 h-3 text-red-400" />
                  <span dir="ltr">{p.formatted}</span>
                </a>
              ))}
              <a
                href={PHONE_NUMBERS[0].waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs"
              >
                <MessageCircle className="w-3 h-3" />
                <span className="hidden xs:inline">واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('video')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-900 shadow-lg shadow-red-900/40 border border-red-500/30">
            <span className="text-white font-black text-xl tracking-tighter">RT</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-1">
                <span className="text-red-500">RT</span> LAB
              </h1>
              <span className="text-[10px] bg-red-900/60 text-red-300 border border-red-700/50 px-2 py-0.5 rounded-full font-medium">
                Laboratories
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              معامل رامي مختار <span className="text-red-400 font-semibold">• دقة • ثقة • رعاية</span>
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            مشغل الإعلان المرئي
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'packages'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>باقات الفحص الـ 3</span>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">خصم 55%</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            استوديو الصوت والنصوص
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            صور وفروع المعمل (13)
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-lg shadow-red-900/50 hover:shadow-red-800/80 transition-all border border-red-400/30 animate-glow-pulse"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>احجز مكانك في الخصم</span>
          </button>
        </div>
      </div>

      {/* Mobile nav pills */}
      <div className="lg:hidden flex overflow-x-auto gap-2 px-4 py-2 border-t border-slate-800/80 bg-slate-900/50 no-scrollbar">
        <button
          onClick={() => setActiveTab('video')}
          className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
            activeTab === 'video' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          🎬 مشغل الإعلان
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
            activeTab === 'packages' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <span>🩺 الـ 3 باقات</span>
          <span className="text-[10px] text-amber-300">55%</span>
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
            activeTab === 'studio' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          🎙️ الصوت والذكاء الاصطناعي
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
            activeTab === 'gallery' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          🖼️ الصور والفروع (13)
        </button>
      </div>
    </header>
  );
};
