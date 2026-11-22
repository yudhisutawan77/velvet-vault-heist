// The Velvet Vault — game loop and state machine: title, play, caught, win.
// One job only: how the pieces (guards, cameras, alarm, tools) play together.

import {
  WALK_SPEED,
  RUN_SPEED,
  PLAYER_RADIUS,
  LOCKPICK_SECONDS,
  VENT_SECONDS,
  INTERACT_RADIUS,
  SAPPHIRE_VALUE,
  GEM_VALUE,
  TIME_BONUS_START,
  TIME_BONUS_PER_SECOND,
  ALARM_GEM_NOISE,
  CAMERA_SPOT_RATE,
  CAMERA_FREEZE_SECONDS,
  JAMMER_COUNT,
  SMOKE_COUNT,
  SMOKE_SECONDS,
  SMOKE_RADIUS,
  clamp,
  distance,
  pointInRect,
} from './config.js';
import { bindInput, readMoveVector, readMouse, wasPressed, isHeld, endFrame } from './input.js';
import {
  PLAYER_START,
  EXIT_ZONE,
  VAULT_DOOR,
  SAPPHIRE,
  CASES,
  VENTS,
  GUARD_DEFS,
  CAMERA_DEFS,
  moveCircle,
} from './level.js';
import { Guard } from './guards.js';
import { Camera } from './cameras.js';
import { Alarm } from './alarm.js';
import { SoundFX } from './audio.js';
import { drawWorld, drawHud, drawTitle, drawCaught, drawWin } from './render.js';

const STEP = 1 / 60;
const BEST_KEY = 'velvet-vault-best';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = new SoundFX();
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
    } catch {
      this.best = 0;
    }
    this.frozen = false;
    this.reset();
    this.state = 'title';
    this.accumulator = 0;
    this.lastTime = 0;
    bindInput(canvas);
  }

  reset() {
    this.player = { x: PLAYER_START.x, y: PLAYER_START.y, hasSapphire: false };
    this.facing = 0;
    this.guards = GUARD_DEFS.map((def) => new Guard(def));
    this.cameras = CAMERA_DEFS.map((def) => new Camera(def));
    this.alarm = new Alarm();
    this.smoke = { active: false, x: 0, y: 0, radius: SMOKE_RADIUS, timer: 0 };
    this.doorOpen = false;
    this.jammers = JAMMER_COUNT;
    this.smokes = SMOKE_COUNT;
    this.loot = 0;
    this.score = 0;
    this.elapsed = 0;
    this.interaction = null;
    this.hint = '';
    this.caughtBy = '';
    this.breakdown = null;
    this.pickTickTimer = 0;
    SAPPHIRE.taken = false;
    for (const c of CASES) c.gem.taken = false;
  }

  timeBonus() {
    return Math.max(0, Math.round(TIME_BONUS_START - this.elapsed * TIME_BONUS_PER_SECOND));
  }

  stealthBonus() {
    return Math.max(0, 100 - Math.round(this.alarm.peak));
  }

  updateScore() {
    this.score = this.loot + this.timeBonus() + this.stealthBonus();
  }

  nearestDoor() {
    const d = distance(this.player.x, this.player.y, VAULT_DOOR.x + 8, VAULT_DOOR.y + 25);
    return d < INTERACT_RADIUS + 30 ? d : Infinity;
  }

  nearestVent() {
    for (let i = 0; i < VENTS.length; i += 1) {
      const v = VENTS[i];
      const d = distance(this.player.x, this.player.y, v.x + v.w / 2, v.y + v.h / 2);
      if (d < INTERACT_RADIUS + 24) return { vent: v, index: i, dist: d };
    }
    return null;
  }

  update(dt) {
    if (this.state === 'title') {
      if (wasPressed('Enter') || wasPressed(' ')) {
        this.state = 'playing';
        this.sound.ensure();
      }
      return;
    }
    if (this.state === 'caught' || this.state === 'win') {
      if (wasPressed('r')) {
        this.reset();
        this.state = 'playing';
      }
      return;
    }
    // Playing.
    this.elapsed += dt;
    if (wasPressed('m')) this.sound.toggleMute();

    // --- Movement ---
    const move = readMoveVector();
    const running = isHeld('Shift') && (move.x !== 0 || move.y !== 0);
    const speed = running ? RUN_SPEED : WALK_SPEED;
    if (move.x !== 0 || move.y !== 0) {
      this.facing = Math.atan2(move.y, move.x);
      moveCircle(this.player, move.x * speed * dt, move.y * speed * dt, PLAYER_RADIUS, this.doorOpen);
    }

    // --- Tools ---
    if (wasPressed('q') && this.jammers > 0 && !this.alarm.lockdown && this.alarm.value > 0) {
      this.jammers -= 1;
      this.alarm.vent();
      for (const camera of this.cameras) camera.freeze(CAMERA_FREEZE_SECONDS);
      this.sound.jammer();
    }
    if (wasPressed('e') && this.smokes > 0 && !this.smoke.active) {
      this.smokes -= 1;
      this.smoke = { active: true, x: this.player.x, y: this.player.y, radius: SMOKE_RADIUS, timer: SMOKE_SECONDS };
      this.sound.smoke();
    }
    if (this.smoke.active) {
      this.smoke.timer -= dt;
      if (this.smoke.timer <= 0) this.smoke.active = false;
    }

    // --- Interactions: lockpick the vault door, crawl a vent ---
    const nearDoor = !this.doorOpen && this.nearestDoor() < Infinity;
    const vent = this.doorOpen ? null : this.nearestVent();
    let picking = false;
    if (nearDoor && isHeld('f')) {
      picking = true;
      const before = this.interaction ? this.interaction.fraction : 0;
      const fraction = Math.min(1, before + dt / LOCKPICK_SECONDS);
      this.interaction = { label: 'PICKING THE VAULT LOCK…', fraction };
      this.pickTickTimer -= dt;
      if (this.pickTickTimer <= 0) {
        this.sound.lockpickTick();
        this.pickTickTimer = 0.3;
      }
      if (fraction >= 1) {
        this.doorOpen = true;
        this.interaction = null;
        this.sound.doorOpen();
      }
    } else if (vent && isHeld('f')) {
      const before = this.interaction ? this.interaction.fraction : 0;
      const fraction = Math.min(1, before + dt / VENT_SECONDS);
      this.interaction = { label: 'CRAWLING THE VENT…', fraction };
      if (fraction >= 1) {
        const target = VENTS[vent.vent.to];
        this.player.x = target.x + target.w / 2;
        this.player.y = target.y + target.h / 2;
        this.interaction = null;
        this.sound.smoke();
      }
    } else {
      this.interaction = null;
    }

    // --- Loot: gems on touch, the Sapphire on touch ---
    for (const c of CASES) {
      if (!c.gem.taken && distance(this.player.x, this.player.y, c.gem.x, c.gem.y) < 30) {
        c.gem.taken = true;
        this.loot += GEM_VALUE;
        this.alarm.add(ALARM_GEM_NOISE);
        this.sound.gem();
      }
    }
    if (!SAPPHIRE.taken && distance(this.player.x, this.player.y, SAPPHIRE.x, SAPPHIRE.y - 20) < 34) {
      SAPPHIRE.taken = true;
      this.player.hasSapphire = true;
      this.loot += SAPPHIRE_VALUE;
      this.sound.pickup();
    }

    // --- Guards and cameras ---
    let seenByCamera = false;
    for (const camera of this.cameras) {
      camera.step(dt, this.player, this.doorOpen, this.smoke, this.alarm.lockdown);
      if (camera.seesPlayer) seenByCamera = true;
    }
    for (const guard of this.guards) {
      guard.step(dt, this.player, this.doorOpen, this.smoke, this.alarm.lockdown);
      if (guard.alerted) {
        guard.alerted = false;
        this.alarm.spotted();
        this.sound.spotted();
      }
    }
    this.alarm.step({
      dt,
      running,
      picking,
      seenByCamera,
      cameraRate: CAMERA_SPOT_RATE,
    });
    if (this.alarm.lockdown) this.sound.startAlarmTone();
    else this.sound.stopAlarmTone();

    // --- Caught? ---
    for (const guard of this.guards) {
      if (guard.caught(this.player)) {
        this.state = 'caught';
        this.caughtBy = `Spotted up close by ${guard.name} — the guard was faster than your feet.`;
        this.sound.caught();
        this.sound.stopAlarmTone();
        return;
      }
    }

    // --- Getaway ---
    if (this.player.hasSapphire && pointInRect(this.player.x, this.player.y, EXIT_ZONE)) {
      this.state = 'win';
      const timeBonus = this.timeBonus();
      const stealthBonus = this.stealthBonus();
      this.breakdown = {
        loot: this.loot,
        timeBonus,
        stealthBonus,
        total: this.loot + timeBonus + stealthBonus,
      };
      this.score = this.breakdown.total;
      if (this.score > this.best) {
        this.best = this.score;
        try {
          window.localStorage.setItem(BEST_KEY, String(this.best));
        } catch {
          // Storage unavailable; best score stays in memory only.
        }
      }
      this.sound.win();
      this.sound.stopAlarmTone();
      return;
    }

    // --- Hint line ---
    if (nearDoor) this.hint = 'Hold F — pick the vault lock (loud!)';
    else if (vent) this.hint = 'Hold F — crawl the vent (slow, silent)';
    else if (!this.player.hasSapphire) this.hint = 'WASD move · SHIFT run · F interact · Q jammer · E smoke';
    else this.hint = 'Sapphire secured — reach the getaway van!';
    this.updateScore();
  }

  render() {
    drawWorld(this.ctx, this);
    drawHud(this.ctx, this);
    if (this.state === 'title') drawTitle(this.ctx, this.best);
    else if (this.state === 'caught') drawCaught(this.ctx, this.caughtBy);
    else if (this.state === 'win' && this.breakdown) drawWin(this.ctx, this.breakdown);
  }

  frame(timestamp) {
    const dt = this.lastTime === 0 ? STEP : clamp((timestamp - this.lastTime) / 1000, 0, 0.1);
    this.lastTime = timestamp;
    if (!this.frozen) {
      this.accumulator += dt;
      let guard = 0;
      while (this.accumulator >= STEP && guard < 5) {
        this.update(STEP);
        this.accumulator -= STEP;
        guard += 1;
      }
    }
    this.render();
    endFrame();
    requestAnimationFrame((t) => this.frame(t));
  }

  start() {
    requestAnimationFrame((t) => this.frame(t));
  }
}
