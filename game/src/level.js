// The Velvet Vault — the museum floor: walls, cases, routes, loot and spawns.
// One job only: static level data plus collision and line-of-sight against it.
// Layout (1280x720, single screen): entrance bottom-left, gallery centre,
// camera hall top-left, vault top-right behind a lockpicked door, getaway
// van at the bottom-left dock. Three routes to the vault: the camera hall,
// the gallery, and a vent crawlspace.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  circleHitsRect,
  pointInRect,
} from './config.js';

export const PLAYER_START = { x: 330, y: 648 };
export const EXIT_ZONE = { x: 32, y: 636, w: 148, h: 68 };
export const VAULT_DOOR = { x: 920, y: 130, w: 16, h: 50 };
export const SAPPHIRE = { x: 1104, y: 128, taken: false };

// Walls are solid rectangles (outer shell + room dividers + pillars).
export const WALLS = [
  { x: 0, y: 0, w: 1280, h: 16 }, // top
  { x: 0, y: 704, w: 1280, h: 16 }, // bottom
  { x: 0, y: 0, w: 16, h: 720 }, // left
  { x: 1264, y: 0, w: 16, h: 720 }, // right
  // Divider between camera hall (top) and gallery (bottom), two door gaps.
  { x: 16, y: 260, w: 560, h: 16 },
  { x: 640, y: 260, w: 280, h: 16 },
  // Vault west wall, with the lockpick door gap at y 130..180.
  { x: 920, y: 16, w: 16, h: 114 },
  { x: 920, y: 180, w: 16, h: 64 },
  // Vault south wall.
  { x: 920, y: 244, w: 344, h: 16 },
  // Pillars in the gallery.
  { x: 396, y: 396, w: 44, h: 44 },
  { x: 696, y: 476, w: 44, h: 44 },
  // Short wall stub splitting the gallery's east side (cover near the vault).
  { x: 848, y: 420, w: 16, h: 120 },
];

// Display cases: solid, block movement and sight, hold the side gems.
export const CASES = [
  { x: 200, y: 320, w: 120, h: 60, gem: { x: 260, y: 350, taken: false } },
  { x: 480, y: 360, w: 120, h: 60, gem: { x: 540, y: 390, taken: false } },
  { x: 700, y: 320, w: 120, h: 60, gem: { x: 760, y: 350, taken: false } },
  { x: 240, y: 560, w: 120, h: 60, gem: { x: 300, y: 590, taken: false } },
];

// Vent grilles: the third route. Crawl from the gallery grille to the vault one.
export const VENTS = [
  { x: 864, y: 596, w: 44, h: 28, to: 1 },
  { x: 984, y: 208, w: 44, h: 28, to: 0 },
];

// Velvet rope runs (decoration only; they do not block movement or sight).
export const ROPES = [
  { x1: 180, y1: 300, x2: 340, y2: 300 },
  { x1: 460, y1: 340, x2: 620, y2: 340 },
  { x1: 680, y1: 300, x2: 840, y2: 300 },
  { x1: 220, y1: 540, x2: 380, y2: 540 },
];

// Guard patrol loops (waypoints, in order).
export const GUARD_DEFS = [
  {
    name: 'Marco',
    color: '#46587e',
    waypoints: [
      { x: 200, y: 430 },
      { x: 520, y: 430 },
      { x: 520, y: 620 },
      { x: 200, y: 620 },
    ],
  },
  {
    name: 'Sofia',
    color: '#4a5a7d',
    waypoints: [
      { x: 200, y: 120 },
      { x: 620, y: 120 },
      { x: 620, y: 200 },
      { x: 200, y: 200 },
    ],
  },
  {
    name: 'Dante',
    color: '#3d4c72',
    waypoints: [
      { x: 700, y: 310 },
      { x: 880, y: 310 },
      { x: 880, y: 180 },
      { x: 700, y: 180 },
    ],
  },
];

// Wall-mounted cameras (x, y, base angle, sweep amplitude, sweep speed).
export const CAMERA_DEFS = [
  { x: 300, y: 24, base: Math.PI / 2, sweep: 0.85, speed: 0.55 },
  { x: 700, y: 268, base: -Math.PI / 2, sweep: 0.8, speed: 0.7 },
  { x: 1256, y: 128, base: Math.PI, sweep: 0.7, speed: 0.6 },
];

/** Every solid rect a body collides with (walls + cases + closed vault door). */
export function solids(doorOpen) {
  const list = WALLS.concat(CASES);
  if (!doorOpen) list.push(VAULT_DOOR);
  return list;
}

/** True when a circle at (cx, cy) overlaps any solid. */
export function hitsSolid(cx, cy, radius, doorOpen) {
  const list = solids(doorOpen);
  for (let i = 0; i < list.length; i += 1) {
    if (circleHitsRect(cx, cy, radius, list[i])) return true;
  }
  return false;
}

/**
 * Move a circle by (dx, dy) with axis-separated collision, so it slides
 * along walls instead of sticking in corners.
 */
export function moveCircle(body, dx, dy, radius, doorOpen) {
  const nx = body.x + dx;
  if (!hitsSolid(nx, body.y, radius, doorOpen)) body.x = nx;
  const ny = body.y + dy;
  if (!hitsSolid(body.x, ny, radius, doorOpen)) body.y = ny;
}

/**
 * Line of sight: sample points along the segment; blocked when a sample
 * lands inside a wall or a case (the closed vault door blocks too).
 */
export function hasLineOfSight(x1, y1, x2, y2, doorOpen) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.ceil(dist / 8));
  const list = solids(doorOpen);
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    for (let j = 0; j < list.length; j += 1) {
      if (pointInRect(px, py, list[j])) return false;
    }
  }
  return true;
}

/** True when the point is inside the canvas play area. */
export function insidePlayArea(x, y) {
  return x > 16 && x < CANVAS_WIDTH - 16 && y > 16 && y < CANVAS_HEIGHT - 16;
}
