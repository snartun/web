# Crane-drop tower-stacking games: gameplay mechanics inventory

Source-code notes come from local clones made on 2026-11-24:
- iamkun/tower_game, commit c6fa84a (Aug 2025). Base URL: https://github.com/iamkun/tower_game/blob/master/src/
- DavidKk/tower-blocks, commit e7a5ea9. Base URL: https://github.com/DavidKk/tower-blocks/blob/master/src/libs/
- KonradLinkowski/Stack, commit 4842925. Base URL: https://github.com/KonradLinkowski/Stack/blob/master/src/
- R-zine/stackr, commit 31c0cf9. Base URL: https://github.com/R-zine/stackr

Line numbers below refer to those commits. Ste-vg's CodePen "Tower Blocks" could not be fetched because CodePen blocked automated access, so it is not covered.

## 1. Crane/hook movement, block release and fall (with concrete formulas)

### Takeaway
In the most faithful open-source Tower Bloxx clone (iamkun/tower_game), the crane is a **kinematic pendulum**: angle = A·sin(t/period). The rope pivot is fixed at the top centre of the screen. Rope length is 40% of the canvas height, and the amplitude grows from about 30° to about 80° as the tower gets taller. When the player taps, the block leaves the rope end with **zero velocity** and falls under constant gravity (semi-implicit integration). Landing is detected when the block's bottom crosses the top of the tower (a "line" y). Stack-style 3D clones skip the pendulum: they slide the block back and forth along one axis and resolve the placement on tap, sometimes dropping the cut-off piece with gravity.

### Cited Findings
**iamkun/tower_game (described in its README as "a tower building game based on ES6 and Canvas (Tower Bloxx Deluxe Skyscraper)")** — [README](https://github.com/iamkun/tower_game)
- Sizes: `blockWidth = game.width * 0.25`, `blockHeight = blockWidth * 0.71`, `ropeHeight = game.height * 0.4` — [index.js L49-52](https://github.com/iamkun/tower_game/blob/master/index.js)
- Pivot: the hook and block start at `x = engine.width / 2`, `y = ropeHeight * -1.5`. Before each new block, a "hook down" tween over 500 ms lowers them by ropeHeight — [hook.js L5-32](https://github.com/iamkun/tower_game/blob/master/src/hook.js), [animateFuncs.js L91](https://github.com/iamkun/tower_game/blob/master/src/animateFuncs.js)
- Pendulum: `angle = initialAngle * getSwingBlockVelocity(engine, time)`, `weightX = x + sin(angle)*ropeHeight`, `weightY = y + cos(angle)*ropeHeight` — [hook.js L33-39](https://github.com/iamkun/tower_game/blob/master/src/hook.js), [block.js L32-43](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- Swing function: `return Math.sin(time / (200 / hard))`. `hard` is 0 for the first block (no swing), then 1 for floors 1-9, 0.8 for floors 10-19, 0.7 for floors 20-29 and 0.74 for 30 and up. Hard mode sets it to 1.1. Inference: with time in ms, the period is 2π·200/hard ≈ 1.26 s at hard = 1, so a lower `hard` means a slower swing at higher floors. The amplitude increase described below offsets that — [utils.js L36-65](https://github.com/iamkun/tower_game/blob/master/src/utils.js)
- Amplitude: `getAngleBase` returns 30 for floors under 10, 60 for floors under 20 and 80 otherwise (90 in hardMode). The actual amplitude in degrees is `random(angleBase, angleBase+5) * randomPositiveNegative()` and is re-rolled for each block, so the starting swing direction is random — [utils.js L16-34](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [animateFuncs.js L84-90](https://github.com/iamkun/tower_game/blob/master/src/animateFuncs.js)
- Input: a tap is accepted only when the hook is idle (not tweening down or up) and the block is in SWING state. The tap starts a 500 ms "hook up" tween and sets the block to BEFORE_DROP — [utils.js L103-118](https://github.com/iamkun/tower_game/blob/master/src/utils.js)
- Release: `x = weightX - calWidth; y = weightY + 0.3*height; rotate = 0; ay = engine.pixelsPerFrame(0.0003 * engine.height)` (code comment: "acceleration of gravity"). The block keeps no horizontal velocity from the swing, so it falls straight down — [block.js L89-96](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- Fall integration each frame: `vy += ay*dt; y += vy*dt + 0.5*ay*dt²` — [block.js L97-101](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- Landing detection: `if (block.y + block.height >= line.y)`. Here `line` is the top surface of the tower (`line.x` is the left edge and `line.collisionX` the right edge of the top block, both measured with the block's left x) — [block.js L12-31](https://github.com/iamkun/tower_game/blob/master/src/block.js), [line.js](https://github.com/iamkun/tower_game/blob/master/src/line.js)
- Camera: after a landing, the tower and background scroll down over 500 ms (`moveDownMovement`) by `blockHeight*2*1.25` per step for the first 4 floors and `blockHeight*2` after that (scaled through pixelsPerFrame) — [utils.js L6-14](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [block.js L131](https://github.com/iamkun/tower_game/blob/master/src/block.js)

**Stack-style clones (horizontal sweep, not pendulum)**
- DavidKk/tower-blocks: the block moves along x or z within ±12 units of its position and reverses at the ends. Default speed is 0.2 units per tick, and `speed = movingSpeed + index*0.005` (speed rises with each floor). Gravity for falling pieces is `static g = 0.098` with `y -= v; v += g` — [Block.ts L20, L51-55, L85-97](https://github.com/DavidKk/tower-blocks/blob/master/src/libs/Block.ts), [Game.ts L50, L122](https://github.com/DavidKk/tower-blocks/blob/master/src/libs/Game.ts)
- KonradLinkowski/Stack: the tile moves at `delta * 150` units/s, bounces at ±100, and alternates between the x and z axes on even and odd floors. Tile height is 10 and the base is 100×100 — [moving-tile.ts L5-48](https://github.com/KonradLinkowski/Stack/blob/master/src/moving-tile.ts), [game.ts L204-216](https://github.com/KonradLinkowski/Stack/blob/master/src/game.ts)
- R-zine/stackr: the piece travels horizontally. Each round lasts 1.92 s at first and gets 4% shorter after every placement, and direction reverses after each placement — [README](https://github.com/R-zine/stackr)

**Commercial games (descriptive sources only)**
- Tower Bloxx uses a "one-button tower-building mechanic". Each floor swings side to side on a crane until the player drops it — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx)
- "You can either click the mouse button to release the block or push [space]" (Deluxe) — [JayIsGames](https://Jayisgames.com/review/tower-bloxx-deluxe.php)
- Mobile: "press '5' to drop it onto the block below" — [Pocket Gamer](https://www.pocketgamer.com/tower-bloxx/review/)
- The Tower Bloxx team spent 3 weeks iterating on core physics. A senior designer and a senior programmer worked side by side, with build cycles of 0.5-3 h and immediate playtest feedback. Their stated reason was that "the block dropping and tower hovering part should be more appealing" — [Game Developer postmortem](https://www.gamedeveloper.com/game-platforms/feature-postmortem-digital-chocolate-s-i-tower-bloxx-i-)

### Inferences
- To get "release from above and fall with gravity" in the user's game, the minimal change is the iamkun state machine: SWING → BEFORE_DROP (freeze position at the rope end) → DROP (integrate vy with gravity) → collision check against the tower top → LAND, ROTATE (tip) or OUT. The current instant snap would become the end of the DROP state.
- iamkun gives the block no horizontal velocity on release. A more physical variant would carry over the pendulum's tangential velocity (dx/dt of weightX). No found source does this, so it is a design option, not an observed convention.
- With rope length 0.4·H, a pivot above the screen and the tower top scrolled into a fixed band, the fall distance is roughly constant per drop. Inference: this keeps fall time constant, which keeps timing predictable.

### Gaps
- `engine.pixelsPerFrame` comes from the `cooljs` dependency, and its exact formula (time base, frame normalisation) was not inspected. The gravity value 0.0003·H is therefore given in engine units, not px/s².
- No source gives Tower Bloxx's actual rope length, swing period or gravity. The game is closed-source.

## 2. Landing outcomes: perfect, partial, tip-over, miss; tower sway and balance

### Takeaway
Two families exist. (a) **Tower Bloxx-style** (iamkun): the block keeps its full width. If it overlaps, it lands offset. If its edge lands past the tower edge, it pivots around that edge and falls off once it rotates more than about 75° (1.3 rad). If it misses entirely, it falls. (b) **Stack-style** (Ketchapp clones): the overhang is sliced off and falls, the new top shrinks to the overlap, a near-exact hit (within an epsilon) snaps perfectly, and zero overlap ends the game. Tower Bloxx itself makes misalignment increase tower sway. iamkun instead uses a scripted horizontal oscillation of the tower that grows with floor count.

### Cited Findings
**iamkun/tower_game collision codes** ([block.js L12-31](https://github.com/iamkun/tower_game/blob/master/src/block.js); the code comment reads "0 goon 1 drop 2 rotate left 3 rotate right 4 ok 5 perfect")
- Miss (1): `block.x < line.x - calWidth || block.x > line.collisionX + calWidth` (the block's centre is outside the top block's span). The block keeps falling, and when it leaves the screen it counts as a failure.
- Tip left (2) if `block.x < line.x`; tip right (3) if `block.x > line.collisionX`. Inference: since `calWidth` is half the width, a tip happens when the block's left edge is offset by more than its own width... more precisely, when the horizontal offset between the new and previous block exceeds 0 in the "outside" direction but the centre is still over the top block. The exact geometry depends on how `line.x` and `collisionX` relate to the left x.
- Perfect (5): `block.x > line.x + calWidth*0.8 && block.x < line.x + calWidth*1.2`. The comment calls this "-10% +10%", i.e. an offset under ±0.2·halfWidth = ±10% of block width. Otherwise (4) it is an OK landing.
- Tip animation: the block pivots around the tower edge `(line.x or collisionX) + calWidth, line.y`. `rotateSpeed = pixelsPerFrame(π*4)` is scaled by `max(0.5, (calWidth - outwardOffset)/calWidth)`. Once `|rotate| > 1.3` rad (the comment says "75度", 75°), the block slides off (`y += 0.7·H`, `x += 0.3·W` per pixelsPerFrame) and is counted as failed when off-screen — [block.js L175-200](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- A successful landing sets the new tower top to the landed block (`line.x = i.x - i.calWidth; line.collisionX = line.x + i.width`). The tower does **not** shrink — [block.js L135-138](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- Tower sway: each frame, the landed blocks and the line move by `Math.cos(time/200) * hard * width`, where `hard` is 0 for floors under 5, 0.001 under 13, 0.002 under 23 and 0.003 after that. Sway therefore depends on height, not on alignment — [utils.js L67-91](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [line.js L21-23](https://github.com/iamkun/tower_game/blob/master/src/line.js)
- Anti-cheat: if a block lands more than 30% of its width beyond either screen edge, `hardMode` turns on. In hard mode the amplitude is 90°, the swing factor is 1.1 and the rope length is re-rolled to `H*random(0.35,0.55)` each floor — [block.js L139-144](https://github.com/iamkun/tower_game/blob/master/src/block.js), [utils.js L120-128](https://github.com/iamkun/tower_game/blob/master/src/utils.js)

**Stack-style slicing**
- KonradLinkowski/Stack: `newSize = prevSize - |diff|` per axis. If the new size is below 0, the game resets. If the relative error is ≤ `eps = 0.05` (5% of previous size) on both axes, the tile snaps to the previous centre with full size and a "PerfectEffect" spawns. Otherwise a `FadingTile` with the cut size is spawned for the overhang — [game.ts L116-193](https://github.com/KonradLinkowski/Stack/blob/master/src/game.ts)
- DavidKk/tower-blocks: `overlap = topSize - |delta|`. If overlap ≤ 0 the player loses. If overlap > 0.8 the game continues, and the cut piece is spawned as a falling "drop" block (gravity 0.098) only if `|delta| > 0.3`, so smaller offsets act as perfect. If 0.3 < overlap ≤ 0.8, the piece is placed and scored, then the game ends. Inference: a minimum width of 0.8 units (of 10) is the survival floor — [Game.ts L189-263](https://github.com/DavidKk/tower-blocks/blob/master/src/libs/Game.ts)
- R-zine/stackr: there is no slicing. Any touching overlap is valid, and "the new piece remains at the exact position where it was dropped". On a loss, "the completed stack is then handed to the physics simulation and collapses" — [README](https://github.com/R-zine/stackr)

**Tower Bloxx (commercial)**
- "Better alignment lets the tower grow taller and stay stable. Poorly placed floors make it sway more" — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx)
- A poor drop makes the tower lean, and frequent misses make it sway, "swinging about like a reed in a gale". A badly misjudged block "bounces off" and falls, "possibly knocking down other blocks, depending on how unstable the tower is" — [Pocket Gamer](https://www.pocketgamer.com/tower-bloxx/review/)
- "You have a certain degree of variance to miss drops… You can build a tower resembling the Leaning Tower of Pisa without it toppling over" — [JayIsGames (Deluxe)](https://Jayisgames.com/review/tower-bloxx-deluxe.php)
- GamesRadar reports that accurate placement is rewarded while sloppy stacking has few penalties (search-result summary only, page not fetched) — [GamesRadar](https://www.gamesradar.com/tower-bloxx-deluxe-review)

### Inferences
- For a 2D canvas game, the iamkun approach is a cheap, deterministic "centre-of-mass" proxy. If the block's centre lies over the support, it lands. If the overhang passes the support edge, it tips around the support corner and falls. A true per-block centre-of-mass check would require the block's centre to be within [topLeft, topRight]. Stack-style slicing is a different design and should be picked deliberately.
- Tower Bloxx's sway tied to misalignment could be modelled by having sway amplitude depend on the accumulated offset of block centres from the tower base (a sum or RMS of offsets) in addition to height. This is a design inference; no source gives Digital Chocolate's formula.

### Gaps
- No source states Tower Bloxx's perfect-drop tolerance or its exact tip/fall rule.
- No primary source confirms the commonly cited Ketchapp Stack rule that a streak of perfects regrows the block. My searches (App Store, reviews) did not confirm it, so it is unverified.

## 3. Scoring, combos, lives and game over

### Takeaway
The open-source baseline gives 25 points per floor plus 25 × the current consecutive-perfect count, allows 3 failures and resets the perfect streak on a failure. Tower Bloxx scores in "population": residents move in, straighter towers attract more, and a combo meter rewards chains of perfect drops. Three missed drops end the game.

### Cited Findings
- iamkun: `score += (successScore||25) + (perfectScore||25) * perfectStreak`. The streak resets to 0 on a non-perfect landing and on a failure. Game over is at `failed >= 3`. README: "The player starts with 3 hp… earns 25 points for every successful stacked block… the first Perfect awards 50 points. The second consecutive Perfect awards 75 points" — [utils.js L131-154](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [README](https://github.com/iamkun/tower_game)
- iamkun has callbacks `setGameScore`, `setGameSuccess` and `setGameFailed`, plus overridable `hookSpeed(floor, score)`, `hookAngle(floor, score)` and `landBlockSpeed(floor, score)` functions. These let the difficulty curve be tuned from outside — [README](https://github.com/iamkun/tower_game)
- iamkun shows a lightning effect at success counts 10 and 15 (a feedback milestone) — [block.js L132-133](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- Tower Bloxx: "A combo meter fills with each perfect drop". Drops made while the meter is counting down earn extra residents, and consecutive perfects add bonuses. A straighter tower attracts more residents ("arrive by parachute"). "Do this three times and it's game over" — [Pocket Gamer](https://www.pocketgamer.com/tower-bloxx/review/)
- Deluxe: "Perfect towers will net you the maximum amount of inhabitants". An achievement example is "20 perfect stacks in one tower". A bad drop loses "one out of three lives". Population is "the currency of the game" — [JayIsGames](https://Jayisgames.com/review/tower-bloxx-deluxe.php)
- Quick game ends after three missed drops — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx)
- Stack clones: 1 point per floor (`$points = index`), and the game ends on zero overlap — [KonradLinkowski game.ts L192](https://github.com/KonradLinkowski/Stack/blob/master/src/game.ts); stackr: "The score increases by one", and the game also ends if the round timer expires — [stackr README](https://github.com/R-zine/stackr)
- Ketchapp Stack: perfect stacks play piano tones (reviews), and the game sells "10 Extra Lives" as an IAP — [App Store](https://apps.apple.com/app/stack/id1080487957)

### Inferences
- Common pattern: base points per floor plus an escalating streak bonus, 3 lives, and a streak reset on a miss. Tower Bloxx adds a time-limited combo window (the meter "counting down"), which rewards fast and accurate drops.

### Gaps
- No source gives Tower Bloxx's numeric resident formula or the combo-meter duration.

## 4. Difficulty curve

### Takeaway
Difficulty rises with floor count by widening the swing amplitude (30° → 60° → 80°), changing swing speed, adding tower oscillation from floor 5, and (in Stack clones) increasing slide speed or shortening the timer. Stack-style games also get harder because the block itself shrinks.

### Cited Findings
- iamkun thresholds: amplitude changes at floors 10 and 20. The swing factor is 0 → 1 → 0.8 → 0.7 → 0.74 at floors 1/10/20/30. Tower sway is 0 → 0.001 → 0.002 → 0.003·W at floors 5/13/23. Hard mode uses 90°, ×1.1 and a random rope length of 0.35-0.55·H — [utils.js](https://github.com/iamkun/tower_game/blob/master/src/utils.js)
- DavidKk: `speed = 0.2 + index*0.005` — [Game.ts L122](https://github.com/DavidKk/tower-blocks/blob/master/src/libs/Game.ts)
- stackr: the round starts at 1.92 s and gets 4% shorter per placement. Piece shapes vary (wide pieces give more tolerance, narrow ones demand better timing) — [README](https://github.com/R-zine/stackr)
- Tricky Towers events change block physics, for example "doubling block size, making blocks slippery, or speeding up drops" — [Wikipedia](https://en.wikipedia.org/wiki/Tricky_Towers)

### Inferences
- Wind could be a horizontal offset or a horizontal force on the falling block. It is a natural extension once a real fall exists, but no source in this set documents wind in Tower Bloxx.

### Gaps
- No source found on wind in Tower Bloxx or on block-size changes with height in Tower Bloxx.

## 5. Modes and progression

### Takeaway
Tower Bloxx pairs a Quick Game (tallest tower) with a Build City meta-game. In Build City, finished towers are placed on a grid with adjacency rules and population goals per zone. Deluxe adds a time challenge and 4-player hot-seat party mode. Ketchapp Stack monetises with skins, gems, daily missions, Game Center leaderboards and, from v4.0, a "Stack City" builder.

### Cited Findings
- Tower Bloxx modes are Quick game and city-building. Tower types have placement requirements, and larger building types unlock as the city grows. Versions: 2005 (mobile, also known as City Bloxx), Facebook 2007, Deluxe 2008 (PC) and 2009 (XBLA), then New York and 6-D — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx)
- Building tiers on mobile: residential towers are 10 blocks, then commercial 20, office 30 and skyscraper 40 as population grows. "Office towers have to be adjacent to a residential and a commercial tower" — [Pocket Gamer](https://www.pocketgamer.com/tower-bloxx/review/)
- Deluxe colours are blue residential, red, green office and yellow. Green must neighbour blue and red. The Mega-Tower has no population cap but needs all four colours as neighbours. Special blocks such as balconies come after about 4 exact stacks. Other upgrades include population-cap increases and trophy roofs. Modes are Story (zones with population goals), Quick play, Time challenge and Party mode ("up to four players… on a single computer") — [JayIsGames](https://Jayisgames.com/review/tower-bloxx-deluxe.php); four tower types are confirmed by [LaunchBox DB (search snippet)](https://gamesdb.launchbox-app.com/games/details/75795-tower-bloxx-deluxe)
- Tower Bloxx: New York keeps the core stacking but reworks city planning into "a SimCity style boardgame" (search snippets) — [Windows Central](https://windowscentral.com/tower-bloxx-new-york-review), [Pocket Gamer NY](https://www.pocketgamer.com/tower-bloxx-new-york/review)
- Ketchapp Stack features: Game Center leaderboards, slab skins (some change the background), gems (IAP), a daily mission system (v3.65), friend challenges (v3.63), and Stack City (v4.0). In Stack City, stacking floors builds a city with population and revenue, buildings can be unlocked and decorated, and there are seasonal themes, a VIP pass and offline earnings — [App Store](https://apps.apple.com/app/stack/id1080487957)
- stackr keeps a local high score in the browser and shows a "Next" shape preview — [README](https://github.com/R-zine/stackr)

### Inferences
- A feature ladder for an HTML5 port could be: endless or quick game with a local best score → daily seed challenge → achievements (for example "N perfects in a row") → cosmetic block skins → a city or meta layer. Each step is attested in at least one of the games above.

### Gaps
- No source detailed Tower Bloxx power-ups. None were mentioned in the sources fetched.

## 6. Competitive / two-player variants

### Takeaway
The best-documented competitive stacking design is Tricky Towers. It supports up to 4 players locally or online, offers Race (first past the finish line), Survival (lose health on each dropped brick) and Puzzle (most bricks below a cut-off line), and uses Light spells (help yourself) and Dark spells (hinder rivals). Tower Bloxx Deluxe has a 4-player single-computer party mode, but its rules were not documented in the sources found.

### Cited Findings
- Tricky Towers is physics-based. Pieces move in half-square steps, and blocks can fall off. It has 18 spells (17 in other sources): Light magic boosts your own tower, Dark magic damages or weakens opponents'. Modes are Race, Survival and Puzzle — [Wikipedia](https://en.wikipedia.org/wiki/Tricky_Towers)
- Steam lists "over 17 different spells", 4 players locally (controllers) or online, dark spells to "hamper or even push over your competitors' towers", the ability to "Block these spells to protect your tower", leaderboards and tournaments, and cosmetic DLC brick packs — [Steam](https://store.steampowered.com/app/437920/Tricky_Towers/)
- Balancing (secondary sources): "using a spell of 1 category limits the use of spells of the other" (search-result summary). In Survival you "lose a life each time you drop a brick" — [Tricky Towers search results, e.g. Nexus mod docs](https://www.nexusmods.com/trickytowers/mods/1?tab=docs) (secondary, unverified)
- Tower Bloxx Deluxe Party mode: "up to four players to play against each other on a single computer" — [JayIsGames](https://Jayisgames.com/review/tower-bloxx-deluxe.php)

### Inferences
- Attack mechanics that map onto a crane-drop game, all inferred and not sourced for crane games: send the rival wind gusts, a faster swing, or a narrower next block (garbage-like), each triggered by a perfect streak. The light/dark exclusivity in Tricky Towers is one attested balancing lever.

### Gaps
- No primary source found on Puyo/Tetris-style garbage-based versus modes in crane-drop games specifically.

## 7. Physics approach: kinematic vs. physics engine

### Takeaway
Every precise-timing clone examined resolves placement **kinematically** (rule-based overlap tests and scripted tip or fall animations). A physics engine (cannon.js in stackr) is used only for the collapse after game over, or for loose games like Tricky Towers. Developer threads report that rigid-body stacks in JS engines jitter and slide unless solver iterations are raised, which costs performance on mobile.

### Cited Findings
- iamkun, DavidKk and KonradLinkowski use no physics engine (own gravity integration and overlap rules) — see code links above. iamkun's only dependency is `cooljs` — [package.json](https://github.com/iamkun/tower_game/blob/master/package.json)
- stackr uses @react-three/cannon with `gravity={[0,-40,0]}`, friction 0.9, `frictionEquationStiffness: 1e7` and random mass `1 + Math.random()*3`. Placement is rule-based ("footprints still touch or overlap"), and the stack is "handed to the physics simulation" on loss — [Game.tsx L409-419](https://github.com/R-zine/stackr/blob/main/src/Game.tsx), [Cube.tsx L96](https://github.com/R-zine/stackr/blob/main/src/Cube.tsx), [README](https://github.com/R-zine/stackr)
- Phaser P2 (p2.js) stacked boxes: "Everything is shaking and sliding constantly", and the tower starts swinging after 5-6 s. 100 solver iterations were smooth but "unacceptable for mobile", so 18 was chosen. Damping = 1 stabilises the stack but "the collision does not look realistic anymore". Sleeping helps, but removing a bottom box did not wake the boxes above it — [html5gamedevs](https://www.html5gamedevs.com/topic/30252-boxes-stack-unstable)
- A Box2D-family guide: too few position iterations (1-2) cause "jittering, clipping, and unstable stacks" — [Planck.js article](https://salivity.github.io/planck.js/article/why-are-position-iterations-important-in-planck-js); a stack starts unstable because "the constraints are not in a convergent state" — [gamedev.net](https://gamedev.net/forums/topic/670656-box-stacking/5245554/)
- Matter.js advertises stable stacking and resting as a feature (search summary) — [brm.io/matter-js](https://brm.io/matter-js/)
- The Tower Bloxx team tuned the "feel" of the physics through rapid designer-programmer iteration rather than simulation accuracy — [Game Developer](https://www.gamedeveloper.com/game-platforms/feature-postmortem-digital-chocolate-s-i-tower-bloxx-i-)

### Inferences
- Recommended hybrid for the user's canvas game: a kinematic swing and fall (iamkun formulas), a rule-based landing (perfect / ok / tip / miss), and optionally a physics engine only for debris or game-over collapse. This keeps the outcome deterministic and fair, avoids jitter, and keeps the spectacle.

### Gaps
- No Matter.js or Planck.js official documentation page specific to tall-stack stability was fetched. Only secondary or forum sources are used here.
