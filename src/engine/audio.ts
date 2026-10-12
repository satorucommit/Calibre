/**
 * Calibre WebAudio Engine
 * Real-time synthesis of watch sounds: crown winding ratchet clicks,
 * mainspring tension creaks, and Swiss lever escapement ticks.
 * No external audio files used.
 */

class HorologicalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private lastRatchetTime: number = 0;
  private lastTickTime: number = 0;

  constructor() {
    const saved = localStorage.getItem('calibre_audio_muted');
    // Default to true (muted until user gesture / toggle)
    this.isMuted = saved !== null ? saved === 'true' : true;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('calibre_audio_muted', String(muted));
    } catch {
      // Storage unavailable fallback
    }
    if (!muted) {
      this.initContext();
    }
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Crown Winding Ratchet Click
   * Synthesizes sharp spring-loaded pawl dropping over a ratchet tooth.
   */
  public playRatchetClick(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Throttle to prevent audio buffer saturation when dragging fast
    if (now - this.lastRatchetTime < 0.025) return;
    this.lastRatchetTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // High metal snap with slight randomized pitch
    const pitch = 2400 + Math.random() * 400;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitch, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Mainspring Tension Strain / Click
   */
  public playSpringClick(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Swiss Lever Escapement Beat
   * Dual transient: Pallet stone unlock impulse (3200Hz) followed ~3ms later
   * by escape tooth drop & banking pin impact (4800Hz + plate resonance).
   * @param isExitPallet Alternates pitch between 'tick' (entry stone) and 'tock' (exit stone)
   */
  public playEscapementTick(isExitPallet: boolean = false): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastTickTime < 0.04) return;
    this.lastTickTime = now;

    // 1. Initial impulse transient
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const f1 = isExitPallet ? 2800 : 3300;

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(f1, now);
    osc1.frequency.exponentialRampToValueAtTime(f1 * 0.5, now + 0.008);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.001);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.01);

    // 2. Drop / lock impact (occurs 3.5ms later)
    const tDrop = now + 0.0035;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const f2 = isExitPallet ? 4400 : 5100;

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(f2, tDrop);
    osc2.frequency.exponentialRampToValueAtTime(1400, tDrop + 0.02);

    gain2.gain.setValueAtTime(0.001, tDrop);
    gain2.gain.linearRampToValueAtTime(0.14, tDrop + 0.001);
    gain2.gain.exponentialRampToValueAtTime(0.0001, tDrop + 0.022);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(tDrop);
    osc2.stop(tDrop + 0.025);
  }
}

export const soundEngine = new HorologicalAudioEngine();
