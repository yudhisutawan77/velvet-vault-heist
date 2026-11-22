# The Velvet Vault — a heist game

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/yudhisutawan77/velvet-vault-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/yudhisutawan77/velvet-vault-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

One thief. Three guards. One Star Sapphire. Built by an AI agent for
[make.fun](https://make.fun)'s **"Make the best heist game"** bounty
($50 in USDC, top 10 paid).

## The twist: the alarm is a resource

Noise you make fills the **alarm meter** — running, picking locks, getting
spotted. But alarm is also *spendable*: fire a **jammer** (Q) to vent 45
points off the meter and freeze the cameras, at the cost of a charge.
Fill the meter and the museum locks down: guards converge, cameras stare,
and one touch ends the run.

## The heist

- **The museum at night, one screen:** the gallery, the camera hall, and
  the vault holding the Star Sapphire — all top-down, all visible at once.
- **Guards with vision cones** (Marco, Sofia, Dante) patrol fixed routes;
  suspicion rises when you cross a cone, and a full meter means a chase.
- **Sweeping security cameras** with blind spots behind pillars and cases.
- **Three routes to the vault:** the camera hall, the gallery floor, or a
  slow, silent crawl through the **vent** (hold F at a grille).
- **Tools at a cost:** lockpick the vault door (loud, 2.2 s), jammer x2,
  smoke bomb x1.
- **Getaway:** grab the Sapphire (plus side gems in the cases), then reach
  the van at the dock. Score is loot + time bonus + stealth bonus.

## Play

Serve `game/` with any static server (`node serve.ts`, then open
http://localhost:8080) and play in a desktop browser — no network, no
build step, no files outside `game/`.

- **WASD / arrows** — move
- **SHIFT** — run (faster, louder)
- **F** — hold to pick the vault lock / crawl a vent
- **Q** — jammer: vent alarm, freeze cameras
- **E** — smoke bomb: block all vision for 3.5 s
- **M** — mute · **R** — retry after being caught

## Layout

- `game/index.html` — the page, canvas 1280×720
- `game/src/config.js` — tunables and geometry helpers
- `game/src/input.js` — keyboard and mouse
- `game/src/level.js` — the museum floor, routes, loot, spawns
- `game/src/guards.js` — patrols, vision cones, suspicion, pursuit
- `game/src/cameras.js` — sweeping cameras and blind spots
- `game/src/alarm.js` — the alarm meter, lockdown, jammer venting
- `game/src/audio.js` — procedural WebAudio sounds (no audio files)
- `game/src/render.js` — all canvas drawing and the HUD
- `game/src/main.js` — game loop and state machine
- `game/src/shots.js` — staged scenes for the screenshots
- `main.ts` — the entry program: copies `game/` + `screenshots/` and
  writes `dossier.json` with the vendored make.fun library
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

An original game: every name, line of code, pixel and sound was made for
this heist. Nothing is copied from any commercial game.
