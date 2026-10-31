import fs from "fs";

// Generates 75 seconds of gentle, soft, relaxing ambient piano/harp chords as 16-bit 24kHz mono PCM WAV
const sampleRate = 24000;
const totalDuration = 74;
const totalSamples = sampleRate * totalDuration;
const buffer = Buffer.alloc(44 + totalSamples * 2);

// WAV Header
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + totalSamples * 2, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16); // PCM header size
buffer.writeUInt16LE(1, 20); // Audio format: 1 (PCM)
buffer.writeUInt16LE(1, 22); // Channels: 1 (Mono)
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
buffer.writeUInt16LE(2, 32); // Block align
buffer.writeUInt16LE(16, 34); // Bits per sample
buffer.write("data", 36);
buffer.writeUInt32LE(totalSamples * 2, 40);

// Chord progression: Cmaj9, Gsus4, Am7, Fmaj9
const chords = [
  [261.63, 329.63, 392.0, 587.33], // C, E, G, D
  [196.0, 293.66, 392.0, 523.25],  // G, D, G, C
  [220.0, 261.63, 329.63, 440.0],  // A, C, E, A
  [174.61, 261.63, 349.23, 440.0], // F, C, F, A
];

const chordDuration = 3.0; // 3 seconds per measure
for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const chordIdx = Math.floor(t / chordDuration) % chords.length;
  const chord = chords[chordIdx];
  const tInChord = t % chordDuration;

  let sample = 0;

  // Arpeggio notes
  chord.forEach((freq, noteIdx) => {
    const noteStart = noteIdx * 0.45;
    if (tInChord >= noteStart) {
      const dt = tInChord - noteStart;
      const decay = Math.exp(-dt * 2.2); // soft exponential decay
      // fundamental sine
      sample += Math.sin(2 * Math.PI * freq * dt) * decay * 0.15;
      // soft warm 2nd harmonic
      sample += Math.sin(4 * Math.PI * freq * dt) * decay * 0.04;
    }
  });

  // Soft bass pedal
  const bassFreq = chord[0] / 2;
  const bassDecay = Math.exp(-tInChord * 0.9);
  sample += Math.sin(2 * Math.PI * bassFreq * tInChord) * bassDecay * 0.18;

  // Gentle celesta chime on top every 6 seconds
  if (t % 6 < 2.0) {
    const dt = t % 6;
    const chimeDecay = Math.exp(-dt * 3.5);
    sample += Math.sin(2 * Math.PI * 1046.5 * dt) * chimeDecay * 0.06; // C6
    sample += Math.sin(2 * Math.PI * 1318.51 * dt) * chimeDecay * 0.04; // E6
  }

  // Soft ceiling to prevent clipping
  sample = Math.max(-0.95, Math.min(0.95, sample));
  const intVal = Math.round(sample * 32767);
  buffer.writeInt16LE(intVal, 44 + i * 2);
}

fs.writeFileSync("public/assets/audio/gentle_music.wav", buffer);
console.log("gentle_music.wav created successfully!");
