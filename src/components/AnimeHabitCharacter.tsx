import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimeCharacterId } from '../data/animeCharacters';

interface AnimeHabitCharacterProps {
  characterId: AnimeCharacterId;
  checked?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  powerUpSignal?: number;
  className?: string;
}

interface PaletteIds {
  skin: string;
  hair: string;
  armor: string;
  crimson: string;
  gold: string;
  steel: string;
  emerald: string;
}

const SIZE_CLASSES: Record<
  NonNullable<AnimeHabitCharacterProps['size']>,
  string
> = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-28 h-28',
  xl: 'w-56 h-56 sm:w-64 sm:h-64',
};

const INK = '#060609';
const SKIN_SHADOW = '#c27b56';
const RIM_GOLD = '#fbbf24';
const RIM_CRIMSON = '#fb7185';

export const AnimeHabitCharacter: React.FC<AnimeHabitCharacterProps> = ({
  characterId,
  checked = false,
  size = 'md',
  powerUpSignal = 0,
  className = '',
}) => {
  const [isPoweringUp, setIsPoweringUp] = useState(false);
  const prevCheckedRef = useRef<boolean>(checked);
  const prevSignalRef = useRef<number>(powerUpSignal);
  const rawId = useId().replace(/:/g, '');

  useEffect(() => {
    const justChecked = !prevCheckedRef.current && checked;
    const signalFired =
      powerUpSignal !== prevSignalRef.current && powerUpSignal > 0;

    prevCheckedRef.current = checked;
    prevSignalRef.current = powerUpSignal;

    if (justChecked || signalFired) {
      setIsPoweringUp(false);
      const raf = window.requestAnimationFrame(() => {
        setIsPoweringUp(true);
      });
      const timer = window.setTimeout(() => {
        setIsPoweringUp(false);
      }, 1100);
      return () => {
        window.cancelAnimationFrame(raf);
        window.clearTimeout(timer);
      };
    }
  }, [checked, powerUpSignal]);

  const p: PaletteIds = {
    skin: `sk-${rawId}`,
    hair: `hr-${rawId}`,
    armor: `ar-${rawId}`,
    crimson: `cr-${rawId}`,
    gold: `gd-${rawId}`,
    steel: `st-${rawId}`,
    emerald: `em-${rawId}`,
  };

  return (
    <div
      className={`relative shrink-0 select-none flex items-center justify-center rounded-xl border overflow-visible transition-colors ${
        checked
          ? 'bg-emerald-500/10 border-emerald-500/45'
          : 'bg-[#09090b] border-zinc-800/90'
      } ${SIZE_CLASSES[size]} ${className}`}
    >
      {/* Power-Up Shockwave Aura Ring on Habit Check */}
      {isPoweringUp && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1 rounded-2xl border-2 border-[#f59e0b] anime-powerup-ring z-20"
            style={{
              boxShadow:
                '0 0 18px rgba(245, 158, 11, 0.8), inset 0 0 12px rgba(225, 29, 72, 0.55)',
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-t from-[#e11d48]/35 via-[#f59e0b]/25 to-transparent anime-spark-rise z-10"
          />
        </>
      )}

      {/* Subtle steady completion aura when checked */}
      {checked && !isPoweringUp && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-emerald-500/12 via-transparent to-[#f59e0b]/10"
        />
      )}

      {/* High-Contrast Dark-Fantasy Shonen Anime SVG */}
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full p-0.5 relative z-10 ${
          isPoweringUp ? 'anime-powerup-surge' : ''
        }`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`aura-${rawId}`} cx="50%" cy="46%" r="52%">
            <stop
              offset="0%"
              stopColor={checked ? '#f59e0b' : '#e11d48'}
              stopOpacity={isPoweringUp ? '0.62' : '0.32'}
            />
            <stop
              offset="55%"
              stopColor={checked ? '#10b981' : '#f59e0b'}
              stopOpacity="0.14"
            />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={p.skin} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe4c8" />
            <stop offset="68%" stopColor="#f2be93" />
            <stop offset="100%" stopColor="#d9976c" />
          </linearGradient>

          <linearGradient id={p.hair} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#2c2c38" />
            <stop offset="48%" stopColor="#14141b" />
            <stop offset="100%" stopColor="#07070a" />
          </linearGradient>

          <linearGradient id={p.armor} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b2b34" />
            <stop offset="55%" stopColor="#16161c" />
            <stop offset="100%" stopColor="#09090d" />
          </linearGradient>

          <linearGradient id={p.crimson} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="45%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          <linearGradient id={p.gold} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id={p.steel} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="50%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#52525b" />
          </linearGradient>

          <linearGradient id={p.emerald} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>

        {/* Dramatic Dark-Fantasy Rim Aura & Speed-Line Accent */}
        <circle
          cx="60"
          cy="58"
          r="50"
          fill={`url(#aura-${rawId})`}
          className="anime-glow-pulse"
        />
        <path
          d="M14 98 L24 84 M106 96 L96 82 M18 24 L28 32 M102 24 L92 32"
          stroke="#f59e0b"
          strokeOpacity="0.16"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {characterId === 'fitness' && <FitnessShonenSvg p={p} />}
        {characterId === 'focus' && <FocusShonenSvg p={p} />}
        {characterId === 'mindset' && <MindsetShonenSvg p={p} />}
        {characterId === 'detox' && <DetoxShonenSvg p={p} />}
        {characterId === 'nutrition' && <NutritionShonenSvg p={p} />}
        {characterId === 'sleep' && <SleepShonenSvg p={p} />}
        {characterId === 'urge-slayer' && <UrgeSlayerShonenSvg p={p} />}
        {characterId === 'night-chronicler' && <NightChroniclerShonenSvg p={p} />}
        {characterId === 'boss-slayer' && <BossSlayerShonenSvg p={p} />}
        {characterId === 'day66-sovereign' && <Day66SovereignShonenSvg p={p} />}

        {/* Rising Anime Ki Sparks during Power-Up */}
        {isPoweringUp && (
          <g className="anime-spark-rise">
            <path d="M20 42 L24 24 L28 42 L24 37 Z" fill="#f59e0b" />
            <path d="M92 38 L96 18 L100 38 L96 32 Z" fill="#fef08a" />
            <path d="M57 18 L60 5 L63 18 L60 14 Z" fill="#e11d48" />
            <polygon points="33,22 35,17 37,22 35,25" fill="#fef08a" />
            <polygon points="84,22 86,17 88,22 86,25" fill="#fb7185" />
          </g>
        )}
      </svg>
    </div>
  );
};

/* 1. FITNESS — Kuro: Shonen martial artist pressing forged crimson-gold barbell overhead */
const FitnessShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Ground crack shadow */}
    <ellipse cx="60" cy="111" rx="30" ry="4.5" fill="#050507" />
    <path d="M36 111 L44 109 M84 111 L76 109" stroke="#e11d48" strokeOpacity="0.45" strokeWidth="1" />

    {/* Overhead Forged Barbell & Muscular Sculpted Arms */}
    <g className="anime-barbell">
      {/* Barbell Bar */}
      <rect x="10" y="21" width="100" height="4.2" rx="1.5" fill={`url(#${p.steel})`} stroke={INK} strokeWidth="1.2" />
      {/* Left Beveled Plates */}
      <polygon points="12,11 19,9 19,37 12,35" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.3" />
      <rect x="20" y="13" width="5.5" height="20" rx="1" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1.2" />
      <line x1="14" y1="12" x2="14" y2="33" stroke={RIM_CRIMSON} strokeWidth="1" />
      {/* Right Beveled Plates */}
      <polygon points="108,11 101,9 101,37 108,35" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.3" />
      <rect x="94.5" y="13" width="5.5" height="20" rx="1" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1.2" />
      <line x1="106" y1="12" x2="106" y2="33" stroke={RIM_CRIMSON} strokeWidth="1" />

      {/* Left Sculpted Arm (Deltoid -> Bicep -> Forearm) */}
      <path
        d="M44 64 L32 54 L27 42 L34 25 L41 26 L36 42 L43 52 L48 58 Z"
        fill={`url(#${p.skin})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path d="M32 54 L36 42 L41 48 L39 56 Z" fill={SKIN_SHADOW} opacity="0.65" />
      {/* Right Sculpted Arm */}
      <path
        d="M76 64 L88 54 L93 42 L86 25 L79 26 L84 42 L77 52 L72 58 Z"
        fill={`url(#${p.skin})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path d="M88 54 L84 42 L79 48 L81 56 Z" fill={SKIN_SHADOW} opacity="0.65" />

      {/* Crimson Battle Wrist Wraps & Clenched Fists */}
      <rect x="33" y="21" width="9" height="7" rx="2" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.2" />
      <rect x="78" y="21" width="9" height="7" rx="2" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.2" />
      <path d="M34 29 L40 31 M86 29 L80 31" stroke={RIM_GOLD} strokeWidth="1.1" />
    </g>

    {/* Wide Power-Stance Legs & Martial Pants */}
    <path
      d="M46 88 L37 110 L49 110 L57 93 L63 93 L71 110 L83 110 L74 88 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.4"
    />
    <path d="M46 92 L41 108 M74 92 L79 108" stroke={RIM_CRIMSON} strokeOpacity="0.55" strokeWidth="1" />

    {/* Muscular Torso & Sleeveless Dark-Fantasy Battle Gi */}
    <path
      d="M43 57 L77 57 L74 89 L46 89 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.4"
    />
    {/* Exposed Chest V with Cel-Shaded Collarbone */}
    <polygon points="51,57 60,74 69,57" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.1" />
    <path d="M55 61 L60 68 L65 61" fill="none" stroke={SKIN_SHADOW} strokeWidth="1.3" />
    {/* Crimson-Gold Gi Lapels */}
    <path d="M49 57 L60 76 L71 57" fill="none" stroke={`url(#${p.crimson})`} strokeWidth="2.8" />
    <path d="M46 57 L43 68 M74 57 L77 68" stroke={RIM_GOLD} strokeWidth="1.1" />
    {/* Tied Crimson Sash Belt with Flowing Tails */}
    <path d="M45 83 L75 83 L74 89 L46 89 Z" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.2" />
    <path d="M62 88 L68 98 L64 99 L59 89 Z" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1" />

    {/* Neck & Jaw Shadow */}
    <path d="M56 53 L56 60 L64 60 L64 53 Z" fill={SKIN_SHADOW} />

    {/* Sharp Sculpted Shonen Head */}
    <path
      d="M49 41 L50 51 L60 58 L70 51 L71 41 Z"
      fill={`url(#${p.skin})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    {/* Cel-shade under bangs & right cheek */}
    <path d="M63 45 L70 43 L69 51 L60 57 L64 51 Z" fill={SKIN_SHADOW} opacity="0.55" />

    {/* Fierce Shonen Spiky Hair (Back + Front Layered Spikes) */}
    <path
      d="M47 45 L39 36 L47 36 L44 26 L53 32 L57 22 L62 32 L70 23 L71 33 L81 30 L75 40 L82 44 L71 46 L67 40 L63 44 L60 38 L55 44 L51 40 Z"
      fill={`url(#${p.hair})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    {/* Dramatic Gold Rim Highlights on Hair Spikes */}
    <path d="M46 28 L52 33 M58 24 L61 31 M70 25 L70 32" stroke={RIM_GOLD} strokeWidth="1.1" />

    {/* Crimson Battle Headband + Flowing Tail */}
    <path d="M48 41 Q60 38 72 41 L71 44 Q60 41.5 49 44 Z" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1" />
    <path d="M72 42 L85 45 L79 48 L88 52 L75 47 Z" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1" />

    {/* Fierce Expressive Shonen Eyes */}
    <polygon points="51.5,46.5 58,48 56.5,50 52,49.5" fill="#ffffff" />
    <circle cx="55.2" cy="48.4" r="1.4" fill="#f59e0b" />
    <circle cx="55.2" cy="48.4" r="0.7" fill={INK} />
    <path d="M51 45.8 L58.5 47.6" stroke={INK} strokeWidth="1.7" />

    <polygon points="68.5,46.5 62,48 63.5,50 68,49.5" fill="#ffffff" />
    <circle cx="64.8" cy="48.4" r="1.4" fill="#f59e0b" />
    <circle cx="64.8" cy="48.4" r="0.7" fill={INK} />
    <path d="M69 45.8 L61.5 47.6" stroke={INK} strokeWidth="1.7" />

    {/* Gritted Determined Expression */}
    <path d="M57 53.5 L63 53.5" stroke={INK} strokeWidth="1.4" />
  </g>
);

/* 2. FOCUS — Ren: Razor-sharp tactical anime scholar studying glowing arcane grimoire */
const FocusShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Floating Golden Arcane Runes */}
    <g className="anime-float">
      <polygon points="22,22 29,18 29,31 22,35" fill="#f59e0b" fillOpacity="0.22" stroke="#f59e0b" strokeWidth="1.1" />
      <line x1="24" y1="24" x2="27" y2="22" stroke="#fef08a" strokeWidth="1" />
      <polygon points="98,24 91,20 91,33 98,37" fill="#e11d48" fillOpacity="0.22" stroke="#fb7185" strokeWidth="1.1" />
      <polygon points="60,12 63,16 60,20 57,16" fill="#fef08a" />
    </g>

    {/* High-Collar Dark Tactical Coat */}
    <path
      d="M27 86 L34 62 L49 56 L71 56 L86 62 L93 86 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.5"
    />
    {/* Crimson Inner Vest & Gold Lapel Rim */}
    <polygon points="51,57 60,77 69,57" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.2" />
    <path d="M46 57 L55 78 M74 57 L65 78" stroke={RIM_GOLD} strokeWidth="1.2" />
    {/* Dramatic Upright Collar Flaps */}
    <polygon points="44,58 49,49 53,58" fill="#18181f" stroke={RIM_GOLD} strokeWidth="1" />
    <polygon points="76,58 71,49 67,58" fill="#18181f" stroke={RIM_GOLD} strokeWidth="1" />

    {/* Neck */}
    <rect x="56" y="51" width="8" height="8" fill={SKIN_SHADOW} />

    {/* Sculpted Angular Anime Head */}
    <path
      d="M47 37 L48 49 L60 57 L72 49 L73 37 Z"
      fill={`url(#${p.skin})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    {/* Cel-shade cast from hair & right cheekbone */}
    <path d="M48 40 L72 40 L71 45 L62 43 L50 45 Z" fill={SKIN_SHADOW} opacity="0.45" />
    <path d="M64 49 L72 46 L70 51 L60 56.5 Z" fill={SKIN_SHADOW} opacity="0.5" />

    {/* Sharp Layered Strategist Hair with Swept Bangs */}
    <path
      d="M45 48 L42 35 L49 25 L62 21 L75 26 L79 38 L75 49 L71 40 L67 45 L64 36 L59 46 L55 37 L50 45 Z"
      fill={`url(#${p.hair})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    {/* Rim Light on Crown & Bang Tips */}
    <path d="M49 27 Q62 22 73 28" fill="none" stroke={RIM_GOLD} strokeWidth="1.1" />
    <path d="M45 36 L48 43 M75 36 L73 43" stroke={RIM_CRIMSON} strokeWidth="0.9" />

    {/* Sharp Tactical Glasses with Anime Glint */}
    <g>
      <polygon points="49,44 58.5,44.8 58,49.5 49.5,49" fill="#09090b" fillOpacity="0.4" stroke={`url(#${p.gold})`} strokeWidth="1.3" />
      <polygon points="71,44 61.5,44.8 62,49.5 70.5,49" fill="#09090b" fillOpacity="0.4" stroke={`url(#${p.gold})`} strokeWidth="1.3" />
      <line x1="58.5" y1="46.2" x2="61.5" y2="46.2" stroke="#f59e0b" strokeWidth="1.3" />
      {/* Piercing Eyes behind lenses */}
      <circle cx="54.2" cy="47" r="1.3" fill="#fef08a" />
      <circle cx="65.8" cy="47" r="1.3" fill="#fef08a" />
      {/* Iconic Diagonal Anime Glass Reflection */}
      <polygon points="50.5,44.6 53.2,44.7 51.4,48.8 50,48.7" fill="#fef08a" opacity="0.7" />
      <polygon points="62.8,44.9 65.4,44.8 63.6,48.9 62.2,48.8" fill="#fef08a" opacity="0.7" />
    </g>
    <path d="M57.5 52.8 L62.5 52.8" stroke={INK} strokeWidth="1.2" />

    {/* Obsidian Study Desk */}
    <polygon points="12,86 108,86 104,93 16,93" fill="#27272e" stroke={INK} strokeWidth="1.3" />
    <rect x="20" y="93" width="80" height="16" fill="#0c0c10" stroke="#27272a" strokeWidth="1" />

    {/* Upward Golden Light Shaft from Open Grimoire */}
    <polygon
      points="33,85 60,72 87,85 74,56 46,56"
      fill={`url(#${p.gold})`}
      fillOpacity="0.2"
      className="anime-glow-pulse"
    />

    {/* Open Dark-Fantasy Grimoire */}
    <path d="M31 85 L59 77 L59 88 L33 92 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.3" />
    <path d="M89 85 L61 77 L61 88 L87 92 Z" fill="#fde68a" stroke="#b45309" strokeWidth="1.3" />
    <path d="M37 85 L55 81 M38 88 L55 85 M65 81 L83 85 M65 85 L82 88" stroke="#d97706" strokeWidth="1" opacity="0.7" />

    {/* Sculpted Hands Anchoring Pages */}
    <path d="M33 84 L41 81 L43 86 L36 89 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.2" />
    <path d="M87 84 L79 81 L77 86 L84 89 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.2" />
  </g>
);

/* 3. MINDSET — Sora: Levitating dark-fantasy warrior-monk inside rotating sacred ring */
const MindsetShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Rotating Sacred Geometric Seal */}
    <g className="anime-spin-slow">
      <circle
        cx="60"
        cy="58"
        r="43"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.3"
        strokeDasharray="8 5"
        strokeOpacity="0.65"
      />
      <circle
        cx="60"
        cy="58"
        r="36"
        fill="none"
        stroke="#e11d48"
        strokeWidth="0.9"
        strokeDasharray="3 6"
        strokeOpacity="0.55"
      />
      <polygon points="60,12 63,17 60,21 57,17" fill="#fef08a" />
      <polygon points="103,58 98,61 94,58 98,55" fill="#fb7185" />
      <polygon points="60,104 63,99 60,95 57,99" fill="#fef08a" />
      <polygon points="17,58 22,61 26,58 22,55" fill="#fb7185" />
    </g>

    {/* Levitation Ground Shadow */}
    <ellipse cx="60" cy="108" rx="23" ry="3.8" fill="#050507" />

    <g className="anime-float">
      {/* Billowing Crimson-Gold Mystic Scarf */}
      <path
        d="M49 58 C35 61 24 53 16 63 C25 69 38 66 49 65 Z"
        fill={`url(#${p.crimson})`}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path d="M20 62 C30 61 38 63 46 61" fill="none" stroke={RIM_GOLD} strokeWidth="1" />
      <path
        d="M71 58 C84 55 95 62 103 54 C96 66 83 66 71 64 Z"
        fill={`url(#${p.crimson})`}
        stroke={INK}
        strokeWidth="1.2"
      />

      {/* Cross-Legged Lotus Robe Base */}
      <path
        d="M30 89 Q60 100 90 89 L80 78 L60 82 L40 78 Z"
        fill={`url(#${p.armor})`}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path d="M36 88 Q60 95 84 88" fill="none" stroke={RIM_GOLD} strokeWidth="1.2" />

      {/* Layered Warrior-Monk Robe Torso */}
      <path
        d="M45 57 L75 57 L81 84 L39 84 Z"
        fill={`url(#${p.armor})`}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path d="M49 57 L60 72 L71 57" fill="none" stroke={`url(#${p.gold})`} strokeWidth="2.2" />
      <rect x="44" y="79" width="32" height="4.5" rx="1" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1" />

      {/* Arms in Focused Mudra Pose */}
      <path
        d="M45 61 L37 73 L54 77 L55 72 L44 70 L49 63 Z"
        fill={`url(#${p.armor})`}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path
        d="M75 61 L83 73 L66 77 L65 72 L76 70 L71 63 Z"
        fill={`url(#${p.armor})`}
        stroke={INK}
        strokeWidth="1.2"
      />
      <circle cx="55" cy="74.5" r="2.6" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1" />
      <circle cx="65" cy="74.5" r="2.6" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1" />

      {/* Condensed Ki Energy Sphere */}
      <circle cx="60" cy="73.5" r="5.5" fill={`url(#${p.gold})`} className="anime-glow-pulse" />
      <circle cx="60" cy="73.5" r="2.8" fill="#ffffff" />

      {/* Neck & Sharp Serene Anime Face */}
      <rect x="56.5" y="51" width="7" height="7" fill={SKIN_SHADOW} />
      <path
        d="M49 38 L50 49 L60 56 L70 49 L71 38 Z"
        fill={`url(#${p.skin})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path d="M63 45 L70 43 L69 49 L60 55.5 Z" fill={SKIN_SHADOW} opacity="0.45" />

      {/* Warrior Topknot & Sharp Framed Side Locks */}
      <path
        d="M47 47 L46 33 L54 25 L66 25 L74 33 L73 47 L69 39 L64 43 L60 35 L56 43 L51 39 Z"
        fill={`url(#${p.hair})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path d="M55 26 L53 19 L60 15 L67 19 L65 26 Z" fill={`url(#${p.hair})`} stroke={INK} strokeWidth="1.2" />
      {/* Gold Hairpin */}
      <line x1="50" y1="22" x2="70" y2="20" stroke={`url(#${p.gold})`} strokeWidth="2.2" />
      <circle cx="71" cy="20" r="2" fill="#e11d48" stroke={INK} strokeWidth="0.8" />

      {/* Sharp Serene Closed Eyes & Calm Brows */}
      <path d="M51.5 44 L57.5 45.2 M68.5 44 L62.5 45.2" stroke={INK} strokeWidth="1.2" />
      <path d="M52 46.8 Q55 48.6 58 46.8" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M62 46.8 Q65 48.6 68 46.8" fill="none" stroke={INK} strokeWidth="1.6" />
      <path d="M58 51.8 L62 51.8" stroke={SKIN_SHADOW} strokeWidth="1.2" />
    </g>
  </g>
);

/* 4. DETOX — Vex: Hooded dark-fantasy ronin severing smartphone distraction with crimson blade slash */
const DetoxShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Sweeping Ronin Cloak & Armored Shoulders */}
    <path
      d="M16 108 L26 67 L45 58 L67 58 L80 72 L84 108 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.5"
    />
    {/* Layered Cloak Folds & Crimson Rim */}
    <path d="M27 72 L46 66 L54 106" fill="none" stroke="#09090d" strokeWidth="2.5" />
    <path d="M20 104 L28 69 L45 60" fill="none" stroke={RIM_CRIMSON} strokeWidth="1.3" />
    {/* High Face Mask / Collar */}
    <polygon points="39,57 54,67 69,57 65,71 54,77 43,71" fill="#121218" stroke={`url(#${p.crimson})`} strokeWidth="1.2" />

    {/* Deep Jagged Shonen Assassin Hood */}
    <path
      d="M31 59 L34 32 L46 20 L60 19 L72 30 L75 56 L66 63 L40 63 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.5"
    />
    <path d="M35 33 L46 21 L60 20 L71 31" fill="none" stroke={RIM_CRIMSON} strokeWidth="1.3" />

    {/* Pitch-Black Hood Interior + Hair Spikes Peeking Out */}
    <path d="M40 58 L41 34 L54 27 L67 35 L66 58 L54 62 Z" fill="#060609" />
    <path d="M42 35 L48 41 L52 33 L58 41 L64 34 L66 40 L54 30 Z" fill={`url(#${p.hair})`} />

    {/* Razor-Sharp Glowing Golden-Crimson Shonen Eyes */}
    <polygon points="44.5,45.5 52.5,47.5 46,49.5" fill="#fef08a" />
    <polygon points="46,46.6 50.5,47.6 47,48.6" fill="#f59e0b" />
    <polygon points="63.5,45.5 55.5,47.5 62,49.5" fill="#fef08a" />
    <polygon points="62,46.6 57.5,47.6 61,48.6" fill="#f59e0b" />

    {/* Floating Smartphone Being Cleaved in Half */}
    <g className="anime-float">
      {/* Upper Half Shifting Right */}
      <g transform="translate(2, -2)">
        <path d="M75 39 L97 39 L97 56 L75 70 Z" fill="#14141b" stroke="#71717a" strokeWidth="1.5" />
        <path d="M78 43 L94 43 L94 55 L78 65 Z" fill="#1f1f29" />
        <path d="M86 48 L86 54" stroke="#e11d48" strokeWidth="2" />
      </g>
      {/* Lower Half Shifting Left */}
      <g transform="translate(-1.5, 2)">
        <path d="M75 72 L97 58 L97 83 L75 83 Z" fill="#14141b" stroke="#52525b" strokeWidth="1.5" />
        <path d="M78 73 L94 63 L94 78 L78 78 Z" fill="#18181f" />
        <path d="M82 70 A4.5 4.5 0 0 0 90 70" fill="none" stroke="#e11d48" strokeWidth="1.8" />
      </g>

      {/* Blazing Crimson-Gold Katana Slash Arc */}
      <path
        d="M62 88 Q84 62 110 32 Q87 67 66 91 Z"
        fill={`url(#${p.crimson})`}
      />
      <path
        d="M64 88 Q85 63 109 33"
        fill="none"
        stroke="#fef08a"
        strokeWidth="1.7"
      />
      {/* Shatter Sparks */}
      <polygon points="73,53 76,49 77,54" fill="#fef08a" />
      <polygon points="99,49 104,46 101,53" fill="#fb7185" />
    </g>
  </g>
);

/* 5. NUTRITION — Aoi: Energetic shonen alchemist raising glowing emerald-gold elixir flask */
const NutritionShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Rising Vitality Energy Shards */}
    <g className="anime-float">
      <polygon points="90,16 93,21 90,26 87,21" fill="#34d399" />
      <polygon points="101,30 103,33 101,36 99,33" fill="#fef08a" />
      <polygon points="24,26 27,31 24,36 21,31" fill="#34d399" opacity="0.8" />
    </g>

    {/* High-Collar Dark Athletic Vanguard Jacket */}
    <path
      d="M32 108 L38 64 L54 58 L69 58 L77 67 L81 108 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.5"
    />
    {/* Emerald-Gold Energy Trim & Core */}
    <polygon points="49,60 57,80 65,60" fill={`url(#${p.emerald})`} stroke={INK} strokeWidth="1.2" />
    <path d="M40 65 L35 104 M47 61 L55 83" stroke="#34d399" strokeWidth="1.1" />
    <path d="M69 61 L60 83" stroke={RIM_GOLD} strokeWidth="1.1" />

    {/* Neck & Confident Sharp Anime Face */}
    <rect x="53" y="52" width="8" height="8" fill={SKIN_SHADOW} />
    <path
      d="M46 37 L47 49 L57 56.5 L67 49 L68 37 Z"
      fill={`url(#${p.skin})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    <path d="M60 44 L67 43 L66 49 L57 56 Z" fill={SKIN_SHADOW} opacity="0.45" />

    {/* Dynamic Layered Hair with Windswept Side Sweeps */}
    <path
      d="M44 48 L39 34 L48 23 L60 21 L72 28 L75 41 L69 48 L66 39 L62 43 L58 35 L52 43 L48 38 Z"
      fill={`url(#${p.hair})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    <path d="M47 25 Q59 21 70 28" fill="none" stroke="#34d399" strokeWidth="1.2" />
    <path d="M42 35 L46 42" stroke={RIM_GOLD} strokeWidth="1" />

    {/* Bright Determined Shonen Eyes & Confident Smirk */}
    <polygon points="49,44.5 55,45.5 54,48.2 49.5,48" fill="#ffffff" />
    <circle cx="52.3" cy="46.7" r="1.4" fill="#10b981" />
    <circle cx="52.3" cy="46.7" r="0.7" fill={INK} />
    <path d="M48.5 43.8 L55.5 45" stroke={INK} strokeWidth="1.6" />

    <polygon points="65,44.5 59,45.5 60,48.2 64.5,48" fill="#ffffff" />
    <circle cx="61.7" cy="46.7" r="1.4" fill="#10b981" />
    <circle cx="61.7" cy="46.7" r="0.7" fill={INK} />
    <path d="M65.5 43.8 L58.5 45" stroke={INK} strokeWidth="1.6" />

    <path d="M54 51.8 Q57.5 53.8 61.5 51.2" fill="none" stroke={INK} strokeWidth="1.3" />

    {/* Raised Forearm & Faceted Elixir Flask */}
    <path
      d="M72 74 L86 60 L91 64 L76 82 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    <path d="M84 58 L92 56 L93 63 L86 64 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.2" />

    <g className="anime-float">
      {/* Faceted Alchemical Flask */}
      <polygon
        points="85,34 95,34 100,45 98,61 82,61 80,45"
        fill="#064e3b"
        stroke={`url(#${p.gold})`}
        strokeWidth="1.5"
      />
      <polygon points="82,47 98,47 96.5,59 83.5,59" fill={`url(#${p.emerald})`} />
      <rect x="86.5" y="28" width="7" height="6" rx="1" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1.1" />
      <line x1="84" y1="45" x2="86" y2="57" stroke="#a7f3d0" strokeWidth="1.2" />
    </g>
  </g>
);

/* 6. SLEEP — Haru: Dawn warrior rising energized against molten crimson-gold sunrise */
const SleepShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Rotating Sun-Lance Rays */}
    <g className="anime-spin-slow">
      <circle
        cx="60"
        cy="54"
        r="41"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.6"
        strokeDasharray="3 11"
        strokeOpacity="0.7"
      />
      <circle
        cx="60"
        cy="54"
        r="34"
        fill="none"
        stroke="#e11d48"
        strokeWidth="1.2"
        strokeDasharray="6 10"
        strokeOpacity="0.55"
      />
    </g>

    {/* Blazing Dawn Sun Eclipse */}
    <circle cx="60" cy="54" r="27" fill={`url(#${p.crimson})`} fillOpacity="0.22" />
    <circle cx="60" cy="54" r="19" fill={`url(#${p.gold})`} fillOpacity="0.34" />

    <g className="anime-float">
      {/* Dynamic Stretched Warrior Arms Reaching Into Dawn */}
      <path
        d="M46 72 L24 46 L29 41 L50 64 Z"
        fill={`url(#${p.skin})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path
        d="M74 72 L96 46 L91 41 L70 64 Z"
        fill={`url(#${p.skin})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      {/* Crimson Forearm Bracers */}
      <polygon points="24,46 31,53 35,49 29,42" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.1" />
      <polygon points="96,46 89,53 85,49 91,42" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.1" />

      {/* Open-Collar Dark Dawn Tunic */}
      <path
        d="M44 65 L76 65 L72 104 L48 104 Z"
        fill={`url(#${p.armor})`}
        stroke={INK}
        strokeWidth="1.5"
      />
      <polygon points="52,65 60,81 68,65" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1.2" />
      <path d="M46 66 L49 102 M74 66 L71 102" stroke={RIM_GOLD} strokeWidth="1.1" />

      {/* Neck & Sculpted Face */}
      <rect x="56" y="58" width="8" height="8" fill={SKIN_SHADOW} />
      <path
        d="M49 43 L50 54 L60 61.5 L70 54 L71 43 Z"
        fill={`url(#${p.skin})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path d="M63 49 L70 48 L69 54 L60 60.5 Z" fill={SKIN_SHADOW} opacity="0.45" />

      {/* Wild Spiky Dawn Shonen Hair with Golden Rim Flare */}
      <path
        d="M47 48 L39 38 L48 39 L47 28 L55 35 L60 25 L66 35 L74 28 L73 39 L82 37 L74 48 L69 41 L64 46 L60 39 L55 46 L51 41 Z"
        fill={`url(#${p.hair})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      <path d="M48 30 L54 35 M60 27 L64 35 M73 30 L72 38" stroke="#fef08a" strokeWidth="1.2" />

      {/* Energized Dawn Eyes & Fierce Grin */}
      <path d="M51.5 49.5 Q55 46.8 58 49.5" fill="none" stroke={INK} strokeWidth="1.8" />
      <path d="M62 49.5 Q65 46.8 68.5 49.5" fill="none" stroke={INK} strokeWidth="1.8" />
      <path d="M55 54.5 Q60 58.5 65 54.5 Z" fill="#ffffff" stroke={INK} strokeWidth="1.2" />
    </g>

    {/* Crisp Molten Horizon Line */}
    <line x1="14" y1="104" x2="106" y2="104" stroke={`url(#${p.gold})`} strokeWidth="2.2" />
  </g>
);

/* 7. ACHIEVEMENT — Kael: Aegis Sentinel planting crimson-gold hexagonal energy bulwark */
const UrgeSlayerShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Sentinel Cape & Armored Torso */}
    <path d="M22 108 L32 62 L52 56 L70 58 L78 108 Z" fill={`url(#${p.armor})`} stroke={INK} strokeWidth="1.5" />
    <path d="M26 105 L35 64 L48 59" fill="none" stroke={RIM_CRIMSON} strokeWidth="1.3" />
    {/* Shoulder Pauldron */}
    <polygon points="27,63 45,56 49,69 32,74" fill="#272732" stroke={`url(#${p.gold})`} strokeWidth="1.3" />

    {/* Neck & Angular Jaw */}
    <rect x="49" y="50" width="8" height="8" fill={SKIN_SHADOW} />
    <path d="M42 35 L43 47 L53 54.5 L63 47 L64 35 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.3" />
    <path d="M56 42 L63 41 L62 47 L53 54 Z" fill={SKIN_SHADOW} opacity="0.5" />
    {/* Battle Scar */}
    <line x1="46.5" y1="45" x2="49.5" y2="50" stroke="#e11d48" strokeWidth="1.1" />

    {/* Swept Spiky Paladin Hair */}
    <path
      d="M40 45 L36 32 L45 23 L57 21 L68 29 L67 45 L62 37 L57 42 L53 34 L47 41 Z"
      fill={`url(#${p.hair})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    <path d="M45 25 L56 23 L66 30" fill="none" stroke={RIM_GOLD} strokeWidth="1.1" />

    {/* Resolute Shonen Eyes */}
    <polygon points="45,42.5 51.5,43.8 50.5,45.8 45.5,45.5" fill="#ffffff" />
    <circle cx="48.5" cy="44.4" r="1.2" fill="#e11d48" />
    <path d="M44.5 41.8 L52 43.4" stroke={INK} strokeWidth="1.6" />
    <polygon points="61,42.5 54.5,43.8 55.5,45.8 60.5,45.5" fill="#ffffff" />
    <circle cx="57.5" cy="44.4" r="1.2" fill="#e11d48" />
    <path d="M61.5 41.8 L54 43.4" stroke={INK} strokeWidth="1.6" />

    {/* Towering Beveled Crimson-Gold Aegis Shield */}
    <g className="anime-float">
      <polygon
        points="84,26 105,39 105,79 84,96 63,79 63,39"
        fill={`url(#${p.crimson})`}
        fillOpacity="0.28"
        stroke={`url(#${p.crimson})`}
        strokeWidth="2.4"
      />
      <polygon
        points="84,36 97,44 97,74 84,85 71,74 71,44"
        fill="#09090b"
        fillOpacity="0.55"
        stroke={`url(#${p.gold})`}
        strokeWidth="1.6"
      />
      {/* Shield Crest Diamond */}
      <polygon points="84,48 90,59 84,71 78,59" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1" />
    </g>
  </g>
);

/* 8. ACHIEVEMENT — Mina: Night Chronicler inscribing glowing scroll beneath crescent moon */
const NightChroniclerShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Razor Golden Crescent Moon */}
    <path
      d="M89 14 A15 15 0 1 0 105 33 A12 12 0 1 1 89 14 Z"
      fill={`url(#${p.gold})`}
      stroke={INK}
      strokeWidth="1"
    />

    {/* Long Dark Oracle Cloak */}
    <path
      d="M27 108 L35 64 L50 58 L68 58 L83 64 L91 108 Z"
      fill={`url(#${p.armor})`}
      stroke={INK}
      strokeWidth="1.5"
    />
    <path d="M46 59 L59 76 L72 59" fill="none" stroke={`url(#${p.gold})`} strokeWidth="1.8" />
    <path d="M35 66 L29 105" stroke={RIM_GOLD} strokeOpacity="0.55" strokeWidth="1.1" />

    {/* Long Flowing Back Hair */}
    <path d="M41 44 L36 74 L46 68 L72 68 L82 74 L77 44 Z" fill={`url(#${p.hair})`} stroke={INK} strokeWidth="1.3" />

    {/* Neck & Sharp Elegant Anime Face */}
    <rect x="55.5" y="51" width="7" height="8" fill={SKIN_SHADOW} />
    <path d="M48 37 L49 48.5 L59 56 L69 48.5 L70 37 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.3" />
    <path d="M62 44 L69 43 L68 48.5 L59 55.5 Z" fill={SKIN_SHADOW} opacity="0.4" />

    {/* Layered Oracle Bangs */}
    <path
      d="M45 48 L45 31 L54 23 L65 23 L73 31 L73 48 L68 38 L63 44 L59 35 L54 44 L49 38 Z"
      fill={`url(#${p.hair})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    <path d="M51 25 Q60 22 70 28" fill="none" stroke={RIM_GOLD} strokeWidth="1.1" />

    {/* Expressive Luminous Eyes */}
    <polygon points="51,44.5 57,45.5 56,48.5 51.5,48.2" fill="#ffffff" />
    <circle cx="54.2" cy="46.8" r="1.4" fill="#f59e0b" />
    <circle cx="54.2" cy="46.8" r="0.6" fill={INK} />
    <path d="M50.5 43.8 L57.5 45" stroke={INK} strokeWidth="1.6" />

    <polygon points="67,44.5 61,45.5 62,48.5 66.5,48.2" fill="#ffffff" />
    <circle cx="63.8" cy="46.8" r="1.4" fill="#f59e0b" />
    <circle cx="63.8" cy="46.8" r="0.6" fill={INK} />
    <path d="M67.5 43.8 L60.5 45" stroke={INK} strokeWidth="1.6" />

    {/* Floating Obsidian & Gold Scroll */}
    <g className="anime-float">
      <rect x="35" y="75" width="48" height="24" rx="2.5" fill="#0c0c12" stroke={`url(#${p.gold})`} strokeWidth="1.6" />
      <rect x="32" y="73" width="5" height="28" rx="1.5" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.1" />
      <rect x="81" y="73" width="5" height="28" rx="1.5" fill={`url(#${p.crimson})`} stroke={INK} strokeWidth="1.1" />
      <line x1="42" y1="83" x2="75" y2="83" stroke="#fef08a" strokeWidth="1.8" />
      <line x1="42" y1="90" x2="68" y2="90" stroke="#fb7185" strokeWidth="1.6" />
    </g>
  </g>
);

/* 9. ACHIEVEMENT — Tetsu: Vanguard Breaker hoisting forged crimson-gold greatsword */
const BossSlayerShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Massive Notched Dark-Fantasy Greatblade */}
    <g className="anime-barbell">
      <polygon
        points="88,8 98,20 93,74 82,74 78,20"
        fill={`url(#${p.crimson})`}
        stroke={INK}
        strokeWidth="1.5"
      />
      <polygon points="88,12 93,21 89,71 86,71 84,21" fill="#fef08a" opacity="0.45" />
      {/* Forged Crossguard & Hilt */}
      <polygon points="71,72 104,72 100,78 75,78" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1.3" />
      <rect x="84.5" y="78" width="6" height="17" rx="1.5" fill="#18181f" stroke={INK} strokeWidth="1.2" />
      <circle cx="87.5" cy="96" r="3" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1" />
    </g>

    {/* Plated Vanguard Armor */}
    <path d="M22 108 L31 61 L69 61 L77 108 Z" fill={`url(#${p.armor})`} stroke={INK} strokeWidth="1.5" />
    <polygon points="24,64 42,57 46,72 28,76" fill="#272732" stroke={`url(#${p.crimson})`} strokeWidth="1.4" />
    <polygon points="56,57 74,64 70,76 52,72" fill="#272732" stroke={`url(#${p.gold})`} strokeWidth="1.3" />
    <path d="M44 63 L50 82 L56 63" fill="none" stroke={`url(#${p.gold})`} strokeWidth="2" />

    {/* Neck & Fierce Face */}
    <rect x="46" y="51" width="8" height="8" fill={SKIN_SHADOW} />
    <path d="M39 36 L40 48 L50 55.5 L60 48 L61 36 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.3" />
    <path d="M53 43 L60 42 L59 48 L50 55 Z" fill={SKIN_SHADOW} opacity="0.55" />

    {/* Wild Jagged Shonen Hair */}
    <path
      d="M37 45 L30 33 L40 34 L38 22 L48 30 L54 19 L59 31 L69 27 L64 38 L70 43 L60 45 L56 38 L50 43 L45 37 Z"
      fill={`url(#${p.hair})`}
      stroke={INK}
      strokeWidth="1.3"
    />
    <path d="M40 24 L47 30 M54 21 L58 30 M67 28 L63 36" stroke={RIM_CRIMSON} strokeWidth="1.2" />

    {/* Blazing Berserker Eyes */}
    <polygon points="42.5,43.5 48.5,45.2 47.5,47.2 43,46.8" fill="#fef08a" />
    <circle cx="46" cy="45.6" r="0.9" fill="#e11d48" />
    <path d="M42 42.5 L49.2 44.8" stroke={INK} strokeWidth="1.7" />
    <polygon points="57.5,43.5 51.5,45.2 52.5,47.2 57,46.8" fill="#fef08a" />
    <circle cx="54" cy="45.6" r="0.9" fill="#e11d48" />
    <path d="M58 42.5 L50.8 44.8" stroke={INK} strokeWidth="1.7" />
    <path d="M46 51.5 L54 51.5" stroke={INK} strokeWidth="1.4" />
  </g>
);

/* 10. ACHIEVEMENT — Ryujin: Ascended Day 66 Sovereign with golden halo & crimson energy wings */
const Day66SovereignShonenSvg: React.FC<{ p: PaletteIds }> = ({ p }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {/* Rotating Celestial 66-Ring Halo */}
    <g className="anime-spin-slow">
      <circle
        cx="60"
        cy="47"
        r="39"
        fill="none"
        stroke={`url(#${p.gold})`}
        strokeWidth="2"
        strokeDasharray="9 5"
      />
      <circle
        cx="60"
        cy="47"
        r="33"
        fill="none"
        stroke="#e11d48"
        strokeWidth="1"
        strokeDasharray="4 8"
      />
    </g>

    {/* Twin Razor-Feathered Crimson-Gold Energy Wings */}
    <path
      d="M46 64 L10 34 L22 61 L11 72 L27 76 L19 88 L46 80 Z"
      fill={`url(#${p.crimson})`}
      fillOpacity="0.6"
      stroke={`url(#${p.gold})`}
      strokeWidth="1.3"
    />
    <path
      d="M74 64 L110 34 L98 61 L109 72 L93 76 L101 88 L74 80 Z"
      fill={`url(#${p.crimson})`}
      fillOpacity="0.6"
      stroke={`url(#${p.gold})`}
      strokeWidth="1.3"
    />

    <g className="anime-float">
      {/* Sovereign High-Collar Obsidian & Gold Armor */}
      <path d="M38 108 L44 61 L76 61 L82 108 Z" fill={`url(#${p.armor})`} stroke={`url(#${p.gold})`} strokeWidth="1.6" />
      <polygon points="50,61 60,82 70,61" fill={`url(#${p.gold})`} stroke={INK} strokeWidth="1.2" />
      <polygon points="55,61 60,72 65,61" fill={`url(#${p.crimson})`} />
      {/* Sharp Sovereign Collar */}
      <polygon points="39,62 45,49 51,62" fill="#14141b" stroke={RIM_GOLD} strokeWidth="1.2" />
      <polygon points="81,62 75,49 69,62" fill="#14141b" stroke={RIM_GOLD} strokeWidth="1.2" />

      {/* Neck & Sharp Royal Face */}
      <rect x="56" y="52" width="8" height="9" fill={SKIN_SHADOW} />
      <path d="M49 38 L50 49 L60 56.5 L70 49 L71 38 Z" fill={`url(#${p.skin})`} stroke={INK} strokeWidth="1.3" />
      <path d="M63 44 L70 43 L69 49 L60 56 Z" fill={SKIN_SHADOW} opacity="0.45" />

      {/* Windswept Sovereign Hair */}
      <path
        d="M46 47 L42 33 L51 24 L60 22 L69 24 L78 33 L74 47 L69 38 L64 43 L60 35 L56 43 L51 38 Z"
        fill={`url(#${p.hair})`}
        stroke={INK}
        strokeWidth="1.3"
      />
      {/* Forged Golden Samurai Crown Crest */}
      <polygon
        points="47,34 55,26 60,15 65,26 73,34 60,30"
        fill={`url(#${p.gold})`}
        stroke={INK}
        strokeWidth="1.2"
      />
      <polygon points="58,28 60,21 62,28 60,30" fill="#e11d48" />

      {/* Blazing Ascended Golden Eyes */}
      <polygon points="51.5,45 58,46.8 53,48.5" fill="#fef08a" />
      <polygon points="68.5,45 62,46.8 67,48.5" fill="#fef08a" />
      <path d="M51 44.3 L58.5 46.2 M69 44.3 L61.5 46.2" stroke={INK} strokeWidth="1.5" />
      <path d="M57.5 52 L62.5 52" stroke={INK} strokeWidth="1.2" />
    </g>
  </g>
);
