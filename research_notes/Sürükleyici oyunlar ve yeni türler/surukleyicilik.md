# Immersion, game feel, and engagement in casual mobile HTML5 games

Scope: research notes on how casual mobile games get a realistic, exciting "feel" and strong engagement. The techniques are aimed at 2D canvas games running in phone browsers. The hub has these games: (a) crane tower stacking, (b) 8x8 block puzzle, (c) Turkish letter-wheel word game, (d) ball/color sort, (e) marble flicking (slingshot), (f) reaction-time duel, (g) raycast horror.

Method note: about 20 searches and fetches. Several primary sources are video talks with no transcript: Nijman's "Art of Screenshake", Jonasson and Purho's "Juice it or lose it", and Eiserloh's GDC 2016 camera talk, which is members-only on GDC Vault. For those I used secondary implementations or summaries, and the notes say so. Anything marked **[Inference]** is my own design reasoning, not a sourced claim.

---

## 1. Game feel and realistic responses (physics motion, hit-stop, camera, particles, 2D lighting, input latency)

### Takeaway
The best-documented, most implementable levers are these:
- Respond to every input within 100 ms. Nielsen's 0.1 s limit is where an interaction feels like direct manipulation.
- Move things with damped springs instead of linear tweens. Use a damping ratio below 1 for bounce and overshoot, and exactly 1 for a clean settle.
- Use trauma-based camera shake: trauma in [0,1], shake = trauma², Perlin noise, linear decay.
- Add a brief hit-stop freeze on impacts. Fighting games freeze for roughly 9 to 14 frames at 60 fps.
- Layer feedback: particles, color flashes, tween scaling, sound, trails, anthropomorphic touches.

Empirical research on "juice" is thin and mixed. Too much juice can hurt the player experience, so tune effects and keep them proportional to the event.

### Cited Findings

**Definitions and framing**
- Swink defines game feel as "real-time control of virtual objects in a simulated space, with interactions emphasized by polish". It has three components: real-time control, spatial simulation, and polish. Polish covers animation, sound, particles, and camera shake. — [Wikipedia: Game feel](https://Www.wikipedia.org/wiki/Game_feel); [kirsturino blog summary of Swink](https://kirsturino.github.io/home/blog/gamefeel1.html); [DiGRA paper](https://dl.digra.org/index.php/dl/article/download/2223/2220/2238)
- I found no verified Swink quote for a specific "100 ms correction cycle". The only 100 ms mention was a blogger's paraphrase saying that losing control for more than about 100 ms can still feel like constant control. Treat it as unverified. — [kirsturino blog](https://kirsturino.github.io/home/blog/gamefeel1.html)

**Response-time limits (HCI)**
- Nielsen's three limits:
  - **0.1 s**: the system feels like it reacts instantly, and this is the limit for feeling like you are directly manipulating UI objects.
  - **1 s**: the user's flow of thought stays intact, but past this point the interface should show that it is working.
  - **10 s**: the limit for keeping attention. Longer waits need a percent-done indicator and a way to interrupt, and are acceptable only at natural breaks.
  — [NN/g, Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- A community-authored guide suggests 50–100 ms for instant UI feedback and 100–200 ms timing for game-feel animations. These numbers are unverified. — [community skill file](https://raw.githubusercontent.com/majiayu000/claude-skill-registry/main/skills/design/gaming-entertainment-dylantarre-animation-principles/SKILL.md)

**Springs and damping (overshoot, inertia, squash and stretch)**
- Damping ratio ζ = c / (2√(k·m)). Below 1 is underdamped and overshoots. Exactly 1 is critically damped, the fastest settle with no overshoot. Above 1 is overdamped. — [Microsoft spring animations docs](https://learn.microsoft.com/en-us/WINDOWS/APPS/develop/composition/spring-animations); [ftui spring.rs](https://docs.rs/ftui-core/0.2.1/ftui_core/animation/spring)
- Android's SpringForce describes the same behaviors:
  - Underdamped (ζ < 1) "overshoot[s] multiple times by passing the rest position".
  - Critical (ζ = 1) returns to rest "within the shortest amount of time".
  - ζ = 0 oscillates forever.
  - Presets are HIGH, MEDIUM, LOW, and NO bouncy for damping, and HIGH, MEDIUM, LOW, and VERY_LOW for stiffness. The defaults are MEDIUM_BOUNCY and STIFFNESS_MEDIUM.
  - The start velocity can come from the touch gesture's velocity through VelocityTracker. This lets motion inherit the finger's inertia.
  — [Android Developers: Spring animation](https://developer.android.com/develop/ui/views/animations/spring-animation)
  - Gap: the fetched page does not list numeric values for these constants.
- One library gives a typical UI stiffness range of 100–400. Common presets are "gentle" (stiffness about 60–120, damping about 14) and "wobbly" (stiffness about 180, damping about 12). Values are library-specific. A damping ratio alone does not fix the timing, because stiffness or response also matters. — [search summary of spring libraries incl. React Native SpringConfig reference](https://cdn.jsdelivr.net/npm/@hegemonart/get-design-done@1.60.4/reference/motion-spring.md); [Demystifying UIKit spring animations](https://medium.com/ios-os-x-development/demystifying-uikit-spring-animations-2bb868446773)
- Jonathan Cooper (*Game Anim*) adapts Disney's 12 principles for games, starting with squash and stretch. He argues they do not map 1:1 onto games because games are interactive. — [Game Developer: 12 principles for game animation](https://www.gamedeveloper.com/game-platforms/12-principles-for-game-animation)
- A counterpoint from UX in Motion: the Disney principles "do not apply to UI animation" because UI solves a different problem. — [Willenskomer, Medium](https://medium.com/ux-in-motion/ui-animation-principles-disney-is-dead-8bf6c66207f9)

**Trauma-based camera shake (Eiserloh, GDC 2016 "Juicing Your Cameras With Math")**
- GDC Vault confirms the talk covers framing, smoothed motion, camera shake, and split-screen. The full talk is members-only. — [GDC Vault](https://www.gdcvault.com/play/1023557/Math-for-Game-Programmers-Juicing)
- The Bevy engine has an official example that credits the talk. Its constants:
  - Trauma decays at 0.5/s, so full trauma reaches 0 in 2 s.
  - Exponent 2, so shake = trauma².
  - MAX_ANGLE is 10°, MAX_TRANSLATION is 20 px, and NOISE_SPEED is 20.
  - Each hit adds 0.4 trauma.
  - Rotation, x, and y each use 1D Perlin noise at offsets t+0, t+100, and t+200, scaled by shake × max.
  - The camera's original transform is restored every frame, so game logic never sees the shake.
  — [Bevy 2d_screen_shake.rs](https://docs.rs/bevy/0.17.3/src/2d_screen_shake/2d_screen_shake.rs.html)
- Other ports use an exponent of 2 or 3, with linear trauma decay. — [Strayspark Godot docs](https://www.strayspark.studio/docs/godot-camera-system/noise-and-shake); [gamejuice screen shake guide](https://gamejuice.pages.dev/articles/screen-shake-guide)

**Nijman, "The Art of Screenshake" (Vlambeer)**
- The roughly 45-minute talk starts from a dull shooter and adds 30 small tweaks. Examples include shaking the screen opposite to the gunfire direction and giving enemies a 33% chance to explode harmlessly on death. — [Game Developer coverage](https://gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games)
- A fan recreation lists "Hit Pause" and "Permanence" among the effects. Permanence usually means debris and corpses stay on screen. That definition is **[Inference]**, because I could not fetch the original explanation. — [DK Liao recreation devlog](https://dkliao.itch.io/the-art-of-screenshake-recreation/devlog)

**Hit-stop (hitlag) durations**
- Hit-stop freezes both attacker and defender when an attack connects. — [Capcom SFV column](https://game.capcom.com/cfn/sfv/column/131545?lang=en)
- Typical values in many fighting games are about 9 frames for light hits, 11 for medium, and 13 for heavy. In SF2 all hits were about 14 frames. At 60 fps that is roughly 150–230 ms. This is a community write-up, not official data. — [critpoints.net](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
- In Smash Bros., hitlag scales with damage dealt. — [SmashWiki: Hitlag](https://ssbwiki.com/Hitlag)

**Juice (Jonasson and Purho, GDC 2012 "Juice it or lose it")**
- They took a boring breakout clone and made it feel good by layering juice, without adding mechanics. — [GDC Vault](https://gdcvault.com/play/1016789/Juice-It-or-Lose)
- University lecture slides list the effects from the talk: color changes, tweening and easing of position, rotation, and scale, random delay, ball trails, screen shake, and anthropomorphizing (eyes, blinking, smiles). — [Uni Bayreuth GxD-10 Game Feel slides](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf); [gamejuice summary](https://gamejuice.pages.dev/articles/juice-it-or-lose-it-lessons)

**Empirical evidence on juice**
- Hicks et al. (DiGRA 2018) built a juicy-design framework from developer interviews. It centers on coherence, unobtrusive communication of game state, and appropriate, direct feedback. — [DiGRA: Good Game Feel](https://dl.digra.org/index.php/dl/article/view/936)
- Hicks's thesis ran user studies (n = 40 on Cuber and Dungeon Descent, n = 32 on Quake 3) and found that "the effects of juiciness are nuanced". Kao (2020) is cited as finding that excessive juiciness can degrade player experience. There is little empirical work overall. — [core.ac.uk thesis/papers](https://core.ac.uk/download/492524999.pdf); [Hicks et al. slides](https://figshare.com/articles/Kieran_Hicks_Kathrin_Gerling_Patrick_Dickinson_-_What_makes_a_Game_Reflections_on_Juiciness_and_Player_Experience_/5147011)

### Inferences
- **[Inference]** Input budget for a canvas game:
  - Use `pointerdown` instead of `click` to avoid the tap delay.
  - Show a visible reaction (a scale pop or flash) and a sound in the same frame as the input.
  - Keep total input-to-photon time under 100 ms to stay inside Nielsen's direct-manipulation limit.
- **[Inference]** Hit-stop for casual games should be shorter than in fighting games, because these are not combat games:
  - About 40–80 ms (2–5 frames) for small impacts.
  - About 100–150 ms for big moments such as a perfect stack or a combo clear.
  - Scale it with event size, the way Smash scales hitlag with damage.
- **[Inference]** Shake should be proportional:
  - Small events add about 0.1–0.2 trauma, big events about 0.4–0.6.
  - Cap translation around 8–20 px on a phone-sized canvas.
  - Always offer a "reduce motion" toggle and respect `prefers-reduced-motion`.
- **[Inference]** 2D lighting tricks can be done with plain Canvas2D:
  - Glow or bloom: draw with `globalCompositeOperation = 'lighter'`, or use `shadowBlur` with `shadowColor`.
  - Soft drop shadows: an offset dark ellipse under each object, scaled with height.
  - Vignette: a radial gradient overlay.
  - Depth of field: blur background layers (`ctx.filter = 'blur(2px)'` on a cached offscreen layer).
  - Parallax: background layers move at 0.2×, 0.5×, and so on of camera motion.
  - None of these came from a specific source in this research.

### Gaps
- I found no transcript for Nijman's 30 tips with exact frame counts. The talk is video-only.
- I could not retrieve Eiserloh's original slides. The trauma numbers come from the Bevy port, which credits the talk.
- I did not fetch Robert Penner's easing equations directly. They are standard (easeOutBack overshoot, easeOutElastic), but no source was retrieved.
- I did not retrieve numeric values for Android's spring constants.
- I found no quantitative study linking a specific latency (for example 50 vs 100 ms) to retention in casual games.

---

## 2. Excitement and tension (near-miss, flow, DDA, streaks, rubber-banding, time pressure)

### Takeaway
- Near-misses reliably raise motivation to keep playing, but mainly when the player feels in control of the outcome (Clark et al., 2009).
- Flow and need-satisfaction research says enjoyment comes from challenge matched to competence.
- Dynamic difficulty adjustment works best when it intervenes "just enough" and stays hidden from the player (Hunicke and Chapman).
- I did not retrieve direct sources for combo, escalation, sudden-death, or rubber-banding parameters. Those recommendations are marked as inference.

### Cited Findings
- Clark, Lawrence, Astley-Jones and Gray, *Neuron* 61(3):481–490 (2009):
  - Near-miss outcomes recruited the same striatal and insula circuitry as wins.
  - Near-misses were rated less pleasant than full misses but increased the desire to play.
  - The effect was limited to trials where the participant had personal control over the gamble.
  - n = 15, non-problem gamblers, fMRI.
  — [PMC2658737](https://pmc.ncbi.nlm.nih.gov/articles/PMC2658737); [Science News](https://www.sciencenews.org/article/gamblers-brains-almost-counts)
- A follow-up study in regular gamblers found that gambling severity predicted a stronger midbrain response to near-misses. — [PMC2929454](https://pmc.ncbi.nlm.nih.gov/articles/PMC2929454)
- Ethical caution: press coverage frames slot near-misses as "perfectly tuned to stoke the addiction". — [Discover Magazine](https://discovermagazine.com/mind/slot-machine-near-misses-are-perfectly-tuned-to-stoke-the-addiction)
- Hunicke and Chapman's Hamlet DDA system (Half-Life engine):
  - It monitors game statistics and uses a probabilistic, inventory-theory approach to decide when the player needs help.
  - It aims to "intervene just enough so that system behavior is relatively stable and predictable".
  - It does not remove negative feedback.
  — [Hunicke & Chapman PDF](https://users.cs.northwestern.edu/~hunicke/pubs/Hamlet.pdf)
- Secondary summary: designers stress hiding difficulty adaptation from players. — [Wikipedia: Dynamic game difficulty balancing](https://en.wikipedia.com/wiki/Rubberband_effect)
- Ryan, Rigby and Przybylski (2006, *Motivation and Emotion*, doi 10.1007/s11031-006-9051-8):
  - Across four studies, satisfying autonomy, competence, and relatedness during play predicted game preference, enjoyment, and intent to keep playing.
  - Frustrating those needs predicts lower persistence.
  - Note: the author is Rigby, not "Rigney".
  — [DOI](https://www.doi.org/10.1007/S11031-006-9051-8); [SDT PENS page](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/)

### Inferences
- **[Inference]** Show near-misses honestly and only where the player has skill-based control:
  - Crane: "2 px off perfect!"
  - Block puzzle: "1 cell from a line clear"
  - Reaction duel: "lost by 12 ms"
  Clark's control finding suggests this raises the urge to retry without needing to fake outcomes. Never rig near-misses in RNG outcomes.
- **[Inference]** Flow and DDA for single-player casual games:
  - Track rolling success rate. After 2–3 consecutive failures, quietly ease difficulty: slightly slower crane swing, friendlier piece RNG, more lenient word-hint timing.
  - Tighten difficulty again during win streaks.
  - Keep the adjustment hidden, per Hunicke.
- **[Inference]** Combos and streaks:
  - The multiplier should rise each consecutive success, for example ×1, ×1.5, ×2, ×3 on perfect stacks.
  - Escalate audiovisual intensity with the combo: higher pitch per step, bigger particles, music layers (see Q4).
- **[Inference]** For versus modes (the duel), close-score visibility and a short sudden-death round create tension. Rubber-banding should be light so skill still decides the winner, consistent with the competence need in SDT.

### Gaps
- I did not fetch Csikszentmihalyi's primary flow text or a channel diagram source.
- I found no source with specific combo-window timings, time-pressure curves, or rubber-banding coefficients for casual games.
- I found no peer-reviewed study of near-miss effects in non-gambling casual games.

---

## 3. Retention and meta systems

### Takeaway
- Top-grossing casual puzzle games almost all add meta layers: renovation or construction, season passes, daily jackpot events, and leaderboard events with milestone rewards.
- The best public causal data on streaks comes from Duolingo, and it is company-reported: the streak wager gave +14% D7 retention, and separating the daily goal from the streak gave +3.3% D14.
- SDT research supports systems that build competence (clear progress) and autonomy (meaningful choices).
- Most of these can run offline on localStorage: XP and levels, unlocks, daily missions, local streaks, achievements, collections, and a personal-best "ghost" leaderboard.

### Cited Findings
- GameRefinery figures (US iOS top-100 grossing, 2021–2022 data):
  - About 70% of Match-3 games had meta elements.
  - Construction meta appeared in 49% of Match-3 games, up from 7% six years earlier.
  - All of the 100 top-grossing casual games from the previous two years used renovation items.
  — [GameRefinery Casual Snapshot March 2022](https://www.gamerefinery.com/casual-gaming-trends-snapshot-report-march-2022/); [PocketGamer.biz on GameRefinery](https://www.pocketgamer.biz/casual-games-features-gamerefinery/)
- Season or battle passes are heavily used in Match-3. Sensor Tower cites Candy Crush Saga and Gardenscapes as adopting them. — [GameRefinery puzzle report](https://www.gamerefinery.com/puzzle-game-features-genre-report/); [PocketGamer.biz](https://www.pocketgamer.biz/casual-games-features-gamerefinery/)
- Daily jackpot or streak events, such as Royal Match's Lava Quest, are now in "almost every top casual puzzle title". Leaderboard events with milestone rewards are common. — [Naavik: live ops trends in mobile puzzle](https://naavik.co/digest/live-ops-trends-powering-mobile-puzzle/)
- Duolingo streak data (company-reported):
  - Streak Wager: significant gains in D1, D7, and D14 retention, with the largest at D7 (+14%).
  - Decoupling the daily goal from the streak: +3.3% D14 retention.
  - Correlational: learners who reach a 7-day streak are 2.4× more likely to return the next day.
  - Streak Freeze lets users skip a day. No isolated retention number was published for it.
  — [Duolingo blog: how streak builds habit](https://blog.duolingo.com/how-duolingo-streak-builds-habit); [Duolingo blog: improving the streak](https://blog.duolingo.com/improving-the-streak); [Lenny's Newsletter](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- SDT and PENS: need satisfaction (competence, autonomy, relatedness) predicts motivation to keep playing. A validation study found competence and intuitive controls loading as one construct. — [DOI](https://www.doi.org/10.1007/S11031-006-9051-8); [game-evaluation PENS](https://game-evaluation.github.io/questionnaires/repository/pens.html)

### Inferences
- **[Inference]** Offline-feasible kit on localStorage, with every read and write wrapped in try/catch:
  - **Hub-wide XP and level**, with a progress bar after every game. This builds competence through visible progress.
  - **Daily missions**: 3 per day, seeded by date so they are deterministic, for example "Get 3 perfect stacks".
  - **Daily streak** with one free "freeze" per week, copying Duolingo's design.
  - **Achievements and collection**, such as ball skins, marble types, and word-collection books.
  - **Cosmetic unlocks** bought with soft currency. This supports autonomy through choice.
  - **Personal-best ghost**: show the best previous run or reaction time as a line or marker to beat.
  - **"Daily challenge" seed**: everyone gets the same puzzle each day. This works without a server, and players can share result emoji grids, Wordle-style.
- **[Inference]** Real friend or global leaderboards and season passes need a backend or a shared store. Offline, approximate them with local seasons (a 30-day track of cosmetic rewards) and simulated rivals. If rivals are simulated, label them as bots so you don't deceive players.

### Gaps
- I found no current (2025–2026) GameRefinery adoption percentage for season passes in casual puzzle games. Their figures are from 2021–2022 and US iOS.
- I found no Deconstructor of Fun or GameAnalytics retention benchmarks (D1, D7, D30) in this pass.
- I found no causal data on friends-vs-global leaderboard effects.

---

## 4. Audio and haptics for immersion

### Takeaway
- Adaptive music through vertical layering lets intensity follow game state: synchronized stems are added or removed for progress, location, or intensity.
- On the web, everything must start after a user gesture, because AudioContext autoplay rules apply.
- Haptics use `navigator.vibrate(ms | pattern)`. The API has "limited availability", and iOS Safari support is not confirmed here, so design haptics as optional.

### Cited Findings
- Winifred Phillips (GDC 2021) on vertical layering:
  - Several synchronized audio files play at once, and "interactivity is achieved through the independent manipulation of the layers".
  - In Spyder, layers were added as mission progress grew, when entering new areas, and to raise or lower intensity.
  - Sackboy used a six-layer system responding to gameplay.
  - Write each layer so it works in multiple combinations, start sparse, and build up as tension grows.
  — [Game Developer: Pure vertical layering](https://www.gamedeveloper.com/game-platforms/pure-vertical-layering-for-game-music-composers-from-spyder-to-sackboy-gdc-2021-)
- Horizontal resequencing reorders music segments (loop, branch, transition) for big moments such as victory or defeat. Hybrids are common: Sackboy layers a success melody on top of horizontal segments. — [Game Developer: Hybrid horizontal/vertical](https://www.gamedeveloper.com/game-platforms/hybrid-horizontal-vertical-structure-for-game-music-composers-from-spyder-to-sackboy-gdc-2021-); [Game Developer: Horizontal resequencing](https://www.gamedeveloper.com/audio/horizontal-resequencing-and-dynamic-transitions-for-game-music-composers-from-spyder-to-sackboy-gdc-2021-)
- Web audio autoplay rules (MDN):
  - Starting Web Audio outside a user-input handler is subject to autoplay rules.
  - Audio is generally blocked until the user interacts with the page.
  - `navigator.getAutoplayPolicy("audiocontext")` returns "allowed", "allowed-muted", or "disallowed".
  - Firefox blocks Web Audio until sticky activation by default.
  - Standard practice is to call `audioCtx.resume()` inside a gesture handler.
  — [MDN: Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- Vibration API (MDN):
  - `navigator.vibrate(200)` gives a single pulse. `navigator.vibrate([200,100,200])` alternates vibrate and pause.
  - `vibrate(0)` cancels a running pattern.
  - MDN labels it "Limited availability" and says it "does not work in some of the most widely-used browsers".
  — [MDN: Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

### Inferences
- **[Inference]** For a light Web Audio layering setup:
  - Load 3–4 loop stems (pad, percussion, bass, lead) of equal length.
  - Start them all at the same `AudioContext.currentTime` through their own GainNodes.
  - Ramp each gain with `linearRampToValueAtTime` over about 0.5–1 s as intensity rises (combo, tower height, timer under 10 s, heartbeat in horror).
  - Ducking: briefly lower the music bus gain (for example by about 6–10 dB for 150–300 ms) under big SFX or voice stings.
  - Spatial cues: `StereoPannerNode` tied to the object's x position, or `PannerNode` in the raycast horror game.
- **[Inference]** Layered SFX: build each impact from 2–3 parts (transient click, body thump, tail or sparkle), and randomize pitch by about ±5% so repeats don't sound identical. Raise pitch with combo count.
- **[Inference]** Haptic vocabulary (Android only, feature-detect with `'vibrate' in navigator`, user toggle):
  - Tap: 10–15 ms.
  - Placement: 20–30 ms.
  - Perfect or combo: [20, 40, 30].
  - Fail: [60, 50, 120].
  - Horror heartbeat: [40, 120, 60] repeating.
  - Do not vibrate continuously.

### Gaps
- MDN's compatibility table did not render, so I could not confirm iOS Safari's lack of `navigator.vibrate` from a source. Commonly known, but verify on caniuse or MDN BCD.
- I found no sourced dB values for ducking or sourced haptic durations.

---

## 5. Per-game suggestions (all marked inference unless cited)

### Takeaway
Each game gets the same three upgrades, applied to its main moment:
1. Instant (under 100 ms), physical-feeling responses to input.
2. A visible near-miss or perfect signal that rewards skill.
3. Escalation that the player can see and hear: combos, stacking music layers, and growing stakes.

### Cited Findings
- Base principles, cited above:
  - 0.1 s response limit — [NN/g](https://www.nngroup.com/articles/response-times-3-important-limits/)
  - Trauma shake parameters — [Bevy](https://docs.rs/bevy/0.17.3/src/2d_screen_shake/2d_screen_shake.rs.html)
  - Hit-stop frames — [critpoints](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
  - Near-miss under player control — [Clark et al. 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2658737)
  - Vertical layering — [Phillips](https://www.gamedeveloper.com/game-platforms/pure-vertical-layering-for-game-music-composers-from-spyder-to-sackboy-gdc-2021-)
  - Spring velocity inheritance — [Android](https://developer.android.com/develop/ui/views/animations/spring-animation)
  - Streak and freeze — [Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit)

### Inferences

**(a) Crane tower stacking**
- **[Inference]** The hanging block swings as a damped pendulum or spring.
- **[Inference]** On landing:
  - Squash the block (scaleY about 0.85, scaleX about 1.1), then spring back with ζ of about 0.4–0.6.
  - Hit-stop of 60 ms.
  - Dust particles at both edges.
  - Trauma +0.15, or +0.35 on a perfect drop.
- **[Inference]** Perfect stacks (within about 3 px): build a chain with rising pitch, a gold flash, and the block regrowing slightly.
- **[Inference]** Show the near-miss overhang in pixels.
- **[Inference]** Camera:
  - Ease the camera up with a spring.
  - Parallax sky layers: clouds, then birds, then the city, revealed as the tower rises.
  - Wind gusts at height raise the stakes.
  - Music layers add one stem every 10 floors.
- **[Inference]** Tower wobble: if the cumulative offset is high, the tower visibly sways (a spring on the whole stack). This creates tension.

**(b) 8x8 block placement**
- **[Inference]** The picked-up piece lifts: scale 1.08, drop shadow offset, follows the finger with a slight lag spring.
- **[Inference]** The placement preview ghost lights up the rows and columns that would clear.
- **[Inference]** Line clears:
  - Cells pop in sequence with a 20–30 ms stagger from the placement point outward.
  - Hit-stop of 80 ms on a multi-line clear.
  - Shake scales with line count.
  - Combo counter across consecutive placements that clear.
- **[Inference]** Near-miss: on game over, highlight "1 move left" or the spot where a piece would have fit.

**(c) Turkish word wheel**
- **[Inference]** Letters snap to the drag path with spring scaling.
- **[Inference]** The connecting line glows (shadowBlur).
- **[Inference]** Each added letter plays a rising musical note, so a correct word ends on a resolved chord.
- **[Inference]** Found words fly into the grid along a curved path with easeOutBack overshoot.
- **[Inference]** Wrong words get a horizontal shake of the input (about 3 oscillations, 250 ms) and a soft buzz.
- **[Inference]** Bonus words feed a collection book (meta). Add a daily puzzle seeded by date.

**(d) Ball/color sort**
- **[Inference]** The lifted ball arcs (parabola) and squashes on landing.
- **[Inference]** A ball dropping into a tube makes a glass "clink" with pitch based on fill height.
- **[Inference]** A completed tube shimmers with a confetti burst and a celebratory layer.
- **[Inference]** Add an optional move limit or timer mode for tension.
- **[Inference]** Undo is limited and earned, which turns it into a risk/reward choice.

**(e) Marble flicking (slingshot)**
- **[Inference]** Pull-back:
  - The band stretches, and pitch and tension sound rise with pull distance.
  - A predictive dotted trajectory shows the first 0.3 s only.
  - Haptic tick every 10% of pull.
- **[Inference]** Release:
  - The marble inherits flick velocity.
  - Motion trail.
  - Collision hit-stop of 40–100 ms scaled by impulse.
  - Spark particles.
  - Shake scaled by impulse.
  - Slight slow-mo on the final decisive hit.
- **[Inference]** Show a "near-miss" text when the marble passes within a radius of the target.

**(f) Reaction-time duel**
- **[Inference]** Build anticipation:
  - Randomize the delay before "GO" (for example uniform 1.5–4 s).
  - Low drone and heartbeat that speeds up.
  - Slight vignette tightening.
- **[Inference]** On "GO": a full-screen flash and a sharp transient. Input must be read with `pointerdown` and `performance.now()`.
- **[Inference]** Show the result in milliseconds, with the gap to the opponent ("won by 12 ms"). Freeze-frame with a zoom punch on the winner.
- **[Inference]** Best-of-5 with a sudden-death tiebreaker. Penalize false starts with a visible penalty.
- **[Inference]** Personal-best ghost marker and a local rival list.

**(g) Raycast horror** (not requested in detail)
- **[Inference]** Vertical-layered dread music driven by distance to the threat.
- **[Inference]** PannerNode for footsteps.
- **[Inference]** Heartbeat haptic on Android.
- **[Inference]** Vignette and grain overlay.

### Gaps
- None of the per-game parameters above come from published sources for these specific genres. They are design inferences that need A/B testing or playtesting in the hub.
