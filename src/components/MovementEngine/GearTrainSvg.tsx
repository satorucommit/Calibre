import { useState } from 'react';
import type { TrainConfig, GearRotations } from '../../engine/gearMath';
import {
  generateGearSvgPath,
  generateEscapeWheelSvgPath,
} from '../../engine/gearMath';
import type { RenderTier } from '../../engine/useMovementStore';

interface GearTrainSvgProps {
  trainConfig: TrainConfig;
  gearRotations: GearRotations;
  renderTier: RenderTier;
  isActiveStation?: boolean;
  onSelectGear?: (gearName: string) => void;
}

export interface SelectedGearInfo {
  id: string;
  name: string;
  teeth: number;
  pinionLeaves?: number;
  ratioToNext: string;
  role: string;
}

export const GearTrainSvg = ({
  trainConfig,
  gearRotations,
  renderTier,
  onSelectGear,
}: GearTrainSvgProps) => {
  const [activeGearId, setActiveGearId] = useState<string>('third');

  // Compute tooth paths
  const centerWheelPath = generateGearSvgPath(trainConfig.centerWheelTeeth, 54, 1.2, 8);
  const thirdWheelPath = generateGearSvgPath(trainConfig.thirdWheelTeeth, 46, 1.1, 6);
  const thirdPinionPath = generateGearSvgPath(trainConfig.thirdPinionTeeth, 12, 1.2, 4);
  const fourthWheelPath = generateGearSvgPath(trainConfig.fourthWheelTeeth, 48, 1.0, 6);
  const fourthPinionPath = generateGearSvgPath(trainConfig.fourthPinionTeeth, 12, 1.1, 4);
  const escapeWheelPath = generateEscapeWheelSvgPath(trainConfig.escapeWheelTeeth, 32, 4);
  const escapePinionPath = generateGearSvgPath(trainConfig.escapePinionTeeth, 10, 1.1, 3);

  // Geometry coordinate centers in SVG coordinate space (viewBox: 0 0 380 240)
  // Center Wheel at (75, 120)
  // Third Wheel at (165, 80)
  // Fourth Wheel at (245, 145)
  // Escape Wheel at (315, 95)
  const pos = {
    center: { x: 75, y: 120 },
    third: { x: 165, y: 80 },
    fourth: { x: 245, y: 145 },
    escape: { x: 315, y: 95 },
  };

  const getGearDetails = (id: string): SelectedGearInfo => {
    switch (id) {
      case 'center':
        return {
          id: 'center',
          name: 'Center Wheel (Second Wheel)',
          teeth: trainConfig.centerWheelTeeth,
          pinionLeaves: 12,
          ratioToNext: `${(trainConfig.centerWheelTeeth / trainConfig.thirdPinionTeeth).toFixed(2)}:1`,
          role: 'Rotates once every 60 minutes. Carries the minute hand and motion works.',
        };
      case 'third':
        return {
          id: 'third',
          name: 'Third Wheel & Pinion',
          teeth: trainConfig.thirdWheelTeeth,
          pinionLeaves: trainConfig.thirdPinionTeeth,
          ratioToNext: `${(trainConfig.thirdWheelTeeth / trainConfig.fourthPinionTeeth).toFixed(2)}:1`,
          role: `Intermediary step-up wheel. Pinion currently has ${trainConfig.thirdPinionTeeth} leaves.`,
        };
      case 'fourth':
        return {
          id: 'fourth',
          name: 'Fourth Wheel (Seconds Wheel)',
          teeth: trainConfig.fourthWheelTeeth,
          pinionLeaves: trainConfig.fourthPinionTeeth,
          ratioToNext: `${(trainConfig.fourthWheelTeeth / trainConfig.escapePinionTeeth).toFixed(1)}:1`,
          role: 'Rotates once every 60 seconds. Directly carries the blued-steel seconds hand.',
        };
      case 'escape':
        return {
          id: 'escape',
          name: 'Escape Wheel',
          teeth: trainConfig.escapeWheelTeeth,
          pinionLeaves: trainConfig.escapePinionTeeth,
          ratioToNext: 'Escapement Locking (28,800 bph)',
          role: 'Locks and unlocks against ruby pallets, converting torque into discrete beats.',
        };
      default:
        return getGearDetails('third');
    }
  };

  const currentInfo = getGearDetails(activeGearId);

  const handleGearClick = (id: string) => {
    setActiveGearId(id);
    if (onSelectGear) onSelectGear(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg
        viewBox="0 0 380 230"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: 'auto',
          overflow: 'visible',
          filter: renderTier === 'HIGH' ? 'drop-shadow(0 2px 10px rgba(19, 26, 43, 0.08))' : 'none',
        }}
        aria-label="Mechanical Gear Train with meshing wheels"
      >
        <defs>
          <filter id="gearShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#131A2B" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* 1. Center Wheel (64 teeth) */}
        <g
          transform={`translate(${pos.center.x}, ${pos.center.y})`}
          onClick={() => handleGearClick('center')}
          style={{ cursor: 'pointer' }}
        >
          <g transform={`rotate(${gearRotations.centerWheelDeg})`}>
            <path
              d={centerWheelPath}
              fill="#B58A3C"
              stroke="#8C6A28"
              strokeWidth="0.8"
              filter={renderTier === 'HIGH' ? 'url(#gearShadow)' : undefined}
            />
            {/* Center wheel 4 crossed arms */}
            {[0, 90, 180, 270].map((arm) => (
              <line
                key={arm}
                x1="0"
                y1="0"
                x2={Math.cos((arm * Math.PI) / 180) * 44}
                y2={Math.sin((arm * Math.PI) / 180) * 44}
                stroke="#8C6A28"
                strokeWidth="2.5"
              />
            ))}
          </g>
          {/* Axle & jewel */}
          <circle cx="0" cy="0" r="7" fill="#8C9096" stroke="#131A2B" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="3.5" fill="#B3202E" />
          {activeGearId === 'center' && (
            <circle cx="0" cy="0" r="56" fill="none" stroke="#2D4B8E" strokeWidth="1.5" strokeDasharray="3 3" />
          )}
          <text x="0" y="68" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#131A2B">
            CENTER (64T)
          </text>
        </g>

        {/* 2. Third Wheel (60 teeth) & Third Pinion */}
        <g
          transform={`translate(${pos.third.x}, ${pos.third.y})`}
          onClick={() => handleGearClick('third')}
          style={{ cursor: 'pointer' }}
        >
          {/* Main wheel rim */}
          <g transform={`rotate(${gearRotations.thirdWheelDeg})`}>
            <path
              d={thirdWheelPath}
              fill="#C49B4D"
              stroke="#8C6A28"
              strokeWidth="0.8"
              filter={renderTier === 'HIGH' ? 'url(#gearShadow)' : undefined}
            />
            {[0, 72, 144, 216, 288].map((arm) => (
              <line
                key={arm}
                x1="0"
                y1="0"
                x2={Math.cos((arm * Math.PI) / 180) * 38}
                y2={Math.sin((arm * Math.PI) / 180) * 38}
                stroke="#8C6A28"
                strokeWidth="2"
              />
            ))}
            {/* Center pinion leaves */}
            <path d={thirdPinionPath} fill="#2D4B8E" stroke="#131A2B" strokeWidth="0.6" />
          </g>
          <circle cx="0" cy="0" r="5" fill="#8C9096" />
          <circle cx="0" cy="0" r="2.5" fill="#B3202E" />
          {activeGearId === 'third' && (
            <circle cx="0" cy="0" r="48" fill="none" stroke="#2D4B8E" strokeWidth="1.5" strokeDasharray="3 3" />
          )}
          <text x="0" y="-48" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#131A2B">
            THIRD ({trainConfig.thirdWheelTeeth}T / {trainConfig.thirdPinionTeeth}L)
          </text>
        </g>

        {/* 3. Fourth Wheel (80 teeth) — Carries Seconds Hand */}
        <g
          transform={`translate(${pos.fourth.x}, ${pos.fourth.y})`}
          onClick={() => handleGearClick('fourth')}
          style={{ cursor: 'pointer' }}
        >
          <g transform={`rotate(${gearRotations.fourthWheelDeg})`}>
            <path
              d={fourthWheelPath}
              fill="#B58A3C"
              stroke="#8C6A28"
              strokeWidth="0.75"
              filter={renderTier === 'HIGH' ? 'url(#gearShadow)' : undefined}
            />
            {[0, 72, 144, 216, 288].map((arm) => (
              <line
                key={arm}
                x1="0"
                y1="0"
                x2={Math.cos((arm * Math.PI) / 180) * 40}
                y2={Math.sin((arm * Math.PI) / 180) * 40}
                stroke="#8C6A28"
                strokeWidth="1.6"
              />
            ))}
            <path d={fourthPinionPath} fill="#2D4B8E" stroke="#131A2B" strokeWidth="0.6" />
            {/* Blued-steel Seconds Hand mounted directly on Fourth arbor */}
            <line x1="0" y1="12" x2="0" y2="-52" stroke="#2D4B8E" strokeWidth="1.5" />
            <circle cx="0" cy="12" r="3" fill="#2D4B8E" />
          </g>
          <circle cx="0" cy="0" r="4.5" fill="#8C9096" />
          <circle cx="0" cy="0" r="2.2" fill="#B3202E" />
          {activeGearId === 'fourth' && (
            <circle cx="0" cy="0" r="50" fill="none" stroke="#2D4B8E" strokeWidth="1.5" strokeDasharray="3 3" />
          )}
          <text x="0" y="62" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#131A2B">
            FOURTH (SECONDS 80T)
          </text>
        </g>

        {/* 4. Escape Wheel (15 club teeth) */}
        <g
          transform={`translate(${pos.escape.x}, ${pos.escape.y})`}
          onClick={() => handleGearClick('escape')}
          style={{ cursor: 'pointer' }}
        >
          <g transform={`rotate(${gearRotations.escapeWheelDeg})`}>
            <path
              d={escapeWheelPath}
              fill="#B58A3C"
              stroke="#8C6A28"
              strokeWidth="0.8"
              filter={renderTier === 'HIGH' ? 'url(#gearShadow)' : undefined}
            />
            <path d={escapePinionPath} fill="#2D4B8E" stroke="#131A2B" strokeWidth="0.5" />
          </g>
          <circle cx="0" cy="0" r="4" fill="#8C9096" />
          <circle cx="0" cy="0" r="2" fill="#B3202E" />
          {activeGearId === 'escape' && (
            <circle cx="0" cy="0" r="34" fill="none" stroke="#2D4B8E" strokeWidth="1.5" strokeDasharray="3 3" />
          )}
          <text x="0" y="-38" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#131A2B">
            ESCAPE (15T)
          </text>
        </g>
      </svg>

      {/* Live Tooth & Ratio Inspector Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--color-enamel-card)',
          border: '1px solid var(--color-plate-border)',
          borderRadius: '4px',
          padding: '0.75rem 1rem',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <strong style={{ fontSize: '0.9rem', color: 'var(--color-blued-steel)' }}>
            {currentInfo.name}
          </strong>
          <span className="mono-spec" style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
            Tap gear to inspect
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', margin: '0.2rem 0', color: 'var(--color-shadow-blue)' }}>
          {currentInfo.role}
        </p>
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: 'var(--color-plate-grey)' }}>Teeth: </span>
            <strong className="mono-spec">{currentInfo.teeth}</strong>
          </div>
          {currentInfo.pinionLeaves && (
            <div>
              <span style={{ color: 'var(--color-plate-grey)' }}>Pinion Leaves: </span>
              <strong className="mono-spec">{currentInfo.pinionLeaves}</strong>
            </div>
          )}
          <div>
            <span style={{ color: 'var(--color-plate-grey)' }}>Step-up Ratio: </span>
            <strong className="mono-spec" style={{ color: 'var(--color-blued-steel)' }}>
              {currentInfo.ratioToNext}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
