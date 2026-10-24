import React, { useState, useEffect, useRef } from "react";
import { DEFAULT_SCENES } from "./data/defaultScenes";
import { VideoScene, AspectRatio, VoiceSettings } from "./types/scene";
import { CanvasRenderer } from "./components/CanvasRenderer";
import { AudioMixerPanel } from "./components/AudioMixerPanel";
import { SceneTimeline } from "./components/SceneTimeline";
import { SceneEditModal } from "./components/SceneEditModal";
import { PosterModal } from "./components/PosterModal";
import { VideoDownloadModal } from "./components/VideoDownloadModal";
import { studioAudio } from "./audio/audioEngine";
import { videoRecorder } from "./services/videoRecorder";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Download,
  Phone,
  MessageCircle,
  Share2,
  Sparkles,
  Maximize2,
  Video,
  CheckCircle,
  Film,
  Sliders,
  Volume2,
} from "lucide-react";

export default function App() {
  const [scenes, setScenes] = useState<VideoScene[]>(() => {
    try {
      const saved = localStorage.getItem("rt_lab_custom_scenes_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.removeItem("rt_lab_custom_scenes");
    } catch (e) {
      console.warn("Could not load saved scenes:", e);
    }
    return DEFAULT_SCENES;
  });
  const [hasCustomScenes, setHasCustomScenes] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("rt_lab_custom_scenes_v2");
    } catch {
      return false;
    }
  });
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [viewMode, setViewMode] = useState<"video-mp4" | "interactive">(() => {
    try {
      return localStorage.getItem("rt_lab_custom_scenes_v2") ? "interactive" : "video-mp4";
    } catch {
      return "video-mp4";
    }
  });

  // Modals
  const [editingScene, setEditingScene] = useState<VideoScene | null>(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Voice Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    engine: "gemini-ai",
    geminiVoice: "Kore",
    rate: 0.95,
    pitch: 1.0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  // Initialize master audio element for seamless synchronized studio playback
  useEffect(() => {
    const audio = new Audio("./assets/audio/rt_lab_master_soundtrack.mp3?v=20261024");
    audio.preload = "auto";
    masterAudioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      setIsVoiceActive(!audio.paused && audio.currentTime > 0.5);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setIsVoiceActive(false);
      setCurrentTime(0);
      setCurrentSceneIndex(0);
      studioAudio.playCelebrationChime();
      if (isRecording) {
        finishRecording();
      }
    };

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Calculate current scene and its progress based on master playback time
  const getCurrentSceneAndProgress = () => {
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      if (currentTime <= accumulated + s.duration || i === scenes.length - 1) {
        const sceneTime = Math.max(0, currentTime - accumulated);
        const progress = Math.min(1.0, sceneTime / s.duration);
        return { index: i, scene: s, sceneProgress: progress };
      }
      accumulated += s.duration;
    }
    return { index: 0, scene: scenes[0], sceneProgress: 0 };
  };

  const { index: activeIndex, scene: currentScene, sceneProgress } = getCurrentSceneAndProgress();

  useEffect(() => {
    if (activeIndex !== currentSceneIndex) {
      setCurrentSceneIndex(activeIndex);
    }
  }, [activeIndex, currentSceneIndex]);

  // Master Play/Pause Controller
  const handlePlayPause = () => {
    studioAudio.init();

    if (viewMode === "video-mp4") {
      if (videoElementRef.current) {
        if (videoElementRef.current.paused) {
          videoElementRef.current.play().catch(console.warn);
          setIsPlaying(true);
        } else {
          videoElementRef.current.pause();
          setIsPlaying(false);
        }
      }
      return;
    }

    // Interactive studio mode
    const audio = masterAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setIsVoiceActive(false);
    } else {
      audio.play().catch(console.warn);
      setIsPlaying(true);
      setIsVoiceActive(true);
    }
  };

  const handleRestart = () => {
    if (viewMode === "video-mp4") {
      if (videoElementRef.current) {
        videoElementRef.current.currentTime = 0;
        videoElementRef.current.play().catch(console.warn);
        setIsPlaying(true);
      }
      return;
    }

    const audio = masterAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      setCurrentSceneIndex(0);
      audio.play().catch(console.warn);
      setIsPlaying(true);
      setIsVoiceActive(true);
    }
  };

  const handleSelectScene = (index: number) => {
    let acc = 0;
    for (let i = 0; i < index; i++) {
      acc += scenes[i].duration;
    }
    const targetTime = acc + 0.1;

    if (viewMode === "video-mp4" && videoElementRef.current) {
      videoElementRef.current.currentTime = targetTime;
    }

    const audio = masterAudioRef.current;
    if (audio) {
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
      setCurrentSceneIndex(index);
      if (isPlaying) {
        audio.play().catch(console.warn);
      }
    }
  };

  const handleNextScene = () => {
    if (currentSceneIndex < scenes.length - 1) {
      handleSelectScene(currentSceneIndex + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      handleSelectScene(currentSceneIndex - 1);
    }
  };

  const handleUpdateScene = (updated: VideoScene) => {
    setScenes((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s));
      try {
        localStorage.setItem("rt_lab_custom_scenes_v2", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save scenes:", e);
      }
      return next;
    });
    setHasCustomScenes(true);
    setViewMode("interactive");
    studioAudio.playMedicalDing();
  };

  const handleResetScenes = () => {
    try {
      localStorage.removeItem("rt_lab_custom_scenes_v2");
      localStorage.removeItem("rt_lab_custom_scenes");
    } catch {}
    setScenes(DEFAULT_SCENES);
    setHasCustomScenes(false);
    studioAudio.playCelebrationChime();
  };

  // Video Export & Recording
  const handleStartExportVideo = async () => {
    if (!canvasRef.current) return;
    studioAudio.init();
    setIsRecording(true);

    const audio = masterAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setCurrentTime(0);
    setCurrentSceneIndex(0);

    const started = videoRecorder.startRecording(canvasRef.current, 30);
    if (!started) {
      setIsRecording(false);
      return;
    }

    if (audio) {
      audio.play().catch(console.warn);
      setIsPlaying(true);
    }
  };

  const finishRecording = async () => {
    setIsPlaying(false);
    setIsVoiceActive(false);

    if (masterAudioRef.current) {
      masterAudioRef.current.pause();
    }

    const blob = await videoRecorder.stopRecording();
    setIsRecording(false);
    if (blob) {
      await videoRecorder.downloadVideo(blob, `RT-Lab-21st-Anniversary-Custom.mp4`);
      studioAudio.playCelebrationChime();
    }
  };

  const downloadDirectMP4 = () => {
    setShowDownloadModal(true);
  };

  const downloadMasterAudioMP3 = () => {
    const a = document.createElement("a");
    a.href = "./assets/audio/rt_lab_master_soundtrack.mp3?v=20261024";
    a.download = "RT-Lab-21st-Anniversary-Audio-Promo.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    studioAudio.playCelebrationChime();
  };

  const toggleFullscreen = () => {
    const target = viewMode === "video-mp4" ? videoElementRef.current : canvasRef.current;
    if (!target) return;
    if (!document.fullscreenElement) {
      target.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* 1. Top Navigation & Brand Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-rose-900/40 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-700 to-amber-500 p-0.5 shadow-lg shadow-rose-950">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-rose-400 text-lg">
                RT
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-wide">
                  معامل RT للتحاليل الطبية
                </h1>
                <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                  ★ 21st ANNIVERSARY ★
                </span>
              </div>
              <p className="text-xs text-rose-300 font-semibold flex items-center gap-2">
                <span>إعلان فيديو متواصل • صوت واضح وموسيقى رقيقة</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">خصم يصل إلى 90%</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="tel:01100874444"
              className="bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              01100874444
            </a>

            <a
              href="tel:01100046841"
              className="bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              01100046841
            </a>

            <a
              href="https://wa.me/201100874444?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D8%B9%D8%A7%D9%85%D9%84%20RT%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%A7%D8%AF%D8%A9%20%D9%85%D9%86%20%D8%AE%D8%B5%D9%85%20%D8%A7%D9%84%D9%80%2090%25%20%D8%A8%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9%20%D9%85%D8%B1%D9%88%D8%B1%2021%20%D8%B9%D8%A7%D9%85%D8%A7%D9%8B"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-green-950"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              واتساب للحجز
            </a>

            <button
              onClick={downloadDirectMP4}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-950 transition-all animate-pulse"
              title="تحميل ملف الفيديو بصيغة MP4 مباشرة لإرساله للعملاء"
            >
              <Download className="w-4 h-4" />
              تحميل الفيديو (MP4) 🎬
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        {/* Celebration Banner & Mode Selector */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border border-rose-500/30 p-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black text-sm">
                    إعلان عيد ميلاد معامل RT الحادي والعشرين (2005 - 2026)
                  </span>
                  <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow">
                    خصم يصل إلى 90%
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  فيديو متواصل ومكتمل بدون أي تأخير بين الصور مع صوت إلقاء واضح وموسيقى رقيقة وكلام مكتوب بدقة فائقة
                </p>
              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setViewMode("video-mp4");
                  setIsPlaying(false);
                  if (masterAudioRef.current) masterAudioRef.current.pause();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "video-mp4"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                فيديو العرض المباشر (MP4)
              </button>
              <button
                onClick={() => {
                  setViewMode("interactive");
                  setIsPlaying(false);
                  if (videoElementRef.current) videoElementRef.current.pause();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "interactive"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                الاستوديو التفاعلي بالكلمات المتزامنة
              </button>
            </div>
          </div>
        </div>

        {/* Custom scenes active indicator */}
        {hasCustomScenes && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-200 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">
                تم تفعيل وتطبيق تعديلاتك المخصصة على الصور والكلمات بنجاح في الاستوديو التفاعلي!
              </span>
            </div>
            <button
              onClick={handleResetScenes}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-white border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors"
            >
              استعادة المشاهد الأصلية ↺
            </button>
          </div>
        )}

        {/* Video Player / Canvas Viewport */}
        <div className="space-y-3">
          <div className="relative w-full aspect-video max-h-[580px] flex items-center justify-center bg-black/95 rounded-2xl overflow-hidden border border-rose-500/30 shadow-2xl">
            {/* Mode 1: Real Commercial MP4 Video Player */}
            {viewMode === "video-mp4" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoElementRef}
                  controls
                  playsInline
                  webkit-playsinline="true"
                  preload="metadata"
                  poster="./assets/aistudio/IMG_20261024_095029_246_b7abdac4.jpg"
                  className="w-full h-full object-contain"
                  onPlay={() => {
                    setIsPlaying(true);
                    setVideoError(null);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onError={() => {
                    setVideoError("إذا تعذر تشغيل الفيديو تلقائياً على متصفح الموبايل، يمكنك حفظ الفيديو مباشرة على هاتفك.");
                  }}
                  onTimeUpdate={(e) => {
                    const target = e.currentTarget;
                    setCurrentTime(target.currentTime);
                  }}
                >
                  <source
                    src="./assets/video/rt_lab_21st_anniversary_promo.mp4?v=20261024_faststart_v2"
                    type="video/mp4"
                  />
                  متصفحك لا يدعم تشغيل الفيديو مباشرة
                </video>

                {videoError && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
                    <p className="text-amber-300 text-xs font-bold leading-relaxed max-w-md">
                      {videoError}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setVideoError(null);
                          if (videoElementRef.current) {
                            videoElementRef.current.load();
                            videoElementRef.current.play().catch(() => {});
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg"
                      >
                        إعادة المحاولة ↺
                      </button>
                      <button
                        onClick={() => setShowDownloadModal(true)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-black shadow-lg"
                      >
                        حفظ الفيديو على هاتفك 📲
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Mode 2: Interactive Real-time Canvas with Large Synced Karaoke Subtitles */
              <>
                <CanvasRenderer
                  currentScene={currentScene}
                  sceneProgress={sceneProgress}
                  totalProgress={currentTime / totalDuration}
                  currentTime={currentTime}
                  totalDuration={totalDuration}
                  aspectRatio={aspectRatio}
                  isPlaying={isPlaying}
                  isVoiceActive={isVoiceActive}
                  onCanvasReady={(c) => {
                    canvasRef.current = c;
                  }}
                />

                {/* Big Center Play Button if paused */}
                {!isPlaying && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-950 border-4 border-white/80 hover:scale-110 transition-all z-20 group"
                  >
                    <Play className="w-12 h-12 fill-current translate-x-[-2px] group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </>
            )}

            {/* Recording Overlay */}
            {isRecording && (
              <div className="absolute top-4 inset-x-4 flex items-center justify-between bg-red-950/95 border border-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md z-30 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-white font-black">
                    جاري تسجيل وتصدير الفيديو: المشهد {currentSceneIndex + 1} من {scenes.length} ({Math.round(currentTime)} ث / {Math.round(totalDuration)} ث)
                  </span>
                </div>
                <button
                  onClick={finishRecording}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow transition-colors"
                >
                  إنهاء وتنزيل الفيديو الآن 💾
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Toolbar directly under video */}
          <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-3 shadow-xl flex flex-wrap items-center justify-between gap-4">
            {/* Play/Pause & Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevScene}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="المشهد السابق"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handlePlayPause}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg transition-all ${
                  isPlaying
                    ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950"
                    : "bg-rose-600 hover:bg-rose-500 shadow-rose-950 scale-105"
                }`}
                title={isPlaying ? "إيقاف مؤقت" : "تشغيل الإعلان المباشر"}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-[-1px]" />}
              </button>

              <button
                onClick={handleNextScene}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="المشهد التالي"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="إعادة من البداية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Time progress bar */}
            <div className="flex-1 min-w-[200px] flex items-center gap-3">
              <span className="font-mono text-xs text-rose-300 font-bold min-w-[42px]">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => {
                    const t = parseFloat(e.target.value);
                    if (viewMode === "video-mp4" && videoElementRef.current) {
                      videoElementRef.current.currentTime = t;
                    }
                    if (masterAudioRef.current) {
                      masterAudioRef.current.currentTime = t;
                    }
                    setCurrentTime(t);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 rounded-full"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate-400 min-w-[42px]">
                {formatTime(totalDuration)}
              </span>
            </div>

            {/* Direct Download Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                onClick={downloadDirectMP4}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all"
                title="تحميل الفيديو بصيغة MP4 لإرساله مباشرة للعملاء على واتساب وفيسبوك"
              >
                <Download className="w-3.5 h-3.5" />
                تحميل الفيديو MP4
              </button>

              <button
                onClick={downloadMasterAudioMP3}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 transition-all"
                title="تحميل الإعلان الصوتي فقط MP3"
              >
                <Volume2 className="w-3.5 h-3.5" />
                صوت MP3
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="ملء الشاشة"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Scene Timeline (5 Scenes) */}
        <SceneTimeline
          scenes={scenes}
          currentSceneIndex={currentSceneIndex}
          onSelectScene={handleSelectScene}
          onEditScene={(scene) => setEditingScene(scene)}
          currentTime={currentTime}
          totalDuration={totalDuration}
        />

        {/* 3. Audio & Music Mixer Panel */}
        <AudioMixerPanel
          voiceSettings={voiceSettings}
          onVoiceSettingsChange={setVoiceSettings}
          isVoiceActive={isVoiceActive}
        />

        {/* 4. Booking & Contact Details Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-rose-900/40 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-400" />
                معلومات الحجز والتواصل المباشر مع معامل RT
              </h3>
              <p className="text-xs text-slate-400">
                أرقام الحجز وسحب العينات المنزلي المجاني لجميع عملائنا الكرام
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                خدمة متواصلة 24/7 طوال أيام الأسبوع
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="tel:01100874444"
              className="bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">الرقم المباشر الأول</div>
                  <div className="text-2xl font-black text-white font-['Readex_Pro'] tracking-wider">
                    01100874444
                  </div>
                </div>
              </div>
              <span className="text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl font-bold group-hover:bg-emerald-500 transition-colors">
                اتصال الآن 📞
              </span>
            </a>

            <a
              href="tel:01100046841"
              className="bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">الرقم المباشر الثاني</div>
                  <div className="text-2xl font-black text-white font-['Readex_Pro'] tracking-wider">
                    01100046841
                  </div>
                </div>
              </div>
              <span className="text-xs bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl font-bold group-hover:bg-emerald-500 transition-colors">
                اتصال الآن 📞
              </span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <p>
          معامل RT للتحاليل الطبية • 21 عاماً من الثقة والدقة والرعاية الصحية الفائقة (2005 - 2026)
        </p>
        <p className="mt-1 text-slate-600">
          استوديو إعلانات الفيديو الرقمي • جميع الحقوق محفوظة لمعامل RT
        </p>
      </footer>

      {/* Modals */}
      {editingScene && (
        <SceneEditModal
          scene={editingScene}
          voiceSettings={voiceSettings}
          onClose={() => setEditingScene(null)}
          onSave={handleUpdateScene}
        />
      )}

      {showPosterModal && (
        <PosterModal onClose={() => setShowPosterModal(false)} />
      )}

      {showDownloadModal && (
        <VideoDownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </div>
  );
}
