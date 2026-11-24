# Free, legally reusable SFX and textures (CC0) for the HTML5 mini-games and horror game

Verification method (2026-11-24, from this environment): every "direct file URL" below returned **HTTP 200** to a `curl -sIL` HEAD request, and the size is the server's `content-length` (for ambientCG, after its 302 redirect to acg-download.struffelproductions.com). Licenses were read on each source page: OpenGameArt "License(s)" field, the Freesound license box, the Poly Haven page JSON-LD `copyrightNotice`, and the ambientCG asset page/license docs. Small zip packs were downloaded **once** to list what they contain. Nothing large was re-downloaded.

License wording I read on the source pages:
- **OpenGameArt**: the page's "License(s)" field shows **"CC0"** on every OGA item below except the one flagged CC-BY. Extra labels in that field (e.g. "MySFX", "Kenney") are collection names, not licenses.
- **Freesound** (every Freesound item below): **"Creative Commons 0 — You can copy, modify, distribute and perform the sound, even for commercial purposes, all without the need of asking"**, linked to creativecommons.org/publicdomain/zero/1.0/. Login is only needed for the original-quality download. The public **preview MP3s** (`cdn.freesound.org/previews/...-hq.mp3`, about 128 kbps) download without login. Since the sounds are CC0, the previews can be used too.
- **Poly Haven** (asset pages): **"CC0 1.0 Universal - public domain dedication, no attribution required"**. The polyhaven.com/license page says: "CC0, which is effectively Public Domain even in jurisdictions that do not support the Public Domain."
- **ambientCG** (docs.ambientcg.com/license): **"ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License. This applies to the downloadable asset files and the material preview renders shown for each asset on the site."** The asset page FAQ says: "All assets are released under the Creative Commons CC0 license, making them free to use without attribution - even in commercial circumstances."
- **Kenney packs (mirrored on OGA)**: the License.txt inside the zip says "License: (Creative Commons Zero, CC0) … Support us by crediting Kenney or www.kenney.nl (this is not mandatory)".

## A) Sound effects: which verified CC0 files cover each need?

### Takeaway
Every sound need (1–11, horror included) has at least one verified CC0 file that returns 200 here. Most come from OpenGameArt; the gaps (marble clacks and rolling, whispers, flashlight click, crane/rope creak, building collapse, construction ambience, countdown beeps) are filled with CC0 Freesound preview MP3s. Only one CC-BY item was found ("Race Start Countdown"), and CC0 alternatives for it are listed, so attribution is never required.

### Cited Findings

#### 1. Heavy block/floor landing thud (concrete/wood impact)
- **100 CC0 metal and wood SFX** (rubberduck). Zip, 1,990,361 B, 100 OGG files. Useful files: `wood_hit_01..09.ogg`, `wood_slam_01..04.ogg`, `wood_falling_01..06.ogg`, `metal_hit_*`, `metal_slam_01.ogg`. Direct: https://opengameart.org/sites/default/files/100-CC0-wood-metal-SFX.zip. License: CC0. — [Page](https://opengameart.org/content/100-cc0-metal-and-wood-sfx)
- **75 CC0 breaking / falling / hit sfx** (rubberduck). Zip, 1,624,406 B, 75 OGG files. Useful files: `bfh1_hit_01..13.ogg`, `bfh1_rock_hit_01.ogg`, `bfh1_wood_hit_01..03.ogg`, `bfh1_rock_falling_01..09.ogg`. Direct: https://opengameart.org/sites/default/files/sfx_breaking_and_falling.zip. License: CC0. — [Page](https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx)
- **concrete cinder block drop on gravel.wav** (kyles). Preview MP3, 106,512 B, 4.4 s. Direct: https://cdn.freesound.org/previews/452/452579_612689-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/kyles/sounds/452579/)
- **Wooden Blocks falling, close aspect, slow** (rylandbrooks). Preview MP3, 340,584 B, 14.3 s. Direct: https://cdn.freesound.org/previews/746/746614_1939831-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/rylandbrooks/sounds/746614/)
- **thud_me.wav** (opriema). 14.6 s, Creative Commons 0 (license read on the page). I did not HEAD-check its preview URL, so only the page is listed. — [Page](https://freesound.org/people/opriema/sounds/400188/)

#### 2. Crane winch / chain / rope creak
- **Chain winch sounds** (bart). Zip, 1,480,794 B, 9 WAV files (`winch - Marker #2.wav` … `winch - Region #1.wav`). The page says: "Credit appreciated" (not required). Direct: https://opengameart.org/sites/default/files/winch.zip. License: CC0. — [Page](https://opengameart.org/content/chain-winch-sounds)
- **hamp rope creaks** (6polnic). Preview MP3, 4,981,848 B, 170 s (cut short clips from it). Direct: https://cdn.freesound.org/previews/231/231438_2016452-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/6polnic/sounds/231438/)
- **Slow Creaking Stereo.wav** (harveyism). Preview MP3, 695,280 B, 28 s. Direct: https://cdn.freesound.org/previews/130/130364_2371259-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/harveyism/sounds/130364/)
- **Tree Creaking** (antumdeluge). OGG, 71,424 B; can stand in for a wooden-beam creak. Direct: https://opengameart.org/sites/default/files/tree_creak_0.ogg. The page says: "Licensing: Creative Commons Zero (CC0)". — [Page](https://opengameart.org/content/tree-creaking)

#### 3. Wind ambience loop
- **wind whoosh loop** (sketchman3). OGG loop, 251,584 B. Direct: https://opengameart.org/sites/default/files/wind%20woosh%20loop.ogg. License: CC0. — [Page](https://opengameart.org/content/wind-whoosh-loop)
- **Looping Gentle Wind Ambience on an Open Desert Plain** (dhallcomposer). Preview MP3, 926,592 B, 41 s, made to loop. Direct: https://cdn.freesound.org/previews/697/697217_7678208-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/dhallcomposer/sounds/697217/)
- **Short wind sound** (remaxim). WAV, 747,196 B, a one-shot gust. Direct: https://opengameart.org/sites/default/files/short%20wind%20sound.wav. License: CC0. — [Page](https://opengameart.org/content/short-wind-sound)
- Not recommended: "Mild Wind Background Noise" (WAV, 15.7 MB) and "Storm Arwen 2022" (FLAC, 22.8 MB) are CC0 but too large.

#### 4. Building collapse / rubble crash
- **Building Collapse** (craigsmith). Preview MP3, 173,184 B, 7.9 s. Direct: https://cdn.freesound.org/previews/845/845932_2524442-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/craigsmith/sounds/845932/)
- **R29-04 Crashing Collapse of Wood Building** (craigsmith). Preview MP3, 181,728 B, 8.1 s. Direct: https://cdn.freesound.org/previews/487/487142_2524442-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/craigsmith/sounds/487142/)
- **building collapse / demolition** (greyfeather). Preview MP3, 69,300 B, 3.0 s. Direct: https://cdn.freesound.org/previews/712/712918_15139380-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/greyfeather/sounds/712918/)
- **Cave In** (starninjas). OGG, 33,161 B, a rubble pour. Direct: https://opengameart.org/sites/default/files/cave_in_-_starninjas_0.ogg. License: CC0. — [Page](https://opengameart.org/content/cave-in)
- Also usable: `bfh1_rock_falling_*` and `bfh1_breaking_*` in the 75 CC0 breaking/falling pack (need 1). Another option is **35 wooden cracks/hits/destructions** (qubodup), 7z, 3,855,318 B. Direct: https://opengameart.org/sites/default/files/independent_nu_ljudbank-wood_crack_hit_destruction.7z. License: CC0. — [Page](https://opengameart.org/content/35-wooden-crackshitsdestructions)

#### 5. Glass marble clacks and marble rolling
- **Glass Marbles Rolling on Wood.wav** (Solar01). Preview MP3, 146,928 B, 5.0 s. Direct: https://cdn.freesound.org/previews/661/661650_14490715-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/Solar01/sounds/661650/)
- **Marble (single) rolling on wooden floor.wav** (LiezelDippenaar). Preview MP3, 241,248 B, 10.1 s. Direct: https://cdn.freesound.org/previews/707/707545_14747739-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/LiezelDippenaar/sounds/707545/)
- **marble.wav** (jradcoolness). Preview MP3, 21,661 B, 0.72 s; a short clack. Direct: https://cdn.freesound.org/previews/334/334222_3454378-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/jradcoolness/sounds/334222/)
- **marble drop** (D.S.G.). Preview MP3, 8,976 B, 0.30 s. Direct: https://cdn.freesound.org/previews/240/240313_3624044-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/D.S.G./sounds/240313/)
- **Baoding Balls** (oo). OGG, 3,005,287 B; metal balls rolling, can be cut into roll loops. The page says: "Public domain. No need for attribution." Direct: https://opengameart.org/sites/default/files/Baoding_0.ogg. License: CC0. — [Page](https://opengameart.org/content/baoding-balls)
- **Bowling Ball Rolling** (qubodup). 7z, 195,563 B; the page says it was "made … using a recording of a marble ball". Direct: https://opengameart.org/sites/default/files/qubodup-bowling-roll.7z. License: CC0. — [Page](https://opengameart.org/content/bowling-ball-rolling)
- Clack alternatives inside packs I listed: `glass_001..006.ogg` in Kenney Interface Sounds (need 7), `chips-collide-1..4.ogg` in Kenney Casino Audio (zip, 876,839 B, https://opengameart.org/sites/default/files/kenney_casino-audio.zip, CC0, [Page](https://opengameart.org/content/54-casino-sound-effects-cards-dice-chips)), and `glass_01..05.ogg` in 100 CC0 SFX (need 11).

#### 6. Small pop / bubble / ball drop (ball sort)
- **Pop sounds** (cogitollc). 10 separate OGG files of 4.5–6.6 kB each: `pop1.ogg` … `pop10.ogg`. Example direct: https://opengameart.org/sites/default/files/pop1.ogg (6,607 B). License: CC0. — [Page](https://opengameart.org/content/pop-sounds)
- **bubbles 'pop'** (farfadet46). OGG, 8,578 B. Direct: https://opengameart.org/sites/default/files/pop.ogg. License: CC0. — [Page](https://opengameart.org/content/bubbles-pop)
- **3 Pop Sounds** (wubitog). Zip, 90,641 B; contains `pop1.ogg`, `pop2.ogg`, `pop3.ogg` and `3pops.ogg`, plus `._*` macOS junk files to delete. Direct: https://opengameart.org/sites/default/files/3pops.zip. The page says: "No Attribution Required." License: CC0. — [Page](https://opengameart.org/content/3-pop-sounds)
- Also `drop_001..004.ogg` in Kenney Interface Sounds, and `plop_01/02.ogg` in 100 CC0 SFX.

#### 7. UI click / tap
- **Interface Sounds** (Kenney). Zip, 834,536 B, 100 OGG files. Contents: `click_001..005`, `tick_001/002/004`, `select_001..008`, `toggle_001..004`, `switch_001..007`, `confirmation_001..004`, `error_001..008`, `back_*`, `open_*`, `close_*`, `drop_001..004`, `glass_001..006`, `pluck_*`, `bong_001`, `question_*`, `scroll_*`, `scratch_*`, `glitch_*`, `maximize_*`, `minimize_*`. Direct: https://opengameart.org/sites/default/files/kenney_interfaceSounds.zip. License: CC0. — [Page](https://opengameart.org/content/interface-sounds)
- **51 UI sound effects (buttons, switches and clicks)** (Kenney). Zip, 1,425,902 B, WAV: `click1..5.wav`, `mouseclick1.wav`, `mouserelease1.wav`, `rollover1..6.wav`, `switch1..38.wav`. Direct: https://opengameart.org/sites/default/files/UI_SFX_Set.zip. License: CC0. — [Page](https://opengameart.org/content/51-ui-sound-effects-buttons-switches-and-clicks)

#### 8. Success chime/bell, win jingle, lose jingle
- **85 Short music jingles** (Kenney). Zip, 1,089,319 B, 85 OGG files: 17 jingles × 5 instruments (`jingles_HIT00..16`, `NES00..16`, `PIZZA00..16`, `SAX00..16`, `STEEL00..16`). The file names don't say which jingle is a "win" and which is a "lose", so you have to listen to pick. Direct: https://opengameart.org/sites/default/files/jingleSounds_Kenney.zip. License: CC0. — [Page](https://opengameart.org/content/85-short-music-jingles)
- **Win Jingle** (fupi). OGG, 36,858 B (`winfretless.ogg`). The page says: "A short jingle that represents a successful action, end of level…". A variations zip is also offered but is 11.6 MB. Direct: https://opengameart.org/sites/default/files/winfretless_0.ogg. License: CC0. — [Page](https://opengameart.org/content/win-jingle)
- **Game Over Trumpet SFX** (0new4y). OGG, 18,625 B; the page calls it "Simple trumpet sound for a negative event (game over, lose, etc)" and says "No attribution required". Direct: https://opengameart.org/sites/default/files/losetrumpet_0.ogg. License: CC0. — [Page](https://opengameart.org/content/game-over-trumpet-sfx)
- **Bell dings/chimes** (pwl). 4 WAV files of 254–409 kB: `bell_ding1..4.wav`. Example direct: https://opengameart.org/sites/default/files/bell_ding1.wav (366,660 B). The page says: "Releasing as public domain." License: CC0. — [Page](https://opengameart.org/content/bell-dingschimes)
- Also `confirmation_001..004.ogg` in Kenney Interface Sounds, and `powerUp1..12.mp3` and `threeTone1/2.mp3` in **63 Digital sound effects** (Kenney). That zip is 1,072,810 B. Direct: https://opengameart.org/sites/default/files/Digital_SFX_Set.zip. License: CC0. — [Page](https://opengameart.org/content/63-digital-sound-effects-lasers-phasers-space-etc)

#### 9. Countdown beeps
- **Bomb Countdown Beeps** (snakebarney). Preview MP3, 48,768 B, 2.0 s. Direct: https://cdn.freesound.org/previews/138/138108_1572282-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/snakebarney/sounds/138108/)
- **Race Start Ready go** (steel2008). Preview MP3, 91,369 B, 3.8 s. Direct: https://cdn.freesound.org/previews/231/231277_696454-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/steel2008/sounds/231277/)
- **Film Countdown.flac** (qubodup). Preview MP3, 130,551 B, 10 s. Direct: https://cdn.freesound.org/previews/182/182110_71257-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/qubodup/sounds/182110/)
- **Beep Tone Sound SFX** (qubodup). WAV, 9,214 B, a single beep you can play 3× in code. Direct: https://opengameart.org/sites/default/files/beep.wav. License: CC0. — [Page](https://opengameart.org/content/beep-tone-sound-sfx)
- Only if attribution is acceptable: **Race Start Countdown** (kheetor), OGG, 86,750 B, a "3, 2, 1, go style" countdown. Direct: https://opengameart.org/sites/default/files/countdown.ogg. **The page lists "CC-BY 3.0, OGA-BY 3.0"**, so attribution is required, e.g. "Race Start Countdown by kheetor (https://opengameart.org/content/race-start-countdown), CC-BY 3.0". The CC0 options above make it unnecessary. — [Page](https://opengameart.org/content/race-start-countdown)

#### 10. City / construction site ambience
- **100 CC0 SFX #2** (rubberduck). Zip, 2,367,871 B. Contains `sfx100v2_loop_construction_site.ogg`, `sfx100v2_loop_highway.ogg`, `sfx100v2_loop_machine_01..04.ogg`, `sfx100v2_loop_ambient_01..04.ogg`, `sfx100v2_thunder_01.ogg`, `sfx100v2_footstep_wood_01..04.ogg`, `sfx100v2_door_01..05.ogg`, `sfx100v2_glass_01..06.ogg`, `sfx100v2_stones_01..03.ogg`, `sfx100v2_wood_hit_01..03.ogg`, `sfx100v2_metal_hit_01/02.ogg`, `sfx100v2_switch_01/02.ogg`. Direct: https://opengameart.org/sites/default/files/sfx_100_v2.zip. License: CC0. — [Page](https://opengameart.org/content/100-cc0-sfx-2)
- **Construction Soundscape** (sbda). Preview MP3, 1,387,296 B, 60 s. Direct: https://cdn.freesound.org/previews/246/246171_1733081-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/sbda/sounds/246171/)
- **Construction Site.WAV** (G.Lamont). Preview MP3, 782,592 B, 35 s. Direct: https://cdn.freesound.org/previews/118/118042_2110106-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/G.Lamont/sounds/118042/)
- **High traffic road sounds** (ignasd). OGG, 558,092 B. Direct: https://opengameart.org/sites/default/files/gatve%20Varniu_2.ogg. License: CC0. — [Page](https://opengameart.org/content/high-traffic-road-sounds)

#### 11. Horror set
- **Dark ambient drone loop**
  - **Ambient horror**: OGG 776,232 B at https://opengameart.org/sites/default/files/ambient_horror_0.ogg, WAV 4,259,884 B at https://opengameart.org/sites/default/files/ambient_horror.wav. License: CC0. — [Page](https://opengameart.org/content/ambient-horror)
  - **Dark Ambiences** (ogrebane): zip, 3,129,422 B, `ambience-1..5.wav` plus `._*` junk files. Direct: https://opengameart.org/sites/default/files/dark_ambiences.zip. License: CC0. — [Page](https://opengameart.org/content/dark-ambiences)
  - **4 Atmospheric ghostly loops** (qubodup): 7z, 3,359,298 B, "Atmospheric scary dark loops". Direct: https://opengameart.org/sites/default/files/independent_nu_ljudbank-atmosphere_moody.7z. License: CC0. — [Page](https://opengameart.org/content/4-atmospheric-ghostly-loops)
  - **terror ambience.mp3** (burning-mir): preview MP3, 2,759,914 B, 121 s. Direct: https://cdn.freesound.org/previews/155/155142_2098884-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/burning-mir/sounds/155142/)
- **Heartbeat**
  - **Heartbeat sounds**: WAV files `heartbeat_slow_0.wav` (635,216 B) at https://opengameart.org/sites/default/files/heartbeat_slow_0.wav and `heartbeat_fast_0.wav` (397,080 B) at https://opengameart.org/sites/default/files/heartbeat_fast_0.wav. Reverb variants are also on the page. License: CC0. — [Page](https://opengameart.org/content/heartbeat-sounds)
- **Heavy breathing**
  - **horror breathing**: OGG 60,880 B at https://opengameart.org/sites/default/files/horrorbreathing.ogg. A zip (1,160,526 B, with mp3, ogg and wav) is at https://opengameart.org/sites/default/files/horrorbreathing.zip. License: CC0. — [Page](https://opengameart.org/content/horror-breathing)
  - **Heavy Breathing** (Under7dude): preview MP3, 99,072 B, 4.3 s. Direct: https://cdn.freesound.org/previews/163/163383_2943714-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/Under7dude/sounds/163383/)
- **Footsteps (concrete/wood)**
  - **concrete footsteps** (seth-m): preview MP3, 210,979 B, 8.6 s. Direct: https://cdn.freesound.org/previews/271/271039_3366749-hq.mp3. License: Creative Commons 0. — [Page](https://freesound.org/people/seth-m/sounds/271039/)
  - **Footsteps**: six OGG files `01-footstep_0.ogg` … `06-footstep.ogg`; example (9,715 B) https://opengameart.org/sites/default/files/01-footstep_0.ogg. License: CC0. — [Page](https://opengameart.org/content/footsteps-0)
  - **Metal footsteps on concrete**: OGG preview (189,965 B) at https://opengameart.org/sites/default/files/metal_steps.ogg; 7z with the full set (672,381 B) at https://opengameart.org/sites/default/files/metal_steps_48k24b.7z. License: CC0. — [Page](https://opengameart.org/content/metal-footsteps-on-concrete)
  - Wood steps: `sfx100v2_footstep_wood_01..04.ogg` in 100 CC0 SFX #2 (need 10).
- **Door creak**
  - **Creaky Door Hinge Spooky**: WAV, 761,900 B. Direct: https://opengameart.org/sites/default/files/creaky_door_hinge.wav. License: CC0. — [Page](https://opengameart.org/content/creaky-door-hinge-spooky)
  - **Door Open, Door Close Set** (qubodup): 7z, 3,340,803 B. Direct: https://opengameart.org/sites/default/files/qubodup-DoorSet.7z. License: CC0; the page's attribution field reads "qubodup" (optional under CC0). — [Page](https://opengameart.org/content/door-open-door-close-set)
  - Also `door_01/02.ogg` (the page lists them as "2x door squeak") in **100 CC0 SFX** (rubberduck). Zip, 2,921,904 B. Direct: https://opengameart.org/sites/default/files/100-CC0-SFX_0.zip. License: CC0. — [Page](https://opengameart.org/content/100-cc0-sfx). Also `wood_squeak_01/02.ogg` in 100 CC0 metal and wood SFX.
- **Whispers**
  - **Ghostly Whispers** (dimbark1): preview MP3, 425,263 B, 18.7 s. Direct: https://cdn.freesound.org/previews/316/316797_2814648-hq.mp3. — [Page](https://freesound.org/people/dimbark1/sounds/316797/)
  - **Creepy Whispering** (RaspberryTickle): preview MP3, 95,539 B, 4.1 s. Direct: https://cdn.freesound.org/previews/234/234044_3795287-hq.mp3. — [Page](https://freesound.org/people/RaspberryTickle/sounds/234044/)
  - **Ghostly Whispering** (qubodup): preview MP3, 2,048,448 B, 90 s. Direct: https://cdn.freesound.org/previews/194/194628_71257-hq.mp3. — [Page](https://freesound.org/people/qubodup/sounds/194628/)
  - All three are licensed Creative Commons 0.
- **Metallic scrape**
  - **Scrapes** (antumdeluge): zip, 960,162 B, OGG and WAV, made by "dragging an object across a cinder block". Direct: https://opengameart.org/sites/default/files/scrapes.zip. The page says: "Licensing: Creative Commons Zero (CC0)". — [Page](https://opengameart.org/content/scrapes)
  - **31 pings and metal filing sounds** (bart): 7z, 8.2 MB per the page; not HEAD-checked, so listed as an option only. — [Page](https://opengameart.org/content/31-pings-and-metal-filing-sounds)
  - Also `metal_sheet_01..06.ogg` and `tools_*.ogg` in 100 CC0 metal and wood SFX.
- **Distant thunder**
  - **Rain + Long Thunder**: OGG, 875,624 B. Direct: https://opengameart.org/sites/default/files/rain-thunder.ogg. License: CC0. — [Page](https://opengameart.org/content/rain-long-thunder)
  - Also `sfx100v2_thunder_01.ogg` in 100 CC0 SFX #2.
- **Flashlight click**
  - **Flashlight Clicking On.wav** (baidonovan): preview MP3, 11,184 B, 0.56 s. Direct: https://cdn.freesound.org/previews/187/187335_3297044-hq.mp3. — [Page](https://freesound.org/people/baidonovan/sounds/187335/)
  - **Torch Click 2** (BenjaminNelan): preview MP3, 10,751 B, 0.34 s. Direct: https://cdn.freesound.org/previews/410/410360_1196020-hq.mp3. — [Page](https://freesound.org/people/BenjaminNelan/sounds/410360/)
  - Both are licensed Creative Commons 0.
  - **Light Switch Turn On And Off SFX** (OGA): zip, 19,830 B, `light_switch_turn_on.mp3` and `light_switch_turn_off.mp3`. Direct: https://opengameart.org/sites/default/files/lightswitch_1.zip. The page says: "Free To Use! You don't need to credit me at all". License: CC0. — [Page](https://opengameart.org/content/light-switch-turn-on-and-off-sfx-0)
- **Static / radio noise**
  - **Static**: MP3, 481,070 B. Direct: https://opengameart.org/sites/default/files/ScatterNoise1.mp3. License: CC0. — [Page](https://opengameart.org/content/static)
  - Avoid **Frequency Static Sound Effects**: also CC0, but `static1.wav` alone is 42,336,162 B, too large. — [Page](https://opengameart.org/content/frequency-static-sound-effects)
- **Jump-scare stinger / scream (non-graphic)**
  - **Jumpscare sound** (orcblood-finegold): WAV, 916,206 B; the page says it was "made from scratch using Reaper, no AI". Direct: https://opengameart.org/sites/default/files/jumpscare.wav. License: CC0. — [Page](https://opengameart.org/content/jumpscare-sound)
  - **Jumpscare** (qubodup): preview MP3, 172,446 B, 7.4 s. Direct: https://cdn.freesound.org/previews/814/814050_71257-hq.mp3. — [Page](https://freesound.org/people/qubodup/sounds/814050/)
  - **Horror Surprise** (qubodup): preview MP3, 235,427 B, 10 s. Direct: https://cdn.freesound.org/previews/814/814048_71257-hq.mp3. — [Page](https://freesound.org/people/qubodup/sounds/814048/)
  - Both qubodup sounds are licensed Creative Commons 0.
  - **Horror scream1**: MP3, 178,885 B. Direct: https://opengameart.org/sites/default/files/scream_horror1_0.mp3. License: CC0. — [Page](https://opengameart.org/content/horror-scream1)
  - **Horror SFX** (tinyworlds): zip, 6,255,035 B; contains only `horror_effect1.wav`, `horror_effect2.wav` and `readme.pdf`, so it's big for 2 sounds. Direct: https://opengameart.org/sites/default/files/horror_sfx.zip. License: CC0. — [Page](https://opengameart.org/content/horror-sfx)
- Not used: **Horror Sound Effects Library** (Little Robot Sound Factory). It is **CC-BY 3.0** and **70 MB**, so I left it out. — [Page](https://opengameart.org/content/horror-sound-effects-library)

### Inferences
- A minimal download set for all mini-games is under about 4 MB: Kenney Interface Sounds, Kenney Jingles, Pop sounds, the 100 CC0 wood/metal pack and the breaking/falling pack.
- A horror set built from the single OGG/MP3 files above is about 5–8 MB before re-encoding.
- Freesound previews are lossy MP3s (around 128 kbps). That is fine for mobile web. To get higher quality or WAV originals, you'd need a Freesound account or API key.
- Several WAV files are 0.4–4 MB. Re-encode to OGG/MP3 (e.g. 96 kbps mono) before shipping.
- Delete the macOS `._*` files found in 3pops.zip and dark_ambiences.zip.
- No attribution is legally required for any recommended item. It's still good practice to keep a credits list (Kenney, rubberduck, qubodup, the Freesound authors, Poly Haven, ambientCG).

### Gaps
- I could not tell which Kenney jingles are "win" and which are "lose" from the file names, and I did not listen to any file. The file choices are based on titles and descriptions.
- No dedicated CC0 "glass marble on glass marble clack" recording was found. The closest are "marble.wav" (jradcoolness), "marble drop", Kenney `glass_00x`, and the casino `chips-collide` sounds.
- For "thud_me.wav" (opriema) and "31 pings and metal filing sounds" I did not check the file URL, so only the page is listed.
- I did not open the .7z packs, so their contents are described only from the pages.

## B) Textures: which verified CC0 tileable textures and sky image cover each need?

### Takeaway
Poly Haven API 1k diffuse JPGs (115–926 kB each) cover concrete, plaster, wood floor, rusty metal, brick and sand. ambientCG 1K-JPG zips (2.5–9 MB each, full PBR sets) cover doors, glass office facades, sand/dirt, plaster, rust, brick and wood floor. All of them are CC0. For the sky, the small Poly Haven CDN preview PNG of a "puresky" HDRI works as a 2D background. The tonemapped full JPG is 22 MB.

### Cited Findings
How the URLs were obtained:
- Poly Haven URLs come from `https://api.polyhaven.com/files/<id>` → `Diffuse.1k.jpg.url` (note that brick_wall_001 uses the key name `diffuse`). The same API JSON also gives `nor_gl`, `rough` and other maps.
- ambientCG URLs come from `https://ambientcg.com/api/v2/full_json?id=<id>&include=downloadData`. Each `get?file=` link 302-redirects to acg-download.struffelproductions.com and returns 200 there.
- The license for every Poly Haven asset is "CC0 1.0 Universal - public domain dedication, no attribution required". For every ambientCG asset it is "Creative Commons CC0 1.0 Universal License".

| Need | Asset | Page | Direct file URL (verified 200) | Format / size |
|---|---|---|---|---|
| Concrete | Concrete Floor 02 (Poly Haven) | https://polyhaven.com/a/concrete_floor_02 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_02/concrete_floor_02_diff_1k.jpg | JPG 1k, 776,097 B |
| Concrete (dirty) | Dirty Concrete (Poly Haven) | https://polyhaven.com/a/dirty_concrete | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/dirty_concrete/dirty_concrete_diff_1k.jpg | JPG 1k, 666,452 B |
| Concrete (smooth/light) | Concrete 034 (ambientCG) | https://ambientcg.com/view?id=Concrete034 | https://ambientcg.com/get?file=Concrete034_1K-JPG.zip | zip 1K-JPG PBR, 3,657,575 B |
| Plaster wall (old, horror) | Painted Plaster Wall (Poly Haven) | https://polyhaven.com/a/painted_plaster_wall | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/painted_plaster_wall/painted_plaster_wall_diff_1k.jpg | JPG 1k, 686,726 B |
| Plaster wall | Plastered Wall 04 (Poly Haven) | https://polyhaven.com/a/plastered_wall_04 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_wall_04/plastered_wall_04_diff_1k.jpg | JPG 1k, 299,230 B |
| Plaster wall | Painted Plaster 017 (ambientCG; tags: paint, plaster, white) | https://ambientcg.com/view?id=PaintedPlaster017 | https://ambientcg.com/get?file=PaintedPlaster017_1K-JPG.zip | zip, 4,721,132 B |
| Wooden floor | Wood Floor Deck (Poly Haven) | https://polyhaven.com/a/wood_floor_deck | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_floor_deck/wood_floor_deck_diff_1k.jpg | JPG 1k, 925,789 B |
| Wooden floor / planks | Wooden Planks (Poly Haven) | https://polyhaven.com/a/wooden_planks | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wooden_planks/wooden_planks_diff_1k.jpg | JPG 1k, 489,587 B |
| Wooden floor (parquet) | Wood Floor 041 (ambientCG) | https://ambientcg.com/view?id=WoodFloor041 | https://ambientcg.com/get?file=WoodFloor041_1K-JPG.zip | zip, 6,395,278 B |
| Rusty metal | Rusty Metal 02 (Poly Haven) | https://polyhaven.com/a/rusty_metal_02 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rusty_metal_02/rusty_metal_02_diff_1k.jpg | JPG 1k, 564,932 B |
| Rusty metal | Rust Coarse 01 (Poly Haven) | https://polyhaven.com/a/rust_coarse_01 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rust_coarse_01/rust_coarse_01_diff_1k.jpg | JPG 1k, 845,196 B |
| Rusty metal | Rust 004 (ambientCG) | https://ambientcg.com/view?id=Rust004 | https://ambientcg.com/get?file=Rust004_1K-JPG.zip | zip, 8,155,677 B |
| Wooden door | Door 001 (ambientCG, type "Decal"; tags: old, painted, red, rustic, shed, wood) | https://ambientcg.com/view?id=Door001 | https://ambientcg.com/get?file=Door001_1K-JPG.zip; flat preview render https://acg-media.struffelproductions.com/file/ambientCG-Web/media/thumbnail/1024-JPG-FFFFFF/Door001.jpg | zip 2,557,547 B; preview JPG 121,223 B |
| Wooden door | Door 002 (ambientCG, type "Decal"; tags: castle, church, medieval, old, wood) | https://ambientcg.com/view?id=Door002 | https://ambientcg.com/get?file=Door002_1K-JPG.zip; preview https://acg-media.struffelproductions.com/file/ambientCG-Web/media/thumbnail/1024-JPG-FFFFFF/Door002.jpg | zip 5,386,828 B; preview JPG 291,475 B |
| Dirt / sand (marbles) | Aerial Beach 01 (Poly Haven) | https://polyhaven.com/a/aerial_beach_01 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/aerial_beach_01/aerial_beach_01_diff_1k.jpg | JPG 1k, 115,382 B |
| Dirt / sand | Ground 054 (ambientCG; tags: beach, dirt, ground, mud, sand) | https://ambientcg.com/view?id=Ground054 | https://ambientcg.com/get?file=Ground054_1K-JPG.zip | zip, 8,674,949 B |
| Dirt / sand | Ground 080 (ambientCG; tags: beach, brown, dirt, sand, yellow) | https://ambientcg.com/view?id=Ground080 | https://ambientcg.com/get?file=Ground080_1K-JPG.zip | zip, 6,928,242 B |
| Brick | Brick Wall 001 (Poly Haven) | https://polyhaven.com/a/brick_wall_001 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brick_wall_001/brick_wall_001_diffuse_1k.jpg | JPG 1k, 574,381 B |
| Brick | Red Brick 03 (Poly Haven) | https://polyhaven.com/a/red_brick_03 | https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/red_brick_03/red_brick_03_diff_1k.jpg | JPG 1k, 694,500 B |
| Brick (dirty/old) | Bricks 076 C (ambientCG) | https://ambientcg.com/view?id=Bricks076C | https://ambientcg.com/get?file=Bricks076C_1K-JPG.zip | zip, 9,041,171 B |
| Glass / office facade | Facade 001 (ambientCG; tags: building, facade, glass, reflective) | https://ambientcg.com/view?id=Facade001 | https://ambientcg.com/get?file=Facade001_1K-JPG.zip | zip, 2,890,190 B |
| Glass / office facade | Facade 006 (ambientCG; same tags) | https://ambientcg.com/view?id=Facade006 | https://ambientcg.com/get?file=Facade006_1K-JPG.zip | zip, 2,953,361 B |
| Cloudy sky (2D bg) | Kloofendal 48d Partly Cloudy (Pure Sky) HDRI (Poly Haven; credit text Greg Zaal, Jarod Guest; CC0) | https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky | Small: https://cdn.polyhaven.com/asset_img/primary/kloofendal_48d_partly_cloudy_puresky.png?height=512. Full: https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloofendal_48d_partly_cloudy_puresky.jpg | PNG 501,760 B (512 px tall); full tonemapped JPG 22,162,150 B |

- Other cloudy-sky HDRIs in the Poly Haven API "skies" category: aristea_wreck_puresky, belfast_sunset_puresky (both "partly cloudy", "pure skies"), and approaching_storm, bloem_hill_01, cannon ("overcast"). Their URLs come from the same `api.polyhaven.com/files/<id>` → `tonemapped`, or from the CDN `asset_img/primary/<id>.png?height=…`. I did not HEAD-check these individually. — [Poly Haven API](https://api.polyhaven.com/assets?t=hdris&c=skies)
- The Poly Haven CDN also accepts `?width=1024`, which returned a 28,690 B **WebP** (content-type image/webp) instead of PNG. — [CDN check](https://cdn.polyhaven.com/asset_img/primary/kloofendal_48d_partly_cloudy_puresky.png?width=1024)

### Inferences
- For 256–512 px game tiles, download the Poly Haven 1k diffuse JPG directly and downscale it. This is the smallest option, typically 0.1–0.9 MB.
- The ambientCG zips are full PBR sets (color, normal, roughness and so on, about 2.5–9 MB). Only `*_Color.jpg` is needed for a 2D/simple game. The zipContent field in the API was empty, so I can't give exact inner file names.
- ambientCG doors are "Decal" assets (a door image with alpha), not repeating tiles. The 1024 px preview JPG (white background) can work as a quick door sprite, and the docs say preview renders are CC0 too.
- The CDN preview PNG of the sky is an equirectangular panorama. Crop the upper/middle band for a 2D sky background.

### Gaps
- I did not visually inspect the textures for exact look (e.g. how "dirty" the plaster looks). The choices are based on names and tags.
- Poly Haven has no dedicated wooden-door or glass-office-facade texture under the CC0 API texture list (searching the tags found none), so ambientCG covers those.
