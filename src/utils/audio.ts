export type FocusSoundscapeId =
  | 'none'
  | 'brown-noise'
  | 'zen-garden-chimes'
  | 'soft-rain'
  | 'binaural-alpha';

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // Ignore autoplay restrictions until user interaction
    });
  }
  return sharedAudioContext;
}

function playTone(
  frequency: number,
  durationSec: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.08,
  delaySec = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainPeak), now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.04);
}

export function playHabitCheckChime(enabled: boolean): void {
  if (!enabled) return;
  playTone(523.25, 0.16, 'triangle', 0.06, 0);
  playTone(659.25, 0.22, 'sine', 0.06, 0.07);
}

export function playBreathCue(
  phase: 'inhale' | 'hold' | 'exhale',
  enabled: boolean
): void {
  if (!enabled) return;
  if (phase === 'inhale') {
    playTone(261.63, 0.45, 'sine', 0.05, 0);
    playTone(329.63, 0.55, 'sine', 0.04, 0.12);
  } else if (phase === 'hold') {
    playTone(392.0, 0.35, 'sine', 0.035, 0);
  } else {
    playTone(329.63, 0.45, 'sine', 0.045, 0);
    playTone(220.0, 0.65, 'sine', 0.04, 0.14);
  }
}

export function playUrgeCompleteChime(enabled: boolean): void {
  if (!enabled) return;
  playTone(392.0, 0.4, 'triangle', 0.07, 0);
  playTone(493.88, 0.45, 'triangle', 0.07, 0.12);
  playTone(587.33, 0.6, 'sine', 0.08, 0.24);
  playTone(783.99, 0.9, 'sine', 0.07, 0.38);
}

export function playAdvanceDayChime(enabled: boolean): void {
  if (!enabled) return;
  playTone(440.0, 0.25, 'triangle', 0.07, 0);
  playTone(554.37, 0.3, 'triangle', 0.07, 0.1);
  playTone(659.25, 0.5, 'sine', 0.08, 0.22);
}

// ============================================================================
// Ambient Focus Soundscapes & Completion Triggers (Pure Web Audio Synthesis)
// ============================================================================

interface ActiveAmbientSession {
  id: FocusSoundscapeId;
  masterGain: GainNode;
  cleanup: () => void;
}

let activeAmbient: ActiveAmbientSession | null = null;
let cachedBrownBuffer: AudioBuffer | null = null;
let cachedRainBuffer: AudioBuffer | null = null;

function createNoiseBuffer(
  ctx: AudioContext,
  kind: 'brown' | 'pink'
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const durationSec = 4;
  const length = sampleRate * durationSec;
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    if (kind === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = Math.max(-1, Math.min(1, lastOut * 3.4));
      }
    } else {
      // Paul Kellet pink noise approximation for natural rain & breeze
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = Math.max(-1, Math.min(1, pink * 0.11));
      }
    }

    // Smooth crossfade at loop seam so looping is click-free
    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      data[length - fadeSamples + i] =
        data[length - fadeSamples + i] * (1 - t) + data[i] * t;
    }
  }

  return buffer;
}

function getBrownBuffer(ctx: AudioContext): AudioBuffer {
  if (!cachedBrownBuffer || cachedBrownBuffer.sampleRate !== ctx.sampleRate) {
    cachedBrownBuffer = createNoiseBuffer(ctx, 'brown');
  }
  return cachedBrownBuffer;
}

function getRainBuffer(ctx: AudioContext): AudioBuffer {
  if (!cachedRainBuffer || cachedRainBuffer.sampleRate !== ctx.sampleRate) {
    cachedRainBuffer = createNoiseBuffer(ctx, 'pink');
  }
  return cachedRainBuffer;
}

function triggerZenChimeNote(
  ctx: AudioContext,
  destination: AudioNode,
  freq: number,
  peakGain: number,
  decaySec: number,
  delaySec = 0
): void {
  const start = ctx.currentTime + delaySec;

  // Fundamental singing-bell sine
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, start);
  gain1.gain.setValueAtTime(0.0001, start);
  gain1.gain.exponentialRampToValueAtTime(Math.max(0.0002, peakGain), start + 0.03);
  gain1.gain.exponentialRampToValueAtTime(0.0001, start + decaySec);
  osc1.connect(gain1);
  gain1.connect(destination);
  osc1.start(start);
  osc1.stop(start + decaySec + 0.05);

  // Shimmering harmonic overtone (slightly detuned for organic bronze resonance)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.003, start);
  gain2.gain.setValueAtTime(0.0001, start);
  gain2.gain.exponentialRampToValueAtTime(
    Math.max(0.0002, peakGain * 0.35),
    start + 0.04
  );
  gain2.gain.exponentialRampToValueAtTime(0.0001, start + decaySec * 0.65);
  osc2.connect(gain2);
  gain2.connect(destination);
  osc2.start(start);
  osc2.stop(start + decaySec * 0.7 + 0.05);
}

export function stopAmbientSoundscape(): void {
  if (!activeAmbient) return;
  const session = activeAmbient;
  activeAmbient = null;
  session.cleanup();
}

export function setAmbientSoundscapeVolume(volume: number): void {
  if (!activeAmbient || !sharedAudioContext) return;
  const clamped = Math.max(0.01, Math.min(1, volume));
  const now = sharedAudioContext.currentTime;
  activeAmbient.masterGain.gain.cancelScheduledValues(now);
  activeAmbient.masterGain.gain.setTargetAtTime(clamped * 0.36, now, 0.12);
}

export function startAmbientSoundscape(
  id: FocusSoundscapeId,
  enabled: boolean,
  volume = 0.6
): void {
  stopAmbientSoundscape();
  if (!enabled || id === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const clampedVol = Math.max(0.05, Math.min(1, volume));
  const masterGain = ctx.createGain();
  const now = ctx.currentTime;
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.linearRampToValueAtTime(clampedVol * 0.36, now + 0.65);
  masterGain.connect(ctx.destination);

  const stoppers: (() => void)[] = [];
  let intervalId: number | null = null;

  if (id === 'brown-noise') {
    const source = ctx.createBufferSource();
    source.buffer = getBrownBuffer(ctx);
    source.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(340, now);
    lowpass.Q.setValueAtTime(0.7, now);

    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowshelf';
    warmth.frequency.setValueAtTime(140, now);
    warmth.gain.setValueAtTime(4, now);

    source.connect(lowpass);
    lowpass.connect(warmth);
    warmth.connect(masterGain);
    source.start(now);

    stoppers.push(() => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped
      }
    });
  } else if (id === 'zen-garden-chimes') {
    // Gentle temple wind bed
    const breezeSource = ctx.createBufferSource();
    breezeSource.buffer = getRainBuffer(ctx);
    breezeSource.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(460, now);
    breezeFilter.Q.setValueAtTime(1.1, now);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.18, now);

    breezeSource.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(masterGain);
    breezeSource.start(now);

    stoppers.push(() => {
      try {
        breezeSource.stop();
        breezeSource.disconnect();
      } catch {
        // Already stopped
      }
    });

    // Pentatonic Zen garden wind-chime intervals
    const pentatonic = [293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    triggerZenChimeNote(ctx, masterGain, 440.0, 0.24, 3.2, 0.15);
    triggerZenChimeNote(ctx, masterGain, 587.33, 0.18, 2.8, 1.0);

    intervalId = window.setInterval(() => {
      const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      triggerZenChimeNote(ctx, masterGain, note, 0.2, 3.4, 0);
      if (Math.random() > 0.55) {
        const pair = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        triggerZenChimeNote(ctx, masterGain, pair, 0.14, 2.9, 0.48);
      }
    }, 3800);
  } else if (id === 'soft-rain') {
    const source = ctx.createBufferSource();
    source.buffer = getRainBuffer(ctx);
    source.loop = true;

    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(1450, now);

    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'highpass';
    airFilter.frequency.setValueAtTime(220, now);

    source.connect(bodyFilter);
    bodyFilter.connect(airFilter);
    airFilter.connect(masterGain);
    source.start(now);

    stoppers.push(() => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped
      }
    });
  } else if (id === 'binaural-alpha') {
    // 10 Hz Alpha beat (200 Hz L / 210 Hz R) + gentle 100 Hz warm sub-drone
    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    subOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(200, now);
    rightOsc.frequency.setValueAtTime(210, now);
    subOsc.frequency.setValueAtTime(100, now);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.32, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.14, now);

    if (typeof ctx.createStereoPanner === 'function') {
      const panL = ctx.createStereoPanner();
      const panR = ctx.createStereoPanner();
      panL.pan.setValueAtTime(-0.85, now);
      panR.pan.setValueAtTime(0.85, now);
      leftOsc.connect(panL);
      panL.connect(droneGain);
      rightOsc.connect(panR);
      panR.connect(droneGain);
    } else {
      leftOsc.connect(droneGain);
      rightOsc.connect(droneGain);
    }

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    droneGain.connect(masterGain);

    leftOsc.start(now);
    rightOsc.start(now);
    subOsc.start(now);

    stoppers.push(() => {
      for (const osc of [leftOsc, rightOsc, subOsc]) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Already stopped
        }
      }
    });
  }

  activeAmbient = {
    id,
    masterGain,
    cleanup: () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      const stopTime = ctx.currentTime;
      try {
        masterGain.gain.cancelScheduledValues(stopTime);
        masterGain.gain.setValueAtTime(
          Math.max(0.0001, masterGain.gain.value),
          stopTime
        );
        masterGain.gain.exponentialRampToValueAtTime(0.0001, stopTime + 0.35);
      } catch {
        // Ignore ramp edge cases
      }
      window.setTimeout(() => {
        for (const fn of stoppers) fn();
        try {
          masterGain.disconnect();
        } catch {
          // Already disconnected
        }
      }, 390);
    },
  };
}

export function playFocusCompletionSoundscape(
  id: FocusSoundscapeId,
  enabled: boolean,
  volume = 0.65
): void {
  if (!enabled) return;

  if (id === 'none') {
    playAdvanceDayChime(true);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const vol = Math.max(0.1, Math.min(1, volume));
  const out = ctx.createGain();
  out.gain.setValueAtTime(vol * 0.45, ctx.currentTime);
  out.connect(ctx.destination);

  if (id === 'zen-garden-chimes') {
    // Singing bowl drone + cascading pentatonic Zen Garden chimes
    triggerZenChimeNote(ctx, out, 220.0, 0.35, 5.2, 0);
    triggerZenChimeNote(ctx, out, 221.4, 0.16, 4.8, 0.05);
    const cascade = [587.33, 659.25, 880.0, 1174.66, 1318.51];
    cascade.forEach((freq, idx) => {
      triggerZenChimeNote(ctx, out, freq, 0.22 - idx * 0.02, 3.0, 0.35 + idx * 0.32);
    });
  } else if (id === 'brown-noise') {
    // Grounding warm brown-noise exhale swell + low temple gong resolution
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = getBrownBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.linearRampToValueAtTime(420, now + 1.4);
    filter.frequency.linearRampToValueAtTime(180, now + 5.4);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.55, now + 1.1);
    env.gain.setValueAtTime(0.55, now + 2.6);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 5.6);

    source.connect(filter);
    filter.connect(env);
    env.connect(out);
    source.start(now);
    source.stop(now + 5.8);

    triggerZenChimeNote(ctx, out, 196.0, 0.32, 4.2, 0.2);
    triggerZenChimeNote(ctx, out, 293.66, 0.2, 3.5, 0.9);
  } else if (id === 'soft-rain') {
    // Calming 5.5s rainfall wash + three gentle water-drop tones
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = getRainBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1250, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.42, now + 0.9);
    env.gain.setValueAtTime(0.42, now + 2.8);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 5.4);

    source.connect(filter);
    filter.connect(env);
    env.connect(out);
    source.start(now);
    source.stop(now + 5.6);

    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      triggerZenChimeNote(ctx, out, freq, 0.2, 2.2, 0.5 + idx * 0.55);
    });
  } else if (id === 'binaural-alpha') {
    // Warm resolving major-9th harmonic bloom
    const chord = [261.63, 329.63, 392.0, 493.88, 587.33];
    chord.forEach((freq, idx) => {
      triggerZenChimeNote(ctx, out, freq, 0.16, 4.4, idx * 0.16);
    });
  }
}
