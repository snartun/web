# Five casual genres: what makes the best titles look, sound and play well (block puzzle, word wheel, ball sort, marbles, reaction test)

Scope note: I used about 17 tool calls. Primary/official sources were found for reaction time (Wikipedia mental chronometry, Human Benchmark stats via search snippet, athletics false-start studies), marbles rules (Ringer tournament rules page, Wikipedia), glass physics (peer-reviewed measurements), Okabe–Ito palette, Wordscapes (Wikipedia). For Block Blast visuals/sound and commercial ball-sort generation, **no developer documentation or critic deconstruction was found**; what exists is user reviews and blogs, and that is flagged. Items marked "Inference" are my own design reasoning, not sourced.

## 1. Visual style and feedback ("juice") per genre

### Takeaway
The general juice playbook (tweening/easing, particles, screen shake, sound, small scale "pops", hit pause) is well documented from two classic talks and applies to all five games. For Block Blast specifically, players praise the glow when blocks disappear, "exploding" blocks on multi-line clears, and vibration on a full clear. Wordscapes is praised for soothing backgrounds. I found no hard numbers (durations, shake amplitudes) from commercial titles.

### Cited Findings
**General juice (applies to all five)**
- Jonasson & Purho, "Juice it or lose it" (2012): starts from a plain Breakout clone and adds feedback layers live. The core layers are tweening with easing curves (used on block entrances and on small scale effects when the ball hits something), particles (bricks bursting into colored debris), camera shake on hits, and sound effects. It is described as the canonical reference for "juice". Sources disagree on the venue (a Nordic conference or GDC). — [lilys.ai talk summary](https://lilys.ai/ko/notes/784065); [Game Dev Treasure](https://www.richtaur.com/GameDevTreasure/post/juice-it-or-lose-it/); [rpgplayground research](https://rpgplayground.com/research-making-a-juicy-game/)
- Jan Willem Nijman (Vlambeer), "The Art of Screenshake" (2013): takes a dull shooter and shows about 30 small tweaks, each making it feel better. — [Game Developer / Gamasutra](https://gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games)
- Secondhand study notes list items from that talk: basic animation and sound, lower enemy HP, more enemies, bigger explosions, lingering smoke, a game-over screen "for meaning", and slow motion. Quote: "Just fill your game with love and tiny details." — [Uni Bayreuth GxD-10 Game Feel slides](https://medienwissenschaft.uni-bayreuth.de/wp-content/uploads/GxD-10-Game-Feel.pdf)
- A community step-by-step recreation of the talk includes "Hit Pause" as a step, with on/off comparisons. This suggests, but does not confirm, that Nijman covered it. — [DK Liao recreation devlog](https://dkliao.itch.io/the-art-of-screenshake-recreation/devlog/451576/quick-breakdown-of-all-the-effects)
- In one haptics project the haptic pulse was synced to the camera shake using the same animation curves. This comes from a mid-air haptics article, not the original talk. — [Medium, mid-air haptics](https://medium.com/@tanaysinghal/10-tips-to-juice-up-your-game-using-mid-air-haptics-3c99b14db631)

**Block placement puzzle (Block Blast-like)**
- Reviewers credit "the satisfying glow of blocks disappearing after a successful clear" and "fluid" animations. — [reviewsgodzilla](https://reviewsgodzilla.com/puzzle/block-blast); [gamesxf review](https://gamesxf.com/block-blast-game.htm)
- An App Store user describes the feeling of "watching the blocks explode as you clear rows and columns, especially when you pull off a huge combo". — [App Store reviews](https://apps.apple.com/us/app/block-blast/id1617391485?see-all=reviews)
- A student reviewer: the way the phone "vibrate[s] when you get a full clear is very satisfying". — [Walpole student media](https://walpolestudentmedianetwork.com/81131/entertainment/block-blast-a-game-of-strategy-fun-and-relaxation/)
- Dissent: some users dislike the animation; one reviewer played with the sound off. — [justuseapp reviews](https://justuseapp.com/en/app/1617391485/block-blast-block-puzzle-games/reviews)
- Clearing several rows/columns at once gives combo bonuses, which reviewers say encourages planning. — [gamesxf review](https://gamesxf.com/block-blast-game.htm); [blockblastsolverss combos](https://blockblastsolverss.com/block-blast-combos/)

**Word wheel (Wordscapes / Kelime Gezmece-like)**
- Letters sit on a wheel at the bottom and the player swipes between them. Found words fill an empty crossword grid above. Book Riot praised the "soothing backgrounds". — [Wikipedia: Wordscapes](https://en.wikipedia.org/wiki/Wordscapes)

### Inferences
- Block puzzle: (a) While the player drags a piece, show a ghost/outline at the snap position and **highlight the rows/columns it would complete**. (b) On a clear, play a short stagger along the line (cells scale up, flash white, then burst into particles in the cell's color). (c) Scale screen shake and text praise with lines cleared (1 = none, 2 = small, 3+ = larger plus a word like "Great!" / "Harika!"). (d) Show a floating "+score" popup at the clear position. (e) Use one haptic pulse on a clear and a stronger one on a full-board clear. These follow the juice talks plus the reviewer remarks above; no commercial spec was found.
- Cells: a gloss highlight on the top-left, a darker bevel on the bottom-right, and saturated colors on a dark navy background. This is widely seen in the genre, but I found **no source** with exact values.
- Keep shake small and short in puzzle games. The juice talks target action games, so their intensity should be scaled down (inference).

### Gaps
- No developer talk or Deconstructor of Fun teardown on Block Blast's visuals was found. The Medium "UI/UX secrets of Block Blast" article returned 403.
- No sourced numbers (animation durations in ms, shake amplitude in px, particle counts) for any commercial casual puzzle.

## 2. Sound and haptics

### Takeaway
Sources confirm only that sound and haptics are part of the satisfaction: balanced, "soothing" SFX in Block Blast, and vibration on a full clear. Rising pitch on combos is common practice, but I found no source that documents it for these titles.

### Cited Findings
- Block Blast SFX are described as "balanced with just enough to provide feedback"; several sources call the audio soothing. — [gamesxf review](https://gamesxf.com/block-blast-game.htm); [reviewsgodzilla](https://reviewsgodzilla.com/puzzle/block-blast)
- Haptics on a full clear are singled out as satisfying. — [Walpole student media](https://walpolestudentmedianetwork.com/81131/entertainment/block-blast-a-game-of-strategy-fun-and-relaxation/)
- Sound is one of the core layers in the Juice It or Lose It demo. — [lilys.ai summary](https://lilys.ai/ko/notes/784065)
- Reaction time to auditory stimuli is faster than to visual ones (~160 ms vs ~190 ms in college-age adults). For that reason, a reaction test that also plays a sound at the stimulus would measure a different thing. — [Wikipedia: Mental chronometry](https://en.wikipedia.org/wiki/Mental_chronometry)

### Inferences
- Combo pitch ladder: raise each successive clear in a combo by a semitone (×1.0595 playback rate) and reset when the combo breaks. Word game: raise the pitch per letter while swiping, then play a chime on a valid word and a soft "thud" on an invalid one. Ball sort: a short glass "tink" on landing, a pitch change on lift versus drop, and a chord when a tube is completed. Marbles: impact volume scaled by relative collision speed. These are standard practice; none is sourced for a specific title.
- In the reaction test, keep the stimulus visual-only, or warn the user that sound changes the result (a mean shift of ~30 ms, per the figures above).
- On the web, `navigator.vibrate` exists on Android Chrome but not iOS Safari (my background knowledge, not verified in this session).

### Gaps
- No sourced sound-design breakdown (pitch ladders, sample choices) for Block Blast, Wordscapes, Kelime Gezmece or ball-sort games.

## 3. Rules and mechanics for fairness and replayability

### Takeaway
- **Block puzzle:** piece generation logic is undisclosed; the "adaptive dealer" claim is unverified.
- **Word games:** strong, documented systems: bonus words → coins → hints (random letter, chosen letter, multiple letters), free shuffle, 6,000 levels growing to 7 letters.
- **Ball sort:** a reverse-scramble generator guarantees solvability; some commercial levels truly need the extra tube; minimizing moves is NP-hard.
- **Marbles:** Ringer is well defined (10 ft ring, 13 marbles in a cross 3 in apart, knuckle down, first to 7). Glass restitution is ≈0.93.
- **Reaction time:** visual simple RT ≈190–270 ms depending on setup; the distribution is right-skewed; <100 ms means anticipation.

### Cited Findings
**Block placement puzzle**
- The piece-generation system "has never been publicly disclosed". Vendor pages claim an adaptive dealer that reads the board and keeps the player "in the flow channel", but that is promotional and unverified. Claims that the game "knows when you're struggling" are likely confirmation bias. — [blockblastsolverss: Is Block Blast rigged?](https://blockblastsolverss.com/is-block-blast-rigged/); [raijinnstudio](https://raijinnstudio.com/blog/how-to-develop-game-like-block-blast); [Playgama blog](https://playgama.com/blog/game-faqs/how-does-the-block-blast-algorithm-function/)
- One description says the game deals three random shapes from a predefined set of polyominoes. The three-piece tray creates planning pressure because the best placement must fit all three. — [Idea Usher](https://ideausher.com/blog/puzzle-game-like-block-blast-development/)
- Combos come from one placement completing several rows and/or columns. Strategy guides say to build setups that several different shapes can trigger. — [blockblastsolverss combos](https://blockblastsolverss.com/block-blast-combos/); [marianabase combo guide](https://www.marianabase.com/2026/06/block-blast-combo-guide-how-to-create.html)

**Word wheel game**
- Bonus words are valid words that are not in the grid. Each earns 1 coin, but only on the first play of a level. Proper nouns are rejected, and not every real word counts. — [Wikipedia: Wordscapes](https://en.wikipedia.org/wiki/Wordscapes)
- Hint types in Wordscapes:
  - shuffle the wheel
  - lightbulb: reveal one random letter
  - rocket: scatter several random letters across the grid
  - bullseye: reveal a letter in a chosen square
  - bees: place letters and coins on the board

  Coins come from bonus words and daily gifts. — [Wikipedia: Wordscapes](https://en.wikipedia.org/wiki/Wordscapes)
- Wordscapes structure: 6,000 regular levels, then endless "Master Levels". Puzzles get bigger, with at most 7 letters. Daily puzzles, timed events and tournaments run alongside. "Brilliance" is a non-spendable score that rises with the number and length of words found and feeds monthly-resetting leaderboards. — [Wikipedia: Wordscapes](https://en.wikipedia.org/wiki/Wordscapes)
- Scale: over 120 million downloads and 14.8 million MAU (2021); over 230 million players (2022). — [Wikipedia: Wordscapes](https://en.wikipedia.org/wiki/Wordscapes)
- A fan analysis reconstructs the word list: 11,202 accepted words, 8,155 that can be required, and 3,047 that are only ever bonus. Anagram trios such as RESET/STEER/TERSE are a recurring trick. This is a community source. — [solvingwordscapes dictionary](https://www.solvingwordscapes.com/wordscapes-dictionary/)
- Kelime Gezmece (App Store, Turkish): offers "bonus kelimeleri bulma" for extra rewards, free daily bonus rewards, and an "İpucu" button. More hints come from watching videos or buying them. Poki lists it as a UnicoStudio product, not Fugo. Fugo makes Words of Wonders. — [App Store: Kelime Gezmece](https://apps.apple.com/us/app/-/id1352903262); [Poki](https://poki.com/tr/g/kelime-gezmece)

**Ball/color sort**
- Constructive generation: start from a solved board and apply random legal reverse moves, recording the inverse moves as a known solution. If validation fails, fall back to a valid board rather than emit an unverified puzzle. This gives a solvability guarantee under the implemented move rules. — [GitHub Joenasriani/ball-sorting-puzzle](https://github.com/Joenasriani/ball-sorting-puzzle)
- A solver author found a commercial level (578) that "is indeed impossible to solve without the extra tube". Another level is solvable in 108 moves without one. — [GitHub AnthonyFaubert solver](https://github.com/AnthonyFaubert/ball-sort-puzzle-solver)
- Solver approach: DFS with a global visited-state set to avoid cycles (e.g., moving a ball back and forth between empty tubes). — [Caleb Robinson](https://calebrob.com/algorithms/2023/08/13/ball-sort-puzzle.html)
- Academic: an AAAI SoCS paper analyzes solvability, and minimizing the number of moves is NP-hard. — [AAAI SoCS paper](https://ojs.aaai.org/index.php/SOCS/article/download/35971/38126)
- Store listings present undo ("correct mistakes") and an extra tube ("make a stuck level easier") as standard helpers. — [App Store: Ball Sort - Color Tube Puzzle](https://apps.apple.com/hn/app/ball-sort-color-tube-puzzle/id1640521829)

**Marbles (Ringer / ring taw)**
- Tournament Ringer:
  - Ring: 10 ft diameter. A lag line is tangent to the ring, with a pitch line parallel on the opposite side.
  - Targets: **13 marbles in a cross at the centre, spaced 3 inches apart**. The shooter is "slightly larger".
  - Knuckling down is "the most important rule": knuckles on the ground until the shooter leaves the hand.
  - A hit lets you keep shooting from where the shooter stopped; a miss ends the turn and the shooter is picked up.
  - A marble on the line is "in" if its centre is inside the ring.
  - Win: first to 7. The shooter must leave the ring with the 7th marble, otherwise that marble goes back to the cross.

  — [Marble Connection: Ringer](https://marbleconnection.com/joemarbles/6Marble%20Games/007%20Ringer.html)
- Variants:
  - British & World Marbles Championship: **6 ft ring, 49 target marbles**, team target of 25.
  - National Marble Tournament: a shooter that stays inside the ring at the end of the turn must be removed.
  - Another traditional version: a shooter that stays inside means you are out and forfeit your winnings.
  - A foul ends the turn, but the turn's score stands.
  - "Keepsies" versus "friendlies".

  — [Wikipedia: British and World Marbles Championship](https://en.wikipedia.org/wiki/British_and_World_Marbles_Championship); [gameruleshub](https://gameruleshub.org/games/marbles/); [Streetplay glossary](http://www.streetplay.com/thegames/marbles/marbleglossary.shtml)
- Physics:
  - Coefficient of restitution between glass beads: **≈0.926**; glass-bead sliding friction 0.16. A review cites 0.926 for glass on glass with **rolling friction 0.01**. — [PMC: Measurement of restitution and friction coefficients for glass beads](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6803946/)
  - A marble drop experiment also gave e = 0.926. — [IOP J. Phys. Conf. Ser.](https://iopscience.iop.org/article/10.1088/1742-6596/1918/2/022005/pdf)
  - A 16 mm glass marble in a bowl: rolling friction **μR = 0.006**, rolling without slipping, so sliding μ ≥ 0.2. — [AAPT Physics Teacher](https://pubs.aip.org/aapt/pte/article/64/3/188/3380982/Oscillation-of-a-Ball-on-a-Concave-Surface)
  - Glass spheres rolling on a granular bed (sand/soil-like): effective friction **0.45–0.5**. Ground type therefore matters enormously. — [Rolling friction on a granular medium](https://www.academia.edu/109007190/Rolling_friction_on_a_granular_medium)

**Reaction-time test**
- Mean simple RT in college-age adults: ~190 ms visual, ~160 ms auditory; simple RT is typically about 200 ms. — [Wikipedia: Mental chronometry](https://en.wikipedia.org/wiki/Mental_chronometry)
- Distributions are right-skewed (mean > median > mode), and the slow tail is partly attentional lapses. Many researchers set the lower validity limit at **100–200 ms**, because faster responses are anticipations. — [Wikipedia: Mental chronometry](https://en.wikipedia.org/wiki/Mental_chronometry)
- Foreperiod effects:
  - A constant ~300 ms foreperiod gives the fastest RTs.
  - Longer foreperiods lengthen RT.
  - Foreperiods under 300 ms can delay RT.
  - With variable foreperiods, RT is slower when the interval is shorter than the series mean.

  — [Wikipedia: Mental chronometry](https://en.wikipedia.org/wiki/Mental_chronometry)
- Speed rises roughly exponentially from childhood to early adulthood, stays stable, then declines from middle age. — [Wikipedia: Mental chronometry](https://en.wikipedia.org/wiki/Mental_chronometry)
- Sprint starts:
  - Beijing Olympics mean RT: 166 ms (men), 169 ms (women); only about 1 in 1,000 starts reached 109/121 ms.
  - The IAAF rule treats movement under **100 ms** as a false start, with disqualification since 2009.
  - A 2009 IAAF-commissioned study suggested elite sprinters can sometimes react in 80–85 ms.

  — [Wikipedia: Mental chronometry](https://en.wikipedia.org/wiki/Mental_chronometry); [Wikipedia: False start](https://en.wikipedia.org/wiki/False_start)
- A 2016 study of 1999–2014 championship data proposed thresholds of 115 ms (men) and 119 ms (women). A 2025 statistics paper on Devon Allen's 0.099 s DQ found sub-100 ms reactions rare but physiologically plausible. — [J Sports Sci 2016](https://informahealthcare.com/doi/abs/10.1080/02640414.2016.1201213); [arXiv 2506.11460](https://arxiv.org/html/2506.11460v1)
- Human Benchmark (official stats page, via search snippet): **median 273 ms, mean 284 ms**, from over 81 million clicks. These are browser and mouse measurements, which include device latency; that explains why they are slower than lab values (inference on the cause). — [Human Benchmark statistics](https://humanbenchmark.com/tests/reactiontime/statistics)
- Most web scores cluster around 220–320 ms, and the fast end is steep, so a few ms there shifts the percentile a lot. This comes from a secondary explainer. — [reactiontimetests.org](https://reactiontimetests.org/blog/human-benchmark-reaction-time)

### Inferences
- **Block puzzle fairness:** when dealing 3 pieces, check by search that at least one placement order of the tray fits the current board; if not, re-roll up to N times. Optionally weight piece selection toward pieces that fit, at low intensity. There is no source that commercial titles do this, and players are suspicious of "rigging", so keep it subtle or make it transparent. Also show a game-over check: when no remaining tray piece fits anywhere, gray out the pieces before the game-over screen.
- **Turkish word game:**
  - Use a Turkish word list with locale-aware uppercasing (`toLocaleUpperCase('tr-TR')`, so i→İ and ı→I).
  - Accept bonus words (any dictionary word made from the wheel letters) and give coins once per level.
  - Hints: random letter, chosen cell, shuffle (free).
  - Pick levels so the 7-letter "pangram" word exists, with roughly 5–10 target words of 3+ letters. Wordscapes grows from small to 7 letters over its levels.
- **Ball sort (capacity 4):**
  - Generate by reverse-scramble from the solved state, or by random fill plus a BFS/DFS solver check.
  - Use n colors with n+2 tubes, two of them empty. This is the genre's common convention; I found no explicit numeric source.
  - Offer undo (limited, e.g., 3–5 per level, or unlimited for casual play) and a one-time +1 empty tube helper. The source shows some generated levels genuinely need it.
- **Marbles physics in canvas (top-down 2D):**
  - Ball–ball restitution about 0.9–0.93.
  - Rolling deceleration from μR: a = μR·g. With g = 9.81 m/s², μR = 0.01 → 0.1 m/s², which on a 3 m ring is very slow.
  - For packed dirt, use a much higher effective value (granular data 0.45–0.5) to give satisfying stops in 1–2 s.
  - Map ring diameter to the canvas width (10 ft ≈ 3.05 m).
  - Use the 13-marble cross at 3 in spacing (scaled), a shooter slightly larger and heavier than the targets, and "first to 7 out" or "most marbles" scoring.
  - Slingshot input: drag back, clamp power, show an aim line (first segment only, to keep skill).
- **Reaction test (5 rounds):**
  - Random foreperiod uniform in roughly 1–4 s (or 2–5 s) so the green can't be anticipated. Avoid fixed intervals, given the foreperiod effects above.
  - Flag responses under 100 ms (athletics standard) as "too fast / anticipated", and treat a tap before green as "Too soon!" and restart that round.
  - Report the average and median of valid trials, each round's time, and a comparison band against the published web median (~273 ms).
  - Note that device and display latency add tens of ms (not sourced numerically here).

### Gaps
- No primary source on how Block Blast or any commercial block puzzle generates pieces.
- The official Human Benchmark page could not be fetched (JS-rendered). Its test flow (number of attempts, "too soon" handling, histogram/percentile presentation) is therefore not verified here; values come from the search snippet only.
- No source with exact numbers for commercial ball-sort undo limits or tube/color ratios.
- The Okabe–Ito hex values were not checked against the original jfly.uni-koeln.de page.

## 4. Accessibility (colour-blind safety, especially ball sort)

### Takeaway
Use a CVD-safe palette such as Okabe–Ito, and never rely on color alone: add symbols, patterns or numbers on balls. Players explicitly request this in ball-sort games, though few commercial titles document it.

### Cited Findings
- Okabe–Ito palette (8 colors): orange #E69F00, sky blue #56B4E9, bluish green #009E73, yellow #F0E442, blue #0072B2, vermillion #D55E00, reddish purple #CC79A7, black #000000. Bang Wong popularized it in Nature Methods (2011), hence also called the "Wong palette". Variants swap in grey #999999 or amber #F5C710. — [rdrr.io Rbearcat palette_OkabeIto](https://rdrr.io/cran/Rbearcat/man/palette_OkabeIto.html); [conceptviz Okabe–Ito reference](https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference); [colorblindr palettes.R](https://rdrr.io/github/clauswilke/colorblindr/src/R/palettes.R)
- Ball-sort players ask for a colorblind mode "with different patterns on the balls, or allow the numbers to always be on top"; a developer replied they could add other properties to the balls. — [itch.io eyeofmidas ballsort comments](https://eyeofmidas.itch.io/ballsort/comments)
- Some apps advertise a red-green colorblind mode, without saying how it works. — [App Store: Ball Sort Quiz](https://apps.apple.com/us/app/ball-sort-quiz/id6475063759)
- Puzzle accessibility guidance recommends symbols, outlines or intensity differences on top of color. — [Game Developer: "Colour blind, colour bind"](https://gamedeveloper.com/design/colour-blind-colour-bind-); [blocksort blog (low quality)](https://blocksort.blogspot.com/2026/01/inclusive-design-accessibility-in.html)

### Inferences
- A ball-sort level with 4 tubes of capacity 4 often uses 6–12 colors, more than the 7 chromatic Okabe–Ito colors. Pair each color with a unique glyph (●▲■◆★✚♥ or the numbers 1–12) drawn in high-contrast white/black, as an option toggle or always on.
- Apply the same palette and glyph idea to block-puzzle piece colors, though there color is not game-critical.
- Reaction test: green-on-red is the classic red-green CVD trap. Add a big text change ("TIKLA!" / "Bekle...") or use a brightness change as well as hue.

### Gaps
- No major ball-sort title with documented pattern-based colorblind mode was found.
- No source tested Okabe–Ito with more than 8 categories.
