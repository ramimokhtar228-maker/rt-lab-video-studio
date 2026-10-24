/**
 * Professional Web Audio API Synthesizer & Sound Mixer for RT Lab
 * Includes:
 * 1. Multiple background music tracks (Oriental Egyptian Oud, Gentle Piano, Calm Strings, Master Soundtrack)
 * 2. Speech & Voiceover mixer with auto-ducking using AudioBufferSourceNode
 * 3. Celebration & Medical UI sound effects
 * 4. Master recording stream for video export with 100% audio reliability
 */

export interface MusicTrackOption {
  id: string;
  name: string;
  description: string;
  bpm: number;
  fileSrc?: string;
}

export const MUSIC_PRESETS: MusicTrackOption[] = [
  {
    id: "master-soundtrack",
    name: "الموسيقى الرسمية الماستر (Original Master)",
    description: "الموسيقى الاحتفالية المعتمدة لمعامل RT بصوت نقي متصل",
    bpm: 72,
    fileSrc: "./assets/audio/gentle_music.wav",
  },
  {
    id: "egyptian-warm",
    name: "نغم مصري شرقي راقي (Egyptian Oud & Strings)",
    description: "عزف دافئ وراقي يجمع بين العود والقانون والوتريات الهادئة",
    bpm: 68,
    fileSrc: "./assets/audio/music_oriental_warm.wav",
  },
  {
    id: "soft-piano",
    name: "بيانو هادئ ورقيق (Delicate Piano)",
    description: "نغمات بيانو كلاسيكية ناعمة تبعث على الراحة والسكينة",
    bpm: 68,
    fileSrc: "./assets/audio/music_piano_delicate.wav",
  },
  {
    id: "medical-calm",
    name: "تناغم وتريات طبية (Calm Strings & Celesta)",
    description: "موسيقى راقية تجمع بين الوترية الناعمة وأجراس النقاء الطبي",
    bpm: 72,
  },
  {
    id: "celebration-acoustic",
    name: "احتفالية دافئة ومبهجة (Warm Celebration)",
    description: "ألحان مفعمة بالأمل والامتنان لمرور 21 عاماً",
    bpm: 76,
  },
  {
    id: "ambient-lullaby",
    name: "عزف هادئ للتأمل (Peaceful Ambient)",
    description: "موسيقى خفيفة جداً تبرز نبرات الصوت بوضوح فائق",
    bpm: 60,
  },
  {
    id: "none",
    name: "بدون موسيقى (تعليق صوتي نقي فقط)",
    description: "صوت القارئ فقط بوضوح كامل وبدون أي موسيقى خلفية",
    bpm: 0,
  },
];

class RTStudioAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private analyser: AnalyserNode | null = null;

  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private currentTrack: string = "master-soundtrack";
  private currentStep: number = 0;
  private activeMusicSourceNode: AudioBufferSourceNode | null = null;

  // Active voice buffer source node
  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();

  // Volumes
  private masterVol: number = 0.95;
  private musicVol: number = 0.24; // gentle background
  private voiceVol: number = 1.0;  // crystal clear voice
  private sfxVol: number = 0.6;
  private duckingEnabled: boolean = true;

  constructor() {
    // Lazy initialized
  }

  public init() {
    if (this.ctx && this.ctx.state !== "closed") {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);

      this.voiceGain = this.ctx.createGain();
      this.voiceGain.gain.setValueAtTime(this.voiceVol, this.ctx.currentTime);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.destinationNode = this.ctx.createMediaStreamDestination();

      // Connections
      this.musicGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.analyser);
      this.masterGain.connect(this.destinationNode);
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  public getMediaStream(): MediaStream | null {
    if (!this.destinationNode) {
      this.init();
    }
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public getFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array as any);
    }
  }

  public setMasterVolume(v: number) {
    this.masterVol = Math.max(0, Math.min(1, v));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(v: number) {
    this.musicVol = Math.max(0, Math.min(1, v));
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVol, this.ctx.currentTime, 0.05);
    }
  }

  public setVoiceVolume(v: number) {
    this.voiceVol = Math.max(0, Math.min(1, v));
    if (this.ctx && this.voiceGain) {
      this.voiceGain.gain.setTargetAtTime(this.voiceVol, this.ctx.currentTime, 0.05);
    }
  }

  public setDucking(enabled: boolean) {
    this.duckingEnabled = enabled;
  }

  /**
   * Duck music down when voice is speaking
   */
  public duckMusic(isSpeaking: boolean) {
    if (!this.ctx || !this.musicGain || !this.duckingEnabled) return;
    const target = isSpeaking ? this.musicVol * 0.16 : this.musicVol;
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
  }

  /**
   * Gentle Procedural Music Note Generator
   */
  private playSoftTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = "sine",
    gainLevel: number = 0.12
  ) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, startTime);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);

    // Warm envelope
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private playChimeTone(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    this.playSoftTone(freq, startTime, duration, "sine", 0.07);
    this.playSoftTone(freq * 2, startTime, duration * 0.7, "triangle", 0.025);
  }

  /**
   * Starts gentle background music (from file loop or procedural synth)
   */
  public async startMusic(trackId?: string) {
    this.init();
    if (trackId) this.currentTrack = trackId;

    if (this.currentTrack === "none") {
      this.stopMusic();
      return;
    }

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentStep = 0;

    const trackObj = MUSIC_PRESETS.find((p) => p.id === this.currentTrack);

    // Option A: File-based looped soundtrack
    if (trackObj && trackObj.fileSrc) {
      try {
        const buffer = await this.loadAudioBuffer(trackObj.fileSrc);
        if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(this.musicGain);
        source.start(0);
        this.activeMusicSourceNode = source;
        return;
      } catch (err) {
        console.warn("Failed to play audio file track, fallback to synth:", err);
      }
    }

    // Option B: Procedural warm synthesizer chords
    const chordProgressions: { [key: string]: number[][] } = {
      "soft-piano": [
        [261.63, 329.63, 392.0, 587.33], // C4, E4, G4, D5
        [196.0, 293.66, 392.0, 523.25],  // G3, D4, G4, C5
        [220.0, 261.63, 329.63, 440.0],  // A3, C4, E4, A4
        [174.61, 261.63, 349.23, 440.0], // F3, C4, F4, A4
      ],
      "medical-calm": [
        [293.66, 349.23, 440.0, 523.25],
        [196.0, 293.66, 392.0, 440.0],
        [261.63, 329.63, 392.0, 493.88],
        [174.61, 261.63, 329.63, 392.0],
      ],
      "celebration-acoustic": [
        [329.63, 415.3, 493.88, 659.25],
        [311.13, 369.99, 493.88, 622.25],
        [277.18, 329.63, 415.3, 554.37],
        [220.0, 277.18, 329.63, 440.0],
      ],
      "ambient-lullaby": [
        [174.61, 261.63, 329.63, 349.23],
        [261.63, 329.63, 392.0, 523.25],
        [196.0, 246.94, 293.66, 392.0],
      ],
      "egyptian-warm": [
        [220.0, 261.63, 293.66, 349.23, 440.0],
        [196.0, 246.94, 293.66, 392.0, 440.0],
        [174.61, 220.0, 261.63, 329.63, 392.0],
        [164.81, 207.65, 246.94, 329.63, 440.0],
      ],
    };

    const chords = chordProgressions[this.currentTrack] || chordProgressions["soft-piano"];
    const stepDuration = 2.4;

    const tick = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentChordIndex = this.currentStep % chords.length;
      const chord = chords[currentChordIndex];

      chord.forEach((freq, i) => {
        const offset = i * 0.45;
        this.playChimeTone(freq, now + offset, stepDuration * 0.95);
      });

      const bassFreq = chord[0] / 2;
      this.playSoftTone(bassFreq, now, stepDuration * 1.2, "sine", 0.08);

      this.currentStep++;
      this.musicTimer = window.setTimeout(tick, stepDuration * 1000);
    };

    tick();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.activeMusicSourceNode) {
      try {
        this.activeMusicSourceNode.stop();
        this.activeMusicSourceNode.disconnect();
      } catch (e) {
        // ignored
      }
      this.activeMusicSourceNode = null;
    }
  }

  public toggleMusic(trackId?: string): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic(trackId);
      return true;
    }
  }

  public changeTrack(trackId: string) {
    const wasPlaying = this.isMusicPlaying;
    this.stopMusic();
    this.currentTrack = trackId;
    if (wasPlaying && trackId !== "none") {
      this.startMusic(trackId);
    }
  }

  public getCurrentTrack(): string {
    return this.currentTrack;
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Load and decode audio buffer from URL or base64
   */
  public async loadAudioBuffer(src: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(src)) {
      return this.bufferCache.get(src)!;
    }

    if (!this.ctx) this.init();
    if (!this.ctx) throw new Error("No AudioContext available");

    let arrayBuffer: ArrayBuffer;
    if (src.startsWith("data:")) {
      const base64 = src.split(",")[1];
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${src} (${response.status})`);
      }
      arrayBuffer = await response.arrayBuffer();
    }

    const decoded = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
    this.bufferCache.set(src, decoded);
    return decoded;
  }

  /**
   * Play crystal-clear audio buffer through Web Audio API
   */
  public async playVoiceAudio(src: string): Promise<void> {
    this.init();
    if (!this.ctx || !this.voiceGain) return;

    this.stopVoiceAudio();

    try {
      const buffer = await this.loadAudioBuffer(src);

      return new Promise((resolve) => {
        if (!this.ctx || !this.voiceGain) {
          resolve();
          return;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.voiceGain);

        this.currentVoiceSource = source;
        this.duckMusic(true);

        source.onended = () => {
          this.duckMusic(false);
          if (this.currentVoiceSource === source) {
            this.currentVoiceSource = null;
          }
          resolve();
        };

        source.start(0);
      });
    } catch (err) {
      console.warn("Buffer playback failed, fallback to Audio element:", err);
      return this.playFallbackAudioElement(src);
    }
  }

  private playFallbackAudioElement(src: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      this.duckMusic(true);
      audio.onended = () => {
        this.duckMusic(false);
        resolve();
      };
      audio.onerror = () => {
        this.duckMusic(false);
        resolve();
      };
      audio.play().catch(() => {
        this.duckMusic(false);
        resolve();
      });
    });
  }

  public stopVoiceAudio() {
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.currentVoiceSource = null;
    }
    this.duckMusic(false);
  }

  /**
   * Sound effect: Celebration Sparkle
   */
  public playCelebrationChime() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  }

  /**
   * Sound effect: Medical Success Ding
   */
  public playMedicalDing() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  /**
   * Sound effect: Soft UI Click
   */
  public playClickSound() {
    this.init();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const studioAudio = new RTStudioAudioEngine();
