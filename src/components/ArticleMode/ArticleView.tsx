import type { MovementStore } from '../../engine/useMovementStore';

interface ArticleViewProps {
  store: MovementStore;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ store }) => {
  const { setArticleMode } = store;

  return (
    <main className="article-container" role="main">
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span className="mono-spec" style={{ color: 'var(--color-plate-grey)', fontSize: '0.8rem' }}>
            INDEPENDENT HOROLOGY STUDY GUIDE
          </span>
          <h1
            className="display-numeral"
            style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-shadow-blue)', marginTop: '0.4rem' }}
          >
            How a Mechanical Movement Keeps Time
          </h1>
          <p style={{ color: 'var(--color-plate-grey)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            An engineer’s explanation of energy, gear ratios, escapements, and real-world calibres.
          </p>
        </div>
        <button
          type="button"
          className="calibre-button calibre-button-primary"
          onClick={() => setArticleMode(false)}
        >
          Return to Movement
        </button>
      </div>

      <article style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--color-shadow-blue)' }}>
        {/* Section 1 */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="display-numeral" style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--color-shadow-blue)' }}>
            01. Energy In: The Mainspring and Barrel
          </h2>
          <p>
            Unlike modern electronic watches that rely on lithium coin cells, a mechanical watch is an autonomous spring-powered engine. At its core is the <strong>mainspring</strong>—a coiled ribbon of high-tensile alloy housed inside a toothed drum called the barrel.
          </p>
          <p style={{ marginTop: '0.8rem' }}>
            Turning the winding crown rotates a series of winding wheels that wind the mainspring tightly around its central arbor. A standard hand-wound barrel stores between <strong>40 and 50 hours</strong> of reserve power. As the spring attempts to return to its relaxed state, it uncoils outward, exerting continuous rotational torque on the barrel’s perimeter teeth.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="display-numeral" style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--color-shadow-blue)' }}>
            02. Transforming Speed: The Gear Train
          </h2>
          <p>
            Because the mainspring barrel stores enormous torque, it uncoils very slowly—turning only once every six to eight hours. To drive hands that measure minutes and seconds, this rotation must be stepped up through exact mathematical integers.
          </p>
          <div
            style={{
              margin: '1.5rem 0',
              padding: '1.25rem',
              backgroundColor: 'var(--color-enamel-card)',
              border: '1px solid var(--color-plate-border)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
            }}
          >
            <strong>Standard Train Step-Up:</strong><br />
            Center Wheel (64t) drives Third Pinion (8 leaves) = 8.0× step-up<br />
            Third Wheel (60t) drives Fourth Pinion (8 leaves) = 7.5× step-up<br />
            Total Step-up = 8.0 × 7.5 = <strong>60.0 : 1</strong>
          </div>
          <p>
            This 60:1 ratio guarantees that while the center wheel turns once per hour (driving the minute hand), the fourth wheel turns exactly once every 60 seconds (driving the seconds hand). If even a single tooth count is altered, the watch immediately gains or loses hours per day.
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="display-numeral" style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--color-shadow-blue)' }}>
            03. The Heartbeat: The Swiss Lever Escapement
          </h2>
          <p>
            If left unchecked, the gear train would unleash all 48 hours of energy in a matter of seconds. The <strong>escapement</strong> acts as the watch's brake and regulator, releasing only a tiny fractional increment of energy with each vibration.
          </p>
          <p style={{ marginTop: '0.8rem' }}>
            The mechanism consists of three interconnected components:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.65' }}>
            <li><strong>The Balance Wheel:</strong> A weighted wheel attached to a hairspring that oscillates with harmonic constancy. Modern movements oscillate at 28,800 beats per hour (4.0 Hz), or 8 beats per second.</li>
            <li><strong>The Pallet Fork:</strong> A blued-steel lever containing two synthetic ruby pallet stones that alternate locking and unlocking the escape wheel.</li>
            <li><strong>The Escape Wheel:</strong> A wheel with 15 club-shaped teeth engineered to slide across the ruby pallet facets, imparting a microscopic impulse kick to keep the balance swinging.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="display-numeral" style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--color-shadow-blue)' }}>
            04. Choosing a Movement: Hand-Wound, Automatic, or Quartz
          </h2>
          <p>
            When purchasing your first fine watch, consider the mechanical character that fits your lifestyle:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--color-plate-border)', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hand-Wound (Manual)</h3>
              <p style={{ fontSize: '0.92rem', marginTop: '0.35rem' }}>
                Slimmest profile (typically sub-10mm) and unobstructed view of the decorated movement bridges. Ideal for someone who appreciates the quiet morning ritual of turning the crown.
              </p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--color-plate-border)', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Automatic (Self-Winding)</h3>
              <p style={{ fontSize: '0.92rem', marginTop: '0.35rem' }}>
                Features a weighted rotor that swings on bearings, winding the spring as your wrist moves. Ideal for a daily, single watch that you put on each morning without thinking.
              </p>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--color-plate-border)', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quartz (Electronic)</h3>
              <p style={{ fontSize: '0.92rem', marginTop: '0.35rem' }}>
                Powered by a battery and a 32,768 Hz vibrating quartz tuning fork. Extremely accurate (±15s/month), but lacks the physical mechanical integrity and generational repairability of a kinetic movement.
              </p>
            </div>
          </div>
        </section>
      </article>

      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-plate-border)' }}>
        <button
          type="button"
          className="calibre-button calibre-button-primary"
          onClick={() => setArticleMode(false)}
        >
          Return to Working Mechanical Movement
        </button>
      </div>
    </main>
  );
};
