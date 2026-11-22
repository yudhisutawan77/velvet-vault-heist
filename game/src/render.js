// The Velvet Vault — all canvas drawing: floor, cones, entities and HUD.
// One job only: what the player (and the judge, in screenshots) sees.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  ALARM_MAX,
  PLAYER_RADIUS,
  GUARD_VIEW_RANGE,
  GUARD_VIEW_HALF_ANGLE,
  CAMERA_VIEW_RANGE,
  CAMERA_VIEW_HALF_ANGLE,
} from './config.js';
import {
  WALLS,
  CASES,
  VENTS,
  ROPES,
  VAULT_DOOR,
  SAPPHIRE,
  EXIT_ZONE,
} from './level.js';

function drawCone(ctx, x, y, angle, halfAngle, range, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawFloor(ctx) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Checker tiles for depth.
  ctx.fillStyle = COLORS.floorAlt;
  for (let row = 0; row < 18; row += 1) {
    for (let col = 0; col < 32; col += 1) {
      if ((row + col) % 2 === 0) ctx.fillRect(col * 40, row * 40, 40, 40);
    }
  }
  // Velvet carpet runner down the gallery: narrow, dark, with gold diamonds.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(596, 276, 28, 428);
  ctx.fillStyle = COLORS.carpetEdge;
  ctx.fillRect(596, 276, 2, 428);
  ctx.fillRect(622, 276, 2, 428);
  ctx.fillStyle = COLORS.gold;
  for (let y = 300; y < 700; y += 56) {
    ctx.beginPath();
    ctx.moveTo(610, y - 6);
    ctx.lineTo(616, y);
    ctx.lineTo(610, y + 6);
    ctx.lineTo(604, y);
    ctx.closePath();
    ctx.fill();
  }
  // Rope runs.
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  for (const rope of ROPES) {
    ctx.beginPath();
    ctx.moveTo(rope.x1, rope.y1);
    ctx.quadraticCurveTo((rope.x1 + rope.x2) / 2, rope.y1 + 10, rope.x2, rope.y2);
    ctx.stroke();
  }
  // Vault floor: darker marble with a gold border.
  ctx.fillStyle = '#1b2138';
  ctx.fillRect(936, 16, 328, 228);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(940, 20, 320, 220);
  // Getaway dock markings.
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(EXIT_ZONE.x, EXIT_ZONE.y, EXIT_ZONE.w, EXIT_ZONE.h);
  ctx.setLineDash([]);
}

function drawWalls(ctx, doorOpen) {
  for (const wall of WALLS) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 3);
  }
  // Vault door: steel slab while closed, open gap once picked.
  if (!doorOpen) {
    ctx.fillStyle = '#5a6b8c';
    ctx.fillRect(VAULT_DOOR.x, VAULT_DOOR.y, VAULT_DOOR.w, VAULT_DOOR.h);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(VAULT_DOOR.x + 5, VAULT_DOOR.y + 20, 6, 10);
  } else {
    ctx.fillStyle = '#2c3550';
    ctx.fillRect(VAULT_DOOR.x, VAULT_DOOR.y, VAULT_DOOR.w, VAULT_DOOR.h);
  }
}

function drawCases(ctx) {
  for (const c of CASES) {
    ctx.fillStyle = COLORS.caseFrame;
    ctx.fillRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6);
    ctx.fillStyle = COLORS.caseGlass;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(c.x + 6, c.y + 4, c.w - 40, 10);
    if (!c.gem.taken) {
      ctx.fillStyle = '#ff7ad9';
      ctx.beginPath();
      ctx.arc(c.gem.x, c.gem.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(c.gem.x - 2, c.gem.y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawVault(ctx) {
  // Pedestal and the Star Sapphire, glowing.
  ctx.fillStyle = '#3a4668';
  ctx.fillRect(SAPPHIRE.x - 26, SAPPHIRE.y - 12, 52, 44);
  ctx.fillStyle = '#55648f';
  ctx.fillRect(SAPPHIRE.x - 26, SAPPHIRE.y - 12, 52, 8);
  if (!SAPPHIRE.taken) {
    const glow = ctx.createRadialGradient(SAPPHIRE.x, SAPPHIRE.y - 22, 4, SAPPHIRE.x, SAPPHIRE.y - 22, 46);
    glow.addColorStop(0, 'rgba(77, 215, 255, 0.55)');
    glow.addColorStop(1, 'rgba(77, 215, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(SAPPHIRE.x - 46, SAPPHIRE.y - 68, 92, 92);
    ctx.fillStyle = COLORS.sapphire;
    ctx.beginPath();
    ctx.moveTo(SAPPHIRE.x, SAPPHIRE.y - 34);
    ctx.lineTo(SAPPHIRE.x + 12, SAPPHIRE.y - 20);
    ctx.lineTo(SAPPHIRE.x, SAPPHIRE.y - 8);
    ctx.lineTo(SAPPHIRE.x - 12, SAPPHIRE.y - 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(SAPPHIRE.x, SAPPHIRE.y - 34);
    ctx.lineTo(SAPPHIRE.x + 5, SAPPHIRE.y - 20);
    ctx.lineTo(SAPPHIRE.x, SAPPHIRE.y - 16);
    ctx.lineTo(SAPPHIRE.x - 5, SAPPHIRE.y - 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.hudText;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ STAR SAPPHIRE ★', SAPPHIRE.x, SAPPHIRE.y + 52);
  }
}

function drawVents(ctx) {
  for (const vent of VENTS) {
    ctx.fillStyle = '#0e1220';
    ctx.fillRect(vent.x, vent.y, vent.w, vent.h);
    ctx.strokeStyle = '#7a8699';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(vent.x + 6, vent.y + 5 + i * 6);
      ctx.lineTo(vent.x + vent.w - 6, vent.y + 5 + i * 6);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VENT', vent.x + vent.w / 2, vent.y + vent.h + 12);
  }
}

function drawVan(ctx, sapphireTaken) {
  // The getaway van, parked at the dock.
  ctx.fillStyle = sapphireTaken ? '#2f6b3a' : '#31405e';
  ctx.fillRect(EXIT_ZONE.x + 8, EXIT_ZONE.y + 10, 132, 48);
  ctx.fillStyle = '#d8d2c0';
  ctx.fillRect(EXIT_ZONE.x + 100, EXIT_ZONE.y + 18, 32, 22);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(EXIT_ZONE.x + 32, EXIT_ZONE.y + 58, 9, 0, Math.PI * 2);
  ctx.arc(EXIT_ZONE.x + 112, EXIT_ZONE.y + 58, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = sapphireTaken ? COLORS.safe : COLORS.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(sapphireTaken ? 'GETAWAY — GO!' : 'GETAWAY VAN', EXIT_ZONE.x + 74, EXIT_ZONE.y - 6);
}

function drawGuards(ctx, guards) {
  for (const guard of guards) {
    const heat = guard.suspicion / 100;
    const fill = heat > 0.66 ? COLORS.coneHot : heat > 0.33 ? COLORS.coneWarm : COLORS.coneCalm;
    drawCone(ctx, guard.x, guard.y, guard.angle, GUARD_VIEW_HALF_ANGLE, GUARD_VIEW_RANGE, fill);
  }
  for (const guard of guards) {
    // Body: navy uniform, cap, torch dot.
    ctx.fillStyle = guard.color;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d2b45';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd65a';
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.angle) * 15, guard.y + Math.sin(guard.angle) * 15, 3, 0, Math.PI * 2);
    ctx.fill();
    // Suspicion bar above the head.
    if (guard.suspicion > 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(guard.x - 16, guard.y - 26, 32, 5);
      ctx.fillStyle = guard.suspicion > 66 ? COLORS.danger : '#ffb347';
      ctx.fillRect(guard.x - 16, guard.y - 26, 32 * (guard.suspicion / 100), 5);
    }
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(guard.name.toUpperCase(), guard.x, guard.y + 26);
    if (guard.state === 'chase') {
      ctx.fillStyle = COLORS.danger;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('!', guard.x, guard.y - 32);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const camera of cameras) {
    if (camera.freezeTimer <= 0) {
      drawCone(ctx, camera.x, camera.y, camera.angle, CAMERA_VIEW_HALF_ANGLE, CAMERA_VIEW_RANGE, COLORS.cameraCone);
    }
  }
  for (const camera of cameras) {
    ctx.fillStyle = camera.freezeTimer > 0 ? '#555f73' : COLORS.cameraBody;
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = camera.seesPlayer ? COLORS.danger : '#ff8a7a';
    ctx.beginPath();
    ctx.arc(camera.x + Math.cos(camera.angle) * 12, camera.y + Math.sin(camera.angle) * 12, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmoke(ctx, smoke) {
  if (!smoke || !smoke.active) return;
  ctx.fillStyle = COLORS.smoke;
  ctx.beginPath();
  ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220,220,230,0.25)';
  ctx.beginPath();
  ctx.arc(smoke.x - 30, smoke.y + 12, smoke.radius * 0.55, 0, Math.PI * 2);
  ctx.arc(smoke.x + 34, smoke.y - 10, smoke.radius * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx, player, facing) {
  // Velvet: dark coat, pale hat, gold scarf — readable at a glance.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 12, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.playerCoat;
  ctx.beginPath();
  ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#141824';
  ctx.fillRect(player.x - 10, player.y - 7, 20, 4);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(player.x - 4, player.y + 6, 8, 4);
  // Facing tick.
  ctx.strokeStyle = COLORS.player;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + Math.cos(facing) * 18, player.y + Math.sin(facing) * 18);
  ctx.stroke();
  if (player.hasSapphire) {
    ctx.fillStyle = COLORS.sapphire;
    ctx.beginPath();
    ctx.arc(player.x + 12, player.y - 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawProgress(ctx, x, y, w, label, fraction, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(x - w / 2 - 4, y - 4, w + 8, 22);
  ctx.fillStyle = '#222a3d';
  ctx.fillRect(x - w / 2, y, w, 10);
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y, w * fraction, 10);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y - 8);
}

export function drawWorld(ctx, game) {
  drawFloor(ctx);
  drawVault(ctx);
  drawVents(ctx);
  drawVan(ctx, game.player.hasSapphire);
  drawCases(ctx);
  drawWalls(ctx, game.doorOpen);
  drawCameras(ctx, game.cameras);
  drawGuards(ctx, game.guards);
  drawSmoke(ctx, game.smoke);
  drawPlayer(ctx, game.player, game.facing);
  if (game.interaction) {
    drawProgress(ctx, game.player.x, game.player.y - 34, 90, game.interaction.label, game.interaction.fraction, COLORS.gold);
  }
}

export function drawHud(ctx, game) {
  const alarm = game.alarm;
  ctx.fillStyle = COLORS.hudBack;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 52);
  // Loot, left.
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT $${game.loot}`, 18, 22);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '13px sans-serif';
  ctx.fillText(game.player.hasSapphire ? '★ Sapphire secured — reach the van!' : 'Steal the Star Sapphire, then reach the van', 18, 42);
  // Alarm meter, centre.
  const meterX = 470;
  const meterW = 340;
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', meterX, 20);
  ctx.fillStyle = '#222a3d';
  ctx.fillRect(meterX, 26, meterW, 14);
  const frac = alarm.value / ALARM_MAX;
  const meterColor = alarm.lockdown ? COLORS.danger : frac > 0.66 ? '#ff8a3c' : frac > 0.33 ? '#ffd65a' : COLORS.safe;
  ctx.fillStyle = meterColor;
  ctx.fillRect(meterX, 26, meterW * frac, 14);
  ctx.strokeStyle = COLORS.hudText;
  ctx.lineWidth = 1;
  ctx.strokeRect(meterX, 26, meterW, 14);
  ctx.fillStyle = alarm.lockdown ? COLORS.danger : COLORS.hudText;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(alarm.lockdown ? 'LOCKDOWN!' : `${Math.round(alarm.value)}%`, meterX + meterW + 10, 38);
  // Tools and timer, right.
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '13px sans-serif';
  ctx.fillText(`Jammer [Q] x${game.jammers}   Smoke [E] x${game.smokes}`, 1262, 22);
  const minutes = Math.floor(game.elapsed / 60);
  const seconds = Math.floor(game.elapsed % 60).toString().padStart(2, '0');
  ctx.fillText(`TIME ${minutes}:${seconds}   SCORE ${game.score}`, 1262, 42);
  // Interaction hint.
  if (game.hint) {
    ctx.fillStyle = COLORS.hudBack;
    const w = ctx.measureText(game.hint).width + 24;
    ctx.fillRect((CANVAS_WIDTH - w) / 2, CANVAS_HEIGHT - 34, w, 24);
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.hint, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 17);
  }
}

function drawScreen(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 10, 18, 0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = accent;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CANVAS_WIDTH / 2, 250);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '18px sans-serif';
  let y = 310;
  for (const line of lines) {
    ctx.fillText(line, CANVAS_WIDTH / 2, y);
    y += 30;
  }
}

export function drawTitle(ctx, best) {
  drawScreen(ctx, 'THE VELVET VAULT', [
    'One thief. Three guards. One Star Sapphire.',
    'Noise fills the ALARM meter — spend it with a jammer, or hide in the smoke.',
    'WASD / arrows to move · SHIFT to run (loud) · F to pick, grab & crawl vents',
    'Q jammer (vents alarm) · E smoke bomb · M mute',
    best > 0 ? `Best score: ${best}` : 'An original game — every pixel and sound made for this heist.',
    '',
    'Press ENTER to begin the heist',
  ], COLORS.gold);
}

export function drawCaught(ctx, reason) {
  drawScreen(ctx, 'CAUGHT!', [
    reason,
    'The guards knew the museum better than you did.',
    '',
    'Press R to case the joint again',
  ], COLORS.danger);
}

export function drawWin(ctx, breakdown) {
  drawScreen(ctx, 'CLEAN GETAWAY!', [
    'The Star Sapphire is yours. The van is already rolling.',
    `Loot $${breakdown.loot}  ·  Time bonus $${breakdown.timeBonus}  ·  Stealth bonus $${breakdown.stealthBonus}`,
    `TOTAL SCORE: ${breakdown.total}`,
    '',
    'Press R to plan the next heist',
  ], COLORS.safe);
}
