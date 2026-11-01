import React, { useState, useEffect } from 'react';
import {
  Mic,
  Music,
  Sparkles,
  Sliders,
  Volume2,
  RefreshCw,
  Play,
  RotateCcw,
  Check,
  Wand2,
  Image as ImageIcon,
  Clock,
  ChevronRight,
  Headphones,
  Settings2,
} from 'lucide-react';
import { AdScene, GALLERY_IMAGES } from '../data/adData';
import { audioEngine } from '../services/audioEngine';
import { SCRIPT_STYLES, generateRefinedAdScript } from '../services/geminiService';

interface StudioControlsProps {
  scenes: AdScene[];
  currentSceneIndex: number;
  onUpdateScene: (sceneId: number, updatedFields: Partial<AdScene>) => void;
  onSceneChange: (index: number) => void;
  onPlayCurrentScene: (index: number) => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  scenes,
  currentSceneIndex,
  onUpdateScene,
  onSceneChange,
  onPlayCurrentScene,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<number>(scenes[currentSceneIndex]?.id || 1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [voiceRate, setVoiceRate] = useState<number>(0.95);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [activeStyle, setActiveStyle] = useState<string>('exciting');
  const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState<boolean>(false);

  const activeScene = scenes.find((s) => s.id === selectedSceneId) || scenes[0];

  // Load voices
  useEffect(() => {
    const voices = audioEngine.getAvailableVoices();
    setAvailableVoices(voices);
    const selected = audioEngine.getSelectedVoice();
    if (selected) {
      setSelectedVoiceName(selected.name);
    }
  }, []);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = availableVoices.find((v) => v.name === e.target.value);
    if (voice) {
      setSelectedVoiceName(voice.name);
      audioEngine.setVoice(voice);
    }
  };

  const handleRateChange = (rate: number) => {
    setVoiceRate(rate);
    audioEngine.setVoiceRate(rate);
  };

  const handlePitchChange = (pitch: number) => {
    setVoicePitch(pitch);
    audioEngine.setVoicePitch(pitch);
  };

  // Test single scene audio narration
  const handleTestSceneVoice = () => {
    if (isTestingAudio) {
      audioEngine.stopNarration();
      setIsTestingAudio(false);
      return;
    }
    setIsTestingAudio(true);
    audioEngine.playSceneChime();
    audioEngine.speakNarration(
      activeScene.voiceoverScript,
      () => {},
      () => {
        setIsTestingAudio(false);
      }
    );
  };

  // AI Script Enhancement
  const handleApplyAiStyle = async (styleId: string) => {
    setIsAiLoading(true);
    setActiveStyle(styleId);
    try {
      const refined = await generateRefinedAdScript(
        activeScene.voiceoverScript,
        styleId,
        activeScene.title
      );
      onUpdateScene(activeScene.id, { voiceoverScript: refined });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-red-950/70 border border-red-600/40 text-red-300 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Mic className="w-3.5 h-3.5" />
            <span>استوديو الصوت والتحكم الذكي بالإعلان</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            تحرير نصوص التعليق الصوتي وضبط نبرة الذكاء الاصطناعي
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            عدّل أي نص إعلاني، واختر النبرة التسويقية المناسبة، واختبر صوت المعلق والموسيقى فوراً
          </p>
        </div>

        {/* Quick Audition Player Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayCurrentScene(scenes.findIndex((s) => s.id === activeScene.id))}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-lg shadow-red-900/40 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>مشاهدة هذا المشهد في الفيديو</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scene selector + Script Editor & AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scene list selector (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold text-slate-400 block mb-2">مشاهد الإعلان (اختر مشهداً للتعديل):</span>
          {scenes.map((sc, idx) => {
            const isSelected = sc.id === selectedSceneId;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  setSelectedSceneId(sc.id);
                  onSceneChange(idx);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-red-500 ring-1 ring-red-500/50 shadow-lg shadow-red-950/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <img
                  src={sc.image}
                  alt={sc.title}
                  className="w-14 h-11 object-cover rounded-lg border border-slate-700/60 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-red-400">مشهد {idx + 1}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{sc.duration} ثوانٍ</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{sc.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{sc.voiceoverScript}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Scene Editor & Audio Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Scene Editor Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-red-900/60 text-red-300 font-bold text-xs border border-red-700/40">
                  المشهد {activeScene.id}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">{activeScene.title}</h3>
              </div>

              {/* Photo & Duration Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>تغيير صورة المشهد</span>
                </button>

                {/* Duration */}
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                  <span className="text-slate-400">المدة:</span>
                  <select
                    value={activeScene.duration}
                    onChange={(e) => onUpdateScene(activeScene.id, { duration: parseInt(e.target.value) })}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    {[5, 6, 7, 8, 9, 10, 12, 15].map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">
                        {d} ثوانٍ
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Photo Picker Drawer */}
            {showPhotoPicker && (
              <div className="mb-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  اختر صورة من صور معامل RT LAB الـ 13 لهذا المشهد:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                  {GALLERY_IMAGES.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onUpdateScene(activeScene.id, { image: img.path });
                        setShowPhotoPicker(false);
                      }}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                        activeScene.image === img.path
                          ? 'border-red-500 ring-2 ring-red-400'
                          : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.path} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Script Textarea */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-red-500" />
                  <span>نص التعليق الصوتي المنطوق باللغة العربية (Voiceover Script):</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {activeScene.voiceoverScript.length} حرف / {activeScene.voiceoverScript.split(/\s+/).length} كلمة
                </span>
              </div>
              <textarea
                rows={3}
                value={activeScene.voiceoverScript}
                onChange={(e) => onUpdateScene(activeScene.id, { voiceoverScript: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl p-3 text-sm text-slate-100 leading-relaxed transition-all resize-none font-medium"
                placeholder="اكتب هنا ما سينطقه المعلق الصوتي باللغة العربية..."
              />
            </div>

            {/* Test Voice Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <button
                onClick={handleTestSceneVoice}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isTestingAudio
                    ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isTestingAudio ? 'إيقاف الاختبار الصوتي' : 'استمع للتعليق الصوتي لهذا المشهد الآن'}</span>
              </button>
            </div>

            {/* AI Script Styling Box */}
            <div className="bg-slate-950/70 border border-red-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-black text-white">
                  ضبط النبرة الإعلانية والتسويقية الذكية
                </h4>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  AI Marketing Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                اختر الأسلوب الإعلاني المطلوب ليقوم الذكاء الاصطناعي بإعادة صياغة التعليق الصوتي بما يشد انتباه العميل:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {SCRIPT_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleApplyAiStyle(style.id)}
                    disabled={isAiLoading}
                    className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      activeStyle === style.id
                        ? 'bg-red-950/60 border-red-500/60 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1 text-red-300">{style.name}</span>
                    <span className="text-[11px] text-slate-400 block leading-snug">{style.description}</span>
                  </button>
                ))}
              </div>

              {isAiLoading && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-amber-300 font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري تحسين النص بالذكاء الاصطناعي وضبط الكلمات...</span>
                </div>
              )}
            </div>
          </div>

          {/* Master Voice & Sound Engine Settings */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <Settings2 className="w-4 h-4 text-red-500" />
              <h3 className="text-sm sm:text-base font-black text-white">
                إعدادات الصوت والمحرك الصوتي العام (Audio Engine Master)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  صوت المعلق الصوتي المتاح على جهازك:
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={handleVoiceChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-xs text-white"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * يتعرف النظام تلقائياً على الأصوات العربية المعتمدة بجهازك (مثل Google العربية، ماجد، ليلى)
                </span>
              </div>

              {/* Voice Pace Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">سرعة الإلقاء (Voice Pacing):</label>
                  <span className="text-xs text-amber-300 font-semibold">{voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.3"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 accent-red-500 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>متأنٍ ومطمئن (0.75x)</span>
                  <span>معتدل فصيح (1.0x)</span>
                  <span>حماسي سريع (1.3x)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
