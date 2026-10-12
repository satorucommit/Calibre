import { useState, useId } from 'react';
import type { MovementStore } from '../../engine/useMovementStore';

interface Station04Props {
  store: MovementStore;
}

export type ArchetypeId = 'handwound' | 'automatic' | 'quartz';

export const Station04Archetypes = ({ store }: Station04Props) => {
  const { addFieldNote } = store;

  // 3 Diagnostic questions state
  const [answers, setAnswers] = useState<{
    habit: 'daily' | 'rotation' | 'grabgo' | null;
    ritual: 'manual' | 'kinetic' | 'precision' | null;
    profile: 'slender' | 'weighted' | 'utility' | null;
  }>({
    habit: null,
    ritual: null,
    profile: null,
  });

  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId>('handwound');

  // Diagnostic questions
  const q1Id = useId();
  const q2Id = useId();
  const q3Id = useId();

  // Evaluate matching archetype
  const computeMatch = (): ArchetypeId => {
    let hw = 0;
    let auto = 0;
    let qz = 0;

    if (answers.habit === 'rotation') hw += 2;
    if (answers.habit === 'daily') auto += 2;
    if (answers.habit === 'grabgo') qz += 3;

    if (answers.ritual === 'manual') hw += 3;
    if (answers.ritual === 'kinetic') auto += 3;
    if (answers.ritual === 'precision') qz += 3;

    if (answers.profile === 'slender') hw += 2;
    if (answers.profile === 'weighted') auto += 2;
    if (answers.profile === 'utility') qz += 2;

    if (qz > hw && qz > auto) return 'quartz';
    if (auto >= hw) return 'automatic';
    return 'handwound';
  };

  const currentMatch = computeMatch();
  const activeArchetype = (answers.habit && answers.ritual && answers.profile) ? currentMatch : selectedArchetype;

  const handleSelectAnswer = (key: 'habit' | 'ritual' | 'profile', val: any) => {
    const updated = { ...answers, [key]: val };
    setAnswers(updated);

    if (updated.habit && updated.ritual && updated.profile) {
      let matched: ArchetypeId = 'handwound';
      if (updated.ritual === 'precision' || updated.habit === 'grabgo') matched = 'quartz';
      else if (updated.ritual === 'kinetic' || updated.habit === 'daily') matched = 'automatic';
      else matched = 'handwound';

      const names = {
        handwound: 'Hand-Wound (Manual)',
        automatic: 'Automatic (Self-Winding)',
        quartz: 'Quartz (Electronic)',
      };
      addFieldNote(4, `Completed diagnosis: matched archetype ${names[matched]}.`);
    }
  };

  return (
    <section
      id="station-04"
      className="station-section"
      aria-labelledby="station-04-title"
    >
      <div className="station-measure">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="display-numeral" style={{ fontSize: '2rem', color: 'var(--color-plate-grey)' }}>
            04
          </span>
          <h2
            id="station-04-title"
            className="display-numeral"
            style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}
          >
            Choose a Movement: Three Ways to Keep Time
          </h2>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Now that you know how mechanical energy travels from the spring, through the gear train, and into the escapement, you are prepared to choose the engine for your first watch. Every watch on earth falls into one of three core engineering archetypes.
        </p>

        {/* Diagnostic Assessment Quiz */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'var(--color-enamel-card)',
            border: '1px solid var(--color-plate-border)',
            borderRadius: '4px',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Three Plain Questions to Match Your Movement
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-plate-grey)', marginTop: '0.2rem' }}>
              Answer honestly based on your routine; your matching archetype will highlight below.
            </p>
          </div>

          {/* Question 1 */}
          <fieldset style={{ border: 'none', marginBottom: '1.25rem' }}>
            <legend id={q1Id} style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              1. How do you plan to wear this watch?
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { val: 'daily', label: 'Every single day as my primary, constant companion.' },
                { val: 'rotation', label: 'Rotated with other watches or worn on selected days.' },
                { val: 'grabgo', label: 'Irregularly, without wanting to set the time when picking it up.' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.86rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '3px',
                    backgroundColor: answers.habit === opt.val ? 'var(--color-blued-steel-muted)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="q1-habit"
                    value={opt.val}
                    checked={answers.habit === opt.val}
                    onChange={() => handleSelectAnswer('habit', opt.val)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Question 2 */}
          <fieldset style={{ border: 'none', marginBottom: '1.25rem' }}>
            <legend id={q2Id} style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              2. What relationship do you want with the mechanism?
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { val: 'manual', label: 'I want the tactile ritual of winding the crown by hand each morning.' },
                { val: 'kinetic', label: 'I want it to self-power quietly from the natural motion of my arm.' },
                { val: 'precision', label: 'I value absolute atomic precision (±15s/mo) and zero fuss.' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.86rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '3px',
                    backgroundColor: answers.ritual === opt.val ? 'var(--color-blued-steel-muted)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="q2-ritual"
                    value={opt.val}
                    checked={answers.ritual === opt.val}
                    onChange={() => handleSelectAnswer('ritual', opt.val)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Question 3 */}
          <fieldset style={{ border: 'none', marginBottom: '1rem' }}>
            <legend id={q3Id} style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              3. Wrist feel and case dimensions:
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { val: 'slender', label: 'Thin and slender (sub-10mm) to slip easily under shirt cuffs.' },
                { val: 'weighted', label: 'Substantial, solid presence with an oscillating weight inside.' },
                { val: 'utility', label: 'Lightweight, shock-proof, and resilient against strong magnetic fields.' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.86rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '3px',
                    backgroundColor: answers.profile === opt.val ? 'var(--color-blued-steel-muted)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="q3-profile"
                    value={opt.val}
                    checked={answers.profile === opt.val}
                    onChange={() => handleSelectAnswer('profile', opt.val)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Archetypes Comparison Cards */}
        <div style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-shadow-blue)', marginBottom: '1rem' }}>
            The Three Archetypes Compared
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Archetype 1: Hand-Wound */}
            <div
              onClick={() => setSelectedArchetype('handwound')}
              style={{
                padding: '1.5rem',
                borderRadius: '4px',
                border: `1.5px solid ${activeArchetype === 'handwound' ? 'var(--color-blued-steel)' : 'var(--color-plate-border)'}`,
                backgroundColor: activeArchetype === 'handwound' ? 'var(--color-blued-steel-muted)' : '#FFFFFF',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {activeArchetype === 'handwound' && (
                <span
                  className="mono-spec"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: 'var(--color-blued-steel)',
                    color: '#FFFFFF',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '2px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  RECOMMENDED FOR YOU
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}>
                  Hand-Wound (Manual Mechanical)
                </h4>
                <span className="mono-spec" style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
                  42–50h Reserve · 8.5–10mm Thickness
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--color-shadow-blue)', lineHeight: '1.55' }}>
                The original watchmaking format. Without an automatic rotor blocking the view, the bridges, gears, and escapement are fully visible through a sapphire display caseback. It requires winding each morning, creating an intimate tactile bond with your timepiece.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
                <span><strong>Pros:</strong> Thinnest case, pure mechanical beauty.</span>
                <span><strong>Trade-off:</strong> Must be wound by hand every ~40 hours.</span>
              </div>
            </div>

            {/* Archetype 2: Automatic */}
            <div
              onClick={() => setSelectedArchetype('automatic')}
              style={{
                padding: '1.5rem',
                borderRadius: '4px',
                border: `1.5px solid ${activeArchetype === 'automatic' ? 'var(--color-blued-steel)' : 'var(--color-plate-border)'}`,
                backgroundColor: activeArchetype === 'automatic' ? 'var(--color-blued-steel-muted)' : '#FFFFFF',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {activeArchetype === 'automatic' && (
                <span
                  className="mono-spec"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: 'var(--color-blued-steel)',
                    color: '#FFFFFF',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '2px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  RECOMMENDED FOR YOU
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}>
                  Automatic (Self-Winding Mechanical)
                </h4>
                <span className="mono-spec" style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
                  38–70h Reserve · 11–13.5mm Thickness
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--color-shadow-blue)', lineHeight: '1.55' }}>
                Equipped with a weighted semi-circular rotor mounted on ball bearings. Gravity and your natural arm movements spin the rotor, winding the mainspring automatically throughout the day. If worn daily, it never stops.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
                <span><strong>Pros:</strong> Continuous autonomous power, zero manual winding.</span>
                <span><strong>Trade-off:</strong> Slightly thicker case due to rotor assembly.</span>
              </div>
            </div>

            {/* Archetype 3: Quartz */}
            <div
              onClick={() => setSelectedArchetype('quartz')}
              style={{
                padding: '1.5rem',
                borderRadius: '4px',
                border: `1.5px solid ${activeArchetype === 'quartz' ? 'var(--color-blued-steel)' : 'var(--color-plate-border)'}`,
                backgroundColor: activeArchetype === 'quartz' ? 'var(--color-blued-steel-muted)' : '#FFFFFF',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {activeArchetype === 'quartz' && (
                <span
                  className="mono-spec"
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: 'var(--color-blued-steel)',
                    color: '#FFFFFF',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '2px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  RECOMMENDED FOR YOU
                </span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-shadow-blue)' }}>
                  Quartz (Battery & Crystal Tuning Fork)
                </h4>
                <span className="mono-spec" style={{ fontSize: '0.8rem', color: 'var(--color-plate-grey)' }}>
                  2–5 Year Battery · ±15s / Month Accuracy
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--color-shadow-blue)', lineHeight: '1.55' }}>
                Uses a 1.5V battery and an integrated circuit to pulse a quartz crystal fork at 32,768 Hz, driving a micro stepper motor once per second. It is technically far more accurate than any mechanical watch ever built.
              </p>
              <p style={{ fontSize: '0.86rem', marginTop: '0.4rem', color: 'var(--color-shadow-blue)', fontStyle: 'italic' }}>
                Why is it still not a “better” watch? A quartz watch is an electronic appliance; when its microchip degrades after decades, it cannot be hand-repaired. A mechanical movement is pure kinetic craft—every brass tooth and steel pinion can be machined, adjusted, and serviced for two hundred years.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
