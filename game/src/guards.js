// The Velvet Vault — guards: patrols, vision cones, suspicion, pursuit.
// One job only: everything a guard does.

import {
  GUARD_VIEW_RANGE,
  GUARD_VIEW_HALF_ANGLE,
  GUARD_PATROL_SPEED,
  GUARD_CHASE_SPEED,
  GUARD_CATCH_RADIUS,
  SUSPICION_GAIN,
  SUSPICION_DECAY,
  ALERT_CHASE_SECONDS,
  angleDifference,
  clamp,
  distance,
} from './config.js';
import { hasLineOfSight, moveCircle } from './level.js';

export class Guard {
  constructor(def) {
    this.name = def.name;
    this.color = def.color;
    this.waypoints = def.waypoints;
    this.waypointIndex = 0;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.angle = 0;
    this.suspicion = 0;
    this.state = 'patrol'; // patrol | chase | return
    this.chaseTimer = 0;
    this.alerted = false;
    this.seesPlayer = false;
  }

  /** Where the guard is heading on its patrol loop. */
  patrolTarget() {
    return this.waypoints[this.waypointIndex];
  }

  /** Can this guard see the player right now? (cone + range + line of sight) */
  canSee(player, doorOpen, smoke) {
    if (smoke && smoke.active && distance(this.x, this.y, player.x, player.y) < smoke.radius + 20) {
      return false;
    }
    const d = distance(this.x, this.y, player.x, player.y);
    if (d > GUARD_VIEW_RANGE) return false;
    const toPlayer = Math.atan2(player.y - this.y, player.x - this.x);
    if (Math.abs(angleDifference(toPlayer, this.angle)) > GUARD_VIEW_HALF_ANGLE) return false;
    return hasLineOfSight(this.x, this.y, player.x, player.y, doorOpen);
  }

  step(dt, player, doorOpen, smoke, lockdown) {
    const speed = this.state === 'chase' ? GUARD_CHASE_SPEED : GUARD_PATROL_SPEED;
    this.seesPlayer = this.canSee(player, doorOpen, smoke);
    if (this.seesPlayer) {
      // Suspicion grows faster the closer the thief is.
      const d = distance(this.x, this.y, player.x, player.y);
      const closeness = 1 - d / (GUARD_VIEW_RANGE * 1.4);
      this.suspicion = clamp(this.suspicion + SUSPICION_GAIN * (0.6 + closeness), 0, 100);
    } else {
      this.suspicion = clamp(this.suspicion - SUSPICION_DECAY, 0, 100);
    }

    if (this.state === 'patrol' && this.suspicion >= 100) {
      this.state = 'chase';
      this.chaseTimer = ALERT_CHASE_SECONDS;
      this.alerted = true;
    }
    if (lockdown && this.state === 'patrol') {
      this.state = 'chase';
      this.chaseTimer = 1.2;
    }

    let targetX;
    let targetY;
    if (this.state === 'chase') {
      targetX = player.x;
      targetY = player.y;
      this.chaseTimer -= dt;
      if (this.chaseTimer <= 0) {
        this.state = 'return';
        this.suspicion = 40;
      }
    } else if (this.state === 'return') {
      const target = this.patrolTarget();
      targetX = target.x;
      targetY = target.y;
      if (distance(this.x, this.y, targetX, targetY) < 12) this.state = 'patrol';
    } else {
      const target = this.patrolTarget();
      targetX = target.x;
      targetY = target.y;
      if (distance(this.x, this.y, targetX, targetY) < 10) {
        this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      }
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0.5) {
      const step = Math.min(d, speed * dt);
      const nx = this.x + (dx / d) * step;
      const ny = this.y + (dy / d) * step;
      const body = { x: this.x, y: this.y };
      moveCircle(body, nx - this.x, ny - this.y, 14, doorOpen);
      this.x = body.x;
      this.y = body.y;
      this.angle = Math.atan2(dy, dx);
    }
  }

  /** True when this guard has caught the player (touching, any state). */
  caught(player) {
    return distance(this.x, this.y, player.x, player.y) < GUARD_CATCH_RADIUS;
  }

  reset(def) {
    this.waypointIndex = 0;
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.angle = 0;
    this.suspicion = 0;
    this.state = 'patrol';
    this.chaseTimer = 0;
    this.alerted = false;
    this.seesPlayer = false;
  }
}
