# Sound Effects and Music Design for a Casual Tower-Stacking Game (crane + drop + stack)

Research date: 2026-11-24. Notes in English; final report to be in Turkish. Every claim has an inline source; inferences are marked separately.

## Q1. Which game events need which sounds, and how is casual-game feedback audio made to feel satisfying (layering, pitch variation, combo pitch, ducking, mix levels, durations)?

### Takeaway
Published guidance agrees on a small set of techniques. Build impacts from layers (attack, body, tail). Randomise pitch slightly (about 1-3 semitones or a few percent) and volume slightly (1-3 dB) to avoid repetition. Raise pitch by semitones (multiplier 2^(1/12) ≈ 1.06 per step) through a combo. Keep UI and fast-repeating sounds short. Duck the music under the important SFX. Exact durations and LUFS targets are rarely documented.

### Cited Findings
- **Layering impacts:** use three layers. The attack is a very short click or snap, mostly high frequencies. The body is the low and low-mid thump. The tail is debris, scatter or room sound. EQ each layer so they do not share the same range — [Soundi Guide: SFX design tips](https://soundi.si/en/guide/sfx-design-tips.html)
- **Attack timing:** "the first 10–30 ms shape most of the impression". Keep fade-ins very short and start the attack layer a few ms ahead of the body. Offset layer start times by a few ms for variation — [Soundi Guide](https://soundi.si/en/guide/sfx-design-tips.html)
- **Short UI sounds:** "UI sounds and rapidly repeated attacks in particular benefit from being short". No numeric duration is given. Add an end fade on export — [Soundi Guide](https://soundi.si/en/guide/sfx-design-tips.html)
- **Loudness:** peak ceiling about −1 dB at export. Match LUFS across a batch, with a target per type (UI quieter, key attacks louder). No LUFS value is given — [Soundi Guide](https://soundi.si/en/guide/sfx-design-tips.html)
- **Engine-side randomisation:** "a few percent of pitch and 1–3 dB of volume". Keep ranges modest. Make 2–5 variants per frequently played sound — [Soundi Guide](https://soundi.si/en/guide/sfx-design-tips.html)
- **Randomise pitch to reduce repetition:** shifting each playback by a small random amount "adds a very natural kind of variation that reduces repetitiveness and can improve game feel". The article gives no numeric range ("a small amount") — [George Prosser, "The Power of Pitch Shifting", Game Developer, 2017](https://www.gamedeveloper.com/audio/the-power-of-pitch-shifting)
- **Combo escalation:** when actions are chained, "successively increase the pitch of the associated sound effect". Use semitone steps with multiplier 1.06^N for N semitones (2^(1/12) ≈ 1.06). A multiplier of 0.5 is one octave down — [Game Developer, Prosser](https://www.gamedeveloper.com/audio/the-power-of-pitch-shifting)
- **Pitch mapped to intensity:** "The harder a ball hits the ground, the higher pitch the sound it makes". For example, a harder landing or a better alignment could map to a different pitch — [Game Developer, Prosser](https://www.gamedeveloper.com/audio/the-power-of-pitch-shifting)
- **Typical random ranges in other sources:** Construct suggests subtle shifts of 1–3 semitones — [Construct tutorial](https://www.construct.net/en/tutorials/randomized-sound-effects-music-1312). An Unreal MetaSounds guide suggests about ±2 semitones, about 2 dB volume, and 4–6 variants chosen with random-without-repeat — [StraySpark blog](https://www.strayspark.studio/blog/metasounds-unreal-engine-complete-beginners-guide). These come from the search summary only and were not fetched in full.
- **Caveat on pitch-only randomisation:** a patent document notes it can sound "chipmunk"-like. It works best combined with volume changes and several recorded variants — [USPTO patent 10453434](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10453434) (from the search summary)
- **Ducking:** lower one category's volume while another plays — [Unity Manual: Audio Mixer overview](https://docs.unity.com/en-us/engine/6000.0/manual/audio/mixer/overview). Unity Learn calls ducking key to keeping important effects audible over background audio — [Unity Learn: Audio mixing](https://learn.unity.com/tutorial/audio-mixing-1)
- **Starting mix levels:** background music around −30 to −20 dB and SFX around −10 to −5 dB as a starting point — [Unity Learn: Audio mixing](https://learn.unity.com/tutorial/audio-mixing-1) (from the search summary; treat as rough defaults)
- **Mobile speakers:** phone speakers are weak and vary by device, bass-heavy effects often do not translate, and the mix should be tested on real devices and with headphones — [Mighty Bear Games, Medium](https://medium.com/mighty-bear-games/quick-tips-for-mobile-game-audio-success-eac6b5f38bd9)
- **"Juice":** academic work defines juiciness as "exaggerated redundant audio/visual feedback" that creates a better player experience. One study compared versions of a game with and without juicy audio — [That Sound's Juicy! (IFIP/HAL)](https://dl.ifip.org/hal-04144377v1); [TU/e record](https://research.tue.nl/en/publications/that-sounds-juicy-exploring-juicy-audio-effects-in-video-games/)

### Inferences
- **Proposed event-to-sound map** (inference, built from the techniques above):

| Event | Proposed sound |
|---|---|
| Crane swing / idle | Soft looping creak or motor hum at low level, optional |
| Block release | Short "clack" or cable release, about 50–150 ms |
| Normal landing | Layered thud: high-frequency click attack, then low body, then a short debris tail. Pitch ±1–2 semitones random, volume ±1–3 dB, 3–5 variants |
| Perfect drop | Bright chime or bell layered on the thud. Pitch rises 1 semitone (or one scale degree) per consecutive perfect |
| Combo break | Reset the chime pitch to the root |
| Miss / off-tower fall | Descending "whoosh" plus a far-off crash |
| Tower collapse / game over | Low rumble, crash, and a descending minor phrase. Music stops or is low-passed |
| Wind | Filtered-noise loop whose gain follows wind strength |
| Ambient | City or construction-site loop at very low level |
| Countdown | Short beeps, with a higher-pitched "go" |
| UI | Click and tap sounds, quieter than gameplay SFX |
| Win / new record | Short ascending major jingle, about 1–3 s |

- Stepping along a major or pentatonic scale, rather than raw chromatic semitones, would make the rising "perfect" sequence sound musical. This matches the Stack reviews describing a do-re-mi scale (see Q2). Using a scale is design inference.
- Duck the music by a few dB for about 200–500 ms on perfect, collapse and win events. These numbers are inference; no source gives exact ducking values.

### Gaps
- No authoritative source found with exact millisecond durations for UI clicks or countdown beeps, or with LUFS targets for mobile games.
- The GDC talk "Juice it or lose it" (Martin Jonasson and Petri Purho, circa 2012) could not be fetched or verified in this pass. Its contents are not cited here.
- No source found specifically on sidechain ducking triggered by SFX in mobile casual games.

## Q2. How do notable stacking games (Ketchapp Stack, Tower Bloxx) use sound?

### Takeaway
User reviews describe Ketchapp's Stack as playing piano-like musical notes that climb a scale (do-re-mi...) on consecutive perfect placements, with calm, "mysterious" ambient music. Tower Bloxx reviews praise the building SFX but criticise short, repetitive jazzy or "elevator" music loops. For a casual game, that criticism argues for long or varied music and an easy music toggle.

### Cited Findings
- **Stack, scale of notes:** a Japanese reviewer says a musical tone plays when a block lands exactly in place, and the tones form a scale (ドレミファソラシド, do-re-mi...). Another review says a perfect stack makes the block grow slightly — [app-liv.jp Stack reviews](https://app-liv.jp/2643946/?review=44287) (from the search summary; user reviews, not official)
- **Stack, rhythm:** a reviewer notes that perfect alignment prevents trimming, so "a sense of rhythm" helps. Another praises the in-game music and colours as "mysterious" (神秘的) — [app-liv.jp reviews](https://app-liv.jp/2643946/reviews/?cur_page=2)
- **Stack, piano sounds:** a Korean App Store reviewer describes the piano sounds as part of the appeal — [App Store KR](https://apps.apple.com/kr/app/stack/id1080487957?l=en) (from the search summary)
- **Stack, overall:** Common Sense Media calls it a simple, appealing, challenging time-eater — [Common Sense Media](https://www.commonsensemedia.org/app-reviews/stack)
- **Tower Bloxx, music:** GameSpot describes the soundtrack as two brief tracks with a jazzy, FM-synth bass sound, compared to Paperboy. "They're nice, but they loop too often and soon wear out their welcome" — [GameSpot review](https://www.gamespot.com/reviews/tower-bloxx-review/1900-6145707/)
- **Tower Bloxx: New York:** the reviewer says the elevator-style music "gets old super quickly" and turned it off after one game. The building sound effects "work pretty well", while renovation mode is "strangely silent" — [Windows Central](https://windowscentral.com/tower-bloxx-new-york-review)
- **Tower Bloxx: Revolution:** the tower is often swaying and the crane arm is in constant motion, a "visually noisy affair". This describes visuals, not audio — [Pocket Gamer](https://www.pocketgamer.com/tower-bloxx-revolution/review/)

### Inferences
- Rising musical notes on perfect stacks is a proven, recognisable pattern from Stack. Short, repetitive music loops are a documented complaint about Tower Bloxx. Together they suggest the game should use a longer or varied loop, keep the music quiet, and give separate music and SFX toggles.

### Gaps
- No official Ketchapp or Digital Chocolate (Tower Bloxx) documentation of their audio design was found. The Stack note-scale description rests on user reviews only, and the exact interval and instrument are unverified.
- No review describing Tower Bloxx's crane or landing sound in detail was found.

## Q3. Web Audio API best practices in the browser (unlock, buffers, latency, gain buses, mute, visibility, iOS silent switch)

### Takeaway
Create a single AudioContext with `latencyHint: "interactive"`, and call `resume()` inside the first click or tap. Decode short SFX into AudioBuffers once and play each with a new AudioBufferSourceNode. Route everything through gain buses (master → music / sfx) so mute and volume are simple. Suspend on `visibilitychange`. On iOS, Web Audio is silenced by the ringer switch by default; Safari-only `navigator.audioSession.type = "playback"` is the main workaround, with version-specific bugs.

### Cited Findings
- **Chrome autoplay:** Web Audio has been under autoplay restrictions since Chrome 71. An AudioContext created before a user gesture starts "suspended". Fix it by calling `resume()` in a click handler, by creating the context after interaction, or by calling `start()` on an attached node after a gesture. Check `AudioContext.state` and the `statechange` event. Google recommends "click" as the trigger because user-activation events differ across browsers — [Chrome Developers: Autoplay policy](https://developer.chrome.com/blog/autoplay)
- **Media Engagement Index:** MEI allows autoplay with sound on desktop after a threshold, but it should not be relied on for a game. It is the ratio of visits to significant playback events (more than 7 s, unmuted, active tab, video larger than 200x140) — [Chrome Developers](https://developer.chrome.com/blog/autoplay)
- **MDN best practices:** "Create or resume context from inside a user gesture". A context created inside a click handler starts `running`. MDN provides the `if (audioCtx.state === "suspended") audioCtx.resume()` pattern — [MDN: Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- **Buffers vs. media elements:** use media elements (`<audio>`) for long, streamed tracks such as music. Use buffers for short samples, which give "more precision, and more precise manipulation" — [MDN best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- **GainNode values:** set `gain.value` for immediate changes, or use `setValueAtTime` and other AudioParam methods for scheduled changes. AudioParam methods take precedence over `.value`, so prefer them when timing matters (fades, ducking) — [MDN best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- **Latency:** `latencyHint: "interactive"` (the default) selects "the lowest possible latency that doesn't cause glitches". It is meant for games. `"playback"` saves power at the expense of latency. Check `baseLatency` afterwards — [MDN: AudioContext() constructor](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext)
- **Page visibility:** MDN shows pausing audio on `visibilitychange` when `document.hidden` and resuming when visible. A listed use case is switching off sounds in standby. `requestAnimationFrame` stops in background tabs and timers are throttled. "Tabs which are playing audio are considered foreground and aren't throttled", so suspending audio also lets the browser throttle the tab — [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- **iOS silent switch:** the default audio session type is `ambient`, so Web Audio is muted when the ringer is muted. Setting `navigator.audioSession.type = 'playback'` is the reported workaround — [WebKit Bug 237322](https://auto-bugs.webkit.org/show_bug.cgi?id=237322); [webkit-unassigned list, Sep 2024](https://lists.webkit.org/pipermail/webkit-unassigned/2024-September/1186593.html)
- **iOS caveats:** AudioContext reportedly still gets suspended in the background even with `playback` set, with a regression reported in iOS 17.2–17.3. The `transient` and `transient-solo` types produced no sound in one report. The AudioSession API is an Editor's Draft implemented only in Safari, so feature-detect with `'audioSession' in navigator` — [WebKit Bugzilla 261554](https://bugs.webkit.org/show_bug.cgi?id=261554); [WebKit Bug 264473](https://bugs.webkit.org/show_bug.cgi?id=264473); [WebKit Bug 252746](https://bugs.webkit.org/show_bug.cgi?id=252746). These come from search summaries of bug threads, not official Apple docs.
- **Fallback hack:** the `unmute-ios-audio` package forces Web Audio onto the media channel by playing a short silent HTML audio track whenever Web Audio is playing — [feross/unmute-ios-audio](https://www.github.com/feross/unmute-ios-audio); also [swevans/unmute](https://github.com/swevans/unmute)
- **Howler defaults (reference behaviour):** `autoUnlock` (default true) tries to enable audio on mobile and desktop Chrome and Safari. `autoSuspend` (default true) suspends the AudioContext after 30 s of inactivity and resumes on the next playback — [howler.js GitHub](https://github.com/goldfire/howler.js)

### Inferences
- **Recommended architecture** (inference, assembled from the cited docs):
  - `ctx = new AudioContext({latencyHint:'interactive'})`
  - Gain chain: `master → destination`, with `musicBus → master` and `sfxBus → master`
  - On the first `pointerdown` or `click`: `ctx.resume()`, plus `navigator.audioSession.type='playback'` if supported
  - At load: `fetch` → `arrayBuffer` → `decodeAudioData` into a cache map
  - To play: `new AudioBufferSourceNode`, set `playbackRate` = 1.06^semitones × (1 ± small random), add a per-shot gain node, connect to `sfxBus`, `start()`
  - Mute: ramp `master.gain` to 0 and store the setting in localStorage (wrapped in try/catch)
  - On `visibilitychange` hidden: `ctx.suspend()`; on visible: `ctx.resume()` if not muted
- Whether to honour the iOS silent switch is a product decision. Respecting it (leaving the session `ambient`) is arguably more polite for a casual web game, but users may think the sound is broken. This is inference.
- In a single-file game, `playbackRate` on AudioBufferSourceNode is the simplest way to apply the 1.06^N combo pitch. It also changes the sound's duration slightly, which is fine for short SFX (inference).

### Gaps
- No WebKit blog post specifically about the AudioSession API was retrieved. The iOS evidence comes from WebKit Bugzilla and mailing-list threads.
- Exact iOS 18/19/26 behaviour of the silent switch with `audioSession.type` was not verified for 2026.
- No measured latency figures were found for mobile browsers.

## Q4. Procedural synthesis vs. samples: ZzFX, jsfxr, Tone.js, Howler.js

### Takeaway
For a single-file HTML game, ZzFX (MIT, under 1 KB compressed, 20 parameters, built-in frequency randomness) or jsfxr (Unlicense, sfxr port with presets) can generate every SFX in code with no asset files. Howler.js (MIT, about 7 KB gzipped) is a sample-playback wrapper that handles unlock, sprites and fallbacks. Tone.js (MIT) is a much larger music framework, worth it only for generative music or scheduled jingles.

### Cited Findings
- **ZzFX:** "Less than 1 kilobyte when compressed", with no external libraries. MIT licensed ("use it anywhere"). It has 20 controllable parameters and generates sounds from code rather than loading files. Generated sounds can be precached for instant playback. Usage: `zzfx(...[,,,,.1,,,,9])`. A web-based sound designer is linked. The micro code applies a random factor to the starting frequency. Music is available via ZzFXM by Keith Clark, a tiny player and song format — [KilledByAPixel/ZzFX GitHub](https://github.com/KilledByAPixel/ZzFX)
- **jsfxr:** an HTML5 port of DrPetter's sfxr, by Eric Fredricksen and maintained by Chris McCormick. Licence is the Unlicense. Presets: pickupCoin, laserShoot, explosion, powerUp, hitHurt, jump, blipSelect, synth, tone, click, random. API: `sfxr.generate("pickupCoin")`, `sfxr.play()`, `sfxr.toAudio()`, accepting JSON or base58 sound definitions. Requires riffwave.js plus sfxr.js. Size is not stated — [chr15m/jsfxr GitHub](https://github.com/chr15m/jsfxr)
- **Howler.js:** "As light as 7kb gzipped", no dependencies, MIT. Uses Web Audio by default with an HTML5 Audio fallback. Supports audio sprites, `autoUnlock` and `autoSuspend` — [goldfire/howler.js GitHub](https://github.com/goldfire/howler.js)
- **Tone.js:** "A Web Audio framework for making interactive music in the browser", MIT. Provides a Transport (global timekeeper with loops and scheduling), Synth (oscillator plus ADSR), FMSynth, AMSynth, NoiseSynth and PolySynth. Requires `Tone.start()` from a user gesture. Size is not stated on the README — [Tonejs/Tone.js GitHub](https://github.com/Tonejs/Tone.js)

### Inferences
- **Pros of procedural (ZzFX/jsfxr):** zero asset weight, so the game stays one HTML file. Pitch and randomness are parameters, so a combo is just a changed frequency parameter. No licensing worries.
- **Cons of procedural:** a retro "chiptune" character. Realistic thuds, construction ambience or wind are harder to make convincing; filtered noise for wind is feasible with raw Web Audio. Samples (Kenney CC0) give a more polished, natural sound but need base64 embedding or separate files. Inference.
- **Hybrid option:** synthesise chimes, beeps and UI with ZzFX or an OscillatorNode, and use a few small CC0 samples (thud, crash) embedded as base64 OGG/MP3. Inference.
- For this scope, raw Web Audio plus ZzFX is likely enough, and Tone.js is overkill unless generative music is wanted. Inference; Tone.js bundle size was not verified.

### Gaps
- Tone.js and jsfxr minified/gzipped sizes were not found in the fetched pages.
- Browser support for OGG vs. MP3 (Safari) was not researched in this pass.

## Q5. Free and affordable sound/music sources and their licences

### Takeaway
Kenney (CC0, no attribution, commercial OK) is the safest source. Freesound mixes CC0, CC-BY (credit required) and CC-BY-NC (no commercial use), so check each file. Pixabay needs no attribution but forbids standalone redistribution. The Sonniss GDC bundle is royalty-free and commercial with no attribution required, but forbids redistribution as raw SFX and AI training. Zapsplat and OpenGameArt pages could not be fetched (403).

### Cited Findings
- **Kenney.nl:** "all game assets on the asset pages are public domain licensed (CC0)". "Attribution is not required". "You're free to use them, even in commercial projects" — [Kenney support](https://kenney.nl/support)
- **Freesound, CC0:** you can do "pretty much what you want", but "you can't claim you are the author" — [Freesound FAQ](https://freesound.org/help/faq/)
- **Freesound, CC-BY:** "you should always mention the original creators". The suggested credit includes the sound name, uploader username, link and licence. Long credits can link to a full list — [Freesound FAQ](https://freesound.org/help/faq/)
- **Freesound, CC-BY-NC:** credit is required and "you can't earn any money with the piece of work you create". Avoid it for a monetised game — [Freesound FAQ](https://freesound.org/help/faq/)
- **Freesound, Sampling+:** a legacy licence being removed by Creative Commons, roughly like CC-BY-NC with an advertising restriction. New uploads use CC0, CC-BY or CC-BY-NC. Freesound keeps an attribution list of sounds you have downloaded — [Freesound FAQ](https://freesound.org/help/faq/)
- **Pixabay:** "Use Content for free", with no attribution required. You "cannot sell or distribute Content ... on a Standalone basis". Do not use trademarks or logos commercially, and no misleading or illegal use. Only the full Content License is legally binding — [Pixabay licence summary](https://pixabay.com/service/license-summary/)
- **Sonniss GDC bundle:** "All of the sounds are royalty free and commercially usable". Usable on unlimited projects for life, with no attribution required. Licensed "for media production (games, film, TV, interactive projects) only". The sounds cannot be resold or redistributed as SFX or in asset packs, but can be sold as part of a finished game. "Use for AI/ML training is strictly prohibited". Full text is at /gdc-bundle-license/ — [Sonniss GDC page](https://sonniss.com/gameaudiogdc)

### Inferences
- In a web game, the audio files are downloadable from the page. This is generally treated as part of a finished product, not "standalone" redistribution, under the Pixabay and Sonniss terms. This is a legal interpretation, not verified; read the full licences.
- **Practical rule:** prefer CC0 (Kenney, CC0 Freesound files). Keep a CREDITS list with title, author, URL and licence for any CC-BY file. Avoid NC and Sampling+ for anything that might be monetised. Inference.

### Gaps
- **Zapsplat:** the licence page returned 403. Terms were not verified; the general understanding that the free tier requires attribution and premium removes it is unverified.
- **OpenGameArt:** the FAQ returned 403. Licence mix (CC0, CC-BY, CC-BY-SA, OGA-BY, GPL) and attribution rules were not verified in this pass.
- The full Pixabay Content License text on games and apps was not fetched.
- Affordable paid options (itch.io packs, Humble bundles, Epidemic Sound) were not researched.

## Q6. Haptics: Vibration API support

### Takeaway
`navigator.vibrate()` works on Chrome for Android but not on iOS Safari or desktop Safari. caniuse also shows recent Firefox versions as unsupported. Global support is about 79%. Treat haptics as an optional Android-only enhancement with feature detection.

### Cited Findings
- **API:** `navigator.vibrate(200)` or a pattern array of alternating on/off milliseconds, e.g. `[200, 100, 200]`. `vibrate(0)` or `[]` cancels. Calls do nothing on unsupported devices. The feature is "not Baseline because it does not work in some of the most widely-used browsers" — [MDN: Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- **Support:** global usage 79.23%. iOS Safari 3.2–26.x and the listed iOS 27 entries are unsupported, and all desktop Safari versions are unsupported. Chrome for Android (157) is supported. Firefox desktop was supported in 11–128 but is listed unsupported from 129 onward, and Firefox for Android 160 is unsupported — [caniuse: Vibration API](https://caniuse.com/vibration)

### Inferences
- **Suggested use:** a short pulse (about 10–30 ms) on perfect drops and a longer pattern on collapse, behind a feature check `'vibrate' in navigator` and a user setting. Durations are inference.
- **User activation:** Chrome is commonly reported to ignore vibrate calls made without user activation. Not verified in this pass, so treat as unconfirmed.

### Gaps
- The user-activation requirement for `navigator.vibrate` in Chrome was not confirmed from a primary source.
- No web-standard haptics alternative for iOS was found or researched.
