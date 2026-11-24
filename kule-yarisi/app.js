// Düello Arenası — menü, tek kişilik akış, online maç (oda kodu / davet linki), karışık düello.
(() => {
  "use strict";
  const { clamp, rr, txt, fit, store, SFX, AU } = K;
  const $ = s => document.querySelector(s);
  const cv = $("#c"), ctx = cv.getContext("2d", { alpha: false });
  let W = 1, H = 1, DPR = 1, SAFE_TOP = 0;
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  function resize() {
    SAFE_TOP = Math.min(60, probe.getBoundingClientRect().height || 0);
    const r = cv.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  }
  window.addEventListener("resize", resize);

  const cfg = {
    layout: store.get("layout2", "single") === "online" ? "online" : "single",
    mt: store.get("mt", "mix"),
  };
  if (cfg.mt !== "mix" && !K.game(cfg.mt)) cfg.mt = "mix";
  const isOnline = () => cfg.layout === "online";
  const MIX_ROUNDS = 5, MIX_WIN = 3;

  // ---------------- maç durumu ----------------
  const M = {
    mode: "single", gid: null, def: null, inst: null, ph: "lobby", t: 0, timeLeft: null, clock: 0,
    ready: false, r: 0, ri: 0, rs: [], oppRs: [], wins: [0, 0], order: [], mt: "mix", matchSeed: 0,
    note: "", roundWin: null, oppScore: 0, finalWin: null, newBest: false,
  };
  let screen = "menu";

  function dispose() { if (M.inst && M.inst.dispose) { try { M.inst.dispose(); } catch (e) {} } }
  function startIntro(gid, seed) {
    dispose();
    M.gid = gid; M.def = K.game(gid);
    M.inst = M.def.create({ seed, mode: M.mode });
    M.ph = "intro"; M.t = 3.2; M.timeLeft = M.def.timeLimit(M.mode);
    AU.level = 0;
    if (gid === "kelime" && K.loadWords) K.loadWords().catch(() => {});
  }
  function startSingle(gid) {
    M.mode = "single";
    startIntro(gid, (Math.random() * 2147483646) | 0);
    showGame();
  }
  function finishRound() {
    const sc = Math.round(M.inst.score);
    AU.level = 0; K.setWind(0); dispose();
    if (M.mode === "single") {
      M.newBest = K.saveBest(M.gid, sc);
      M.ph = "final"; M.t = 0;
      (M.newBest ? SFX.win : SFX.lose)();
      renderLists();
    } else {
      M.rs[M.ri] = sc; M.ph = "done"; M.t = 0;
      pushPresence(true);
    }
  }

  // ---------------- güncelleme ----------------
  function update(dt) {
    M.clock += dt;
    if (screen !== "game") return;
    const inst = M.inst;
    if (M.ph === "intro") {
      const before = Math.ceil(M.t - 0.2);
      M.t -= dt;
      const after = Math.ceil(M.t - 0.2);
      if (after !== before && after >= 1 && after <= 3) SFX.beep(false);
      if (M.t <= 0.2) { M.ph = "play"; SFX.beep(true); AU.level = 1; keepAwake(); }
      if (inst) inst.update(dt, false);
    } else if (M.ph === "play") {
      inst.update(dt, true);
      if (M.timeLeft != null) {
        const before = Math.ceil(M.timeLeft);
        M.timeLeft = Math.max(0, M.timeLeft - dt);
        if (Math.ceil(M.timeLeft) !== before && M.timeLeft <= 5 && M.timeLeft > 0) SFX.tick();
        AU.level = M.timeLeft <= 10 ? 2 : 1;
        if (M.timeLeft <= 0) finishRound();
      }
      if (M.ph === "play" && inst.over) finishRound();
      K.setWind(M.ph === "play" ? inst.windLevel || 0 : 0);
    } else {
      M.t += dt; // tur bitince oyun donar: gösterilen puan kaydedilenle aynı kalır
    }
    if (M.mode === "duel") onlineTick(dt);
  }

  // ---------------- online taşıma (claude.ai room veya PeerJS) ----------------
  const net = { apiP: null, room: null, code: "", host: false, oppSeen: 0, lastSend: 0 };
  const ROOM_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const newCode = () => { let c = ""; for (let i = 0; i < 4; i++) c += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)]; return c; };
  function getRoomApi() {
    if (!net.apiP) net.apiP = K.IN_CLAUDE ? Promise.resolve(window.claude.use("room")).catch(() => null) : Promise.resolve(null);
    return net.apiP;
  }
  function wrapRoom(nr) {
    const t = {
      kind: "room",
      send(d) { nr.presence(d).catch(() => {}); },
      opp() { let ps; try { ps = nr.peers(); } catch (e) { return null; } for (const p of ps) { if (p.sameTab || p.kind !== "viewer") continue; if (p.presence && p.presence.v === 3) return p.presence; } return null; },
      leave() { return nr.leave(); },
    };
    nr.onPeers(() => updateRoomStatus(), () => { if (net.room === t) { net.room = null; setRoomStatus("Bağlantı koptu. Odaya yeniden katılın."); refreshMenu(); } });
    return t;
  }
  let peerLibP = null;
  function loadPeerJS() {
    if (window.Peer) return Promise.resolve();
    if (!peerLibP) peerLibP = new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js"; sc.onload = () => res(); sc.onerror = () => { peerLibP = null; rej({ code: "load" }); }; document.head.appendChild(sc); });
    return peerLibP;
  }
  async function peerTransport(code, host) {
    await loadPeerJS();
    const hostId = "kule-yarisi-" + code.toLowerCase();
    return new Promise((resolve, reject) => {
      const peer = host ? new window.Peer(hostId, { debug: 0 }) : new window.Peer({ debug: 0 });
      const t = {
        kind: "peer", conn: null, last: null, lastAt: 0,
        send(d) { if (t.conn && t.conn.open) { try { t.conn.send(d); } catch (e) {} } },
        opp() { return t.last && performance.now() - t.lastAt < 3500 ? t.last : null; },
        leave() { t.closed = true; try { peer.destroy(); } catch (e) {} },
      };
      let settled = false;
      const fail = c => { if (settled) return; settled = true; try { peer.destroy(); } catch (e) {} reject({ code: c }); };
      function attach(conn) {
        if (t.conn && t.conn !== conn) { try { t.conn.close(); } catch (e) {} }
        t.conn = conn;
        conn.on("open", () => { if (!settled) { settled = true; resolve(t); } pushPresence(true); updateRoomStatus(); });
        conn.on("data", d => { if (!d || typeof d !== "object" || d.v !== 3) return; const first = !t.opp(); t.last = d; t.lastAt = performance.now(); if (first) updateRoomStatus(); });
        conn.on("close", () => { if (t.conn === conn) t.conn = null; t.last = null; updateRoomStatus(); });
        conn.on("error", () => {});
      }
      peer.on("open", () => { if (host) { settled = true; resolve(t); return; } attach(peer.connect(hostId, { reliable: true, serialization: "json" })); setTimeout(() => fail("timeout"), 15000); });
      peer.on("connection", c => { if (host) attach(c); else c.close(); });
      peer.on("error", e => { if (!settled) fail((e && e.type) || "error"); });
      peer.on("disconnected", () => { if (!t.closed) { try { peer.reconnect(); } catch (e) {} } });
    });
  }
  function joinError(e) {
    const c = (e && (e.code || e.type)) || "error";
    if (c === "peer-unavailable" || c === "timeout") return "Bu kodla açık bir oda bulunamadı. Kodu kontrol et; odayı kuranın oyunu açık olmalı.";
    if (c === "unavailable-id") return "Bu kod şu an kullanımda. Tekrar Oda kur'a bas.";
    if (c === "load") return "Online bileşeni yüklenemedi. İnternet bağlantını kontrol et.";
    if (c === "network" || c === "server-error" || c === "socket-error" || c === "socket-closed") return "Bağlantı sunucusuna ulaşılamadı. İnternetini kontrol edip tekrar dene.";
    if (c === "browser-incompatible") return "Bu tarayıcı online modu desteklemiyor. Chrome ya da Safari'nin güncel sürümünü dene.";
    return "Odaya bağlanılamadı (" + c + "). Biraz sonra tekrar dene.";
  }
  async function joinRoom(code, host, retried) {
    code = (code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    if (code.length !== 4) { setRoomStatus("Kod 4 karakter olmalı."); return; }
    setRoomStatus("Bağlanıyor…");
    if (net.room) { const old = net.room; net.room = null; try { await old.leave(); } catch (e) {} }
    try {
      const api = await getRoomApi();
      if (api) net.room = wrapRoom(await api.join("kule-" + code.toLowerCase()));
      else if (!K.IN_CLAUDE && typeof RTCPeerConnection !== "undefined") net.room = await peerTransport(code, host);
      else { setRoomStatus("Online mod bu görünümde kullanılamıyor. Oyunu web adresinden aç ya da claude.ai'de giriş yapmış olarak aç."); refreshMenu(); return; }
      net.code = code; net.host = host; M.r = 0; M.ready = false;
      pushPresence(true); updateRoomStatus();
    } catch (e) {
      net.room = null;
      if (host && !retried && e && e.code === "unavailable-id") return joinRoom(newCode(), true, true);
      setRoomStatus(joinError(e));
    }
    refreshMenu();
  }
  async function leaveRoom() {
    const old = net.room; net.room = null; net.code = "";
    if (old) { try { await old.leave(); } catch (e) {} }
    setRoomStatus("Bir oda kur ve kodu arkadaşına söyle, ya da onun kodunu yazıp katıl.");
    refreshMenu();
  }
  const opp = () => (net.room ? net.room.opp() : null);
  setInterval(() => { if (net.room && net.room.kind === "peer") pushPresence(true); }, 500);

  function pushPresence(force) {
    if (!net.room) return;
    const t = performance.now();
    if (!force && t - net.lastSend < 80) return;
    net.lastSend = t;
    const inGame = screen === "game" && M.mode === "duel";
    net.room.send({
      v: 3, ph: inGame ? M.ph : "lobby", ready: inGame && M.ready, r: M.r, ri: M.ri, rs: M.rs.slice(), host: net.host, mt: cfg.mt,
      gid: M.gid, sc: M.inst ? Math.round(M.inst.score) : 0, g: inGame && M.ph === "play" && M.inst ? M.inst.net() : null,
      tl: M.timeLeft == null ? -1 : Math.round(M.timeLeft * 10) / 10,
    });
  }

  function mixOrder(seed) {
    const ids = K.GAMES.filter(g => g.mix !== false).map(g => g.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(K.hash(seed, 900 + i) * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return ids;
  }
  const roundSeed = ri => (K.hash(M.matchSeed, 31 + ri) * 2147483646) | 0;
  function startMatch(r, mt) {
    M.mode = "duel"; M.r = r; M.mt = mt; M.ri = 0; M.rs = []; M.oppRs = []; M.wins = [0, 0]; M.note = ""; M.finalWin = null; M.ready = true;
    M.matchSeed = K.strHash(net.code + ":" + r);
    M.order = mt === "mix" ? mixOrder(M.matchSeed) : [mt];
    startIntro(M.order[0], roundSeed(0));
    pushPresence(true);
  }
  function onlineTick() {
    const o = opp();
    if (o) net.oppSeen = M.clock;
    if (o && o.r === M.r && Array.isArray(o.rs)) M.oppRs = o.rs.slice();
    if (!net.host && o && o.host && o.mt && o.mt !== cfg.mt && (M.ph === "lobby" || M.ph === "final")) { cfg.mt = o.mt; }
    if (M.ph === "lobby" || (M.ph === "final" && M.t > 0.9)) {
      if (M.ready && o && o.ready) {
        const idle = o.ph === "lobby" || o.ph === "final";
        const started = o.ph !== "lobby" && o.ph !== "final" && (o.r | 0) > M.r;
        if (idle || started) {
          const mt = net.host ? cfg.mt : (o.mt || cfg.mt);
          startMatch(idle ? Math.max(M.r, o.r | 0) + 1 : (o.r | 0), K.game(mt) || mt === "mix" ? mt : "mix");
        }
      }
    }
    const live = ["intro", "play", "done", "result"].includes(M.ph);
    if (live && !o && M.clock - net.oppSeen > 8) { M.note = "Rakibin bağlantısı koptu"; finalize(0); return; }
    if (M.ph === "done" && o && o.r === M.r && Array.isArray(o.rs) && o.rs[M.ri] != null) {
      const my = M.rs[M.ri], os = +o.rs[M.ri] || 0;
      const w = my > os ? 0 : my < os ? 1 : -1;
      if (w >= 0) M.wins[w]++;
      M.roundWin = w; M.oppScore = os; M.ph = "result"; M.t = 0;
      if (w === 0) SFX.arp([0, 4, 7, 12], 0.07, 0.7); else if (w === 1) SFX.lose(); else SFX.click();
      pushPresence(true);
    }
    if (M.ph === "result" && M.t >= 3.4) {
      const over = M.mt !== "mix" || M.wins[0] >= MIX_WIN || M.wins[1] >= MIX_WIN || M.ri >= MIX_ROUNDS - 1;
      if (over) {
        let w = M.wins[0] > M.wins[1] ? 0 : M.wins[0] < M.wins[1] ? 1 : -1;
        if (w < 0) { const a = M.rs.reduce((s, v) => s + (v || 0), 0), b = M.oppRs.reduce((s, v) => s + (+v || 0), 0); w = a > b ? 0 : a < b ? 1 : -1; }
        finalize(w);
      } else { M.ri++; startIntro(M.order[M.ri], roundSeed(M.ri)); pushPresence(true); }
    }
    pushPresence(false);
  }
  function finalize(w) {
    M.ph = "final"; M.t = 0; M.finalWin = w; M.ready = false;
    AU.level = 0; K.setWind(0);
    (w === 0 ? SFX.win : w === 1 ? SFX.lose : SFX.click)();
    pushPresence(true);
  }

  // ---------------- çizim ----------------
  function geom() {
    const hud = Math.round(clamp(H * 0.09, 58, 78));
    if (M.mode === "duel") {
      const oh = Math.round(clamp(H * 0.24, 130, 220));
      return { top: SAFE_TOP, opp: { x: 0, y: SAFE_TOP, w: W, h: oh }, play: { x: 0, y: SAFE_TOP + oh + 4, w: W, h: H - SAFE_TOP - oh - 4 - hud }, hud: { x: 0, y: H - hud, w: W, h: hud } };
    }
    const bar = SAFE_TOP + 60;
    return { top: bar, bar: { x: 0, y: 0, w: W, h: bar }, play: { x: 0, y: bar, w: W, h: H - bar - hud }, hud: { x: 0, y: H - hud, w: W, h: hud } };
  }
  function panel(R, lines, accent) {
    const pw = Math.min(R.w - 24, 420);
    let total = 0; for (const l of lines) total += l.s * (l.gap || 1.32);
    const ph = total + 34, cx = R.x + R.w / 2, y = Math.max(R.y + 8, R.y + R.h * 0.46 - ph / 2), x = cx - pw / 2;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(14,17,26,0.92)"; rr(ctx, x, y, pw, ph, 14); ctx.fill(); ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, pw - 1, ph - 1, 14); ctx.stroke();
    ctx.fillStyle = accent || "#f4b400"; rr(ctx, x + 18, y, pw - 36, 3, 2); ctx.fill();
    let yy = y + 17;
    for (const l of lines) { const h = l.s * (l.gap || 1.32); txt(ctx, l.t, cx, yy + h / 2, fit(ctx, l.t, pw - 32, l.s, l.f, l.w), l.c || "#f3efe7", { f: l.f, w: l.w, a: l.a, ls: l.ls }); yy += h; }
  }
  function drawHud(R) {
    const def = M.def, info = M.inst && M.inst.info ? M.inst.info() : {};
    ctx.fillStyle = "#0c0e15"; ctx.fillRect(R.x, R.y, R.w, R.h + 40);
    ctx.fillStyle = def ? def.color : "#f4b400"; ctx.fillRect(R.x, R.y, R.w, 3);
    const pad = 14, nameSize = Math.round(Math.min(R.h * 0.3, W / 16));
    txt(ctx, def ? K.upper(def.name) : "", pad, R.y + R.h * 0.34, nameSize, def ? def.color : "#fff", { align: "left", ls: "1px" });
    let x = pad; const rowY = R.y + R.h * 0.7;
    if (info.lives != null) { const hs = Math.max(10, Math.min(15, R.h * 0.2)); for (let i = 0; i < info.maxLives; i++) { K.heart(ctx, x + hs / 2, rowY - hs / 2, hs, i < info.lives ? "#ff4d5e" : "rgba(255,255,255,0.14)"); x += hs + 4; } x += 6; }
    if (info.extra) txt(ctx, info.extra, x, rowY, Math.round(nameSize * 0.75), "#ffd34d", { align: "left" });
    const num = Math.round(Math.min(R.h * 0.46, W / 9));
    txt(ctx, K.fmt(M.inst ? M.inst.score : 0), R.w - pad, R.y + R.h * (info.sub ? 0.4 : 0.52), num, "#f3efe7", { align: "right", f: K.DISP, w: "400" });
    if (info.sub) txt(ctx, info.sub, R.w - pad, R.y + R.h * 0.78, Math.round(num * 0.36), "rgba(243,239,231,0.65)", { align: "right" });
    if (M.timeLeft != null && (M.ph === "play" || M.ph === "intro")) {
      const s = Math.ceil(M.timeLeft), warn = s <= 10 && M.ph === "play";
      txt(ctx, Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"), R.w / 2, R.y + R.h / 2 + 1, Math.round(num * 0.8), warn ? "#ff6b78" : "#f3efe7", { f: K.DISP, w: "400", a: warn ? 0.75 + 0.25 * Math.sin(M.clock * 10) : 1 });
    }
  }
  function drawOpp(R) {
    const o = opp();
    ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
    const live = o && o.r === M.r && o.ri === M.ri && o.ph === "play" && o.gid === M.gid && M.def;
    if (live) M.def.drawRemote(ctx, R, o.g || {}, M.clock);
    else { K.bg(ctx, R, "#1a1e2c", "#10131d"); }
    ctx.fillStyle = "rgba(10,12,18,0.6)"; ctx.fillRect(R.x, R.y, R.w, 30);
    txt(ctx, "RAKİP", 12, R.y + 16, 15, "#8ef0e2", { align: "left", ls: "2px" });
    if (o && o.r === M.r && M.ph !== "lobby") txt(ctx, K.fmt(o.ri === M.ri ? (Array.isArray(o.rs) && o.rs[M.ri] != null ? o.rs[M.ri] : o.sc || 0) : 0), R.w - 64, R.y + 16, 17, "#fff", { align: "right", f: K.DISP, w: "400" });
    if (M.mode === "duel" && M.mt === "mix" && M.ph !== "lobby") txt(ctx, "TUR " + (M.ri + 1) + " · SEN " + M.wins[0] + " – " + M.wins[1] + " RAKİP", R.w / 2, R.y + 16, 14, "#ffd34d", { ls: "1px" });
    if (!live) {
      let msg = "";
      if (!o) msg = net.room ? "Rakip bekleniyor… Oda: " + net.code : "Bağlı değil";
      else if (M.ph === "lobby" || M.ph === "final") msg = o.ready ? "Rakip hazır ✓" : "Rakip hazırlanıyor…";
      else if (o.r === M.r && Array.isArray(o.rs) && o.rs[M.ri] != null) msg = "Rakip bitirdi: " + K.fmt(o.rs[M.ri]);
      else msg = "Rakip yükleniyor…";
      txt(ctx, msg, R.w / 2, R.y + (R.h + 30) / 2, 17, "rgba(243,239,231,0.85)", { w: "700" });
    }
    ctx.restore();
    K.hazard(ctx, 0, R.y + R.h, W, 4, "#15171c", "#f4b400");
  }
  function drawGame() {
    const G = geom(), P = G.play;
    if (M.inst) M.inst.draw(ctx, P, M.ph === "play");
    else K.bg(ctx, P, "#1a1e2c", "#10131d");
    if (G.opp) { ctx.fillStyle = "#0c0e15"; ctx.fillRect(0, 0, W, SAFE_TOP); drawOpp(G.opp); }
    if (G.bar) {
      ctx.fillStyle = "#0c0e15"; ctx.fillRect(0, 0, W, G.bar.h);
      ctx.fillStyle = M.def ? M.def.color : "#f4b400"; ctx.fillRect(0, G.bar.h - 2, W, 2);
      txt(ctx, "TEK KİŞİ", 14, SAFE_TOP + 20, 13, "#a3a9b8", { align: "left", ls: "2px" });
      txt(ctx, "REKOR " + K.fmt(Math.max(K.best(M.gid), M.ph === "final" ? 0 : Math.round(M.inst ? M.inst.score : 0))), 14, SAFE_TOP + 41, 18, "#f3efe7", { align: "left", ls: "1px" });
    }
    drawHud(G.hud);
    const def = M.def, pulse = 0.6 + 0.4 * Math.sin(M.clock * 5);
    const big = Math.round(clamp(Math.min(W / 9, P.h / 8), 22, 46)), mid = Math.round(big * 0.52), small = Math.round(Math.max(13, big * 0.4));
    if (M.ph === "lobby") {
      const mtName = M.mt === "mix" || cfg.mt === "mix" ? "Karışık düello · ilk 3 turu alan kazanır" : K.game(cfg.mt).name + " · tek tur";
      panel(P, [
        { t: "HAZIR MISIN?", s: big, f: K.DISP, w: "400", c: "#f4b400" },
        { t: mtName, s: small, w: "600", c: "#a3a9b8" },
        { t: M.ready ? "HAZIR ✓  RAKİP BEKLENİYOR" : "BAŞLAMAK İÇİN DOKUN", s: mid, a: M.ready ? 1 : pulse, c: M.ready ? "#8ef0e2" : "#f3efe7", gap: 1.6, ls: "1px" },
      ], "#f4b400");
    } else if (M.ph === "intro" && def) {
      const k = Math.ceil(M.t - 0.2);
      const head = M.mode === "duel" && M.mt === "mix" ? "TUR " + (M.ri + 1) : M.mode === "duel" ? "DÜELLO" : "TEK KİŞİ";
      panel(P, [
        { t: head, s: small, c: "#a3a9b8", ls: "3px" },
        { t: K.upper(def.name), s: big, f: K.DISP, w: "400", c: def.color },
        { t: def.rules, s: small, w: "600" },
        { t: (M.gid === "korku" ? "5 sayfa · çıkış · " + M.timeLeft + " sn" : M.timeLeft ? M.timeLeft + " saniye" : M.gid === "kule" ? "3 can" : M.gid === "refleks" ? "5 tur" : "yer kalmayana kadar"), s: small, w: "600", c: "#a3a9b8" },
        { t: k >= 1 ? String(k) : "BAŞLA!", s: Math.round(big * 1.6), f: K.DISP, w: "400", gap: 1.2 },
      ], def.color);
    } else if (M.ph === "done") {
      panel(P, [{ t: "BİTTİ", s: big, f: K.DISP, w: "400", c: def.color }, { t: K.fmt(M.rs[M.ri]) + " puan", s: mid }, { t: "Rakibin bitirmesi bekleniyor…", s: small, w: "600", c: "#a3a9b8", a: pulse }], def.color);
    } else if (M.ph === "result") {
      const w = M.roundWin, nextGid = M.order[M.ri + 1];
      const over = M.mt !== "mix" || M.wins[0] >= MIX_WIN || M.wins[1] >= MIX_WIN || M.ri >= MIX_ROUNDS - 1;
      const lines = [
        { t: (M.mt === "mix" ? "TUR " + (M.ri + 1) + " · " : "") + K.upper(def.name), s: small, c: "#a3a9b8", ls: "2px" },
        { t: w === 0 ? "TURU KAZANDIN!" : w === 1 ? "TURU KAYBETTİN" : "BERABERE", s: big, f: K.DISP, w: "400", c: w === 0 ? "#8ef0e2" : w === 1 ? "#ff9aa4" : "#f3efe7" },
        { t: K.fmt(M.rs[M.ri]) + "  —  " + K.fmt(M.oppScore), s: mid },
      ];
      if (M.mt === "mix") lines.push({ t: "SEN " + M.wins[0] + " – " + M.wins[1] + " RAKİP", s: mid, c: "#ffd34d" });
      if (!over && nextGid) lines.push({ t: "Sıradaki: " + K.game(nextGid).name, s: small, w: "600", c: "#a3a9b8" });
      panel(P, lines, w === 0 ? "#8ef0e2" : w === 1 ? "#ff9aa4" : "#f4b400");
    } else if (M.ph === "final") {
      const canTap = M.t > 0.9;
      if (M.mode === "single") {
        panel(P, [
          { t: M.newBest ? "YENİ REKOR!" : "OYUN BİTTİ", s: big, f: K.DISP, w: "400", c: M.newBest ? "#ffd34d" : "#f3efe7" },
          { t: K.fmt(M.inst.score) + " puan", s: Math.round(mid * 1.3), f: K.DISP, w: "400" },
          { t: "Rekor: " + K.fmt(K.best(M.gid)), s: small, w: "600", c: "#a3a9b8" },
          { t: canTap ? "TEKRAR İÇİN DOKUN" : " ", s: mid, a: pulse, gap: 1.6, ls: "1px" },
        ], M.newBest ? "#ffd34d" : def.color);
      } else {
        const w = M.finalWin;
        const lines = [];
        if (M.note) lines.push({ t: K.upper(M.note), s: small, c: "#a3a9b8", ls: "1px" });
        lines.push({ t: w === 0 ? "MAÇI KAZANDIN!" : w === 1 ? "MAÇI KAYBETTİN" : "BERABERE", s: big, f: K.DISP, w: "400", c: w === 0 ? "#8ef0e2" : w === 1 ? "#ff9aa4" : "#f3efe7" });
        if (M.mt === "mix") lines.push({ t: "SEN " + M.wins[0] + " – " + M.wins[1] + " RAKİP", s: mid, c: "#ffd34d" });
        M.rs.forEach((v, i) => { if (v == null) return; const gg = K.game(M.order[i]); lines.push({ t: gg.name + ":  " + K.fmt(v) + " — " + K.fmt(+M.oppRs[i] || 0), s: small, w: "600", c: "#c9cedb", gap: 1.15 }); });
        const o = opp();
        lines.push({ t: M.ready ? "HAZIR ✓  RAKİP BEKLENİYOR" : canTap ? "TEKRAR İÇİN DOKUN" : " ", s: mid, a: M.ready ? 1 : pulse, c: M.ready ? "#8ef0e2" : "#f3efe7", gap: 1.6, ls: "1px" });
        if (o && o.ready && !M.ready) lines.push({ t: "Rakip tekrar oynamaya hazır", s: small, w: "600", c: "#8ef0e2" });
        panel(P, lines, w === 0 ? "#8ef0e2" : w === 1 ? "#ff9aa4" : "#f4b400");
      }
    }
  }
  // menü arkası: süzülen renkli bloklar
  const floaters = Array.from({ length: 26 }, (_, i) => ({ x: K.hash(i, 1), y: K.hash(i, 2), s: 14 + K.hash(i, 3) * 26, v: 0.01 + K.hash(i, 4) * 0.03, c: ["#ff6a3d", "#3d8bff", "#8c6bff", "#1fc2b0", "#f4b400", "#18c964"][i % 6], r: K.hash(i, 5) * 6 }));
  function drawMenuBg() {
    K.bg(ctx, { x: 0, y: 0, w: W, h: H }, "#1b2035", "#0b0d16");
    for (const f of floaters) {
      const y = ((f.y - M.clock * f.v) % 1.2 + 1.2) % 1.2 - 0.1;
      ctx.save(); ctx.translate(f.x * W, y * H); ctx.rotate(f.r + M.clock * f.v * 3);
      ctx.globalAlpha = 0.35; ctx.fillStyle = f.c; rr(ctx, -f.s / 2, -f.s / 2, f.s, f.s, f.s * 0.2); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = "#0d1018"; ctx.fillRect(0, 0, W, H);
    if (screen === "menu") drawMenuBg(); else drawGame();
  }

  // ---------------- giriş ----------------
  const ptrs = new Set();
  function local(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  cv.addEventListener("pointerdown", e => {
    e.preventDefault(); K.auInit();
    if (screen !== "game") return;
    const [x, y] = local(e), P = geom().play;
    if (M.ph === "play") {
      if (y >= P.y && y <= P.y + P.h) { ptrs.add(e.pointerId); try { cv.setPointerCapture(e.pointerId); } catch (_) {} M.inst.pointer("down", x, y, e.pointerId); }
      return;
    }
    if (M.mode === "single" && M.ph === "final" && M.t > 0.9) { startIntro(M.gid, (Math.random() * 2147483646) | 0); return; }
    if (M.mode === "duel" && (M.ph === "lobby" || (M.ph === "final" && M.t > 0.9)) && !M.ready) { M.ready = true; SFX.click(); pushPresence(true); }
  });
  const fwd = type => e => { if (!ptrs.has(e.pointerId)) return; if (screen === "game" && M.ph === "play") { const [x, y] = local(e); M.inst.pointer(type, x, y, e.pointerId); } if (type !== "move") ptrs.delete(e.pointerId); };
  cv.addEventListener("pointermove", fwd("move"));
  cv.addEventListener("pointerup", fwd("up"));
  cv.addEventListener("pointercancel", fwd("cancel"));
  cv.addEventListener("contextmenu", e => e.preventDefault());
  window.addEventListener("keydown", e => {
    if (screen !== "game" || e.repeat || (e.target && e.target.tagName === "INPUT")) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const P = geom().play;
      if (M.ph === "play" && (M.gid === "kule" || M.gid === "refleks")) M.inst.pointer("down", P.x + P.w / 2, P.y + P.h / 2);
      else cv.dispatchEvent(new PointerEvent("pointerdown", { clientX: 5, clientY: 5 }));
    }
  });
  let wakeLock = null;
  function keepAwake() { try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(l => { wakeLock = l; }).catch(() => {}); } catch (e) {} }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && screen === "game") keepAwake(); });

  // ---------------- menü ----------------
  const menuEl = $("#menu"), menuBtn = $("#menuBtn");
  function setRoomStatus(t) { $("#roomStatus").textContent = t; }
  const inviteUrl = () => location.origin + location.pathname + "#oda-" + net.code.toLowerCase();
  function updateRoomStatus() {
    if (!net.room) return;
    const el = $("#roomStatus"), o = opp();
    if (o && o.host && !net.host && o.mt && o.mt !== cfg.mt) { cfg.mt = o.mt; renderLists(); }
    el.textContent = "";
    const b = document.createElement("div"); b.className = "code"; b.textContent = net.code;
    const sp = document.createElement("span");
    sp.textContent = o ? "Rakip bağlandı ✓" + (net.host ? " Maç türünü seç ve OYNA'ya bas." : " Maç türünü odayı kuran seçiyor.") : net.host ? "Arkadaşın kodu yazıp Katıl'a bassın ya da davet linkini açsın. Rakip bekleniyor…" : "Odaya girdin. Rakip bekleniyor…";
    el.append(b, sp);
    const share = !K.IN_CLAUDE && net.host;
    $("#shareRow").hidden = !share;
    if (share) $("#shareUrl").textContent = inviteUrl();
  }
  function card(id, name, desc, color, sub) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "gcard"; b.dataset.id = id; b.style.setProperty("--c", color);
    const n = document.createElement("b"); n.textContent = name;
    const d = document.createElement("small"); d.textContent = desc;
    b.append(n, d);
    if (sub) { const s = document.createElement("span"); s.className = "best"; s.textContent = sub; b.append(s); }
    return b;
  }
  function renderLists() {
    const gl = $("#gameList"); gl.textContent = "";
    for (const g of K.GAMES) gl.append(card(g.id, g.name, g.desc, g.color, "Rekor: " + K.fmt(K.best(g.id))));
    const ml = $("#matchList"); ml.textContent = "";
    ml.append(card("mix", "Karışık Düello", "Her tur farklı oyun · ilk 3 turu alan kazanır", "#f4b400"));
    for (const g of K.GAMES) ml.append(card(g.id, g.name, "Tek tur", g.color));
    const locked = net.room && !net.host;
    for (const b of ml.querySelectorAll(".gcard")) { b.setAttribute("aria-pressed", String(b.dataset.id === cfg.mt)); b.disabled = !!locked && b.dataset.id !== cfg.mt; }
  }
  function refreshMenu() {
    for (const b of document.querySelectorAll('[data-group="layout"] .opt')) b.setAttribute("aria-pressed", String(cfg.layout === b.dataset.value));
    $("#singleBox").hidden = isOnline();
    $("#onlineBox").hidden = !isOnline();
    $("#leaveRoom").hidden = !net.room;
    $("#mkRoom").hidden = !!net.room; $("#joinRoom").hidden = !!net.room; $("#code").hidden = !!net.room;
    if (!net.room) $("#shareRow").hidden = true;
    $("#play").disabled = !net.room;
    $("#sfxBtn").setAttribute("aria-pressed", String(AU.sfxOn)); $("#sfxLbl").textContent = AU.sfxOn ? "Açık" : "Kapalı";
    $("#musicBtn").setAttribute("aria-pressed", String(AU.musicOn)); $("#musicLbl").textContent = AU.musicOn ? "Açık" : "Kapalı";
    const jump = store.get("jump", "1") === "1";
    $("#jumpBtn").setAttribute("aria-pressed", String(jump)); $("#jumpLbl").textContent = jump ? "Açık (korku oyunu)" : "Kapalı: yumuşak geçiş";
    renderLists();
    if (net.room) updateRoomStatus();
  }
  function showGame() { screen = "game"; menuEl.hidden = true; menuBtn.hidden = false; }
  function showMenu() {
    screen = "menu"; menuEl.hidden = false; menuBtn.hidden = true;
    dispose(); M.inst = null; M.def = null; M.ph = "lobby"; M.ready = false; AU.level = 0; K.setWind(0);
    if (net.room) pushPresence(true);
    refreshMenu();
    try { if (wakeLock) wakeLock.release(); } catch (e) {}
  }
  document.querySelector('[data-group="layout"]').addEventListener("click", e => {
    const b = e.target.closest(".opt"); if (!b) return;
    K.auInit(); SFX.click();
    cfg.layout = b.dataset.value; store.set("layout2", cfg.layout);
    if (isOnline()) getRoomApi();
    refreshMenu();
  });
  $("#gameList").addEventListener("click", e => { const b = e.target.closest(".gcard"); if (!b) return; K.auInit(); SFX.click(); startSingle(b.dataset.id); });
  $("#matchList").addEventListener("click", e => {
    const b = e.target.closest(".gcard"); if (!b || b.disabled) return;
    K.auInit(); SFX.click();
    cfg.mt = b.dataset.id; store.set("mt", cfg.mt); renderLists(); pushPresence(true);
  });
  $("#sfxBtn").addEventListener("click", () => { K.auInit(); K.setSfx(!AU.sfxOn); SFX.click(); refreshMenu(); });
  $("#musicBtn").addEventListener("click", () => { K.auInit(); K.setMusic(!AU.musicOn); refreshMenu(); });
  $("#jumpBtn").addEventListener("click", () => { SFX.click(); store.set("jump", store.get("jump", "1") === "1" ? "0" : "1"); refreshMenu(); });
  $("#mkRoom").addEventListener("click", () => { K.auInit(); SFX.click(); joinRoom(newCode(), true); });
  $("#joinRoom").addEventListener("click", () => { K.auInit(); SFX.click(); joinRoom($("#code").value, false); });
  $("#code").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); joinRoom($("#code").value, false); } });
  $("#leaveRoom").addEventListener("click", () => { SFX.click(); leaveRoom(); });
  $("#shareBtn").addEventListener("click", () => {
    const url = inviteUrl(), data = { title: "Düello Arenası", text: "Benimle düello yap! Oda kodu: " + net.code, url };
    if (navigator.share) { navigator.share(data).catch(() => {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(() => { $("#shareBtn").textContent = "Kopyalandı ✓"; setTimeout(() => { $("#shareBtn").textContent = "Davet linki gönder"; }, 1800); }).catch(selectLink);
    else selectLink();
  });
  function selectLink() { const r = document.createRange(); r.selectNodeContents($("#shareUrl")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  $("#play").addEventListener("click", () => {
    if (!net.room) return;
    K.auInit(); SFX.click();
    M.mode = "duel"; M.ph = "lobby"; M.ready = false; M.inst = null; M.def = null;
    showGame(); pushPresence(true); keepAwake();
  });
  menuBtn.addEventListener("click", () => { SFX.click(); showMenu(); });

  // ---------------- PWA ----------------
  if (!K.IN_CLAUDE && location.protocol === "https:") {
    try {
      const l = document.createElement("link"); l.rel = "manifest"; l.href = "manifest.webmanifest"; document.head.appendChild(l);
      const ai = document.createElement("link"); ai.rel = "apple-touch-icon"; ai.href = "icon-180.png"; document.head.appendChild(ai);
      if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
    } catch (e) {}
  }

  // ---------------- başlat ----------------
  resize();
  refreshMenu();
  if (K.loadWords) K.loadWords().catch(() => {});
  if (isOnline()) getRoomApi();
  (() => {
    const m = /^#oda-([a-z0-9]{4})$/i.exec(location.hash || "");
    if (!m) return;
    cfg.layout = "online"; refreshMenu();
    $("#code").value = m[1].toUpperCase();
    joinRoom(m[1], false);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  })();
  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    update(dt); render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__arena = { M, cfg, startSingle };
})();
