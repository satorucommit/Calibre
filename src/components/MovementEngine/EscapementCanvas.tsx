import { useEffect, useRef } from 'react';
import { soundEngine } from '../../engine/audio';
import type { RenderTier } from '../../engine/useMovementStore';

interface EscapementCanvasProps {
  slowMotion: boolean;
  energy: number;
  renderTier: RenderTier;
  width?: number;
  height?: number;
}

export const EscapementCanvas: React.FC<EscapementCanvasProps> = ({
  slowMotion,
  energy,
  renderTier,
  width = 380,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    balanceAngle: 0,
    forkAngle: -0.16, // in radians (~9 degrees)
    escapeWheelAngle: 0,
    lastBeatDirection: 1,
    lastTickTime: 0,
    isLocked: true,
  });

  const slowRef = useRef(slowMotion);
  slowRef.current = slowMotion;

  const energyRef = useRef(energy);
  energyRef.current = energy;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Retina DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, renderTier === 'LOW' ? 1 : 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;

    const render = (time: number) => {

      // Escapement physics
      // Standard: 28,800 bph = 4.0 Hz = 8 beats/sec
      // Slow motion: 1/20 speed = 0.2 Hz = 0.4 beats/sec
      const freq = slowRef.current ? 0.2 : 4.0;
      const omega = 2 * Math.PI * freq;
      const s = stateRef.current;

      const hasPower = energyRef.current > 0;

      if (hasPower) {
        // Balance wheel harmonic oscillation
        const prevBalance = s.balanceAngle;
        s.balanceAngle = 0.85 * Math.sin((time / 1000) * omega); // +/- 48 degrees swing

        // Detect zero-crossing where impulse jewel flips fork
        const crossedZero = (prevBalance < 0 && s.balanceAngle >= 0) || (prevBalance > 0 && s.balanceAngle <= 0);

        if (crossedZero) {
          const newDir = s.balanceAngle >= 0 ? 1 : -1;
          if (newDir !== s.lastBeatDirection) {
            s.lastBeatDirection = newDir;
            // Flip pallet fork
            s.forkAngle = newDir * 0.16;
            // Advance escape wheel by one half-tooth pitch (12 degrees = 0.2094 rad)
            s.escapeWheelAngle += (2 * Math.PI) / 30;

            // Trigger synthesized tick sound exactly on pallet locking drop
            soundEngine.playEscapementTick(newDir > 0);
          }
        }
      }

      // Drawing
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Coordinate reference centers:
      // Escape wheel center at (centerX - 60, centerY + 20)
      // Pallet fork pivot at (centerX, centerY - 10)
      // Balance wheel center at (centerX + 75, centerY - 50)
      const escX = centerX - 65;
      const escY = centerY + 30;
      const forkX = centerX - 10;
      const forkY = centerY - 15;
      const balX = centerX + 75;
      const balY = centerY - 45;

      // 1. Escapement Plate & Banking Pins
      ctx.save();
      // Banking pins (limit pallet fork travel)
      ctx.fillStyle = '#2D4B8E';
      ctx.beginPath();
      ctx.arc(forkX + 22, forkY - 14, 2.5, 0, Math.PI * 2);
      ctx.arc(forkX + 22, forkY + 14, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Escape Wheel (Brass, 15 Club Teeth)
      ctx.save();
      ctx.translate(escX, escY);
      ctx.rotate(s.escapeWheelAngle);

      const escRadius = 46;
      const numTeeth = 15;
      const toothStep = (2 * Math.PI) / numTeeth;

      // Wheel body
      ctx.strokeStyle = '#B58A3C';
      ctx.fillStyle = renderTier === 'LOW' ? '#B58A3C' : '#C49B4D';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      for (let i = 0; i < numTeeth; i++) {
        const a = i * toothStep;
        const rRoot = escRadius - 12;
        const rTip = escRadius + 4;
        const rClub = escRadius + 2;

        const x0 = Math.cos(a) * rRoot;
        const y0 = Math.sin(a) * rRoot;

        const x1 = Math.cos(a + 0.08) * (escRadius - 3);
        const y1 = Math.sin(a + 0.08) * (escRadius - 3);

        const x2 = Math.cos(a + 0.14) * rTip;
        const y2 = Math.sin(a + 0.14) * rTip;

        const x3 = Math.cos(a + 0.22) * rClub;
        const y3 = Math.sin(a + 0.22) * rClub;

        const x4 = Math.cos(a + toothStep * 0.6) * rRoot;
        const y4 = Math.sin(a + toothStep * 0.6) * rRoot;

        if (i === 0) ctx.moveTo(x0, y0);
        else ctx.lineTo(x0, y0);

        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.quadraticCurveTo(x4, y4, Math.cos((i + 1) * toothStep) * rRoot, Math.sin((i + 1) * toothStep) * rRoot);
      }
      ctx.closePath();
      ctx.stroke();
      if (renderTier !== 'LOW') {
        ctx.fillStyle = 'rgba(181, 138, 60, 0.25)';
        ctx.fill();
      }

      // Three escape wheel crossed arms
      for (let i = 0; i < 3; i++) {
        const armAngle = (i * 2 * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(armAngle) * (escRadius - 12), Math.sin(armAngle) * (escRadius - 12));
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = '#B58A3C';
        ctx.stroke();
      }

      // Center arbor & jewel
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#8C9096';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#B3202E'; // Ruby jewel hole
      ctx.fill();

      ctx.restore();

      // 3. Pallet Fork (Blued Steel Lever with 2 Synthetic Ruby Pallet Stones)
      ctx.save();
      ctx.translate(forkX, forkY);
      ctx.rotate(s.forkAngle);

      // Lever body
      ctx.strokeStyle = '#2D4B8E';
      ctx.fillStyle = '#2D4B8E';
      ctx.lineWidth = 2.4;

      // Fork horn extending towards balance roller
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(34, 0);
      // Fork horns notch
      ctx.lineTo(38, -5);
      ctx.moveTo(34, 0);
      ctx.lineTo(38, 5);
      ctx.stroke();

      // Entry pallet arm
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, -18);
      ctx.stroke();

      // Exit pallet arm
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-26, 18);
      ctx.stroke();

      // Entry Pallet Stone (Synthetic Ruby)
      ctx.save();
      ctx.translate(-24, -18);
      ctx.rotate(0.3);
      ctx.fillStyle = '#B3202E';
      ctx.fillRect(-3, -7, 6, 14);
      ctx.strokeStyle = '#E24B5C';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-3, -7, 6, 14);
      ctx.restore();

      // Exit Pallet Stone (Synthetic Ruby)
      ctx.save();
      ctx.translate(-26, 18);
      ctx.rotate(-0.4);
      ctx.fillStyle = '#B3202E';
      ctx.fillRect(-3, -7, 6, 14);
      ctx.strokeStyle = '#E24B5C';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-3, -7, 6, 14);
      ctx.restore();

      // Pallet arbor pivot jewel
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#8C9096';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#B3202E';
      ctx.fill();

      ctx.restore();

      // 4. Balance Wheel & Hairspring (Oscillating Glucydur Wheel)
      ctx.save();
      ctx.translate(balX, balY);
      ctx.rotate(s.balanceAngle);

      const balRadius = 62;

      // Balance wheel rim (Brass-raw gold alloy)
      ctx.strokeStyle = '#B58A3C';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, balRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Poising screws on balance rim
      const numScrews = 16;
      ctx.fillStyle = '#2D4B8E';
      for (let i = 0; i < numScrews; i++) {
        const sa = (i * 2 * Math.PI) / numScrews;
        const sx = Math.cos(sa) * (balRadius + 2.5);
        const sy = Math.sin(sa) * (balRadius + 2.5);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Balance wheel crossing arms
      ctx.strokeStyle = '#B58A3C';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-balRadius, 0);
      ctx.lineTo(balRadius, 0);
      ctx.stroke();

      // Hairspring (Blued steel Archimedean spiral attached to collet)
      ctx.strokeStyle = 'rgba(45, 75, 142, 0.65)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      const numHairspringSteps = 100;
      const hairspringTurns = 5;
      for (let i = 0; i <= numHairspringSteps; i++) {
        const t = i / numHairspringSteps;
        const hsAngle = t * hairspringTurns * 2 * Math.PI;
        const hsRadius = 5 + t * 24;
        const hx = Math.cos(hsAngle) * hsRadius;
        const hy = Math.sin(hsAngle) * hsRadius;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();

      // Roller table & ruby impulse pin
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#8C9096';
      ctx.fill();

      // Ruby impulse jewel at edge of roller
      ctx.beginPath();
      ctx.arc(-8, 0, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#B3202E';
      ctx.fill();

      // Center balance jewel (Incabloc shock setting with golden chaton)
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#B58A3C';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#B3202E';
      ctx.fill();

      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [width, height, renderTier]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '4px',
          background: renderTier === 'LOW' ? '#FAF9F6' : 'rgba(250, 249, 246, 0.75)',
          border: '1px solid var(--color-plate-border)',
          boxShadow: renderTier === 'HIGH' ? 'inset 0 2px 8px rgba(19, 26, 43, 0.05)' : 'none',
        }}
        aria-label="Escapement Canvas: Swiss lever pallet fork locking and unlocking escape wheel at 28,800 beats per hour"
      />
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
        <span className="mono-spec" style={{ color: 'var(--color-plate-grey)', fontSize: '0.75rem' }}>
          {slowMotion ? '1/20x SLOW MOTION (0.2 Hz)' : 'REAL-TIME 28,800 BPH (4.0 Hz)'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#B3202E' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#B3202E', display: 'inline-block' }} />
          Synthetic Ruby Pallets
        </span>
      </div>
    </div>
  );
};
