import React, { useState } from 'react';
import {
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  Award,
  Users,
  Heart,
  ChevronDown,
  Clock,
  Home,
  FileCheck,
} from 'lucide-react';
import { MEDICAL_PACKAGES, MedicalPackage, PHONE_NUMBERS } from '../data/adData';

interface PackagesExplorerProps {
  onSelectPackageForBooking: (pkg: MedicalPackage) => void;
}

export const PackagesExplorer: React.FC<PackagesExplorerProps> = ({ onSelectPackageForBooking }) => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('advanced');

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-red-950/70 border border-red-600/40 text-red-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-3">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>قريباً في جميع فروع معامل رامي مختار RT LAB</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          3 باقات فحص شامل مصممة لتناسب جميع الفئات والأعمار
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          اختر الباقة الأنسب لك ولعائلتك واحجز مكانك في قائمة الخصم المسبق قبل انطلاق العرض الرسمي للحصول على أعلى نسبة توفير ورعاية استثنائية.
        </p>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {MEDICAL_PACKAGES.map((pkg) => {
          const isSelected = pkg.id === selectedPackageId;
          const isFeatured = pkg.id === 'advanced';

          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-2 border-red-500 shadow-2xl shadow-red-950/60 scale-[1.02]'
                  : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
              } ${isFeatured && !isSelected ? 'border-red-900/50' : ''}`}
            >
              {/* Featured Ribbon */}
              {isFeatured && (
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg border border-red-300/40">
                  ★ الأكثر شمولاً وتفضيلاً
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold text-red-400 block mb-1">{pkg.name}</span>
                    <h3 className="text-xl font-black text-white">{pkg.arabicName}</h3>
                  </div>
                  <div className="bg-red-950 border border-red-600/40 text-red-300 font-black text-xs px-2.5 py-1 rounded-xl shrink-0">
                    خصم {pkg.discountPercentage}%
                  </div>
                </div>

                {/* Target Audience */}
                <div className="bg-slate-950/60 rounded-xl p-2.5 mb-4 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الفئة المستهدفة:</span>
                  <span className="text-xs font-bold text-slate-200">{pkg.targetAudience}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {pkg.description}
                </p>

                {/* Test count badge */}
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-amber-300">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>تشمل {pkg.testsCount}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px]">{pkg.recommendedAge}</span>
                </div>

                {/* Key tests checklist */}
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-extrabold text-slate-300 block">أبرز التحاليل المتضمنة:</span>
                  {pkg.keyTests.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPackageForBooking(pkg);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white animate-glow-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>حجز مسبق لهذه الباقة</span>
                </button>

                <a
                  href={`https://wa.me/201100874444?text=${encodeURIComponent(
                    `مرحباً معامل رامي مختار RT LAB، أود الاستفسار والحجز المسبق لـ (${pkg.arabicName}) الفحص الشامل المخفض.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>استفسار واتساب بضغطة زر</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free Perks Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/30 to-slate-900 border border-red-900/30 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-black text-white text-center mb-6">
          مميزات حصرية مجانية تشملها جميع باقات الفحص الشامل من معامل RT LAB
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">خدمة سحب منزلي مجاني</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يصلك تمريض متخصص معقم بالكامل إلى منزلك لراحة كبار السن والأطفال دون أي تكلفة إضافية.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">استشارة طبية مجانية</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                شرح وافٍ وتفصيلي لكافة النتائج وتوصيات طبية مخصصة من أطباء واستشاريين معتمدين.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">نتائج إلكترونية فورية</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                استلم نتائجك على الواتساب والإيميل مع باركود أمان معتمد دولياً وسرعة إنجاز قياسية.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">ملف صحي دوري مجاني</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                متابعة دورية ومقارنة الفحوصات بمرور الوقت لتقييم تحسن حالتك الصحية بدقة بالغة.
              </p>
            </div>
          </div>
        </div>

        {/* CTA hotline in packages */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-800 text-center">
          <span className="text-sm font-semibold text-slate-300">للحجز والاستفسار الفوري كلمنا على:</span>
          {PHONE_NUMBERS.map((p) => (
            <a
              key={p.raw}
              href={p.telLink}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white border border-red-500/40 px-4 py-2 rounded-xl text-sm font-black transition-colors"
            >
              <Phone className="w-4 h-4 text-red-500" />
              <span dir="ltr">{p.formatted}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
