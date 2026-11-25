import React, { useId } from 'react';
import { PlantStageId } from '../types';

interface PlantIllustrationProps {
  stage: PlantStageId;
  size?: 'hero' | 'mini';
  className?: string;
}

export const PlantIllustration: React.FC<PlantIllustrationProps> = ({
  stage,
  size = 'hero',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const isMini = size === 'mini';

  const glowId = `plant-glow-${uid}`;
  const soilId = `plant-soil-${uid}`;
  const leafLightId = `leaf-light-${uid}`;
  const leafDeepId = `leaf-deep-${uid}`;
  const trunkId = `trunk-grad-${uid}`;
  const goldId = `gold-bloom-${uid}`;

  return (
    <svg
      viewBox="0 0 220 200"
      role="img"
      aria-label={`Plant growth stage: ${stage.replace('_', ' ')}`}
      className={`${isMini ? 'w-14 h-12' : 'w-full h-full max-w-[230px] max-h-[205px]'} select-none ${className}`}
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="48%" r="46%">
          <stop
            offset="0%"
            stopColor={
              stage === 'flourishing_tree'
                ? '#f59e0b'
                : stage === 'seed'
                ? '#d97706'
                : '#10b981'
            }
            stopOpacity={stage === 'flourishing_tree' ? '0.28' : '0.2'}
          />
          <stop offset="68%" stopColor="#10b981" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={soilId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3f2e25" />
          <stop offset="55%" stopColor="#261c17" />
          <stop offset="100%" stopColor="#14100e" />
        </linearGradient>

        <linearGradient id={leafLightId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id={leafDeepId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        <linearGradient id={trunkId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5c4033" />
          <stop offset="50%" stopColor="#7c5643" />
          <stop offset="100%" stopColor="#3f2a20" />
        </linearGradient>

        <radialGradient id={goldId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>

      {/* Soft ambient botanical halo */}
      <ellipse cx="110" cy="108" rx="92" ry="82" fill={`url(#${glowId})`} />

      {/* Ground / Soil Mound (shared earthy anchor) */}
      <g>
        <ellipse cx="110" cy="176" rx="76" ry="12" fill="#09090b" opacity="0.65" />
        <path
          d="M 40 174 Q 76 154 110 156 Q 144 154 180 174 Q 145 184 110 184 Q 75 184 40 174 Z"
          fill={`url(#${soilId})`}
          stroke="#523b2f"
          strokeWidth="1"
        />
        {/* Subtle soil grain pebbles */}
        <circle cx="72" cy="170" r="2" fill="#6b4e3e" opacity="0.65" />
        <circle cx="146" cy="168" r="2.2" fill="#5c4033" opacity="0.7" />
        <circle cx="128" cy="174" r="1.6" fill="#7c5643" opacity="0.55" />
        <circle cx="88" cy="175" r="1.5" fill="#7c5643" opacity="0.5" />
      </g>

      {/* STAGE 1: SEED (Days 1–3) */}
      {stage === 'seed' && (
        <g>
          {/* Delicate underground rootlets */}
          <path
            d="M 110 156 C 108 164 102 167 97 171 M 110 156 C 112 165 118 169 124 172 M 110 159 L 110 172"
            stroke="#d6b28d"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* Nestled Seed Body */}
          <g className={isMini ? '' : 'anime-float'}>
            <path
              d="M 110 118 C 127 126 130 148 118 159 C 113 163 107 163 102 159 C 90 148 93 126 110 118 Z"
              fill="#b45309"
              stroke="#f59e0b"
              strokeWidth="1.4"
            />
            <path
              d="M 110 121 C 102 132 102 148 109 158"
              stroke="#fde68a"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            {/* Tiny emerald first-life crack at seed tip */}
            <path
              d="M 110 119 C 110 111 115 106 121 105 C 118 112 114 117 110 119 Z"
              fill={`url(#${leafLightId})`}
            />
          </g>

          {/* Soft dew shimmer */}
          {!isMini && (
            <>
              <circle cx="88" cy="108" r="2.2" fill="#f59e0b" className="mote-float" />
              <circle
                cx="134"
                cy="115"
                r="1.8"
                fill="#6ee7b7"
                className="mote-float"
                style={{ animationDelay: '1.1s' }}
              />
            </>
          )}
        </g>
      )}

      {/* STAGE 2: SPROUT (Days 4–10) */}
      {stage === 'sprout' && (
        <g className={isMini ? '' : 'plant-sway'}>
          {/* Curved tender stem */}
          <path
            d="M 110 160 C 109 138 111 118 110 96"
            stroke="#34d399"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left cotyledon leaf */}
          <path
            d="M 109 102 C 94 94 74 96 66 109 C 78 118 98 114 109 104 Z"
            fill={`url(#${leafLightId})`}
          />
          <path
            d="M 107 103 C 94 103 82 105 72 108"
            stroke="#a7f3d0"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* Right cotyledon leaf */}
          <path
            d="M 111 100 C 126 88 147 89 156 102 C 143 113 123 111 111 102 Z"
            fill={`url(#${leafLightId})`}
          />
          <path
            d="M 113 101 C 126 99 138 99 149 101"
            stroke="#a7f3d0"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* Emerging center bud */}
          <path
            d="M 110 98 C 104 84 107 72 111 66 C 116 74 117 86 110 98 Z"
            fill="#6ee7b7"
          />

          {/* Tiny dewdrop on right leaf */}
          <circle cx="140" cy="96" r="2.6" fill="#ecfdf5" opacity="0.85" />

          {!isMini && (
            <>
              <circle cx="80" cy="82" r="2" fill="#6ee7b7" className="mote-float" />
              <circle
                cx="144"
                cy="74"
                r="1.8"
                fill="#34d399"
                className="mote-float"
                style={{ animationDelay: '1.4s' }}
              />
            </>
          )}
        </g>
      )}

      {/* STAGE 3: SAPLING (Days 11–21) */}
      {stage === 'sapling' && (
        <g className={isMini ? '' : 'plant-sway'}>
          {/* Young woody stem & root grip */}
          <path
            d="M 104 162 Q 108 156 108 128 L 109 78 Q 110 74 111 78 L 112 128 Q 113 156 117 162 Z"
            fill={`url(#${trunkId})`}
          />
          {/* Left & Right young twigs */}
          <path
            d="M 109 124 Q 93 114 82 104"
            stroke="#6b4c3b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 111 112 Q 128 102 140 91"
            stroke="#6b4c3b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Layered sapling leaf clusters */}
          <path
            d="M 84 105 C 66 98 54 104 54 116 C 68 122 80 116 84 105 Z"
            fill={`url(#${leafDeepId})`}
          />
          <path
            d="M 86 103 C 74 88 82 74 96 76 C 102 88 96 98 86 103 Z"
            fill={`url(#${leafLightId})`}
          />
          <path
            d="M 138 92 C 154 83 168 89 167 101 C 153 108 141 102 138 92 Z"
            fill={`url(#${leafDeepId})`}
          />
          <path
            d="M 136 90 C 145 73 135 61 122 66 C 118 78 126 86 136 90 Z"
            fill={`url(#${leafLightId})`}
          />
          {/* Top crown leaves */}
          <path
            d="M 110 78 C 94 64 96 44 110 38 C 124 44 126 64 110 78 Z"
            fill={`url(#${leafLightId})`}
          />
          <path
            d="M 110 74 C 106 60 107 49 110 42"
            stroke="#a7f3d0"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {!isMini && (
            <>
              <circle cx="72" cy="70" r="2" fill="#6ee7b7" className="mote-float" />
              <circle
                cx="154"
                cy="66"
                r="2.2"
                fill="#34d399"
                className="mote-float"
                style={{ animationDelay: '0.9s' }}
              />
            </>
          )}
        </g>
      )}

      {/* STAGE 4: YOUNG TREE (Days 22–45) */}
      {stage === 'young_tree' && (
        <g className={isMini ? '' : 'plant-sway'}>
          {/* Strong trunk with flared roots */}
          <path
            d="M 96 164 C 103 154 104 134 104 104 C 104 94 101 86 92 78 L 96 74 C 104 80 107 85 109 92 C 111 84 115 78 124 72 L 128 77 C 119 84 116 93 116 105 C 116 134 118 154 125 164 Z"
            fill={`url(#${trunkId})`}
          />
          {/* Bark texture accents */}
          <path
            d="M 108 118 L 108 148 M 113 112 L 113 136"
            stroke="#3a261c"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Back deep foliage layer */}
          <circle cx="80" cy="88" r="28" fill={`url(#${leafDeepId})`} />
          <circle cx="140" cy="88" r="28" fill={`url(#${leafDeepId})`} />
          <circle cx="110" cy="60" r="32" fill={`url(#${leafDeepId})`} />

          {/* Mid lush foliage layer */}
          <circle cx="92" cy="76" r="24" fill={`url(#${leafLightId})`} />
          <circle cx="129" cy="76" r="24" fill={`url(#${leafLightId})`} />
          <circle cx="110" cy="54" r="26" fill={`url(#${leafLightId})`} />

          {/* Sunlit upper leaf highlights */}
          <ellipse cx="101" cy="47" rx="12" ry="8" fill="#a7f3d0" opacity="0.28" />
          <ellipse cx="132" cy="68" rx="10" ry="7" fill="#6ee7b7" opacity="0.24" />
          <ellipse cx="83" cy="75" rx="9" ry="6" fill="#6ee7b7" opacity="0.22" />

          {!isMini && (
            <>
              <circle cx="56" cy="66" r="2.1" fill="#6ee7b7" className="mote-float" />
              <circle
                cx="166"
                cy="60"
                r="2"
                fill="#34d399"
                className="mote-float"
                style={{ animationDelay: '1.3s' }}
              />
              <circle
                cx="114"
                cy="22"
                r="1.8"
                fill="#a7f3d0"
                className="mote-float"
                style={{ animationDelay: '0.6s' }}
              />
            </>
          )}
        </g>
      )}

      {/* STAGE 5: FLOURISHING TREE (Days 46–66) */}
      {stage === 'flourishing_tree' && (
        <g className={isMini ? '' : 'plant-sway'}>
          {/* Majestic sculpted trunk & spreading roots */}
          <path
            d="M 88 166 C 98 156 101 136 101 104 C 101 92 94 84 82 76 L 87 70 C 97 77 103 82 107 90 L 108 70 L 113 70 L 114 89 C 118 81 124 75 135 68 L 140 74 C 128 82 120 92 120 105 C 120 136 123 156 134 166 C 122 162 115 162 110 165 C 105 162 98 162 88 166 Z"
            fill={`url(#${trunkId})`}
          />
          <path
            d="M 106 112 L 106 150 M 114 108 L 114 146"
            stroke="#3a261c"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Expansive deep canopy */}
          <circle cx="68" cy="84" r="31" fill={`url(#${leafDeepId})`} />
          <circle cx="152" cy="84" r="31" fill={`url(#${leafDeepId})`} />
          <circle cx="110" cy="54" r="39" fill={`url(#${leafDeepId})`} />

          {/* Vibrant mid-canopy crowns */}
          <circle cx="84" cy="70" r="28" fill={`url(#${leafLightId})`} />
          <circle cx="136" cy="70" r="28" fill={`url(#${leafLightId})`} />
          <circle cx="110" cy="48" r="30" fill={`url(#${leafLightId})`} />
          <circle cx="110" cy="76" r="25" fill={`url(#${leafLightId})`} />

          {/* Sunlit canopy shimmer */}
          <ellipse cx="98" cy="39" rx="15" ry="9" fill="#a7f3d0" opacity="0.3" />
          <ellipse cx="142" cy="64" rx="12" ry="7" fill="#6ee7b7" opacity="0.25" />

          {/* Golden Blossoms & Radiant Fruit */}
          <circle cx="82" cy="66" r="4.8" fill={`url(#${goldId})`} />
          <circle cx="114" cy="42" r="5.2" fill={`url(#${goldId})`} />
          <circle cx="139" cy="68" r="4.6" fill={`url(#${goldId})`} />
          <circle cx="101" cy="76" r="4.2" fill={`url(#${goldId})`} />
          <circle cx="126" cy="86" r="4" fill={`url(#${goldId})`} />
          <circle cx="71" cy="88" r="3.8" fill={`url(#${goldId})`} />
          <circle cx="150" cy="88" r="3.8" fill={`url(#${goldId})`} />

          {/* Glowing pollen & firefly motes */}
          {!isMini && (
            <>
              <circle cx="48" cy="56" r="2.4" fill="#fbbf24" className="mote-float" />
              <circle
                cx="172"
                cy="52"
                r="2.4"
                fill="#fbbf24"
                className="mote-float"
                style={{ animationDelay: '0.8s' }}
              />
              <circle
                cx="110"
                cy="14"
                r="2.2"
                fill="#fef3c7"
                className="mote-float"
                style={{ animationDelay: '1.5s' }}
              />
              <circle
                cx="56"
                cy="118"
                r="1.9"
                fill="#6ee7b7"
                className="mote-float"
                style={{ animationDelay: '2.1s' }}
              />
              <circle
                cx="166"
                cy="116"
                r="1.9"
                fill="#f59e0b"
                className="mote-float"
                style={{ animationDelay: '1.2s' }}
              />
            </>
          )}
        </g>
      )}
    </svg>
  );
};
