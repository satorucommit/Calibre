import type { MovementStore } from '../../engine/useMovementStore';
import { gsap } from 'gsap';

interface HeaderBarProps {
  store: MovementStore;
}

export const HeaderBar = ({ store }: HeaderBarProps) => {
  const {
    activeStation,
    setActiveStation,
    renderTier,
    setRenderTier,
    fps,
    audioMuted,
    toggleAudio,
    articleMode,
    setArticleMode,
    windCrown,
  } = store;

  // Station jump handler with smooth movement spin-up
  const handleJumpToStation = (stationNum: number) => {
    setActiveStation(stationNum);
    const targetElement = document.getElementById(`station-0${stationNum}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Spin up movement with GSAP during jump
    const dummy = { angle: 0 };
    gsap.to(dummy, {
      angle: 720,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        windCrown(15);
      },
    });
  };

  return (
    <header className="calibre-header" role="banner">
      {/* Brand & Workshop identity */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
        <h1
          className="display-numeral"
          style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.04em', margin: 0 }}
        >
          CALIBRE
        </h1>
        <span
          className="mono-spec"
          style={{
            fontSize: '0.72rem',
            color: 'var(--color-plate-grey)',
            letterSpacing: '0.06em',
            display: 'none',
          }}
        >
          WORKSHOP MOVEMENT GUIDE
        </span>
      </div>

      {/* Small Dial-Style Station Map */}
      <nav aria-label="Station Navigation" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="station-pill-group">
          {[
            { num: 1, name: '01 WINDING' },
            { num: 2, name: '02 TRAIN' },
            { num: 3, name: '03 ESCAPEMENT' },
            { num: 4, name: '04 CALIBRES' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              className={`station-pill ${activeStation === s.num ? 'active' : ''}`}
              onClick={() => handleJumpToStation(s.num)}
              aria-label={`Jump to station ${s.num}: ${s.name}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Utility Controls (Sound, Article Mode, Render Tier & FPS) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Sound toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          className="calibre-button-subtle"
          style={{
            padding: '0.3rem 0.65rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
          aria-label={audioMuted ? 'Turn on sound' : 'Mute sound'}
        >
          {audioMuted ? 'SOUND: OFF' : 'SOUND: ON'}
        </button>

        {/* Article Mode Toggle */}
        <button
          type="button"
          onClick={() => setArticleMode(!articleMode)}
          className="calibre-button-subtle"
          style={{
            padding: '0.3rem 0.65rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: '2px',
            cursor: 'pointer',
            backgroundColor: articleMode ? 'var(--color-blued-steel-muted)' : undefined,
            color: articleMode ? 'var(--color-blued-steel)' : undefined,
            fontWeight: articleMode ? 600 : 400,
          }}
          aria-label={articleMode ? 'Exit article mode to interactive movement' : 'Read as standard article'}
        >
          {articleMode ? 'EXIT ARTICLE' : 'READ AS ARTICLE'}
        </button>

        {/* Render Tier & FPS Indicator */}
        <button
          type="button"
          onClick={() => setRenderTier(renderTier === 'HIGH' ? 'MEDIUM' : renderTier === 'MEDIUM' ? 'LOW' : 'HIGH')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '2px',
            border: '1px solid var(--color-plate-border)',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-plate-grey)',
            background: 'transparent',
            cursor: 'pointer',
          }}
          title="Click to cycle performance tier (HIGH / MEDIUM / LOW). Live frame rate shown."
        >
          <span style={{ color: 'var(--color-blued-steel)', fontWeight: 600 }}>
            {renderTier}
          </span>
          <span>·</span>
          <span>{fps} FPS</span>
        </button>
      </div>
    </header>
  );
};
