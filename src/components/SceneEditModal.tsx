import React, { useState } from "react";
import { VideoScene, VoiceSettings } from "../types/scene";
import { speechService } from "../services/speechService";
import { studioAudio } from "../audio/audioEngine";
import { X, Play, Sparkles, Upload, Check, Volume2 } from "lucide-react";

interface SceneEditModalProps {
  scene: VideoScene | null;
  voiceSettings: VoiceSettings;
  onClose: () => void;
  onSave: (updatedScene: VideoScene) => void;
}

export const SceneEditModal: React.FC<SceneEditModalProps> = ({
  scene,
  voiceSettings,
  onClose,
  onSave,
}) => {
  if (!scene) return null;

  const [title, setTitle] = useState(scene.title);
  const [headline, setHeadline] = useState(scene.headline);
  const [subheadline, setSubheadline] = useState(scene.subheadline);
  const [narrationScript, setNarrationScript] = useState(scene.narrationScript);
  const [duration, setDuration] = useState(scene.duration);
  const [imageSrc, setImageSrc] = useState(scene.imageSrc);
  const [badge, setBadge] = useState(scene.badge || "");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  const handlePreviewVoice = async () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      if (scene.audioSrc && narrationScript === scene.narrationScript) {
        await studioAudio.playVoiceAudio(scene.audioSrc);
        setIsSpeaking(false);
      } else {
        await speechService.speakText(
          narrationScript,
          voiceSettings,
          () => {},
          () => setIsSpeaking(false)
        );
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const handlePolishWithAI = async () => {
    setIsPolishing(true);
    try {
      const res = await fetch("/api/gemini/polish-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `مشهد: ${title}\nالمانشيت الحالي: ${headline}\nالنص الصوتي: ${narrationScript}`,
          duration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.scenes && data.scenes.length > 0) {
          const s = data.scenes[0];
          if (s.displayHeadline) setHeadline(s.displayHeadline);
          if (s.speech) setNarrationScript(s.speech);
          if (s.displaySub) setSubheadline(s.displaySub);
        } else if (data.fullScript) {
          setNarrationScript(data.fullScript);
        }
      }
    } catch (err) {
      console.warn("Could not polish with AI:", err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    speechService.stop();
    onSave({
      ...scene,
      title,
      headline,
      subheadline,
      narrationScript,
      duration,
      imageSrc,
      badge,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              تعديل تفاصيل المشهد {scene.order}
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                {title}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              يمكنك تخصيص النصوص المعروضة والنص الصوتي المقروء والصورة المرافقة
            </p>
          </div>
          <button
            onClick={() => {
              speechService.stop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 text-xs">
          {/* Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">عنوان المشهد الداخلي</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">الشارة العلوية (Badge)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">المانشيت الرئيسي (معروض على الشاشة)</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">النص الفرعي التوضيحي</label>
            <input
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Narration Script */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-rose-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-rose-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-rose-400" />
                النص الصوتي المقروء (Audio Narration Script)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePolishWithAI}
                  disabled={isPolishing}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {isPolishing ? "جاري التحسين..." : "تحسين بالذكاء الاصطناعي"}
                </button>
                <button
                  type="button"
                  onClick={handlePreviewVoice}
                  className={`px-3 py-1 rounded flex items-center gap-1 font-bold transition-colors ${
                    isSpeaking ? "bg-amber-600 text-white" : "bg-rose-600 hover:bg-rose-500 text-white"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  {isSpeaking ? "إيقاف الصوت" : "استماع للنص"}
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={narrationScript}
              onChange={(e) => setNarrationScript(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white leading-relaxed focus:outline-none focus:border-rose-500 text-sm"
              placeholder="اكتب هنا النص المراد نطقه بصوت واضح..."
            />
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between font-bold text-slate-300 mb-1">
              <span>مدة بقاء المشهد</span>
              <span className="font-mono text-rose-400">{duration} ثانية</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Image Chooser */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-300">الصورة المعروضة في المشهد</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Mascot Option */}
              <div
                onClick={() =>
                  setImageSrc(
                    "./assets/aistudio/rt_lab_doctor_mascot_1792323975479-B2Ib5YiU_4cd8762d.jpg"
                  )
                }
                className={`p-2 rounded-xl border cursor-pointer text-center space-y-1 transition-all ${
                  imageSrc.includes("rt_lab_doctor_mascot")
                    ? "border-rose-500 bg-rose-950/40 ring-2 ring-rose-500/30"
                    : "border-slate-700 bg-slate-800/40 hover:bg-slate-800"
                }`}
              >
                <img
                  src="./assets/aistudio/rt_lab_doctor_mascot_1792323975479-B2Ib5YiU_4cd8762d.jpg"
                  alt="Mascot"
                  className="w-full h-16 object-cover rounded-lg"
                />
                <span className="text-[10px] font-bold text-slate-300 block">طبيبة معامل RT (ماسكوت)</span>
              </div>

              {/* Team Option */}
              <div
                onClick={() =>
                  setImageSrc(
                    "./assets/aistudio/Screenshot_20260107-202251_WhatsAppBusiness_cae2a071.jpg"
                  )
                }
                className={`p-2 rounded-xl border cursor-pointer text-center space-y-1 transition-all ${
                  imageSrc.includes("WhatsAppBusiness")
                    ? "border-rose-500 bg-rose-950/40 ring-2 ring-rose-500/30"
                    : "border-slate-700 bg-slate-800/40 hover:bg-slate-800"
                }`}
              >
                <img
                  src="./assets/aistudio/Screenshot_20260107-202251_WhatsAppBusiness_cae2a071.jpg"
                  alt="Team"
                  className="w-full h-16 object-cover rounded-lg"
                />
                <span className="text-[10px] font-bold text-slate-300 block">فريق أطباء RT LAB</span>
              </div>

              {/* Upload Custom */}
              <label
                className={`p-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 hover:bg-slate-800 cursor-pointer text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                  !imageSrc.includes("rt_lab_doctor_mascot") && !imageSrc.includes("WhatsAppBusiness")
                    ? "border-rose-500 bg-rose-950/40"
                    : ""
                }`}
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-300">رفع صورة خاصة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={() => {
              speechService.stop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950 flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
};
