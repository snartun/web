// Penaltı: parmağını kaydırarak şut çek; yön, güç, yükseklik ve falso kaydırmadan gelir. 8 atış.
(() => {
  "use strict";
  const { hash, clamp, lerp, rr, txt, fit, SFX, buzz } = K;
  const SHOTS = 8, GW = 0.5, GH = 0.33; // kale yarı genişliği ve yüksekliği (dünya birimi)

  // tribün uğultusu (sentez): filtrelenmiş gürültü, olaylarda kabarır
  function crowd() {
    const AU = K.AU; if (!AU.ctx || !AU.noise) return null;
    const c = AU.ctx, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = AU.noise; src.loop = true; bp.type = "bandpass"; bp.frequency.value = 700; bp.Q.value = 0.5; g.gain.value = 0.0001;
    src.connect(bp).connect(g).connect(AU.sfx); src.start();
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.3; lg.gain.value = 0.02; lfo.connect(lg).connect(g.gain); lfo.start();
    return { c, g, bp, src, set(v, tc) { g.gain.setTargetAtTime(v, c.currentTime, tc || 0.4); }, stop() { try { g.gain.setTargetAtTime(0, c.currentTime, 0.3); src.stop(c.currentTime + 1.5); lfo.stop(c.currentTime + 1.5); } catch (e) {} } };
  }
  function whistle() {
    const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return;
    const c = AU.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = "sine"; o.frequency.value = 2900; lfo.frequency.value = 28; lg.gain.value = 140; lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.setValueAtTime(0.18, t + 0.38); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(AU.sfx); o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5);
  }
  function clang() {
    const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return;
    const c = AU.ctx, t = c.currentTime;
    for (const [f, v] of [[523, 0.18], [1187, 0.1], [2245, 0.05]]) { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); o.connect(g).connect(AU.sfx); o.start(t); o.stop(t + 1); }
  }
  function kick(power) { if (!K.play("thud", { vol: 0.7, rate: 1.6 + power * 0.3 })) SFX.thud(0.6); }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = {
      score: 0, over: false, shot: 0, goals: 0, results: [], phase: "aim", t: 0, slow: 1, slowT: 0,
      ball: { x: 0, y: 0, z: 0, spin: 0 }, flight: null, keeper: { x: 0, y: 0, dive: 0, lean: 0, react: 0 },
      swipe: null, net: 0, netX: 0, netY: 0, shake: 0, flash: 0, msg: "", msgC: "#fff", msgT: 0, pops: [], parts: [], R: null, clock: 0, crowd: null, fl: [],
    };
    for (let i = 0; i < 40; i++) g.fl.push({ x: Math.random(), y: Math.random(), t: Math.random() * 5 });
    const proj = (R, x, y, z) => {
      const gy = R.y + R.h * 0.37, by = R.y + R.h * 0.88, e = 1 - Math.pow(1 - z, 1.5), s = lerp(1, 0.56, e);
      return { x: R.x + R.w / 2 + x * R.w * 0.95 * s, y: lerp(by, gy, e) - y * R.w * 0.95 * s, s };
    };
    function shoot(sw) {
      const R = g.R, dx = sw.x1 - sw.x0, dy = sw.y0 - sw.y1, len = Math.hypot(dx, dy), dt = Math.max(0.06, sw.t1 - sw.t0);
      if (dy < 30 || len < 40) return false;
      const speed = len / dt;
      const tx = clamp((dx / (R.w * 0.42)) * GW, -GW * 1.6, GW * 1.6);
      const ty = clamp(((len - 60) / (R.h * 0.55)) * GH * (0.6 + Math.min(1, speed / 1600) * 0.6), 0.02, GH * 1.6);
      // falso: kaydırma yolunun orta noktasının doğrudan sapması
      const mx = (sw.x0 + sw.x1) / 2, curve = clamp(((sw.xm != null ? sw.xm : mx) - mx) / (R.w * 0.25), -1, 1) * 0.22;
      const power = clamp(speed / 1800, 0.3, 1.2);
      g.flight = { tx, ty, curve, T: lerp(0.75, 0.42, clamp(power, 0, 1)), t: 0 };
      // kaleci kararı: tohumlu tahmin + atışlar ilerledikçe daha iyi okur
      const r1 = hash(seed, g.shot * 7 + 1), r2 = hash(seed, g.shot * 7 + 2);
      const readChance = 0.3 + g.shot * 0.05, readsIt = r1 < readChance;
      const guessDir = readsIt ? Math.sign(tx) || (r2 < 0.5 ? -1 : 1) : r2 < 0.38 ? -1 : r2 < 0.76 ? 1 : 0;
      g.keeper.target = guessDir * (0.22 + hash(seed, g.shot * 7 + 3) * 0.18);
      g.keeper.high = readsIt && ty > GH * 0.55;
      g.keeper.react = 0.12 + hash(seed, g.shot * 7 + 4) * 0.1;
      g.phase = "fly"; g.t = 0;
      kick(power); buzz(15);
      return true;
    }
    function resolve() {
      const f = g.flight, x = f.tx + f.curve, y = f.ty, k = g.keeper;
      const kx = k.x, reach = 0.17, keeperHigh = k.high ? 0.3 : 0.22;
      let res;
      const inside = Math.abs(x) < GW - 0.015 && y < GH - 0.01;
      const post = !inside && (Math.abs(Math.abs(x) - GW) < 0.03 && y < GH + 0.02 || (Math.abs(y - GH) < 0.025 && Math.abs(x) < GW + 0.02));
      if (post) res = "post";
      else if (!inside) res = "miss";
      else if (Math.abs(x - kx) < reach && y < keeperHigh + 0.03) res = "save";
      else res = "goal";
      g.results.push(res);
      const R = g.R, p = proj(R, x, y, 1);
      if (res === "goal") {
        const corner = Math.abs(x) > GW * 0.62 && y > GH * 0.55;
        const pts = 100 + (corner ? 60 : 0) + (Math.abs(x) > GW * 0.6 ? 20 : 0);
        g.score += pts; g.goals++;
        g.net = 1; g.netX = x; g.netY = y; g.slow = 0.35; g.slowT = 0.45; g.shake = 0.6;
        g.msg = corner ? "KÖŞEYE GOL!" : "GOOOL!"; g.msgC = "#ffd34d"; g.msgT = 1.6;
        K.pops.add(g.pops, "+" + pts, p.x, p.y - 20, "#ffd34d", true);
        K.parts.burst(g.parts, p.x, p.y, "#ffffff", 26, 260); K.parts.burst(g.parts, p.x, p.y, "#ffd34d", 20, 220);
        if (g.crowd) { g.crowd.set(0.55, 0.08); setTimeout(() => g.crowd && g.crowd.set(0.12, 1.2), 1400); }
        SFX.chime(8); K.play("bell", { vol: 0.35 }); buzz([30, 40, 80]);
      } else if (res === "save") {
        g.msg = "KURTARDI!"; g.msgC = "#ff9aa4"; g.msgT = 1.4; g.shake = 0.4;
        if (!K.play("thud", { vol: 0.8, rate: 0.9 })) SFX.thud(0.8);
        if (g.crowd) { g.crowd.set(0.32, 0.1); setTimeout(() => g.crowd && g.crowd.set(0.1, 1), 900); }
        buzz(40);
      } else if (res === "post") {
        g.msg = "DİREK!"; g.msgC = "#cfd6e6"; g.msgT = 1.4; g.shake = 0.8; clang(); buzz([60, 30, 60]);
        if (g.crowd) { g.crowd.set(0.3, 0.05); setTimeout(() => g.crowd && g.crowd.set(0.1, 1), 800); }
      } else { g.msg = "AUT"; g.msgC = "#a3a9b8"; g.msgT = 1.2; if (g.crowd) g.crowd.set(0.06, 0.3); }
      g.phase = "result"; g.t = 0;
    }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      _g: g,
      info() { return { extra: "ATIŞ " + Math.min(SHOTS, g.shot + 1) + "/" + SHOTS + " · " + g.goals + " GOL" }; },
      dispose() { if (g.crowd) { g.crowd.stop(); g.crowd = null; } },
      update(dt, active) {
        g.clock += dt;
        if (active && !g.crowd) { g.crowd = crowd(); if (g.crowd) g.crowd.set(0.1, 1); whistle(); }
        if (g.slowT > 0) { g.slowT -= dt; if (g.slowT <= 0) g.slow = 1; }
        const sdt = dt * g.slow;
        g.shake = Math.max(0, g.shake - dt * 2); g.net = Math.max(0, g.net - dt * 1.4); g.msgT = Math.max(0, g.msgT - dt);
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
        // kaleci: bekleme salınımı, sonra dalış
        const k = g.keeper;
        if (g.phase === "aim") { k.x = Math.sin(g.clock * 1.6) * 0.05; k.y = 0; k.dive = 0; }
        if (g.phase === "fly") {
          const f = g.flight; f.t += sdt; g.t += sdt;
          const u = clamp(f.t / f.T, 0, 1);
          g.ball.z = u; g.ball.x = lerp(0, f.tx, u) + f.curve * Math.sin(u * Math.PI / 2) * u; g.ball.y = f.ty * Math.sin(u * Math.PI * 0.5) + 0.02 * (1 - u); g.ball.spin += sdt * 20;
          if (f.t > k.react) { const kt = clamp((f.t - k.react) / (f.T - k.react), 0, 1); k.x = lerp(k.x, k.target, Math.min(1, sdt * 9)); k.dive = kt; k.y = (k.high ? 0.16 : 0.07) * Math.sin(kt * Math.PI * 0.9); }
          if (u >= 1) resolve();
        } else if (g.phase === "result") {
          g.t += dt;
          if (g.t > 1.6) { g.shot++; if (g.shot >= SHOTS) { g.over = true; if (g.crowd) g.crowd.set(0.25, 0.3); } else { g.phase = "aim"; g.ball = { x: 0, y: 0, z: 0, spin: 0 }; g.keeper = { x: 0, y: 0, dive: 0, react: 0 }; whistle(); } }
        }
      },
      pointer(type, x, y) {
        if (!g.R || g.over || g.phase !== "aim") return;
        const now = performance.now() / 1000;
        if (type === "down") { const b = proj(g.R, 0, 0, 0); if (Math.hypot(x - b.x, y - b.y) < g.R.w * 0.3) g.swipe = { x0: x, y0: y, x1: x, y1: y, t0: now, t1: now, pts: [[x, y]] }; }
        else if (type === "move" && g.swipe) { g.swipe.x1 = x; g.swipe.y1 = y; g.swipe.t1 = now; g.swipe.pts.push([x, y]); }
        else if ((type === "up" || type === "cancel") && g.swipe) {
          const sw = g.swipe; g.swipe = null;
          if (type !== "up") return;
          sw.t1 = now; if (sw.pts.length > 2) sw.xm = sw.pts[Math.floor(sw.pts.length / 2)][0];
          shoot(sw);
        }
      },
      net() { return { s: g.shot, gl: g.goals, r: g.results.map(r => r[0]).join("") }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * g.shake, (Math.random() - 0.5) * 8 * g.shake);
        // gece göğü ve projektör halesi
        K.bg(ctx, { x: R.x, y: R.y, w: R.w, h: R.h * 0.32 }, "#050913", "#162238");
        for (const sx of [0.08, 0.92]) { const lx = R.x + R.w * sx, ly = R.y + R.h * 0.05, gr = ctx.createRadialGradient(lx, ly, 2, lx, ly, R.w * 0.22); gr.addColorStop(0, "rgba(255,255,240,0.45)"); gr.addColorStop(1, "rgba(255,255,240,0)"); ctx.fillStyle = gr; ctx.fillRect(R.x, R.y, R.w, R.h * 0.5); ctx.fillStyle = "#fffbe8"; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) ctx.fillRect(lx - 12 + i * 7, ly - 4 + j * 6, 5, 4); }
        // tribün: kalabalık siluetleri ve fotoğraf flaşları (küçük, ekranın %1'inden az)
        const ty = R.y + R.h * 0.14, th = R.h * 0.16;
        const tg = ctx.createLinearGradient(0, ty, 0, ty + th); tg.addColorStop(0, "#1a2236"); tg.addColorStop(1, "#2a3550"); ctx.fillStyle = tg; ctx.fillRect(R.x, ty, R.w, th);
        for (let i = 0; i < 90; i++) { const x = R.x + hash(i, 3) * R.w, y = ty + 6 + hash(i, 4) * (th - 10), s = 3 + hash(i, 5) * 3; ctx.fillStyle = ["#c43a3a", "#e9e2cf", "#3d8bff", "#f4b400", "#2a2f3f"][i % 5]; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(x, y + Math.sin(g.clock * 3 + i) * (g.net > 0 ? 3 : 0.6), s, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
        for (const f of g.fl) { const on = Math.sin(g.clock * 2 + f.t * 7) > 0.985; if (on) { ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(R.x + f.x * R.w, ty + f.y * th, 2, 2); } }
        // reklam panoları
        const ay = ty + th; ctx.fillStyle = "#0e1424"; ctx.fillRect(R.x, ay, R.w, R.h * 0.03); txt(ctx, "DÜELLO ARENASI  ·  DÜELLO ARENASI  ·  DÜELLO ARENASI", R.x + R.w / 2, ay + R.h * 0.015, Math.round(R.h * 0.018), "#f4b400", { ls: "3px" });
        // çim: perspektifli şeritler
        const gy = R.y + R.h * 0.33;
        const gg = ctx.createLinearGradient(0, gy, 0, R.y + R.h); gg.addColorStop(0, "#1d5a2a"); gg.addColorStop(1, "#2f8a3c"); ctx.fillStyle = gg; ctx.fillRect(R.x, gy, R.w, R.y + R.h - gy);
        for (let i = 0; i < 8; i++) { const z0 = i / 8, z1 = (i + 0.5) / 8; const a = proj(R, -3, 0, 1 - z0), b = proj(R, 3, 0, 1 - z0), c = proj(R, 3, 0, 1 - z1), d = proj(R, -3, 0, 1 - z1); ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.fill(); }
        // ceza sahası çizgileri ve penaltı noktası
        ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 2;
        const line = pts => { ctx.beginPath(); pts.forEach(([x, z], i) => { const p = proj(R, x, 0, z); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke(); };
        line([[-1.6, 1], [1.6, 1]]); line([[-0.9, 1], [-0.9, 0.55], [0.9, 0.55], [0.9, 1]]); line([[-1.6, 1], [-1.6, 0.05], [1.6, 0.05], [1.6, 1]]);
        { const p = proj(R, 0, 0, 0); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, 4, 2, 0, 0, Math.PI * 2); ctx.fill(); }
        // kale: ağ (dalgalanır), direkler
        const tl = proj(R, -GW, GH, 1), trp = proj(R, GW, GH, 1), bl = proj(R, -GW, 0, 1), br = proj(R, GW, 0, 1);
        const back = (x, y) => { const p = proj(R, x * 0.92, y * 0.85, 1); return { x: p.x, y: p.y - R.h * 0.012 }; };
        ctx.strokeStyle = "rgba(235,240,245,0.35)"; ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) { const x = -GW + (i / 20) * GW * 2; ctx.beginPath(); for (let j = 0; j <= 8; j++) { const y = (j / 8) * GH; let p = back(x, y); const bulge = g.net * Math.exp(-((x - g.netX) ** 2 + (y - g.netY) ** 2) / 0.02) * R.h * 0.04; p = { x: p.x, y: p.y - bulge * 0.3 }; if (j) ctx.lineTo(p.x, p.y + bulge * 0.2); else ctx.moveTo(p.x, p.y); } ctx.stroke(); }
        for (let j = 0; j <= 8; j++) { const y = (j / 8) * GH; ctx.beginPath(); for (let i = 0; i <= 20; i++) { const x = -GW + (i / 20) * GW * 2, p = back(x, y), bulge = g.net * Math.exp(-((x - g.netX) ** 2 + (y - g.netY) ** 2) / 0.02) * R.h * 0.04; if (i) ctx.lineTo(p.x, p.y - bulge * 0.1); else ctx.moveTo(p.x, p.y); } ctx.stroke(); }
        ctx.strokeStyle = "#f5f7fa"; ctx.lineWidth = Math.max(3, R.w * 0.012); ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(bl.x, bl.y); ctx.lineTo(tl.x, tl.y); ctx.lineTo(trp.x, trp.y); ctx.lineTo(br.x, br.y); ctx.stroke(); ctx.lineCap = "butt";
        // kaleci
        const k = g.keeper, kp = proj(R, k.x, k.y, 1), ks = kp.s * R.w * 0.95;
        ctx.save(); ctx.translate(kp.x, kp.y); ctx.rotate(Math.sign(k.target || 0) * k.dive * 1.25);
        const kh = ks * 0.2, kw = ks * 0.07;
        ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(0, 2, kw * 1.4, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1b1d22"; ctx.fillRect(-kw * 0.6, -kh * 0.45, kw * 0.5, kh * 0.45); ctx.fillRect(kw * 0.1, -kh * 0.45, kw * 0.5, kh * 0.45);
        ctx.fillStyle = "#f4b400"; rr(ctx, -kw * 0.75, -kh * 0.95, kw * 1.5, kh * 0.55, kw * 0.3); ctx.fill();
        ctx.fillStyle = "#1b1d22"; ctx.fillRect(-kw * 0.2, -kh * 0.88, kw * 0.4, kh * 0.4);
        ctx.strokeStyle = "#f4b400"; ctx.lineWidth = kw * 0.38; ctx.lineCap = "round";
        const armUp = 0.6 + k.dive * 0.8;
        ctx.beginPath(); ctx.moveTo(-kw * 0.6, -kh * 0.9); ctx.lineTo(-kw * 1.4, -kh * (0.9 + armUp * 0.35)); ctx.moveTo(kw * 0.6, -kh * 0.9); ctx.lineTo(kw * 1.4, -kh * (0.9 + armUp * 0.35)); ctx.stroke();
        ctx.fillStyle = "#f3efe7"; ctx.beginPath(); ctx.arc(-kw * 1.45, -kh * (0.92 + armUp * 0.35), kw * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(kw * 1.45, -kh * (0.92 + armUp * 0.35), kw * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#c99a74"; ctx.beginPath(); ctx.arc(0, -kh * 1.08, kw * 0.42, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.lineCap = "butt";
        // top: gölge + desenli top
        const b = g.ball, bp = proj(R, b.x, b.y, b.z), gp = proj(R, b.x, 0, b.z), br2 = Math.max(4, bp.s * R.w * 0.035);
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(gp.x, gp.y + 3, br2 * 1.1, br2 * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        const bg2 = ctx.createRadialGradient(bp.x - br2 * 0.3, bp.y - br2 * 0.35, br2 * 0.1, bp.x, bp.y, br2); bg2.addColorStop(0, "#ffffff"); bg2.addColorStop(1, "#b9bec8");
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(bp.x, bp.y, br2, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.arc(bp.x, bp.y, br2, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = "#1b1d22";
        for (let i = 0; i < 5; i++) { const a = b.spin + i * 1.2566, px = bp.x + Math.cos(a) * br2 * 0.62, py = bp.y + Math.sin(a * 1.3) * br2 * 0.5; ctx.beginPath(); ctx.arc(px, py, br2 * 0.22, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        // kaydırma izi
        if (g.swipe && g.swipe.pts.length > 1) { ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); g.swipe.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.lineCap = "butt"; }
        if (g.phase === "aim" && g.shot < 2 && !g.swipe) txt(ctx, "Toptan kaleye doğru kaydır · kavis = falso", R.x + R.w / 2, R.y + R.h * 0.95, 15, "rgba(255,255,255,0.75)", { w: "700" });
        // atış geçmişi
        for (let i = 0; i < SHOTS; i++) { const r = g.results[i], x = R.x + R.w / 2 - SHOTS * 13 + i * 26 + 13, y = R.y + 18; ctx.fillStyle = r === "goal" ? "#2bb673" : r ? "#c43a3a" : "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); if (r) txt(ctx, r === "goal" ? "✓" : "✕", x, y + 1, 11, "#fff"); }
        if (g.msgT > 0) txt(ctx, g.msg, R.x + R.w / 2, R.y + R.h * 0.5, fit(ctx, g.msg, R.w - 30, Math.round(R.w * 0.14), K.DISP, "400"), g.msgC, { f: K.DISP, w: "400", stroke: 8, a: Math.min(1, g.msgT * 2) });
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1.1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#0b1326", "#1d5a2a");
    const r = d && typeof d.r === "string" ? d.r : "";
    txt(ctx, ((d && d.gl) | 0) + " GOL", R.x + R.w / 2, R.y + R.h * 0.42, Math.round(Math.min(40, R.h * 0.26)), "#fff", { f: K.DISP, w: "400" });
    for (let i = 0; i < SHOTS; i++) { const c = r[i], x = R.x + R.w / 2 - SHOTS * 12 + i * 24 + 12, y = R.y + R.h * 0.72; ctx.fillStyle = c === "g" ? "#2bb673" : c ? "#c43a3a" : "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); }
  }
  K.register({
    id: "penalti", name: "Penaltı", color: "#2bb673", desc: "Kaydırarak şut çek: yön, güç, falso. Kaleciyi avla.",
    rules: "Toptan kaleye kaydır · kavisli kaydır = falso · üst köşe bonus",
    timeLimit: () => null,
    create, drawRemote,
  });
})();
