# Browser/web games and casual 1v1 multiplayer formats (2024–2026)

Scope: which HTML5 games and portals lead, why viral web games spread, which "solo + challenge a friend by code/link" patterns work, how web games make money, and which genres sync easily over WebRTC P2P (PeerJS). Research date: 2026-11-24. Many portal "top game" lists are third-party listicles. I used them only where marked, and preferred primary platform pages.

## 1. Most-played games and dominant genres on web portals (Poki, CrazyGames, Y8, etc.)

### Takeaway
The portals are large: Poki reports 100M+ monthly players, and secondary coverage of its 2024 review gives 8.1B gameplays. CrazyGames reported 35M MAU in mid-2024. Neither publishes an official year-end ranked "most played" list that I could find. Live snapshots show a mix of mobile-port runners (Subway Surfers), driving/physics (Drive Mad), rage/precision platformers (Level Devil), block puzzles, and real-time multiplayer browser games (Smash Karts, Bloxd, Krunker, Shell Shockers). Poki says its audience is "majority mobile", so thumb-friendly controls are a selection criterion.

### Cited Findings
- Poki calls itself the world's largest web gaming platform, with "over 100 million monthly active players". — [Poki Developers: Working with Poki](https://developers.poki.com/guide/working-with-poki)
- Poki's 2024 review, as reported by secondary coverage: 8.1 billion gameplays, 500 million players, 321 new titles added, 150,814 minutes of playtesting. The article lists no top titles or genres. — [Mobidictum](https://mobidictum.com/pokis-2024-milestones-a-booming-year-for-web-gaming/)
- Poki's homepage "trending" top 5 (live stats, a snapshot only, not a yearly ranking): Level Devil, Smash Karts, Subway Surfers, Blocky Blast Puzzle, Drive Mad. Poki calls Drive Mad its most popular car game. Level Devil (by Unept) is a Poki exclusive. This comes from a search summary of poki.com, so verify it live. — [Poki.com](https://poki.com/)
- Subway Surfers is described as one of the most searched games on Poki. This is a third-party listicle. — [softwaretestinghelp](https://www.softwaretestinghelp.com/best-poki-games/)
- Poki's selection criteria: quality (UX, feel, core loop), fit with a global audience, and tech optimized for both mobile and desktop web. Its audience is "majority mobile", so desktop-only games are at a disadvantage. Controls must work "as well with a thumb as with a mouse". Poki also wants fast loads, stable frame rates and lean files (no numeric thresholds given), originality ("clones of existing hits won't be promoted"), depth and replayability, a clear thumbnail with an immediately playable opening, and room to grow through updates. — [Poki: What we look for](https://developers.poki.com/guide/what-we-look-for)
- Poki publishes a "Player device report" based on a random sample of 100 million players, updated daily. The charts render dynamically and I could not extract the figures. — [Poki Player device report](https://developers.poki.com/guide/player-device-report)
- CrazyGames (Leuven, Belgium): 35M monthly active users, 4,000+ free games, 48 guaranteed homepage hours for each new game, revenue share that "pays developers millions of dollars each year". Its 2024 social layer added friends, online presence, one-click "play together" invites and joining, profiles and play streaks. CEO quote: the mission is "top-quality games that people can enjoy together." — [GamesBeat, June 2024](https://gamesbeat.com/crazygames-hits-35m-users-for-browser-games-and-launches-social-multiplayer-features/)
- CrazyGames does not host game servers. Developers bring their own multiplayer backend (Photon is the example given). — [CrazyGames docs FAQ](https://docs.crazygames.com/faq/)
- Poki offers a free networking library ("Netlib") for online multiplayer. — [Poki Developers](https://developers.poki.com/guide/working-with-poki)
- One review names Shell Shockers, Smash Karts, Bullet Force, Bloxd and Krunker as the top tier of CrazyGames browser games. This is a quality opinion, not play data. — [gamingpromax review (2026)](https://gamingpromax.com/crazygames-review-safe-free-worth-your-time-2026/)
- CrazyGames' Action category "most popular" list included "99 Nights: Forest Escape (bloxd.io)" at #9. The snapshot is undated. — [CrazyGames Action](https://www.crazygames.com/c/action)

### Inferences
- (Inference) The recurring genres across snapshots are fast-start runners, driving/stunt physics, precision/rage platformers, block puzzles, and lightweight real-time multiplayer (karts, shooters, sandbox .io). Poki's "majority mobile" audience and its thumb-control rule favor one-thumb or two-button games.
- (Inference) Both big portals now push social play (CrazyGames friends and invites, Poki Netlib), which signals that "play with a friend" is a growth lever the portals themselves are investing in.

### Gaps
- I found no official, published 2024–2026 ranked list of most-played games for Poki, CrazyGames, Miniclip or Y8. The specific titles in the brief (Basketball Stars, Rooftop Snipers, Getaway Shootout, Moto X3M, Slope, Retro Bowl, Stickman Hook) could not be verified with play counts from a primary source. Treat their popularity as anecdotal.
- Poki device split percentages (mobile vs desktop, OS) could not be extracted.
- Kongregate successors: nothing reliable found.

## 2. Viral web games and the mechanics behind their spread

### Takeaway
The viral web hits share zero install, instant comprehension, and one built-in social object: Wordle's spoiler-free emoji grid, an .io game's shared live arena, the skribbl/Gartic private-room link, Jackbox's room code, and Discord's in-call launch. Telegram tap-to-earn showed that growth driven by crypto incentives collapses once the payout happens, so it is not a model to emulate.

### Cited Findings
- **Wordle:** the NYT bought it on Jan 31, 2022 for "low seven figures". Players grew from 90 (Nov 1) to about 300,000 nearly two months later, per the Times release, and later to millions. The shareable green/yellow/grey emoji grid shows performance without spoiling the answer. One puzzle per day, with wins and streaks preserved. — [NPR](https://www.npr.org/2022/01/31/1077089945/nyt-wordle); [TIME](https://time.com/6143832/new-york-times-buys-wordle); [The Week](https://www.theweek.co.uk/arts-life/personal-technology/games/955280/wordle-word-game-explained)
- **2048:** Gabriele Cirulli wrote it in JavaScript/CSS over one weekend and released it on 9 March 2014 under the MIT license. It spread via Hacker News, drew 4M+ visitors in under a week, and once had 28,000 people playing at the same time. Open-source forks added leaderboards and better touch controls. It was derived from a clone of "1024!", itself related to Threes. Cirulli declined to monetize "a concept that [he] didn't invent". — [Wikipedia: 2048](https://en.wikipedia.org/wiki/2048_(video_game)); [City A.M.](https://www.cityam.com/how-one-19-year-old-won-internet-addictive-puzzler-2048/)
- **Agar.io / Slither.io (.io boom):** Agar.io (Matheus Valadares, browser release April 2015) spread thanks to free browser access and simple, intuitive mechanics. Slither.io (Steve Howse, March 2016) reportedly reached 60M+ daily players by June 2016 and was the most-Googled game of 2016. GamesBeat counted about 192M monthly visits to .io games, 85% of them going to a few titles. The daily and monthly figures measure different things. — [Wikipedia: Agar.io](https://en.wikipedia.org/wiki/Agar.io); [Wikiwand: Slither.io](https://www.wikiwand.com/en/articles/Slither.io); [GamesBeat](https://gamesbeat.com/?p=134941)
- **GeoGuessr Duels:** each player starts with 6,000 HP. When one player guesses, the opponent gets 15 more seconds. The score difference becomes damage, with a multiplier that grows each round. Ranked play uses Elo and divisions, with Moving, No Move and NMPZ modes. The 2024 World Cup used 10 rounds of 60 seconds. Details changed in 2026, and the sources differ slightly. — [GeoGuessr Fandom: Divisions](https://geoguessr.fandom.com/wiki/Divisions); [GeoGuessr Ranked Guide 2026](https://geoguessrguide.com/blog-geoguessr-ranked-guide.html); [Wikipedia: GeoGuessr World Championship](https://en.wikipedia.org/wiki/GeoGuessr_World_Championship)
- **skribbl.io / Gartic Phone:** both became staples of 2020 video calls because friends could join in a browser without installing anything. Both use a "Create private room" option and share it by link or code. Gartic Phone (Onrizon, 2020) combines Pictionary with Telephone and grew largely through streamers. A wiki claims a 250K-viewer peak on Twitch, which is unverified. — [dinogame.gg blog](https://dinogame.gg/blog/best-browser-games-2020-pandemic/); [Know Your Meme](https://knowyourmeme.com/editorials/what-is-gartic-phone-and-why-do-streamers-love-it-the-multiplayer-drawing-game-explained); [Jackbox: games like Gartic Phone](https://www.jackboxgames.com/games-like-gartic-phone)
- **Jackbox model:** players join at jackbox.tv in a browser, with no install, by entering a room code shown on the host screen. The phone acts as the controller, with a deliberately small input set (draw, pick buttons, type text). Private information goes to each player's phone, while the shared screen shows the common state. A disconnected player can rejoin with the same room code and name. — [Built In](https://builtin.com/articles/jackbox-games-design-party-pack); [Jackbox support](https://support.jackboxgames.com/hc/en-us/articles/15794771245975-How-do-I-get-started-playing-Jackbox-Games)
- **Discord Activities:** opened to all developers in Sept 2024. They are web apps in an iframe (any HTML5 build plus the Embedded App SDK) with Premium Apps monetization (durable and consumable SKUs). Discord says more than 25% of its MAU use apps and Activities. Death by AI (Playroom) peaked at 700K DAU. Discord has 200M+ MAU overall. All figures are self-reported. — [Discord blog: Build where the world plays](https://discord.com/blog/build-where-the-world-plays); [GamesBeat](https://gamesbeat.com/discord-opens-activities-in-app-games-and-features-to-all-developers/); [Phaser tutorial](https://phaser.io/news/2024/11/build-a-discord-activity-with-phaser)
- **Telegram mini apps (caveat):** Hamster Kombat fell about 86%, from 300M users (Aug 2024) to 41M monthly active (Nov 2024), after a delayed and disputed airdrop. About 2.3M users were banned and 6.8B tokens confiscated. Analytics firm Helika says disappointing airdrops ended the tap-to-earn "euphoria", and Telegram games struggled with revenue and retention in Q4 2024. — [Cointelegraph](https://cointelegraph.com/news/hamster-kombat-decline-telegram-game-competition-rise-of-paws); [The Block](https://www.theblock.co/news/web3/2025-02-07-telegram-games-had-trouble-earning-revenue-retaining-users-in-q4-report-339563); [Protos](https://protos.com/?p=79064)

### Inferences
- (Inference) Repeated pattern: (a) understandable within seconds, (b) no install or login, (c) a shareable artifact or link carries the invite (emoji grid, room link, room code), (d) a short session that ends in a natural "again?" moment (daily puzzle, next round, rematch).
- (Inference) Wordle's spoiler-free result card fits a solo + 1v1 game directly: everyone plays the same seed, and the result card doubles as a challenge.
- (Inference) The Telegram case shows that incentive-driven installs do not retain players. Its spread came from airdrop speculation, not from the gameplay.

### Gaps
- I found no reliable figure for Flappy Bird's web impact or its "$50K a day" revenue in this research. The 2048 sources only compare the two games.
- No primary player counts for skribbl.io, Gartic Phone or Chess.com/Lichess challenge links. Lichess and Chess.com "challenge via link" usage was not researched in depth.
- No current official NYT Wordle play counts were retrieved.

## 3. Casual 1v1 formats that work on phones (real-time vs async, room codes, rematch, daily challenges, ghosts)

### Takeaway
Two formats have the strongest sourced evidence. One is a room code or link with zero install (Jackbox, skribbl, Gartic). The other is a turn-and-wait duel with a time-pressure twist (GeoGuessr's 15-second counter-timer and HP-damage model, played in short fixed rounds). Asynchronous ghost racing (replaying a recorded input log) gives a PvP feel with no live connection or matchmaking. Shared-seed daily challenges with a shareable result card (Wordle) give asynchronous competition.

### Cited Findings
- Room-code join with no install, a rejoin path after a dropped connection, and a minimal phone input set (draw, buttons, text). — [Built In](https://builtin.com/articles/jackbox-games-design-party-pack); [Jackbox support](https://support.jackboxgames.com/hc/en-us/articles/15794771245975-How-do-I-get-started-playing-Jackbox-Games)
- Browser party games standardize on a "Create Private Room / Host Game" button on the main screen plus a share link. — [dinogame.gg](https://dinogame.gg/blog/best-browser-games-2020-pandemic/)
- Duel structure that turns parallel solo play into PvP: both players play the same round at the same time, and the score gap becomes HP damage with a growing multiplier. The first player to finish puts pressure on the other (a 15-second countdown). It uses fixed short rounds (World Cup: 10 rounds of 60 seconds). — [GeoGuessr Fandom](https://geoguessr.fandom.com/wiki/Divisions); [Wikipedia: GeoGuessr World Championship](https://en.wikipedia.org/wiki/GeoGuessr_World_Championship)
- CrazyGames' social layer: friends list, online presence, one-click invite and join, play streaks. — [GamesBeat](https://gamesbeat.com/crazygames-hits-35m-users-for-browser-games-and-launches-social-multiplayer-features/)
- Ghost racing via a deterministic simulation: a recorded run replays bit-for-bit. In online races each player's physics runs locally, so "a ping spike can make an opponent's ghost stutter but can never touch your wheels." — [Mars Rally Championship: Ghost Racing](https://marsrallychampionship.com/ghost-racing); [Ghost racing explained](https://marsrallychampionship.com/blog/ghost-racing-explained)
- PolyTrack (a browser racer) uses asynchronous multiplayer through ghost data with deterministic physics. LibreCorsa offers private WebRTC P2P rooms, and any lap on the leaderboard can be raced as a ghost. — [PolyTrack](https://browsergamers.gg/game/polytrack); [LibreCorsa GitHub](https://github.com/KhazP/librecorsa)
- A serverless time-trial project verifies laps by re-simulating the input log in a Cloudflare Worker (WASM physics), so the server never needs to trust the client. — [GitHub: serverless-time-trial-racing-game](https://github.com/eric-rolph/serverless-time-trial-racing-game)
- Daily shared puzzle + streaks + a spoiler-free share grid (Wordle). — [NPR](https://www.npr.org/2022/01/31/1077089945/nyt-wordle)

### Inferences
- (Inference) The best fit for a small team: (1) solo mode built on a seeded daily or level structure; (2) "Challenge a friend" creates a PeerJS room code plus a link (`?room=XXXX`) that opens straight into the lobby; (3) both players play the same seed at the same time and exchange scores or state (GeoGuessr-style round damage, or a best-of-3); (4) a one-tap "Rematch" that keeps the connection and swaps or rerolls the seed; (5) a result card to share (emoji or text grid) that includes the challenge link. This is design synthesis, not a sourced fact.
- (Inference) Short rounds (30–90 s) and best-of-N formats suit mobile sessions and make a rematch cheap. GeoGuessr's 60-second rounds are the one sourced anchor here.
- (Inference) A ghost replay (recorded inputs or positions plus a seed) is the cheapest "fake PvP". It works when the friend is offline: send a link containing the seed and the run, and the friend races the ghost later.
- (Inference) Following Jackbox, the rejoin-with-the-same-code flow matters on mobile, where tab switching and network changes are frequent.

### Gaps
- I found no published data comparing retention or session length for real-time vs async 1v1 in casual web games.
- No primary data on rematch-rate impact.

## 4. Monetization options for web games

### Takeaway
Portal revenue share is the main route. Poki pays 50/50 on traffic it brings and 100% on your own traffic, with web exclusivity. CrazyGames' standard split is not published in its main docs. Google H5 Games Ads (Ad Placement API: `adBreak()` and `adConfig()`, interstitial plus opt-in rewarded) serves self-hosted games but is in closed beta. Public eCPM figures are scarce and vendor-reported.

### Cited Findings
- **Poki:** users who arrive directly (bookmarks, search, social, your own community) earn 100% of their revenue for you. Users who arrive through Poki.com or Poki marketing are split 50/50. Web exclusivity is required (no other web portals); Steam, app stores and consoles are not affected. — [Poki Developers](https://developers.poki.com/guide/working-with-poki)
- **CrazyGames:** developers earn through an ad revenue share and optional in-game purchases. The main docs publish no fixed standard percentage. A 2026 GameMaker jam set 60% of ad revenue (after costs are recouped) and 70% of IAP for developers, but those are jam terms only. A 2021 terms PDF referenced a fixed 20% of game-related ad revenue, with an increased share for a 2-month exclusivity period; it may be superseded. The payout minimum is €100. — [CrazyGames FAQ](https://docs.crazygames.com/faq/); [Jam guide](https://crazygames.indiehero.io/cggmwj-jg/); [2021 terms PDF](https://files.crazygames.com/documents/developer_terms_20210211.pdf)
- **Other shares, per a third-party compilation that cites each platform's own pages (verify before use):** GameMonetize 45%. GameDistribution 33% of net. Y8 50% of in-game ad revenue. Playgama 50% on its own site, with partner tiers of 70/80/90%. itch.io 90% by default. Discord Activities 85% (15% tier) or 70% (30% tier). — [Cinevva: Web game monetization](https://app.cinevva.com/guides/web-game-monetization)
- **Google H5 Games Ads / Ad Placement API:** `adBreak()` defines placements and `adConfig()` sets options. It works in browsers and app WebViews and is bundled in the AdSense code. `data-adbreak-test="on"` enables test mode. Rewarded ads must be opted into individually ("cannot opt in to automatically see rewarded ads"). The program is a closed beta and any H5 games site owner may apply. It integrates with AdSense for Platforms for distributors. — [Ad Placement API docs](https://developers.google.com/ad-placement/apis); [H5 Games Ads](https://adsense.google.com/start/h5-games-ads/); [Beta sign-up](https://developers.google.com/ad-placement/docs/beta); [Rewarded ads policy](https://support.google.com/adsense/answer/9959170)
- **eCPM data points (vendor-reported):** AppLixir claims $4+ eCPM on its web rewarded inventory (100M+ monthly impressions). Google says one publisher (WOSO) saw revenue rise 20% and eCPM rise 50% within 3 months of adopting H5 Games Ads. — summarized in [Cinevva](https://app.cinevva.com/guides/web-game-monetization); [H5 Games Ads page](https://adsense.google.com/start/h5-games-ads/)
- **Discord Activities:** Premium Apps monetization through durable and consumable SKUs. — [GamesBeat](https://gamesbeat.com/discord-opens-activities-in-app-games-and-features-to-all-developers/)

### Inferences
- (Inference) For a single-file HTML5 game: hosting it yourself with H5 Games Ads keeps 100% but needs traffic and beta approval. Submitting to Poki trades exclusivity for distribution, and Poki still pays 100% on traffic you drive yourself (for example, shared challenge links), which rewards a viral link loop. Natural ad slots: an interstitial between rounds or rematches, and an opt-in rewarded ad for continues or cosmetics.
- (Inference) Portal SDKs (Poki, CrazyGames) generally require using their ad calls, and a single-file build would need to integrate their SDK script.

### Gaps
- No trustworthy, independent RPM or eCPM ranges by region for web game ads. The only numbers found are vendor marketing claims.
- No sponsorship-market data for 2024–2026 (the old Flash-era sponsorship model was not researched).

## 5. Technical fit: which genres are easy or hard to sync over WebRTC P2P (PeerJS)

### Takeaway
Turn-based play, simultaneous independent play with score exchange on a shared seed, and async ghost replays are easy over P2P. Real-time physics duels need deterministic lockstep or rollback, and cross-browser floating-point determinism is fragile; Glenn Fiedler calls it "almost impossible to guarantee". PeerJS adds a connectivity caveat: symmetric NAT and carrier-grade NAT can prevent direct connections without a TURN relay, which matters for mobile users on cellular data.

### Cited Findings
- Fiedler (Gaffer on Games): floating-point determinism across machines is possible only with the same compiler, executable and architecture plus platform tricks. In his lockstep article, "differences in floating point behavior between compilers, OS's and even instruction sets make it almost impossible to guarantee determinism." — [Floating Point Determinism](https://gafferongames.com/post/floating_point_determinism); [Deterministic Lockstep](https://gafferongames.com/post/deterministic_lockstep/)
- A Frontier GDC 2024 talk reports that cross-platform determinism is achievable under the right constraints. Several RTS developers chose fixed-point math to avoid float problems. — [GDC 2024 slides (Pollard)](https://media.gdcvault.com/gdc2024/Slides/GDC+slide+presentations/Pollard_Bradley_CrossPlatformDeterminism+2024-03-26+09.34.19.pdf); [Game Developer: Minimizing the pain of lockstep](https://gamedeveloper.com/programming/minimizing-the-pain-of-lockstep-multiplayer)
- A browser RTS over WebRTC needed input barriers, adaptive command delay, heartbeats and sync requests for lockstep. An emulator-netplay project lists cross-browser determinism, rollback and NAT as open issues. — [VOIDSTRIKE GitHub](https://github.com/braedonsaunders/voidstrike); [Emulator-Online-Multiplayer](https://github.com/Alisky1223/Emulator-Online-Multiplayer)
- WASM physics is cited as giving bit-exact float results for re-simulation. — [serverless time-trial repo](https://github.com/eric-rolph/serverless-time-trial-racing-game)
- PeerJS FAQ: "a small percentage of users are behind symmetric NATs". Two such users cannot connect without a TURN proxy. Mobile carrier NAT often behaves symmetrically or blocks UDP, and blocking varies by carrier. One GitHub issue reports failures where port 443 to the cloud PeerServer is blocked. — [PeerJS FAQ](https://peerjs.com/client/faq); [PeerJS issue #1182](https://www.Github.com/peers/peerjs/issues/1182); [Apple dev forum](https://developer.apple.com/forums/thread/698156); [Using TURN with PeerJS](https://dev.to/alakkadshaw/how-to-use-turn-server-with-peerjs-6eb)

### Inferences
- (Inference) Easy over P2P: turn-based games (board, card, word, artillery turns); simultaneous same-seed play with score or HP exchange each round (GeoGuessr-style; puzzle or reaction races); async ghost or seed challenges sent by link. Medium: low-speed real-time games where one peer is authoritative (host-authoritative: the host simulates and the guest sends inputs), which tolerates float differences because only the host simulates. Hard: twitch physics shooters or fighters needing fairness, which need lockstep or rollback plus determinism.
- (Inference) For a small team: make one peer (the room creator) authoritative, send only inputs or events plus a seed, use integer or fixed-step logic for anything both sides simulate, and configure a TURN fallback, or accept and message failures gracefully ("connection failed, play the ghost challenge instead").

### Gaps
- No published PeerJS or WebRTC connection-failure rate for mobile networks. It would have to be measured in-game (ICE state and candidate type).
- No measured cross-browser determinism data for JavaScript `Math` functions (for example, whether `Math.sin` differs between engines) was retrieved.
