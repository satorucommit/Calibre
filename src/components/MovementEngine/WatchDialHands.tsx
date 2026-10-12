import type { HandAngles } from '../../engine/gearMath';
import type { RenderTier } from '../../engine/useMovementStore';

interface WatchDialHandsProps {
  handAngles: HandAngles;
  renderTier: RenderTier;
  energy: number;
}

export const WatchDialHands = ({
  handAngles,
  renderTier,
  energy,
}: WatchDialHandsProps) => {
  // Dial numerals 1 to 12
  const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        viewBox="0 0 240 240"
        style={{
          width: '100%',
          maxWidth: '280px',
          height: 'auto',
          overflow: 'visible',
          filter: renderTier === 'HIGH' ? 'drop-shadow(0 4px 16px rgba(19, 26, 43, 0.12))' : 'none',
        }}
        aria-label="Enamel Watch Dial displaying actual local time"
      >
        <defs>
          <radialGradient id="dialEnamelGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#F3F1EB" />
            <stop offset="100%" stopColor="#E2DDD2" />
          </radialGradient>
        </defs>

        {/* Dial Enamel Bezel & Plate */}
        <circle
          cx="120"
          cy="120"
          r="108"
          fill="url(#dialEnamelGrad)"
          stroke="#8C9096"
          strokeWidth="1.2"
        />
        <circle
          cx="120"
          cy="120"
          r="104"
          fill="none"
          stroke="#D1D2D6"
          strokeWidth="0.5"
        />

        {/* Railway Minute Track */}
        <circle cx="120" cy="120" r="96" fill="none" stroke="#131A2B" strokeWidth="0.6" opacity="0.6" />
        <circle cx="120" cy="120" r="92" fill="none" stroke="#131A2B" strokeWidth="0.6" opacity="0.6" />

        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 6 * Math.PI) / 180;
          const isFiveMinute = i % 5 === 0;
          const rInner = isFiveMinute ? 89 : 92;
          const rOuter = 96;
          const x1 = 120 + Math.sin(angle) * rInner;
          const y1 = 120 - Math.cos(angle) * rInner;
          const x2 = 120 + Math.sin(angle) * rOuter;
          const y2 = 120 - Math.cos(angle) * rOuter;

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#131A2B"
              strokeWidth={isFiveMinute ? 1.5 : 0.6}
            />
          );
        })}

        {/* Dial Numerals */}
        {numerals.map((num, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const r = 76;
          const x = 120 + Math.sin(angle) * r;
          const y = 120 - Math.cos(angle) * r + 4; // optic vertical center adjust

          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              className="display-numeral"
              fontSize="12"
              fill="#131A2B"
              fontWeight="500"
              style={{ userSelect: 'none' }}
            >
              {num}
            </text>
          );
        })}

        {/* Workshop Inscription */}
        <text
          x="120"
          y="72"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="6.5"
          letterSpacing="0.1em"
          fill="#8C9096"
        >
          CALIBRE
        </text>
        <text
          x="120"
          y="166"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="5.5"
          letterSpacing="0.08em"
          fill="#8C9096"
        >
          28,800 BPH · SWISS LEVER
        </text>

        {/* 1. Hour Hand (Thermal Blued Steel Breguet/Poire Hand) */}
        <g transform={`translate(120, 120) rotate(${handAngles.hourHandDeg})`}>
          {/* Hand counter-weight tail */}
          <line x1="0" y1="0" x2="0" y2="12" stroke="#2D4B8E" strokeWidth="2.5" />
          {/* Hand body */}
          <line x1="0" y1="0" x2="0" y2="-44" stroke="#2D4B8E" strokeWidth="2.5" />
          {/* Breguet ring accent */}
          <circle cx="0" cy="-34" r="5" fill="#F3F1EB" stroke="#2D4B8E" strokeWidth="1.8" />
          {/* Tip */}
          <polygon points="-1,-44 0,-52 1,-44" fill="#2D4B8E" />
        </g>

        {/* 2. Minute Hand (Thermal Blued Steel Leaf Hand) */}
        <g transform={`translate(120, 120) rotate(${handAngles.minuteHandDeg})`}>
          <line x1="0" y1="0" x2="0" y2="16" stroke="#2D4B8E" strokeWidth="2.0" />
          <line x1="0" y1="0" x2="0" y2="-68" stroke="#2D4B8E" strokeWidth="1.8" />
          <circle cx="0" cy="-56" r="4.2" fill="#F3F1EB" stroke="#2D4B8E" strokeWidth="1.6" />
          <polygon points="-0.8,-68 0,-82 0.8,-68" fill="#2D4B8E" />
        </g>

        {/* 3. Seconds Hand (Slender Blued Steel Needle with Counterpoise) */}
        <g transform={`translate(120, 120) rotate(${handAngles.secondHandDeg})`}>
          {/* Counterpoise ring */}
          <circle cx="0" cy="20" r="3" fill="#2D4B8E" />
          <line x1="0" y1="0" x2="0" y2="24" stroke="#2D4B8E" strokeWidth="0.9" />
          {/* Needle sweeping out to railway track */}
          <line x1="0" y1="0" x2="0" y2="-88" stroke="#2D4B8E" strokeWidth="0.8" />
        </g>

        {/* Center Axle Cap (Polished Steel Cap with Jewel) */}
        <circle cx="120" cy="120" r="4.5" fill="#8C9096" stroke="#131A2B" strokeWidth="0.8" />
        <circle cx="120" cy="120" r="2.2" fill="#B3202E" />
      </svg>

      {/* Real-time Indicator Tag */}
      <div style={{ marginTop: '0.4rem', textAlign: 'center' }}>
        <span
          className="mono-spec"
          style={{
            fontSize: '0.78rem',
            color: energy > 0 ? 'var(--color-blued-steel)' : 'var(--color-ruby)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: energy > 0 ? '#2D4B8E' : '#B3202E',
            }}
          />
          {energy > 0 ? 'REAL TIME AT BENCH' : 'STOPPED — MAINSPRING UNWOUND'}
        </span>
      </div>
    </div>
  );
};
