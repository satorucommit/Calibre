import { useState } from 'react';
import type { MovementStore } from '../../engine/useMovementStore';
import { WatchDialHands } from './WatchDialHands';
import { MainspringBarrel } from './MainspringBarrel';
import { GearTrainSvg } from './GearTrainSvg';
import { EscapementCanvas } from './EscapementCanvas';

interface MovementViewerProps {
  store: MovementStore;
}

export const MovementViewer = ({ store }: MovementViewerProps) => {
  const {
    activeStation,
    energy,
    crownAngle,
    windCrown,
    trainConfig,
    gearRotations,
    handAngles,
    renderTier,
    slowEscapement,
  } = store;

  // Internal tab override allows user to click tabs directly on the pinned movement if desired
  const [activeTabOverride, setActiveTabOverride] = useState<number | null>(null);
  const displayedStation = activeTabOverride ?? activeStation;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        maxHeight: '850px',
        padding: '0.5rem',
      }}
    >
      {/* Top Movement Viewport Navigation / Lens Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.3rem',
          background: 'var(--color-enamel-sunken)',
          borderRadius: '4px',
          border: '1px solid var(--color-plate-border)',
          marginBottom: '0.5rem',
          width: '100%',
          maxWidth: '460px',
          justifyContent: 'space-around',
        }}
        role="tablist"
        aria-label="Movement Mechanism Viewports"
      >
        {[
          { id: 1, label: '01 DIAL & BARREL' },
          { id: 2, label: '02 GEAR TRAIN' },
          { id: 3, label: '03 ESCAPEMENT' },
          { id: 4, label: '04 CALIBRES' },
        ].map((tab) => {
          const isActive = displayedStation === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`mono-spec ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTabOverride(tab.id)}
              style={{
                background: isActive ? 'var(--color-blued-steel)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-shadow-blue)',
                border: 'none',
                padding: '0.35rem 0.6rem',
                fontSize: '0.72rem',
                borderRadius: '3px',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Visual Staging Stage */}
      <div
        className="perlage-surface hairline-border"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '480px',
          borderRadius: '6px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          boxShadow: renderTier === 'HIGH' ? 'inset 0 2px 12px rgba(19, 26, 43, 0.06)' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Calibre Plate Screws at Corners */}
        {renderTier !== 'LOW' && (
          <>
            <div style={{ position: 'absolute', top: 10, left: 10, width: 8, height: 8, borderRadius: '50%', background: '#2D4B8E', border: '1px solid #131A2B' }} />
            <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#2D4B8E', border: '1px solid #131A2B' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, width: 8, height: 8, borderRadius: '50%', background: '#2D4B8E', border: '1px solid #131A2B' }} />
            <div style={{ position: 'absolute', bottom: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#2D4B8E', border: '1px solid #131A2B' }} />
          </>
        )}

        {/* Viewport 1: Dial & Mainspring Barrel */}
        <div
          style={{
            display: displayedStation === 1 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <WatchDialHands
            handAngles={handAngles}
            renderTier={renderTier}
            energy={energy}
          />
          <MainspringBarrel
            energy={energy}
            crownAngle={crownAngle}
            onWindCrown={windCrown}
            renderTier={renderTier}
            isActiveStation={displayedStation === 1}
          />
        </div>

        {/* Viewport 2: The Gear Train */}
        <div
          style={{
            display: displayedStation === 2 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <GearTrainSvg
            trainConfig={trainConfig}
            gearRotations={gearRotations}
            renderTier={renderTier}
            isActiveStation={displayedStation === 2}
          />
        </div>

        {/* Viewport 3: The Escapement (Canvas) */}
        <div
          style={{
            display: displayedStation === 3 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <EscapementCanvas
            slowMotion={slowEscapement}
            energy={energy}
            renderTier={renderTier}
            width={380}
            height={280}
          />
        </div>

        {/* Viewport 4: Calibres & Archetypes Diagram */}
        <div
          style={{
            display: displayedStation === 4 ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            animation: 'fadeIn 0.2s ease',
            padding: '0.5rem',
          }}
        >
          <WatchDialHands
            handAngles={handAngles}
            renderTier={renderTier}
            energy={energy}
          />
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'var(--color-enamel-card)',
              border: '1px solid var(--color-plate-border)',
              borderRadius: '4px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <span className="mono-spec" style={{ fontSize: '0.8rem', color: 'var(--color-blued-steel)' }}>
              LIVE BENCH SIMULATION
            </span>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--color-shadow-blue)' }}>
              Three real movement archetypes drive this same dial differently. Select your archetype in the guide on the right.
            </p>
          </div>
        </div>
      </div>

      {/* Movement Engine Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '480px',
          padding: '0.4rem 0.5rem 0',
          fontSize: '0.75rem',
          color: 'var(--color-plate-grey)',
        }}
      >
        <span className="mono-spec">
          CAL. 28800 · 25 JEWELS
        </span>
        <span className="mono-spec">
          RESERVE: <strong style={{ color: 'var(--color-blued-steel)' }}>{energy.toFixed(1)}H</strong>
        </span>
      </div>
    </div>
  );
};
