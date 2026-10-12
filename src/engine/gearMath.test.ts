import { describe, it, expect } from 'vitest';
import {
  calculateCenterToFourthRatio,
  calculateFourthToEscapeRatio,
  calculateBeatsPerHour,
  calculateDrift,
  dateToHandAngles,
  computeGearRotations,
  DEFAULT_TRAIN_CONFIG,
  GEAR_PRESETS,
  generateGearSvgPath,
  generateEscapeWheelSvgPath,
  generateMainspringSpiralSvgPath,
  powerReserveHoursFromEnergy,
} from './gearMath';

describe('Horological Gear Train Math', () => {
  it('correctly calculates nominal center-to-fourth wheel ratio as exactly 60:1', () => {
    // Center wheel (64) -> Third pinion (8): 64 / 8 = 8
    // Third wheel (60) -> Fourth pinion (8): 60 / 8 = 7.5
    // 8 * 7.5 = 60.0
    const ratio = calculateCenterToFourthRatio(DEFAULT_TRAIN_CONFIG);
    expect(ratio).toBeCloseTo(60.0, 5);
  });

  it('correctly calculates nominal fourth-to-escape wheel ratio as 16:1', () => {
    // Fourth wheel (80) -> Escape pinion (5): 80 / 5 = 16.0
    const ratio = calculateFourthToEscapeRatio(DEFAULT_TRAIN_CONFIG);
    expect(ratio).toBeCloseTo(16.0, 5);
  });

  it('correctly calculates standard 28,800 beats per hour (4 Hz)', () => {
    // 60 (center to 4th) * 16 (4th to escape) * 30 (15 teeth * 2 beats) = 28,800 bph
    const bph = calculateBeatsPerHour(DEFAULT_TRAIN_CONFIG);
    expect(bph).toBe(28800);
  });

  it('calculates negative drift when swapping to 12-leaf third pinion (watch loses time)', () => {
    const brokenConfig = {
      ...DEFAULT_TRAIN_CONFIG,
      thirdPinionTeeth: 12,
    };
    // Center (64) / 12 = 5.3333; Third (60) / 8 = 7.5; Ratio = 40.0
    const ratio = calculateCenterToFourthRatio(brokenConfig);
    expect(ratio).toBeCloseTo(40.0, 4);

    const drift = calculateDrift(brokenConfig);
    expect(drift.status).toBe('slow');
    expect(drift.errorPercent).toBeCloseTo(-33.333, 2);
    // Drift is -20 minutes per hour
    expect(drift.minutesDriftPerHour).toBeCloseTo(-20.0, 2);
    expect(drift.actualBph).toBe(19200);
  });

  it('calculates positive drift when swapping to 6-leaf third pinion (watch gains time)', () => {
    const fastConfig = {
      ...DEFAULT_TRAIN_CONFIG,
      thirdPinionTeeth: 6,
    };
    // Center (64) / 6 = 10.6667; Third (60) / 8 = 7.5; Ratio = 80.0
    const ratio = calculateCenterToFourthRatio(fastConfig);
    expect(ratio).toBeCloseTo(80.0, 4);

    const drift = calculateDrift(fastConfig);
    expect(drift.status).toBe('fast');
    expect(drift.errorPercent).toBeCloseTo(33.333, 2);
    // Drift is +20 minutes per hour
    expect(drift.minutesDriftPerHour).toBeCloseTo(20.0, 2);
    expect(drift.actualBph).toBe(38400);
  });

  it('verifies all predefined gear presets have consistent drift calculations', () => {
    GEAR_PRESETS.forEach((preset) => {
      const config = { ...DEFAULT_TRAIN_CONFIG, thirdPinionTeeth: preset.thirdPinionTeeth };
      const drift = calculateDrift(config);
      if (preset.id === 'nominal') {
        expect(drift.status).toBe('nominal');
        expect(drift.minutesDriftPerHour).toBe(0);
      } else if (preset.id === 'underratio') {
        expect(drift.status).toBe('slow');
      } else if (preset.id === 'overratio') {
        expect(drift.status).toBe('fast');
      }
    });
  });
});

describe('Date to Hand Angles Accuracy', () => {
  it('correctly maps 12:00:00 to 0 degrees for all hands', () => {
    const noon = new Date(2026, 9, 12, 12, 0, 0, 0);
    const angles = dateToHandAngles(noon);
    expect(angles.hourHandDeg).toBeCloseTo(0, 4);
    expect(angles.minuteHandDeg).toBeCloseTo(0, 4);
    expect(angles.secondHandDeg).toBeCloseTo(0, 4);
  });

  it('correctly maps 06:30:15 with sub-second precision within one second accuracy', () => {
    const time = new Date(2026, 9, 12, 6, 30, 15, 0);
    const angles = dateToHandAngles(time);

    // Seconds: 15 seconds / 60 = 0.25 rev = 90 deg
    expect(angles.secondHandDeg).toBeCloseTo(90, 4);

    // Minutes: 30.25 minutes / 60 = 0.504166 rev = 181.5 deg
    expect(angles.minuteHandDeg).toBeCloseTo(181.5, 4);

    // Hours: 6.504166 hours / 12 = 0.542013 rev = 195.125 deg
    expect(angles.hourHandDeg).toBeCloseTo(195.125, 4);
  });

  it('verifies that 1 second advance produces exactly 6 degrees of seconds hand movement', () => {
    const t0 = new Date(2026, 9, 12, 3, 0, 0, 0);
    const t1 = new Date(2026, 9, 12, 3, 0, 1, 0);
    const a0 = dateToHandAngles(t0);
    const a1 = dateToHandAngles(t1);

    expect(a1.secondHandDeg - a0.secondHandDeg).toBeCloseTo(6.0, 4);
    // Minute hand moves 360 / 3600 = 0.1 deg
    expect(a1.minuteHandDeg - a0.minuteHandDeg).toBeCloseTo(0.1, 4);
  });
});

describe('Continuous Rotation Derivation', () => {
  it('derives every wheel rotation proportionally from master elapsed seconds', () => {
    // After 60 seconds (1 minute):
    const rotations = computeGearRotations(60, DEFAULT_TRAIN_CONFIG);

    // Fourth wheel (seconds wheel) must complete exactly 1 full rotation (or -360 deg)
    expect(Math.abs(rotations.fourthWheelDeg)).toBeCloseTo(360, 4);

    // Center wheel (minute wheel) must have turned 1/60th of 360 deg = 6 deg
    expect(rotations.centerWheelDeg).toBeCloseTo(6.0, 4);

    // Hour wheel turns centerWheelDeg / 12 = 0.5 deg
    expect(rotations.hourWheelDeg).toBeCloseTo(0.5, 4);
  });
});

describe('Power Reserve Math', () => {
  it('clamps energy between 0 and 48 hours', () => {
    expect(powerReserveHoursFromEnergy(-5)).toBe(0);
    expect(powerReserveHoursFromEnergy(24)).toBe(24);
    expect(powerReserveHoursFromEnergy(60)).toBe(48);
  });
});

describe('SVG Geometry Generation', () => {
  it('generates valid non-empty SVG path string for involute gears', () => {
    const gearPath = generateGearSvgPath(64, 80, 2.0, 6);
    expect(gearPath).toContain('M');
    expect(gearPath).toContain('Z');
    expect(gearPath.length).toBeGreaterThan(100);
  });

  it('generates valid non-empty SVG path string for Swiss escape wheel', () => {
    const escapePath = generateEscapeWheelSvgPath(15, 40, 4);
    expect(escapePath).toContain('M');
    expect(escapePath).toContain('Z');
    expect(escapePath.length).toBeGreaterThan(100);
  });

  it('generates valid spiral SVG path for mainspring coil', () => {
    const spiral = generateMainspringSpiralSvgPath(0.5, 60, 12, 7);
    expect(spiral).toContain('M');
    expect(spiral.length).toBeGreaterThan(100);
  });
});
