/**
 * Audio Engine for RT LAB Video Ad Studio
 * Dual layer: Gentle Procedural Acoustic Ambient Music + Arabic Neural Voiceover + Medical Sound Effects
 */

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private currentStep: number = 0;
  private targetMusicVolume: number = 0.22;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private arabicVoice: SpeechSynthesisVoice | null = null;
  private voiceVolume: number = 1.0;
  private voiceRate: number = 0.95; // Clear and measured Arabic pacing
  private voicePitch: number = 1.0;
  private isVoiceMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private onWordCallback: ((word: string, index: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private wordFallbackTimer: number | null = null;

  constructor() {
    this.initVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Look for Arabic voices (e.g. ar-EG, ar-SA, ar-XA, or name containing Arabic/عربي)
    const arabic = voices.find(v => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic') || v.name.includes('عربي'));
    if (arabic) {
      this.arabicVoice = arabic;
    } else {
      // Fallback: pick standard default voice
      this.arabicVoice = voices[0] || null;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.arabicVoice = voice;
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.arabicVoice;
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Start procedural gentle ambient piano & harp music
   * Creates a warm, reassuring, luxury medical background soundscape
   */
  public startGentleAmbientMusic() {
    const ctx = this.ensureAudioContext();
    if (!ctx || this.isMusicPlaying) return;

    if (!this.musicGainNode) {
      this.musicGainNode = ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(this.isMusicMuted ? 0 : this.targetMusicVolume, ctx.currentTime);
      this.musicGainNode.connect(ctx.destination);
    }

    this.isMusicPlaying = true;
    this.currentStep = 0;

    // Peaceful medical clinic chord progression in F Major / D Minor
    // F - C - Dm - Bb (F3, A3, C4, E4, G4, F4, D4, A4)
    const chordNotes: number[][] = [
      // F Major (warm reassurance)
      [174.61, 220.00, 261.63, 329.63, 349.23, 440.00],
      // C Major / E (steady trust)
      [164.81, 196.00, 246.94, 293.66, 329.63, 392.00],
      // D Minor (gentle emotion & care)
      [146.83, 174.61, 220.00, 261.63, 349.23, 440.00],
      // Bb Major 7 (hopeful & luxury)
      [116.54, 174.61, 233.08, 293.66, 349.23, 466.16],
    ];

    const playAmbientNote = () => {
      if (!this.isMusicPlaying || !this.audioCtx || !this.musicGainNode) return;
      const now = this.audioCtx.currentTime;
      const chordIndex = Math.floor(this.currentStep / 4) % chordNotes.length;
      const currentChord = chordNotes[chordIndex];
      const noteIndex = this.currentStep % currentChord.length;
      const baseFreq = currentChord[noteIndex];

      // Primary tone: gentle warm sine + triangle
      const osc = this.audioCtx.createOscillator();
      const oscSub = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);

      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(baseFreq * 0.5, now);

      // Low pass filter for soft felt piano warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(1.2, now);

      // Envelope
      const attack = 0.15;
      const decay = 2.4;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + attack);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(filter);
      oscSub.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGainNode);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + decay);
      oscSub.stop(now + decay);

      this.currentStep++;
    };

    // Trigger notes in a soothing tempo (~550ms arpeggio interval)
    this.musicIntervalId = window.setInterval(playAmbientNote, 520);
    playAmbientNote();
  }

  public stopGentleAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.musicGainNode && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.musicGainNode.gain.setTargetAtTime(muted ? 0 : this.targetMusicVolume, now, 0.1);
    }
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public setMusicVolume(vol: number) {
    this.targetMusicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGainNode && this.audioCtx && !this.isMusicMuted) {
      this.musicGainNode.gain.setTargetAtTime(this.targetMusicVolume, this.audioCtx.currentTime, 0.1);
    }
  }

  /**
   * Ducking: when voice speaks, lower music to 25% of its volume.
   * When voice ends, smoothly return music to full level.
   */
  private duckMusic(duck: boolean) {
    if (!this.musicGainNode || !this.audioCtx || this.isMusicMuted) return;
    const now = this.audioCtx.currentTime;
    const effectiveVol = duck ? this.targetMusicVolume * 0.28 : this.targetMusicVolume;
    this.musicGainNode.gain.setTargetAtTime(effectiveVol, now, 0.2);
  }

  /**
   * Play crystal chime for scene transition
   */
  public playSceneChime() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (crystal shimmer)
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.2);
    });
  }

  /**
  public playHeartbeatPulse() {
    // Disabled per user request (no pulse sounds)
    return;
  }

  /**
   * Play festive reservation confirmation sound
   */
  public playReservationSuccessSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.1, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.9);
    });
  }

  /**
   * Speak Narration Script in Arabic
   */
  public speakNarration(
    text: string,
    onWord?: (word: string, index: number) => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    this.stopNarration();
    this.onWordCallback = onWord || null;
    this.onEndCallback = onEnd || null;

    if (this.isVoiceMuted) {
      // Simulate word progression without voice audio
      this.simulateWordProgress(text, onWord, onEnd);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    if (this.arabicVoice) {
      utterance.voice = this.arabicVoice;
    }
    utterance.rate = this.voiceRate;
    utterance.pitch = this.voicePitch;
    utterance.volume = this.voiceVolume;

    const words = text.split(/\s+/).filter(Boolean);
    let wordIdx = 0;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIdx = event.charIndex;
        // Find which word corresponds to charIndex
        let currentLen = 0;
        let matchedIndex = 0;
        for (let i = 0; i < words.length; i++) {
          if (currentLen <= charIdx && charIdx < currentLen + words[i].length + 1) {
            matchedIndex = i;
            break;
          }
          currentLen += words[i].length + 1;
        }
        if (this.onWordCallback && words[matchedIndex]) {
          this.onWordCallback(words[matchedIndex], matchedIndex);
        }
      }
    };

    utterance.onstart = () => {
      this.duckMusic(true);
      // Fallback timer if boundary events do not fire on some mobile browsers
      this.startWordFallbackTimer(words);
    };

    utterance.onend = () => {
      this.duckMusic(false);
      this.clearWordFallbackTimer();
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error or cancelled:', e);
      this.duckMusic(false);
      this.clearWordFallbackTimer();
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private startWordFallbackTimer(words: string[]) {
    this.clearWordFallbackTimer();
    if (words.length === 0) return;
    let idx = 0;
    // Estimated average speech duration per word in Arabic (~260ms per word)
    const wordInterval = Math.max(180, Math.floor(260 / this.voiceRate));
    this.wordFallbackTimer = window.setInterval(() => {
      if (idx < words.length && this.onWordCallback) {
        this.onWordCallback(words[idx], idx);
        idx++;
      } else {
        this.clearWordFallbackTimer();
      }
    }, wordInterval);
  }

  private simulateWordProgress(
    text: string,
    onWord?: (word: string, index: number) => void,
    onEnd?: () => void
  ) {
    this.clearWordFallbackTimer();
    const words = text.split(/\s+/).filter(Boolean);
    let idx = 0;
    const interval = Math.max(180, Math.floor(260 / this.voiceRate));
    this.wordFallbackTimer = window.setInterval(() => {
      if (idx < words.length) {
        if (onWord) onWord(words[idx], idx);
        idx++;
      } else {
        this.clearWordFallbackTimer();
        if (onEnd) onEnd();
      }
    }, interval);
  }

  private clearWordFallbackTimer() {
    if (this.wordFallbackTimer !== null) {
      clearInterval(this.wordFallbackTimer);
      this.wordFallbackTimer = null;
    }
  }

  public stopNarration() {
    this.clearWordFallbackTimer();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.duckMusic(false);
  }

  public setVoiceMuted(muted: boolean) {
    this.isVoiceMuted = muted;
    if (muted) {
      this.stopNarration();
    }
  }

  public getVoiceMuted(): boolean {
    return this.isVoiceMuted;
  }

  public setVoiceRate(rate: number) {
    this.voiceRate = rate;
  }

  public getVoiceRate(): number {
    return this.voiceRate;
  }

  public setVoicePitch(pitch: number) {
    this.voicePitch = pitch;
  }

  public getVoicePitch(): number {
    return this.voicePitch;
  }
}

export const audioEngine = new AudioEngine();
