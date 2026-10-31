import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Home,
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MEDICAL_PACKAGES, PHONE_NUMBERS, MedicalPackage } from '../data/adData';
import { audioEngine } from '../services/audioEngine';

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: MedicalPackage | null;
}

export const QuickBookingModal: React.FC<QuickBookingModalProps> = ({
  isOpen,
  onClose,
  defaultPackage,
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    defaultPackage?.id || 'advanced'
  );
  const [visitType, setVisitType] = useState<'branch' | 'home'>('home');
  const [membersCount, setMembersCount] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPkg =
    MEDICAL_PACKAGES.find((p) => p.id === selectedPackageId) || MEDICAL_PACKAGES[1];

  const handleConfirmBooking = (method: 'whatsapp' | 'call') => {
    // Trigger sound and confetti
    audioEngine.playReservationSuccessSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#ef4444', '#f59e0b', '#3b82f6', '#ffffff'],
    });

    setIsSuccess(true);

    const message = `السلام عليكم معامل رامي مختار RT LAB،
أود تأكيد الحجز المسبق في عرض الفحص الشامل المخفض:
- الاسم: ${name || 'عميل معامل RT'}
- الهاتف: ${phone || 'المرفق بالرسالة'}
- الباقة المختارة: ${currentPkg.arabicName} (خصم ${currentPkg.discountPercentage}%)
- طريقة الفحص: ${visitType === 'home' ? 'سحب منزلي مجاني' : 'زيارة فرع المعمل'}
- عدد الأفراد: ${membersCount}
${notes ? `- ملاحظات: ${notes}` : ''}
يرجى تأكيد أسبقية الحجز وتفاصيل الموعد. شكراً لكم.`;

    const targetPhone = '201100874444';
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;

    if (method === 'whatsapp') {
      window.open(waUrl, '_blank');
    } else {
      window.location.href = `tel:01100874444`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-slate-950 border border-red-900/50 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow behind */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 bg-red-950/80 border border-red-600/40 text-red-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>أسبقية الحجز المسبق للفحص الشامل</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                احجز مكانك في عروض معامل رامي مختار RT LAB
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                سجل بياناتك لتحصل على أعلى نسبة خصم فور الإطلاق مع سحب منزلي مجاني
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              {/* Package selection buttons */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  اختر باقة الفحص الشامل المطلوبة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MEDICAL_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        selectedPackageId === pkg.id
                          ? 'bg-red-950/70 border-red-500 text-white ring-1 ring-red-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs font-extrabold text-white block">{pkg.arabicName}</span>
                      <span className="text-[11px] text-amber-400 font-bold mt-1">خصم {pkg.discountPercentage}%</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">الاسم بالكامل:</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: د. محمد أحمد"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl py-2 pr-9 pl-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">رقم الهاتف / الواتساب:</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="011xxxxxxx"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl py-2 pr-9 pl-3 text-xs text-white text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Visit Type */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">طريقة إجراء الفحص:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVisitType('home')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      visitType === 'home'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Home className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="text-right">
                      <span className="block text-white">سحب منزلي مجاني</span>
                      <span className="text-[10px] text-emerald-400">بدون أي رسوم انتقال</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisitType('branch')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      visitType === 'branch'
                        ? 'bg-red-950/60 border-red-500 text-red-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Building className="w-4 h-4 text-red-400 shrink-0" />
                    <div className="text-right">
                      <span className="block text-white">زيارة فرع المعمل</span>
                      <span className="text-[10px] text-slate-400">استقبال فندقي راقٍ</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Members Count & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">عدد الأفراد:</label>
                  <select
                    value={membersCount}
                    onChange={(e) => setMembersCount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="1">فرد واحد (1)</option>
                    <option value="2">فردين (2)</option>
                    <option value="3">3 أفراد</option>
                    <option value="4+">عائلة كاملة (4 فما فوق)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">ملاحظات إضافية (اختياري):</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي استفسار طبي أو موعد مفضل..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl py-2 px-3 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleConfirmBooking('whatsapp')}
                className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all animate-glow-pulse"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال وتأكيد الحجز عبر واتساب فوراً</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
                <span>أو الاتصال المباشر:</span>
                {PHONE_NUMBERS.map((p) => (
                  <a
                    key={p.raw}
                    href={p.telLink}
                    className="font-bold text-rose-300 hover:text-white flex items-center gap-1 underline"
                    dir="ltr"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{p.formatted}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">تم تسجيل طلب الحجز المسبق بنجاح!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
              سيتواصل معك فريق خدمة عملاء معامل رامي مختار RT LAB لتأكيد الموعد وضمان استفادتك من أقصى نسبة خصم فور بدء الفحص الشامل.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={PHONE_NUMBERS[0].waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>فتح محادثة واتساب الآن</span>
              </a>
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors"
              >
                إغلاق والعودة للإعلان
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
