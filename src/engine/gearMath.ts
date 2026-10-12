/**
 * Calibre Horological Engine
 * Pure mathematical functions for watch gear train ratios, hand positions,
 * drift computation, and authentic involute gear profile generation.
 */

export interface TrainConfig {
  centerWheelTeeth: number;   // default: 64
  thirdPinionTeeth: number;   // default: 8
  thirdWheelTeeth: number;    // default: 60
  fourthPinionTeeth: number;  // default: 8
  fourthWheelTeeth: number;   // default: 80
  escapePinionTeeth: number;  // default: 5
  escapeWheelTeeth: number;   // default: 15
}

export const DEFAULT_TRAIN_CONFIG: TrainConfig = {
  centerWheelTeeth: 64,
  thirdPinionTeeth: 8,
  thirdWheelTeeth: 60,
  fourthPinionTeeth: 8,
  fourthWheelTeeth: 80,
  escapePinionTeeth: 5,
  escapeWheelTeeth: 15,
};

/**
 * Alternative gear options for Station 2 "Break the Watch" experiment
 */
export interface GearPreset {
  id: string;
  name: string;
  thirdPinionTeeth: number;
  description: string;
}

export const GEAR_PRESETS: GearPreset[] = [
  {
    id: 'nominal',
    name: 'Nominal 8-leaf Pinion (Exact Time)',
    thirdPinionTeeth: 8,
    description: 'Calculated 60:1 step up from center to fourth wheel. 1 second is exactly 1 second.',
  },
  {
    id: 'underratio',
    name: '12-leaf Pinion (Losing Time)',
    thirdPinionTeeth: 12,
    description: 'Ratio drops to 40:1. The seconds hand crawls at 2/3 speed, losing 20 minutes each hour.',
  },
  {
    id: 'overratio',
    name: '6-leaf Pinion (Gaining Time)',
    thirdPinionTeeth: 6,
    description: 'Ratio leaps to 80:1. The seconds hand races at 4/3 speed, gaining 20 minutes each hour.',
  },
];

/**
 * Calculates the exact ratio from Center Wheel (1 rev/hr) to Fourth Wheel (1 rev/min).
 * Nominal is exactly 60.0.
 */
export function calculateCenterToFourthRatio(config: TrainConfig): number {
  const centerToThirdRatio = config.centerWheelTeeth / config.thirdPinionTeeth;
  const thirdToFourthRatio = config.thirdWheelTeeth / config.fourthPinionTeeth;
  return centerToThirdRatio * thirdToFourthRatio;
}

/**
 * Calculates the exact ratio from Fourth Wheel to Escape Wheel.
 * Nominal is 16.0 for a 28,800 bph escapement.
 */
export function calculateFourthToEscapeRatio(config: TrainConfig): number {
  return config.fourthWheelTeeth / config.escapePinionTeeth;
}

/**
 * Calculates theoretical Beats Per Hour (BPH) for the given train config.
 * Nominal is 28,800.
 */
export function calculateBeatsPerHour(config: TrainConfig): number {
  const centerToFourth = calculateCenterToFourthRatio(config);
  const fourthToEscape = calculateFourthToEscapeRatio(config);
  // Center wheel turns 1 time per hour
  // Escape wheel turns (centerToFourth * fourthToEscape) times per hour
  // Each escape tooth engages 2 pallet beats (entry and exit)
  const beatsPerEscapeRev = config.escapeWheelTeeth * 2;
  return centerToFourth * fourthToEscape * beatsPerEscapeRev;
}

/**
 * Calculates time drift percentage and drift in minutes/hour or seconds/day.
 */
export interface DriftStats {
  nominalBph: number;
  actualBph: number;
  ratioMultiplier: number; // e.g. 1.0 = on time, 0.667 = slow, 1.333 = fast
  errorPercent: number;    // e.g. 0%, -33.33%, +33.33%
  minutesDriftPerHour: number;
  secondsDriftPerDay: number;
  status: 'nominal' | 'slow' | 'fast';
}

export function calculateDrift(config: TrainConfig): DriftStats {
  const nominalRatio = 60.0;
  const actualRatio = calculateCenterToFourthRatio(config);
  const ratioMultiplier = actualRatio / nominalRatio;
  const errorPercent = ((actualRatio - nominalRatio) / nominalRatio) * 100;
  const minutesDriftPerHour = (ratioMultiplier - 1) * 60;
  const secondsDriftPerDay = (ratioMultiplier - 1) * 86400;

  let status: 'nominal' | 'slow' | 'fast' = 'nominal';
  if (Math.abs(errorPercent) > 0.01) {
    status = errorPercent > 0 ? 'fast' : 'slow';
  }

  return {
    nominalBph: 28800,
    actualBph: calculateBeatsPerHour(config),
    ratioMultiplier,
    errorPercent,
    minutesDriftPerHour,
    secondsDriftPerDay,
    status,
  };
}

/**
 * Hand angle calculations based on wall clock time (hours, minutes, seconds, milliseconds)
 * or based on accumulated mechanical seconds elapsed.
 */
export interface HandAngles {
  hourHandDeg: number;   // 0 to 360
  minuteHandDeg: number; // 0 to 360
  secondHandDeg: number; // 0 to 360
}

/**
 * Converts a JS Date into exact hand angles (in degrees, 0 = 12 o'clock).
 */
export function dateToHandAngles(date: Date): HandAngles {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const millis = date.getMilliseconds();

  const totalSeconds = seconds + millis / 1000;
  const totalMinutes = minutes + totalSeconds / 60;
  const totalHours = hours + totalMinutes / 60;

  return {
    secondHandDeg: (totalSeconds / 60) * 360,
    minuteHandDeg: (totalMinutes / 60) * 360,
    hourHandDeg: (totalHours / 12) * 360,
  };
}

/**
 * Gear rotation angles derived from a single master unwound angle (or total elapsed mechanical seconds).
 * Driver gear rotation theta -> driven gear rotation = -theta * (driverTeeth / drivenTeeth)
 */
export interface GearRotations {
  barrelDeg: number;
  centerWheelDeg: number;
  thirdPinionDeg: number;
  thirdWheelDeg: number;
  fourthPinionDeg: number;
  fourthWheelDeg: number;
  escapeWheelDeg: number;
  hourWheelDeg: number;
}

export function computeGearRotations(
  elapsedSeconds: number,
  config: TrainConfig
): GearRotations {
  // Center wheel turns 360 deg every 3600 seconds = 0.1 deg/sec
  const centerWheelDeg = (elapsedSeconds / 3600) * 360;

  // Barrel turns ~1/7th speed in reverse direction relative to center pinion
  // Center pinion = 12, Barrel = 84 -> ratio 7:1
  const barrelDeg = -(centerWheelDeg * (12 / 84));

  // Third pinion is driven by Center wheel (64 teeth)
  // Third pinion turns: -centerWheelDeg * (64 / config.thirdPinionTeeth)
  const thirdPinionDeg = -centerWheelDeg * (config.centerWheelTeeth / config.thirdPinionTeeth);
  // Third wheel is solidly affixed to third pinion arbor (same rotation)
  const thirdWheelDeg = thirdPinionDeg;

  // Fourth pinion is driven by Third wheel (60 teeth)
  // Fourth pinion turns: -thirdWheelDeg * (config.thirdWheelTeeth / config.fourthPinionTeeth)
  const fourthPinionDeg = -thirdWheelDeg * (config.thirdWheelTeeth / config.fourthPinionTeeth);
  // Fourth wheel is affixed to fourth pinion arbor (carries seconds hand!)
  const fourthWheelDeg = fourthPinionDeg;

  // Escape pinion is driven by Fourth wheel (80 teeth)
  // Escape wheel turns: -fourthWheelDeg * (config.fourthWheelTeeth / config.escapePinionTeeth)
  const escapeWheelDeg = -fourthWheelDeg * (config.fourthWheelTeeth / config.escapePinionTeeth);

  // Hour wheel is driven by center wheel through motion works 12:1 reduction
  const hourWheelDeg = centerWheelDeg / 12;

  return {
    barrelDeg,
    centerWheelDeg,
    thirdPinionDeg,
    thirdWheelDeg,
    fourthPinionDeg,
    fourthWheelDeg,
    escapeWheelDeg,
    hourWheelDeg,
  };
}

/**
 * Power reserve calculation
 * Max energy = 48.0 hours.
 * Discharging: energy decreases proportionally with real time.
 * Winding: crown drag increases energy up to 48.0 hours.
 */
export const MAX_POWER_RESERVE_HOURS = 48.0;

export function powerReserveHoursFromEnergy(energy: number): number {
  return Math.min(MAX_POWER_RESERVE_HOURS, Math.max(0, energy));
}

/**
 * Generates an authentic SVG path string for a gear with real teeth (involute/cycloidal shape)
 * @param teeth Number of teeth
 * @param pitchRadius Pitch circle radius in px
 * @param module Tooth size module
 * @param boreRadius Center axle hole radius
 */
export function generateGearSvgPath(
  teeth: number,
  pitchRadius: number,
  module: number = 2.0,
  boreRadius: number = 4
): string {
  const addendum = 1.0 * module;
  const dedendum = 1.25 * module;
  const outerRadius = pitchRadius + addendum;
  const rootRadius = Math.max(boreRadius + 2, pitchRadius - dedendum);

  const toothAngle = (2 * Math.PI) / teeth;
  const halfTooth = toothAngle / 2;
  const quarterTooth = halfTooth / 2;

  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const baseAngle = i * toothAngle;

    // 1. Root valley start
    const a1 = baseAngle - quarterTooth * 0.9;
    const r1 = rootRadius;
    const x1 = Math.cos(a1) * r1;
    const y1 = Math.sin(a1) * r1;

    // 2. Involute flank rising to pitch circle
    const a2 = baseAngle - quarterTooth * 0.4;
    const r2 = pitchRadius;
    const x2 = Math.cos(a2) * r2;
    const y2 = Math.sin(a2) * r2;

    // 3. Tooth tip crest start
    const a3 = baseAngle - quarterTooth * 0.2;
    const r3 = outerRadius;
    const x3 = Math.cos(a3) * r3;
    const y3 = Math.sin(a3) * r3;

    // 4. Tooth tip crest end
    const a4 = baseAngle + quarterTooth * 0.2;
    const r4 = outerRadius;
    const x4 = Math.cos(a4) * r4;
    const y4 = Math.sin(a4) * r4;

    // 5. Involute flank descending to pitch circle
    const a5 = baseAngle + quarterTooth * 0.4;
    const r5 = pitchRadius;
    const x5 = Math.cos(a5) * r5;
    const y5 = Math.sin(a5) * r5;

    // 6. Root valley end
    const a6 = baseAngle + quarterTooth * 0.9;
    const r6 = rootRadius;
    const x6 = Math.cos(a6) * r6;
    const y6 = Math.sin(a6) * r6;

    if (i === 0) {
      points.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)}`);
    } else {
      points.push(`L ${x1.toFixed(2)} ${y1.toFixed(2)}`);
    }

    points.push(`Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${x3.toFixed(2)} ${y3.toFixed(2)}`);
    points.push(`A ${r3.toFixed(2)} ${r3.toFixed(2)} 0 0 1 ${x4.toFixed(2)} ${y4.toFixed(2)}`);
    points.push(`Q ${x5.toFixed(2)} ${y5.toFixed(2)} ${x6.toFixed(2)} ${y6.toFixed(2)}`);
  }

  points.push('Z');

  // Add center bore hole (counter-clockwise path)
  if (boreRadius > 0) {
    points.push(`M ${boreRadius.toFixed(2)} 0`);
    points.push(`A ${boreRadius.toFixed(2)} ${boreRadius.toFixed(2)} 0 1 0 ${(-boreRadius).toFixed(2)} 0`);
    points.push(`A ${boreRadius.toFixed(2)} ${boreRadius.toFixed(2)} 0 1 0 ${boreRadius.toFixed(2)} 0 Z`);
  }

  return points.join(' ');
}

/**
 * Generates an SVG path for an Escape Wheel (club-tooth Swiss lever escapement profile)
 */
export function generateEscapeWheelSvgPath(
  teeth: number = 15,
  pitchRadius: number = 40,
  boreRadius: number = 4
): string {
  const toothAngle = (2 * Math.PI) / teeth;
  const outerRadius = pitchRadius + 4;
  const rootRadius = pitchRadius - 10;
  const lockingFaceOffset = 0.12 * toothAngle;

  const points: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const a0 = i * toothAngle;

    // Gullet root
    const rg = rootRadius;
    const x0 = Math.cos(a0) * rg;
    const y0 = Math.sin(a0) * rg;

    // Tooth stalk rising backward
    const a1 = a0 + lockingFaceOffset * 0.5;
    const r1 = pitchRadius - 2;
    const x1 = Math.cos(a1) * r1;
    const y1 = Math.sin(a1) * r1;

    // Club locking beak (outermost tip)
    const a2 = a0 + lockingFaceOffset;
    const r2 = outerRadius;
    const x2 = Math.cos(a2) * r2;
    const y2 = Math.sin(a2) * r2;

    // Club impulse heel
    const a3 = a0 + lockingFaceOffset + 0.14 * toothAngle;
    const r3 = outerRadius - 2;
    const x3 = Math.cos(a3) * r3;
    const y3 = Math.sin(a3) * r3;

    // Tooth trailing flank plunging down to next gullet
    const a4 = a0 + toothAngle * 0.6;
    const r4 = rootRadius + 1;
    const x4 = Math.cos(a4) * r4;
    const y4 = Math.sin(a4) * r4;

    if (i === 0) {
      points.push(`M ${x0.toFixed(2)} ${y0.toFixed(2)}`);
    } else {
      points.push(`L ${x0.toFixed(2)} ${y0.toFixed(2)}`);
    }

    points.push(`L ${x1.toFixed(2)} ${y1.toFixed(2)}`);
    points.push(`L ${x2.toFixed(2)} ${y2.toFixed(2)}`);
    points.push(`L ${x3.toFixed(2)} ${y3.toFixed(2)}`);
    points.push(`Q ${x4.toFixed(2)} ${y4.toFixed(2)} ${x0.toFixed(2)} ${y0.toFixed(2)}`);
  }

  points.push('Z');

  // Bore hole
  if (boreRadius > 0) {
    points.push(`M ${boreRadius.toFixed(2)} 0`);
    points.push(`A ${boreRadius.toFixed(2)} ${boreRadius.toFixed(2)} 0 1 0 ${(-boreRadius).toFixed(2)} 0`);
    points.push(`A ${boreRadius.toFixed(2)} ${boreRadius.toFixed(2)} 0 1 0 ${boreRadius.toFixed(2)} 0 Z`);
  }

  return points.join(' ');
}

/**
 * Generates an SVG path for an Archimedean spiral representing the mainspring coil.
 */
export function generateMainspringSpiralSvgPath(
  tightness: number,
  maxRadius: number = 60,
  minRadius: number = 12,
  coils: number = 7
): string {
  const effectiveMaxRadius = minRadius + (maxRadius - minRadius) * (1 - tightness * 0.45);
  const totalAngle = coils * 2 * Math.PI;
  const numSteps = 160;
  const points: string[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const angle = t * totalAngle;
    const exponent = 1.0 + tightness * 0.6;
    const r = minRadius + (effectiveMaxRadius - minRadius) * Math.pow(t, exponent);

    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    if (i === 0) {
      points.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else {
      points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }

  return points.join(' ');
}
