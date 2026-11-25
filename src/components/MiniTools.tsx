import React, { useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  BellRing,
  BookOpen,
  CheckCircle2,
  CloudRain,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Timer,
  Volume2,
  VolumeX,
  Waves,
  Wind,
} from 'lucide-react';
import { CLASSIC_DISCIPLINE_BOOKS } from '../data/disciplineBooks';
import {
  FocusSoundscapeId,
  playAdvanceDayChime,
  playBreathCue,
  playFocusCompletionSoundscape,
  setAmbientSoundscapeVolume,
  startAmbientSoundscape,
  stopAmbientSoundscape,
} from '../utils/audio';
import { POMODORO_25_XP, POMODORO_50_XP } from '../utils/storage';

interface MiniToolsProps {
  pomodorosCompleted: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPomodoroComplete: (minutes: 25 | 50, xpAwarded: number) => void;
}

interface SoundscapeOption {
  id: FocusSoundscapeId;
  name: string;
  tagline: string;
  completionDetail: string;
}

const FOCUS_SOUNDSCAPES: SoundscapeOption[] = [
  {
    id: 'none',
    name: 'Off',
    tagline: 'Silent session · classic completion chime',
    completionDetail: 'Standard 3-note focus chime',
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    tagline: 'Warm deep low-end blanket for zero distractions',
    completionDetail: 'Warm grounding exhale swell + low temple gong',
  },
  {
    id: 'zen-garden-chimes',
    name: 'Zen Garden Chimes',
    tagline: 'Temple breeze & calm pentatonic wind chimes',
    completionDetail: 'Singing bowl resonance + cascading zen chimes',
  },
  {
    id: 'soft-rain',
    name: 'Soft Rain',
    tagline: 'Steady filtered rainfall for calm sustained flow',
    completionDetail: 'Gentle rainfall fade + three water-drop tones',
  },
  {
    id: 'binaural-alpha',
    name: 'Alpha Drift (10 Hz)',
    tagline: 'Subtle stereo alpha hum for relaxed focus',
    completionDetail: 'Warm resolving major-9th harmonic bloom',
  },
];

const SOUNDSCAPE_PREF_KEY = 'life_reset_focus_soundscape_v1';

interface SoundscapePrefs {
  soundscapeId: FocusSoundscapeId;
  volume: number;
  playDuringFocus: boolean;
  triggerOnComplete: boolean;
}

const DEFAULT_SOUNDSCAPE_PREFS: SoundscapePrefs = {
  soundscapeId: 'zen-garden-chimes',
  volume: 0.65,
  playDuringFocus: false,
  triggerOnComplete: true,
};

function loadSoundscapePrefs(): SoundscapePrefs {
  try {
    const raw = localStorage.getItem(SOUNDSCAPE_PREF_KEY);
    if (!raw) return DEFAULT_SOUNDSCAPE_PREFS;
    const parsed = JSON.parse(raw) as Partial<SoundscapePrefs>;
    const validIds = new Set<FocusSoundscapeId>(FOCUS_SOUNDSCAPES.map((s) => s.id));
    return {
      soundscapeId:
        parsed.soundscapeId && validIds.has(parsed.soundscapeId)
          ? parsed.soundscapeId
          : DEFAULT_SOUNDSCAPE_PREFS.soundscapeId,
      volume:
        typeof parsed.volume === 'number'
          ? Math.max(0.1, Math.min(1, parsed.volume))
          : DEFAULT_SOUNDSCAPE_PREFS.volume,
      playDuringFocus:
        typeof parsed.playDuringFocus === 'boolean'
          ? parsed.playDuringFocus
          : DEFAULT_SOUNDSCAPE_PREFS.playDuringFocus,
      triggerOnComplete:
        typeof parsed.triggerOnComplete === 'boolean'
          ? parsed.triggerOnComplete
          : DEFAULT_SOUNDSCAPE_PREFS.triggerOnComplete,
    };
  } catch {
    return DEFAULT_SOUNDSCAPE_PREFS;
  }
}

type BoxPhaseIndex = 0 | 1 | 2 | 3;

const BOX_PHASES: {
  label: string;
  instruction: string;
  cue: 'inhale' | 'hold' | 'exhale';
}[] = [
  { label: 'Inhale', instruction: 'Breathe in steadily through your nose', cue: 'inhale' },
  { label: 'Hold Full', instruction: 'Keep lungs gently expanded, drop shoulders', cue: 'hold' },
  { label: 'Exhale', instruction: 'Release smoothly and completely', cue: 'exhale' },
  { label: 'Hold Empty', instruction: 'Rest calm before the next breath', cue: 'hold' },
];

const BOX_PHASE_MS = 4000;
const BOX_CYCLE_MS = BOX_PHASE_MS * 4;

export const MiniTools: React.FC<MiniToolsProps> = ({
  pomodorosCompleted,
  soundEnabled,
  onToggleSound,
  onPomodoroComplete,
}) => {
  // ---------------- Pomodoro Timer State ----------------
  const [modeMinutes, setModeMinutes] = useState<25 | 50>(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [justFinished, setJustFinished] = useState<number | null>(null);
  const pomodoroRewardedRef = useRef(false);

  // ---------------- Ambient Focus Soundscape State ----------------
  const [soundscapePrefs, setSoundscapePrefs] = useState<SoundscapePrefs>(() =>
    loadSoundscapePrefs()
  );
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const activeSoundscape =
    FOCUS_SOUNDSCAPES.find((s) => s.id === soundscapePrefs.soundscapeId) ??
    FOCUS_SOUNDSCAPES[0];

  const isAmbientActive =
    soundEnabled &&
    soundscapePrefs.soundscapeId !== 'none' &&
    (isPreviewPlaying || (isRunning && soundscapePrefs.playDuringFocus));

  useEffect(() => {
    try {
      localStorage.setItem(SOUNDSCAPE_PREF_KEY, JSON.stringify(soundscapePrefs));
    } catch {
      // Ignore storage quota restrictions
    }
  }, [soundscapePrefs]);

  // Sync Web Audio ambient loop cleanly with Pomodoro run state & manual preview
  useEffect(() => {
    if (isAmbientActive) {
      startAmbientSoundscape(
        soundscapePrefs.soundscapeId,
        soundEnabled,
        soundscapePrefs.volume
      );
    } else {
      stopAmbientSoundscape();
    }
  }, [isAmbientActive, soundscapePrefs.soundscapeId, soundEnabled]);

  // Adjust live volume smoothly without restarting the ambient buffer
  useEffect(() => {
    if (isAmbientActive) {
      setAmbientSoundscapeVolume(soundscapePrefs.volume);
    }
  }, [soundscapePrefs.volume, isAmbientActive]);

  // Stop ambient soundscape cleanly on unmount
  useEffect(() => {
    return () => {
      stopAmbientSoundscape();
    };
  }, []);

  const totalPomodoroSeconds = modeMinutes * 60;
  const pomodoroRewardXP = modeMinutes === 50 ? POMODORO_50_XP : POMODORO_25_XP;

  const handleSelectMode = (minutes: 25 | 50) => {
    setIsRunning(false);
    setJustFinished(null);
    pomodoroRewardedRef.current = false;
    setModeMinutes(minutes);
    setSecondsLeft(minutes * 60);
  };

  const handleResetPomodoro = () => {
    setIsRunning(false);
    setJustFinished(null);
    pomodoroRewardedRef.current = false;
    setSecondsLeft(modeMinutes * 60);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && secondsLeft === 0 && !pomodoroRewardedRef.current) {
      pomodoroRewardedRef.current = true;
      setIsRunning(false);
      setIsPreviewPlaying(false);
      setJustFinished(pomodoroRewardXP);
      stopAmbientSoundscape();
      if (
        soundscapePrefs.triggerOnComplete &&
        soundscapePrefs.soundscapeId !== 'none'
      ) {
        playFocusCompletionSoundscape(
          soundscapePrefs.soundscapeId,
          soundEnabled,
          soundscapePrefs.volume
        );
      } else {
        playAdvanceDayChime(soundEnabled);
      }
      onPomodoroComplete(modeMinutes, pomodoroRewardXP);
    }
  }, [
    isRunning,
    secondsLeft,
    modeMinutes,
    pomodoroRewardXP,
    soundEnabled,
    soundscapePrefs.triggerOnComplete,
    soundscapePrefs.soundscapeId,
    soundscapePrefs.volume,
    onPomodoroComplete,
  ]);

  const pMins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const pSecs = String(secondsLeft % 60).padStart(2, '0');
  const pProgress = (totalPomodoroSeconds - secondsLeft) / totalPomodoroSeconds;
  const pRadius = 80;
  const pCircumference = 2 * Math.PI * pRadius;
  const pOffset = pCircumference * (1 - pProgress);

  // ---------------- Box Breathing Guide State ----------------
  const [breathActive, setBreathActive] = useState(false);
  const [breathElapsedMs, setBreathElapsedMs] = useState(0);
  const lastPhaseRef = useRef<BoxPhaseIndex | null>(null);

  useEffect(() => {
    if (!breathActive) return;
    let lastTimestamp = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const dt = Math.min(100, now - lastTimestamp);
      lastTimestamp = now;
      setBreathElapsedMs((prev) => prev + dt);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [breathActive]);

  const cycleMs = breathElapsedMs % BOX_CYCLE_MS;
  const phaseIndex = Math.floor(cycleMs / BOX_PHASE_MS) as BoxPhaseIndex;
  const phaseFraction = (cycleMs % BOX_PHASE_MS) / BOX_PHASE_MS;
  const phaseCountdown = Math.max(1, 4 - Math.floor((cycleMs % BOX_PHASE_MS) / 1000));
  const completedBreathCycles = Math.floor(breathElapsedMs / BOX_CYCLE_MS);
  const currentBreathPhase = BOX_PHASES[phaseIndex];

  useEffect(() => {
    if (!breathActive) {
      lastPhaseRef.current = null;
      return;
    }
    if (lastPhaseRef.current !== phaseIndex) {
      lastPhaseRef.current = phaseIndex;
      playBreathCue(currentBreathPhase.cue, soundEnabled);
    }
  }, [breathActive, phaseIndex, currentBreathPhase.cue, soundEnabled]);

  // Compute tracer dot position around the 180x180 square (x: 20..200, y: 20..200)
  const boxMin = 22;
  const boxMax = 198;
  const boxSpan = boxMax - boxMin;
  let dotX = boxMin;
  let dotY = boxMin;
  let innerScale = 0.72;

  if (phaseIndex === 0) {
    // Top edge: left -> right (Inhale)
    dotX = boxMin + boxSpan * phaseFraction;
    dotY = boxMin;
    innerScale = 0.68 + 0.32 * phaseFraction;
  } else if (phaseIndex === 1) {
    // Right edge: top -> bottom (Hold Full)
    dotX = boxMax;
    dotY = boxMin + boxSpan * phaseFraction;
    innerScale = 1.0;
  } else if (phaseIndex === 2) {
    // Bottom edge: right -> left (Exhale)
    dotX = boxMax - boxSpan * phaseFraction;
    dotY = boxMax;
    innerScale = 1.0 - 0.32 * phaseFraction;
  } else {
    // Left edge: bottom -> top (Hold Empty)
    dotX = boxMin;
    dotY = boxMax - boxSpan * phaseFraction;
    innerScale = 0.68;
  }

  // ---------------- Classic Discipline Books State ----------------
  const [selectedBookId, setSelectedBookId] = useState(
    CLASSIC_DISCIPLINE_BOOKS[0].id
  );
  const activeBook =
    CLASSIC_DISCIPLINE_BOOKS.find((b) => b.id === selectedBookId) ??
    CLASSIC_DISCIPLINE_BOOKS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400 font-mono-tabular">
            Pomodoro Focus · Ambient Soundscapes · Box Breathing · 5 Classic Summaries
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Discipline Mini Tools
          </h1>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          className="min-h-[44px] px-4 rounded-xl border border-zinc-800 bg-[#111113] hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-[#f59e0b]" />
              <span>Audio Cues On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-zinc-500" />
              <span>Audio Cues Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Top Row: Pomodoro Focus Timer & Animated Box Breathing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 25/50-Minute Pomodoro Focus Timer */}
        <section className="lg:col-span-6 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#e11d48] font-semibold">
                  <Timer className="w-3.5 h-3.5" />
                  <span>Focus Timer</span>
                </div>
                <h2 className="text-lg font-semibold text-white mt-0.5">
                  Pomodoro Deep Session
                </h2>
              </div>
              <div className="text-right font-mono-tabular">
                <div className="text-[11px] text-zinc-500">Completed</div>
                <div className="text-sm font-bold text-white">
                  {pomodorosCompleted}
                </div>
              </div>
            </div>

            {/* 25 / 50 Segmented Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#09090b] border border-zinc-800/80">
              <button
                type="button"
                onClick={() => handleSelectMode(25)}
                className={`min-h-[44px] rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  modeMinutes === 25
                    ? 'bg-[#e11d48] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                25 Min (+{POMODORO_25_XP} XP)
              </button>
              <button
                type="button"
                onClick={() => handleSelectMode(50)}
                className={`min-h-[44px] rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  modeMinutes === 50
                    ? 'bg-[#e11d48] text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                50 Min (+{POMODORO_50_XP} XP)
              </button>
            </div>

            {/* Task Intention Input */}
            <input
              type="text"
              value={focusTask}
              onChange={(e) => setFocusTask(e.target.value)}
              placeholder="Single objective for this block (optional)..."
              maxLength={70}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#e11d48] transition-colors"
            />

            {/* Active Soundscape Cue Summary */}
            <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <AudioLines
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isAmbientActive ? 'text-[#f59e0b]' : 'text-zinc-500'
                  }`}
                />
                <span className="truncate">
                  {soundscapePrefs.soundscapeId === 'none'
                    ? 'Soundscape: Off · Classic chime on finish'
                    : `${activeSoundscape.name} · ${
                        soundscapePrefs.triggerOnComplete
                          ? 'Triggers on completion'
                          : 'Manual ambience only'
                      }`}
                </span>
              </div>
              {soundscapePrefs.soundscapeId !== 'none' && (
                <button
                  type="button"
                  onClick={() => {
                    if (!soundEnabled) onToggleSound();
                    playFocusCompletionSoundscape(
                      soundscapePrefs.soundscapeId,
                      true,
                      soundscapePrefs.volume
                    );
                  }}
                  className="text-xs font-medium text-[#f59e0b] hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
                >
                  Test Cue
                </button>
              )}
            </div>
          </div>

          {/* Countdown Ring */}
          <div className="flex flex-col items-center py-2">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 184 184">
                <circle
                  cx="92"
                  cy="92"
                  r={pRadius}
                  fill="none"
                  stroke="#18181b"
                  strokeWidth="10"
                />
                <circle
                  cx="92"
                  cy="92"
                  r={pRadius}
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={pCircumference}
                  strokeDashoffset={pOffset}
                  className="transition-[stroke-dashoffset] duration-500 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono-tabular text-4xl font-bold text-white tracking-tight">
                  {pMins}:{pSecs}
                </span>
                <span className="text-xs text-[#f59e0b] font-mono-tabular mt-1">
                  Reward: +{pomodoroRewardXP} XP
                </span>
              </div>
            </div>

            {justFinished !== null && (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Session complete! +{justFinished} XP &amp; Focus Stat boosted.
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (secondsLeft === 0) {
                  setSecondsLeft(modeMinutes * 60);
                  pomodoroRewardedRef.current = false;
                  setJustFinished(null);
                }
                setIsRunning((prev) => !prev);
              }}
              className="flex-1 min-h-[48px] px-5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>
                    {secondsLeft === totalPomodoroSeconds || secondsLeft === 0
                      ? 'Start Focus Block'
                      : 'Resume Session'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetPomodoro}
              aria-label="Reset Pomodoro timer"
              className="min-h-[48px] min-w-[48px] rounded-xl border border-zinc-800 bg-[#09090b] hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Animated Box Breathing Visual Guide */}
        <section className="lg:col-span-6 bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-semibold">
                <Wind className="w-3.5 h-3.5" />
                <span>4 · 4 · 4 · 4 Nervous System Reset</span>
              </div>
              <h2 className="text-lg font-semibold text-white mt-0.5">
                Box Breathing Visual Guide
              </h2>
            </div>
            <div className="text-right font-mono-tabular">
              <div className="text-[11px] text-zinc-500">Cycles</div>
              <div className="text-sm font-bold text-emerald-400">
                {completedBreathCycles}
              </div>
            </div>
          </div>

          {/* Animated Box SVG */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full"
                aria-label="Box breathing visual pacer"
              >
                {/* Outer Guide Square */}
                <rect
                  x={boxMin}
                  y={boxMin}
                  width={boxSpan}
                  height={boxSpan}
                  rx="16"
                  fill="#09090b"
                  stroke="#27272a"
                  strokeWidth="3"
                />

                {/* Highlight active side */}
                {breathActive && phaseIndex === 0 && (
                  <line
                    x1={boxMin}
                    y1={boxMin}
                    x2={dotX}
                    y2={boxMin}
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
                {breathActive && phaseIndex === 1 && (
                  <line
                    x1={boxMax}
                    y1={boxMin}
                    x2={boxMax}
                    y2={dotY}
                    stroke="#e11d48"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
                {breathActive && phaseIndex === 2 && (
                  <line
                    x1={boxMax}
                    y1={boxMax}
                    x2={dotX}
                    y2={boxMax}
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
                {breathActive && phaseIndex === 3 && (
                  <line
                    x1={boxMin}
                    y1={boxMax}
                    x2={boxMin}
                    y2={dotY}
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}

                {/* Expanding / Contracting Inner Breathing Box */}
                <g
                  style={{
                    transformOrigin: '110px 110px',
                    transform: `scale(${breathActive ? innerScale : 0.78})`,
                  }}
                >
                  <rect
                    x="56"
                    y="56"
                    width="108"
                    height="108"
                    rx="14"
                    fill="#e11d48"
                    fillOpacity={breathActive ? 0.14 : 0.06}
                    stroke={breathActive ? '#e11d48' : '#3f3f46'}
                    strokeOpacity={0.7}
                    strokeWidth="1.5"
                  />
                </g>

                {/* Moving Tracer Orb */}
                <circle
                  cx={breathActive ? dotX : boxMin}
                  cy={breathActive ? dotY : boxMin}
                  r="8"
                  fill="#f59e0b"
                  stroke="#09090b"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Center Phase Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
                <span className="font-display text-2xl font-bold text-white tracking-wide">
                  {breathActive ? currentBreathPhase.label : 'Ready'}
                </span>
                <span className="font-mono-tabular text-3xl font-bold text-[#f59e0b] mt-0.5">
                  {breathActive ? `${phaseCountdown}s` : '4s'}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 text-center mt-2 min-h-[18px]">
              {breathActive
                ? currentBreathPhase.instruction
                : 'Follow the tracer around the box: 4s Inhale · 4s Hold · 4s Exhale · 4s Hold'}
            </p>
          </div>

          {/* Box Breathing Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setBreathActive((prev) => !prev)}
              className="flex-1 min-h-[48px] px-5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {breathActive ? (
                <>
                  <Pause className="w-4 h-4 text-[#f59e0b]" />
                  <span>Pause Breathing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#f59e0b]" />
                  <span>
                    {breathElapsedMs > 0 ? 'Resume Box Breathing' : 'Start Box Breathing'}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setBreathActive(false);
                setBreathElapsedMs(0);
              }}
              aria-label="Reset Box Breathing"
              className="min-h-[48px] min-w-[48px] rounded-xl border border-zinc-800 bg-[#09090b] hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Ambient Focus Soundscapes & Block Completion Cues */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-semibold">
              <AudioLines className="w-3.5 h-3.5" />
              <span>Optional Web Audio Soundscapes</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ambient Focus Soundscapes
            </h2>
          </div>

          <div className="text-xs text-zinc-400">
            {isAmbientActive
              ? `Playing ${activeSoundscape.name}`
              : activeSoundscape.id === 'none'
                ? 'Classic chime active'
                : `Completion cue: ${activeSoundscape.completionDetail}`}
          </div>
        </div>

        {/* 5 Soundscape Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {FOCUS_SOUNDSCAPES.map((scape) => {
            const selected = soundscapePrefs.soundscapeId === scape.id;
            const Icon =
              scape.id === 'brown-noise'
                ? Waves
                : scape.id === 'zen-garden-chimes'
                  ? BellRing
                  : scape.id === 'soft-rain'
                    ? CloudRain
                    : scape.id === 'binaural-alpha'
                      ? Sparkles
                      : VolumeX;

            return (
              <button
                key={scape.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  if (scape.id === 'none') {
                    setIsPreviewPlaying(false);
                  }
                  setSoundscapePrefs((prev) => ({
                    ...prev,
                    soundscapeId: scape.id,
                  }));
                }}
                className={`min-h-[84px] p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-colors ${
                  selected
                    ? 'bg-zinc-900/95 border-[#f59e0b]/70 text-white'
                    : 'bg-[#09090b] border-zinc-800/90 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">
                    {scape.name}
                  </span>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      selected ? 'text-[#f59e0b]' : 'text-zinc-500'
                    }`}
                  />
                </div>
                <span className="text-xs text-zinc-400 leading-snug">
                  {scape.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Playback Controls, Volume & Trigger Toggles */}
        <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Toggles */}
          <div className="lg:col-span-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={soundscapePrefs.triggerOnComplete}
              disabled={soundscapePrefs.soundscapeId === 'none'}
              onClick={() =>
                setSoundscapePrefs((prev) => ({
                  ...prev,
                  triggerOnComplete: !prev.triggerOnComplete,
                }))
              }
              className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-40 ${
                soundscapePrefs.triggerOnComplete &&
                soundscapePrefs.soundscapeId !== 'none'
                  ? 'bg-[#e11d48]/15 border-[#e11d48]/50 text-white'
                  : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Trigger on Completion:{' '}
              {soundscapePrefs.triggerOnComplete ? 'On' : 'Off'}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={soundscapePrefs.playDuringFocus}
              disabled={soundscapePrefs.soundscapeId === 'none'}
              onClick={() =>
                setSoundscapePrefs((prev) => ({
                  ...prev,
                  playDuringFocus: !prev.playDuringFocus,
                }))
              }
              className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-40 ${
                soundscapePrefs.playDuringFocus &&
                soundscapePrefs.soundscapeId !== 'none'
                  ? 'bg-[#f59e0b]/15 border-[#f59e0b]/50 text-[#f59e0b]'
                  : 'bg-[#09090b] border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Play During Focus: {soundscapePrefs.playDuringFocus ? 'On' : 'Off'}
            </button>
          </div>

          {/* Volume Slider */}
          <div className="lg:col-span-3 flex items-center gap-3">
            <label
              htmlFor="soundscape-volume"
              className="text-xs text-zinc-400 whitespace-nowrap"
            >
              Level
            </label>
            <input
              id="soundscape-volume"
              type="range"
              min={15}
              max={100}
              step={5}
              value={Math.round(soundscapePrefs.volume * 100)}
              disabled={soundscapePrefs.soundscapeId === 'none'}
              onChange={(e) =>
                setSoundscapePrefs((prev) => ({
                  ...prev,
                  volume: Number(e.target.value) / 100,
                }))
              }
              className="flex-1 accent-[#f59e0b] cursor-pointer disabled:opacity-40"
            />
            <span className="font-mono-tabular text-xs text-zinc-300 w-9 text-right">
              {Math.round(soundscapePrefs.volume * 100)}%
            </span>
          </div>

          {/* Live Listen & Completion Cue Preview */}
          <div className="lg:col-span-4 flex items-center gap-2 lg:justify-end">
            <button
              type="button"
              disabled={soundscapePrefs.soundscapeId === 'none'}
              onClick={() => {
                if (!soundEnabled) {
                  onToggleSound();
                }
                setIsPreviewPlaying((prev) => !prev);
              }}
              className={`flex-1 lg:flex-none min-h-[44px] px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-40 ${
                isPreviewPlaying && soundEnabled
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-zinc-950'
                  : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 text-white'
              }`}
            >
              {isPreviewPlaying && soundEnabled ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Ambience</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Listen Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!soundEnabled) {
                  onToggleSound();
                }
                playFocusCompletionSoundscape(
                  soundscapePrefs.soundscapeId,
                  true,
                  soundscapePrefs.volume
                );
              }}
              className="flex-1 lg:flex-none min-h-[44px] px-4 rounded-xl bg-[#09090b] border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <BellRing className="w-3.5 h-3.5 text-[#e11d48]" />
              <span>Preview Completion</span>
            </button>
          </div>
        </div>

        {!soundEnabled && soundscapePrefs.soundscapeId !== 'none' && (
          <div className="text-xs text-zinc-400 flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
            <span>
              Global audio cues are currently muted. Enable audio to hear focus soundscapes.
            </span>
            <button
              type="button"
              onClick={onToggleSound}
              className="text-xs font-semibold text-[#f59e0b] hover:text-amber-300 whitespace-nowrap shrink-0"
            >
              Enable Audio
            </button>
          </div>
        )}
      </section>

      {/* Bottom Section: 5 Bite-Sized Action Summaries of Classic Discipline Books */}
      <section className="bg-[#111113] border border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>5 Classic Discipline Playbooks</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bite-Sized Action Summaries
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Zero fluff · Immediate daily execution
          </span>
        </div>

        {/* Book Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CLASSIC_DISCIPLINE_BOOKS.map((book, idx) => {
            const selected = book.id === activeBook.id;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBookId(book.id)}
                className={`min-h-[44px] px-4 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selected
                    ? 'bg-white text-zinc-950 border-white font-semibold'
                    : 'bg-[#09090b] text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                0{idx + 1}. {book.title}
              </button>
            );
          })}
        </div>

        {/* Active Book Action Summary */}
        <div className="rounded-xl bg-[#09090b] border border-zinc-800/90 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-zinc-800/80">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {activeBook.title}
              </h3>
              <div className="text-xs text-zinc-400 mt-0.5">
                {activeBook.author} · {activeBook.coreFocus} · {activeBook.readTime}
              </div>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-3xl">
            {activeBook.thesis}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {activeBook.actionRules.map((rule, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#111113] border border-zinc-800/80 p-4 space-y-1.5"
              >
                <div className="font-mono-tabular text-xs font-semibold text-[#f59e0b]">
                  Action Rule 0{idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs sm:text-sm text-zinc-200">
              <span className="font-semibold text-emerald-400">
                Execute Today:{' '}
              </span>
              {activeBook.immediateAction}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
