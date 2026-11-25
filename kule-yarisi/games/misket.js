// Misket: atıcı misketi sapan gibi geri çek, bırak; çemberden çıkardığın her misket puan.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const RING = { x: 50, y: 42, r: 30 };
  const TR = 2.8, SR = 3.6, START = { x: 50, y: 88 };
  const COLORS = ["#ff5a4e", "#f4b400", "#2bb673", "#3d8bff", "#a46bff", "#ff7ab8", "#1fc2b0"];
  const STEP = 1 / 240;
  // toprakta yuvarlanma: hıza bağlı + sabit sürtünme; cam-cam çarpışma esnekliği; atış hızı aralığı
  const PHYS = { drag: 1.6, roll: 26, rest: 0.82, v0: 32, v1: 125 };
  // toprak zemin dokusu (CC0, Poly Haven "aerial_beach_01"; bkz. KAYNAKLAR.md)
  const soil = new Image(); soil.src = "doku/toprak.jpg";
  const TAU = Math.PI * 2;
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
  const rad = (x, cx, cy, r, stops) => { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; };
  // güç rengi: yeşil → sarı → kırmızı
  const powCol = p => { const a = p < 0.5 ? [90, 208, 106] : [255, 211, 77], b = p < 0.5 ? [255, 211, 77] : [255, 90, 78], t = p < 0.5 ? p * 2 : (p - 0.5) * 2; return "rgb(" + ((a[0] + (b[0] - a[0]) * t) | 0) + "," + ((a[1] + (b[1] - a[1]) * t) | 0) + "," + ((a[2] + (b[2] - a[2]) * t) | 0) + ")"; };
  // kedi gözü misketin iç kanatları: merkezden geçen 3 kıvrık şerit (yerel 3B noktalar); misket yuvarlandıkça döner
  const VANES = [0, 1, 2].map(k => { const f = (k * Math.PI) / 3, out = []; for (let i = 0; i <= 10; i++) { const t = i / 5 - 1, y = 0.24 * Math.sin(t * Math.PI); out.push([t * 0.8, y * Math.cos(f), y * Math.sin(f)]); } return out; });
  // misket sprite'ları (renk + piksel yarıçapı başına bir kez): cam gövde, ortak cam kaplama (fresnel + parlama), kostik ışık
  const SPR = {};
  function mspr(col, rp, milky) {
    const key = col + "|" + rp + (milky ? "m" : "");
    if (SPR[key]) return SPR[key];
    const S = Math.ceil(rp * 2 + 2), c0 = S / 2, cc = K.hex(col), W3 = [255, 255, 255], B3 = [0, 0, 0];
    const body = mk(S, S), x = body.getContext("2d");
    x.beginPath(); x.arc(c0, c0, rp, 0, TAU);
    if (milky) { x.fillStyle = rad(x, c0 - rp * 0.3, c0 - rp * 0.35, rp * 1.3, [[0, "#ffffff"], [0.55, "#f1ece2"], [1, "#a99f8e"]]); x.fill(); }
    else {
      x.fillStyle = rad(x, c0 + rp * 0.12, c0 + rp * 0.18, rp * 1.05, [[0, K.css(K.mix(cc, W3, 0.5), 0.5)], [0.6, K.css(K.mix(cc, W3, 0.12), 0.62)], [0.9, K.css(K.mix(cc, B3, 0.3), 0.88)], [1, K.css(K.mix(cc, B3, 0.55), 0.96)]]); x.fill();
      x.fillStyle = rad(x, c0 + rp * 0.36, c0 + rp * 0.42, rp * 0.6, [[0, K.css(K.mix(cc, W3, 0.65), 0.8)], [1, K.css(K.mix(cc, W3, 0.4), 0)]]); x.fill();
    }
    const caus = mk(32, 32), y = caus.getContext("2d");
    y.fillStyle = rad(y, 16, 16, 16, milky ? [[0, "rgba(255,250,235,0.45)"], [1, "rgba(255,250,235,0)"]] : [[0, K.css(K.mix(cc, W3, 0.55), 0.9)], [0.45, K.css(cc, 0.35)], [1, K.css(cc, 0)]]); y.fillRect(0, 0, 32, 32);
    let ov = SPR["ov|" + rp];
    if (!ov) {
      ov = SPR["ov|" + rp] = mk(S, S); const z = ov.getContext("2d");
      z.beginPath(); z.arc(c0, c0, rp, 0, TAU); z.fillStyle = rad(z, c0, c0, rp, [[0, "rgba(255,255,255,0)"], [0.76, "rgba(255,255,255,0)"], [0.92, "rgba(255,255,255,0.16)"], [1, "rgba(30,15,0,0.5)"]]); z.fill();
      z.fillStyle = rad(z, c0 - rp * 0.36, c0 - rp * 0.4, rp * 0.55, [[0, "rgba(255,255,255,0.45)"], [1, "rgba(255,255,255,0)"]]); z.fill();
      z.fillStyle = "rgba(255,255,255,0.95)"; z.beginPath(); z.ellipse(c0 - rp * 0.38, c0 - rp * 0.42, rp * 0.24, rp * 0.13, -0.65, 0, TAU); z.fill();
      z.fillStyle = "rgba(255,255,255,0.8)"; z.beginPath(); z.arc(c0 - rp * 0.08, c0 - rp * 0.62, rp * 0.06, 0, TAU); z.fill();
      z.strokeStyle = "rgba(255,248,230,0.4)"; z.lineWidth = Math.max(0.8, rp * 0.08); z.beginPath(); z.arc(c0, c0, rp * 0.8, 0.25, 1.35); z.stroke();
    }
    blob();
    return (SPR[key] = { body, caus, ov, S });
  }
  // yumuşak gölge lekesi (toprak rengine çalan)
  function blob() { if (!SPR.blob) { SPR.blob = mk(48, 48); const z = SPR.blob.getContext("2d"); z.fillStyle = rad(z, 24, 24, 24, [[0, "rgba(40,22,8,0.75)"], [0.5, "rgba(40,22,8,0.4)"], [1, "rgba(40,22,8,0)"]]); z.fillRect(0, 0, 48, 48); } return SPR.blob; }
  // yuvarlanma: misketin yönelim matrisi (3x3) yer değiştirmeye göre döndürülür
  function roll(m, dx, dy, r) {
    const d = Math.hypot(dx, dy); if (d < 1e-4) return;
    const ax = -dy / d, ay = dx / d, a = d / r, c = Math.cos(a), s = Math.sin(a), t = 1 - c;
    const R = [t * ax * ax + c, t * ax * ay, s * ay, t * ax * ay, t * ay * ay + c, -s * ax, -s * ay, s * ax, c];
    const o = m.slice();
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m[i * 3 + j] = R[i * 3] * o[j] + R[i * 3 + 1] * o[3 + j] + R[i * 3 + 2] * o[6 + j];
  }
  function drawMarble(ctx, d, x, y, r, col, milky, m, a) {
    const sp = mspr(col, Math.max(2, Math.round(r * d)), milky), h = sp.S / d / 2;
    ctx.globalAlpha = a; ctx.drawImage(sp.body, x - h, y - h, h * 2, h * 2);
    // iç kanatlar: arkadakiler soluk/ince, öndekiler canlı
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, TAU); ctx.clip(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const front of [false, true]) {
      ctx.beginPath();
      for (const V of VANES) {
        let px = 0, py = 0, pz = 0;
        V.forEach((p, i) => {
          const X = m[0] * p[0] + m[1] * p[1] + m[2] * p[2], Y = m[3] * p[0] + m[4] * p[1] + m[5] * p[2], Z = m[6] * p[0] + m[7] * p[1] + m[8] * p[2];
          if (i && ((pz + Z) > 0) === front) { ctx.moveTo(x + px * r, y + py * r); ctx.lineTo(x + X * r, y + Y * r); }
          px = X; py = Y; pz = Z;
        });
      }
      ctx.strokeStyle = milky ? "#2f74e0" : col; ctx.globalAlpha = a * (front ? 0.95 : 0.4); ctx.lineWidth = Math.max(1, r * (front ? 0.26 : 0.18)); ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = a; ctx.drawImage(sp.ov, x - h, y - h, h * 2, h * 2); ctx.globalAlpha = 1;
  }
  // Basit cam misket (rakip ekranındaki küçük görünüm için)
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
      if (out.every(o => Math.hypot(o.x - x, o.y - y) > TR * 2.4) && Math.hypot(START.x - x, START.y - y) > TR + SR + 1) out.push({ x, y, vx: 0, vy: 0, r: TR, m: 1, c: COLORS[out.length % COLORS.length], out: false, fade: 1 });
    }
    return out;
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, k: 0, balls: rack(seed, 0), sh: { x: START.x, y: START.y, vx: 0, vy: 0, r: SR, m: 1.6, c: "#f3efe7" }, aim: null, moving: false, hits: 0, R: null, pops: [], parts: [], acc: 0, clock: 0, shots: 0, fx: [], L: null, Lkey: "", marks: null };
    function map(R) { const u = Math.min(R.w / 100, R.h / 104), ox = R.x + (R.w - 100 * u) / 2, oy = R.y + (R.h - 104 * u) / 2 + 2 * u; return { u, ox, oy, sx: x => ox + x * u, sy: y => oy + y * u, wx: px => (px - ox) / u, wy: py => (py - oy) / u }; }
    function physics(dt) {
      const all = [g.sh, ...g.balls.filter(b => !b.out)];
      for (const b of all) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 0) { const ns = Math.max(0, sp * Math.exp(-PHYS.drag * dt) - PHYS.roll * dt); b.vx *= ns / sp; b.vy *= ns / sp; }
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
            const j2 = (-(1 + PHYS.rest) * rv) / (1 / a.m + 1 / b.m);
            a.vx -= (j2 / a.m) * nx; a.vy -= (j2 / a.m) * ny; b.vx += (j2 / b.m) * nx; b.vy += (j2 / b.m) * ny;
            if (-rv > 6) { SFX.clack(-rv / 90); if (g.fx.length < 16) g.fx.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, v: -rv }); }
          }
        }
      }
      for (const b of g.balls) if (!b.out && Math.hypot(b.x - RING.x, b.y - RING.y) > RING.r + b.r) {
        b.out = true; g.hits++;
        const pts = 50 + 25 * (g.hits - 1); g.score += pts;
        const M = map(g.R);
        K.pops.add(g.pops, "+" + pts, M.sx(b.x), M.sy(b.y) - 10, g.hits > 1 ? "#ffd34d" : "#ffffff", g.hits > 2);
        K.parts.burst(g.parts, M.sx(b.x), M.sy(b.y), b.c, 10, 150);
        K.parts.ring(g.parts, M.sx(b.x), M.sy(b.y), b.c, b.r * M.u * 5, 3); K.parts.dust(g.parts, M.sx(b.x), M.sy(b.y), "#e2c89a", 5, 30);
        K.kick(Math.min(0.2, 0.05 + g.hits * 0.03)); if (g.hits > 2) K.flash(0.08, "#fff3c4");
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
          // durma kontrolü her sabit adımda: sonuç kare hızından bağımsız (eskiden karede bir bakılıyordu → 30/60/120 fps'te farklı skor)
          let still = false;
          while (g.acc >= STEP) { physics(STEP); g.acc -= STEP; if (!stillMoving()) { still = true; g.acc = 0; break; } }
          // çarpışma geri bildirimi (görsel): darbe hızına göre kıvılcım, toz, çok hafif sarsıntı
          if (g.fx.length && g.R) {
            const M = map(g.R); let mv = 0;
            for (const e of g.fx) { mv = Math.max(mv, e.v); const n = Math.min(4, 1 + (e.v / 40) | 0); K.parts.spark(g.parts, M.sx(e.x), M.sy(e.y), "#fff6dc", n, 50 + e.v * 1.4); if (e.v > 35) K.parts.dust(g.parts, M.sx(e.x), M.sy(e.y), "#d6ba8a", 1, 20); }
            K.kick(clamp((mv - 15) / 900, 0, 0.1)); g.fx.length = 0;
          }
          // yuvarlanan misketler hafif toz bırakır
          if (g.R) { const M = map(g.R); for (const b of [g.sh, ...g.balls]) { if (b.out) continue; const sp = Math.hypot(b.vx, b.vy); if (sp < 30) continue; b._dd = (b._dd || 0) + sp * dt; if (b._dd > 12) { b._dd = 0; K.parts.dust(g.parts, M.sx(b.x), M.sy(b.y) + b.r * M.u * 0.6, "#d6ba8a", 1, 8 + sp * 0.1); } } }
          if (still) {
            g.moving = false;
            for (const b of [g.sh, ...g.balls]) if (!b.out) { b.vx = 0; b.vy = 0; }
            if (g.hits === 0) SFX.pop(false);
            g.hits = 0;
            // Kural: atıcı çemberin içinde kaldıysa bir sonraki atış oradan yapılır.
            if (Math.hypot(g.sh.x - RING.x, g.sh.y - RING.y) > RING.r - g.sh.r) { g.sh.x = START.x; g.sh.y = START.y; }
            if (g.balls.every(b => b.out)) {
              g.score += 150;
              K.pops.add(g.pops, "ÇEMBER TEMİZ!  +150", g.R.x + g.R.w / 2, g.R.y + 40, "#ffd34d", true);
              // yeni dizilim: atıcı çizgiye döner (eskiden çemberde kalan atıcının üstüne misket doğup rastgele fırlıyordu)
              g.sh.x = START.x; g.sh.y = START.y;
              SFX.milestone(); g.k++; g.balls = rack(seed, g.k);
              { const M = map(g.R), cx = M.sx(RING.x), cy = M.sy(RING.y); K.parts.confetti(g.parts, cx, cy, 50, 460); K.parts.ring(g.parts, cx, cy, "#fff3c4", RING.r * M.u * 1.1, 6); }
              K.flash(0.22, "#fff3c4"); K.kick(0.3); g.marksClear = true;
            }
          }
        }
        // çembere çıkan misket çizgide donmaz: sönerken yuvarlanmaya devam eder (yalnızca görsel; çarpışmaya katılmaz)
        for (const b of g.balls) if (b.out && b.fade > 0) {
          b.fade = Math.max(0, b.fade - dt * 2);
          const sp = Math.hypot(b.vx, b.vy), d = Math.min(dt, 0.05);
          if (sp > 0) { const ns = Math.max(0, sp * Math.exp(-PHYS.drag * d) - PHYS.roll * d); b.x += b.vx * d; b.y += b.vy * d; b.vx *= ns / sp; b.vy *= ns / sp; }
        }
        g.snap = Math.max(0, (g.snap || 0) - dt * 6);
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y, id) {
        if (!g.R || g.over || g.moving) return;
        const M = map(g.R);
        // tek parmak: nişanı başlatan parmak dışındaki dokunuşlar yok sayılır (ikinci parmak nişanı bozmasın)
        if (type === "down") { if (!g.aim || g.aim.id === id) g.aim = { id, x: M.wx(x), y: M.wy(y), x0: M.wx(x), y0: M.wy(y) }; }
        else if (!g.aim || g.aim.id !== id) return;
        else if (type === "move") { g.aim.x = M.wx(x); g.aim.y = M.wy(y); }
        else if (type === "up" || type === "cancel") {
          if (type === "up") { g.aim.x = M.wx(x); g.aim.y = M.wy(y); } // son "move" gelmese de bırakılan nokta geçerli
          const dx = g.aim.x0 - g.aim.x, dy = g.aim.y0 - g.aim.y, len = Math.hypot(dx, dy);
          g.aim = null;
          if (type === "up" && len > 3) {
            const p = Math.min(len, 32) / 32, sp = PHYS.v0 + p * PHYS.v1;
            g.sh.vx = (dx / len) * sp; g.sh.vy = (dy / len) * sp;
            g.moving = true; g.shots++; SFX.whoosh(); SFX.clack(0.5);
            K.parts.dust(g.parts, M.sx(g.sh.x), M.sy(g.sh.y) + SR * M.u * 0.5, "#d6ba8a", 1 + ((p * 2) | 0), 20 + p * 30); K.kick(0.03 + p * 0.07); g.snap = 1;
          }
        }
      },
      // her misketin renk sırası da gider: biri çıkınca rakip ekranında kalanların rengi kaymasın
      net() { return { b: g.balls.filter(b => !b.out).map(b => [Math.round(b.x), Math.round(b.y), Math.max(0, COLORS.indexOf(b.c))]), s: [Math.round(g.sh.x), Math.round(g.sh.y)] }; },
      draw(ctx, R) {
        g.R = R;
        const M = map(R), u = M.u, d = DPR(), ready = !!(soil.complete && soil.naturalWidth);
        const key = R.x + "," + R.y + "," + R.w + "x" + R.h + "@" + d + (ready ? "t" : "");
        if (g.Lkey !== key) { g.L = buildSoil(R, M, d, ready); g.Lkey = key; g.marks = null; }
        // kalıcı yuvarlanma izleri (toprakta sürtünme izi)
        if (!g.marks || g.marksClear) { g.marksClear = false; const c = mk(R.w * d, R.h * d), x = c.getContext("2d"); x.scale(d, d); x.translate(-R.x, -R.y); x.lineCap = "round"; g.marks = { c, x }; }
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        ctx.drawImage(g.L, R.x, R.y, R.w, R.h);
        ctx.drawImage(g.marks.c, R.x, R.y, R.w, R.h);
        // nişan durumu: sapan lastiği gerilir, atıcı geri çekilmiş görünür
        let aim = null;
        if (g.aim && !g.moving) {
          const dx = g.aim.x0 - g.aim.x, dy = g.aim.y0 - g.aim.y, len = Math.hypot(dx, dy);
          if (len > 3) { const p = Math.min(len, 32) / 32, ux = dx / len, uy = dy / len, pull = Math.min(len, 32) * 0.22; aim = { p, ux, uy, L: 12 + p * 45, px: g.sh.x - ux * pull, py: g.sh.y - uy * pull, col: powCol(p) }; }
        }
        // görsel durum: yuvarlanma yönelimi, izler, kuyruk
        const all = [...g.balls, g.sh], mx = g.marks.x;
        all.forEach((b, i) => {
          if (!b._m) { const a = hash(i + g.k * 31, 7) * TAU, c = hash(i + g.k * 31, 8) * TAU; b._m = [1, 0, 0, 0, 1, 0, 0, 0, 1]; roll(b._m, Math.cos(a), Math.sin(a), 1 / (c + 0.5)); roll(b._m, -Math.sin(c), Math.cos(c), 1 / (a + 0.5)); }
          if (b._px != null && (!b.out || b.fade > 0)) {
            const ddx = b.x - b._px, ddy = b.y - b._py, dd = Math.hypot(ddx, ddy);
            if (dd > 0.001 && dd < 20) roll(b._m, ddx, ddy, b.r);
            if (dd > 0.001 && dd < 20 && !b.out) { mx.strokeStyle = "rgba(70,45,22,0.045)"; mx.lineWidth = b.r * u * 0.9; mx.beginPath(); mx.moveTo(M.sx(b._px), M.sy(b._py)); mx.lineTo(M.sx(b.x), M.sy(b.y)); mx.stroke(); }
          }
          b._px = b.x; b._py = b.y;
          const sp = Math.hypot(b.vx, b.vy); b._tr = b._tr || [];
          if (sp > 25 && !b.out) { b._tr.push(M.sx(b.x), M.sy(b.y)); if (b._tr.length > 16) b._tr.splice(0, 2); } else if (b._tr.length) b._tr.splice(0, 2);
        });
        const vis = b => (b === g.sh && aim ? [M.sx(aim.px), M.sy(aim.py)] : [M.sx(b.x), M.sy(b.y)]);
        // nişan kılavuzu: güç renginde, uca doğru küçülen noktalar + ok ucu
        if (aim) {
          const n = 7 + ((aim.p * 6) | 0);
          for (let i = 1; i <= n; i++) { const t = i / n, x = M.sx(g.sh.x + aim.ux * aim.L * t), y = M.sy(g.sh.y + aim.uy * aim.L * t); ctx.globalAlpha = 0.85 * (1 - t * 0.6); ctx.fillStyle = "rgba(40,22,8,0.35)"; ctx.beginPath(); ctx.arc(x + 1, y + 1.5, u * (0.75 - t * 0.35), 0, TAU); ctx.fill(); ctx.fillStyle = aim.col; ctx.beginPath(); ctx.arc(x, y, u * (0.75 - t * 0.35), 0, TAU); ctx.fill(); }
          const ex = M.sx(g.sh.x + aim.ux * (aim.L + 3)), ey = M.sy(g.sh.y + aim.uy * (aim.L + 3)), an = Math.atan2(aim.uy, aim.ux), s = u * 1.6;
          ctx.globalAlpha = 0.9; ctx.fillStyle = aim.col; ctx.beginPath(); ctx.moveTo(ex + Math.cos(an) * s, ey + Math.sin(an) * s); ctx.lineTo(ex + Math.cos(an + 2.4) * s, ey + Math.sin(an + 2.4) * s); ctx.lineTo(ex + Math.cos(an - 2.4) * s, ey + Math.sin(an - 2.4) * s); ctx.fill(); ctx.globalAlpha = 1;
        }
        // gölgeler (alçak açılı ışık: sağ-alta uzar) + camdan geçip odaklanan renkli kostik ışık
        for (const b of all) {
          if (b.out && b.fade <= 0) continue;
          const [x, y] = vis(b), r = b.r * u * (b.out ? 0.7 + 0.3 * b.fade : 1), sp = mspr(b === g.sh ? "#3d8bff" : b.c, Math.max(2, Math.round(b.r * u * d)), b === g.sh);
          ctx.globalAlpha = b.out ? b.fade : 1;
          ctx.save(); ctx.translate(x + r * 0.55, y + r * 0.62); ctx.rotate(0.7); ctx.drawImage(SPR.blob, -r * 1.45, -r * 0.9, r * 2.9, r * 1.8); ctx.restore();
          ctx.drawImage(sp.caus, x + r * 0.5 - r * 0.45, y + r * 0.62 - r * 0.38, r * 0.9, r * 0.76);
        }
        ctx.globalAlpha = 1;
        // hızlı misketlerin kuyruğu
        ctx.lineCap = "round";
        for (const b of all) { const T = b._tr; if (!T || T.length < 4) continue; const n = T.length / 2; for (let i = 1; i < n; i++) { const t = i / n; ctx.strokeStyle = "rgba(255,244,220," + (t * 0.22) + ")"; ctx.lineWidth = b.r * u * 1.6 * t; ctx.beginPath(); ctx.moveTo(T[i * 2 - 2], T[i * 2 - 1]); ctx.lineTo(T[i * 2], T[i * 2 + 1]); ctx.stroke(); } }
        // sapan lastiği: iki kazık, gerilen iki şerit (gerildikçe incelir), misketin arkasında deri cep
        let band = null;
        if (aim) {
          const nx = -aim.uy, ny = aim.ux, w = SR * 2.3, ax = g.sh.x + nx * w, ay = g.sh.y + ny * w, bx = g.sh.x - nx * w, by = g.sh.y - ny * w;
          const cx = aim.px - aim.ux * SR * 0.9, cy = aim.py - aim.uy * SR * 0.9;
          band = { A: [M.sx(ax), M.sy(ay)], B: [M.sx(bx), M.sy(by)], C: [M.sx(cx), M.sy(cy)], lw: Math.max(1.5, u * (1.1 - aim.p * 0.55)) };
          for (const P of [band.A, band.B]) { ctx.fillStyle = "rgba(40,22,8,0.35)"; ctx.beginPath(); ctx.ellipse(P[0] + u * 0.7, P[1] + u * 0.8, u * 1.1, u * 0.6, 0.6, 0, TAU); ctx.fill(); ctx.fillStyle = "#3a2512"; ctx.beginPath(); ctx.arc(P[0], P[1], u * 1.15, 0, TAU); ctx.fill(); ctx.fillStyle = "#8a6238"; ctx.beginPath(); ctx.arc(P[0] - u * 0.1, P[1] - u * 0.12, u * 0.85, 0, TAU); ctx.fill(); ctx.fillStyle = "#c79a64"; ctx.beginPath(); ctx.arc(P[0] - u * 0.25, P[1] - u * 0.3, u * 0.4, 0, TAU); ctx.fill(); }
          ctx.strokeStyle = "rgba(40,22,8,0.3)"; ctx.lineWidth = band.lw; ctx.beginPath(); ctx.moveTo(band.A[0] + 2, band.A[1] + 3); ctx.lineTo(band.C[0] + 2, band.C[1] + 3); ctx.lineTo(band.B[0] + 2, band.B[1] + 3); ctx.stroke();
          ctx.strokeStyle = aim.col; ctx.beginPath(); ctx.moveTo(band.A[0], band.A[1]); ctx.lineTo(band.C[0], band.C[1]); ctx.lineTo(band.B[0], band.B[1]); ctx.stroke();
        }
        // misketler (bırakınca atıcı kısa bir an ileri doğru gerilir: squash & stretch hissi)
        for (const b of all) {
          if (b.out && b.fade <= 0) continue;
          const [x, y] = vis(b), r = b.r * u * (b.out ? 0.7 + 0.3 * b.fade : 1);
          drawMarble(ctx, d, x, y, r * (b === g.sh ? 1 + (g.snap || 0) * 0.08 : 1), b === g.sh ? "#3d8bff" : b.c, b === g.sh, b._m, b.out ? b.fade : 1);
        }
        if (band) { ctx.strokeStyle = "#4a3320"; ctx.lineWidth = u * 0.9; ctx.beginPath(); ctx.arc(M.sx(aim.px), M.sy(aim.py), SR * u * 1.05, Math.atan2(-aim.uy, -aim.ux) - 0.9, Math.atan2(-aim.uy, -aim.ux) + 0.9); ctx.stroke(); }
        // güç yayı
        if (aim) {
          const x = M.sx(aim.px), y = M.sy(aim.py), r = SR * u + 9;
          ctx.lineCap = "round"; ctx.lineWidth = 3; ctx.strokeStyle = "rgba(30,18,6,0.3)"; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
          ctx.strokeStyle = aim.col; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0.02, aim.p)); ctx.stroke();
        }
        ctx.lineCap = "butt";
        if (!g.moving && !g.aim && g.shots < 2) txt(ctx, "Geri çek, bırak!", M.sx(50), M.sy(97), 18, "#3b2a14", { w: "800", stroke: 4, strokeColor: "rgba(255,236,200,0.45)" });
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1);
        ctx.restore();
      },
    };
  }
  // ---------- toprak zemin: boyut başına bir kez çizilen statik katman ----------
  function buildSoil(R, M, d, ready) {
    const W = R.w, H = R.h, u = M.u, c = mk(W * d, H * d), x = c.getContext("2d"), rnd = rng(4242);
    x.scale(d, d); x.translate(-R.x, -R.y);
    let gr = x.createLinearGradient(R.x, R.y, R.x + W * 0.5, R.y + H); gr.addColorStop(0, "#d2aa74"); gr.addColorStop(0.55, "#b08a55"); gr.addColorStop(1, "#8a6538");
    x.fillStyle = gr; x.fillRect(R.x, R.y, W, H);
    if (ready) { x.save(); x.globalAlpha = 0.8; x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(soil, "repeat"); x.translate(R.x, R.y); x.fillRect(0, 0, W, H); x.restore(); }
    // büyük ölçekli nem / sertlik farkları
    for (let i = 0; i < 22; i++) { const cx = R.x + rnd() * W, cy = R.y + rnd() * H, r = (0.08 + rnd() * 0.2) * W, dark = rnd() < 0.55; x.fillStyle = rad(x, cx, cy, r, [[0, dark ? "rgba(80,50,22,0.16)" : "rgba(245,220,175,0.14)"], [1, "rgba(0,0,0,0)"]]); x.fillRect(cx - r, cy - r, r * 2, r * 2); }
    // ince taneler ve toprak topakları (sol üstten ışık)
    for (let i = 0; i < 2600; i++) { const l = rnd() < 0.5; x.fillStyle = l ? "rgba(250,230,190," + (0.1 + rnd() * 0.25) + ")" : "rgba(55,32,14," + (0.1 + rnd() * 0.25) + ")"; x.fillRect(R.x + rnd() * W, R.y + rnd() * H, 1, 1); }
    for (let i = 0; i < 140; i++) { const px = R.x + rnd() * W, py = R.y + rnd() * H, r = 0.6 + rnd() * 1.1; x.fillStyle = "rgba(50,28,10,0.35)"; x.beginPath(); x.arc(px + r * 0.6, py + r * 0.6, r, 0, TAU); x.fill(); x.fillStyle = "#a9814e"; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); x.fillStyle = "rgba(255,235,200,0.45)"; x.beginPath(); x.arc(px - r * 0.3, py - r * 0.3, r * 0.45, 0, TAU); x.fill(); }
    const clear = (wx, wy, m) => Math.hypot(wx - RING.x, wy - RING.y) > RING.r + m && !(Math.abs(wy - START.y) < 5 && wx > 26 && wx < 74);
    // çakıl taşları
    const PC = ["#9a948a", "#b8ad9a", "#7d7466", "#c9b89a", "#a07a5a", "#8c8170"];
    for (let i = 0, n = 0; i < 400 && n < 46; i++) {
      const wx = rnd() * 100, wy = rnd() * 104 - 2; if (!clear(wx, wy, 3)) continue; n++;
      const px = M.sx(wx), py = M.sy(wy), r = u * (0.3 + rnd() * rnd() * 1.1), col = K.hex(PC[(rnd() * PC.length) | 0]), k = 6 + ((rnd() * 3) | 0), rot = rnd() * TAU;
      x.save(); x.translate(px + r * 0.6, py + r * 0.55); x.rotate(0.6); x.drawImage(blob(), -r * 1.4, -r * 0.9, r * 2.8, r * 1.8); x.restore();
      x.beginPath(); for (let j = 0; j < k; j++) { const a = rot + (j / k) * TAU, rr2 = r * (0.75 + rnd() * 0.35); if (j) x.lineTo(px + Math.cos(a) * rr2, py + Math.sin(a) * rr2 * 0.85); else x.moveTo(px + Math.cos(a) * rr2, py + Math.sin(a) * rr2 * 0.85); } x.closePath();
      gr = x.createLinearGradient(px - r, py - r, px + r, py + r); gr.addColorStop(0, K.css(K.mix(col, [255, 245, 225], 0.35))); gr.addColorStop(1, K.css(K.mix(col, [30, 18, 8], 0.45)));
      x.fillStyle = gr; x.fill(); x.fillStyle = "rgba(255,255,255,0.3)"; x.beginPath(); x.ellipse(px - r * 0.3, py - r * 0.35, r * 0.35, r * 0.2, -0.5, 0, TAU); x.fill();
    }
    // kuru dal parçaları
    for (let i = 0, n = 0; i < 200 && n < 7; i++) {
      const wx = rnd() * 100, wy = rnd() * 100; if (!clear(wx, wy, 8)) continue; n++;
      const a = rnd() * TAU, L = (5 + rnd() * 9) * u, px = M.sx(wx), py = M.sy(wy), ex = px + Math.cos(a) * L, ey = py + Math.sin(a) * L, bx = (px + ex) / 2 + Math.cos(a + 1.57) * L * 0.12, by = (py + ey) / 2 + Math.sin(a + 1.57) * L * 0.12, w = u * (0.35 + rnd() * 0.3);
      const path = (ox, oy) => { x.beginPath(); x.moveTo(px + ox, py + oy); x.quadraticCurveTo(bx + ox, by + oy, ex + ox, ey + oy); const mxp = (px + bx) / 2, myp = (py + by) / 2; x.moveTo(mxp + ox, myp + oy); x.lineTo(mxp + Math.cos(a - 0.7) * L * 0.3 + ox, myp + Math.sin(a - 0.7) * L * 0.3 + oy); };
      x.lineCap = "round"; x.strokeStyle = "rgba(45,25,10,0.3)"; x.lineWidth = w * 1.3; path(u * 0.5, u * 0.6); x.stroke();
      x.strokeStyle = "#5b3f24"; x.lineWidth = w; path(0, 0); x.stroke();
      x.strokeStyle = "rgba(190,150,100,0.6)"; x.lineWidth = w * 0.35; path(-w * 0.2, -w * 0.25); x.stroke();
    }
    // kenarlarda kuru ot öbekleri
    for (let i = 0, n = 0; i < 300 && n < 9; i++) {
      const wx = rnd() * 100, wy = rnd() * 104; if (!(wx < 9 || wx > 91 || wy > 98 || wy < 5)) continue; n++;
      const px = M.sx(wx), py = M.sy(wy);
      for (let j = 0; j < 9; j++) { const a = -Math.PI / 2 + (rnd() - 0.5) * 1.6, L = (2 + rnd() * 4) * u; x.strokeStyle = "rgba(40,25,10,0.25)"; x.lineWidth = 1.2; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * L * 0.5 + u * 0.8, py + u * 0.6, px + Math.cos(a) * L + u * 1.6, py + Math.sin(a) * L * 0.3 + u * 1.2); x.stroke(); x.strokeStyle = ["#9b9150", "#b9a862", "#6f7a3a", "#c7b680"][j % 4]; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * L * 0.4, py + Math.sin(a) * L * 0.6, px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }
    }
    // çember: toprağa çizilmiş oluk. Işık sol üstten: oluğun ışığa yakın duvarı gölgede, karşı duvarı aydınlık
    const cx = M.sx(RING.x), cy = M.sy(RING.y), Rr = RING.r * u, ph = [rnd() * 6, rnd() * 6, rnd() * 6];
    const wob = a => Math.sin(a * 5 + ph[0]) * 0.18 * u + Math.sin(a * 11 + ph[1]) * 0.1 * u + Math.sin(a * 23 + ph[2]) * 0.05 * u;
    const ring = (off, ox, oy, w, col, jit, from, to) => {
      x.strokeStyle = col; x.lineCap = "round";
      for (let a = from || 0; a < (to || TAU); a += 0.05) { const a2 = a + 0.055, r1 = Rr + off + wob(a), r2 = Rr + off + wob(a2); x.lineWidth = w * (1 - jit + rnd() * jit * 2); x.beginPath(); x.moveTo(cx + ox + Math.cos(a) * r1, cy + oy + Math.sin(a) * r1); x.lineTo(cx + ox + Math.cos(a2) * r2, cy + oy + Math.sin(a2) * r2); x.stroke(); }
    };
    ring(1.0 * u, 0, 0, u * 0.9, "rgba(240,216,175,0.22)", 0.4); ring(-1.0 * u, 0, 0, u * 0.8, "rgba(240,216,175,0.16)", 0.4);
    ring(0, -0.22 * u, -0.22 * u, u * 1.05, "rgba(52,30,12,0.5)", 0.3);
    ring(0, 0.34 * u, 0.34 * u, u * 0.32, "rgba(255,238,205,0.55)", 0.5);
    ring(0, 0, 0, u * 0.42, "rgba(32,18,6,0.55)", 0.5);
    for (let i = 0; i < 4; i++) { const a = rnd() * TAU; ring(0.55 * u * (rnd() < 0.5 ? -1 : 1), 0, 0, u * 0.18, "rgba(40,22,8,0.4)", 0.5, a, a + 0.4 + rnd() * 0.6); }
    for (let i = 0; i < 260; i++) { const a = rnd() * TAU, s = rnd() < 0.5 ? -1 : 1, r = Rr + wob(a) + s * u * (0.7 + rnd() * 1.2), px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r, k = 0.4 + rnd() * 0.8; x.fillStyle = "rgba(50,28,10,0.3)"; x.fillRect(px + 0.5, py + 0.5, k, k); x.fillStyle = rnd() < 0.6 ? "rgba(235,210,168,0.7)" : "rgba(120,85,48,0.6)"; x.fillRect(px, py, k, k); }
    // başlama çizgisi: çubukla çizilmiş düz çizik
    { const y0 = M.sy(START.y), x0 = M.sx(29), x1 = M.sx(71);
      const line = (ox, oy, w, col, jit) => { x.strokeStyle = col; x.lineCap = "round"; for (let px = x0; px < x1; px += 3) { const t = (px - x0) / (x1 - x0), taper = Math.min(1, t * 8, (1 - t) * 8); x.lineWidth = w * taper * (1 - jit + rnd() * jit * 2); x.beginPath(); x.moveTo(px + ox, y0 + oy + Math.sin(px * 0.05) * u * 0.15); x.lineTo(px + 3.2 + ox, y0 + oy + Math.sin((px + 3) * 0.05) * u * 0.15); x.stroke(); } };
      line(0, u * 0.7, u * 0.7, "rgba(240,216,175,0.2)", 0.4); line(-0.2 * u, -0.25 * u, u * 0.9, "rgba(52,30,12,0.45)", 0.3); line(0.3 * u, 0.3 * u, u * 0.28, "rgba(255,238,205,0.5)", 0.5); line(0, 0, u * 0.36, "rgba(32,18,6,0.5)", 0.5); }
    // alçak açılı sıcak ışık (sol üst) + kenar kararması
    x.fillStyle = rad(x, R.x - W * 0.15, R.y - H * 0.1, Math.max(W, H) * 1.1, [[0, "rgba(255,196,120,0.24)"], [0.5, "rgba(255,190,110,0.08)"], [1, "rgba(255,190,110,0)"]]); x.fillRect(R.x, R.y, W, H);
    x.fillStyle = rad(x, R.x + W * 0.45, R.y + H * 0.45, Math.max(W, H) * 0.75, [[0, "rgba(40,22,8,0)"], [0.55, "rgba(40,22,8,0)"], [1, "rgba(40,22,8,0.45)"]]); x.fillRect(R.x, R.y, W, H);
    return c;
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#c9a877", "#9c7a4e");
    const u = Math.min(R.w / 100, R.h / 100), ox = R.x + (R.w - 100 * u) / 2, oy = R.y + (R.h - 100 * u) / 2;
    ctx.lineWidth = Math.max(1.5, u * 0.8); ctx.strokeStyle = "rgba(52,30,12,0.55)"; ctx.beginPath(); ctx.arc(ox + RING.x * u - 0.5, oy + RING.y * u - 0.5, RING.r * u, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,238,205,0.55)"; ctx.beginPath(); ctx.arc(ox + RING.x * u + 1, oy + RING.y * u + 1, RING.r * u, 0, Math.PI * 2); ctx.stroke();
    (d && Array.isArray(d.b) ? d.b : []).forEach((p, i) => marble(ctx, ox + p[0] * u, oy + p[1] * u, TR * u, COLORS[(p[2] != null ? p[2] | 0 : i) % COLORS.length]));
    if (d && Array.isArray(d.s)) marble(ctx, ox + d.s[0] * u, oy + d.s[1] * u, SR * u, "#3d8bff", true);
  }
  K.register({
    id: "misket", name: "Misket", color: "#f4b400", desc: "Atıcı misketi sapan gibi geri çek; çemberden misket çıkar.",
    rules: "Parmağını basılı tut, geri çek, bırak · bir atışta çoklu = bonus",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
