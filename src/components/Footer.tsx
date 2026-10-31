import React from 'react';
import { Phone, MessageCircle, ShieldCheck, MapPin, Clock, Award, Heart } from 'lucide-react';
import { PHONE_NUMBERS } from '../data/adData';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 border border-red-500/40 text-white font-black text-lg">
                RT
              </div>
              <div>
                <h3 className="font-black text-white text-base">RT LAB Laboratories</h3>
                <p className="text-xs text-red-400 font-bold">معامل رامي مختار للتحاليل الطبية</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              دقة تشخيصية تفوق التوقعات، بأحدث أجهزة التحاليل الآلية المؤتمتة عالمياً، وأرقى صالات الاستقبال الفندقية مع خدمة سحب منزلي مجاني لكافة الفئات والأعمار.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>معايير جودة واعتماد دولية صارمة</span>
            </div>
          </div>

          {/* Col 2: The 3 Packages */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>باقات الفحص الشامل المخفض</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-300 hover:text-white transition-colors">
                • باقة الفحص الأساسي الدوري (خصم 45%)
              </li>
              <li className="text-slate-300 hover:text-white transition-colors">
                • باقة الفحص الشامل المتقدم للشباب (خصم 50%)
              </li>
              <li className="text-slate-300 hover:text-white transition-colors">
                • باقة الفحص الذهبي الشامل لكبار السن (خصم 55%)
              </li>
              <li className="text-slate-300 hover:text-white transition-colors">
                • خدمة السحب المنزلي السريع مجاناً
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Booking */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-400" />
              <span>أرقام الحجز والاستفسار الفوري</span>
            </h4>
            <div className="space-y-2.5">
              {PHONE_NUMBERS.map((p) => (
                <div key={p.raw} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400">{p.label}</span>
                    <a href={p.telLink} className="text-xs font-black text-white hover:text-red-400" dir="ltr">
                      {p.formatted}
                    </a>
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={p.telLink}
                      className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                      title="اتصال هاتف"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={p.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      title="محادثة واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 4: Working Hours & Care */}
          <div>
            <h4 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>مواعيد العمل والخدمة</span>
            </h4>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>السبت - الخميس:</span>
                <span className="font-bold text-white">7:00 ص - 11:00 م</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>الجمعة:</span>
                <span className="font-bold text-white">8:00 ص - 9:00 م</span>
              </div>
              <div className="flex justify-between text-emerald-400 pt-1 font-semibold">
                <span>سحب منزلي:</span>
                <span>متاح طوال الأسبوع بالحجز</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} معامل رامي مختار RT LAB Laboratories. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>صُمم بالذكاء الاصطناعي لإعلان الفحص الشامل المخفض</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  );
};
