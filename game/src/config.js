// The Velvet Vault — tunables and small math helpers.
// One job only: numbers and geometry the rest of the game shares.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const TILE = 40;

// Player movement (pixels per second at 60 fps).
export const WALK_SPEED = 150;
export const RUN_SPEED = 235;
export const CRAWL_SPEED = 55;
export const PLAYER_RADIUS = 13;

// Guards.
export const GUARD_PATROL_SPEED = 62;
export const GUARD_CHASE_SPEED = 175;
export const GUARD_VIEW_RANGE = 235;
export const GUARD_VIEW_HALF_ANGLE = 0.61; // ~35 degrees
export const GUARD_CATCH_RADIUS = 20;
export const SUSPICION_GAIN = 2.4; // per frame while seen
export const SUSPICION_DECAY = 0.7; // per frame while unseen
export const ALERT_CHASE_SECONDS = 4;

// Cameras.
export const CAMERA_VIEW_RANGE = 265;
export const CAMERA_VIEW_HALF_ANGLE = 0.44; // ~25 degrees
export const CAMERA_SPOT_RATE = 0.55; // alarm per frame while seen
export const CAMERA_FREEZE_SECONDS = 2.5;

// Alarm meter (0..100).
export const ALARM_MAX = 100;
export const ALARM_DECAY = 0.12; // per frame while quiet
export const ALARM_RUN_NOISE = 0.06; // per frame while running
export const ALARM_PICK_NOISE = 0.28; // per frame while lockpicking
export const ALARM_GEM_NOISE = 3;
export const ALARM_SPOT_BONUS = 30; // added when a guard fully spots you
export const JAMMER_VENT = 45; // alarm removed by one jammer use
export const JAMMER_COUNT = 2;
export const SMOKE_COUNT = 1;
export const SMOKE_SECONDS = 3.5;
export const SMOKE_RADIUS = 95;
export const LOCKDOWN_SECONDS = 6;
export const LOCKDOWN_AFTERMATH = 55; // alarm value once lockdown ends

// Interactions.
export const LOCKPICK_SECONDS = 2.2;
export const VENT_SECONDS = 2.5;
export const INTERACT_RADIUS = 46;

// Scoring.
export const SAPPHIRE_VALUE = 500;
export const GEM_VALUE = 50;
export const TIME_BONUS_START = 600;
export const TIME_BONUS_PER_SECOND = 2;

// Palette: night museum — deep blue floor, gold trim, velvet red carpet.
export const COLORS = {
  floor: '#232a3d',
  floorAlt: '#28304a',
  carpet: '#4a1f28',
  carpetEdge: '#6e2f3c',
  wall: '#141824',
  wallTop: '#2c3550',
  caseGlass: '#3d5a80',
  caseFrame: '#c9a227',
  gold: '#e3b341',
  sapphire: '#4dd7ff',
  player: '#f2e6c9',
  playerCoat: '#1d2b45',
  guard: '#3a4a6b',
  guardUniform: '#46587e',
  coneCalm: 'rgba(255, 214, 90, 0.15)',
  coneWarm: 'rgba(255, 150, 60, 0.25)',
  coneHot: 'rgba(255, 70, 60, 0.32)',
  cameraCone: 'rgba(255, 90, 90, 0.17)',
  cameraBody: '#8c1f28',
  smoke: 'rgba(200, 200, 210, 0.35)',
  hudBack: 'rgba(10, 12, 20, 0.82)',
  hudText: '#e8e2d0',
  danger: '#ff5a4e',
  safe: '#7ddc8a',
};

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Smallest signed difference between two angles, in radians. */
export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

/** True when a circle overlaps a rectangle. */
export function circleHitsRect(cx, cy, radius, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < radius * radius;
}
