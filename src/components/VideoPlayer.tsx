import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Mic,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Phone,
  MessageCircle,
  Sparkles,
  Share2,
  Monitor,
  Smartphone,
  Square,
  CheckCircle2,
  Layers,
  HeartPulse,
} from 'lucide-react';
import { AdScene, PHONE_NUMBERS } from '../data/adData';
import { audioEngine } from '../services/audioEngine';

interface VideoPlayerProps {
  scenes: AdScene[];
  currentSceneIndex: number;
  onSceneChange: (index: number) => void;
  onOpenBooking: () => void;
  onExplorePackages: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  scenes,
  currentSceneIndex,
  onSceneChange,
  onOpenBooking,
  onExplorePackages,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16-9' | '9-16' | '1-1'>('16-9');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.25);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [sceneProgress, setSceneProgress] = useState<number>(0);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [userHasInteracted, setUserHasInteracted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [hasStartedFirstTime, setHasStartedFirstTime] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Stop audio and timers
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    audioEngine.stopNarration();
    audioEngine.stopGentleAmbientMusic();
    if (sceneTimerRef.current !== null) {
      clearTimeout(sceneTimerRef.current);
      sceneTimerRef.current = null;
    }
    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Play current scene with voice narration and music
  const playCurrentScene = useCallback((index: number) => {
    const scene = scenes[index];
    if (!scene) return;

    // Reset progress
    setSceneProgress(0);
    setCurrentWord('');
    setCurrentWordIndex(-1);

    // Audio cue
    audioEngine.playSceneChime();

    // Start background ambient music if not running
    if (!isMusicMuted) {
      audioEngine.startGentleAmbientMusic();
    }

    // Speak narration
    audioEngine.speakNarration(
      scene.voiceoverScript,
      (word, wordIdx) => {
        setCurrentWord(word);
        setCurrentWordIndex(wordIdx);
      },
      () => {
        // Narration ended
      }
    );

    // Track visual progress
    const durationMs = (scene.duration / playbackSpeed) * 1000;
    const startTime = Date.now();

    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setSceneProgress(pct);
    }, 50);

    // Timer to next scene
    if (sceneTimerRef.current !== null) {
      clearTimeout(sceneTimerRef.current);
    }

    sceneTimerRef.current = window.setTimeout(() => {
      if (index < scenes.length - 1) {
        onSceneChange(index + 1);
      } else {
        // Loop back to start or stay on last scene
        onSceneChange(0);
      }
    }, durationMs);
  }, [scenes, playbackSpeed, isMusicMuted, onSceneChange]);

  // Handle play / pause toggle
  const togglePlay = () => {
    setUserHasInteracted(true);
    setHasStartedFirstTime(true);

    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      playCurrentScene(currentSceneIndex);
    }
  };

  // Switch scene
  const goToScene = (index: number) => {
    setUserHasInteracted(true);
    onSceneChange(index);
    if (isPlaying) {
      playCurrentScene(index);
    }
  };

  // Restart video from beginning
  const restartVideo = () => {
    setUserHasInteracted(true);
    onSceneChange(0);
    setIsPlaying(true);
    playCurrentScene(0);
  };

  // React to scene index changes when playing
  useEffect(() => {
    if (isPlaying) {
      playCurrentScene(currentSceneIndex);
    }
  }, [currentSceneIndex, isPlaying, playCurrentScene]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Handle voice mute toggle
  const toggleVoiceMute = () => {
    const nextState = !isVoiceMuted;
    setIsVoiceMuted(nextState);
    audioEngine.setVoiceMuted(nextState);
    if (!nextState && isPlaying) {
      // re-speak if unmuting
      audioEngine.speakNarration(currentScene.voiceoverScript);
    }
  };

  // Handle music mute toggle
  const toggleMusicMute = () => {
    const nextState = !isMusicMuted;
    setIsMusicMuted(nextState);
    audioEngine.setMusicMuted(nextState);
    if (!nextState && isPlaying) {
      audioEngine.startGentleAmbientMusic();
    }
  };

  // Handle music volume change
  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
    audioEngine.setMusicVolume(val);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Share ad link
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'معامل رامي مختار RT LAB - الفحص الشامل المخفض',
          text: 'ترقبوا انطلاق الفحص الشامل المخفض من معامل رامي مختار RT LAB بـ 3 باقات لجميع الأعمار!',
          url: window.location.href,
        });
      } catch {
        // ignore share cancellation
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الإعلان بنجاح!');
    }
  };

  // Aspect ratio classes
  const aspectClasses = {
    '16-9': 'aspect-video max-w-5xl',
    '9-16': 'aspect-[9/16] max-w-sm',
    '1-1': 'aspect-square max-w-2xl',
  }[aspectRatio];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls Bar: Aspect Ratio & Mode */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-3 px-2 sm:px-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">مقاس العرض:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setAspectRatio('16-9')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                aspectRatio === '16-9' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض سينمائي وشاشات العرض (16:9)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>16:9 سينمائي</span>
            </button>
            <button
              onClick={() => setAspectRatio('9-16')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                aspectRatio === '9-16' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="ريلز وتيك توك وستوري الجوال (9:16)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 ريلز</span>
            </button>
            <button
              onClick={() => setAspectRatio('1-1')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                aspectRatio === '1-1' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="مربع للسوشيال ميديا (1:1)"
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1 مربع</span>
            </button>
          </div>
        </div>

        {/* Audio Indicators & Speed */}
        <div className="flex items-center gap-2">
          {/* Sound wave equalizer indicator */}
          <div
            className={`flex items-center gap-0.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg ${
              isPlaying ? 'border-red-500/40' : ''
            }`}
          >
            <span className="text-xs text-slate-400 ml-1.5 flex items-center gap-1">
              <HeartPulse className={`w-3.5 h-3.5 ${isPlaying ? 'text-red-500 animate-pulse' : 'text-slate-600'}`} />
              <span>{isPlaying ? 'الصوت والموسيقى نشطة' : 'متوقف'}</span>
            </span>
            <span className={`w-1 bg-red-500 rounded-full ${isPlaying ? 'animate-soundwave-1' : 'h-1'}`} />
            <span className={`w-1 bg-rose-400 rounded-full ${isPlaying ? 'animate-soundwave-2' : 'h-1.5'}`} />
            <span className={`w-1 bg-amber-400 rounded-full ${isPlaying ? 'animate-soundwave-3' : 'h-1'}`} />
            <span className={`w-1 bg-blue-400 rounded-full ${isPlaying ? 'animate-soundwave-4' : 'h-2'}`} />
            <span className={`w-1 bg-red-400 rounded-full ${isPlaying ? 'animate-soundwave-5' : 'h-1'}`} />
          </div>

          {/* Speed Selector */}
          <button
            onClick={() => {
              const speeds = [0.85, 1, 1.15];
              const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              setPlaybackSpeed(next);
              audioEngine.setVoiceRate(next * 0.95);
            }}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-2 py-1 rounded-lg text-xs font-semibold"
            title="سرعة التشغيل"
          >
            {playbackSpeed}x
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg"
            title="مشاركة الإعلان"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div
        ref={containerRef}
        className={`relative w-full ${aspectClasses} mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl shadow-red-950/40 border border-red-900/40 group select-none transition-all duration-300`}
      >
        {/* Background Ken Burns animated image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            key={currentScene.image}
            src={currentScene.image}
            alt={currentScene.alt}
            className={`w-full h-full object-cover animate-${currentScene.animationStyle} transition-opacity duration-700`}
          />

          {/* Luxury Vignette & Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />
        </div>

        {/* Top Video Brand Header Badge */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-white font-black text-xs sm:text-sm tracking-wider">
              <span className="text-red-500">RT</span> LAB LABORATORIES
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">| معامل رامي مختار</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md border border-red-400/40 animate-pulse">
              {currentScene.badge || 'الفحص الشامل المخفض'}
            </span>
            <span className="bg-slate-950/80 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
              مشهد {currentSceneIndex + 1} من {scenes.length}
            </span>
          </div>
        </div>

        {/* Center Prompt / Play button when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs p-6 text-center">
            <div className="relative mb-5 cursor-pointer" onClick={togglePlay}>
              <div className="absolute inset-0 rounded-full bg-red-600 blur-xl opacity-75 animate-pulse" />
              <button className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white flex items-center justify-center shadow-2xl shadow-red-900 border-2 border-white/30 transform hover:scale-105 active:scale-95 transition-all">
                <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-white translate-x-1" />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 max-w-md">
              {hasStartedFirstTime ? 'متابعة تشغيل الإعلان' : 'تشغيل إعلان الفحص الشامل المخفض الآن'}
            </h3>
            <p className="text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
              شاهد الإعلان بالصوت الواضح والموسيقى الرقيقة الهادئة، وتعرف على الباقات الـ 3 وأرقام الحجز والاستفسار
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={togglePlay}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-900/60 flex items-center gap-2 text-sm transition-all animate-glow-pulse"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>تشغيل الإعلان فوراً بالصوت</span>
              </button>
              <button
                onClick={onOpenBooking}
                className="bg-slate-900/90 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl border border-white/10 text-sm transition-all"
              >
                حجز مسبق عبر واتساب
              </button>
            </div>
          </div>
        )}

        {/* Center Animated Scene Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 pointer-events-none pb-24 sm:pb-28">
          <div className="max-w-2xl space-y-2 transform transition-all duration-500">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-600/40 text-red-300 px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentScene.tagline}</span>
            </div>

            {/* Scene Main Title */}
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
              {currentScene.title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 font-medium drop-shadow leading-relaxed">
              {currentScene.subtitle}
            </p>

            {/* Special Visual Highlight for Scene 3 (The 3 Packages) */}
            {currentScene.id === 3 && (
              <div className="grid grid-cols-3 gap-2 pt-2 pointer-events-auto">
                <div
                  onClick={onExplorePackages}
                  className="bg-blue-950/70 hover:bg-blue-900/80 border border-blue-500/40 p-2 sm:p-3 rounded-xl cursor-pointer transition-all"
                >
                  <span className="block text-[10px] text-blue-300 font-bold">الباقة 1</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-white">الأساسية</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">خصم 45%</span>
                </div>
                <div
                  onClick={onExplorePackages}
                  className="bg-red-950/80 hover:bg-red-900/90 border border-red-500/50 p-2 sm:p-3 rounded-xl cursor-pointer transition-all ring-1 ring-red-400/50"
                >
                  <span className="block text-[10px] text-rose-300 font-bold">الباقة 2</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-white">المتقدمة الشاملة</span>
                  <span className="text-[10px] text-amber-300 font-bold">خصم 50%</span>
                </div>
                <div
                  onClick={onExplorePackages}
                  className="bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/40 p-2 sm:p-3 rounded-xl cursor-pointer transition-all"
                >
                  <span className="block text-[10px] text-amber-300 font-bold">الباقة 3</span>
                  <span className="block text-xs sm:text-sm font-extrabold text-white">الذهبية لكبار السن</span>
                  <span className="text-[10px] text-amber-400 font-semibold">خصم 55%</span>
                </div>
              </div>
            )}

            {/* Special Visual Highlight for Scene 6 (The Phone Numbers & CTA) */}
            {currentScene.id === 6 && (
              <div className="pt-2 flex flex-wrap gap-2 pointer-events-auto">
                {PHONE_NUMBERS.map((p) => (
                  <a
                    key={p.raw}
                    href={p.telLink}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black px-3.5 py-2 rounded-xl text-sm sm:text-base shadow-xl border border-red-300/40 animate-glow-pulse"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span dir="ltr">{p.formatted}</span>
                  </a>
                ))}
                <a
                  href={PHONE_NUMBERS[0].waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-sm sm:text-base shadow-lg border border-emerald-400/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>احجز عبر واتساب فوراً</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Subtitles / Teleprompter Display with Live Word Highlighting */}
        {showSubtitles && (
          <div className="absolute bottom-16 sm:bottom-20 left-4 right-4 z-20 pointer-events-none flex justify-center">
            <div className="max-w-3xl bg-slate-950/90 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow-2xl text-center">
              <p className="text-xs sm:text-sm md:text-base font-semibold leading-relaxed text-slate-300">
                {currentScene.voiceoverScript.split(/\s+/).map((w, idx) => {
                  const isActive = idx === currentWordIndex;
                  return (
                    <span
                      key={idx}
                      className={`inline-block mx-1 transition-all duration-150 ${
                        isActive
                          ? 'text-amber-300 font-extrabold scale-110 drop-shadow-md underline decoration-red-500 decoration-2'
                          : idx < currentWordIndex
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {w}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-3 sm:p-4">
          {/* Timeline Scrubber */}
          <div className="w-full flex items-center gap-2 mb-2">
            <div className="flex-1 flex gap-1 h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
              {scenes.map((scene, idx) => {
                const isCurrent = idx === currentSceneIndex;
                const isPast = idx < currentSceneIndex;
                return (
                  <div
                    key={scene.id}
                    onClick={() => goToScene(idx)}
                    className="flex-1 h-full bg-slate-700/60 rounded-full overflow-hidden cursor-pointer hover:bg-slate-600 transition-colors relative"
                    title={`المشهد ${idx + 1}: ${scene.title}`}
                  >
                    {isPast && <div className="w-full h-full bg-red-600" />}
                    {isCurrent && (
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-75"
                        style={{ width: `${sceneProgress}%` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between gap-2 text-white">
            {/* Left buttons: Play/Pause, Next, Prev, Restart */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={togglePlay}
                className="p-2 sm:p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all shadow-md active:scale-95"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />}
              </button>

              <button
                onClick={() => goToScene(Math.max(0, currentSceneIndex - 1))}
                disabled={currentSceneIndex === 0}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-all"
                title="المشهد السابق"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => goToScene(Math.min(scenes.length - 1, currentSceneIndex + 1))}
                disabled={currentSceneIndex === scenes.length - 1}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-all"
                title="المشهد التالي"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={restartVideo}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all"
                title="إعادة تشغيل الإعلان من البداية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Scene indicator */}
              <span className="text-xs font-semibold text-slate-300 mr-2 hidden sm:inline">
                {currentSceneIndex + 1} / {scenes.length}
              </span>
            </div>

            {/* Right buttons: Voice, Music, Subtitles, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Voiceover Mute Toggle */}
              <button
                onClick={toggleVoiceMute}
                className={`p-1.5 sm:p-2 rounded-lg transition-all flex items-center gap-1 text-xs ${
                  isVoiceMuted
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-red-950/70 border border-red-600/40 text-red-300'
                }`}
                title={isVoiceMuted ? 'تفعيل الصوت والتعليق الصوتي' : 'كتم التعليق الصوتي'}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isVoiceMuted ? 'التعليق صامت' : 'التعليق الصوتي'}</span>
              </button>

              {/* Music Mute Toggle & Volume */}
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-lg">
                <button
                  onClick={toggleMusicMute}
                  className={`p-0.5 text-xs transition-colors ${
                    isMusicMuted ? 'text-slate-500' : 'text-blue-400'
                  }`}
                  title={isMusicMuted ? 'تشغيل الموسيقى الهادئة' : 'كتم الموسيقى'}
                >
                  <Music className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.02"
                  value={isMusicMuted ? 0 : musicVolume}
                  onChange={handleMusicVolumeChange}
                  className="w-12 sm:w-16 h-1 bg-slate-700 accent-red-500 rounded cursor-pointer"
                  title="مستوى صوت الموسيقى الهادئة"
                />
              </div>

              {/* Subtitles Toggle */}
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition-all ${
                  showSubtitles ? 'bg-amber-950/70 border border-amber-600/40 text-amber-300' : 'bg-slate-900 text-slate-500'
                }`}
                title="إظهار / إخفاء الترجمة والنصوص"
              >
                CC
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all"
                title="ملء الشاشة"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Direct Actions Strip beneath video */}
      <div className="w-full max-w-5xl mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 px-2 sm:px-0">
        <a
          href={PHONE_NUMBERS[0].waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold p-3.5 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all transform hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5" />
          <div className="text-right">
            <span className="block text-xs text-emerald-200">حجز فوري مباشر عبر واتساب</span>
            <span className="text-sm font-black" dir="ltr">{PHONE_NUMBERS[0].formatted}</span>
          </div>
        </a>

        <a
          href={PHONE_NUMBERS[1].telLink}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold p-3.5 rounded-xl shadow-lg shadow-red-950/40 border border-red-400/30 transition-all transform hover:-translate-y-0.5"
        >
          <Phone className="w-5 h-5" />
          <div className="text-right">
            <span className="block text-xs text-rose-200">الخط الساخن واستفسارات الحجز</span>
            <span className="text-sm font-black" dir="ltr">{PHONE_NUMBERS[1].formatted}</span>
          </div>
        </a>

        <button
          onClick={onExplorePackages}
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold p-3.5 rounded-xl border border-slate-700/70 transition-all transform hover:-translate-y-0.5"
        >
          <Layers className="w-5 h-5 text-amber-400" />
          <div className="text-right">
            <span className="block text-xs text-slate-400">استكشف تفاصيل الفحوصات</span>
            <span className="text-sm font-black text-amber-300">الـ 3 باقات وخصم الـ 55%</span>
          </div>
        </button>
      </div>
    </div>
  );
};
