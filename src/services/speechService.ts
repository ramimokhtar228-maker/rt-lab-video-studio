import { VoiceSettings, VideoScene, VoicePersona } from "../types/scene";
import { studioAudio } from "../audio/audioEngine";

export interface VoiceOption {
  id: VoicePersona;
  name: string;
  category: "egyptian" | "standard" | "system";
  avatar: string;
  description: string;
  badge: string;
  engine: "recorded" | "gemini-ai" | "webspeech";
  geminiVoice: "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";
  sampleAudioSrc?: string;
  dialectStyle?: string;
}

export const VOICE_PERSONAS: VoiceOption[] = [
  // 1. Egyptian Dialect Voices (أصوات باللهجة العامية المصرية)
  {
    id: "egyptian-mariam",
    name: "مريم (عامية مصرية دافئة وودودة)",
    category: "egyptian",
    avatar: "👩",
    badge: "عامية مصرية • نبرة ترحاب وراحة",
    description: "نبرة صوت طبيعية راقية تتحدث بعفوية وألفة مع العملاء والمرضى",
    engine: "recorded",
    geminiVoice: "Kore",
    sampleAudioSrc: "./assets/audio/egyptian-female/scene-1.wav",
    dialectStyle: "Natural warm Egyptian Arabic dialect announcer, friendly polite Cairo accent, medical commercial",
  },
  {
    id: "egyptian-ahmed",
    name: "د. أحمد (مصري عامي - رسمي ومطمئن)",
    category: "egyptian",
    avatar: "👨‍⚕️",
    badge: "عامية مصرية • طبيب استشاري",
    description: "نبرة طبيب مصري وقور، هادئ ومريح للقلب يبعث على الثقة والأمان",
    engine: "recorded",
    geminiVoice: "Fenrir",
    sampleAudioSrc: "./assets/audio/egyptian-male/scene-1.wav",
    dialectStyle: "Authoritative respectful warm Egyptian doctor announcer, polite friendly reassurance, Cairo accent",
  },
  {
    id: "egyptian-karim",
    name: "كريم (مصري عامي - شبابي ومبهج)",
    category: "egyptian",
    avatar: "🧑",
    badge: "عامية مصرية • احتفالية وحماس",
    description: "نبرة إعلانية حيوية وسريعة تناسب الاحتفال بعيد الميلاد والخصم الكبير",
    engine: "gemini-ai",
    geminiVoice: "Puck",
    dialectStyle: "Energetic lively Egyptian Arabic youth announcer, celebratory, upbeat, friendly Cairo accent",
  },

  // 2. Classical Arabic Announcers (أصوات الفصحى الإذاعية الفاخرة)
  {
    id: "standard-kore",
    name: "نور (فصحى إذاعية فاخرة - نسائي)",
    category: "standard",
    avatar: "🎙️",
    badge: "فصحى معتمدة • أداء رسمي راقٍ",
    description: "الصوت الرسمي المعتمد لإعلان معامل RT بنبرة إذاعية واضحة جداً",
    engine: "recorded",
    geminiVoice: "Kore",
    sampleAudioSrc: "./assets/audio/scene-1.wav",
    dialectStyle: "Warm, respectful, articulate, professional, celebratory Arabic medical announcer",
  },
  {
    id: "standard-puck",
    name: "طارق (فصحى مبهجة واحتفالية - رجالي)",
    category: "standard",
    avatar: "🎙️",
    badge: "فصحى مشرقة • صوت حيوي",
    description: "نبرة رجالية مفعمة بالتفاؤل والبهجة والإشراق",
    engine: "gemini-ai",
    geminiVoice: "Puck",
    dialectStyle: "Warm, respectful, articulate, professional, celebratory Arabic medical announcer",
  },
  {
    id: "standard-fenrir",
    name: "عمر (فصحى وقورة وموثوقة - رجالي)",
    category: "standard",
    avatar: "🎙️",
    badge: "فصحى وقورة • هيبة وثقة",
    description: "نبرة صوت جهورية فخمة تعكس 21 عاماً من الخبرة والريادة",
    engine: "gemini-ai",
    geminiVoice: "Fenrir",
    dialectStyle: "Authoritative, dignified, prestigious Arabic medical announcer",
  },
  {
    id: "standard-zephyr",
    name: "ليلى (فصحى هادئة وسكينة - نسائي)",
    category: "standard",
    avatar: "🎙️",
    badge: "فصحى ناعمة • هدوء وطمأنينة",
    description: "نبرة هادئة ورقيقة جداً تمنح المريض السكينة والاطمئنان",
    engine: "gemini-ai",
    geminiVoice: "Zephyr",
    dialectStyle: "Gentle, soothing, reassuring Arabic medical announcer",
  },

  // 3. Web Speech Local System Voice
  {
    id: "webspeech",
    name: "قارئ الجهاز المباشر (Web Speech API)",
    category: "system",
    avatar: "📱",
    badge: "محلي فوري • بدون إنترنت",
    description: "صوت النظام المدمج بهاتفك أو كمبيوترك لقراءة النصوص فورا",
    engine: "webspeech",
    geminiVoice: "Kore",
  },
];

export class RTVideoVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCache: Map<string, string> = new Map();
  private isSpeaking: boolean = false;

  /**
   * Get available Web Speech voices
   */
  public async getArabicVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return [];
    }

    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const arabicVoices = voices.filter(
          (v) => v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic")
        );
        resolve(arabicVoices.length > 0 ? arabicVoices : voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          const arabicVoices = voices.filter(
            (v) => v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic")
          );
          resolve(arabicVoices.length > 0 ? arabicVoices : voices);
        };
        setTimeout(() => {
          resolve(window.speechSynthesis.getVoices());
        }, 800);
      }
    });
  }

  /**
   * Play scene voiceover taking persona and dialect into account
   */
  public async speakScene(
    scene: VideoScene,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stop();
    this.isSpeaking = true;

    const persona = settings.persona || "standard-kore";
    const isEgyptian = settings.dialect === "egyptian" || persona.startsWith("egyptian-");
    const scriptText = isEgyptian
      ? (scene.egyptianScript || scene.narrationScript)
      : scene.narrationScript;

    // 1. Check for pre-recorded audio files first for instant playback
    let staticAudioSrc: string | null = null;
    if (persona === "egyptian-mariam") {
      staticAudioSrc = scene.egyptianAudioSrc || `./assets/audio/egyptian-female/${scene.id}.wav`;
    } else if (persona === "egyptian-ahmed") {
      staticAudioSrc = `./assets/audio/egyptian-male/${scene.id}.wav`;
    } else if (persona === "standard-kore") {
      staticAudioSrc = scene.audioSrc || `./assets/audio/${scene.id}.wav`;
    }

    if (staticAudioSrc) {
      try {
        if (onStart) onStart();
        await studioAudio.playVoiceAudio(staticAudioSrc);
        this.isSpeaking = false;
        if (onEnd) onEnd();
        return;
      } catch (err) {
        console.warn(`Could not play static audio (${staticAudioSrc}), falling back to TTS:`, err);
      }
    }

    // 2. Otherwise speak narration text with the chosen persona
    return this.speakText(scriptText, settings, onStart, onEnd);
  }

  /**
   * Preload Gemini TTS audio for a text with specific voice and dialect style
   */
  public async preloadGeminiAudio(
    text: string,
    voiceName: string = "Kore",
    style?: string
  ): Promise<string> {
    const cacheKey = `${voiceName}:${style || ""}:${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch("./api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName, style }),
      });

      if (!response.ok) {
        throw new Error(`TTS server error (${response.status})`);
      }

      const data = await response.json();
      const audioUrl = `data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`;
      this.audioCache.set(cacheKey, audioUrl);
      return audioUrl;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Speak a text with configured voice settings
   */
  public async speakText(
    text: string,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stop();
    this.isSpeaking = true;

    const personaObj = VOICE_PERSONAS.find((p) => p.id === settings.persona);
    const geminiVoice = personaObj?.geminiVoice || settings.geminiVoice || "Kore";
    const style = personaObj?.dialectStyle || (
      settings.dialect === "egyptian"
        ? "Natural warm Egyptian Arabic dialect announcer, friendly polite Cairo accent, medical commercial"
        : "Warm, respectful, articulate, professional, celebratory Arabic medical announcer"
    );

    // Try Gemini TTS if not webspeech
    if (settings.engine !== "webspeech") {
      try {
        const audioSrc = await this.preloadGeminiAudio(text, geminiVoice, style);
        if (onStart) onStart();
        await studioAudio.playVoiceAudio(audioSrc);
        this.isSpeaking = false;
        if (onEnd) onEnd();
        return;
      } catch (err) {
        console.warn("Gemini TTS API not available, falling back to Web Speech:", err);
      }
    }

    // Web Speech API fallback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      return new Promise((resolve) => {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          this.currentUtterance = utterance;

          utterance.lang = "ar-EG";
          utterance.rate = settings.rate || 0.95;
          utterance.pitch = settings.pitch || 1.0;

          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(
            (v) =>
              v.voiceURI === settings.webSpeechVoiceURI ||
              v.lang.startsWith("ar") ||
              v.name.toLowerCase().includes("arabic")
          );

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onstart = () => {
            studioAudio.duckMusic(true);
            if (onStart) onStart();
          };

          utterance.onend = () => {
            this.isSpeaking = false;
            studioAudio.duckMusic(false);
            if (onEnd) onEnd();
            resolve();
          };

          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error:", e);
            this.isSpeaking = false;
            studioAudio.duckMusic(false);
            if (onEnd) onEnd();
            resolve();
          };

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("Failed to speak with Web Speech:", e);
          this.isSpeaking = false;
          if (onEnd) onEnd();
          resolve();
        }
      });
    } else {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }

  public stop() {
    this.isSpeaking = false;
    studioAudio.stopVoiceAudio();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignored
      }
    }
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new RTVideoVoiceService();
