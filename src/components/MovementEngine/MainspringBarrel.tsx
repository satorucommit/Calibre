import { useRef, useState, useCallback } from 'react';
import {
  generateMainspringSpiralSvgPath,
  generateGearSvgPath,
  MAX_POWER_RESERVE_HOURS,
} from '../../engine/gearMath';
import type { RenderTier } from '../../engine/useMovementStore';

interface MainspringBarrelProps {
  energy: number;
  crownAngle: number;
  onWindCrown: (deltaDeg: number) => void;
  renderTier: RenderTier;
  isActiveStation: boolean;
}

export const MainspringBarrel = ({
  energy,
  crownAngle,
  onWindCrown,
  renderTier,
  isActiveStation,
}: MainspringBarrelProps) => {
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Tightness: 0 (empty) to 1 (full 48h)
  const tightness = Math.min(1, Math.max(0, energy / MAX_POWER_RESERVE_HOURS));
  const spiralPath = generateMainspringSpiralSvgPath(tightness, 54, 10, 6.5);
  const barrelGearPath = generateGearSvgPath(84, 62, 1.2, 8);
  const crownGearPath = generateGearSvgPath(24, 22, 1.2, 5);

  // Crown drag handler
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGGElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGGElement>) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return;
    const deltaY = lastMousePosRef.current.y - e.clientY;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const movement = deltaY + deltaX;

    if (Math.abs(movement) > 1.5) {
      // Rotate crown forward
      onWindCrown(movement * 2.5);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [onWindCrown]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGGElement>) => {
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        viewBox="0 0 260 200"
        style={{
          width: '100%',
          maxWidth: '320px',
          height: 'auto',
          overflow: 'visible',
          filter: renderTier === 'HIGH' ? 'drop-shadow(0 2px 8px rgba(19, 26, 43, 0.08))' : 'none',
        }}
        aria-label="Mainspring Barrel and Winding Crown"
      >
        <defs>
          <radialGradient id="brassGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#DFBF75" />
            <stop offset="70%" stopColor="#B58A3C" />
            <stop offset="100%" stopColor="#8C6A28" />
          </radialGradient>
          <linearGradient id="steelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E65B5" />
            <stop offset="100%" stopColor="#2D4B8E" />
          </linearGradient>
        </defs>

        {/* 1. Mainspring Barrel Body (Center at x=105, y=100) */}
        <g transform="translate(105, 100)">
          {/* Great Wheel perimeter teeth */}
          <path
            d={barrelGearPath}
            fill="url(#brassGrad)"
            stroke="#8C6A28"
            strokeWidth="0.8"
          />

          {/* Barrel Drum Interior Chamber */}
          <circle cx="0" cy="0" r="56" fill="#EBE7DD" stroke="#8C9096" strokeWidth="0.6" />

          {/* Coiling Mainspring (Blued steel ribbon) */}
          <path
            d={spiralPath}
            fill="none"
            stroke="#2D4B8E"
            strokeWidth={1.8 + tightness * 0.6}
            strokeLinecap="round"
          />

          {/* Barrel Arbor (center steel post with hook) */}
          <circle cx="0" cy="0" r="10" fill="#8C9096" stroke="#131A2B" strokeWidth="1" />
          <circle cx="0" cy="0" r="4.5" fill="#B3202E" /> {/* Ruby center cap */}

          {/* Label */}
          <text
            x="0"
            y="-40"
            textAnchor="middle"
            fill="var(--color-shadow-blue)"
            fontFamily="var(--font-mono)"
            fontSize="7"
            opacity="0.8"
          >
            MAINSPRING BARREL (84T)
          </text>
        </g>

        {/* 2. Interactive Winding Crown & Pinion (Positioned at x=215, y=100) */}
        <g
          transform="translate(215, 100)"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
          {/* Rotating Crown Wheel */}
          <g transform={`rotate(${crownAngle})`}>
            <path
              d={crownGearPath}
              fill="url(#steelGrad)"
              stroke="#131A2B"
              strokeWidth="0.8"
            />
            {/* Knurled flutes */}
            {[-12, -6, 0, 6, 12].map((deg) => (
              <line
                key={deg}
                x1={-18}
                y1={deg}
                x2={18}
                y2={deg}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="0.75"
              />
            ))}
          </g>

          {/* Crown Stem and Exterior Knurled Cap */}
          <rect
            x="20"
            y="-16"
            width="18"
            height="32"
            rx="2"
            fill={isHovered ? '#3E65B5' : '#2D4B8E'}
            stroke="#131A2B"
            strokeWidth="1"
          />
          {/* Fluting lines on crown exterior */}
          {[-12, -8, -4, 0, 4, 8, 12].map((y) => (
            <line
              key={y}
              x1="22"
              y1={y}
              x2="36"
              y2={y}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="0.8"
            />
          ))}

          {/* Prompt Arrow & Text when active */}
          {isActiveStation && (
            <g transform="translate(29, -24)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#2D4B8E"
                fontFamily="var(--font-mono)"
                fontSize="8"
                fontWeight="600"
              >
                DRAG CROWN
              </text>
              <path
                d="M -6 4 L 0 8 L 6 4"
                fill="none"
                stroke="#2D4B8E"
                strokeWidth="1.2"
              />
            </g>
          )}
        </g>
      </svg>

      {/* Live Power Reserve Dial Readout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.4rem',
          marginTop: '0.25rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)', fontFamily: 'var(--font-mono)' }}>
          POWER RESERVE:
        </span>
        <span
          className="display-numeral"
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: energy > 8 ? 'var(--color-blued-steel)' : 'var(--color-ruby)',
          }}
        >
          {energy.toFixed(1)}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-plate-grey)' }}>
          / 48.0 hrs
        </span>
      </div>
    </div>
  );
};
