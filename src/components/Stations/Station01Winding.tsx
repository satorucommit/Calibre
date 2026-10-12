import type { MovementStore } from '../../engine/useMovementStore';
import { MAX_POWER_RESERVE_HOURS } from '../../engine/gearMath';

interface Station01Props {
  store: MovementStore;
}

export const Station01Winding = ({ store }: Station01Props) => {
  const { energy, setEnergyDirect, windCrown } = store;

  const isLow = energy < 8;
  const isFull = energy >= 47.5;

  return (
    <section
      id="station-01"
      className="station-section"
      aria-labelledby="station-01-title"
    >
      <div className="station-measure">
        {/* The One Memorable Moment Opening Line */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 400,
              color: 'var(--color-blued-steel)',
              fontStyle: 'italic',
              marginBottom: '0.4rem',
            }}
          >
            This is the time where you are. Wind it to keep it going.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-plate-grey)' }}>
            The movement on your screen is running on mechanical tension, synchronized to your local hour, minute, and second.
          </p>
        </div>

        {/* Station Number & True Mechanism Heading */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="display-numeral" style={{ fontSize: '2rem', color: 'var(--color-plate-grey)' }}>
            01
          </span>
          <h2
            id="station-01-title"
            className="display-numeral"
            style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}
          >
            The Spring That Stores the Energy
          </h2>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
          A mechanical watch has no battery, circuit board, or solar cell. Every drop of energy comes from a tightly coiled strip of specialized spring steel called the <strong>mainspring</strong>, sealed inside a toothed brass drum known as the barrel.
        </p>

        <p style={{ marginTop: '0.85rem', fontSize: '1rem', color: 'var(--color-shadow-blue)' }}>
          When you turn the exterior crown, you rotate a series of winding wheels that turn the barrel arbor. As the arbor turns, the steel ribbon is pulled tightly inwards, storing potential mechanical energy under elastic tension. In a quality hand-wound watch, this stores between <strong>40 and 50 hours</strong> of autonomous runtime.
        </p>

        {/* Live Interactive Control Card */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--color-enamel-card)',
            border: '1px solid var(--color-plate-border)',
            borderRadius: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Power Reserve Tension
            </span>
            <span
              className="mono-spec"
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: isLow ? 'var(--color-ruby)' : 'var(--color-blued-steel)',
              }}
            >
              {energy.toFixed(1)} Hours
            </span>
          </div>

          {/* Accessible Native Range Slider */}
          <label htmlFor="crown-energy-slider" className="sr-only">
            Adjust Mainspring Power Reserve (Hours)
          </label>
          <input
            id="crown-energy-slider"
            type="range"
            min="0"
            max={MAX_POWER_RESERVE_HOURS}
            step="0.5"
            value={energy}
            onChange={(e) => setEnergyDirect(parseFloat(e.target.value))}
            className="calibre-slider"
            aria-valuemin={0}
            aria-valuemax={MAX_POWER_RESERVE_HOURS}
            aria-valuenow={energy}
            aria-valuetext={`${energy.toFixed(1)} hours of power reserve`}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.78rem',
              color: 'var(--color-plate-grey)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>0H (Unwound / Halted)</span>
            <span>24H (Mid-Tension)</span>
            <span>48H (Full Reserve)</span>
          </div>

          {/* Direct tactile winding buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="calibre-button"
              onClick={() => windCrown(180)}
              aria-label="Wind Crown Half Turn (+1.75 hours)"
            >
              Turn Crown (+1.8h)
            </button>
            <button
              type="button"
              className="calibre-button calibre-button-primary"
              onClick={() => windCrown(720)}
              aria-label="Wind Crown Full Two Turns (+7 hours)"
            >
              Full Wind (+7.0h)
            </button>
            <button
              type="button"
              className="calibre-button calibre-button-subtle"
              onClick={() => setEnergyDirect(0)}
              aria-label="Discharge Mainspring to 0"
            >
              Let Down Spring (0h)
            </button>
          </div>

          {/* Status feedback */}
          <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            {isLow ? (
              <p style={{ color: 'var(--color-ruby)', fontWeight: 500 }}>
                The spring is almost unwound. Turn the crown or slide the bar to keep the hands in motion.
              </p>
            ) : isFull ? (
              <p style={{ color: 'var(--color-blued-steel)', fontWeight: 500 }}>
                Maximum tension achieved (48 hours). The bridle slips safely against the barrel wall to prevent overwinding damage.
              </p>
            ) : (
              <p style={{ color: 'var(--color-plate-grey)' }}>
                Tension is active. The unwinding torque is transferred directly into the gear train below.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
