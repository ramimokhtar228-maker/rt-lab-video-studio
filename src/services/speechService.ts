import { VoiceSettings, VideoScene } from "../types/scene";
import { studioAudio } from "../audio/audioEngine";

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
   * Play scene voiceover (prioritizes pre-rendered studio WAV for 100% reliability, then fallback)
   */
  public async speakScene(
    scene: VideoScene,
    settings: VoiceSettings,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stop();
    this.isSpeaking = true;

    // 1. If scene has a pristine pre-recorded audio file (works on GitHub Pages & offline!)
    if (scene.audioSrc) {
      try {
        if (onStart) onStart();
        await studioAudio.playVoiceAudio(scene.audioSrc);
        this.isSpeaking = false;
        if (onEnd) onEnd();
        return;
      } catch (err) {
        console.warn("Could not play scene.audioSrc, attempting fallback:", err);
      }
    }

    // 2. Otherwise speak narration text
    return this.speakText(scene.narrationScript, settings, onStart, onEnd);
  }

  /**
   * Preload Gemini TTS audio for a text
   */
  public async preloadGeminiAudio(text: string, voiceName: string = "Kore"): Promise<string> {
    const cacheKey = `${voiceName}:${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    try {
      const response = await fetch("./api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName }),
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

    // Try Gemini TTS if not on static host or if API is available
    if (settings.engine === "gemini-ai") {
      try {
        const audioSrc = await this.preloadGeminiAudio(text, settings.geminiVoice);
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
            studioAudio.duckMusic(false);
            this.isSpeaking = false;
            if (onEnd) onEnd();
            resolve();
          };

          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error:", e);
            studioAudio.duckMusic(false);
            this.isSpeaking = false;
            if (onEnd) onEnd();
            resolve();
          };

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("SpeechSynthesis failed:", e);
          studioAudio.duckMusic(false);
          this.isSpeaking = false;
          if (onEnd) onEnd();
          resolve();
        }
      });
    }

    this.isSpeaking = false;
    if (onEnd) onEnd();
  }

  public stop(): void {
    this.isSpeaking = false;
    studioAudio.stopVoiceAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    studioAudio.duckMusic(false);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new RTVideoVoiceService();
