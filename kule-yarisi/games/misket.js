// Misket: atıcı misketi sapan gibi geri çek, bırak; çemberden çıkardığın her misket puan.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const RING = { x: 50, y: 42, r: 30 };
  const TR = 2.8, SR = 3.6, START = { x: 50, y: 88 };
  const COLORS = ["#ff5a4e", "#f4b400", "#2bb673", "#3d8bff", "#a46bff", "#ff7ab8", "#1fc2b0"];
  const STEP = 1 / 240;
  // toprak zemin dokusu (CC0, Poly Haven "aerial_beach_01"; bkz. KAYNAKLAR.md)
  const soil = new Image(); soil.src = "doku/toprak.jpg";
  let soilPat = null;
  // Gerçekçi cam misket: saydam gövde, içinde renkli girdap (kedi gözü), parlama.
  function marble(ctx, x, y, r, col, milky) {
    const c = K.hex(col);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    if (milky) { g.addColorStop(0, "#ffffff"); g.addColorStop(0.7, "#e9e4da"); g.addColorStop(1, "#a8a296"); }
    else { g.addColorStop(0, "rgba(255,255,255,0.85)"); g.addColorStop(0.5, K.css(K.mix(c, [255, 255, 255], 0.55), 0.55)); g.addColorStop(1, K.css(K.mix(c, [0, 0, 0], 0.35), 0.9)); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * 0.92, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.2, r * 0.28); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - r * 0.8, y + r * 0.2); ctx.bezierCurveTo(x - r * 0.3, y - r * 0.6, x + r * 0.3, y + r * 0.6, x + r * 0.8, y - r * 0.2); ctx.stroke();
    ctx.lineWidth = Math.max(1, r * 0.14); ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(x - r * 0.6, y - r * 0.5); ctx.bezierCurveTo(x, y - r * 0.1, x, y + r * 0.1, x + r * 0.5, y + r * 0.6); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r - 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.13, -0.6, 0, Math.PI * 2); ctx.fill();
  }
  // İlk dizilim: klasik "artı" (13 misket); sonrakiler rastgele.
  function rack(seed, k) {
    if (k === 0) {
      const out = [], sp = TR * 2.35;
      const pts = [[0, 0]]; for (let i = 1; i <= 3; i++) pts.push([i, 0], [-i, 0], [0, i], [0, -i]);
      pts.forEach(([a, b], i) => out.push({ x: RING.x + a * sp, y: RING.y + b * sp, vx: 0, vy: 0, r: TR, m: 1, c: COLORS[i % COLORS.length], out: false, fade: 1 }));
      return out;
    }
    const n = Math.min(6 + k, 10), out = [];
    let tries = 0;
    while (out.length < n && tries < 400) {
      tries++;
      const a = hash(seed, k * 100 + tries) * Math.PI * 2, d = Math.sqrt(hash(seed, k * 100 + tries + 50)) * 15;
      const x = RING.x + Math.cos(a) * d, y = RING.y + Math.sin(a) * d;
      if (out.every(o => Math.hypot(o.x - x, o.y - y) > TR * 2.4)) out.push({ x, y, vx: 0, vy: 0, r: TR, m: 1, c: COLORS[out.length % COLORS.length], out: false, fade: 1 });
    }
    return out;
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, k: 0, balls: rack(seed, 0), sh: { x: START.x, y: START.y, vx: 0, vy: 0, r: SR, m: 1.6, c: "#f3efe7" }, aim: null, moving: false, hits: 0, R: null, pops: [], parts: [], acc: 0, clock: 0, shots: 0 };
    function map(R) { const u = Math.min(R.w / 100, R.h / 104), ox = R.x + (R.w - 100 * u) / 2, oy = R.y + (R.h - 104 * u) / 2 + 2 * u; return { u, ox, oy, sx: x => ox + x * u, sy: y => oy + y * u, wx: px => (px - ox) / u, wy: py => (py - oy) / u }; }
    function physics(dt) {
      const all = [g.sh, ...g.balls.filter(b => !b.out)];
      for (const b of all) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 0) { const ns = Math.max(0, sp * Math.exp(-1.05 * dt) - 9 * dt); b.vx *= ns / sp; b.vy *= ns / sp; }
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.6; } if (b.x > 100 - b.r) { b.x = 100 - b.r; b.vx = -Math.abs(b.vx) * 0.6; }
        if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.6; } if (b.y > 100 - b.r) { b.y = 100 - b.r; b.vy = -Math.abs(b.vy) * 0.6; }
      }
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = a.r + b.r;
        if (d > 0 && d < min) {
          const nx = dx / d, ny = dy / d, ov = min - d, tm = a.m + b.m;
          a.x -= nx * ov * (b.m / tm); a.y -= ny * ov * (b.m / tm); b.x += nx * ov * (a.m / tm); b.y += ny * ov * (a.m / tm);
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const j2 = (-(1 + 0.93) * rv) / (1 / a.m + 1 / b.m);
            a.vx -= (j2 / a.m) * nx; a.vy -= (j2 / a.m) * ny; b.vx += (j2 / b.m) * nx; b.vy += (j2 / b.m) * ny;
            if (-rv > 6) SFX.clack(-rv / 90);
          }
        }
      }
      for (const b of g.balls) if (!b.out && Math.hypot(b.x - RING.x, b.y - RING.y) > RING.r + b.r) {
        b.out = true; g.hits++;
        const pts = 50 + 25 * (g.hits - 1); g.score += pts;
        const M = map(g.R);
        K.pops.add(g.pops, "+" + pts, M.sx(b.x), M.sy(b.y) - 10, g.hits > 1 ? "#ffd34d" : "#ffffff", g.hits > 2);
        K.parts.burst(g.parts, M.sx(b.x), M.sy(b.y), b.c, 10, 150);
        SFX.chime(2 + g.hits); buzz(12);
      }
    }
    function stillMoving() { return [g.sh, ...g.balls.filter(b => !b.out)].some(b => Math.hypot(b.vx, b.vy) > 1.5); }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: g.balls.filter(b => !b.out).length + " misket kaldı" }; },
      update(dt, active) {
        g.clock += dt;
        if (g.moving) {
          g.acc += Math.min(dt, 0.05);
          while (g.acc >= STEP) { physics(STEP); g.acc -= STEP; }
          if (!stillMoving()) {
            g.moving = false;
            for (const b of [g.sh, ...g.balls]) { b.vx = 0; b.vy = 0; }
            if (g.hits === 0) SFX.pop(false);
            g.hits = 0;
            // Kural: atıcı çemberin içinde kaldıysa bir sonraki atış oradan yapılır.
            if (Math.hypot(g.sh.x - RING.x, g.sh.y - RING.y) > RING.r - g.sh.r) { g.sh.x = START.x; g.sh.y = START.y; }
            if (g.balls.every(b => b.out)) {
              g.score += 150;
              K.pops.add(g.pops, "ÇEMBER TEMİZ!  +150", g.R.x + g.R.w / 2, g.R.y + 40, "#ffd34d", true);
              SFX.milestone(); g.k++; g.balls = rack(seed, g.k);
            }
          }
        }
        for (const b of g.balls) if (b.out) b.fade = Math.max(0, b.fade - dt * 2);
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (!g.R || g.over || g.moving) return;
        const M = map(g.R);
        if (type === "down") g.aim = { x: M.wx(x), y: M.wy(y), x0: M.wx(x), y0: M.wy(y) };
        else if (type === "move" && g.aim) { g.aim.x = M.wx(x); g.aim.y = M.wy(y); }
        else if ((type === "up" || type === "cancel") && g.aim) {
          const dx = g.aim.x0 - g.aim.x, dy = g.aim.y0 - g.aim.y, len = Math.hypot(dx, dy);
          g.aim = null;
          if (type === "up" && len > 3) {
            const p = Math.min(len, 32) / 32, sp = 25 + p * 120;
            g.sh.vx = (dx / len) * sp; g.sh.vy = (dy / len) * sp;
            g.moving = true; g.shots++; SFX.whoosh(); SFX.clack(0.5);
          }
        }
      },
      net() { return { b: g.balls.filter(b => !b.out).map(b => [Math.round(b.x), Math.round(b.y)]), s: [Math.round(g.sh.x), Math.round(g.sh.y)] }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        K.bg(ctx, R, "#c9a877", "#9c7a4e");
        const M = map(R), u = M.u;
        // toprak dokusu: fotoğraf varsa onu, yoksa noktalı doku
        if (!soilPat && soil.complete && soil.naturalWidth) soilPat = ctx.createPattern(soil, "repeat");
        if (soilPat) { ctx.save(); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = soilPat; ctx.translate(R.x, R.y); ctx.fillRect(0, 0, R.w, R.h); ctx.restore(); }
        ctx.fillStyle = "rgba(80,55,30,0.12)";
        for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(R.x + hash(i, 1) * R.w, R.y + hash(i, 2) * R.h, 1 + hash(i, 3) * 2.5, 0, Math.PI * 2); ctx.fill(); }
        // kenar gölgesi
        const vg = ctx.createRadialGradient(R.x + R.w / 2, R.y + R.h / 2, Math.min(R.w, R.h) * 0.3, R.x + R.w / 2, R.y + R.h / 2, Math.max(R.w, R.h) * 0.7);
        vg.addColorStop(0, "rgba(40,25,10,0)"); vg.addColorStop(1, "rgba(40,25,10,0.35)"); ctx.fillStyle = vg; ctx.fillRect(R.x, R.y, R.w, R.h);
        // çember
        ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = Math.max(2, u * 0.7); ctx.setLineDash([u * 2.2, u * 1.2]);
        ctx.beginPath(); ctx.arc(M.sx(RING.x), M.sy(RING.y), RING.r * u, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(M.sx(30), M.sy(START.y)); ctx.lineTo(M.sx(70), M.sy(START.y)); ctx.stroke();
        // nişan çizgisi
        if (g.aim && !g.moving) {
          const dx = g.aim.x0 - g.aim.x, dy = g.aim.y0 - g.aim.y, len = Math.hypot(dx, dy);
          if (len > 1) {
            const p = Math.min(len, 32) / 32, L = 12 + p * 45;
            ctx.strokeStyle = "rgba(255,255,255," + (0.4 + p * 0.5) + ")"; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
            ctx.beginPath(); ctx.moveTo(M.sx(g.sh.x), M.sy(g.sh.y)); ctx.lineTo(M.sx(g.sh.x + (dx / len) * L), M.sy(g.sh.y + (dy / len) * L)); ctx.stroke(); ctx.setLineDash([]);
            ctx.strokeStyle = "rgba(60,40,20,0.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(M.sx(g.sh.x), M.sy(g.sh.y)); ctx.lineTo(M.sx(g.sh.x - (dx / len) * Math.min(len, 32) * 0.4), M.sy(g.sh.y - (dy / len) * Math.min(len, 32) * 0.4)); ctx.stroke();
            ctx.fillStyle = p > 0.85 ? "#ff6b78" : "#ffd34d"; rr(ctx, M.sx(g.sh.x) - 22, M.sy(g.sh.y) + SR * u + 8, 44 * p, 6, 3); ctx.fill();
          }
        }
        // gölgeler ve misketler
        for (const b of [...g.balls, g.sh]) {
          if (b.out && b.fade <= 0) continue;
          ctx.globalAlpha = b.out ? b.fade : 1;
          ctx.fillStyle = "rgba(60,40,20,0.3)"; ctx.beginPath(); ctx.ellipse(M.sx(b.x) + u * 0.6, M.sy(b.y) + u * 0.9, b.r * u, b.r * u * 0.6, 0, 0, Math.PI * 2); ctx.fill();
          marble(ctx, M.sx(b.x), M.sy(b.y), b.r * u, b === g.sh ? "#3d8bff" : b.c, b === g.sh);
          if (b === g.sh) { ctx.strokeStyle = "rgba(60,40,20,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(M.sx(b.x), M.sy(b.y), b.r * u * 0.55, 0.3, 2.6); ctx.stroke(); }
          ctx.globalAlpha = 1;
        }
        if (!g.moving && !g.aim && g.shots < 2) txt(ctx, "Geri çek, bırak!", M.sx(50), M.sy(97), 18, "#3b2a14", { w: "800" });
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#c9a877", "#9c7a4e");
    const u = Math.min(R.w / 100, R.h / 100), ox = R.x + (R.w - 100 * u) / 2, oy = R.y + (R.h - 100 * u) / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.arc(ox + RING.x * u, oy + RING.y * u, RING.r * u, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    (d && Array.isArray(d.b) ? d.b : []).forEach((p, i) => marble(ctx, ox + p[0] * u, oy + p[1] * u, TR * u, COLORS[i % COLORS.length]));
    if (d && Array.isArray(d.s)) marble(ctx, ox + d.s[0] * u, oy + d.s[1] * u, SR * u, "#3d8bff", true);
  }
  K.register({
    id: "misket", name: "Misket", color: "#f4b400", desc: "Atıcı misketi sapan gibi geri çek; çemberden misket çıkar.",
    rules: "Parmağını basılı tut, geri çek, bırak · bir atışta çoklu = bonus",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
