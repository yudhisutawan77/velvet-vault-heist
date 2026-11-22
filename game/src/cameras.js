// The Velvet Vault — security cameras: sweeping cones and blind spots.
// One job only: everything a wall camera does.

import {
  CAMERA_VIEW_RANGE,
  CAMERA_VIEW_HALF_ANGLE,
  angleDifference,
  distance,
} from './config.js';
import { hasLineOfSight } from './level.js';

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.base = def.base;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.time = Math.random() * 6;
    this.angle = def.base;
    this.freezeTimer = 0;
    this.seesPlayer = false;
  }

  step(dt, player, doorOpen, smoke, lockdown) {
    this.time += dt;
    if (this.freezeTimer > 0) this.freezeTimer -= dt;
    if (lockdown) {
      // During lockdown the cameras stop sweeping and stare at the thief.
      this.angle = Math.atan2(player.y - this.y, player.x - this.x);
    } else if (this.freezeTimer <= 0) {
      this.angle = this.base + Math.sin(this.time * this.speed) * this.sweep;
    }
    this.seesPlayer = this.canSee(player, doorOpen, smoke);
  }

  canSee(player, doorOpen, smoke) {
    if (this.freezeTimer > 0) return false;
    if (smoke && smoke.active && distance(this.x, this.y, player.x, player.y) < smoke.radius + 20) {
      return false;
    }
    const d = distance(this.x, this.y, player.x, player.y);
    if (d > CAMERA_VIEW_RANGE) return false;
    const toPlayer = Math.atan2(player.y - this.y, player.x - this.x);
    if (Math.abs(angleDifference(toPlayer, this.angle)) > CAMERA_VIEW_HALF_ANGLE) return false;
    return hasLineOfSight(this.x, this.y, player.x, player.y, doorOpen);
  }

  freeze(seconds) {
    this.freezeTimer = seconds;
  }

  reset(def) {
    this.x = def.x;
    this.y = def.y;
    this.base = def.base;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.time = 0;
    this.angle = def.base;
    this.freezeTimer = 0;
    this.seesPlayer = false;
  }
}
