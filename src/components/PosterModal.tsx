import React, { useRef, useState } from "react";
import { X, Download, Share2, Check, PhoneCall, Sparkles } from "lucide-react";

interface PosterModalProps {
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({ onClose }) => {
  const [format, setFormat] = useState<"story" | "square">("story");
  const [copied, setCopied] = useState(false);

  const phone1 = "01100874444";
  const phone2 = "01100046841";

  const shareText = `🎉 تحتفل معامل RT للتحاليل الطبية بعيد ميلادها الـ 21!
بمناسبة مرور 21 عاماً على التأسيس، بنقدملكم خصم استثنائي يصل إلى 90% على جميع التحاليل والفحوصات الطبية هدية لعملائنا الكرام!
📞 للتواصل والحجز السريع وسحب العينات المنزلي:
${phone1}
${phone2}
معامل RT - دقة، سرعة، وأعلى جودة طبية.`;

  const copyAnniversaryText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = () => {
    // Generate high quality canvas flyer
    const canvas = document.createElement("canvas");
    const isStory = format === "story";
    canvas.width = 1080;
    canvas.height = isStory ? 1920 : 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#3b0716");
    bg.addColorStop(0.5, "#17020a");
    bg.addColorStop(1, "#080104");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Badge
    ctx.fillStyle = "#e11d48";
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.fillText("★ احتفالية مرور 21 عاماً من التميز الطبي (2005 - 2026) ★", canvas.width / 2, isStory ? 120 : 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 64px 'Cairo', sans-serif";
    ctx.fillText("معامل RT للتحاليل الطبية", canvas.width / 2, isStory ? 210 : 170);

    ctx.fillStyle = "#fb7185";
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.fillText("تحتفل بعيد ميلادها الـ 21 مع عملائها الكرام", canvas.width / 2, isStory ? 280 : 230);

    // 90% Discount Badge
    const badgeY = isStory ? 580 : 450;
    const rad = ctx.createRadialGradient(canvas.width / 2, badgeY, 20, canvas.width / 2, badgeY, 240);
    rad.addColorStop(0, "#fbbf24");
    rad.addColorStop(0.6, "#e11d48");
    rad.addColorStop(1, "#881337");
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, badgeY, 210, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 10;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Cairo', sans-serif";
    ctx.fillText("خصم يصل إلى", canvas.width / 2, badgeY - 80);

    ctx.fillStyle = "#fef08a";
    ctx.font = "900 140px 'Cairo', sans-serif";
    ctx.fillText("90%", canvas.width / 2, badgeY + 45);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px 'Cairo', sans-serif";
    ctx.fillText("على جميع التحاليل الطبية", canvas.width / 2, badgeY + 125);

    // Callout Box
    const boxY = isStory ? 1040 : 750;
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, boxY, canvas.width - 160, isStory ? 340 : 160, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fde047";
    ctx.font = "bold 36px 'Cairo', sans-serif";
    ctx.fillText("🎁 هدية خاصة لعملائنا الكرام لفترة محدودة", canvas.width / 2, boxY + 65);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 28px 'Cairo', sans-serif";
    ctx.fillText("• سحب عينات منزلي مجاني لجميع مناطق الخدمة", canvas.width / 2, boxY + 125);
    if (isStory) {
      ctx.fillText("• أحدث الأجهزة المعملية وأعلى درجات الدقة والسرعة", canvas.width / 2, boxY + 185);
      ctx.fillText("• إرسال النتائج فور صدورها عبر تطبيق الواتساب", canvas.width / 2, boxY + 245);
    }

    // Contact Footer
    const footY = isStory ? 1540 : 960;
    ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(80, footY, canvas.width - 160, isStory ? 240 : 90, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#34d399";
    ctx.font = "bold 34px 'Cairo', sans-serif";
    ctx.fillText("📞 للتواصل والحجز والاستعلام:", canvas.width / 2, footY + (isStory ? 60 : 40));

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 52px 'Readex Pro', sans-serif";
    ctx.fillText(`${phone1}  -  ${phone2}`, canvas.width / 2, footY + (isStory ? 140 : 75));

    if (isStory) {
      ctx.fillStyle = "#a7f3d0";
      ctx.font = "bold 28px 'Cairo', sans-serif";
      ctx.fillText("خدمة متواصلة على مدار 24 ساعة للرد على استفساراتكم", canvas.width / 2, footY + 205);
    }

    // Trigger download
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `RT-Lab-21st-Anniversary-Poster-${format}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              بوستر إعلان عيد الميلاد الـ 21 لمعامل RT
            </h3>
            <p className="text-xs text-slate-400">
              جاهز للتحميل بجودة فائقة ونشره كحالة واتساب أو منشور فيسبوك وإنستغرام
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setFormat("story")}
            className={`flex-1 py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
              format === "story"
                ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md shadow-rose-950"
                : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            📱 مقاس ستوري / واتساب (9:16)
          </button>
          <button
            onClick={() => setFormat("square")}
            className={`flex-1 py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
              format === "square"
                ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md shadow-rose-950"
                : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            🖼️ مقاس مربع للبوستات (1:1)
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="bg-gradient-to-b from-rose-950 via-slate-950 to-black p-6 rounded-2xl border border-rose-900/40 text-center space-y-4 shadow-inner">
          <div className="inline-block bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow">
            ★ 21st ANNIVERSARY (2005 - 2026) ★
          </div>

          <h2 className="text-2xl font-black text-white">معامل RT للتحاليل الطبية</h2>
          <p className="text-sm text-rose-300 font-semibold">
            تحتفل بعيد ميلادها الـ 21 مع عملائها الكرام
          </p>

          <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 p-1 flex items-center justify-center shadow-xl shadow-rose-950">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
              <span className="text-xs text-white font-bold">خصم يصل إلى</span>
              <span className="text-4xl font-black text-amber-400">90%</span>
              <span className="text-[11px] text-rose-300 font-bold">على جميع التحاليل</span>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-emerald-300 font-bold text-sm">
            📞 للحجز والاستفسار: {phone1} • {phone2}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadImage}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-all"
          >
            <Download className="w-4 h-4" />
            تحميل البوستر عالي الدقة (PNG)
          </button>

          <button
            onClick={copyAnniversaryText}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-rose-400" />}
            {copied ? "تم نسخ نص الإعلان بنجاح!" : "نسخ نص الإعلان للواتساب"}
          </button>
        </div>
      </div>
    </div>
  );
};
