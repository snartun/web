# Graphics, art direction and "juice" in tower/block-stacking games (2D, mobile, HTML5 canvas)

Source note: The most detailed primary source is the open-source iamkun/tower_game (ES6 + Canvas, MIT, inspired by Tower Bloxx Deluxe). I cloned it and read its code and assets directly. Links below go to the files on GitHub (branch `master`). The review sites for Tower Bloxx (GamesRadar, Windows Central) did not return full text, so their claims come only from search snippets and are marked that way.

Abbreviations: TG = iamkun/tower_game, https://github.com/iamkun/tower_game

## 1. Art styles, palettes, backgrounds, how building pieces are drawn

### Takeaway
The genre splits into two looks. One is cheerful cartoon city building (Tower Bloxx: colourful floor blocks, a cute cityscape, residents floating in on umbrellas, planes, birds and balloons passing as the tower rises). The other is minimalist abstract (Ketchapp Stack: flat slabs and a gradient background whose hue shifts with each placed block, often compared to Monument Valley). For 2D canvas, TG shows a complete working recipe: a flat-vector floor sprite, a ground and building illustration as the base, and a vertical sky gradient that moves through 7 colour stops from day green-cyan to dark night/space. Decorations change with altitude: clouds turn into meteorites, and planes fly past at set floor counts.

### Cited Findings
**Tower Bloxx / Tower Bloxx Deluxe (Digital Chocolate)**
- Original Tower Bloxx: Digital Chocolate's Helsinki studio (formerly Sumea), December 2005, also titled City Bloxx. The sequel Tower Bloxx Deluxe followed in 2008 (PC), then Xbox Live Arcade in October 2009. Later entries: Tower Bloxx: New York and Tower Bloxx 6-D. — [Wikipedia: Tower Bloxx](https://en.wikipedia.org/wiki/Tower_Bloxx)
- Deluxe (PC) is a 3D upgrade of the mobile original ("graphically-superior 3D presentation"). Stacking mode is fully 3D, and the camera can be rotated with the right mouse button. Backgrounds show a "cute cityscape". — [JayIsGames review](https://jayisgames.com/review/tower-bloxx-deluxe.php)
- Planes, birds, hot air balloons and blimps fly past as the tower rises. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)
- Residents fall from the sky "clutching little umbrellas" and fill the tower. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php). GamesRadar's snippet says people "swoop in on umbrellas" as the tower rises; I saw only the search snippet, not the full text. — [GamesRadar](https://www.gamesradar.com/au/tower-bloxx-deluxe-review/)
- Building types are colour-coded: blue = residential, red = bigger apartments, green = offices (must neighbour a blue and a red tower), yellow = high-population skyscrapers. The Mega-Tower must be neighboured by all four colours. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)
- Four exactly stacked blocks unlock special blocks such as balconies. Trophy roofs add population. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)
- PocketGamer (mobile Deluxe): "cheery 3D visuals". Skyscrapers come in several colours, and colour limits where a tower can go on the city grid. Roof pieces unlock as population grows. — [Pocket Gamer review](https://www.pocketgamer.com/tower-bloxx-deluxe/review)
- Windows Central (Tower Bloxx: New York, 2D), search snippet only: block sprites are colourful with "a good level of depth", and the scenery changes as the tower gets taller. — [Windows Central](https://windowscentral.com/tower-bloxx-new-york-review)
- Tower Bloxx: Revolution is described as "visually noisy", with a swaying tower and a constantly moving crane arm (snippet). — [Pocket Gamer: Revolution](https://www.pocketgamer.com/tower-bloxx-revolution/review/)

**Ketchapp Stack (February 2016)**
- Minimalist design that "strongly recalls" Monument Valley. Slabs get smaller as overhanging parts are cut off. After at least 8 exact placements in a row, the slabs grow larger again. — [Macwelt](https://www.macwelt.de/article/966996/app-tipp-geschickt-stapeln-in-stack.html)
- App Store user reviews say:
  - The colours used to "slowly blend to a different one along with the background every time you hit a stack", and newer non-gradient skins feel less satisfying.
  - Perfect placements play "piano tones".
  - Some themes (Retro) get so dark that the corners are hard to see during long perfect streaks.
  - The listing advertises "simple & beautiful graphics".
  - Source: [App Store: Stack](https://apps.apple.com/app/stack/id1080487957)

**iamkun/tower_game (browser, HTML5 canvas): concrete rendering recipe**
- README: "a tower building game based on ES6 and Canvas", inspired by Tower Bloxx Deluxe Skyscraper. — [TG README](https://github.com/iamkun/tower_game)
- Floor piece: one flat-vector PNG (red brick wall, two arched blue windows, light top cornice). A separate `block-perfect.png` is the same floor in gold/orange; floors placed perfectly are drawn permanently with this golden sprite. — [block.js `drawBlock`](https://github.com/iamkun/tower_game/blob/master/src/block.js), assets `block.png` and `block-perfect.png` (viewed directly)
- Block size is responsive: width = 0.25 × canvas width, height = 0.71 × block width. Rope length = 0.4 × canvas height. Cloud size = 0.3 × width. — [TG index.js lines 49–52](https://github.com/iamkun/tower_game/blob/master/src/index.js)
- Base scene: a 750×1050 flat-vector illustration of a red brick mansion with a balcony, trees and a pale blue skyscraper skyline silhouette on a grey ground. The tower starts on this building's roof (line initial offset = height − 0.394 × image height). — [background.js](https://github.com/iamkun/tower_game/blob/master/src/background.js), `assets/background.png` (viewed)
- Sky: a vertical linear gradient that steps through 7 RGB stops as the tower rises: [200,255,150] → [105,230,240] → [90,190,240] → [85,100,190] → [55,20,35] → [75,25,35] → [25,0,10]. That is light green-yellow horizon, then cyan, blue, indigo, and finally dark maroon/near-black "space". The gradient offset advances at 1.5× the camera's move-down speed. — [background.js `backgroundLinearGradient`](https://github.com/iamkun/tower_game/blob/master/src/background.js)
- Parallax: the background image scrolls at half the camera move speed and clouds at 1.2×. Clouds drift side to side with ping-pong motion and recycle to the top when they leave the screen. After a few recycles, cloud sprites (c1–c3) are swapped for meteorite/stone sprites (c4–c8), which shows altitude. — [cloud.js](https://github.com/iamkun/tower_game/blob/master/src/cloud.js), [background.js](https://github.com/iamkun/tower_game/blob/master/src/background.js)
- Set-piece "flights" (sprites f1–f7, flat-vector planes and similar) appear at floors 2, 6, 8, 14, 18, 22 and 25. Their paths are leftToRight, rightToLeft, bottomToTop and rightTopToLeft, on a dedicated layer. — [animateFuncs.js `startAnimate`](https://github.com/iamkun/tower_game/blob/master/src/animateFuncs.js), [flight.js](https://github.com/iamkun/tower_game/blob/master/src/flight.js)

### Inferences
- A 2D canvas redesign can get "altitude change" cheaply. Interpolate the sky gradient by tower height (TG's 7-stop list is a ready template), swap decoration sprite sets by height band (birds/clouds, then planes/balloons, then stars/meteorites), and spawn one-off flyby set pieces at milestone floors. (Inference based on TG + Tower Bloxx reviews.)
- Variety in building pieces can come from (a) colour-coded building types (Tower Bloxx), (b) a different sprite for perfect floors (TG gold), and (c) special unlock pieces such as balconies and roofs after perfect streaks (Tower Bloxx). (Inference combining sources.)
- Keep a dark theme readable. Stack users complained that pieces disappear against dark backgrounds, so keep strong edge contrast between tower and sky at night altitude. (Inference from App Store reviews.)

### Gaps
- I couldn't get full text of the GamesRadar, Windows Central or IGN Tower Bloxx reviews. Exact palettes or screenshots of Tower Bloxx 2D sprites aren't documented in accessible text.
- I found no sources for "Tower Builder", "Skyward" or "City Bloxx" visuals beyond what's above (City Bloxx is another title for Tower Bloxx).
- No official art-direction talk or postmortem from Digital Chocolate or Ketchapp was found.

## 2. Crane, rope, hanging block and drop presentation

### Takeaway
In all sources the piece hangs from a swinging crane or hook. In TG this is a simple pendulum: angle = A·sin(t/period), with the hook and rope drawn as one rotated sprite. The block is drawn hanging below with a rope strap. When the player taps, the hook retracts upward and the block falls under constant acceleration. On landing, the outcome is one of three: land, land-perfect, or a topple animation where the block pivots around the tower edge and then falls off-screen. No squash and stretch appears in TG.

### Cited Findings
- Tower Bloxx: each floor hangs from a crane and swings side to side until the player drops it. It's a one-button mechanic. — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx). Blocks are lowered from a "swaying crane", and the player only times the release. — [Pocket Gamer](https://www.pocketgamer.com/tower-bloxx-deluxe/review)
- TG pendulum:
  - `angle = initialAngle * sin(time / (200 / hard))`.
  - The hanging point is at `x + sin(angle)·ropeHeight`, `y + cos(angle)·ropeHeight`.
  - Initial amplitude is random within [base, base+5]° with a random sign. Base is 30° below floor 10, 60° below floor 20, then 80° (90° in "hard mode").
  - The speed factor `hard` is 0 before the first floor, then 1, 0.8, 0.7 and 0.74 in later bands.
  - Source: [utils.js `getAngleBase`, `getSwingBlockVelocity`](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [hook.js](https://github.com/iamkun/tower_game/blob/master/src/hook.js)
- TG rope and hook: one `hook.png` image is drawn rotated by the pendulum angle around the pivot, with width 0.1 × ropeHeight. The swinging block uses a `block-rope.png` sprite drawn 1.3× block height, so the strap is part of the sprite. — [hook.js `hookPainter`](https://github.com/iamkun/tower_game/blob/master/src/hook.js), [block.js `drawSwingBlock`](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- TG crane entry and exit: a new block descends with the hook by ropeHeight over 500 ms (`hookDownMovement`). After the tap, the hook retracts upward over 500 ms (`hookUpMovement`). Input is ignored while either animation runs. — [animateFuncs.js](https://github.com/iamkun/tower_game/blob/master/src/animateFuncs.js), [utils.js `touchEventHandler`](https://github.com/iamkun/tower_game/blob/master/src/utils.js)
- TG drop physics: rotation is reset to 0 at release. Gravity `ay = pixelsPerFrame(0.0003 × canvasHeight)`, integrated as `vy += ay·dt; y += vy·dt + ½·ay·dt²`. So gravity scales with screen height. — [block.js](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- TG landing classification (`checkCollision`):
  - Fully off the tower: the block falls and a life is lost.
  - Overhanging the left or right edge: the block rotates around the tower's top corner and falls.
  - Within ±10% of block width of centre-aligned: perfect.
  - Otherwise: normal landing.
  - Source: [block.js](https://github.com/iamkun/tower_game/blob/master/src/block.js)
- TG topple animation:
  - The block pivots around the supporting edge at a speed of `pixelsPerFrame(4π) × ratio`, where ratio = supported fraction, min 0.5.
  - Past about 75° (1.3 rad) it slides away (x by 0.3·width/s, y by 0.7·height/s) while still spinning.
  - A "rotate" sound plays.
  - Source: [block.js](https://github.com/iamkun/tower_game/blob/master/src/block.js)

### Inferences
- TG's approach (pendulum from the sin of time, not real rope physics) is cheap, deterministic and easy to tune per level. That suits a canvas game. (Inference.)
- Squash and stretch on impact isn't present in TG. Adding a brief vertical squash of the landed floor, plus a small dip of the whole tower, would be a design addition, not genre-documented. (Inference.)

### Gaps
- No source documents whether Tower Bloxx uses squash and stretch or a rope drawn as a line or curve. Video transcripts weren't accessible.

## 3. Camera, tower sway and lean

### Takeaway
The camera in TG never zooms. After each successful landing it scrolls the whole world down over 500 ms, by 2 × block height per landing (2.5 × for the first 4 floors). Background layers move at different fractions for parallax. Tower sway is a horizontal oscillation of the whole stack and landing line (`cos(t/200)·k·width`), where k increases with floor count. Tower Bloxx ties sway to placement quality, and the PC version lets the player orbit the 3D camera.

### Cited Findings
- TG camera:
  - Duration: `moveDownMovement` lasts 500 ms after each landing.
  - Scroll amount: 2 × blockHeight × 1.25 per landing when successCount ≤ 4, otherwise 2 × blockHeight.
  - Parallax rates: placed blocks and the landing line move at ½ rate, the background image at ½, clouds at 1.2×, and the sky gradient at 1.5×.
  - Sources: [utils.js `getMoveDownValue`](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [block.js](https://github.com/iamkun/tower_game/blob/master/src/block.js), [cloud.js](https://github.com/iamkun/tower_game/blob/master/src/cloud.js), [background.js](https://github.com/iamkun/tower_game/blob/master/src/background.js)
- TG tower sway:
  - Each landed block and the collision line get `x += cos(time/200) × hard × width` per frame.
  - `hard` is 0 below floor 5, then 0.001 below 13, 0.002 below 23, and 0.003 after that.
  - The whole tower moves rigidly; there is no per-floor lean.
  - Source: [utils.js `getLandBlockVelocity`](https://github.com/iamkun/tower_game/blob/master/src/utils.js), [line.js](https://github.com/iamkun/tower_game/blob/master/src/line.js)
- Tower Bloxx: better alignment makes the tower taller and more stable, while poor placement makes it sway more. — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx). A tower can lean "like the Leaning Tower of Pisa" without toppling until a block lands too far off. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)
- Tower Bloxx Deluxe PC: the camera can be moved with the right mouse button to view the tower from other angles. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)
- TG has no screen shake on landing. Its only full-screen effect is a white flash (`rgba(255,255,255,0.7)`) lasting 150 ms ("lightning") after the 10th and 15th successful floors. — [block.js](https://github.com/iamkun/tower_game/blob/master/src/block.js), [background.js](https://github.com/iamkun/tower_game/blob/master/src/background.js)

### Inferences
- For a sway visual closer to Tower Bloxx, rotate the tower stack around its base by a small angle proportional to accumulated misalignment (centre-of-mass offset), instead of TG's rigid translation. This is a design inference, not documented code.
- Showing only the top few floors (TG scrolls old floors off the bottom and hides them) keeps the screen readable. A brief zoom-out at milestones could show the full tower. (Inference; TG does not zoom.)

### Gaps
- No source gives Tower Bloxx's camera speeds or sway amplitude.

## 4. Game feel / juice techniques and parameters

### Takeaway
The canonical references are: "Juice It or Lose It" (Jonasson & Purho, 2012), "The Art of Screenshake" (Nijman, 2013) and "Juicing Your Cameras With Math" (Eiserloh, GDC 2016). Together they cover tweening/easing, particles, screen shake, hit-pause, sound and permanence. Concrete numbers mostly come from implementations: Bevy's trauma shake uses max 10° rotation, 20 px offset, trauma decay 0.5/s, exponent 2 and noise speed 20. Hit-stop guides suggest about 2–4 frames for light impacts at 60 fps. In the genre itself, documented feedback is: a perfect-placement sprite and sound (TG), escalating combo score, Stack's slab regrowth after 8 perfects, Stack's piano-tone pitch feedback, and Tower Bloxx's special balcony blocks after 4 perfects.

### Cited Findings
- "Juice It or Lose It": Martin Jonasson and Petri Purho, 2012 (Nordic Game Jam; also listed on GDC Vault from GDC Europe 2012). Starting from a plain block-breaker, they add effects one by one: tweening/easing, particles, screen shake, sound and animation. — [GDC Vault](https://gdcvault.com/play/1016789/Juice-It-or-Lose); course deck summarising techniques: [Uni Bayreuth GxD 10 Game Feel](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf); [gamejuice article](https://gamejuice.pages.dev/articles/juice-it-or-lose-it-lessons) (secondary)
- "The Art of Screenshake", Jan Willem Nijman (Vlambeer): about 30 small tweaks to a dull shooter. Examples: shake the screen slightly in the direction opposite to the shot, and give enemies a 33% chance to explode harmlessly. — [Game Developer](https://gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games). A fan recreation lists the effects as: animation, faster kill, fire rate, muzzle flash, impact, knockback, camera lerp, screenshake, player knockback, hit pause, recoil, and permanence (smoke/debris). This is secondary. — [DK Liao devlog](https://dkliao.itch.io/the-art-of-screenshake-recreation/devlog)
- Trauma-based shake, from Eiserloh's GDC 2016 talk as implemented in Bevy's official example:
  - `MAX_ANGLE` = 10°.
  - `MAX_TRANSLATION` = 20 px.
  - `TRAUMA_DECAY_PER_SECOND` = 0.5, so full trauma decays in 2 s.
  - `NOISE_SPEED` = 20; lower values feel "dreamier".
  - `TRAUMA_EXPONENT` = 2.
  - Offsets are sampled from noise, with trauma between 0 and 1.
  - Source: [Bevy 2d_screen_shake.rs](https://docs.rs/bevy/0.17.3/src/2d_screen_shake/2d_screen_shake.rs.html); talk: [GDC Vault](https://gdcvault.com/play/1023146/Math-for-Game-Programmers-Juicing)
- Hit-stop / freeze frames:
  - Durations: about 2–4 frames for light hits, 5–8 medium, 8–12 heavy, 12–20 for finishers. More than 20 frames feels like a bug. — [gamejuice: hit-stop](https://gamejuice.pages.dev/articles/hit-stop-frame-trick)
  - Fighting-game reference: Street Fighter V uses 8, 12 and 15 frames for light, medium and heavy hits. — [Jason de Heras thread](https://threadreaderapp.com/thread/1385104062157254660)
  - At 60 fps one frame is about 16 ms. — [uhiyama-lab](https://uhiyama-lab.com/en/notes/godot/hit-feedback-hitstop/)
  - These are combat-oriented, secondary sources.
- Selective shake: one source warns that adding shake to every event becomes visual noise. — [Problem Machine: Juice, Crunch, and Clarity](https://www.patreon.com/ProblemMachine/posts/juice-crunch-and-81485657) (seen in search snippet)
- Genre feedback in TG:
  - Separate sounds for drop, drop-perfect, rotate (topple) and game-over, plus BGM.
  - The perfect floor is permanently drawn gold.
  - Full-screen white flash at floors 10 and 15.
  - A tutorial hand/arrow on the first block.
  - Source: [TG src](https://github.com/iamkun/tower_game/tree/master/src), [assets](https://github.com/iamkun/tower_game/tree/master/assets)
- TG combo scoring: success = 25 points. Perfect = 25 + 25 × (consecutive perfect count), so 50, 75, 100 and so on. A miss resets the perfect streak. — [utils.js `addScore`, `addFailedCount`](https://github.com/iamkun/tower_game/blob/master/src/utils.js); [README](https://github.com/iamkun/tower_game)
- "Stack Up!" spec: a perfect gives an increasing bonus of 1 + 2 × the current combo, and an imperfect placement resets it (search snippet). — [Cinevva Stack Up](https://app.cinevva.com/arcade/stack-up)
- Stack: piano tones on perfect placements, and slabs grow back after 8+ perfects. — [App Store reviews](https://apps.apple.com/app/stack/id1080487957); [Macwelt](https://www.macwelt.de/article/966996/app-tipp-geschickt-stapeln-in-stack.html)
- Tower Bloxx: 4 exact stacks unlock balcony blocks. Combos and achievements (e.g., 20 perfect stacks) give score and population modifiers. — [JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)

### Inferences
- A suggested landing recipe for this genre, assembled from the sources (not documented as a set in any one game):
  - Normal landing: a short dust-puff particle burst at both bottom corners, a small trauma shake (about 0.2–0.3, so roughly 1–2 px after squaring with Bevy's 20 px max), and a "thud" sound.
  - Perfect landing: 2–4 frame hit-stop, a gold flash or sprite swap (TG), a ring or ripple expanding from the edges, a "+50 / PERFECT ×N" popup with ease-out-back scaling, and an ascending pitch per streak step (Stack's piano tones).
  - Topple: a larger shake and a "rotate" sound (TG).
- Keep shake on normal landings minimal, because landing happens every few seconds and constant shake becomes noise (Problem Machine).

### Gaps
- I couldn't access the original talk videos or transcripts, so exact parameter values from Jonasson & Purho and Nijman aren't available. Steve Swink's "Game Feel" book wasn't consulted directly.
- No source documents Stack's exact ripple/glow effect or its pitch scale.

## 5. UI / HUD conventions

### Takeaway
The genre HUD is minimal. TG shows the floor count large at top-left, a score badge at top-right, and 3 hearts for lives, where lost hearts are dimmed to 20% alpha. Text uses a yellow-to-orange gradient fill with a white outline. Tower Bloxx adds population as its main currency/score, 3 lives, and city-mode modes (quick play, time attack, story, party).

### Cited Findings
- TG HUD layout, all sized relative to canvas width:
  - "floor" label at 0.06w font size.
  - Floor number at 0.17w, right-aligned near x = 0.22w.
  - Score badge image 0.35w wide at x = 0.61w, with the score number at 0.06w.
  - 3 hearts at 0.08w each, at x = 0.66w and y = 0.16w; lost hearts use `globalAlpha = 0.2`.
  - Text style: `drawYellowString` uses a gradient from #FAD961 to #F76B1C, a white stroke of 10% of font size, and a custom font "wenxue".
  - Source: [animateFuncs.js `endAnimate`](https://github.com/iamkun/tower_game/blob/master/src/animateFuncs.js), [utils.js `drawYellowString`](https://github.com/iamkun/tower_game/blob/master/src/utils.js)
- TG lives: 3 HP, one lost per fallen block, game over at 0. The first block shows a tutorial overlay and arrow. The game-over modal has "again" and "invite" buttons (asset names `main-modal-again-b.png` and `main-modal-invite-b.png`). — [README](https://github.com/iamkun/tower_game), [assets folder](https://github.com/iamkun/tower_game/tree/master/assets)
- Tower Bloxx:
  - Lives: quick game ends after three missed drops ([Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx)); missing or tumbling a block costs one of three lives ([JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)).
  - Population: it's the currency. Well-built towers hold more residents, and perfect stacks hold the most. Population and score counters are shown. ([JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php))
  - Modes: quick play, time challenge, story (meet population goals for the mayor) and party (up to 4 players) ([JayIsGames](https://jayisgames.com/review/tower-bloxx-deluxe.php)). Achievements, statistics, unlockables and Time Attack are also mentioned ([Pocket Gamer](https://www.pocketgamer.com/tower-bloxx-deluxe/review)).
- City-building mode: towers are placed on a grid with adjacency rules, and the player unlocks larger buildings as population grows. — [Wikipedia](https://en.wikipedia.org/wiki/Tower_Bloxx)

### Inferences
- A population counter that ticks up while residents parachute or umbrella-float into the newly placed floor gives a second, diegetic score feedback channel. This is how Tower Bloxx ties score to visuals. (Inference from review descriptions.)

### Gaps
- No screenshot-level description of the Tower Bloxx HUD layout was found.

## 6. Accessibility and readability on small phone screens

### Takeaway
The game is one-tap, which already works well for accessibility. TG sizes every element relative to canvas width, so it scales to any phone. Standards to follow: touch targets of at least 44×44 CSS px for menu buttons (WCAG 2.5.5), honour `prefers-reduced-motion` (turn off or reduce shake, flashes and parallax), and avoid flashes faster than 3 per second. Keep tower and sky contrast high in dark or night segments, which Stack users explicitly complained about.

### Cited Findings
- WCAG 2.5.5 Target Size: pointer targets should be at least 44 by 44 CSS pixels, with listed exceptions. — [W3C Understanding Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- `prefers-reduced-motion: reduce` detects the OS "reduce motion" setting. Large scaling or panning animations can cause discomfort for people with vestibular disorders. It's Baseline widely available since January 2020. — [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). Querying it from JS with `window.matchMedia('(prefers-reduced-motion: reduce)')` is standard Web API usage; the MDN page itself shows only CSS.
- Stack users report that dark themes make block corners hard to see during long perfect streaks. — [App Store: Stack](https://apps.apple.com/app/stack/id1080487957)
- TG sizes everything (block, rope, HUD fonts, clouds) as fractions of canvas width or height. Gravity is also scaled to canvas height. — [TG index.js](https://github.com/iamkun/tower_game/blob/master/src/index.js), [block.js](https://github.com/iamkun/tower_game/blob/master/src/block.js)

### Inferences
- TG's full-screen white flash (alpha 0.7, 150 ms) should be gated or softened under reduced motion. The 3-flashes-per-second limit is WCAG 2.3.1, which I didn't fetch this session and should be verified. (Inference / unverified.)
- Use a 0..1 shake intensity setting, and set it to 0 when reduced motion is on.

### Gaps
- Apple HIG accessibility page content didn't load, so Apple-specific numbers aren't verified here.
- No genre-specific accessibility study was found.
