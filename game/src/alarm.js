// The Velvet Vault — the alarm meter: the heist's spendable resource.
// Noise fills it; a jammer vents it; at 100 the museum locks down.
// One job only: alarm value, lockdown timing, and what fills it.

import {
  ALARM_MAX,
  ALARM_DECAY,
  ALARM_RUN_NOISE,
  ALARM_PICK_NOISE,
  ALARM_SPOT_BONUS,
  JAMMER_VENT,
  LOCKDOWN_SECONDS,
  LOCKDOWN_AFTERMATH,
  clamp,
} from './config.js';

export class Alarm {
  constructor() {
    this.value = 0;
    this.peak = 0;
    this.lockdown = false;
    this.lockdownTimer = 0;
  }

  /** One frame of alarm bookkeeping. Flags say what the thief is doing. */
  step(flags) {
    if (this.lockdown) {
      this.lockdownTimer -= flags.dt;
      if (this.lockdownTimer <= 0) {
        this.lockdown = false;
        this.value = LOCKDOWN_AFTERMATH;
      }
      return;
    }
    if (flags.running) this.value += ALARM_RUN_NOISE;
    if (flags.picking) this.value += ALARM_PICK_NOISE;
    if (flags.seenByCamera) this.value += flags.cameraRate;
    if (!flags.running && !flags.picking && !flags.seenByCamera) {
      this.value -= ALARM_DECAY;
    }
    this.value = clamp(this.value, 0, ALARM_MAX);
    if (this.value > this.peak) this.peak = this.value;
    if (this.value >= ALARM_MAX) {
      this.lockdown = true;
      this.lockdownTimer = LOCKDOWN_SECONDS;
    }
  }

  /** A guard fully spotted the thief: instant jump plus a lockdown risk. */
  spotted() {
    if (this.lockdown) return;
    this.value = clamp(this.value + ALARM_SPOT_BONUS, 0, ALARM_MAX);
    if (this.value > this.peak) this.peak = this.value;
    if (this.value >= ALARM_MAX) {
      this.lockdown = true;
      this.lockdownTimer = LOCKDOWN_SECONDS;
    }
  }

  /** Spend a jammer charge: vent alarm and buy quiet time. */
  vent() {
    if (this.lockdown) return 0;
    const before = this.value;
    this.value = clamp(this.value - JAMMER_VENT, 0, ALARM_MAX);
    return before - this.value;
  }

  add(amount) {
    if (this.lockdown) return;
    this.value = clamp(this.value + amount, 0, ALARM_MAX);
    if (this.value > this.peak) this.peak = this.value;
    if (this.value >= ALARM_MAX) {
      this.lockdown = true;
      this.lockdownTimer = LOCKDOWN_SECONDS;
    }
  }

  reset() {
    this.value = 0;
    this.peak = 0;
    this.lockdown = false;
    this.lockdownTimer = 0;
  }
}
