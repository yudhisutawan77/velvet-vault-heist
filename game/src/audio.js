// The Velvet Vault — procedural sound: no audio files, only WebAudio.
// One job only: tiny synth blips for pickups, alarms, tools and the win.

export class SoundFX {
  constructor() {
    this.context = null;
    this.muted = false;
    this.alarmOscillator = null;
    this.alarmGain = null;
  }

  ensure() {
    if (!this.context) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        this.context = new Ctor();
      } catch {
        this.context = null;
      }
    }
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
    }
    return this.context;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopAlarmTone();
    return this.muted;
  }

  blip(freq, seconds, type, volume) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume || 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  }

  pickup() {
    this.blip(880, 0.12, 'sine', 0.09);
    setTimeout(() => this.blip(1318, 0.16, 'sine', 0.07), 70);
  }

  gem() {
    this.blip(660, 0.1, 'triangle', 0.08);
  }

  lockpickTick() {
    this.blip(220, 0.05, 'square', 0.03);
  }

  doorOpen() {
    this.blip(180, 0.3, 'sawtooth', 0.05);
    setTimeout(() => this.blip(320, 0.25, 'sawtooth', 0.04), 120);
  }

  jammer() {
    this.blip(1200, 0.08, 'square', 0.05);
    setTimeout(() => this.blip(700, 0.12, 'square', 0.05), 90);
  }

  smoke() {
    this.blip(300, 0.35, 'sine', 0.05);
  }

  spotted() {
    this.blip(520, 0.18, 'sawtooth', 0.07);
    setTimeout(() => this.blip(520, 0.18, 'sawtooth', 0.07), 200);
  }

  win() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      setTimeout(() => this.blip(freq, 0.3, 'triangle', 0.09), i * 130);
    });
  }

  caught() {
    [400, 300, 200].forEach((freq, i) => {
      setTimeout(() => this.blip(freq, 0.25, 'sawtooth', 0.08), i * 140);
    });
  }

  /** A low pulsing tone while the alarm is in lockdown. */
  startAlarmTone() {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || this.alarmOscillator) return;
    this.alarmOscillator = ctx.createOscillator();
    this.alarmGain = ctx.createGain();
    this.alarmOscillator.type = 'sine';
    this.alarmOscillator.frequency.setValueAtTime(110, ctx.currentTime);
    this.alarmGain.gain.setValueAtTime(0.045, ctx.currentTime);
    this.alarmOscillator.connect(this.alarmGain).connect(ctx.destination);
    this.alarmOscillator.start();
  }

  stopAlarmTone() {
    if (this.alarmOscillator) {
      try {
        this.alarmOscillator.stop();
      } catch {
        // Already stopped.
      }
      this.alarmOscillator = null;
      this.alarmGain = null;
    }
  }
}
