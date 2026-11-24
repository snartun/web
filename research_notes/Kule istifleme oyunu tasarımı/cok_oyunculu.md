# Two-player design (local + online) for a casual mobile-browser tower-stacking game

Research date: 2026-11-24. The notes are in English; the final report will be in Turkish. Every claim has a source. Text marked "Inference" is my own reasoning.

## Q1. Same-device 2-player patterns: examples and UX lessons (split screen, mirrored UI, simultaneous touch, pass-and-play)

### Takeaway
Many casual mobile titles ship "2 players on the same device" as a headline feature. Glow Hockey and its clones do this, and so do face-to-face head-to-head games and Fruit Ninja's split-half duel. I found little published UX research on how they do it, so most layout guidance here is inference. The hard technical limit is the number of touches: iPhones are widely reported to cap at 5 simultaneous touches and cancel all of them on a 6th. For two players, that leaves roughly 2 fingers each.

### Cited Findings
- Glow Hockey 2 (Ariya Studio) advertises "2 players on the same device", plus local Wi-Fi multiplayer and Game Center — [App Store: Glow Hockey 2](https://apps.apple.com/us/app/-/id328992396).
- Glow Hockey (ID 410296208) offers 1- or 2-player quick play, four difficulty levels and a championship mode — [App Store: Glow Hockey](https://apps.apple.com/us/app/id410296208).
- Several clones list "2 player mode (on the same device)" as a feature, which shows the pattern is common in the genre: Glockey ([App Store](https://apps.apple.com/us/app/id1578198257)), Glow Hockey Strike ([App Store](https://apps.apple.com/app/id1473680543)) and a Glow Hockey Steam edition ([Steam](https://store.steampowered.com/app/2846040)).
- Pocket Gamer's best-of lists describe head-to-head games where two players share one phone and sit opposite each other with the screen between them — [Pocket Gamer: best 2 player mobile games](https://www.pocketgamer.com/best-games/best-2-player-mobile-games/); [Pocket Gamer: best local multiplayer games same device](https://www.pocketgamer.com/ios/best-local-multiplayer-games-same-device).
- In Fruit Ninja's 2-player mode, each player slices fruit in their own half of the screen and tries to outscore the other — [Pocket Gamer: top 12 best two player mobile games](https://www.pocketgamer.com/articles/085716/top-12-best-two-player-mobile-games/).
- "2 Players 1 Device: Tabletop" is an App Store collection built specifically for two players on one device placed on a table — [App Store](https://apps.apple.com/py/app/2-players-1-device-tabletop/id1504000687?l=en-GB).
- A Unity developer capped the split screen in Survival Kids at exactly two local players, mainly because more split views become hard to read on one display — [Unity blog: Split-screen and GameShare networking in Survival Kids](https://unity.com/blog/split-screen-and-gameshare-networking-in-survival-kids).
- Dual is the opposite approach: a two-phone shooter where each phone is half of the play area, and the playfield adjusts to the smaller device — [Pocket Gamer: Dual](https://www.pocketgamer.com/dual/dual-is-a-local-multiplayer-shooter-played-across-two-screens).
- **Touch limits (iOS):**
  - A post on Apple's developer forum reports that an iPhone supports 5 simultaneous touches and cancels all of them on the 6th. The same thread reports 11 touches on iPad (Air 2 era), with nothing happening on a 12th, and an anecdotal 17 on iPad Pro — [Apple Developer Forums thread 17606](https://developer.apple.com/forums/thread/17606).
  - Unity's issue tracker records the same behaviour on iPhone 6 through iPhone 11 Pro: the touch list clears once more than 5 touches are active — [Unity Issue Tracker](https://issuetracker.unity3d.com/issues/inputsystem-ios-list-of-active-touches-gets-cleared-if-there-are-more-than-5-active-touches-at-once).
  - The 11-touch iPad figure goes back to an early-2010s experiment — [iClarified](https://www.iclarified.com/9378/ipad-supports-eleven-simultaneous-touches).
  - These are developer reports, not Apple documentation. I found no official Apple specification.
- An Apple forum question about iPhone 13 Pro Max complains that 6-finger play does not work. It got no Apple answer and no confirmed limit — [Apple Developer Forums thread 705871](https://developer.apple.com/forums/thread/705871).

### Inferences
- **Top/bottom mirrored layout (phone flat on a table, players facing each other).** This looks like the natural fit for a portrait tower game: each half holds one tower, and the top half is rotated 180°. The pattern is implied by "opposite sides of the device" in the Pocket Gamer lists and by the "Tabletop" app. I found no published usability study of it.
- **Text and score in a mirrored layout.** Each player's HUD should be rotated toward that player. Shared information, such as the timer or round number, should be either symbolic or duplicated in both orientations.
- **Touch input design.** A one-tap "drop block" control per player keeps two players well under the reported 5-touch iPhone cap. Designs that need several fingers per player risk the cancel-all behaviour on a 6th touch, which would cancel the other player's touch too.
- **Touch zones and stray touches.** Hit zones should be confined to each player's half, with a dead strip in the middle. This guards against palm or stray touches. I found no web-platform "palm rejection" API.
- **Pass-and-play.** Turn-based play on a single device avoids the multi-touch problem entirely. It suits a "who stacks higher in N blocks" mode, but it loses the tension of simultaneous play. I found no source comparing the two directly.
- **Left/right landscape split.** This gives each player a narrow, tall half on a phone. For a tall tower, that likely works worse than a top/bottom split.

### Gaps
- I found no GDC talk or postmortem specifically on UX for local 2-player games on one phone.
- I found no documentation of how Glow Hockey implements mirrored goals or HUDs; only store-listing claims.
- I found no source on whether Tower Bloxx has a multiplayer mode.
- I found no official Android limit on simultaneous touches (it depends on the device and digitizer).
- I found no official Apple specification for the iPhone touch limit.

## Q2. Multi-touch on the web: Pointer Events and touch-action

### Takeaway
Use Pointer Events. Track each finger by `pointerId`, handle `pointercancel`, and set `touch-action: none` (or `manipulation`) on the game surface so the browser does not take over gestures.

### Cited Findings
- **Pointer Events basics.** They unify mouse, pen and touch, and support several simultaneous pointers. MDN's pattern keeps a cache of active events per element, keyed by `pointerId`. It handles `pointerdown`, `pointermove` and `pointerup`, and routes `pointercancel`, `pointerout` and `pointerleave` to the same handler as `pointerup` — [MDN: Multi-touch interaction](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction).
- **Disabling default touch behaviour.** MDN's example sets `touch-action: none` on `body` so scrolling and zooming do not compete with the app's pointer handling — [MDN: Multi-touch interaction](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction).
- **`touch-action` values:**
  - `none`: the browser handles no panning or zooming gestures.
  - `manipulation`: equivalent to `pan-x pan-y pinch-zoom`. It disables double-tap zoom, which removes the click delay the browser would otherwise add while it waits for a second tap.
  - When the browser starts handling a gesture itself, the page receives `pointercancel`.
  - Changing `touch-action` after a gesture starts has no effect on that gesture.
  - Source: [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action).
- **Accessibility.** MDN warns that `touch-action: none` can stop users from zooming, which affects people with low vision. It advises using it only on surfaces such as a game area — [MDN: touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action).
- `Navigator.maxTouchPoints` exists, and MDN lists it as a reference. I did not read its detail page — [MDN: Multi-touch interaction](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Multi-touch_interaction).

### Inferences
- Apply `touch-action: none` only to the canvas or game container, not the whole page. Menus and text can then still zoom.
- Assign a `pointerId` to a player zone on `pointerdown`. This way, a finger that drifts across the midline still counts for its original owner.
- Treat `pointercancel` as "release" so a block does not get stuck.

### Gaps
- I found no web.dev article specific to multi-touch games; I relied on MDN only.
- I did not check whether `maxTouchPoints` reports 5 on iPhone Safari.

## Q3. PeerJS, signalling, STUN/TURN and NAT traversal

### Takeaway
PeerJS defaults to a free public broker at `0.peerjs.com:443` and hard-codes Google STUN plus public PeerJS TURN servers with fixed credentials (`peerjs`/`peerjsp`). That is convenient for a prototype. Its reliability has no guarantee, and GitHub issues report outages and delays. Plan on self-hosting PeerServer (free, Docker) and using a real TURN service, because roughly 15–22% of WebRTC sessions need a relay in published data, with mobile and corporate networks being worse.

### Cited Findings
- **Defaults in the PeerJS source (`lib/util.ts`):**
  - `CLOUD_HOST = "0.peerjs.com"`, `CLOUD_PORT = 443`.
  - `DEFAULT_CONFIG.iceServers` is `stun:stun.l.google.com:19302` plus `turn:eu-0.turn.peerjs.com:3478` and `turn:us-0.turn.peerjs.com:3478`, with username `peerjs` and credential `peerjsp`.
  - The `Peer` options documentation says the host "Defaults to `0.peerjs.com`" and the port "Defaults to `443`".
  - Sources: [peerjs/lib/util.ts](https://raw.githubusercontent.com/peers/peerjs/master/lib/util.ts); [peerjs/lib/peer.ts](https://raw.githubusercontent.com/peers/peerjs/master/lib/peer.ts).
- **Cloud server limits.** The client code says peer listing on the cloud server needs an email to team@peerjs.com to enable it for your API key. The cloud server is therefore keyed and restricted — [peerjs/lib/api.ts](https://raw.githubusercontent.com/peers/peerjs/master/lib/api.ts).
- **Versions.** The latest npm release is peerjs 1.5.5 (2025-06-07). A 2.0.0-beta.3 tag dates from 2022 — [npm registry: peerjs](https://registry.npmjs.org/peerjs).
- **Repository status.** About 13.5k stars and 184 open issues. Tested against recent Chrome, Edge, Firefox and Safari — [GitHub: peers/peerjs](https://github.com/peers/peerjs).
- **What the PeerServer does.** It only brokers connections: "Data is not proxied through the server."
  - Defaults: `concurrent_limit` 5000, `key` "peerjs", `alive_timeout` 60000 ms, `expire_timeout` 5000 ms. Peer discovery (`/peers`) is off unless `allow_discovery` is set.
  - Self-hosting: `npm install peer -g` or `docker run -p 9000:9000 peerjs/peerjs-server`, or embed it with `ExpressPeerServer`.
  - Source: [GitHub: peers/peerjs-server](https://github.com/peers/peerjs-server).
- PeerJS docs: "PeerJS uses PeerServer for session metadata and candidate signaling"; IDs are random unless provided, and "your application is responsible for sharing IDs" — [PeerJS docs](https://peerjs.com/docs/).
- **Reliability reports.**
  - GitHub issue #1350 reports connection delays of 6+ minutes on the cloud server while the status page showed everything operational — [peerjs issue #1350 (mirror)](https://github-users.yhajoa.workers.dev/peers/peerjs/issues/1350).
  - Issue #671 (May 2020) discusses the public service being unreachable, with the public TURN suspected to be down — [peerjs issue #671](https://www.github.com/peers/peerjs/issues/671).
  - The PeerJS docs note that a network blocking port 443 breaks the cloud server and suggest running your own PeerServer — [PeerJS docs](https://www.peerjs.com/docs).
  - A 2026 dev.to article, written by a vendor of a competing TURN service and so possibly biased, says the PeerJS cloud page asks high-traffic apps to self-host — [dev.to: PeerJS alternatives in 2026](https://dev.to/alakkadshaw/peerjs-alternatives-in-2026-free-turn-auto-reconnect-and-which-webrtc-library-to-actually-pick-14ad).
- **How often TURN is needed.**
  - callstats.io data (Jan 2015–Feb 2016, more than 100 customer companies): about **22%** of conferences needed a TURN relay, and about **9%** needed TURN over TCP. This is old and covers conferencing, not 1:1 calls — [webrtcHacks: usage stats](https://webrtchacks.com/usage-stats/).
  - A secondary compilation gives a range of roughly 15–22% and cites a Twilio figure of about 85% direct connections. I could not verify the Twilio figure at a primary source — [sover-docs annex](https://sover-docs.pages.dev/annex-webrtc-p2p-direct-connection-rates-mobile-home-nat).
  - BlogGeek.me says TURN is often needed on mobile carrier networks (carrier-grade NAT) — [BlogGeek.me: WebRTC TURN](https://bloggeek.me/webrtc-turn/).
  - An analysis on fippo's Medium examines the claim that "20% of WebRTC calls fail" — [Medium/fippo](https://medium.com/@fippo/67b185e49765).
- **Cloudflare Realtime TURN.**
  - Anycast, global network excluding China.
  - Free when used with the Realtime SFU; otherwise **$0.05 per GB** of outbound traffic.
  - Endpoints: `stun.cloudflare.com:3478/udp`; `turn.cloudflare.com` on 3478 or 443 over UDP, 3478 or 80 over TCP, and 5349 or 443 over TLS.
  - Per-allocation limits of roughly 5–10 kpps and roughly 50–100 Mbps.
  - Source: [Cloudflare Realtime TURN docs](https://developers.cloudflare.com/realtime/turn/).
  - Cloudflare's blog explains why anycast TURN helps global peer connections — [Cloudflare blog: TURN and anycast](https://blog.cloudflare.com/webrtc-turn-using-anycast).

### Inferences
- **Traffic volume.** A tower-stacking duel sends tiny messages (inputs, events, a few states per second). TURN traffic per match is likely kilobytes, so Cloudflare's $0.05/GB is negligible at casual scale. This is estimated, not measured.
- **The shared TURN credential.** It is public and fixed, and appears in the source code. It should not be relied on in production; use short-lived credentials from your own backend or provider.
- **Failure fallback.** Because roughly 1 in 5 connections may need relay, and both players will often be on mobile networks, the game needs a fallback: a TURN relay or a WebSocket relay server. Without one, a noticeable share of invites will fail silently.

### Gaps
- I found no recent (2023–2026) primary dataset on TURN usage for mobile-to-mobile connections specifically.
- I found no current uptime figure for `0.peerjs.com`.
- I did not confirm whether Cloudflare TURN credentials are short-lived. The page I fetched did not say; its API generates time-limited credentials, but that is unverified here.

## Q4. Alternatives to P2P: WebSocket relay, Firebase RTDB, Supabase Realtime, PartyKit/PartyServer, Colyseus

### Takeaway
A server relay removes NAT traversal entirely, at the cost of hosting. Free tiers are small but enough for casual 2-player rooms:
- Firebase Realtime Database Spark plan: 100 simultaneous connections.
- Supabase Realtime Free: 200 concurrent connections and 100 messages per second.

Important for 2026: **the hosted PartyKit platform is shutting down. Deploys stop on 16 Oct 2026 and the platform shuts down on 23 Oct 2026.** The successor is Cloudflare's PartyServer library on Durable Objects.

### Cited Findings
- **Firebase Realtime Database.** 100 simultaneous connections per database on Spark (free) and 200,000 on paid plans. About 1,000 writes per second per database; this is a soft limit — [Firebase RTDB limits](https://firebase.google.com/docs/database/usage/limits).
- **Supabase Realtime limits:**

  | Limit | Free | Pro |
  |---|---|---|
  | Concurrent connections | 200 | 500 |
  | Messages per second | 100 | 500 |
  | Channel joins per second | 100 | 500 |
  | Broadcast payload | 256 KB | 3,000 KB |
  | Presence messages per second | 20 | 50 |

  Pro without a spend cap goes up to 10,000 connections — [Supabase Realtime limits](https://supabase.com/docs/guides/realtime/limits).
- **PartyKit.** "The hosted PartyKit platform is shutting down." Deploys stop on 16 October and the platform shuts down on 23 October 2026. A migration guide to PartyServer is linked — [PartyKit docs](https://docs.partykit.io/).
- **PartyServer.** Lives in the `cloudflare/partykit` repo and is "Powered by Durable Objects."
  - Packages: `partyserver` (WebSockets, lifecycle hooks and broadcast on Durable Objects), `partysocket` (a client with reconnection and buffering), `y-partyserver`, and `partysync` (experimental).
  - Source: [GitHub: cloudflare/partykit](https://github.com/cloudflare/partykit).

### Inferences
- **What fits a room-code duel.**
  - A Durable Object per room (PartyServer) maps naturally to "one room = one match." It can act as authoritative referee: generate the seed, timestamp events and decide the winner. Supabase Broadcast channels or Firebase paths keyed by room code also work.
  - A Firebase free tier at 100 connections means about 50 simultaneous matches.
  - A Supabase free tier at 200 connections means about 100 matches.
- **Hybrid option.** Use a relay for signalling and room state, and PeerJS/WebRTC only for low-latency inputs when it connects, falling back to the relay otherwise.

### Gaps
- I did not fetch Colyseus docs (rooms, state sync, hosting); there is no verified data here.
- I did not verify Firebase `onDisconnect` details or pricing per GB.
- I did not verify PartyServer room-addressing URLs.
- I did not verify Cloudflare Durable Objects free-tier limits.

## Q5. Keeping two players in sync: inputs vs state, shared seed, latency, disconnects

### Takeaway
Deterministic lockstep sends only inputs and requires bit-identical simulation; floating-point determinism across browsers and devices is hard. For a physics-based stacker on heterogeneous phones, the safer approach (inference) is:
- each client simulates its own tower authoritatively;
- clients exchange events and low-rate state snapshots (block placed, height, fell);
- a **shared random seed** keeps the block sequence and wind identical for both players.

### Cited Findings
- **Deterministic lockstep (Glenn Fiedler).**
  - It is "a method of networking a system ... by sending only the inputs." Bandwidth scales with the size of the inputs, not the number of objects.
  - It requires the same initial state, the same inputs and the same delta time, with bit-exact results.
  - Determinism is not guaranteed across compilers, operating systems or architectures. Fiedler calls floating-point determinism "a complicated subject and there's no silver bullet."
  - The receiver "can only simulate frame n when it has the input for that frame," so late input causes stalls.
  - A playout buffer (100 ms in his example) smooths jitter but adds latency.
  - The example seeds randomness from the frame number.
  - Source: [Gaffer On Games: Deterministic Lockstep](https://gafferongames.com/post/deterministic_lockstep/).
- **Ordered delivery.** PeerJS's `util.supports.reliable` checks whether DataChannels support ordered (reliable) delivery, and uses BinaryPack/JSON/raw serializers — [peerjs/lib/util.ts](https://raw.githubusercontent.com/peers/peerjs/master/lib/util.ts).

### Inferences
- **Seeding the match.** The host (or the relay) generates a seed and sends it at match start. Both clients feed it to the same seeded PRNG (for example mulberry32 or sfc32) to draw the block order and the wind schedule. Fairness then comes from identical inputs from the game, even though the physics results differ per device.
  - The PRNG must be integer-based, not `Math.random`, so it reproduces across engines.
  - Physics should not need to match, because each player has their own tower.
- **Sync model.** Send events such as `{seq, blockIndex, x, t, result}` plus a periodic heartbeat. Show the opponent's tower as a replay or interpolated view, not a lockstep simulation. This avoids the input-stall problem Fiedler describes.
- **Disconnects.**
  - Use a heartbeat timeout (PeerServer's default alive_timeout is 60 s, which is too long for gameplay; set an application-level timeout of about 5–10 s).
  - Show "opponent reconnecting…", then award the win or allow a resume.
  - `partysocket`'s reconnect and buffering is an off-the-shelf option.
- **Anti-cheat for casual play.** Peer-to-peer with client-authoritative physics cannot prevent cheating. Mitigations:
  - sanity checks on the receiver (a height increase can't exceed the block size, the block index must match the seed sequence, timing must be plausible);
  - use a referee room (Durable Object) if leaderboards matter;
  - for friendly room-code play, accept the risk.
- **Latency.** For a non-contact race (separate towers), 100–300 ms of latency only delays how fresh the opponent's view is; it does not affect fairness. Only "attacks" (see Q6) need ordering, and those can be applied on the receiver's next block.

### Gaps
- I did not fetch Fiedler's snapshot-interpolation or state-synchronization articles, nor sources on rollback/GGPO.
- I found no published source specific to networking a physics stacker.

## Q6. Competitive versus design: attacks/garbage, catch-up, shared seed fairness, modes, best-of-3

### Takeaway
Versus puzzle games create interaction by sending "garbage" with counter or offset windows (Puyo Puyo). Tetris 99 adds targeting and badge multipliers that reward knocking out leaders. For a stacking duel, these suggest light "attacks", such as extra wind or a heavier block sent to the opponent, with a chance to counter.

### Cited Findings
- **Puyo Puyo offsetting (sousai).**
  - Introduced in Puyo Puyo 2 (1994). Your own chain cancels incoming garbage, and any excess is sent to the opponent.
  - Under classic offset, pending garbage drops once your chain ends.
  - Under continuous offset (Puyo Puyo Fever), garbage is held while you keep chaining.
  - Source: [Puyo Nexus: Offset rule](https://puyonexus.com/wiki/Sousai).
- **Puyo Puyo Tetris.** Converts a Tetris player's line clears into Puyo garbage using a formula that is not publicly known — [Hard Drop wiki: Puyo Puyo Tetris details](https://harddrop.com/wiki/Pwn_by_numbers/Puyo_Puyo_Tetris_details).
- **Tetris 99.**
  - Each badge raises attack power: +25% for one, +50% for two, up to double at four. KOing a badge holder takes their badges.
  - Players can target players attacking them, players with badges, and so on.
  - Sources: [Nintendo Life guide](https://nintendolife.com/news/2019/02/guide_how_to_claim_battle_royale_victory_in_tetris_99); [Destructoid on Tetris 99 mechanics](https://www.destructoid.com/the-depth-of-tetris-99s-mechanics-do-the-impossible-improve-a-perfect-game/); [Siliconera: choose your targets](https://www.siliconera.com/always-remember-to-choose-your-targets-in-tetris-99/).
- **Badge targeting as risk/reward.** Targeting badge holders is risky but pays off when you take out a leader — [Siliconera](https://www.siliconera.com/always-remember-to-choose-your-targets-in-tetris-99/).

### Inferences
- **Mapping to a stacker:**
  - A "perfect drop" streak charges an attack, such as a wind gust or an awkward block injected into the opponent's next queue.
  - The opponent can offset it with their own perfect drops, borrowing Puyo's offset rule.
  - Keep attacks visible (a pending-attack meter) so they feel fair.
- **Fairness.** The shared seed means both players get the same base sequence. Attacks are the only source of asymmetry.
- **Catch-up.** Tetris 99's badges are a snowball mechanic, not rubber-banding. For a casual 1v1, a mild catch-up such as a slightly bigger perfect-drop window for the trailing player is an option, but there is no source on its effect.
- **Modes.** "Survival" (first tower to collapse loses) versus "timed" (tallest after 60 s). Best-of-3 rounds with an immediate "Rematch" button is common practice, but I found no source for it.

### Gaps
- I found no GDC talk on versus-puzzle or local-multiplayer design.
- I found no source on rubber-banding (Mario Kart) or on whether best-of-3 helps casual retention.
- I found no Tetris 99 primary documentation (official Nintendo page not read in detail).

## Q7. Rooms, invite links, QR codes, Web Share API, rematch flow

### Takeaway
Use a short room code embedded in a URL (for example `?room=ABCD`), shared via `navigator.share()` where available, with copy-link and QR fallbacks. Web Share requires HTTPS and a user gesture, and is not Baseline. Feature-detect it and always offer a fallback.

### Cited Findings
- **Web Share API (`navigator.share()`):**
  - Requires a secure context (HTTPS), transient user activation (a click or tap) and the `web-share` permission policy.
  - Fields: `url`, `text`, `title`, `files`.
  - Rejects with `AbortError` (user cancelled), `NotAllowedError`, `TypeError`, `InvalidStateError` (a share is already in progress) or `DataError`.
  - Check file shares with `navigator.canShare()`.
  - MDN marks it "Limited availability", not Baseline.
  - Source: [MDN: Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
- **IDs and rooms with PeerJS.** IDs are random unless you pass your own, and the app must share them. A room code can be used as, or mapped to, the host's peer ID — [PeerJS docs](https://peerjs.com/docs/).
  - The default PeerServer ID generator is uuid v4, and a custom `generateClientId` can be supplied — [GitHub: peers/peerjs-server](https://github.com/peers/peerjs-server).

### Inferences
- **Room codes.**
  - 4–6 characters from an unambiguous alphabet (no 0/O, 1/I).
  - With PeerJS cloud, prefix with a game namespace to avoid ID collisions with other apps on the shared server, for example `towerstack-ABCD`.
  - On self-hosted PeerServer, `generateClientId` can issue short codes directly.
- **QR codes.** Useful when both players are in the same room but want two phones. They can be generated client-side with a JS library; I did not source a specific library.
- **Rematch flow.**
  - Keep the connection open after the match.
  - Both players tap "Rematch". The host generates a new seed, and the loser of the previous round could start.
  - Show "waiting for opponent…" with a timeout.

### Gaps
- I found no source with data on how invite link versus QR versus code entry affects conversion.
- I did not verify Web Share support per browser (the compatibility table was not captured). Treat iOS Safari and Android Chrome support as likely but unverified here.
