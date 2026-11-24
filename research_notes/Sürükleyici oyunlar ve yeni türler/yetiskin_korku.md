# Adult-rated (PEGI 18 / ESRB M) horror: techniques for sustained fear, and what can be built in a Canvas 2D + Web Audio raycaster on phones

Context: the current game is a procedural dark maze with a battery flashlight, 5 pages plus an exit, a 2D billboard stalker that teleports behind the player and chases via BFS, static when the player looks at it, heartbeat/breathing/footstep samples, and one jump-scare face on capture. Players call it "childish". Notes are in English; the final report will be in Turkish. Anything not directly sourced is marked as an inference.

## 1. What makes horror feel adult rather than childish (themes, environmental storytelling, realism, restraint, rating criteria)

### Takeaway
The developers cited here locate adult horror in **uncertainty, vulnerability and imagination**, not in more monsters or louder scares: hide information, keep the threat off-screen, ground it in mundane, real-feeling spaces and remove player power. Ratings work differently. PEGI 16 already covers "intense and sustained horror", and **PEGI 18 is triggered by gross violence, motiveless killing or violence against defenceless characters**, not by the scariness itself. So "adult" tone comes from restraint and realism, and the rating level comes from how violence is depicted.

### Cited Findings
**Rating definitions**
- PEGI 16 applies when violence "reaches a stage that looks the same as would be expected in real life". PEGI 18 applies when "the level of violence reaches a stage where it becomes a depiction of gross violence", or involves apparently motiveless killing or violence towards defenceless characters. — [PEGI: What do the labels mean](https://www.pegi.info/what-do-the-labels-mean)
- The PEGI "Horror" descriptor covers moderate horror (PEGI 12) or "intense and sustained (PEGI 16) horror sequences". The "Fear" descriptor is for PEGI 7 content frightening to young children. PEGI has no separate horror threshold for 18. — [PEGI](https://www.pegi.info/what-do-the-labels-mean); the absence of an 18-specific horror criterion is also noted in a search summary of several secondary sources (askaboutgames, Wikipedia)
- Other PEGI 18 triggers: glamorised illegal drugs, simulated gambling, explicit sex, and discrimination likely to encourage hatred. The PEGI page also reports that since June 2026, gameplay built around crypto/NFTs or unrestricted communication triggers 18. — [PEGI](https://www.pegi.info/what-do-the-labels-mean) (this item comes from the page summary and was not cross-checked)
- ESRB Mature 17+: "Content is generally suitable for ages 17 and up", and may contain intense violence, blood and gore, sexual content or strong language. Blood and Gore = "Depictions of blood or the mutilation of body parts". Intense Violence = "Graphic and realistic-looking depictions of physical conflict". — [ESRB Ratings Guide](https://www.esrb.org/ratings-guide/)

**Design philosophy (Frictional / Amnesia)**
- Thomas Grip: "Horror is built upon the imagination." "Horror should feel real, not actually be real." "Sometimes, making something game-y just destroys the feeling that you're after." — [Game Developer: Amnesia's Sanity Meter deep dive](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-)
- Grip removed printed numbers from the sanity system. Exact metrics encouraged tactical play, while horror needs "panicky, less informed reactions". Showing sanity only in the inventory created an "informational gap" that made it "harder to feel safe". On players: "the lack of information made them more frightened about it." — [same](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-)
- The sanity meter has no actual fail state, and Frictional deliberately hid that fact. — search summary of the [Game Developer deep dive](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-) / Ars Technica coverage
- One of Amnesia's first design principles was no weapons. Traditional death penalties were also removed, late in development. — [Game Developer: GDC Europe, Grip on immersion](https://gamedeveloper.com/business/gdc-europe-i-amnesia-i-s-grip-delivers-terrifying-tales-of-immersion) (via search summary)
- Grip (2014): designing for fun first "will destroy the horror element". — search summary (PC Gamer / Game Developer interviews listed in [search results](https://www.pcgamer.com/au/somas-designer-on-the-exorcist-of-video-games-and-the-future-of-horror)); exact source not verified

**Alien: Isolation**
- Al Hope: "Horror, in large part, is about not knowing, about the mystery of what's behind the next corner." The team explicitly did not want a game of cheap scares. — [Game Developer: Fear in unpredictability](https://www.gamedeveloper.com/design/fear-in-unpredictability-i-alien-isolation-i-s-brand-of-survival-horror)
- Playtesters were more anxious when they could not see the alien. The creature "didn't need to be on the screen the entire time". — [same](https://www.gamedeveloper.com/design/fear-in-unpredictability-i-alien-isolation-i-s-brand-of-survival-horror)
- Ordinary-person grounding: the team brainstormed how real people would behave if hunted in an office (hide, sneak between desks, stay quiet). Ammunition is scarce, so there is no power fantasy. Saving takes time and leaves the player exposed. — [same](https://www.gamedeveloper.com/design/fear-in-unpredictability-i-alien-isolation-i-s-brand-of-survival-horror)

**Resident Evil 7**
- Koshi Nakanishi: the scariest moments are small and unexpected, such as startling at your own shadow around a corner or hearing a branch snap behind you. These ideas were reused in the game. The team scouted real Louisiana locations and filmed haunted places in Osaka with a GoPro, which inspired the found-footage approach. — [Game Developer: How RE7's devs cultivated horror from reality](https://gamedeveloper.com/design/how-i-resident-evil-7-i-s-devs-cultivated-horror-from-reality)
- The switch to first person was meant to heighten immersion and "bring the player closer to this horror". The GDC 2017 talk was "Reliving the Horror: Taking RE7 Forward by Looking Back" (Nakanishi & Fabiano). — [Invenglobal](https://www.invenglobal.com/articles/1270/horror-reimagined-why-resident-evil-7-had-to-get-rid-of-zombies), [Game Developer video](https://gamedeveloper.com/design/video-reliving-the-horror-taking-i-resident-evil-7-i-forward-by-looking-back)

**P.T.**
- Academic analysis (Press Start journal): the looping, mundane hallway is the main source of P.T.'s psychological discomfort, read through Freud's uncanny. The dread comes from familiarity, not gore. — [Press Start](https://press-start.gla.ac.uk/index.php/press-start/article/download/121/78)
- Kojima wanted P.T. to be a mystery to make it more frightening. — [Wikipedia: P.T.](https://en.wikipedia.com/wiki/P.T._(demo)) (secondary source)
- Data-mining found the hallway reshapes itself around the player, and that Lisa is always present in the game's data, attached to the player and kept just off-screen until key moments. — [Game Developer: camera hack](https://gamedeveloper.com/game-platforms/camera-hack-reveals-i-pt-i-s-ghost-is-legitimately-always-just-offscreen), [Kotaku](https://kotaku.com/p-t-hacker-is-still-finding-gruesome-secrets-1838489446)

**Outlast**
- The protagonist is defenceless and can only hide, avoid or run. The camcorder's night vision drains batteries ("Things are truly scarier in the dark"). Graphic capture cutscenes (losing fingers) add stakes. The article contrasts Outlast's realistic threats, grim plot and psychological fear with monster-based scares. — [Game Developer: Creating suspense, an Outlast case study](https://gamedeveloper.com/production/creating-suspense-in-video-games-an-outlast-case-study)
- Red Barrels cites Amnesia and found-footage films (REC, Quarantine) as influences. — search summary ([Wikipedia: Outlast](https://en.wikipedia.com/wiki/Outlast), secondary)

**Silent Hill**
- At GDC, Yamaoka tied the heavy fog to a grounded, psychologically uneasy horror he called a Japanese approach. — [GameSpot: GDC session, the dark spirit of Silent Hill](https://www.gamespot.com/articles/gdc-session-the-dark-spirit-of-silent-hill/1100-6120347/)

### Inferences
- (Inference) The "childish" impression likely comes from: (a) the monster being fully visible and readable (a billboard sprite plus a deterministic teleport-behind pattern is predictable, which Hope says "destroys the fear"); (b) a single loud face jump scare as the only payoff; (c) a gamey loop (collect 5 pages) with no fiction or environmental story; (d) clean, abstract maze walls with no sign of real human presence.
- (Inference) Mature tone without a PEGI 18 gore budget: imply violence instead of showing it, through drag marks, a smeared handprint, a shoe left in a corridor, a voice recorder that cuts off, scratched tallies, or a locked door with something banging behind it. This keeps the experience "intense and sustained horror" (PEGI 16 territory) while feeling adult. Showing gross violence against defenceless characters would push toward 18, which is a deliberate choice, not a requirement for adult tone.
- (Inference) Replace the 5 "pages" with diegetic notes from a previous victim whose handwriting deteriorates (note 1 is calm, note 5 is frantic), so the collectibles carry a story arc. This is an environmental-storytelling device inspired by the found-footage approach, not a copy of any character.
- (Inference) Like P.T., the procedural maze can mutate behind the player (re-roll a wall cell outside the view frustum) to create uncanny "it changed" moments cheaply in a raycaster.

### Gaps
- I did not fetch Frictional's blog ("Useful Tips for Horror Game Designers", with Chris Pruett) directly. Its claims appear only via search snippets.
- I did not obtain the RE7 GDC talk transcript, so the Jack Baker design rationale is unverified.
- I found no developer source specifically on "blood writing on walls" as a technique. Treat it as a genre convention (inference).

## 2. Enemy design that terrifies (unpredictable AI, senses, hiding, chases, uncanny movement)

### Takeaway
Alien: Isolation's two-layer AI is the most documented model and maps well onto a BFS stalker. A **director** that always knows where the player is but only sends the monster to the *general area*, a **monster** with real senses (vision cones that build up over time, sound strength levels, memory decay), and a **menace gauge** that sends it backstage when pressure peaks. Hiding with a capture risk, and chases where exits are blocked, are the core of Outlast's suspense.

### Cited Findings
- **Two brains:** The director knows the positions of the alien and the player at all times. It periodically sends the alien toward the player's *general area* but never gives the exact location, so the alien still has to find the player with its own senses. A behaviour tree with 36 root branches runs moment-to-moment actions (search corridors, investigate noises, search lockers, enter vents). — [Game Developer: Revisiting the AI of Alien: Isolation](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Menace gauge:** It rises while the alien is near the player, at different rates depending on proximity and on whether the player can hear or see the alien. When it peaks, the alien withdraws "backstage" (into the vents) for a while. Tunables: the cooldown before the alien can return, the time to peak, and the number of menaces allowed per front-stage sequence. The article gives no numeric values. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Front-stage / backstage:** Sweep duration and distance are randomised within designer-set ranges. Backstage, the alien moves invisibly through vents, idles, and can set timed ambushes. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Vision:** Four view cones (normal, focused, peripheral, close). A sensor value builds up the longer the player stays inside a cone. Light and smoke modify visibility. Turning on the flashlight while hidden gets the player spotted "almost immediately". — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Hearing:** Sounds have strength levels. Weapon fire and impacts trigger much faster than movement, and movement is split into crouch, walk and run. Loud sounds can pull the alien out of the vents. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Memory decay:** Sensor readings fade over time, so the alien can forget the player. The search radius shrinks on each pass around a sound source. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Learning:** The alien records flamethrower encounters and changes tactics afterward (hissing, then vent ambushes, then flanking). — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Difficulty:** Higher difficulty means less backstage time, longer menace durations and a smaller patrol region around the player. On Novice, vision and movement-sound response drop by over a third. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Hiding:** Many crawlspaces are designed so the alien cannot see the player, or has a much lower chance of doing so. Opening and closing lockers or doors has no effect on the alien. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Honest audio:** Vent sounds are real. They are positioned at the alien's actual current location. — [same](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- **Unpredictability:** "the alien couldn't run under any prescribed path or pattern". "If you can predict what it's going to do moment to moment, that destroys the fear, and the tension evaporates." — Al Hope, [Game Developer](https://www.gamedeveloper.com/design/fear-in-unpredictability-i-alien-isolation-i-s-brand-of-survival-horror)
- **Outlast hiding and chases:** The player hides in lockers or under beds and peeks through doorframes. Reaching an exit sign does not end the threat: exits are often locked or blocked, so the player must find alternate routes (ceilings, hidden doors, mini puzzles). Enemies can capture the player and carry them further from the exit. — [Game Developer: Outlast case study](https://gamedeveloper.com/production/creating-suspense-in-video-games-an-outlast-case-study)
- A 2013 preview describes Outlast's pursuers as "slow but relentless" and notes they can check hiding spots and pull the player out. Reviewers describe watching pursuers either stalk past or suddenly spot you. — search summaries of [CGMagazine preview](https://www.cgmagonline.com/articles/previews/outlast-e3-2013-preview/) and [PC Gamer review](https://pcgamer.com/outlast-review)
- **P.T.:** The ghost is kept just off-screen, attached behind the player, and is revealed at key moments (for example, the player's shadow becomes hers). — [Game Developer](https://gamedeveloper.com/game-platforms/camera-hack-reveals-i-pt-i-s-ghost-is-legitimately-always-just-offscreen), [Kotaku](https://kotaku.com/p-t-hacker-is-still-finding-gruesome-secrets-1838489446)

### Inferences
- (Inference) A concrete port for the BFS stalker:
  - Director tick: every 8–15 s (randomised), choose a target cell near the player, not on the player. For example, a random cell within BFS distance 3–6, so the stalker searches instead of homing.
  - Monster states: `backstage` (invisible; heard only through walls), `search` (walk to the director's cell, then random-walk with a shrinking radius), `investigate` (move to the last heard noise), `hunt` (has seen the player; follow BFS to the last *seen* position, not the live position), and `retreat`.
  - Vision: a raycast line-of-sight check plus a sensor that fills at about 0.5–1.0/s inside the cone, faster when the flashlight is on and facing the monster, slower in the peripheral cone. The monster commits to a chase only above a threshold (for example 1.0). Decay at about 0.2/s. All numbers are tuning suggestions, not sourced values.
  - Hearing: player sprint footsteps get radius ~8 cells, walking ~3, crouch ~1. Dropping or knocking items is louder.
  - Menace gauge: +X/s while the monster is within N cells, double if it is visible or audible to the player. At max, force `retreat` to backstage for a 20–45 s cooldown (inference, aligned to the L4D relax window in section 3).
- (Inference) Replace "teleports behind the player" with: it only appears behind the player when the player is not looking (outside the FOV); there is an audible tell before it moves; and it is used rarely, gated by the director. Predictable teleporting reads as a game rule, not a hunter.
- (Inference) **Hiding:** add lockers or under-bed cells. Inside, the player sees through slats (a narrow vertical band viewport), and a "hold breath" button suppresses breathing sounds, drains a short meter and causes a gasp when released. If the monster's sensor exceeds a lower threshold while it is adjacent, it pulls the player out. Hiding must be unreliable (Outlast) but reliable enough to be worth it.
- (Inference) **Sprint/stamina:** sprint makes the player louder (alerting the stalker), causes heavier breathing and adds camera shake. Running out of stamina gives a ragged-breath audio cue and a slowdown. This converts a resource into fear (similar logic to the Outlast camcorder battery).
- (Inference) **Uncanny movement in a billboard raycaster:** stepped "frame-skipping" sprite updates (hold a frame for 150–300 ms, then jump), sprite height 1.3–1.6× player height so the head is cropped by the ceiling when close, a crawling variant (low sprite, fast lateral movement), and standing completely still at the end of a corridor when the flashlight hits it, then gone on the next flicker. These are design inferences, not sourced techniques.
- (Inference) **Honest audio** (from Alien: Isolation): never play stalker footsteps that are not tied to its real position. Fake sounds should be clearly ambient (the building settling), so players trust audio as information.

### Gaps
- No public numeric values for Alien: Isolation's menace thresholds or cooldowns were found.
- I did not obtain the Outlast 2 chase level-design article in full ([Game Developer: The art of the chase](https://gamedeveloper.com/audio/the-art-of-the-chase-level-design-and-player-orientation-in-i-outlast-2-i-)). It reportedly covers player orientation during chases, which matters for a maze.
- I found no developer source on "stuttering animation" as an uncanny technique. That item is an inference.

## 3. Pacing: tension/release cycles, escalation over 2–3 minutes, false scares, safe moments

### Takeaway
The Left 4 Dead AI Director is the only source found with **concrete timings**. An intensity value rises from damage and threats and decays when not engaged. Above a peak threshold the director sustains full threat for **3–5 s**, fades, then holds a **30–45 s Relax** with minimal threats before resuming Build Up. Valve says it adjusts pacing (frequency), not difficulty (amplitude). Alien: Isolation applies the same idea to a single monster through the menace gauge's retreat-to-vents.

### Cited Findings
- **L4D intensity estimate:** It increases when the survivor is injured (proportional to damage), incapacitated, or pulled off a ledge, and when a nearby Infected dies (inversely proportional to distance). It decays toward zero over time, but **not** while Infected are actively engaging the survivor. The director tracks the maximum across survivors. — [Michael Booth, "The AI Systems of Left 4 Dead", Valve 2009 (slides PDF)](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
- **States:** Build Up (full threat population until intensity crosses the peak threshold), then Sustain Peak ("Continue full threat population for 3-5 seconds after Survivor Intensity has peaked"), then Peak Fade (minimal threats, waiting until intensity decays out of peak range and a natural break in the action occurs), then Relax ("Maintain minimal threat population for 30-45 seconds, or until Survivors have traveled far enough toward the next safe room, then resume Build Up"). — [Booth slides](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
- During Relax: no wanderers until the team is calm, no mobs, no new specials. — [Booth slides](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
- "Algorithm adjusts pacing, not difficulty — Amplitude (difficulty) is not changed, frequency (pacing) is." The survivor intensity estimate is "crude", yet the resulting pacing works. — [Booth slides](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
- The pacing is inspired by observed peaks and valleys in Counter-Strike: "Unpredictable peaks and valleys of intensity create a powerfully compelling and replayable experience." — [Booth slides](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
- Valve's L4D2 scripting exposes a BUILD_UP minimum duration (default reported as 15 s) and RelaxMinInterval/RelaxMaxInterval settings. — [Valve Developer Wiki: L4D2 Director Scripts](https://developer.valvesoftware.com/wiki/L4D2_Director_Scripts) (via search summary; values not directly verified on page)
- Alien: Isolation: when the menace gauge peaks, the alien retreats backstage for a cooldown. Higher difficulty shortens backstage time. — [Game Developer](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- RE7: small, unexpected moments (your own shadow, a branch snapping) are among the scariest. These are effectively false scares. — [Game Developer](https://gamedeveloper.com/design/how-i-resident-evil-7-i-s-devs-cultivated-horror-from-reality)
- Amnesia used scripted "insanity drop" events (for example, a door swinging open unexpectedly) with a pulse effect and a specific sound. — [Game Developer: sanity meter](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-)
- Alien: Isolation makes even the "safe" act of saving tense, because the save machine takes time and leaves the player exposed. — [Game Developer](https://www.gamedeveloper.com/design/fear-in-unpredictability-i-alien-isolation-i-s-brand-of-survival-horror)

### Inferences
- (Inference) **A 2–3 minute session plan** (scaled down from L4D's 30–45 s relax, since the session is short):
  - 0:00–0:30: no monster. Ambient sound only, plus one false scare (a door slam far away, or a light bursting), and an environmental story beat (the first note).
  - 0:30–1:00: Build Up. Stalker sounds come through walls (backstage), and the radio/static tell increases.
  - First encounter around 1:00: a short glimpse or chase. Sustain about 3–5 s after the menace peak, then retreat.
  - Relax for about 15–25 s, a shortened L4D relax. Include a "safe room" cell (a lit closet with a working lamp, where the heartbeat slows) that is not totally safe: once, late, the light flickers there.
  - From page 3: shorter relax, longer menace, smaller patrol radius (Alien: Isolation's difficulty knobs).
  - Final pages and the exit run: sustained chase with the exit blocked once (Outlast). Reroute to a second exit.
- (Inference) Implement an `intensity` value: + on monster seen, + on monster within N cells, + on chase, + on a scare event. Decay about 5–10%/s only when the monster is not engaging. Gate director spawns and scare events on intensity being low (Build Up) or after relax.
- (Inference) **False scares:** throttle them (for example, at most one per 30 s) and fire them only in low-intensity phases, so they reset the player's guard rather than stacking on a chase.
- (Inference) **Foreshadowing:** show the stalker's silhouette at the far end of a long corridor early (from about 8+ cells away, where the flashlight barely reaches). It vanishes when the light flickers. This promises a threat before it is used.

### Gaps
- No published Alien: Isolation timing values. No developer data on optimal scare frequency for 2–3 minute mobile sessions.

## 4. Audio for adult horror, and how to build it with Web Audio

### Takeaway
Adult horror audio relies on **high dynamic range** (long quiet stretches, then loud), **honest, positional threat audio**, **layered adaptive music driven by threat/stealth parameters**, and **ambiguous noise** (Silent Hill's radio static) that signals danger without showing it. Web Audio provides the needed building blocks: PannerNode (HRTF), ConvolverNode with a generated impulse response, plus gain automation for layering and silences.

### Cited Findings
- Alien: Isolation sound designers aimed for "a very high dynamic range" in the mix, and the sound engine had to respond to the unscripted alien. The engine played about 100 voices at once. — search summary of [Audio Technology: Listen or Die](https://audiotechnology.audiotechnology.com/features/listen-or-die) (page returned 403 on direct fetch; only search-extracted content used)
- Alien: Isolation music: audio lead James Magee describes parameters such as Stealth and Threat, plus an obstructed-distance-to-alien value. Tracks were composed vertically (in layers) so suspense rises as the threat nears or becomes aware of the player. In a locker, music is near-ambient while the alien is distant, and high strings come forward as it passes. — search summary of [Audio Technology](https://audiotechnology.audiotechnology.com/features/listen-or-die) / [The Sound Architect](https://www.thesoundarchitect.co.uk/alienisolation/) (not directly fetched)
- The motion tracker makes noise only within a very short radius, so it matters only when the alien is very close. Vent sounds are positioned at the alien's real location. — [Game Developer](https://www.gamedeveloper.com/design/revisiting-the-ai-of-alien-isolation)
- Silent Hill: Yamaoka used radio static, a sound players don't instinctively associate with danger, to signal nearby enemies. — [GameSpot GDC session](https://www.gamespot.com/articles/gdc-session-the-dark-spirit-of-silent-hill/1100-6120347/). His sound drew on industrial textures and mechanical noise that often "barely sounded like music". — [NME](https://www.nme.com/?p=3959312)
- A less authoritative developer blog argues loud static can mask the monster's real sound, which makes its location harder to judge. — [deepwavegame blog](https://deepwavegame.github.io/news/sound-of-silent-hill-akira-yamaoka-industrial-dread) (informal)
- Amnesia: a recorded egg-shell-cracking sound plays during sanity drops and worsens over time. Some players modded it out, which shows that unpleasant audio has to be tuned. — [Game Developer](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-)
- **Web Audio PannerNode:** `panningModel` "HRTF" or "equalpower" (spec default "HRTF"); `distanceModel` linear/inverse/exponential (default "inverse"); `refDistance` 1; `maxDistance` 10000; `rolloffFactor` 1; cone angles 360; `coneOuterGain` 0. Position is an AudioParam (`positionX.value` etc.). — [MDN PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode) (some defaults per the Web Audio spec, as noted in the fetch)
- **ConvolverNode:** `buffer` takes an impulse-response AudioBuffer (1, 2 or 4 channels); `normalize` applies equal-power scaling. Because it is a regular AudioBuffer, an IR can be generated from exponentially decaying noise (`(Math.random()*2-1)*Math.pow(1-i/len, decay)`, for example 2 s, decay 2). — [MDN ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode) (the generated-IR code came from the fetch tool's elaboration, not MDN text. It is a well-known technique, but treat it as an inference.)

### Inferences
- (Inference) **Audio graph for the game:**
  - `master → compressor (DynamicsCompressor, light, for phone speakers) → destination`.
  - `ambienceBus` (low drone: two detuned oscillators around 35–55 Hz plus lowpassed brown noise. Many phone speakers can't reproduce under ~100 Hz, so add a 2nd-harmonic layer around 80–110 Hz to stay audible).
  - `threatBus` (stalker sounds through HRTF panners, with a shared reverb send through a ConvolverNode with a generated 1.5–3 s IR. A lowpass "occlusion" filter at 600–1200 Hz when a wall is between the stalker and the player in the raycast, and about 8–16 kHz when there is line of sight).
  - `musicBus` (2–4 vertical layers, such as drone, pulse, high strings/noise and percussion, crossfaded by `threat` 0..1 using `setTargetAtTime` with time constants of 0.5–2 s).
  - `uiBus` (heartbeat and breathing as non-diegetic, non-spatial sounds).
- (Inference) Use HRTF only for 1–3 key sources (the stalker, one scripted whisper) and "equalpower" for the rest, because HRTF costs more CPU on phones (performance claim from the fetch tool's general guidance, not MDN). Tell players headphones are recommended, since HRTF needs headphones to work.
- (Inference) **Binaural whispers:** place a short whisper at ±90° and 0.3–0.5 m from the listener (very close, ears only), with no reverb (dry = intimate). Fire it only in Relax phases as a false scare, never when the stalker is actually there (to keep threat audio honest).
- (Inference) **Distant diegetic sounds** (crying, banging, a scream cut off mid-way) go to a far panner position with heavy lowpass and high reverb wet, at random intervals of 20–60 s in low-intensity phases. Keep them ambiguous and non-graphic for PEGI-16-like tone.
- (Inference) **Sudden silence:** on a peak event (stalker becomes visible at close range), duck the ambience and music to near zero over about 50–100 ms (`linearRampToValueAtTime`), hold 0.5–1.5 s with only breathing, then hit the stinger. This applies the high-dynamic-range idea.
- (Inference) **Distortion:** a WaveShaperNode with a soft-clip curve (k ≈ 20–100) on the radio/static layer, with mix driven by stalker distance, as a Silent Hill-like proximity tell. The current "static when looking at it" can become "static that rises with proximity, even through walls". It is information, not just a reaction.
- (Inference) Mobile Web Audio requires a user gesture to start or resume the AudioContext (widely documented browser autoplay policy. I did not fetch a source in this session).

### Gaps
- The direct Audio Technology and Sound Architect interviews were not fetched (403), so the Magee parameter descriptions rely on search-tool summaries.
- I found no sourced measurements of HRTF CPU cost on mobile Safari/Chrome.

## 5. Visual effects feasible in Canvas 2D for realism

### Takeaway
I found little authoritative developer documentation on Canvas 2D horror post-effects. Most items below are **implementation inferences**. The sourced constraints are: Amnesia tuned visual distortion to be "annoying but not nauseating", fog and darkness are proven atmosphere tools (Silent Hill, Outlast), and found-footage/camcorder framing is a deliberate adult-horror aesthetic (Outlast, RE7). Any flicker effect must respect WCAG 2.3.1 (section 6).

### Cited Findings
- Amnesia's sanity visuals used subtle screen pulsing, tuned to be unpleasant but not physically sickening. — [Game Developer](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-)
- Outlast's camcorder night vision, with its battery drain, is both an aesthetic and a resource-pressure device. — [Game Developer: Outlast case study](https://gamedeveloper.com/production/creating-suspense-in-video-games-an-outlast-case-study); Red Barrels picked night vision first, and the camcorder fit it — search summary of [Game Developer: Horror in the making](https://gamedeveloper.com/design/horror-in-the-making-how-red-barrels-outlasted-i-outlast-i-)
- RE7's found-footage approach grew out of GoPro footage the team shot in real haunted locations. — [Game Developer](https://gamedeveloper.com/design/how-i-resident-evil-7-i-s-devs-cultivated-horror-from-reality)
- Silent Hill's fog is tied to grounded, psychologically uneasy horror. — [GameSpot](https://www.gamespot.com/articles/gdc-session-the-dark-spirit-of-silent-hill/1100-6120347/)
- WCAG notes that fine, balanced patterns such as white noise do not violate the flash thresholds, so full-screen static grain is acceptable. Large luminance flashes are not. — [W3C Understanding SC 2.3.1](https://www.w3.org/WAI/WCAG21/Understanding/three-flashes-or-below-threshold.html)

### Inferences (all implementation suggestions, not sourced)
- **Realistic grime on walls:** procedural textures with darkened bottoms (moisture), vertical streaks, and per-cell decals (handprints, drag smears, scratched tallies) blended with `globalCompositeOperation = "multiply"` on the texture atlas once at load time. That costs nothing per frame.
- **Lighting:** per-column distance falloff (already in raycasters) plus a flashlight cone mask using a radial gradient with `globalCompositeOperation = "destination-in"` / `"multiply"`. Add flashlight "breathing" (±3–5% radius jitter) and battery sag (warmer colour, smaller radius).
- **Flicker:** randomise brightness dips and keep any full-screen luminance changes under 3 per second, or limited to small areas (WCAG). Sparks: short-lived additive particles (`"lighter"`) near a broken fixture sprite.
- **Volumetric dust:** 30–80 small, low-alpha particles drawn only inside the flashlight cone, drifting slowly. Cheap on phones.
- **Lens dirt / VHS / bodycam:** a pre-rendered dirt PNG overlay at low alpha, brightened where the flashlight centre is. Scanlines from a pre-drawn pattern, a timestamp/REC overlay for a found-footage frame, and occasional horizontal line-offset tearing using `drawImage` strips of an offscreen canvas.
- **Chromatic aberration:** draw the frame three times with channel-tinted `"lighter"` compositing and 1–3 px offsets. This is expensive on phones, so reserve it for brief peaks (stalker very close) at a reduced resolution.
- **Motion-blur imitation:** do not clear fully. Draw the previous frame at alpha 0.2–0.4 during fast turns or sprint.
- **Head-bob / sway:** vertical offset sin(t·stepRate)·2–4 px plus a small roll. Larger when sprinting or exhausted. Provide a reduce-motion option (Amnesia's "annoying but not nauseating" principle).
- **Distortion when the entity is near:** render at a lower internal resolution, then upscale with per-row horizontal sine offset (strip `drawImage`), and add grain and vignette strength tied to the menace gauge.
- **Peripheral hallucinations:** draw a faint silhouette sprite only at screen edges (outer 10–15%) and remove it if the player turns toward it. This is P.T.'s "always just off-screen" idea applied in 2D.
- Note: `ctx.filter` (CSS filters on canvas) support has historically been missing or incomplete in Safari (unverified in this session, so test on iOS before relying on it).

### Gaps
- No primary source found for Canvas 2D performance budgets on mobile for these effects. Profiling on target devices is needed.
- No developer talk found on blood decal or "blood writing" design in an indie/mobile context.

## 6. Ethics and safety: content warnings, photosensitivity, jump-scare toggle, harmful imagery

### Takeaway
WCAG 2.3.1 sets hard flash limits: no more than 3 flashes per second, unless below the general and red flash area thresholds. Big studios now ship optional content warnings (Dead Space remake, with a blur option) and anti-jump-scare toggles (Alan Wake 2 patch). No industry standard exists for content warnings.

### Cited Findings
- WCAG 2.3.1 (Level A): "Web pages do not contain anything that flashes more than three times in any one second period, or the flash is below the general flash and red flash thresholds." The area limit is a combined 0.006 steradians (25% of a 10° field), estimated as a 341×256 px rectangle at 1024×768 viewing. A general flash is an opposing luminance change of ≥10% where the darker state is below 0.80. A red flash involves saturated red (R/(R+G+B) ≥ 0.8). White-noise-like fine patterns are exempt. — [W3C Understanding SC 2.3.1](https://www.w3.org/WAI/WCAG21/Understanding/three-flashes-or-below-threshold.html)
- Dead Space (2023): optional content warnings for sensitive scenes, off by default. On-screen prompts appear before graphic moments, and a blur option hides the visuals while the audio continues. — [EA: Accessibility and player choice in Dead Space](https://ea.com/able/news/accessibility-and-player-choice-in-dead-space)
- Alan Wake 2 added an anti-jump-scare toggle in a patch, partly due to player complaints. — [PC Gamer](https://www.pcgamer.com/alan-wake-2s-latest-patch-could-be-a-sign-of-more-anti-jumpscare-toggles-in-horror-games-to-comeand-im-all-for-it)
- An ACM Games article argues content warnings are an essential accessibility feature for distressing content and notes there is no industry standard. — [ACM Games: You've (Not) Been Warned](https://games.acm.org/youve-not-been-warned)
- A database lists games with "No Jump Scares" accessibility settings. — [Family Gaming Database](https://www.familygamingdatabase.com/search/accessibility/212-No+Jump+Scares)
- Amnesia tuned effects so they would not make players physically ill. — [Game Developer](https://www.gamedeveloper.com/design/game-design-deep-dive-i-amnesia-i-s-sanity-meter-)

### Inferences
- (Inference) Add a start screen: an 18+/16+ tone notice listing themes (implied violence, blood, death, being hunted, loud sudden sounds, flashing/flicker), a "Jump scares: on / reduced (no loud stinger, no full-screen face)" toggle, a "Reduce flicker & motion" toggle (disables chromatic aberration, head-bob and screen shake), and a headphone recommendation.
- (Inference) Make the capture scare WCAG-safe: avoid full-screen white or red flashes. Use a dark fade with a face in mid-tones instead of a bright flash, or keep any flash under 3/s and under 25% of the screen.
- (Inference) Avoid real-world harmful imagery: no self-harm or suicide depiction or methods (including notes that read as suicide notes), no hanged figures, no sexual violence, no imagery of real tragedies or real people. Keep violence implied. This also keeps the content away from the PEGI 18 triggers (gross violence or violence against defenceless characters) unless 18 is the intended rating.
- (Inference) An adult-tone game on the web/mobile without a formal rating should still self-declare an age gate. A formal PEGI/IARC rating applies when distributing on app stores (IARC was not researched here).

### Gaps
- I did not fetch the Game Accessibility Guidelines (gameaccessibilityguidelines.com) for their exact horror recommendations.
- IARC (which store-distributed mobile web games would use) was not researched.
- I found no specific guidance on self-harm imagery in games from PEGI/ESRB. That point is a general harm-avoidance inference.
