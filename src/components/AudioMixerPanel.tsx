import React, { useState, useEffect } from "react";
import { studioAudio, MUSIC_PRESETS } from "../audio/audioEngine";
import { speechService } from "../services/speechService";
import { VoiceSettings } from "../types/scene";
import {
  Volume2,
  VolumeX,
  Music,
  Mic,
  Sparkles,
  Play,
  Square,
  Sliders,
  CheckCircle,
  Radio,
} from "lucide-react";

interface AudioMixerPanelProps {
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  isVoiceActive: boolean;
}

export const AudioMixerPanel: React.FC<AudioMixerPanelProps> = ({
  voiceSettings,
  onVoiceSettingsChange,
  isVoiceActive,
}) => {
  const [masterVol, setMasterVol] = useState(0.9);
  const [musicVol, setMusicVol] = useState(0.28);
  const [voiceVol, setVoiceVol] = useState(1.0);
  const [ducking, setDucking] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState("soft-piano");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [arabicVoices, setArabicVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    speechService.getArabicVoices().then(setArabicVoices);
  }, []);

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    studioAudio.setMasterVolume(val);
  };

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    studioAudio.setMusicVolume(val);
  };

  const handleVoiceChange = (val: number) => {
    setVoiceVol(val);
    studioAudio.setVoiceVolume(val);
  };

  const handleDuckingToggle = (val: boolean) => {
    setDucking(val);
    studioAudio.setDucking(val);
  };

  const toggleMusicPreview = () => {
    const playing = studioAudio.toggleMusic(selectedMusic);
    setIsMusicPlaying(playing);
    studioAudio.playClickSound();
  };

  const handleTrackSelect = (trackId: string) => {
    setSelectedMusic(trackId);
    if (isMusicPlaying) {
      studioAudio.stopMusic();
      studioAudio.startMusic(trackId);
    }
  };

  const testVoiceSample = async () => {
    if (isTestingVoice) {
      speechService.stop();
      setIsTestingVoice(false);
      return;
    }

    studioAudio.init();
    setIsTestingVoice(true);

    try {
      await studioAudio.playVoiceAudio("./assets/audio/scene-1.wav");
      setIsTestingVoice(false);
    } catch {
      setIsTestingVoice(false);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-rose-500/20 p-5 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-950/50">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              لوحة التحكم الصوتي والميكسر
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                موسيقى رقيقة + تعليق واضح
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              هندسة الصوت: توازن مثالي بين وضوح نبرة الصوت والموسيقى الهادئة
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isVoiceActive && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              التعليق الصوتي يعمل الآن
            </span>
          )}
        </div>
      </div>

      {/* 1. Voice Engine Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-400" />
            محرك التعليق الصوتي (Voiceover Engine)
          </label>
          <button
            onClick={testVoiceSample}
            disabled={isTestingVoice}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              isTestingVoice
                ? "bg-amber-600 text-white animate-pulse"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40"
            }`}
          >
            {isTestingVoice ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isTestingVoice ? "إيقاف التجربة" : "تجربة نبرة الصوت 🔊"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Gemini AI Voice */}
          <div
            onClick={() => onVoiceSettingsChange({ ...voiceSettings, engine: "gemini-ai" })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              voiceSettings.engine === "gemini-ai"
                ? "bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950"
                : "bg-slate-800/40 border-slate-700 hover:bg-slate-800/70"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-sm text-white">صوت الذكاء الاصطناعي (Gemini TTS)</span>
              </div>
              {voiceSettings.engine === "gemini-ai" && (
                <CheckCircle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              نبرة إذاعية فائقة الوضوح والاحترافية عبر نموذج Gemini 3.8 Flash TTS
            </p>

            {voiceSettings.engine === "gemini-ai" && (
              <div className="mt-3 pt-2 border-t border-rose-900/40 flex items-center gap-2">
                <span className="text-xs text-slate-300">النبرة:</span>
                <select
                  value={voiceSettings.geminiVoice}
                  onChange={(e) =>
                    onVoiceSettingsChange({
                      ...voiceSettings,
                      geminiVoice: e.target.value as any,
                    })
                  }
                  className="bg-slate-900 border border-rose-500/40 text-xs rounded-lg px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Kore">Kore - صوت نسائي دافئ وواثق (موصى به)</option>
                  <option value="Puck">Puck - صوت رجالي مبهج وحيوي</option>
                  <option value="Fenrir">Fenrir - صوت رجالي وقور ورسمي</option>
                  <option value="Zephyr">Zephyr - صوت هادئ ومريح</option>
                </select>
              </div>
            )}
          </div>

          {/* Web Speech Local */}
          <div
            onClick={() => onVoiceSettingsChange({ ...voiceSettings, engine: "webspeech" })}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              voiceSettings.engine === "webspeech"
                ? "bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950"
                : "bg-slate-800/40 border-slate-700 hover:bg-slate-800/70"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm text-white">قارئ النظام المباشر (Web Speech API)</span>
              </div>
              {voiceSettings.engine === "webspeech" && (
                <CheckCircle className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              صوت عربي سريع وفوري يعمل بدون أي تأخير ومناسب لكافة المتصفحات
            </p>

            {voiceSettings.engine === "webspeech" && (
              <div className="mt-3 pt-2 border-t border-cyan-900/40 flex items-center gap-2">
                <span className="text-xs text-slate-300">الصوت:</span>
                <select
                  value={voiceSettings.webSpeechVoiceURI || ""}
                  onChange={(e) =>
                    onVoiceSettingsChange({
                      ...voiceSettings,
                      webSpeechVoiceURI: e.target.value,
                    })
                  }
                  className="bg-slate-900 border border-cyan-500/40 text-xs rounded-lg px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 max-w-[200px] truncate"
                >
                  {arabicVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {arabicVoices.length === 0 && <option value="">الصوت العربي التلقائي</option>}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Gentle Background Music Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            الموسيقى الرقيقة المصاحبة (Gentle Background Music)
          </label>
          <button
            onClick={toggleMusicPreview}
            className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
              isMusicPlaying
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
            }`}
          >
            {isMusicPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isMusicPlaying ? "إيقاف الموسيقى" : "تشغيل عينة الموسيقى 🎵"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {MUSIC_PRESETS.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(track.id)}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                selectedMusic === track.id
                  ? "bg-amber-950/40 border-amber-500 text-amber-200 shadow-md shadow-amber-950"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <div className="font-bold text-xs">{track.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{track.description}</div>
              <div className="mt-2 text-[10px] text-amber-400 font-semibold">{track.bpm} نبضة/دقيقة</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Audio Levels & Smart Ducking */}
      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-4">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>مستويات الصوت والميكسر (Equalizer & Levels)</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ducking}
              onChange={(e) => handleDuckingToggle(e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
            <span className="text-xs text-rose-300 font-semibold">
              خفت الموسيقى التلقائي أثناء الكلام (Audio Ducking)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Master Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                الصوت العام الرئيسي
              </span>
              <span className="text-rose-400 font-mono font-bold">{Math.round(masterVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVol}
              onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Voiceover Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                صوت التعليق (واضح وبارز)
              </span>
              <span className="text-emerald-400 font-mono font-bold">{Math.round(voiceVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceVol}
              onChange={(e) => handleVoiceChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Gentle Music Volume */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                الموسيقى الرقيقة الخلفية
              </span>
              <span className="text-amber-400 font-mono font-bold">{Math.round(musicVol * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={musicVol}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
