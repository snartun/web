// Kule Yarışı: sarkaç vinçten blok bırak, kuleyi dengede tutarak yükselt.
(() => {
  "use strict";
  const { hash, clamp, lerp, easeOut, hex, mix, css, ramp, rr, hazard, txt, fit, SFX, buzz } = K;
  const BHW = 0.1, BW = 0.3, BASE_W = 0.42, ROPE = 4.2, DROP_H = 2.0, G = 20, PERFECT = 0.1, STEP = 1 / 120, LIVES = 3, FLOOR_M = 3.2;
  const PLANE_FLOORS = [3, 7, 12, 18, 24, 31, 40, 52];
  const SKY_FLOORS = 60;
  const COL = { accent: "#ff6a3d", light: "#ffb89c", g0: "#ffd9bd", g1: "#e98a62", g2: "#8a3f27", wall: "#f3d2bd", wallD: "#c98d6e" };

  const rnd = s => { let a = s; return () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; }; };
  function makeCity(seed, minH, maxH) {
    const r = rnd(seed), out = []; let x = -0.03;
    while (x < 1.03) {
      const w = 0.045 + r() * 0.09, b = { x, w, h: minH + r() * (maxH - minH), cap: r(), wins: [] };
      const cols = Math.max(1, Math.floor(w / 0.018)), rows = Math.floor(b.h / 0.035);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r() < 0.32) b.wins.push([(i + 0.5) / cols, (j + 0.6) / (rows + 0.4)]);
      out.push(b); x += w + 0.004 + r() * 0.01;
    }
    return out;
  }
  const cityFar = makeCity(11, 0.12, 0.42), cityNear = makeCity(29, 0.06, 0.3);
  const stars = []; (() => { const r = rnd(5); for (let i = 0; i < 90; i++) stars.push({ x: r(), y: r(), s: 0.5 + r() * 1.4, tw: r() * 6 }); })();
  const clouds = []; (() => { const r = rnd(17); for (let k = 0; k < 40; k++) clouds.push({ alt: 3 + k * 1.1 + r() * 0.8, x: r(), s: 0.6 + r() * 0.8, v: 0.004 + r() * 0.01, sp: r() < 0.5 ? 0 : 1 }); })();
  let cloudSprites = null;
  function sprites() {
    if (cloudSprites) return cloudSprites;
    cloudSprites = [0, 1].map(k => {
      const c = document.createElement("canvas"); c.width = 320; c.height = 140;
      const g = c.getContext("2d"), r = rnd(41 + k * 7);
      for (let i = 0; i < 14; i++) {
        const x = 50 + r() * 220, y = 70 + (r() - 0.3) * 40, rad = 26 + r() * 36, gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(0.6, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      }
      return c;
    });
    return cloudSprites;
  }
  const SKY_TOP = [[0, hex("#3f86d6")], [0.18, hex("#4a7fcc")], [0.33, hex("#4d6fb3")], [0.47, hex("#3a3878")], [0.6, hex("#1f2257")], [0.78, hex("#070b1f")], [1, hex("#020208")]];
  const SKY_BOT = [[0, hex("#cfe7f7")], [0.18, hex("#e3e6dc")], [0.33, hex("#ffc98c")], [0.47, hex("#f07f66")], [0.6, hex("#6b4a86")], [0.78, hex("#1c2650")], [1, hex("#0b0a1c")]];
  const FAR_TINT = [[0, hex("#8aa3c0")], [0.33, hex("#9b8fa8")], [0.47, hex("#5a4c7a")], [0.78, hex("#141a36")], [1, hex("#0a0a18")]];
  const NEAR_TINT = [[0, hex("#5d728e")], [0.33, hex("#5f5371")], [0.47, hex("#352c52")], [0.78, hex("#0b1026")], [1, hex("#05050e")]];

  function windAt(i) {
    const zones = [[8, 12, 1], [18, 23, -1], [29, 35, 1]];
    for (let k = 0; k < zones.length; k++) { const z = zones[k]; if (i >= z[0] && i <= z[1]) return { s: 0.55 + k * 0.2, dir: z[2] }; }
    if (i >= 40 && i % 12 < 6) return { s: 1.15, dir: Math.floor(i / 12) % 2 ? -1 : 1 };
    return null;
  }
  // Sarkaç: genlik 22°→55°, bir gidiş-geliş 2,4 s→1,6 s (kat arttıkça yumuşakça)
  function swingFor(seed, i) {
    const amp = (i <= 1 ? 12 : Math.min(55, 22 + (i - 1) * 1.2)) + hash(seed, i * 2) * 3;
    const period = Math.max(1.6, 2.4 - (i - 1) * 0.027);
    return { amp: amp * Math.PI / 180 * (hash(seed, i * 2 + 1) < 0.5 ? -1 : 1), period };
  }

  // ---------------- çizim parçaları ----------------
  function drawFloor(ctx, x, y, w, h, idx, night, perfect) {
    if (w < 0.5) return;
    const p = COL;
    if (idx === 0) {
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "#d8d2c6"); g.addColorStop(1, "#8e897f");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = css(mix(hex("#2b3644"), hex("#ffd58a"), night * 0.6)); ctx.fillRect(x + w * 0.1, y + h * 0.28, w * 0.8, h * 0.42);
      ctx.fillStyle = "rgba(255,255,255,0.25)"; for (let i = 1; i < 6; i++) ctx.fillRect(x + w * 0.1 + (w * 0.8 / 6) * i, y + h * 0.28, 1, h * 0.42);
      ctx.fillStyle = p.accent; ctx.fillRect(x, y, w, Math.max(2, h * 0.1));
      hazard(ctx, x, y + h * 0.78, w, h * 0.16, "#22252b", "#f4b400");
      return;
    }
    const style = idx < 10 ? 0 : idx < 20 ? 1 : 2, slab = Math.max(2, h * 0.2), gh = h - slab, gold = perfect;
    if (style === 0) {
      ctx.fillStyle = gold ? "#f6e2a8" : p.wall; ctx.fillRect(x, y, w, gh);
      if (night > 0) { ctx.fillStyle = "rgba(6,10,28," + night * 0.55 + ")"; ctx.fillRect(x, y, w, gh); }
      const nW = Math.max(1, Math.round(w / (h * 0.9))), step = w / nW, ww = step * 0.46, wh = gh * 0.56;
      for (let i = 0; i < nW; i++) {
        const wx = x + i * step + (step - ww) / 2, wy = y + gh * 0.18, lit = night > 0.25 && hash(idx, i) < 0.55;
        ctx.fillStyle = lit ? "rgba(255,212,140," + Math.min(0.95, (night - 0.25) * 1.5) + ")" : css(mix(hex(gold ? "#c9a54a" : p.g1), hex("#1b2238"), night * 0.7));
        ctx.fillRect(wx, wy, ww, wh); ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(wx, wy, ww, 1.5);
        if (hash(idx, i + 50) < 0.4) { ctx.fillStyle = gold ? "#a07a1a" : p.wallD; ctx.fillRect(wx - 2, wy + wh - 1, ww + 4, 2); for (let k = 0; k <= 3; k++) ctx.fillRect(wx - 2 + (ww + 4) * k / 3, wy + wh * 0.72, 1, wh * 0.28); }
      }
    } else {
      const g = ctx.createLinearGradient(0, y, 0, y + gh);
      if (gold) { g.addColorStop(0, "#fff1c4"); g.addColorStop(0.5, "#e7b94a"); g.addColorStop(1, "#8c6416"); }
      else if (style === 1) { g.addColorStop(0, p.g0); g.addColorStop(0.5, p.g1); g.addColorStop(1, p.g2); }
      else { g.addColorStop(0, p.g1); g.addColorStop(0.6, p.g2); g.addColorStop(1, "#11161f"); }
      ctx.fillStyle = g; ctx.fillRect(x, y, w, gh);
      if (night > 0) { ctx.fillStyle = "rgba(6,10,28," + night * 0.6 + ")"; ctx.fillRect(x, y, w, gh); }
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, gh); ctx.clip();
      const rx = x + (hash(idx, 7) * 1.4 - 0.2) * w;
      ctx.fillStyle = "rgba(255,255,255," + 0.16 * (1 - night * 0.6) + ")";
      ctx.beginPath(); ctx.moveTo(rx, y + gh); ctx.lineTo(rx + gh * 0.7, y); ctx.lineTo(rx + gh * 0.7 + w * 0.08, y); ctx.lineTo(rx + w * 0.08, y + gh); ctx.fill();
      ctx.restore();
      const nP = Math.max(1, Math.round(w / Math.max(8, h * (style === 1 ? 0.62 : 0.4)))), step = w / nP;
      if (night > 0.25) for (let i = 0; i < nP; i++) if (hash(idx, i) < 0.5) { ctx.fillStyle = "rgba(255,212,140," + Math.min(0.9, (night - 0.25) * 1.4) + ")"; ctx.fillRect(x + i * step + 1.5, y + 1.5, step - 3, gh - 3); }
      ctx.fillStyle = style === 1 ? "rgba(10,18,28,0.38)" : "rgba(200,220,240,0.35)";
      for (let i = 1; i < nP; i++) ctx.fillRect(x + i * step - 0.75, y, style === 1 ? 1.5 : 2, gh);
      if (style === 1) { ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(x, y + gh * 0.64, w, 1); }
    }
    ctx.fillStyle = css(mix(hex(gold ? "#f8e7b0" : "#ece7dd"), hex("#4b4f63"), night * 0.7)); ctx.fillRect(x, y + gh, w, slab);
    ctx.fillStyle = gold ? "#f4b400" : p.accent; ctx.fillRect(x, y + gh, w, Math.max(1.5, slab * 0.34));
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fillRect(x, y + h - 1, w, 1);
    const ew = Math.max(1.5, Math.min(4, w * 0.012));
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(x + w - ew, y, ew, gh);
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(x, y, ew, gh);
    const sg = ctx.createLinearGradient(0, y, 0, y + gh * 0.3); sg.addColorStop(0, "rgba(0,0,0,0.28)"); sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg; ctx.fillRect(x, y, w, gh * 0.3);
    if (gold) { ctx.fillStyle = "rgba(255,240,190,0.35)"; ctx.fillRect(x, y, w, 1.5); }
  }
  function lattice(ctx, x1, y1, x2, depth) {
    ctx.beginPath();
    ctx.moveTo(x1, y1 - depth); ctx.lineTo(x2, y1 - depth); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1);
    let s = 0; for (let x = x1; x < x2; x += depth) { ctx.moveTo(x, s ? y1 - depth : y1); ctx.lineTo(Math.min(x2, x + depth), s ? y1 : y1 - depth); s ^= 1; }
    ctx.stroke();
  }
  function plane(ctx, x, y, s, dir, night, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    ctx.fillStyle = night > 0.5 ? "#c9cfdc" : "#ffffff";
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-14, 14); ctx.lineTo(-6, 14); ctx.lineTo(8, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-24, -2); ctx.lineTo(-30, -12); ctx.lineTo(-25, -12); ctx.lineTo(-18, -2); ctx.fill();
    ctx.fillStyle = "#f4b400"; ctx.fillRect(-20, -1, 40, 2);
    ctx.fillStyle = "#2b3644"; for (let i = -14; i < 22; i += 5) ctx.fillRect(i, -2.5, 2.5, 2);
    if (night > 0.3) { ctx.fillStyle = Math.sin(t * 6) > 0 ? "#ff4040" : "#40ff60"; ctx.beginPath(); ctx.arc(-12, 13, 1.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.translate(x - dir * s * 34, y);
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-dir * 14 * s, 0); ctx.stroke();
    ctx.fillStyle = "#f4b400"; const bw = 70 * s, bh = 14 * s; ctx.fillRect(dir > 0 ? -14 * s - bw : 14 * s, -bh / 2, bw, bh);
    txt(ctx, "YÜKSEL!", dir > 0 ? -14 * s - bw / 2 : 14 * s + bw / 2, 0.5, Math.round(10 * s), "#1b1400", { ls: "1px" });
    ctx.restore();
  }
  function sky(ctx, r, alt, t, night) {
    const top = ramp(SKY_TOP, alt), bot = ramp(SKY_BOT, alt);
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, css(top)); g.addColorStop(1, css(bot));
    ctx.fillStyle = g; ctx.fillRect(r.x - 30, r.y - 30, r.w + 60, r.h + 60);
    if (night > 0) for (const st of stars) { ctx.fillStyle = "rgba(255,255,255," + night * (0.55 + 0.45 * Math.sin(t * 1.5 + st.tw)) + ")"; ctx.fillRect(r.x + st.x * r.w, r.y + st.y * r.h * 0.9, st.s, st.s); }
    return { top, bot };
  }

  // ---------------- oyun ----------------
  function create(opts) {
    const seed = opts.seed | 0;
    const g = {
      score: 0, over: false, lives: LIVES, streak: 0, windLevel: 0,
      blocks: [{ x: 0.5, w: BASE_W, perfect: false }],
      cam: 0, vf: 9, phase: "lower", phaseT: 0, t: 0, swing: swingFor(seed, 1), fall: null, topple: null, retract: 0,
      swayT: 0, swayAmp: 0, balance: 0, trauma: 0, freeze: 0, squash: 0, flash: 0, acc: 0,
      debris: [], pops: [], parts: [], rings: [], streaks: [], planes: [], birds: [], meteors: [], clock: 0,
    };
    const top = () => g.blocks.length;
    const floors = () => g.blocks.length - 1;
    const pivotY = () => top() + DROP_H + 1 + ROPE;
    const ropeLen = () => (g.phase === "lower" ? ROPE * lerp(0.25, 1, easeOut(g.phaseT / 0.42)) : ROPE);
    const hookAngle = () => { const w = windAt(g.blocks.length); return g.swing.amp * Math.sin(2 * Math.PI * g.t / g.swing.period) + (w ? w.dir * w.s * 0.1 : 0); };
    const swayAt = i => g.swayAmp * Math.sin(2 * Math.PI * g.swayT / 2.6) * Math.pow(clamp(i / 20, 0, 1), 1.2);
    function updateSway() {
      let mis = 0, k = 0;
      for (let i = Math.max(1, g.blocks.length - 8); i < g.blocks.length; i++) { mis += Math.abs(g.blocks[i].x - g.blocks[i - 1].x); k++; }
      const n = floors();
      g.swayAmp = (n >= 5 ? Math.min(0.06, 0.003 * (n - 4)) : 0) + Math.min(0.04, (k ? mis / k : 0) * 0.5);
    }
    const popW = (text, c, dy, big) => g.pops.push({ text, life: 1.2, x: 0.5, y: top() + (dy || 1.2), c, big });
    function dust(x, y) { for (let s = 0; s < 2; s++) { const ex = s ? x + BW / 2 : x - BW / 2; for (let i = 0; i < 7; i++) g.parts.push({ x: ex, y, vx: (s ? 1 : -1) * (0.05 + Math.random() * 0.12), vy: Math.random() * 0.8, life: 0.5 + Math.random() * 0.4, size: 2 + Math.random() * 3, c: "225,215,200" }); } }
    function confetti() { const cols = ["255,106,61", "31,194,176", "244,180,0", "255,255,255", "140,120,255"]; for (let i = 0; i < 40; i++) g.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.6, y: top() + 3 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.4, vy: 1 + Math.random() * 2, life: 1.2 + Math.random() * 0.6, size: 2 + Math.random() * 2.5, c: cols[i % 5], sq: true }); }
    function spawnNext() { g.swing = swingFor(seed, g.blocks.length); g.t = 0; g.phase = "lower"; g.phaseT = 0; SFX.winch(); }
    function stability() {
      const b = g.blocks; let sum = 0, cnt = 0, worst = 0;
      for (let i = b.length - 1; i >= 1; i--) {
        sum += b[i].x; cnt++;
        const com = sum / cnt, sup = b[i - 1], ratio = Math.abs(com - sup.x) / (sup.w / 2);
        if (ratio > 1) return { fail: i, side: com >= sup.x ? 1 : -1 };
        worst = Math.max(worst, ratio);
      }
      return { fail: 0, worst };
    }
    function loseLife() {
      g.streak = 0; g.trauma = Math.min(1, g.trauma + 0.6);
      buzz([40, 40, 90]); setTimeout(() => SFX.crash(), 250);
      g.lives--;
      if (g.lives > 0) { SFX.lifeLost(); popW(g.lives + " CAN KALDI", "#ff6b78", 2.4); g.phase = "settle"; g.phaseT = -0.35; }
      else { g.phase = "dead"; g.over = true; }
    }
    function afterLanding() {
      g.fall = null; g.phase = "settle"; g.phaseT = 0;
      const st = stability();
      g.balance = st.worst || 0;
      if (st.fail) {
        const removed = g.blocks.splice(st.fail);
        removed.forEach((b, k) => { const j = st.fail + k; g.debris.push({ x: b.x + swayAt(j), y: j, w: b.w, vy: -0.6 - k * 0.15, vx: st.side * (0.1 + k * 0.035), rot: 0, vr: st.side * (1.2 + k * 0.35), perfect: b.perfect }); });
        g.score = Math.max(0, g.score - 25 * removed.length); g.balance = 0;
        popW("KULE YIKILDI  −" + removed.length + " KAT", "#ff6b78", 2.2, removed.length >= 3);
        g.trauma = 1; SFX.topple(); updateSway(); loseLife();
        return;
      }
      if (g.balance > 0.7) SFX.creak();
      updateSway();
      const n = floors();
      if (n > 0 && n % 10 === 0) { g.flash = 0.15; confetti(); popW(n + ". KAT!", "#ffffff", 3.2, true); setTimeout(() => SFX.milestone(), 120); }
      if (PLANE_FLOORS.includes(n)) { const dir = Math.random() < 0.5 ? 1 : -1; g.planes.push({ dir, x: dir > 0 ? -0.4 : 1.4, y: top() + 4.5 + Math.random() * 2 }); }
    }
    function land() {
      const f = g.fall, ti = g.blocks.length - 1, tb = g.blocks[ti];
      const topX = tb.x + swayAt(ti), d = f.x - topX, ad = Math.abs(d), y = top();
      if (ad <= PERFECT * BW) {
        const ni = g.blocks.length;
        g.blocks.push({ x: topX - swayAt(ni), w: BW, perfect: true });
        g.streak++;
        const gain = 25 + 25 * g.streak; g.score += gain;
        g.rings.push({ x: topX, y, life: 1 });
        g.pops.push({ text: (g.streak > 1 ? "KUSURSUZ ×" + g.streak : "KUSURSUZ") + "  +" + gain, life: 1.1, x: topX, y: y + 1.4, c: "#ffd34d" });
        g.freeze = 0.06; g.trauma = Math.min(1, g.trauma + 0.18); g.squash = 1;
        SFX.thud(0.7); SFX.chime(g.streak - 1); buzz(15); dust(topX, y);
        afterLanding();
      } else if (ad <= 0.5 * BW) {
        const ni = g.blocks.length;
        g.blocks.push({ x: f.x - swayAt(ni), w: BW, perfect: false });
        g.streak = 0; g.score += 25;
        g.pops.push({ text: "+25", life: 0.9, x: f.x, y: y + 1.3, c: "#ffffff" });
        g.trauma = Math.min(1, g.trauma + 0.3); g.squash = 1;
        SFX.thud(1); buzz(10); dust(f.x, y);
        afterLanding();
      } else if (ad < BW) {
        const side = d > 0 ? 1 : -1;
        g.topple = { side, px: topX + side * BW / 2, bx: f.x, y, th: 0, w: 0 };
        g.phase = "topple"; g.fall = null;
        SFX.thud(0.6); SFX.topple();
      } else {
        g.debris.push({ x: f.x, y: f.y, w: BW, vy: f.vy, vx: 0, rot: 0, vr: (Math.random() - 0.5) * 2, perfect: false });
        g.fall = null; SFX.fall(); loseLife();
      }
    }
    function step(dt, active) {
      g.swayT += dt;
      if (g.freeze > 0) { g.freeze -= dt; return; }
      if (g.over) return;
      if (g.phase === "lower") { g.phaseT += dt; g.t += dt; if (g.phaseT >= 0.42) g.phase = "swing"; }
      else if (g.phase === "swing") { if (active) g.t += dt; }
      else if (g.phase === "drop") {
        const f = g.fall; f.vy += G * dt; f.y -= f.vy * dt; f.rot *= Math.exp(-10 * dt);
        const w = windAt(g.blocks.length);
        if (w) { const dx = w.dir * w.s * 0.1 * dt; if (Math.abs(f.drift + dx) <= 0.15 * BW) { f.drift += dx; f.x += dx; } }
        if (f.y <= top()) { f.y = top(); land(); }
      } else if (g.phase === "topple") {
        const tp = g.topple; tp.w += 9 * dt; tp.th += tp.w * dt;
        if (tp.th > 1.3) {
          const phi = -tp.side * tp.th, dx = tp.bx - tp.px, dyu = 0.5 * BHW;
          const cx = tp.px + dx * Math.cos(phi) - dyu * Math.sin(phi), cy = tp.y + (dx * Math.sin(phi) + dyu * Math.cos(phi)) / BHW;
          g.debris.push({ x: cx, y: cy - 0.5, w: BW, vy: 1.5, vx: tp.side * 0.18, rot: tp.side * tp.th, vr: tp.side * tp.w, perfect: false });
          g.topple = null; loseLife();
        }
      } else if (g.phase === "settle") { g.phaseT += dt; if (g.phaseT >= 0.25 && active) spawnNext(); }
      g.retract = Math.max(0, g.retract - dt);
    }
    function fx(dt, active) {
      g.clock += dt;
      g.cam += (Math.max(0, top() - g.vf * 0.28) - g.cam) * Math.min(1, dt * 4);
      g.trauma = Math.max(0, g.trauma - dt * 1.6); g.squash = Math.max(0, g.squash - dt * 7); g.flash = Math.max(0, g.flash - dt);
      for (const d of g.debris) { d.vy += G * dt; d.y -= d.vy * dt; d.x += d.vx * dt; d.rot += d.vr * dt; }
      g.debris = g.debris.filter(d => d.y > g.cam - 15);
      for (const s of g.pops) { s.life -= dt * 0.8; s.y += dt * 0.9; } g.pops = g.pops.filter(s => s.life > 0);
      for (const q of g.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy -= (q.sq ? 2.5 : 1.2) * dt; q.vx *= 0.97; q.life -= dt; } g.parts = g.parts.filter(q => q.life > 0);
      for (const r of g.rings) r.life -= dt * 1.6; g.rings = g.rings.filter(r => r.life > 0);
      for (const pl of g.planes) pl.x += pl.dir * 0.22 * dt; g.planes = g.planes.filter(pl => pl.x > -0.6 && pl.x < 1.6);
      const n = floors();
      if (n < 20 && g.birds.length < 2 && Math.random() < dt * 0.12) {
        const dir = Math.random() < 0.5 ? 1 : -1, flock = [], k = 3 + ((Math.random() * 3) | 0);
        for (let i = 0; i < k; i++) flock.push({ ox: -i * 0.04 * dir, oy: (i % 2 ? 1 : -1) * i * 0.18, ph: Math.random() * 6 });
        g.birds.push({ dir, x: dir > 0 ? -0.2 : 1.2, y: g.cam + 3 + Math.random() * Math.max(2, g.vf - 5), v: 0.12 + Math.random() * 0.06, flock });
      }
      for (const b of g.birds) b.x += b.dir * b.v * dt; g.birds = g.birds.filter(b => b.x > -0.5 && b.x < 1.5);
      if (n >= 42 && Math.random() < dt * 0.5) g.meteors.push({ x: Math.random() * 1.2, y: g.cam + g.vf * (0.5 + Math.random() * 0.5), life: 0.8 });
      for (const m of g.meteors) { m.x -= 0.6 * dt; m.y -= 3 * dt; m.life -= dt; } g.meteors = g.meteors.filter(m => m.life > 0);
      const wind = windAt(g.blocks.length);
      g.windLevel = wind && active && !g.over ? wind.s : 0;
      if (g.windLevel && g.streaks.length < 18 * wind.s && Math.random() < dt * 22 * wind.s) g.streaks.push({ x: wind.dir > 0 ? -0.2 : 1.2, y: Math.random(), l: 0.06 + Math.random() * 0.12, v: (0.6 + Math.random() * 0.6) * wind.dir * (0.6 + wind.s), a: 0.15 + Math.random() * 0.25 });
      for (const s of g.streaks) s.x += s.v * dt; g.streaks = g.streaks.filter(s => s.x > -0.4 && s.x < 1.4);
    }

    const inst = {
      get score() { return g.score; },
      get over() { return g.over; },
      get windLevel() { return g.windLevel; },
      info() { return { lives: g.lives, maxLives: LIVES, extra: g.streak > 1 ? "SERİ ×" + g.streak : "", sub: "KAT " + floors() + " · " + (floors() * FLOOR_M).toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " m" }; },
      update(dt, active) {
        g.acc += dt;
        while (g.acc >= STEP) { step(STEP, active); g.acc -= STEP; }
        fx(dt, active);
      },
      pointer(type) {
        if (type !== "down" || g.over || g.phase !== "swing") return;
        const a = hookAngle();
        g.fall = { x: 0.5 + Math.sin(a) * ROPE * BHW, y: pivotY() - Math.cos(a) * ROPE - 1, vy: 0, rot: a, drift: 0 };
        g.phase = "drop"; g.retract = 0.3;
        SFX.release(); SFX.whoosh();
      },
      net() { const off = Math.max(0, g.blocks.length - 12); return { n: floors(), off, b: g.blocks.slice(off).map(b => Math.round(b.x * 1000) * (b.perfect ? -1 : 1)) }; },
      draw(ctx, R, active) {
        const t = g.clock;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); ctx.translate(R.x, R.y);
        const VW = R.w, playH = R.h;
        const s = Math.min(VW, playH / (BHW * 8.5)), ox = (VW - s) / 2, BH = BHW * s, site = BH * 0.9, base0 = playH - site;
        g.vf = base0 / BH;
        const sx = x => ox + x * s, camPx = g.cam * BH, sy = y => base0 - y * BH + camPx;
        const alt = g.cam / SKY_FLOORS, night = clamp((alt - 0.4) / 0.35, 0, 1);
        const sh = g.trauma * g.trauma;
        if (sh > 0.001) { ctx.translate(VW / 2, playH / 2); ctx.rotate((Math.random() * 2 - 1) * 0.02 * sh); ctx.translate(-VW / 2 + (Math.random() * 2 - 1) * 14 * sh, -playH / 2 + (Math.random() * 2 - 1) * 10 * sh); }
        const { top: skyTop, bot } = sky(ctx, { x: 0, y: 0, w: VW, h: playH }, alt, t, night);
        const sr = Math.max(14, Math.min(VW, playH) * 0.06), sunY = playH * (0.14 + alt * 1.6), sunX = VW * 0.8;
        if (sunY < playH + sr) {
          const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sr * 4); sg.addColorStop(0, "rgba(255,240,200,0.55)"); sg.addColorStop(1, "rgba(255,200,120,0)");
          ctx.fillStyle = sg; ctx.fillRect(sunX - sr * 4, sunY - sr * 4, sr * 8, sr * 8);
          ctx.fillStyle = css(mix(hex("#fff6dc"), hex("#ff9a5c"), clamp(alt * 2.5, 0, 1))); ctx.beginPath(); ctx.arc(sunX, sunY, sr, 0, Math.PI * 2); ctx.fill();
        }
        if (night > 0.2) {
          const mx = VW * 0.2, my = playH * 0.14; ctx.globalAlpha = Math.min(1, (night - 0.2) * 1.6);
          ctx.fillStyle = "#f4f1e6"; ctx.beginPath(); ctx.arc(mx, my, sr * 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = css(skyTop); ctx.beginPath(); ctx.arc(mx + sr * 0.35, my - sr * 0.15, sr * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
        for (const m of g.meteors) { const mx = m.x * VW, my = sy(m.y), mg = ctx.createLinearGradient(mx, my, mx + 40, my - 60); mg.addColorStop(0, "rgba(255,255,255," + m.life + ")"); mg.addColorStop(1, "rgba(255,255,255,0)"); ctx.strokeStyle = mg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 40, my - 60); ctx.stroke(); }
        const farBase = base0 + camPx * 0.12, nearBase = base0 + camPx * 0.28;
        const skyline = (list, baseY, col, scale, lit) => {
          if (baseY - playH * 0.5 > playH) return;
          ctx.fillStyle = css(col);
          for (const b of list) { const bh = b.h * playH * scale, bx = b.x * VW, bw = b.w * VW; ctx.fillRect(bx, baseY - bh, bw, bh + 2); if (b.cap > 0.75) ctx.fillRect(bx + bw * 0.4, baseY - bh - bh * 0.12, bw * 0.2, bh * 0.12); }
          if (lit > 0) { ctx.fillStyle = "rgba(255,206,120," + lit + ")"; for (const b of list) { const bh = b.h * playH * scale, bx = b.x * VW, bw = b.w * VW; for (const w of b.wins) ctx.fillRect(bx + w[0] * bw - 1, baseY - bh + w[1] * bh, 2, 2.5); } }
        };
        skyline(cityFar, farBase, mix(bot, ramp(FAR_TINT, alt), 0.55), 0.9, night * 0.5);
        const hz = ctx.createLinearGradient(0, farBase - playH * 0.35, 0, farBase); hz.addColorStop(0, css(bot, 0)); hz.addColorStop(1, css(bot, 0.35));
        ctx.fillStyle = hz; ctx.fillRect(0, farBase - playH * 0.35, VW, playH * 0.35);
        skyline(cityNear, nearBase, mix(bot, ramp(NEAR_TINT, alt), 0.85), 0.85, night * 0.85);
        const spr = sprites();
        for (const c of clouds) {
          const cy = base0 - c.alt * BH * 2.2 + camPx * 0.85; if (cy < -80 || cy > playH + 40) continue;
          const sp = spr[c.sp], cw = VW * 0.45 * c.s, ch = cw * sp.height / sp.width, cx = ((c.x + t * c.v) % 1.4) - 0.2;
          ctx.globalAlpha = 0.75 * (1 - night * 0.8); ctx.drawImage(sp, cx * VW - cw / 2, cy - ch / 2, cw, ch);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = night > 0.5 ? "rgba(220,225,240,0.7)" : "rgba(30,35,45,0.75)"; ctx.lineWidth = 1.4;
        for (const b of g.birds) for (const f of b.flock) { const bx = sx(b.x + f.ox), by = sy(b.y + f.oy), wv = Math.sin(t * 10 + f.ph) * 4; ctx.beginPath(); ctx.moveTo(bx - 6, by - wv); ctx.quadraticCurveTo(bx - 3, by - 2, bx, by); ctx.quadraticCurveTo(bx + 3, by - 2, bx + 6, by - wv); ctx.stroke(); }
        for (const pl of g.planes) plane(ctx, sx(pl.x), sy(pl.y), Math.max(0.7, s / 420), pl.dir, night, t);
        // zemin
        const groundY = sy(0);
        if (groundY < playH + 10) {
          const gg = ctx.createLinearGradient(0, groundY, 0, groundY + site + 40);
          gg.addColorStop(0, css(mix(hex("#7a6248"), hex("#2a2330"), night))); gg.addColorStop(1, css(mix(hex("#4b3a2a"), hex("#15121b"), night)));
          ctx.fillStyle = gg; ctx.fillRect(0, groundY, VW, site + 60);
          const hoardH = BH * 0.55;
          ctx.fillStyle = css(mix(hex("#34495a"), hex("#1a2130"), night)); ctx.fillRect(0, groundY - hoardH, VW, hoardH);
          ctx.fillStyle = "rgba(255,255,255,0.08)"; for (let x = 0; x < VW; x += Math.max(24, VW / 12)) ctx.fillRect(x, groundY - hoardH, 1, hoardH);
          hazard(ctx, 0, groundY - hoardH, VW, Math.max(3, hoardH * 0.16), "#1c1f24", "#f4b400");
          for (const cx of [VW * 0.08, VW * 0.92]) {
            const ch = BH * 0.5, cw = ch * 0.7, cy = groundY + site * 0.55;
            ctx.fillStyle = "#ff6f1a"; ctx.beginPath(); ctx.moveTo(cx - cw / 2, cy); ctx.lineTo(cx, cy - ch); ctx.lineTo(cx + cw / 2, cy); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.fillRect(cx - cw * 0.25, cy - ch * 0.55, cw * 0.5, ch * 0.14);
            ctx.fillStyle = "#222"; ctx.fillRect(cx - cw * 0.6, cy, cw * 1.2, 3);
          }
        }
        // kule
        const last = g.blocks.length - 1;
        for (let i = 0; i <= last; i++) {
          const b = g.blocks[i], y = sy(i + 1); if (y > playH || y + BH < -BH) continue;
          const bx = b.x + swayAt(i);
          if (i === last && g.squash > 0 && i > 0) { const q = g.squash, wpx = b.w * s * (1 + 0.06 * q), hpx = BH * (1 - 0.1 * q); drawFloor(ctx, sx(bx) - wpx / 2, y + (BH - hpx), wpx, hpx, i, night, b.perfect); }
          else drawFloor(ctx, sx(bx - b.w / 2), y, b.w * s, BH, i, night, b.perfect);
        }
        if (g.over && last > 0) {
          const b = g.blocks[last], x = sx(b.x + swayAt(last) - b.w / 2), y = sy(last + 1), w = b.w * s, h = BH;
          ctx.fillStyle = css(mix(hex("#5a606e"), hex("#262a36"), night)); ctx.fillRect(x + w * 0.06, y - h * 0.35, w * 0.88, h * 0.35);
          ctx.fillStyle = COL.accent; ctx.fillRect(x + w * 0.06, y - h * 0.35, w * 0.88, 2);
          ctx.strokeStyle = "#c8ccd4"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.7, y - h * 0.35); ctx.lineTo(x + w * 0.7, y - h * 1.6); ctx.stroke();
          ctx.fillStyle = Math.sin(t * 4) > 0 ? "#ff3b3b" : "#5a1010"; ctx.beginPath(); ctx.arc(x + w * 0.7, y - h * 1.6, 3, 0, Math.PI * 2); ctx.fill();
        }
        // vinç
        const pvx = sx(0.5), pvy = sy(pivotY()), crane = css(mix(hex("#f4b400"), hex("#8a6a1a"), night * 0.6));
        const jd = Math.max(7, BH * 0.36), lw = Math.max(1, s / 420);
        if (pvy > -jd * 2) {
          ctx.strokeStyle = crane; ctx.lineWidth = lw; lattice(ctx, -4, pvy, VW + 4, jd);
          ctx.fillStyle = "#2a2d33"; rr(ctx, pvx - 12, pvy - 3, 24, 8, 2); ctx.fill();
          if (night > 0.3) { ctx.fillStyle = Math.sin(t * 4) > 0 ? "#ff3b3b" : "#5a1010"; ctx.beginPath(); ctx.arc(VW - 8, pvy - jd, 2.5, 0, Math.PI * 2); ctx.fill(); }
        }
        const hanging = !g.over && (g.phase === "lower" || g.phase === "swing");
        if (!g.over && (hanging || g.retract > 0)) {
          const a = hanging ? hookAngle() : 0, L = (hanging ? ropeLen() : ROPE * (0.3 + 0.7 * (g.retract / 0.3))) * BH;
          ctx.save(); ctx.translate(pvx, pvy + 4); ctx.rotate(-a);
          ctx.strokeStyle = "#1c1f24"; ctx.lineWidth = Math.max(1, lw * 1.3);
          ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-3, L - BH * 0.5); ctx.moveTo(3, 0); ctx.lineTo(3, L - BH * 0.5); ctx.stroke();
          ctx.fillStyle = "#f4b400"; rr(ctx, -8, L - BH * 0.55, 16, 9, 2); ctx.fill();
          if (hanging) {
            const bwp = BW * s;
            ctx.strokeStyle = "rgba(20,20,20,0.75)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, L - BH * 0.5 + 8); ctx.lineTo(-bwp / 2 + 4, L); ctx.moveTo(0, L - BH * 0.5 + 8); ctx.lineTo(bwp / 2 - 4, L); ctx.stroke();
            drawFloor(ctx, -bwp / 2, L, bwp, BH, g.blocks.length, night, false);
          }
          ctx.restore();
        }
        if (g.phase === "drop" && g.fall) {
          const f = g.fall; ctx.save(); ctx.translate(sx(f.x), sy(f.y + 0.5)); ctx.rotate(-f.rot);
          drawFloor(ctx, -BW * s / 2, -BH / 2, BW * s, BH, g.blocks.length, night, false); ctx.restore();
          ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(sx(f.x - BW / 2), sy(top()) - 2, BW * s, 2);
        }
        if (g.phase === "topple" && g.topple) {
          const tp = g.topple; ctx.save(); ctx.translate(sx(tp.px), sy(tp.y)); ctx.rotate(tp.side * tp.th);
          drawFloor(ctx, (tp.bx - BW / 2 - tp.px) * s, -BH, BW * s, BH, g.blocks.length, night, false); ctx.restore();
        }
        for (const d of g.debris) { ctx.save(); ctx.translate(sx(d.x), sy(d.y + 0.5)); ctx.rotate(d.rot); drawFloor(ctx, -d.w * s / 2, -BH / 2, d.w * s, BH, 3, night, d.perfect); ctx.restore(); }
        for (const q of g.parts) {
          ctx.fillStyle = "rgba(" + q.c + "," + clamp(q.life, 0, 1) * (q.sq ? 1 : 0.7) + ")";
          if (q.sq) ctx.fillRect(sx(q.x), sy(q.y), q.size * 1.6, q.size); else { ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.size * (1.4 - q.life * 0.6), 0, Math.PI * 2); ctx.fill(); }
        }
        for (const r of g.rings) { const y = sy(r.y + 0.5), gr = (1 - r.life) * BH * 1.2; ctx.strokeStyle = "rgba(255,226,120," + r.life + ")"; ctx.lineWidth = 2; rr(ctx, sx(r.x) - BW * s / 2 - gr, y - BH / 2 - gr * 0.5, BW * s + gr * 2, BH + gr, 4); ctx.stroke(); }
        for (const q of g.pops) { const size = Math.round(Math.max(15, BH * (q.big ? 1.1 : 0.62))); txt(ctx, q.text, clamp(sx(q.x), 70, VW - 70), sy(q.y), fit(ctx, q.text, VW - 24, size, q.big ? K.DISP : K.COND, q.big ? "400" : "800"), q.c, { a: Math.min(1, q.life * 1.6), stroke: 4, ls: "1px", f: q.big ? K.DISP : K.COND, w: q.big ? "400" : "800" }); }
        if (g.streaks.length) { ctx.lineWidth = 1.2; ctx.lineCap = "round"; for (const st of g.streaks) { ctx.strokeStyle = "rgba(255,255,255," + st.a + ")"; const y = st.y * playH * 0.8; ctx.beginPath(); ctx.moveTo(st.x * VW, y); ctx.lineTo((st.x - Math.sign(st.v) * st.l) * VW, y); ctx.stroke(); } ctx.lineCap = "butt"; }
        // rozetler
        let bx = 12;
        const pill = (label, bg) => { const size = Math.round(clamp(VW / 26, 13, 17)); ctx.font = "800 " + size + "px " + K.COND; const w = ctx.measureText(label).width + 22; ctx.fillStyle = bg; rr(ctx, bx, 12, w, size + 12, (size + 12) / 2); ctx.fill(); txt(ctx, label, bx + w / 2, 12 + (size + 12) / 2 + 1, size, "#fff", { ls: "0.5px" }); bx += w + 8; };
        if (active && !g.over) {
          const wind = windAt(g.blocks.length);
          if (wind) pill("RÜZGÂR " + (wind.dir > 0 ? "→" : "←") + " " + (wind.s > 0.9 ? "SERT" : "ORTA"), "rgba(14,17,26,0.78)");
          else if (windAt(g.blocks.length + 1)) pill("RÜZGÂR GELİYOR", "rgba(14,17,26,0.6)");
          if (g.balance > 0.7) pill("⚠ DENGE KRİTİK", "rgba(230,110,20," + (0.75 + 0.25 * Math.sin(t * 8)) + ")");
        }
        if (g.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (g.flash / 0.15) * 0.25 + ")"; ctx.fillRect(0, 0, VW, playH); }
        ctx.restore();
      },
    };
    return inst;
  }

  function drawRemote(ctx, R, d, t) {
    const n = d && d.n ? d.n : 0, alt = clamp(n / 70, 0, 1), night = clamp((alt - 0.4) / 0.35, 0, 1);
    sky(ctx, R, alt, t, night);
    const BH = Math.min(R.h / 9, R.w * 0.07), s = BH / BHW, ox = R.x + (R.w - s) / 2, ground = R.y + R.h - BH * 0.6;
    ctx.fillStyle = "#4b3a2a"; ctx.fillRect(R.x, ground, R.w, R.y + R.h - ground);
    const list = d && Array.isArray(d.b) ? d.b : [];
    const off = d && d.off ? d.off : 0;
    const shown = Math.min(list.length, Math.floor((R.h - BH) / BH));
    const startI = list.length - shown;
    for (let k = startI; k < list.length; k++) {
      const v = list[k], idx = off + k, x = Math.abs(v) / 1000, w = idx === 0 ? BASE_W : BW;
      const y = ground - (k - startI + 1) * BH;
      drawFloor(ctx, ox + (x - w / 2) * s, y, w * s, BH, idx, night, v < 0);
    }
  }

  K.register({
    id: "kule", name: "Kule Yarışı", color: "#ff6a3d", desc: "Vinçten bloğu bırak, kuleni dengede tutarak yükselt.",
    rules: "Blok sallanırken dokun · tam üstüne oturt · 3 can",
    timeLimit: mode => (mode === "duel" ? 60 : null),
    create, drawRemote,
  });
})();
