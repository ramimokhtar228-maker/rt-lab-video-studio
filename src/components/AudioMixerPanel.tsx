import React, { useState, useEffect } from "react";
import { studioAudio, MUSIC_PRESETS } from "../audio/audioEngine";
import { speechService, VOICE_PERSONAS, VoiceOption } from "../services/speechService";
import { VoiceSettings, VoicePersona } from "../types/scene";
import {
  Volume2,
  Music,
  Mic,
  Sparkles,
  Play,
  Square,
  Sliders,
  CheckCircle,
  Radio,
  Heart,
  VolumeX,
} from "lucide-react";

interface AudioMixerPanelProps {
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  selectedMusicTrack?: string;
  onMusicTrackChange?: (trackId: string) => void;
  isVoiceActive: boolean;
}

export const AudioMixerPanel: React.FC<AudioMixerPanelProps> = ({
  voiceSettings,
  onVoiceSettingsChange,
  selectedMusicTrack = "master-soundtrack",
  onMusicTrackChange,
  isVoiceActive,
}) => {
  const [masterVol, setMasterVol] = useState(0.95);
  const [musicVol, setMusicVol] = useState(0.24);
  const [voiceVol, setVoiceVol] = useState(1.0);
  const [ducking, setDucking] = useState(true);
  const [currentTrackId, setCurrentTrackId] = useState(selectedMusicTrack);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testingPersonaId, setTestingPersonaId] = useState<string | null>(null);
  const [arabicVoices, setArabicVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    speechService.getArabicVoices().then(setArabicVoices);
  }, []);

  useEffect(() => {
    if (selectedMusicTrack && selectedMusicTrack !== currentTrackId) {
      setCurrentTrackId(selectedMusicTrack);
    }
  }, [selectedMusicTrack]);

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
    const playing = studioAudio.toggleMusic(currentTrackId);
    setIsMusicPlaying(playing);
    studioAudio.playClickSound();
  };

  const handleTrackSelect = (trackId: string) => {
    setCurrentTrackId(trackId);
    studioAudio.changeTrack(trackId);
    setIsMusicPlaying(trackId !== "none");
    if (onMusicTrackChange) {
      onMusicTrackChange(trackId);
    }
    studioAudio.playClickSound();
  };

  const handleSelectPersona = (persona: VoiceOption) => {
    const isEgyptian = persona.category === "egyptian";
    const newSettings: VoiceSettings = {
      ...voiceSettings,
      persona: persona.id,
      dialect: isEgyptian ? "egyptian" : "standard",
      geminiVoice: persona.geminiVoice,
      engine: persona.engine,
    };
    onVoiceSettingsChange(newSettings);
    studioAudio.playClickSound();
  };

  const testVoiceSample = async (persona: VoiceOption) => {
    if (isTestingVoice) {
      speechService.stop();
      setIsTestingVoice(false);
      setTestingPersonaId(null);
      return;
    }

    studioAudio.init();
    setIsTestingVoice(true);
    setTestingPersonaId(persona.id);

    try {
      if (persona.sampleAudioSrc) {
        await studioAudio.playVoiceAudio(persona.sampleAudioSrc);
      } else {
        const testText = persona.category === "egyptian"
          ? "أهلاً بحضراتكم في معامل رامي مختار RT، بنقدملكم خصم بيوصل لحد 90% بمناسبة عيد ميلادنا الـ 21."
          : "أهلاً وسهلاً بكم في معامل رامي مختار RT للتحاليل الطبية بمناسبة مرور 21 عاماً من التميز والريادة.";
        await speechService.speakText(
          testText,
          {
            ...voiceSettings,
            persona: persona.id,
            dialect: persona.category === "egyptian" ? "egyptian" : "standard",
            geminiVoice: persona.geminiVoice,
            engine: persona.engine,
          }
        );
      }
    } catch (err) {
      console.warn("Voice test error:", err);
    } finally {
      setIsTestingVoice(false);
      setTestingPersonaId(null);
    }
  };

  const egyptianVoices = VOICE_PERSONAS.filter((p) => p.category === "egyptian");
  const standardVoices = VOICE_PERSONAS.filter((p) => p.category === "standard");

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl border border-rose-500/20 p-5 shadow-2xl space-y-6 text-slate-100 text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-950/50">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              لوحة التحكم الصوتي والموسيقي
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border border-amber-500/30">
                أصوات مصرية عامية + فصحى إذاعية
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              تغيير صوت القارئ والموسيقى التصويرية المصاحبة في الفيديو فورياً
            </p>
          </div>
        </div>

        {/* Live Audio Indicator */}
        <div className="flex items-center gap-2">
          {isVoiceActive ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              صوت القارئ يعمل الآن
            </span>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/60">
              جاهز للتشغيل
            </span>
          )}
        </div>
      </div>

      {/* 1. Voice Narrator Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-black text-rose-300 flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-400" />
            <span>صوت القارئ ونبرة التعليق الصوتي (Voice Narrator)</span>
          </label>
        </div>

        {/* Category A: Egyptian Dialect Voices */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span>🇪🇬 الأصوات باللغة العامية المصرية (نبرة طبيعية دافئة):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {egyptianVoices.map((v) => {
              const isSelected = voiceSettings.persona === v.id;
              const isTestingThis = isTestingVoice && testingPersonaId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectPersona(v)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? "bg-gradient-to-b from-rose-950/70 to-slate-900 border-rose-500 shadow-xl shadow-rose-950/60 ring-2 ring-rose-500/30"
                      : "bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{v.avatar}</span>
                        <div>
                          <div className="font-black text-xs text-white group-hover:text-rose-300 transition-colors">
                            {v.name}
                          </div>
                          <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                            {v.badge}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-slate-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      {v.description}
                    </p>
                  </div>

                  {/* Sample test button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoiceSample(v);
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                        isTestingThis
                          ? "bg-amber-600 text-white animate-pulse"
                          : "bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30"
                      }`}
                    >
                      {isTestingThis ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>إيقاف</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>سماع العينة 🔊</span>
                        </>
                      )}
                    </button>
                    {isSelected && (
                      <span className="text-[10px] text-rose-400 font-bold">الصوت الفعّال ✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category B: Classical Arabic Voices */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <span>🎙️ أصوات الفصحى الإذاعية الفاخرة (Gemini AI Studio):</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {standardVoices.map((v) => {
              const isSelected = voiceSettings.persona === v.id;
              const isTestingThis = isTestingVoice && testingPersonaId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectPersona(v)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-rose-950/50 border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40"
                      : "bg-slate-800/30 border-slate-800 hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-xs text-white line-clamp-1">{v.name}</div>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                    </div>
                    <div className="text-[10px] text-rose-300/80 mt-0.5">{v.badge}</div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{v.description}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoiceSample(v);
                      }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1"
                    >
                      {isTestingThis ? "إيقاف ■" : "تجربة ▶"}
                    </button>
                    {isSelected && <span className="text-[10px] text-rose-400 font-bold">محدد</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category C: WebSpeech Local */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">قارئ النظام المباشر (Web Speech API للهاتف):</span>
            <select
              value={voiceSettings.webSpeechVoiceURI || ""}
              onChange={(e) => {
                onVoiceSettingsChange({
                  ...voiceSettings,
                  persona: "webspeech",
                  engine: "webspeech",
                  webSpeechVoiceURI: e.target.value,
                });
              }}
              className="bg-slate-900 border border-cyan-500/40 text-xs rounded-xl px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 max-w-[220px] truncate"
            >
              {arabicVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {arabicVoices.length === 0 && <option value="">الصوت العربي الافتراضي بالجهاز</option>}
            </select>
          </div>
          {voiceSettings.persona === "webspeech" && (
            <span className="text-xs text-cyan-400 font-bold">مُفعل ✓</span>
          )}
        </div>
      </div>

      {/* 2. Background Music Engine */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-black text-amber-300 flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-400" />
            <span>الموسيقى الرقيقة المصاحبة في نفس الفيديو (Background Music)</span>
          </label>
          <button
            onClick={toggleMusicPreview}
            className={`text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-md ${
              isMusicPlaying
                ? "bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
            }`}
          >
            {isMusicPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isMusicPlaying ? "إيقاف الموسيقى ■" : "تشغيل عينة الموسيقى 🎵"}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {MUSIC_PRESETS.map((track) => {
            const isSelected = currentTrackId === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleTrackSelect(track.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-950/50 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/50 ring-2 ring-amber-500/30"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xs line-clamp-1">{track.name}</div>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {track.description}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-amber-400/90 font-semibold">
                    {track.bpm > 0 ? `${track.bpm} نبضة/دقيقة` : "نقي"}
                  </span>
                  {isSelected && <span className="text-amber-300 font-bold">المختارة ✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Audio Levels & Smart Ducking */}
      <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 space-y-4">
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
                صوت القارئ (واضح وبارز)
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
