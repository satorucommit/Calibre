import type { MovementStore } from '../../engine/useMovementStore';

interface Station03Props {
  store: MovementStore;
}

export const Station03Escapement = ({ store }: Station03Props) => {
  const { slowEscapement, toggleSlowEscapement, audioMuted, toggleAudio } = store;

  return (
    <section
      id="station-03"
      className="station-section"
      aria-labelledby="station-03-title"
    >
      <div className="station-measure">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="display-numeral" style={{ fontSize: '2rem', color: 'var(--color-plate-grey)' }}>
            03
          </span>
          <h2
            id="station-03-title"
            className="display-numeral"
            style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}
          >
            The Escapement: The Watch’s Heartbeat
          </h2>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Without regulation, the mainspring and gear train would spin out of control, violently unwinding in less than five seconds. The <strong>escapement</strong> is the mechanism that restrains that energy—parcelling it out in microscopic, equal increments.
        </p>

        <p style={{ marginTop: '0.85rem', fontSize: '1rem', color: 'var(--color-shadow-blue)' }}>
          At the center of this mechanism is the <strong>pallet fork</strong>, tipped with two synthetic corundum (ruby) stones, and the oscillating <strong>balance wheel</strong>. As the balance swings back and forth on its hairspring, it unlocks one tooth of the escape wheel at a time, receiving a tiny kick of energy in return.
        </p>

        {/* Real Horological Beat Rates */}
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-enamel-sunken)',
            border: '1px solid var(--color-plate-border)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--color-plate-grey)', fontFamily: 'var(--font-mono)' }}>
            COMMON BEAT FREQUENCIES IN MODERN & HISTORIC CALIBRES:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
            <div>
              <div className="mono-spec" style={{ fontWeight: 600, color: 'var(--color-blued-steel)' }}>
                28,800 BPH (4.0 Hz)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-shadow-blue)', marginTop: '0.2rem' }}>
                8 ticks per second. The modern standard for high accuracy and shock resistance. Produces the familiar smooth second hand sweep.
              </p>
            </div>
            <div>
              <div className="mono-spec" style={{ fontWeight: 600, color: 'var(--color-shadow-blue)' }}>
                21,600 BPH (3.0 Hz)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-shadow-blue)', marginTop: '0.2rem' }}>
                6 ticks per second. Traditional frequency common in vintage movements and durable tool watches; lower wear on lubricants.
              </p>
            </div>
          </div>
        </div>

        {/* Slow Motion & Audio Interactive Control Card */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--color-enamel-card)',
            border: '1px solid var(--color-plate-border)',
            borderRadius: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Sub-Frame Precision Canvas Controls
            </span>
            <span
              className="mono-spec"
              style={{
                fontSize: '0.82rem',
                color: slowEscapement ? 'var(--color-ruby)' : 'var(--color-blued-steel)',
                fontWeight: 600,
              }}
            >
              {slowEscapement ? '1/20x SLOW SPEED (0.2 Hz)' : '1x NORMAL SPEED (4.0 Hz)'}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-shadow-blue)', marginBottom: '1.25rem' }}>
            At 28,800 beats per hour, the pallet fork flips in just a few milliseconds—too fast for the human eye to perceive the interaction. Slow it down to watch the ruby pallet stone catch, lock, and impulse the club-tooth wheel:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              className={`calibre-button ${slowEscapement ? 'calibre-button-primary' : ''}`}
              onClick={toggleSlowEscapement}
              aria-pressed={slowEscapement}
            >
              {slowEscapement ? 'Return to 1x Real-Time (4 Hz)' : 'Slow to 1/20 Speed (0.2 Hz)'}
            </button>

            <button
              type="button"
              className="calibre-button calibre-button-subtle"
              onClick={toggleAudio}
              aria-pressed={!audioMuted}
            >
              {audioMuted ? 'Unmute Mechanical Ticks' : 'Mute Sound'}
            </button>
          </div>

          {/* Three phases explanation */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-plate-border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-shadow-blue)', marginBottom: '0.5rem' }}>
              The Three Escapement Events You Are Hearing:
            </h4>
            <ol style={{ fontSize: '0.82rem', color: 'var(--color-shadow-blue)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
              <li>
                <strong>Unlock:</strong> As the balance wheel swings through center, its ruby impulse pin enters the fork notch and frees the locked tooth.
              </li>
              <li>
                <strong>Impulse:</strong> The escape tooth slides across the angled facet of the pallet jewel, giving the balance a tiny push to sustain oscillation.
              </li>
              <li>
                <strong>Drop & Lock:</strong> The escape wheel jumps forward and its next tooth impacts the opposite ruby pallet with a distinct acoustic "tick".
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
