import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrainConfig, HandAngles, GearRotations } from './gearMath';
import {
  DEFAULT_TRAIN_CONFIG,
  calculateDrift,
  dateToHandAngles,
  computeGearRotations,
  MAX_POWER_RESERVE_HOURS,
} from './gearMath';
import { soundEngine } from './audio';

export type RenderTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FieldNote {
  id: string;
  station: number;
  timestamp: string;
  note: string;
}

const FIELD_NOTES_KEY = 'calibre_field_notes';

function loadFieldNotes(): FieldNote[] {
  try {
    const raw = localStorage.getItem(FIELD_NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    {
      id: 'init-1',
      station: 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: 'Movement running on bench at real-time clock synchronization.',
    },
  ];
}

export function useMovementStore() {
  // Master mechanical values
  const [crownAngle, setCrownAngle] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(38.5); // Starts with 38.5 hrs reserve
  const [trainConfig, setTrainConfig] = useState<TrainConfig>(DEFAULT_TRAIN_CONFIG);
  const [activeStation, setActiveStation] = useState<number>(1);
  const [slowEscapement, setSlowEscapement] = useState<boolean>(false);
  const [renderTier, setRenderTier] = useState<RenderTier>('HIGH');
  const [fps, setFps] = useState<number>(60);
  const [articleMode, setArticleMode] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(soundEngine.getMuted());
  const [fieldNotes, setFieldNotes] = useState<FieldNote[]>(loadFieldNotes);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('Power reserve: 38.5 hours. Movement running.');
  const [selectedGearId, setSelectedGearId] = useState<string>('nominal');

  // Mechanical elapsed seconds & hands
  const [handAngles, setHandAngles] = useState<HandAngles>(() => dateToHandAngles(new Date()));
  const [gearRotations, setGearRotations] = useState<GearRotations>(() => computeGearRotations(0, DEFAULT_TRAIN_CONFIG));

  // Refs for animation loop
  const energyRef = useRef<number>(energy);
  energyRef.current = energy;

  const crownAngleRef = useRef<number>(crownAngle);
  crownAngleRef.current = crownAngle;

  const trainConfigRef = useRef<TrainConfig>(trainConfig);
  trainConfigRef.current = trainConfig;

  const slowEscapementRef = useRef<boolean>(slowEscapement);
  slowEscapementRef.current = slowEscapement;

  const mechanicalSecondsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const lastCrownAngleRef = useRef<number>(crownAngle);

  // FPS monitoring
  const frameCountRef = useRef<number>(0);
  const lastFpsCheckRef = useRef<number>(performance.now());
  const lowFpsCountRef = useRef<number>(0);

  // Reduced motion preference
  const prefersReducedMotionRef = useRef<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Save field notes
  const addFieldNote = useCallback((station: number, note: string) => {
    setFieldNotes((prev) => {
      if (prev.some((n) => n.note === note)) return prev;
      const updated = [
        ...prev,
        {
          id: `note-${Date.now()}`,
          station,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note,
        },
      ];
      try {
        localStorage.setItem(FIELD_NOTES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Audio mute toggle
  const toggleAudio = useCallback(() => {
    const nextMuted = soundEngine.toggleMuted();
    setAudioMuted(nextMuted);
    setLiveAnnouncement(nextMuted ? 'Sound muted.' : 'Sound unmuted.');
  }, []);

  // Winding action
  const windCrown = useCallback((deltaAngleDeg: number) => {
    setCrownAngle((prev) => {
      const nextAngle = prev + deltaAngleDeg;
      // Audio ratchet
      if (Math.abs(nextAngle - lastCrownAngleRef.current) > 12) {
        soundEngine.playRatchetClick();
        lastCrownAngleRef.current = nextAngle;
      }
      return nextAngle;
    });

    // 360 deg = +3.5 hours of energy
    const energyGain = (Math.max(0, deltaAngleDeg) / 360) * 3.5;
    setEnergy((prev) => {
      const nextEnergy = Math.min(MAX_POWER_RESERVE_HOURS, prev + energyGain);
      if (nextEnergy >= MAX_POWER_RESERVE_HOURS && prev < MAX_POWER_RESERVE_HOURS) {
        soundEngine.playSpringClick();
        addFieldNote(1, 'Wound the mainspring to maximum 48 hours capacity.');
        setLiveAnnouncement('Mainspring fully wound: 48 hours.');
      } else if (Math.floor(nextEnergy) !== Math.floor(prev)) {
        setLiveAnnouncement(`Power reserve: ${nextEnergy.toFixed(1)} hours.`);
      }
      return nextEnergy;
    });
  }, [addFieldNote]);

  // Set absolute energy (for native slider)
  const setEnergyDirect = useCallback((newEnergy: number) => {
    const clamped = Math.min(MAX_POWER_RESERVE_HOURS, Math.max(0, newEnergy));
    setEnergy(clamped);
    soundEngine.playRatchetClick();
    setLiveAnnouncement(`Power reserve set to ${clamped.toFixed(1)} hours.`);
    if (clamped >= 40) {
      addFieldNote(1, `Wound mainspring to ${clamped.toFixed(0)} hours.`);
    }
  }, [addFieldNote]);

  // Swap gear preset
  const setPresetGear = useCallback((presetId: string) => {
    setSelectedGearId(presetId);
    let pinionTeeth = 8;
    let note = '';
    if (presetId === 'nominal') {
      pinionTeeth = 8;
      note = 'Restored nominal 8-leaf Third Pinion. Movement running in exact synchronization.';
    } else if (presetId === 'underratio') {
      pinionTeeth = 12;
      note = 'Swapped to 12-leaf Third Pinion: watch loses 20 minutes every hour (-33.3% drift).';
    } else if (presetId === 'overratio') {
      pinionTeeth = 6;
      note = 'Swapped to 6-leaf Third Pinion: watch gains 20 minutes every hour (+33.3% drift).';
    }

    setTrainConfig((prev) => ({
      ...prev,
      thirdPinionTeeth: pinionTeeth,
    }));
    addFieldNote(2, note);
    setLiveAnnouncement(note);
  }, [addFieldNote]);

  // Toggle slow escapement
  const toggleSlowEscapement = useCallback(() => {
    setSlowEscapement((prev) => {
      const next = !prev;
      setLiveAnnouncement(next ? 'Escapement slowed to 1/20th speed.' : 'Escapement running at 1x real time.');
      if (next) {
        addFieldNote(3, 'Observed pallet fork locking and releasing escape wheel at 1/20th speed.');
      }
      return next;
    });
  }, [addFieldNote]);

  // Real-time animation loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const deltaMs = Math.min(100, now - lastTimeRef.current);
      lastTimeRef.current = now;
      const deltaSec = deltaMs / 1000;

      // FPS Calculation
      frameCountRef.current++;
      if (now - lastFpsCheckRef.current >= 1000) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsCheckRef.current));
        setFps(measuredFps);
        frameCountRef.current = 0;
        lastFpsCheckRef.current = now;

        // Auto downgrade render tier if FPS drops consistently
        if (measuredFps < 42) {
          lowFpsCountRef.current++;
          if (lowFpsCountRef.current >= 3) {
            setRenderTier((current) => {
              if (current === 'HIGH') return 'MEDIUM';
              if (current === 'MEDIUM') return 'LOW';
              return current;
            });
            lowFpsCountRef.current = 0;
          }
        } else {
          lowFpsCountRef.current = 0;
        }
      }

      // If prefers-reduced-motion is true, movement only steps when user directly interacts
      if (prefersReducedMotionRef.current) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // Check energy
      const currentEnergy = energyRef.current;
      if (currentEnergy > 0) {
        // Movement consumes power reserve: 48 hours discharge over 48 hours (scaled slightly for demonstration)
        const energyBurn = (deltaSec / 3600); // realistic slow discharge
        const nextEnergy = Math.max(0, currentEnergy - energyBurn);
        setEnergy(nextEnergy);

        // Drift multiplier from gear train
        const drift = calculateDrift(trainConfigRef.current);
        const speedMult = slowEscapementRef.current ? 0.05 : 1.0;
        const effectiveSec = deltaSec * drift.ratioMultiplier * speedMult;

        mechanicalSecondsRef.current += effectiveSec;

        // Advance hand angles & gear rotations
        // Hands start from actual system clock
        const baseDate = new Date();
        const baseAngles = dateToHandAngles(baseDate);

        // If drift is nominal and 1x speed, hands reflect actual system clock
        if (drift.ratioMultiplier === 1.0 && !slowEscapementRef.current) {
          setHandAngles(baseAngles);
        } else {
          // If broken gear or slow motion, hands drift accordingly
          setHandAngles({
            hourHandDeg: baseAngles.hourHandDeg + (mechanicalSecondsRef.current / 43200) * 360 * (drift.ratioMultiplier - 1),
            minuteHandDeg: baseAngles.minuteHandDeg + (mechanicalSecondsRef.current / 3600) * 360 * (drift.ratioMultiplier - 1),
            secondHandDeg: baseAngles.secondHandDeg + (mechanicalSecondsRef.current / 60) * 360 * (drift.ratioMultiplier - 1),
          });
        }

        // Derive gear rotations strictly from mechanicalSeconds
        setGearRotations(computeGearRotations(mechanicalSecondsRef.current, trainConfigRef.current));
      } else {
        // Unwound state
        setLiveAnnouncement('The spring is unwound. Drag the crown to wind it.');
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return {
    crownAngle,
    energy,
    trainConfig,
    activeStation,
    setActiveStation,
    slowEscapement,
    toggleSlowEscapement,
    renderTier,
    setRenderTier,
    fps,
    articleMode,
    setArticleMode,
    audioMuted,
    toggleAudio,
    fieldNotes,
    addFieldNote,
    liveAnnouncement,
    selectedGearId,
    handAngles,
    gearRotations,
    windCrown,
    setEnergyDirect,
    setPresetGear,
  };
}

export type MovementStore = ReturnType<typeof useMovementStore>;
