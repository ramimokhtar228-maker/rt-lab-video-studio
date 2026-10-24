export type AspectRatio = "16:9" | "9:16" | "1:1";

export interface VideoScene {
  id: string;
  order: number;
  duration: number; // in seconds
  title: string;
  badge?: string;
  headline: string;
  subheadline: string;
  narrationScript: string;
  audioSrc?: string;
  imageSrc: string;
  imageFit?: "cover" | "contain";
  themeColor: string; // Tailwind hex color
  accentColor: string;
  layout: "split-right" | "split-left" | "center-card" | "hero-fullscreen" | "contact-board";
  callToActions?: {
    primaryText?: string;
    secondaryText?: string;
    phones?: string[];
    whatsapp?: string;
  };
}

export interface VoiceSettings {
  engine: "gemini-ai" | "webspeech" | "recorded";
  geminiVoice: "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";
  webSpeechVoiceURI?: string;
  rate: number;
  pitch: number;
}
