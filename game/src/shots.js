// The Velvet Vault — screenshot scenes behind ?shot=title|cover|vault|escape.
// Each scene stages the real game state (positions, alarm, loot, suspicion)
// and freezes the simulation, so the frame is exactly what a real moment
// of play looks like, rendered by the game's own code.

import { SAPPHIRE, CASES } from './level.js';

function placeGuard(game, index, x, y, angle, suspicion, state) {
  const guard = game.guards[index];
  guard.x = x;
  guard.y = y;
  guard.angle = angle;
  guard.suspicion = suspicion;
  guard.state = state || 'patrol';
  guard.chaseTimer = state === 'chase' ? 3 : 0;
}

function placeCamera(game, index, angle) {
  game.cameras[index].angle = angle;
  game.cameras[index].freezeTimer = 0;
}

/** Stage `game` into the named scene and freeze it for the screenshot. */
export function stageShot(name, game) {
  game.reset();
  game.frozen = true;
  if (name === 'title') {
    game.state = 'title';
    return;
  }
  game.state = 'playing';
  if (name === 'vault') {
    // Thief at the vault door, lockpick halfway, alarm climbing, Dante closing in.
    game.player.x = 898;
    game.player.y = 155;
    game.facing = 0;
    game.interaction = { label: 'PICKING THE VAULT LOCK…', fraction: 0.62 };
    game.alarm.value = 62;
    game.alarm.peak = 62;
    placeGuard(game, 2, 846, 236, Math.atan2(155 - 236, 898 - 846), 72, 'chase');
    placeGuard(game, 0, 520, 430, Math.PI, 18, 'patrol');
    placeGuard(game, 1, 420, 140, 0, 8, 'patrol');
    placeCamera(game, 1, Math.atan2(155 - 268, 898 - 700));
    placeCamera(game, 0, Math.PI / 2);
    placeCamera(game, 2, Math.PI);
    game.hint = 'Hold F — pick the vault lock (loud!)';
    game.updateScore();
    return;
  }
  if (name === 'escape') {
    // Sapphire in hand, thief sprinting for the van, alarm nearly full.
    game.player.x = 700;
    game.player.y = 620;
    game.player.hasSapphire = true;
    SAPPHIRE.taken = true;
    game.loot = 600;
    game.facing = Math.PI;
    game.alarm.value = 84;
    game.alarm.peak = 84;
    CASES[3].gem.taken = true;
    placeGuard(game, 0, 520, 560, Math.atan2(620 - 560, 700 - 520), 100, 'chase');
    placeGuard(game, 2, 820, 420, Math.atan2(620 - 420, 700 - 820), 88, 'chase');
    placeGuard(game, 1, 300, 200, Math.PI / 2, 12, 'patrol');
    placeCamera(game, 0, Math.PI / 2);
    placeCamera(game, 1, -Math.PI / 2);
    placeCamera(game, 2, Math.PI);
    game.hint = 'Sapphire secured — reach the getaway van!';
    game.updateScore();
    return;
  }
  // Default: 'cover' — the thief crossing the gallery, guards and cameras
  // in view, the Sapphire glinting in the vault, alarm at a tense 38%.
  game.player.x = 560;
  game.player.y = 470;
  game.facing = -Math.PI / 2;
  game.loot = 50;
  CASES[0].gem.taken = true;
  game.alarm.value = 38;
  game.alarm.peak = 38;
  placeGuard(game, 0, 420, 430, Math.atan2(470 - 430, 560 - 420), 55, 'patrol');
  placeGuard(game, 1, 300, 140, 0, 10, 'patrol');
  placeGuard(game, 2, 800, 250, Math.atan2(470 - 250, 560 - 800), 22, 'patrol');
  placeCamera(game, 0, Math.PI / 2 + 0.4);
  placeCamera(game, 1, -Math.PI / 2 - 0.3);
  placeCamera(game, 2, Math.PI - 0.4);
  game.hint = 'WASD move · SHIFT run · F interact · Q jammer · E smoke';
  game.updateScore();
}
