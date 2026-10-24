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
  egyptianScript?: string;
  audioSrc?: string;
  egyptianAudioSrc?: string;
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

export type VoicePersona =
  | "egyptian-mariam" // Egyptian Female (مريم - عامية مصرية دافئة)
  | "egyptian-ahmed"  // Egyptian Male (د. أحمد - عامي وقور ومطمئن)
  | "egyptian-karim"  // Egyptian Youth (كريم - عامي حيوي واحتفالي)
  | "standard-kore"   // Classical Arabic Female (نور / Kore - فصحى إذاعية فاخرة)
  | "standard-puck"   // Classical Arabic Male (طارق / Puck - فصحى مشرفة وحيوية)
  | "standard-fenrir" // Classical Arabic Male (عمر / Fenrir - فصحى وقورة)
  | "standard-zephyr" // Classical Arabic Female (ليلى / Zephyr - فصحى هادئة)
  | "webspeech";      // Local browser voice

export interface VoiceSettings {
  engine: "gemini-ai" | "webspeech" | "recorded";
  persona: VoicePersona;
  geminiVoice: "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";
  dialect: "egyptian" | "standard";
  webSpeechVoiceURI?: string;
  rate: number;
  pitch: number;
}
