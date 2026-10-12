import type { MovementStore } from '../../engine/useMovementStore';
import {
  calculateCenterToFourthRatio,
  calculateDrift,
  GEAR_PRESETS,
} from '../../engine/gearMath';

interface Station02Props {
  store: MovementStore;
}

export const Station02GearTrain = ({ store }: Station02Props) => {
  const { trainConfig, selectedGearId, setPresetGear } = store;

  const currentRatio = calculateCenterToFourthRatio(trainConfig);
  const drift = calculateDrift(trainConfig);

  return (
    <section
      id="station-02"
      className="station-section"
      aria-labelledby="station-02-title"
    >
      <div className="station-measure">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="display-numeral" style={{ fontSize: '2rem', color: 'var(--color-plate-grey)' }}>
            02
          </span>
          <h2
            id="station-02-title"
            className="display-numeral"
            style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}
          >
            The Gear Train: Stepping Up Speed
          </h2>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
          The mainspring barrel uncoils with massive torque, but it turns only once every seven hours. If we connected a seconds hand directly to the barrel, it would take half a day to make a single rotation.
        </p>

        <p style={{ marginTop: '0.85rem', fontSize: '1rem', color: 'var(--color-shadow-blue)' }}>
          To convert this slow, forceful uncoiling into rapid movement, watchmakers use a train of meshing wheels and pinions called the <strong>going train</strong>. By driving a tiny pinion (few teeth) with a large wheel (many teeth), each stage multiplies rotational speed by an exact mathematical ratio.
        </p>

        {/* Live Mathematical Formula */}
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
            CENTER WHEEL TO FOURTH WHEEL (SECONDS) RATIO FORMULA:
          </div>
          <div
            className="mono-spec"
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--color-blued-steel)',
              marginTop: '0.5rem',
            }}
          >
            ({trainConfig.centerWheelTeeth}t ÷ {trainConfig.thirdPinionTeeth}p) × ({trainConfig.thirdWheelTeeth}t ÷ {trainConfig.fourthPinionTeeth}p) = {currentRatio.toFixed(2)} : 1
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-shadow-blue)', marginTop: '0.4rem' }}>
            In a properly engineered movement, this step-up must equal exactly <strong>60.00:1</strong>, meaning the fourth wheel turns sixty times faster than the hour hand center wheel—completing one revolution every 60 seconds.
          </p>
        </div>

        {/* Break the Watch Interactive Experiment */}
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
              Experiment: Break the Watch
            </span>
            <span
              className="mono-spec"
              style={{
                fontSize: '0.85rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '3px',
                backgroundColor: drift.status === 'nominal' ? 'var(--color-blued-steel-muted)' : 'rgba(179, 32, 46, 0.12)',
                color: drift.status === 'nominal' ? 'var(--color-blued-steel)' : 'var(--color-ruby)',
                fontWeight: 600,
              }}
            >
              {drift.status === 'nominal' ? 'EXACT TIME (±0s)' : `${drift.errorPercent > 0 ? '+' : ''}${drift.errorPercent.toFixed(1)}% DRIFT`}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-shadow-blue)', marginBottom: '1.25rem' }}>
            Swap the Third Pinion leaf count below. Notice how the seconds hand on the pinned movement immediately speeds up or crawls, and the time drifts out of sync:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {GEAR_PRESETS.map((preset) => {
              const isSelected = selectedGearId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPresetGear(preset.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    borderRadius: '4px',
                    border: `1px solid ${isSelected ? 'var(--color-blued-steel)' : 'var(--color-plate-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-blued-steel-muted)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  aria-pressed={isSelected}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.92rem', color: isSelected ? 'var(--color-blued-steel)' : 'var(--color-shadow-blue)' }}>
                      {preset.name}
                    </strong>
                    <span className="mono-spec" style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
                      {preset.thirdPinionTeeth} Leaves
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-plate-grey)', marginTop: '0.25rem' }}>
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Drift impact readout */}
          {drift.status !== 'nominal' && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(179, 32, 46, 0.06)',
                border: '1px solid rgba(179, 32, 46, 0.25)',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-ruby)' }}>
                  Catastrophic Horological Drift
                </span>
                <span className="mono-spec" style={{ fontSize: '0.82rem', color: 'var(--color-ruby)' }}>
                  {drift.minutesDriftPerHour > 0 ? `+${drift.minutesDriftPerHour.toFixed(1)}` : drift.minutesDriftPerHour.toFixed(1)} min / hour
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', marginTop: '0.35rem', color: 'var(--color-shadow-blue)' }}>
                This is why gear cutting in horology allows zero margin for approximation. A single tooth alteration turns a precision chronometer into a non-functional toy.
              </p>
              <button
                type="button"
                className="calibre-button"
                onClick={() => setPresetGear('nominal')}
                style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}
              >
                Restore Precision 8-Leaf Pinion
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
