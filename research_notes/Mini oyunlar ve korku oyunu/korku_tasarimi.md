# Fear Design for a Short HTML5 Canvas Mobile Horror Game (psychology, sound, visuals, core loops, responsible design)

Scope: portrait phone, touch controls, rounds of 1–3 minutes, Canvas 2D plus Web Audio, single-player plus a 1v1 seeded-run variant. Every cited claim has an inline source. Anything under "Inferences" is the researcher's own reasoning or implementation advice and is not sourced. Specific games appear only as examples of mechanics. Do not copy their characters or art.

---

## 1. Psychology of fear in games: dread vs. jump scares, uncertainty, vulnerability, agency, tension/release, scare frequency

### Takeaway
The evidence and the developer post-mortems agree on four points. Anticipation, vagueness, vulnerability and real player agency produce more fear than frequent scares. Mechanics that are fun or easy to master wear fear down. Enjoyment peaks at a moderate, "just-right" level of fear. A designer's best tool is an alternating build-up, peak and relax cycle with only a few well-placed scares.

### Cited Findings
**Frictional Games (Amnesia/SOMA), "9 years, 9 lessons on horror" (Thomas Grip, 2019)**
- "Horror is not enjoyable" in itself; it works like a rollercoaster (controlled falling). In Penumbra, the maze-and-monster sections became annoying rather than frightening. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- Players work against the designer and optimize fear away. Penumbra's demon dogs could not reach a player standing on a box, so they stopped being frightening. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- Scares alone don't make a horror game. Early Amnesia sections had many jump scares (falling books, banging doors, a playing piano). The team cut them to "a couple" and players became more scared. "In horror, less is often more." Films like Alien, The Exorcist and Ringu spend most of their runtime on anticipation, not on showing the horror. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- "Fun gameplay is just too… fun." In Dead Space, about an hour in, the author had become skilled and monster sounds turned from frightening to exciting. Attention is limited, so engaging mechanics crowd out fear. Amnesia cut its guns, combat and elaborate puzzles. With less to focus on, Let's Play viewers reacted strongly to subtle sounds such as a footstep-like noise. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- Narrative and backstory make a neutral scene threatening, and players fill the gaps with their imagination. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- The world must feel real. Give enough interactivity to feel real, but not so much that players can "knock on surfaces" and break the illusion. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- "Keep it vague." Silhouettes and glowing eyes are scarier than a clear close-up. Resident Evil's health is a decimal value internally but players see only three states. An earlier, clearer version of Amnesia's sanity system was gamed or frustrating, and the vaguer version sparked imagination. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- Agency is crucial. A tunnel the player chooses to enter, with uncertain stakes, is more frightening than one the game forces them through. Amnesia's hub structure created anxiety through choice. — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- Grip says the design question should be "Is this game scary?", not "is it fun?". Weapon upgrades "will destroy the horror element". Frictional plans levels with simple sheets covering light, mood and enemy density, and the developers playtest for fear themselves because outside testers struggle to describe subconscious fear. — [Game Developer](https://www.gamedeveloper.com/design/four-ways-to-design-for-horror-from-i-amnesia-i-dev-frictional-games)
- Let players scare themselves. Grip's example is rustling trees in Slender: The Arrival, which were frightening without any mechanics. The effect fades quickly and empty environments get old. — [Game Developer](https://www.gamedeveloper.com/design/four-ways-to-design-for-horror-from-i-amnesia-i-dev-frictional-games)

**Academic**
- Andersen et al. (2020), *Psychological Science* 31(12), 1497–1510. Haunted-house field study, n=110, with heart-rate monitors. Self-reported fear is a linear function of large-scale heart-rate fluctuations. Enjoyment has an inverted-U relationship with small-scale fluctuations. Fear plotted against enjoyment shows an inverted U, i.e. a "sweet spot". — [Psychological Science / APS](https://www.psychologicalscience.org/observer/playing-with-fear); [ScienceDaily](https://www.sciencedaily.com/releases/2020/10/201026184003.htm); see also [PMC7734554](https://pmc.ncbi.nlm.nih.gov/articles/PMC7734554)
- Lynch & Martins (2015), *J. Broadcasting & Electronic Media* 59(2). Survey of n=269 students, 53% of whom had been frightened by games. The scariest features were darkness, the unknown and disfigured humans. First-person survival horror such as Slender: The Eight Pages dominated the list. Graphic realism mattered more than manifest realism, and perceived interactivity was crucial to producing fright. Spillover effects included disrupted sleep. — [BPS Research Digest](https://www.bps.org.uk/research-digest/how-do-horror-video-games-work-and-why-do-people-play-them)
- A study with n=60 triggered jump scares under different N-back mental-workload levels. Physiological arousal from the jump scare rose linearly with workload, but subjective arousal did not. — [arXiv/related search result, ACM 10.1145/3611021](https://unpaywall.org/10.1145%2F3611021) (summary only; full text not verified)
- A small pilot thesis (n=6) found a tendency for regular horror players to be less affected by scares. The sample is too small for conclusions. — [AAU thesis](https://projekter.aau.dk/projekter/files/280855544/Lyd__frygt_og_spanding_i_horrorspil_kandidatspeciale_af_Nicklas_Bo_Nielsen_20133947.pdf)

**Pacing model (tension/release)**
- Left 4 Dead's AI Director lists "Generate Dramatic Game Pacing" as a goal. — [Booth GDC 2009 slides](https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf)
- The Director cycles through Build Up, Sustain Peak and Relax states based on player "intensity". — [TechRaptor](https://techraptor.net/content/10-years-of-left-4-dead)
- L4D2 scripting defaults: SustainPeakMinTime = 5 s, SustainPeakMaxTime = 10 s, BUILD_UP minimum 15 s, and mobs spawn only in BUILD_UP. These are L4D2 values, not necessarily the 2008 original's. — [Valve Developer Wiki DirectorOptions](https://developer.valvesoftware.com/wiki/DirectorOptions)

### Inferences
- For a 1–3 minute round (inference): use roughly 2–4 build/peak/relax cycles per round, with 1–2 "real" scares at most. The rest should be anticipation (sounds, near-misses, false alarms). The L4D2 timings (build ≥15 s, peak 5–10 s) scale well to this length.
- Hide exact numbers for threat and sanity. Show 3 coarse states, or communicate only through audio and visual distortion (Frictional's "keep it vague").
- Keep mechanics minimal (no weapons) so attention stays on the environment. Give the player meaningful choices with uncertain stakes, such as which corridor to take or whether to spend battery.
- Grip notes that fear fades quickly, and the pilot thesis suggests habituation. A seeded 1v1 run played again by the same player will lose scare value, so randomize scare timing within the seed's constraints. Both players share the same seed, but the stalker can still react to each player's own behaviour.
- To counter players optimizing fear away (Frictional lesson 2), avoid exploitable safe spots, or let the threat change behaviour when a player camps in one place.

### Gaps
- I found no rigorous study giving an optimal number of scares per minute. Frequency guidance comes from developer experience and is qualitative.
- I found no longitudinal study of habituation to repeated jump scares within one player.
- I did not find Red Barrels (Outlast), Bloober or P.T. primary design talks within the time budget. A Game Developer article on Bloober's Layers of Fear exists but was not read: [link](https://www.gamedeveloper.com/design/designing-unsettling-hidden-horror-with-i-layers-of-fear-i-dev-bloober-team).

---

## 2. Sound design for horror and how to synthesize it with Web Audio

### Takeaway
The best-supported acoustic fear cue is "roughness" or nonlinear noise of the kind found in screams. Strongly dissonant, rough intervals such as the minor and major second are processed as negative fairly automatically. The tritone's "evil" reputation is mostly cultural. The 19 Hz "fear frequency" is folklore. A 2026 study found an 18 Hz tone raised cortisol and worsened mood, but participants did not report fear. Phone speakers can't reproduce infrasound anyway. Everything needed (drones, noise, reverb, HRTF panning, Shepard tones, stingers) can be built from Web Audio primitives. Audio can only start after a user gesture.

### Cited Findings
**Acoustic research**
- Blumstein, Davitian & Kaye (2010) analyzed 30-second clips from more than 100 films. Horror soundtracks had more screams and nonlinear noise (the irregular, scratchy sound of air forced past the vocal cords), similar to animal alarm calls. The authors call these suggestive associations. — [PMC3001365](https://pmc.ncbi.nlm.nih.gov/articles/PMC3001365); [NBC News](https://www.nbcnews.com/id/wbna40383410)
- Nonlinear music paired with boring videos did not evoke the same level of emotion, so context matters. — [ScienceNews summary via search](https://www.sciencenews.org/?p=6107)
- Trevor, Arnal & Frühholz (2020) found that music accompanying the most frightening film scenes mimics the acoustic "roughness" of human screams. It raised arousal and negative valence, as screams did. — [Psychology Today](https://psychologytoday.com/ca/blog/why-we-love-horror/202209/why-sound-is-so-important-in-horror-movies) (secondary; primary paper not opened)
- High-roughness intervals (the minor and major seconds) appear to be processed automatically as negative by Western listeners. The tritone's negativity is understood as cultural. — [Armitage et al., Durham](https://dro.dur.ac.uk/34035)
- In fMRI work, increasing dissonance led to more negatively valenced inferences during film viewing. — [PMC11287129](https://pmc.ncbi.nlm.nih.gov/articles/PMC11287129); [PMC5396975](https://pmc.ncbi.nlm.nih.gov/articles/PMC5396975)
- Cross-cultural caveat: the Tsimané were largely indifferent to consonance and dissonance, but did show an aversion to minor and major seconds. — [search summary of dissonance literature](https://pmc.ncbi.nlm.nih.gov/articles/PMC10697574/)

**Shepard tone**
- A Shepard tone stacks sine waves an octave apart. The middle octave stays at constant volume while the top fades out and the bottom fades in, which produces an endlessly rising (or falling) pitch. Zimmer and Nolan used it in Dunkirk to build tension, layering three Shepard scales on different timescales. — [Hypebeast/Vox](https://hypebeast.com/2017/7/dunkirk-soundtrack-illusion-hans-zimmer-breakdown-video); [Kottke](https://kottke.org/17/07/the-infinite-auditory-illusion-that-makes-the-dunkirk-soundtrack-so-intense-and-good); [CBC](https://www.cbc.ca/radio/q/blog/hans-zimmer-explains-the-audio-trickery-that-made-dunkirk-audiences-nauseous-1.4311684)

**Infrasound: evidence vs. folklore**
- Vic Tandy traced his "ghost" experiences to a fan producing about 18.98 Hz, and they stopped once the fan was fixed. He also measured a 19 Hz peak at 38 dB SPL in a "haunted" cellar. This is anecdotal. — [SPR Psi Encyclopedia](https://psi-encyclopedia.spr.ac.uk/sites/default/files/ebook/article/infrasound-191.pdf)
- Replications are mixed: Edinburgh 2007 used 18.9 Hz, and the 2009 "Haunt" project (18.9 and 22.3 Hz) was negative. One 17 Hz experiment reported 22% of respondents feeling uneasy, a secondhand figure. — [Wikipedia mirror](https://static.hlt.bme.hu/semantics/external/pages/mel/en.wikipedia.org/wiki/Infrasound.html); [BoingBoing](https://boingboing.net/2010/11/08/testing-infrasound-t.html)
- 2026 MacEwan University study (n=36): an 18 Hz tone raised cortisol and worsened mood without participants' awareness, but they did not report feeling scared or anxious. The sample was small. — [PsyPost](https://www.psypost.org/new-research-indicates-sounds-you-cant-hear-can-spike-your-cortisol-levels-offering-a-biological-reason-for-sudden-creepy-feelings/)

**Web Audio API facts**
- `PannerNode.panningModel`: `equalpower` is the default, "simple and efficient". `HRTF` "renders a stereo output of higher quality… uses a convolution with measured impulse responses from human subjects." — [MDN PannerNode.panningModel](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/panningModel)
- `ConvolverNode` performs linear convolution with an `AudioBuffer` and is "often used to achieve a reverb effect". The impulse response must be mono, stereo or 4-channel, and `normalize` applies equal-power scaling. A synthetic impulse response can be made from exponentially decaying random noise. The MDN page has no generator; that example came from the fetch tool and is not MDN text. — [MDN ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode)
- Autoplay: starting Web Audio sources "outside the context of handling a user input event is subject to autoplay rules". Audio is generally blocked until the user has interacted with the page. `Navigator.getAutoplayPolicy('audiocontext')` reports the policy. In Firefox, audio contexts play only after sticky activation by default. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- Granny hunts by sound: dropping objects or making unnecessary noise draws the antagonist to investigate. Sound is both a threat cue and a player-generated risk. — [Gizmodo/Kotaku summaries via search](https://kotaku.com/games/granny) (low-quality sources, details unverified)
- Slender: The Eight Pages uses audio cues plus TV-static-like distortion to signal that the stalker is near. — [Wikipedia](https://en.wikipedia.org/wiki/Slender:_The_Eight_Pages)

### Inferences (implementation recipes; parameters are the researcher's suggestions, not sourced)
- **Mandatory "tap to start / put on headphones" screen.** It satisfies the autoplay rules (create or `resume()` the AudioContext in the tap handler) and doubles as the content-warning gate.
- **Drone:** 2–3 detuned oscillators (sawtooth or triangle) around 40–110 Hz through a lowpass (`BiquadFilter`, cutoff ~200–400 Hz) with slow LFO modulation of cutoff and gain (0.05–0.2 Hz). Phone speakers reproduce very little below roughly 100–200 Hz (general acoustics knowledge, not sourced here). Add a harmonic layer (an octave or two up) so the drone is still audible on speakers. Do not count on infrasound; the evidence above doesn't support it as a fear tool.
- **Dissonance:** a sustained minor second (frequency ratio ≈ 1.0595, e.g. 220 Hz + 233 Hz), or two near-unison oscillators detuned 3–15 Hz to create roughness or beating. The tritone ratio is ≈ 1.414. Per Armitage, prefer seconds and roughness over the tritone.
- **Noise/roughness layer:** a looping AudioBuffer of white noise → bandpass (e.g. 800–3000 Hz) with fast amplitude modulation (e.g. a 30–70 Hz LFO on gain) to imitate scream-like roughness at peaks. Brown or pink noise through a lowpass gives wind or room tone.
- **Stinger:** short noise burst plus a dissonant cluster. Attack 5–20 ms, decay 0.5–1.5 s, sent through a convolver with a 2–3 s synthetic impulse response. Cap the peak with a `DynamicsCompressorNode` and a master gain limit so nothing spikes painfully (see section 5).
- **Sudden silence:** ramp the ambience gain to 0 over ~50–150 ms just before a threat event. The contrast makes the next sound land harder. This is film-craft inference; the sources above don't measure it.
- **Heartbeat:** two lowpassed sine thumps (~50–70 Hz, 60–100 ms decay) per beat, "lub" then "dub" ~0.25–0.35 s apart. Scale the BPM from ~60 to ~140 with threat proximity as a non-numeric "vague" indicator (Frictional lesson 7).
- **Breathing:** a noise burst through a bandpass (~500–1500 Hz) with a slow envelope (inhale 1–1.5 s, exhale 1.5–2 s) that quickens as stamina drops.
- **Footsteps / positional threat:** a short filtered noise click per step through a `PannerNode` (HRTF) or `StereoPannerNode` driven by the stalker's relative angle. Lower the lowpass cutoff and the gain when the stalker is behind walls or far away. HRTF only works on headphones; on a phone speaker, rely on volume and filter changes.
- **Shepard riser:** 6–10 sine oscillators an octave apart whose frequencies glide upward exponentially. Each one's gain follows a raised-cosine bell over log-frequency, and an oscillator wraps to the bottom octave when it reaches the top. Speed it up as time or danger runs out.
- **False alarms:** occasionally play a threat cue (a footstep, a door creak) with no threat behind it. This keeps uncertainty high without spending a real scare (draws on Frictional lessons 3 and 4).

### Gaps
- I found no controlled study that directly shows headphones increase fear in games. The headphone recommendation is common practice and inference only.
- I found no peer-reviewed numbers for specific drone frequencies, stinger envelopes or heartbeat BPM. The values above are suggestions.
- I did not open the primary Trevor et al. 2020 paper.

---

## 3. Visual techniques for limited 2D/pseudo-3D, and mobile horror core loops

### Takeaway
Low-budget horror works by restricting information: darkness, a limited light source, vague silhouettes, and warning distortion such as static. It also ties fear to a single scarce resource the player must manage (power, battery, stamina) and to an escalation that follows progress (collect N items → the threat gets more aggressive). These mechanics map directly to Canvas 2D and to 1–3 minute rounds.

### Cited Findings
- Darkness and the unknown are the top fright features in player self-reports. — [BPS / Lynch & Martins 2015](https://www.bps.org.uk/research-digest/how-do-horror-video-games-work-and-why-do-people-play-them)
- Silhouettes and glowing eyes are scarier than clear close-ups ("keep it vague"). — [Frictional blog](https://frictionalgames.blogspot.com/2019/10/9-years-9-lessons-on-horror.html?m=1)
- **Slender: The Eight Pages (collect-N loop):** collect 8 pages in a dark forest using a flashlight with limited battery. There are no weapons. Walking is slow and sprinting drains stamina. Audio cues and TV-static-like distortion warn that the stalker is near. Staring at him too long ends the game. He appears more often, and leaves less time to escape, as more pages are collected. His appearances are randomized rather than scripted. Critics found the horror effective despite crude graphics, saying the simple visuals enhanced suspense and created helplessness and vulnerability. — [Wikipedia](https://en.wikipedia.org/wiki/Slender:_The_Eight_Pages)
- **FNAF 1 (survive-until-dawn loop):** survive 12 AM to 6 AM. Cameras, door lights and doors all drain a single power meter, and a usage readout shows the current drain. Combining actions drains power faster. Everything "boiled down to the one power meter", which created a tense fight to conserve power. Only two ways to fail: run out of power, or miss closing a door in time. The sequels' added complexity was seen as weakening the scares. — [Game Developer "Fear Complex"](https://gamedeveloper.com/design/fear-complex-how-five-nights-at-freddy-s-overcomplicated-it-s-scares)
- A counterpoint argues FNAF's very limited set of mechanics "doesn't really work from a horror game's perspective" in some respects. — [Game Developer](https://www.gamedeveloper.com/design/examining-the-five-nights-at-freddy-s-experience)
- **Granny (hide-and-seek / escape loop):** a first-person stealth-puzzle game played over five in-game "days" with difficulty levels. Noise draws the antagonist, and hiding spots (bed, wardrobe) are not fully safe because her movement is unpredictable. — [Gizmodo](https://gizmodo.com/download/granny); [Granny fandom wiki](https://granny.fandom.com/wiki/Granny_(game)) (low-reliability sources)
- Grip: players' own mental model, e.g. rustling foliage, creates fear without mechanics. — [Game Developer](https://www.gamedeveloper.com/design/four-ways-to-design-for-horror-from-i-amnesia-i-dev-frictional-games)

### Inferences (Canvas 2D techniques; implementation advice, not sourced)
- **Darkness + flashlight cone:** draw the scene, then fill an offscreen "darkness" canvas with near-black (alpha 0.92–0.98). Cut the cone out with `globalCompositeOperation = 'destination-out'` and a radial gradient clipped to an arc (cone angle ~40–60°, soft edge). Composite it over the scene. A battery value can shrink the radius and add random flicker (radius jitter ±3–8%, occasional 50–150 ms dropouts). Keep the flicker below 3 per second (section 5).
- **Vignette:** a radial gradient from transparent in the centre to black at the edges, tightening as threat rises.
- **Film grain/noise:** pre-render 3–4 small noise tiles (e.g. 128×128) and cycle them at low alpha (0.04–0.1) with `createPattern`. Don't call `getImageData` per frame on mobile, for performance.
- **Static/glitch on proximity** (the Slender-style warning): horizontal slice offsets via `drawImage` sub-rects, fake RGB split (draw the frame 2–3 times with small x offsets and `lighter` or tinted composites), and noise bursts. Scale intensity with distance. Keep large-area full-screen luminance jumps under the flash limits.
- **Camera shake:** a decaying random offset (amplitude 2–8 px, decay ~200–400 ms) on scare beats only. Provide a "reduce motion" option.
- **Peripheral movement / "something changed":** in pseudo-3D or top-down views, briefly show a silhouette at the edge of the light cone that is gone when the player turns. Between visits, change one object in a room (a door is open, a picture is turned). Both exploit vagueness and the player's own imagination at almost no cost.
- **Pseudo-3D:** a raycaster (Wolfenstein-style column rendering) on Canvas 2D gives first-person corridors with distance fog, i.e. darkness scaled by depth. This is feasible on phones at modest resolution, then scaled up.
- **Core loops that fit 1–3 minutes and seeded 1v1:**
  1. *Collect N (5–8) items in the dark while a stalker escalates with each pickup* (Slender model). Compare time and items collected.
  2. *Survive until dawn by managing one resource* (FNAF model). The timer is 90–180 s, a single battery meter is shared by light, camera checks and door holds, and the seed fixes the threat schedule. Compare remaining battery and survival.
  3. *Find the exit in a dark maze while noise attracts the hunter* (Granny model). Running is fast but loud, walking is slow and quiet. Compare escape time and noise made.
- **Touch controls:** a virtual stick on the lower half, swipe or drag to aim the light, and a hold-to-hide button. Use portrait framing with the light cone pointing up-screen. Keep the input set tiny (FNAF lesson: simplicity = tension).
- **1v1 fairness:** the seed should fix the map, item positions and the threat's timing windows. Fear-related randomness (false-alarm sounds, flicker) can be cosmetic, separately seeded and non-gameplay so neither player gets an advantage.

### Gaps
- I didn't find reliable primary design write-ups for Dark Deception, Eyes: The Horror Game, Slendrina or Pacify within budget, so their mechanics aren't documented here.
- I found no source quantifying optimal visibility radius or darkness level for fear.

---

## 4. (merged into 3) Mobile horror references
See section 3. The documented examples are Slender, FNAF 1 and Granny.

---

## 5. Responsible design: content warnings, photosensitivity, jump-scare options, age ratings, volume spikes

### Takeaway
Hard rules: no more than 3 flashes in any 1-second period (the WCAG 2.3.1 safe path), extra caution with saturated red, and avoiding large high-contrast striped patterns. Offer an optional content warning and a jump-scare reduction mode. Rating systems treat horror as an age-tiered descriptor: PEGI 7 has "Fear", PEGI 12 covers "moderate" horror and PEGI 16 "intense and sustained" horror.

### Cited Findings
- **WCAG 2.3.1 (Level A):** content passes if there are no more than three general flashes and/or three red flashes in any one-second period, or if the combined flashing area is no more than 0.006 steradians within any 10° visual field (25% of it). That is roughly a 341×256 px rectangle at 1024×768 viewing, or 87,296 CSS px. A general flash is a pair of opposing changes of ≥10% of maximum relative luminance where the darker state is below 0.80. A red flash is any pair of opposing transitions involving saturated red, R/(R+G+B) ≥ 0.8. Note 4: content flashing no more than 3 times per second passes without analysis. — [W3C Understanding SC 2.3.1 (WCAG 2.2)](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- **WCAG 2.3.2 (AAA):** nothing may flash more than 3 times in any one second, with no area or luminance exception. — [W3C Understanding 2.3.2](https://www.w3.org/WAI/WCAG21/Understanding/three-flashes.html)
- **Xbox Accessibility Guideline 118:**
  - Roughly 1 in 4,000 people can have a seizure from flashing images or patterns, and many don't know they're susceptible. Eliminating triggers is preferred over splash-screen warnings.
  - Failure criteria: flashing at more than about 3 per second, or covering about 20% or more of the screen. Prolonged lower-intensity flashing can also fail.
  - Spatial patterns fail when the contrast difference between bands is over 10% and the pattern covers about 20% or more of the screen.
  - Repetitive flashing also affects autistic players, migraine-prone players and players with sensory processing disorder.
  - Tool: Harding FPA test.
  — [Microsoft Learn XAG 118](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/118)
- Xbox's mental-health guideline (XAG 123) aims to make players aware of content that may affect their well-being before they encounter it. — [XAG 123](https://docs.microsoft.com/gaming/accessibility/xbox-accessibility-guidelines/123)
- **Jump-scare toggles:**
  - Alan Wake 2 patched one in. The same article cites existing scare-related options: arachnophobia modes, SOMA's safe mode, and toggles in Spooky's Jump Scare Mansion and Scrutinized.
  - Suggested implementations: pause before a scare, mute its audio, or play it in slow motion.
  — [PC Gamer](https://www.pcgamer.com/alan-wake-2s-latest-patch-could-be-a-sign-of-more-anti-jumpscare-toggles-in-horror-games-to-comeand-im-all-for-it)
- Dead Space's content warnings are optional and off by default. They cover intense violence against humans, strong psychological horror and self-harm. — [EA](https://www.ea.com/en-ca/playtesting/news/accessibility-and-player-choice-in-dead-space)
- Subtitles that announce a scare early can spoil it for deaf and hard-of-hearing players. — [GamePro](https://www.gamepro.de/artikel/horrorspiele-und-accessibility,3375514.html)
- **PEGI:**
  - "Fear" can appear on PEGI 7 games with "pictures or sounds that may be frightening or scary to young children".
  - Higher ratings use the "Horror" descriptor: "moderate" horror sequences at PEGI 12, "intense and sustained" horror sequences or disturbing images at PEGI 16. These need not involve violence.
  — [PEGI](https://pegi.info/what-do-the-labels-mean)
- Lynch & Martins reported spillover effects after play, such as disrupted sleep and increased fearfulness. This supports warnings and an easy exit. — [BPS](https://www.bps.org.uk/research-digest/how-do-horror-video-games-work-and-why-do-people-play-them)

### Inferences (not sourced)
- **Flicker budget:** enforce a global limiter in code so no full-screen or large-area luminance toggle happens more than 3 times in any 1-second window. Avoid saturated-red full-screen flashes; use dark desaturated reds. Keep static and glitch overlays low-contrast or small in area.
- **Settings:** intensity presets (e.g. "Atmospheric" = no stingers or shake, "Standard", "Full"), a reduce-flicker/motion toggle, a master volume and a separate stinger-volume slider. Default stinger peak should be well below the ambience's maximum level, with a compressor/limiter on the master bus to stop volume spikes. Remember the user's choices in localStorage as a convenience.
- **Content-warning screen** on first launch: "contains sudden sounds, darkness, flickering, frightening imagery". Combine it with the audio-unlock tap and a headphone recommendation. Keep a pause or exit button always reachable.
- **Rating:** a moderate jump-scare game without gore would most plausibly fall in the PEGI 12 range. This is inference; actual ratings for web games aren't mandatory, and app stores use IARC.
- **1v1 fairness:** intensity settings must not change gameplay timing. Disabling stingers or shake must leave threat timing identical, so seeded comparisons stay fair.

### Gaps
- I didn't retrieve ESRB's exact wording for horror or fear content. ESRB has no dedicated "horror" descriptor that I could verify in this pass.
- I found no authoritative dB or LUFS guideline for maximum jump-scare loudness in games.
- I didn't verify the IARC classification process for browser or mobile web games.
