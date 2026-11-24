# Mobile web technical best practices for an HTML5 Canvas 2D game (iOS Safari + Android Chrome, 2026)

Context: single-file Canvas 2D two-player tower stacking game hosted on GitHub Pages. caniuse figures were read on 2026-11-24. At that date caniuse lists iOS Safari up to 27.2 and Chrome Android 157 as current.

## Rendering & performance (DPR, rAF/timestep, offscreen layers, gradients/shadowBlur, 120Hz, battery, library choice)

### Takeaway
Plain Canvas 2D is enough for a stacking game. The main wins come from MDN's documented techniques: scale the backing store by devicePixelRatio, pre-render static layers to offscreen canvases or use CSS backgrounds, avoid shadowBlur, use `alpha:false`, and run a fixed-timestep simulation inside rAF with clamped frame time. Do not assume 120Hz on iPhone. Safari defaults rAF to about 60Hz unless a feature flag is changed.

### Cited Findings
- **DPR scaling (MDN pattern):** set `canvas.width = rect.width * dpr`, `canvas.height = rect.height * dpr`, call `ctx.scale(dpr, dpr)` and keep the CSS size at `rect` size. This prevents blur on high-DPI screens. — [MDN Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- **Pre-rendering:** draw repeated or static primitives once on an offscreen canvas, then `drawImage` it each frame. — [MDN Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- **Layered canvases:** split UI, game and background into stacked canvases by update frequency. Put large static backgrounds in a CSS `background` on a div under the canvas. — [MDN Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- **Other MDN tips:**
  - Avoid floating-point coordinates (sub-pixel anti-aliasing) and round with `Math.floor`.
  - Don't scale images inside `drawImage`. Cache pre-scaled copies instead.
  - Use `getContext("2d", { alpha: false })` when you don't need transparency.
  - Batch draw calls and avoid unnecessary state changes.
  - Redraw only the parts that changed.
  - Avoid `shadowBlur` and text rendering where possible.
  - Use `requestAnimationFrame` rather than `setInterval`.
  - Prefer CSS transforms to scale a smaller canvas up rather than a large one down.
  — [MDN Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- **Fixed timestep ("Fix Your Timestep"):**
  - Accumulate real elapsed time and step the simulation in fixed `dt` increments. Leftover time carries to the next frame, which keeps the simulation deterministic.
  - Render an interpolation between the previous and current state with `alpha = accumulator/dt`.
  - Clamp frame time (the article uses 0.25 s) to avoid the "spiral of death".
  — [Gaffer On Games](https://gafferongames.com/post/fix_your_timestep/)
- **120Hz / ProMotion in Safari:**
  - Safari has a feature flag, "Prefer Page Rendering Updates near 60fps", that is on by default. Turning it off lets pages render at 120Hz on ProMotion devices, and rAF callbacks follow the page rendering cadence. — [WebKit bug 173434](https://bugs.webkit.org/show_bug.cgi?id=173434); [MacRumors how-to](https://www.macrumors.com/how-to/enable-smoother-120hz-browsing-in-safari/)
  - Reports conflict on whether the flag affects iPhone and Home Screen web apps. — [WebKit bug 272226](https://bugs.webkit.org/show_bug.cgi?id=272226); [WebKit bug 272165](https://bugs.webkit.org/show_bug.cgi?id=272165)
  - A WebKit discussion says pages that opt into higher frame rates must still be ready for 60Hz rAF. — [WebKit bug 173434](https://bugs.webkit.org/show_bug.cgi?id=173434)
- **Library sizes:**
  - Phaser 4.2.x README: `phaser.min.js` is 1.29 MB uncompressed / 345 KB gzipped. The arcade build is 1.18 MB / 313 KB. — [Phaser README (jsDelivr, 4.2.1)](https://cdn.jsdelivr.net/npm/phaser@4.2.1/README.md)
  - PixiJS v8 moved to a single package with better tree-shaking to cut bundle size. — [PixiJS v8 launch](https://pixijs.com/blog/pixi-v8-launches)
  - An unofficial third-party claim puts PixiJS at about 450 KB minified. This is unverified. — [abratabia](https://abratabia.com/pixijs/pixijs-vs-phaser.php)

### Inferences
- Gradients: MDN names only shadowBlur explicitly. Precomputing gradient objects once, or baking gradient backgrounds and block textures into offscreen canvases, follows the same pre-render principle. This is inferred, not stated as a gradient-specific rule.
- DPR cap: no source found mandates a cap. Common practice is `Math.min(devicePixelRatio, 2)` to reduce fill cost and heat on 3x phones. This is inference based on fill-rate reasoning, not a cited source.
- Battery and thermal: drawing only when something changes, and pausing the loop on `visibilitychange`, reduces work. This is inferred from MDN's "render only screen differences" tip.
- Use a fixed physics step (for example 1/60 s) with interpolation. Collapse, wobble and landing then behave the same at 60Hz and 120Hz, which matters for fairness between two players.
- For a single-file game with simple rectangles, a 300+ KB engine (Phaser) is heavy relative to the game logic. Plain Canvas 2D keeps the single-file setup simple. This trade-off is inferred.

### Gaps
- No official gzipped size found for PixiJS v8 or Kaplay. Check bundlephobia or a local build.
- No official WebKit statement on whether 120Hz rAF is the default in Safari 26/27.
- No measured data on thermal throttling of Canvas 2D on iPhone.

## Input (Pointer vs Touch Events, touch-action, double-tap zoom, callout, overscroll, latency)

### Takeaway
Use Pointer Events plus `touch-action: none` on the game surface. Handle `pointercancel`. Add `overscroll-behavior: none` (iOS Safari 16+) to stop bounce and pull-to-refresh-type chaining.

### Cited Findings
- **`touch-action: none`** disables panning, pinch zoom and double-tap zoom.
  - `manipulation` keeps pan and pinch but disables double-tap zoom, which removes the click delay.
  - It must be declared before the gesture starts.
  - With Pointer Events the browser fires `pointercancel` when it takes over a gesture.
  - Limit `none` to the interactive surface for accessibility.
  - Baseline widely available since September 2019.
  — [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- **`overscroll-behavior: none`** prevents scroll chaining and the overscroll bounce. MDN says it can remove "pull to refresh"-type behavior. `contain` prevents chaining but allows bounce. — [MDN overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- **overscroll-behavior support:** iOS Safari 16.0+ (disabled by default in 14.5–15.8), Safari desktop 16.0+, Chrome Android supported. — [caniuse](https://caniuse.com/css-overscroll-behavior)

### Inferences
- Common practice, not verified with a source in this session:
  - `-webkit-touch-callout: none` and `user-select: none` on the canvas to stop the long-press callout and text selection.
  - Calling `preventDefault()` on `contextmenu`.
- For two players on one device, Pointer Events give each touch a `pointerId`. This allows simultaneous inputs, for example the left and right screen halves. Inferred from how the Pointer Events model works.
- Input latency: act on `pointerdown` rather than `click`. `touch-action` also removes the double-tap delay (MDN).

### Gaps
- Not fetched: a primary source for `-webkit-touch-callout` support, or measured input-latency figures for iOS vs Android.

## Screen (Fullscreen, Orientation lock, safe areas, viewport units, address bar, Wake Lock)

### Takeaway
Element fullscreen does not work on iPhone Safari. It works on iPadOS, and on iPhone it is video-only. Orientation lock is unsupported on iOS. Design responsively for both orientations, use `100dvh` with `viewport-fit=cover` and `env(safe-area-inset-*)`, and rely on Home Screen web-app mode for a chrome-less experience on iPhone. Screen Wake Lock is supported from iOS Safari 16.4 and works in Home Screen apps since the Safari 18.4 fix.

### Cited Findings
- **Fullscreen API on iOS:**
  - caniuse rates iOS Safari as "partial" from 12 through 27.2, with no full support. Safari desktop has full support from 16.4. Chrome Android is supported. — [caniuse fullscreen](https://caniuse.com/fullscreen)
  - On iPhone, `webkitEnterFullscreen` only works on `<video>`, and the request to extend it was closed WONTFIX. — [WebKit bug 240312](https://bugs.webkit.org/show_bug.cgi?id=240312)
  - Developers report the element Fullscreen API works on iPadOS but not iPhone. iPhone support briefly appeared in the 17.2 beta and was removed by 17.4 beta. These are forum reports, not official docs. — [Apple Dev Forums 133248](https://developer.apple.com/forums/thread/133248); [Apple Dev Forums 770080](https://developer.apple.com/forums/thread/770080)
- **requestFullscreen requirements:** needs transient user activation (call it from a click or key handler) and returns a promise. Listen for `fullscreenchange` and `fullscreenerror`. The `navigationUI` option accepts "auto", "show" or "hide". — [MDN requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen)
- **ScreenOrientation.lock():** not supported on iOS Safari (3.2–27.2). Supported on Chrome Android and Firefox Android. — [caniuse](https://caniuse.com/mdn-api_screenorientation_lock)
- **Safe areas:**
  - `env(safe-area-inset-top|right|bottom|left)` give the distance from each viewport edge to the safe area. A fallback can be passed as the second argument.
  - `safe-area-max-inset-*` variants also exist.
  - `env()` has been Baseline since January 2020.
  — [MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
  - The `viewport-fit=cover` meta requirement comes from the fetch tool's general knowledge, not the MDN page text.
- **Viewport units:** `svh`, `lvh` and `dvh` are supported since Safari 15.4. — [web.dev viewport units](https://web.dev/blog/viewport-units); [caniuse](https://caniuse.com/viewport-unit-variants)
  - Bug reports: wrong dynamic viewport units in third-party iOS browsers on iOS 18 ([WebKit 279998](https://bugs.webkit.org/show_bug.cgi?id=279998)), and wrong sizing in SFSafariViewController ([WebKit 255708](https://bugs.webkit.org/show_bug.cgi?id=255708)).
- **Screen Wake Lock:**
  - Supported in iOS Safari 16.4+, Safari desktop 16.4+, Chrome 84+, Chrome Android and Firefox 126+. — [caniuse wake-lock](https://caniuse.com/wake-lock)
  - It was broken in Home Screen web apps ([WebKit 254545](https://bugs.webkit.org/show_bug.cgi?id=254545)) and fixed in Safari 18.4: "Fixed Wake Lock API for Home Screen Web Apps." — [Safari 18.4 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes)

### Inferences
- For a two-player same-device game, landscape vs portrait cannot be forced on iOS. Show a "rotate your device" overlay or make the layout adapt. Inferred from the lack of orientation lock.
- Size the canvas from `visualViewport` or the container's `getBoundingClientRect()` on `resize`. With `dvh`, this follows address-bar collapse. Inference, not verified on devices.
- Request Wake Lock after the first tap, and request it again after `visibilitychange`, because the lock is released when the page is hidden. Re-acquiring is the common MDN pattern, but MDN was not fetched in this session.

### Gaps
- Official Apple confirmation of iPhone element-fullscreen status in iOS 26/27 was not found. Only bug and forum comments exist.

## PWA (manifest, service worker, Add to Home Screen on iOS, display modes, icons, GitHub Pages)

### Takeaway
Add a `manifest.webmanifest` and a small service worker that caches the single HTML file and its icons. On iOS 26+, any site added to the Home Screen opens as a web app by default, which gives a chrome-less experience on iPhone. That is the practical replacement for the Fullscreen API.

### Cited Findings
- **Manifest members:**
  - `name` or `short_name` (at least one).
  - `start_url` (required).
  - `icons`, each with `src`, `sizes` and `type`. Chromium requires at least 192x192 and 512x512.
  - `display`: fullscreen, standalone, minimal-ui or browser. `display_override` is an ordered fallback list.
  - `scope`: defaults to the start_url directory, and start_url must be in scope.
  - `theme_color` and `background_color` (used for the splash screen).
  - `"purpose": "maskable"` for adaptive Android icons.
  - Link with `<link rel="manifest" href="...">`. It is fetched without credentials.
  — [web.dev Add a manifest](https://web.dev/articles/add-manifest)
- **iOS 26 / iPadOS 26:** every website added to the Home Screen opens as a web app by default, with an "Open as Web App" toggle the user can switch off. Before this, non-PWA bookmarks opened in the browser. — [WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/); [MacRumors](https://www.macrumors.com/how-to/save-safari-bookmark-web-app-iphone-home-screen/); [heise](https://heise.de/-10749652)

### Inferences
- GitHub Pages project sites are served from `/<repo>/`. Use relative paths (`./manifest.webmanifest`, `start_url: "./"`, `scope: "./"`) and register the service worker with a relative path. The SW scope is then the repo subpath. Inferred from the web.dev scope rules plus how GitHub Pages serves URLs.
- GitHub Pages serves over HTTPS, which service workers require. This is general knowledge, not fetched this session.
- Use a cache-first SW with a versioned cache name, bumped on each deploy so players receive updates.
- Add `apple-touch-icon` (180x180 is common) for iOS icons. Not verified from an Apple source in this session.

### Gaps
- Not fetched: Apple's current documentation on manifest `display: fullscreen` handling on iOS (whether it is treated as standalone), and `apple-mobile-web-app-status-bar-style`.

## Audio unlocking, visibility handling, Vibration

### Takeaway
Create or resume the AudioContext inside the first user gesture. You can check `navigator.getAutoplayPolicy("audiocontext")`. Pause the loop and audio on `visibilitychange`. Vibration does not work on iOS Safari at all, so treat haptics as an Android-only extra.

### Cited Findings
- Starting Web Audio sources outside a user input handler is subject to autoplay rules. Playback with audio is generally blocked until the user has interacted with the page. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- `navigator.getAutoplayPolicy("audiocontext")` (or passing a specific context) reports "allowed", "allowed-muted" or "disallowed". MDN recommends checking at page load because there is no change event. — [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- The pattern "`AudioContext` starts `suspended` → call `resume()` in a gesture handler" comes from the fetch tool's general knowledge, not the Autoplay page text. See the MDN AudioContext reference.
- **Vibration API:**
  - iOS Safari: not supported in any version (3.2–27.2).
  - Chrome Android: supported.
  - Firefox desktop: removed after 128. Firefox Android: not supported.
  — [caniuse vibration](https://caniuse.com/vibration)

### Inferences
- Call `navigator.vibrate?.(…)` behind feature detection. Expect a no-op on iPhone.
- On `visibilitychange` to hidden, pause the simulation (so the accumulator doesn't jump), call `audioCtx.suspend()`, and then resume on visible. Inferred, standard practice. The MDN Page Visibility page was not fetched.

### Gaps
- `getAutoplayPolicy` browser support (believed Firefox-only) was not verified.

## Storage (localStorage high scores, iOS ITP 7-day cap)

### Takeaway
localStorage is fine for high scores. In Safari it can be wiped after 7 days of Safari use without the user interacting with the site. Home Screen web apps have their own usage counter and are not expected to lose first-party data.

### Cited Findings
- WebKit ITP deletes all of a website's script-writable storage after seven days of Safari use without user interaction on the site. This covers IndexedDB, LocalStorage, media keys, SessionStorage, and service worker registrations and caches. — [WebKit blog: Full Third-Party Cookie Blocking and More (2020)](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- "Web applications added to the home screen are not part of Safari and thus have their own counter of days of use." WebKit does not expect first-party data in them to be deleted, and would treat that as a bug. — [same WebKit post](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)

### Inferences
- Wrap localStorage access in try/catch, because private mode or blocked storage can throw. Store a small versioned JSON object.
- Tell users that installing to the Home Screen keeps scores more reliably on iOS. Inferred from the WebKit text.

### Gaps
- Exact localStorage quota (commonly about 5 MB) and `navigator.storage.persist()` behavior on iOS were not verified this session.

## Testing on real devices & profiling

### Takeaway
No primary sources were fetched for this section within the tool budget. The items below are general, well-known practice and should be marked as such in the report.

### Cited Findings
- No new sources were fetched. The relevant MDN guidance is "use requestAnimationFrame", "be careful with heavy physics", and "render only differences". — [MDN Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

### Inferences (general knowledge, not source-verified here)
- iOS: Safari Web Inspector over USB. Enable Settings > Safari > Advanced > Web Inspector on the iPhone, then use the Mac Safari Develop menu. Its Timelines tab covers the JS and rendering frame breakdown.
- Android: `chrome://inspect` remote debugging, with the DevTools Performance panel and CPU throttling.
- Test on a low-end Android phone and an older iPhone. Show an on-screen FPS / frame-time overlay in a debug mode.
- Test Home Screen mode separately from in-browser mode, because behavior differs (for example the Wake Lock bug before 18.4, and 120Hz flag reports).

### Gaps
- Official WebKit or Chrome docs on remote debugging were not fetched. The report writer should cite them as general practice or leave them uncited.
