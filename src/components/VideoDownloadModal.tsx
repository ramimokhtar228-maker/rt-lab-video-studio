import React, { useState } from "react";
import {
  Download,
  Share2,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Play,
  Copy,
  MessageCircle,
} from "lucide-react";
import { studioAudio } from "../audio/audioEngine";

interface VideoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  audioUrl?: string;
}

export const VideoDownloadModal: React.FC<VideoDownloadModalProps> = ({
  isOpen,
  onClose,
  videoUrl = "./assets/video/rt_lab_21st_anniversary_promo.mp4?v=20261024_faststart_v2",
  audioUrl = "./assets/audio/rt_lab_master_soundtrack.mp3?v=20261024",
}) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasCopiedLink, setHasCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Helper to fetch video file with real progress
  const fetchVideoBlob = async (url: string): Promise<Blob> => {
    setStatusMessage("جاري تجهيز وتحميل ملف الفيديو...");
    setDownloadProgress(10);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`تعذر تحميل الملف من السيرفر (كود: ${response.status})`);
    }

    const contentLength = response.headers.get("content-length");
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 6600000;

    if (!response.body) {
      const blob = await response.blob();
      setDownloadProgress(100);
      return blob;
    }

    const reader = response.body.getReader();
    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        receivedBytes += value.length;
        if (totalBytes > 0) {
          const percent = Math.min(
            98,
            Math.round((receivedBytes / totalBytes) * 100)
          );
          setDownloadProgress(percent);
          const mb = (receivedBytes / (1024 * 1024)).toFixed(1);
          const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
          setStatusMessage(`جاري التحميل: ${mb} من ${totalMb} ميجابايت (${percent}%)`);
        }
      }
    }

    setDownloadProgress(100);
    setStatusMessage("اكتمل تجهيز الملف!");
    return new Blob(chunks, { type: "video/mp4" });
  };

  // 1. Mobile Share (Save directly to iOS Camera Roll or Android Gallery)
  const handleMobileSaveOrShare = async () => {
    try {
      setIsSuccess(false);
      const blob = await fetchVideoBlob(videoUrl);
      const filename = "RT-Lab-21st-Anniversary-Commercial.mp4";
      const file = new File([blob], filename, { type: "video/mp4" });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        setStatusMessage("افتح قائمة المشاركة واختر 'حفظ الفيديو'...");
        await navigator.share({
          title: "إعلان معامل رامي مختار RT للتحاليل الطبية",
          text: "احتفالية 21 عاماً من التميز والريادة - خصم يصل إلى 90% على التحاليل الطبية | للحجز: 01100874444",
          files: [file],
        });
        setIsSuccess(true);
        setStatusMessage("تمت مشاركة وحفظ الفيديو بنجاح! 🎉");
        studioAudio.playCelebrationChime();
      } else {
        // Fallback to direct blob download
        triggerBlobDownload(blob, filename);
      }
    } catch (err: any) {
      console.warn("Mobile share aborted or failed:", err);
      if (err.name !== "AbortError") {
        setStatusMessage("جاري تجربة التنزيل المباشر...");
        handleDirectDownload();
      } else {
        setStatusMessage("تم إلغاء المشاركة.");
        setDownloadProgress(null);
      }
    }
  };

  // 2. Direct Blob Download
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
    setIsSuccess(true);
    setStatusMessage("تم بدء تنزيل الملف بنجاح! تحقق من مجلد التنزيلات.");
    studioAudio.playCelebrationChime();
  };

  const handleDirectDownload = async () => {
    try {
      setIsSuccess(false);
      const blob = await fetchVideoBlob(videoUrl);
      triggerBlobDownload(blob, "RT-Lab-21st-Anniversary-Commercial.mp4");
    } catch (err) {
      console.error("Direct download error:", err);
      // Last resort: standard anchor click
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "RT-Lab-21st-Anniversary-Commercial.mp4";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setStatusMessage("تم فتح رابط التنزيل المباشر.");
    }
  };

  // 3. Open Video in dedicated page for long-press save
  const handleOpenInNewTab = () => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  // 4. Download Audio MP3
  const handleDownloadAudio = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "RT-Lab-21st-Anniversary-MasterSoundtrack.mp3";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    studioAudio.playCelebrationChime();
  };

  // 5. Copy Video Link
  const handleCopyLink = async () => {
    try {
      const fullUrl = new URL(videoUrl, window.location.href).href;
      await navigator.clipboard.writeText(fullUrl);
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-right relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs font-bold mb-1">
              <Download className="w-3.5 h-3.5" />
              تنزيل وحفظ الفيديو الرسمي
            </div>
            <h3 className="text-lg font-black text-white">
              خيارات حفظ إعلان معامل RT على هاتفك
            </h3>
          </div>
        </div>

        {/* Progress or status banner */}
        {downloadProgress !== null && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-rose-400">{downloadProgress}%</span>
              <span className="text-slate-300">{statusMessage}</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 h-full transition-all duration-200 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Mobile Info Box */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2 text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <Smartphone className="w-4 h-4 text-rose-400" />
            <span>معلومات التوافق الكامل مع الموبايل:</span>
          </div>
          <p>
            تم تجهيز الفيديو وتحديثه بصيغة <strong>MP4 (H.264 / AAC)</strong> بنظام{" "}
            <span className="text-emerald-400 font-mono">FastStart</span> لتشغيله وتنزيله بسلاسة تامة على هواتف <strong>آيفون (iOS Safari)</strong> و <strong>أندرويد (Android)</strong> ومتصفحات واتساب وفيسبوك دون توقف.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3">
          {/* Button 1: Mobile native save & share */}
          <button
            onClick={handleMobileSaveOrShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-950/80 transition-all hover:scale-[1.01] active:scale-[0.99] group"
          >
            <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform text-rose-200" />
            <span>
              {isIOS
                ? "حفظ في صور الآيفون (Save Video) أو مشاركة 📲"
                : "حفظ في معرض الموبايل أو مشاركة فورية 📲"}
            </span>
          </button>

          {/* Button 2: Direct MP4 File Download */}
          <button
            onClick={handleDirectDownload}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-slate-500"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>تنزيل ملف الفيديو المباشر (MP4 - 6.6MB) 💾</span>
          </button>

          {/* Button 3: Open in new tab (Long-press save method for mobile) */}
          <button
            onClick={handleOpenInNewTab}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>فتح الفيديو في نافذة مستقلة (للحفظ بالضغط المطول) 🔗</span>
          </button>
        </div>

        {/* Tip for iPhone / Safari users */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>نصيحة لمستخدمي الآيفون والواتساب:</strong> عند الضغط على زر &quot;حفظ في صور الآيفون&quot;، ستظهر قائمة المشاركة الرسمية لآبل.. اختر منها <strong>&quot;حفظ الفيديو&quot; (Save Video)</strong> ليظهر مباشرة في ألبوم الصور.
          </span>
        </div>

        {/* Secondary options: Audio MP3 and Copy Link */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={handleDownloadAudio}
            className="px-3.5 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="تحميل الإعلان الصوتي فقط بصيغة MP3"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>صوت MP3 فقط</span>
          </button>

          <a
            href="https://api.whatsapp.com/send?phone=201100874444&text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%B9%D8%A7%D9%85%D9%84%20RT%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B9%D8%B1%D9%88%D8%B6%20%D8%B9%D9%8A%D8%AF%20%D8%A7%D9%84%D9%85%D9%8A%D9%84%D8%A7%D8%AF%20%D8%A7%D9%84%D9%80%2021%20%D9%88%D8%A7%D9%84%D8%AE%D8%B5%D9%85%20%D8%AD%D8%AA%D9%89%2090%25"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>تواصل واتساب للحجز</span>
          </a>

          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="نسخ الرابط المباشر"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{hasCopiedLink ? "تم النسخ ✓" : "نسخ الرابط"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
