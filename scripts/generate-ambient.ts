/**
 * Generate creepy ambient audio for the /fortune onboarding page.
 *
 * Produces a seamless loopable WAV file with:
 * - Deep drone (55Hz)
 * - Dissonant drone (82.5Hz, detuned)
 * - Ethereal whisper tone (220Hz with slow tremolo)
 * - Filtered wind noise (bandpass white noise)
 * - Breathing volume swell
 *
 * Run: bun run scripts/generate-ambient.ts
 * Then convert with ffmpeg to compressed format.
 */

const SAMPLE_RATE = 44100;
const DURATION = 30; // seconds — seamless loop point
const NUM_SAMPLES = SAMPLE_RATE * DURATION;

// Pre-allocate buffer
const samples = new Float32Array(NUM_SAMPLES);

// === Helper: generate deterministic pseudo-random noise ===
// Using a simple LCG so the output is reproducible
let seed = 42;
function rand(): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff * 2 - 1; // range [-1, 1]
}

// === Layer 1: Deep drone (55Hz sine) ===
const drone1Freq = 55;
const drone1Gain = 0.30;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  samples[i] += Math.sin(2 * Math.PI * drone1Freq * t) * drone1Gain;
}

// === Layer 2: Dissonant drone (82.5Hz, slightly detuned for beating) ===
const drone2Freq = 82.41; // slightly off from perfect fifth
const drone2Gain = 0.15;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  samples[i] += Math.sin(2 * Math.PI * drone2Freq * t) * drone2Gain;
}

// === Layer 3: Sub-harmonic rumble (27.5Hz) ===
const subFreq = 27.5;
const subGain = 0.12;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  samples[i] += Math.sin(2 * Math.PI * subFreq * t) * subGain;
}

// === Layer 4: Ethereal whisper tone (220Hz with slow tremolo) ===
const etherealFreq = 220;
const tremoloRate = 0.1; // 10-second cycle
const etherealMaxGain = 0.05;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  // Tremolo: gain oscillates between 0 and etherealMaxGain
  const tremolo = (Math.sin(2 * Math.PI * tremoloRate * t) + 1) / 2;
  samples[i] += Math.sin(2 * Math.PI * etherealFreq * t) * tremolo * etherealMaxGain;
}

// === Layer 5: Filtered noise (wind texture) ===
// Generate white noise, then apply a simple bandpass filter via IIR
// Bandpass center: 300Hz, Q: 0.5, with slow frequency sweep
{
  // Pre-generate raw noise
  const noise = new Float32Array(NUM_SAMPLES);
  for (let i = 0; i < NUM_SAMPLES; i++) {
    noise[i] = rand();
  }

  // Simple 2-pole bandpass filter (biquad)
  const noiseGain = 0.08;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Sweep filter frequency between 125Hz and 475Hz
    const filterFreq = 300 + 175 * Math.sin(2 * Math.PI * 0.03 * t);
    const Q = 0.5;

    // Biquad bandpass coefficients
    const w0 = 2 * Math.PI * filterFreq / SAMPLE_RATE;
    const alpha = Math.sin(w0) / (2 * Q);
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;

    const x0 = noise[i];
    const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;

    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;

    samples[i] += y0 * noiseGain;
  }
}

// === Layer 6: Breathing volume envelope ===
// Slow swell: modulate entire mix amplitude with 20-second cycle
for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  // Oscillate between 0.85 and 1.0
  const breath = 0.925 + 0.075 * Math.sin(2 * Math.PI * 0.05 * t);
  samples[i] *= breath;
}

// === Crossfade for seamless loop ===
// Crossfade last 2 seconds with first 2 seconds
const crossfadeSamples = SAMPLE_RATE * 2;
for (let i = 0; i < crossfadeSamples; i++) {
  const fadeOut = 1 - i / crossfadeSamples; // 1 → 0
  const fadeIn = i / crossfadeSamples;       // 0 → 1
  const endIdx = NUM_SAMPLES - crossfadeSamples + i;
  samples[endIdx] = samples[endIdx] * fadeOut + samples[i] * fadeIn;
}

// === Normalize to prevent clipping ===
let maxAmp = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
  const abs = Math.abs(samples[i]);
  if (abs > maxAmp) maxAmp = abs;
}
if (maxAmp > 0.95) {
  const scale = 0.95 / maxAmp;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    samples[i] *= scale;
  }
}

// === Write WAV file ===
function writeWav(filePath: string, data: Float32Array, sampleRate: number) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = data.length * blockAlign;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);         // subchunk size
  view.setUint16(20, 1, true);          // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write samples as 16-bit PCM
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const clamped = Math.max(-1, Math.min(1, data[i]));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  Bun.write(filePath, new Uint8Array(buffer));
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

const wavPath = './public/ambient.wav';
writeWav(wavPath, samples, SAMPLE_RATE);
console.log(`Generated ${wavPath} (${(NUM_SAMPLES / SAMPLE_RATE)}s, ${SAMPLE_RATE}Hz, mono)`);
console.log(`File size: ${(44 + NUM_SAMPLES * 2) / 1024 | 0}KB`);
console.log('\nConvert to MP3:');
console.log(`  ffmpeg -i ${wavPath} -b:a 64k -ac 1 ./public/ambient.mp3`);
