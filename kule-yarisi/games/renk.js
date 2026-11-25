// Renk Sıralama: tüplerdeki topları her tüpte tek renk kalacak şekilde diz.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const CAP = 4;
  // Okabe–Ito tabanlı, renk körü dostu palet + her renge bir sembol
  const COLORS = ["#D55E00", "#E69F00", "#009E73", "#0072B2", "#a46bff", "#CC79A7", "#56B4E9", "#F0E442"];
  const RGB = COLORS.map(K.hex);
  const backOut = t => { t = clamp(t, 0, 1) - 1; return 1 + 2.70158 * t * t * t + 1.70158 * t * t; };
  const inOut = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const bounce = t => { t = clamp(t, 0, 1); const n = 7.5625, d = 2.75; return t < 1 / d ? n * t * t : t < 2 / d ? n * (t -= 1.5 / d) * t + 0.75 : t < 2.5 / d ? n * (t -= 2.25 / d) * t + 0.9375 : n * (t -= 2.625 / d) * t + 0.984375; };
  function glyph(ctx, x, y, r, k, col) {
    col = col || "rgba(255,255,255,0.85)";
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, r * 0.18);
    const s = r * 0.42; ctx.beginPath();
    if (k === 0) ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
    else if (k === 1) { ctx.moveTo(0, -s); ctx.lineTo(s, s * 0.8); ctx.lineTo(-s, s * 0.8); ctx.closePath(); }
    else if (k === 2) ctx.rect(-s * 0.75, -s * 0.75, s * 1.5, s * 1.5);
    else if (k === 3) { ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath(); }
    else if (k === 4) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr2 = i % 2 ? s * 0.45 : s; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); }
    else if (k === 5) { ctx.rect(-s, -s * 0.25, s * 2, s * 0.5); ctx.rect(-s * 0.25, -s, s * 0.5, s * 2); }
    else if (k === 6) { ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); return; }
    else { ctx.moveTo(-s, -s); ctx.lineTo(s, s); ctx.moveTo(s, -s); ctx.lineTo(-s, s); ctx.stroke(); ctx.restore(); return; }
    ctx.fill(); ctx.restore();
  }

  // ---------- önbellekli sprite'lar (her karede gradyan üretmemek için) ----------
  const SPR = new Map();
  function spr(key, w, h, fn) {
    const d = Math.min(2, window.devicePixelRatio || 1); key += "@" + d;
    let c = SPR.get(key);
    if (!c) {
      c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(h * d));
      c.cw = w; c.ch = h; const x = c.getContext("2d"); x.scale(d, d); fn(x, w, h);
      if (SPR.size > 160) SPR.clear();
      SPR.set(key, c);
    }
    return c;
  }
  // cam top: ışık sol üstten; dağınık gölge, alt-sağda yüzey altı (subsurface) parıltısı, keskin yansıma
  function ballSpr(k, r) {
    const S = r * 2 + 2;
    return spr("b" + k + "_" + r.toFixed(1), S, S, (c) => {
      const x = S / 2, y = S / 2, col = RGB[k];
      let g = c.createRadialGradient(x - r * 0.32, y - r * 0.38, r * 0.05, x, y, r);
      g.addColorStop(0, K.css(K.mix(col, [255, 255, 255], 0.5)));
      g.addColorStop(0.32, K.css(K.mix(col, [255, 255, 255], 0.12)));
      g.addColorStop(0.72, COLORS[k]);
      g.addColorStop(1, K.css(K.mix(col, [0, 0, 0], 0.55)));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
      c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
      g = c.createRadialGradient(x + r * 0.28, y + r * 0.62, 0, x + r * 0.28, y + r * 0.62, r * 0.75);
      g.addColorStop(0, K.css(K.mix(col, [255, 255, 255], 0.35), 0.6)); g.addColorStop(1, K.css(col, 0));
      c.fillStyle = g; c.fillRect(0, 0, S, S);
      c.restore();
      // sembol (kabartma): önce koyu gölge, sonra açık
      glyph(c, x + r * 0.04, y + r * 0.1, r, k, "rgba(0,0,0,0.28)");
      glyph(c, x, y + r * 0.05, r, k, "rgba(255,255,255,0.9)");
      // yansımalar
      g = c.createRadialGradient(x - r * 0.38, y - r * 0.46, 0, x - r * 0.38, y - r * 0.46, r * 0.42);
      g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.35, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; c.beginPath(); c.ellipse(x - r * 0.38, y - r * 0.46, r * 0.42, r * 0.3, -0.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(255,255,255,0.22)"; c.lineWidth = Math.max(1, r * 0.08); c.beginPath(); c.arc(x, y, r * 0.84, 0.25 * Math.PI, 0.75 * Math.PI); c.stroke();
    });
  }
  // yumuşak gölge / ışık lekesi (renkli)
  function blob(rgb, a) {
    return spr("o" + rgb.join(",") + a, 64, 64, (c) => {
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, K.css(rgb, a)); g.addColorStop(0.5, K.css(rgb, a * 0.45)); g.addColorStop(1, K.css(rgb, 0));
      c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    });
  }
  const SH = [0, 0, 0];
  const img = (ctx, c, x, y) => ctx.drawImage(c, x, y, c.cw, c.ch);
  // tüp yolu (kapalı: kırpma için; açık: kontur için — ağız elipsle çizilir)
  function tubePath(c, x, y, w, h, open) {
    const by = y + h - w / 2;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, by); c.arc(x + w / 2, by, w / 2, Math.PI, 0, true); c.lineTo(x + w, y);
    if (!open) c.closePath();
  }
  const padOf = w => Math.ceil(w * 0.2) + 3;
  // arka katman: kalın camın kenarları daha opak (Fresnel), arka duvar koyu, ağzın arka yarısı
  function tubeBack(w, h) {
    const p = padOf(w);
    return spr("tb" + w.toFixed(1) + "_" + h.toFixed(1), w + p * 2, h + p * 2, (c) => {
      const x = p, y = p, cx = x + w / 2, ry = Math.max(2, w * 0.13);
      tubePath(c, x, y, w, h); c.save(); c.clip();
      let g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(170,230,255,0.26)"); g.addColorStop(0.16, "rgba(120,200,225,0.08)"); g.addColorStop(0.5, "rgba(2,14,20,0.32)");
      g.addColorStop(0.84, "rgba(120,200,225,0.07)"); g.addColorStop(1, "rgba(170,230,255,0.24)");
      c.fillStyle = g; c.fillRect(x, y, w, h);
      g = c.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, "rgba(0,0,0,0.28)"); g.addColorStop(0.18, "rgba(0,0,0,0)"); g.addColorStop(0.86, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.25)");
      c.fillStyle = g; c.fillRect(x, y, w, h);
      c.fillStyle = "rgba(200,245,255,0.06)"; c.fillRect(x + w * 0.66, y + w * 0.3, Math.max(1.5, w * 0.07), h - w * 0.9);
      c.restore();
      c.beginPath(); c.ellipse(cx, y, w / 2 - 0.5, ry - 0.5, 0, 0, Math.PI * 2); c.fillStyle = "rgba(4,14,20,0.4)"; c.fill();
      c.beginPath(); c.ellipse(cx, y, w / 2, ry, 0, Math.PI, Math.PI * 2); c.strokeStyle = "rgba(200,240,255,0.35)"; c.lineWidth = Math.max(1, w * 0.035); c.stroke();
    });
  }
  // ön katman: kontur, iç cam kenarı, dikey parlama çizgileri, alt kostik, ağzın ön dudağı
  function tubeFront(w, h) {
    const p = padOf(w);
    return spr("tf" + w.toFixed(1) + "_" + h.toFixed(1), w + p * 2, h + p * 2, (c) => {
      const x = p, y = p, cx = x + w / 2, ry = Math.max(2, w * 0.13), th = Math.max(1.4, w * 0.045), by = y + h - w / 2;
      let g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, "rgba(235,250,255,0.85)"); g.addColorStop(0.2, "rgba(235,250,255,0.3)"); g.addColorStop(0.8, "rgba(235,250,255,0.22)"); g.addColorStop(1, "rgba(235,250,255,0.7)");
      c.strokeStyle = g; c.lineWidth = th; tubePath(c, x, y, w, h, true); c.stroke();
      const ins = th * 1.7;
      c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = 1; tubePath(c, x + ins, y + ry, w - ins * 2, h - ry - ins, true); c.stroke();
      g = c.createLinearGradient(0, y + ry, 0, by + w * 0.2);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.1, "rgba(255,255,255,0.55)"); g.addColorStop(0.55, "rgba(255,255,255,0.3)"); g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; rr(c, x + w * 0.14, y + ry + 2, Math.max(2, w * 0.09), by - y - ry, w * 0.05); c.fill();
      c.globalAlpha = 0.5; rr(c, x + w * 0.79, y + ry + w * 0.3, Math.max(1, w * 0.04), (by - y) * 0.55, w * 0.02); c.fill(); c.globalAlpha = 1;
      c.strokeStyle = "rgba(255,255,255,0.38)"; c.lineWidth = Math.max(1.2, w * 0.045); c.lineCap = "round";
      c.beginPath(); c.arc(cx, by, w / 2 - th * 2.3, 0.58 * Math.PI, 0.86 * Math.PI); c.stroke();
      c.beginPath(); c.ellipse(cx, y, w / 2, ry, 0, 0, Math.PI); c.strokeStyle = "rgba(230,250,255,0.8)"; c.lineWidth = th * 1.25; c.stroke();
      c.beginPath(); c.ellipse(cx, y + th * 0.9, w / 2 - th * 0.4, ry, 0, 0.15 * Math.PI, 0.85 * Math.PI); c.strokeStyle = "rgba(255,255,255,0.18)"; c.lineWidth = 1; c.stroke();
      c.fillStyle = "rgba(255,255,255,0.9)"; c.beginPath(); c.arc(x + w * 0.2, y + ry * 0.75, Math.max(1, w * 0.035), 0, Math.PI * 2); c.fill();
    });
  }
  // tamamlanan tüpün mantar tıpası
  function corkSpr(w) {
    const cw = w * 0.9, ch = w * 0.62;
    return spr("ck" + w.toFixed(1), cw + 4, ch + 4, (c) => {
      const x = 2, y = 2, ey = Math.max(2, w * 0.12);
      let g = c.createLinearGradient(x, 0, x + cw, 0);
      g.addColorStop(0, "#7a5230"); g.addColorStop(0.3, "#d6a66d"); g.addColorStop(0.65, "#b07f4b"); g.addColorStop(1, "#5e3c20");
      c.fillStyle = g; c.beginPath(); c.moveTo(x, y + ey); c.lineTo(x + cw * 0.06, y + ch - ey); c.ellipse(x + cw / 2, y + ch - ey, cw * 0.44, ey, 0, Math.PI, 0, true); c.lineTo(x + cw, y + ey); c.closePath(); c.fill();
      const rnd = K.rng(7);
      for (let i = 0; i < 26; i++) { c.fillStyle = rnd() < 0.5 ? "rgba(60,35,15,0.35)" : "rgba(255,230,190,0.25)"; c.fillRect(x + cw * (0.1 + rnd() * 0.8), y + ey + rnd() * (ch - ey * 2), 1 + rnd() * 1.5, 1 + rnd()); }
      c.fillStyle = "#e2b985"; c.beginPath(); c.ellipse(x + cw / 2, y + ey, cw / 2, ey, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(90,55,25,0.45)"; c.lineWidth = 1; c.stroke();
      c.fillStyle = "rgba(255,240,210,0.5)"; c.beginPath(); c.ellipse(x + cw * 0.38, y + ey * 0.8, cw * 0.2, ey * 0.35, 0, 0, Math.PI * 2); c.fill();
    });
  }
  // laboratuvar arka planı: fayans duvar, tepe lambası, bokeh, ahşap raflar, vinyet — tek seferde çizilir
  function bgLayer(R, rows, tw) {
    return spr("bg" + R.w + "x" + R.h + ":" + rows.map(r => (r.t - R.y).toFixed(0) + "-" + (r.b - R.y).toFixed(0)).join(",") + ":" + tw.toFixed(1), R.w, R.h, (c, w, h) => {
      let g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#1d4a4b"); g.addColorStop(0.55, "#112c31"); g.addColorStop(1, "#0a161b");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      const s = 30, rnd = K.rng(99);
      for (let yy = 0; yy < h; yy += s) for (let xx = (yy / s) % 2 ? -s / 2 : 0; xx < w; xx += s) { c.fillStyle = "rgba(255,255,255," + (rnd() * 0.025).toFixed(3) + ")"; c.fillRect(xx + 1, yy + 1, s - 2, s - 2); }
      c.strokeStyle = "rgba(0,0,0,0.18)"; c.lineWidth = 1; c.beginPath();
      for (let yy = 0; yy < h; yy += s) { c.moveTo(0, yy + 0.5); c.lineTo(w, yy + 0.5); }
      c.stroke();
      g = c.createRadialGradient(w / 2, -h * 0.05, 0, w / 2, -h * 0.05, h * 0.75);
      g.addColorStop(0, "rgba(150,240,225,0.22)"); g.addColorStop(1, "rgba(150,240,225,0)");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) { const bx = rnd() * w, by = rnd() * h * 0.6, br = 12 + rnd() * 34; g = c.createRadialGradient(bx, by, 0, bx, by, br); g.addColorStop(0, "rgba(170,255,240,0.07)"); g.addColorStop(1, "rgba(170,255,240,0)"); c.fillStyle = g; c.fillRect(bx - br, by - br, br * 2, br * 2); }
      for (const r of rows) {
        const yb = r.b - R.y, rt = r.t - R.y, d = Math.max(6, tw * 0.18), f = Math.max(8, tw * 0.24);
        // arka ray (tüplerin arkasında metal çubuk)
        const ry = rt + (yb - rt) * 0.22;
        g = c.createLinearGradient(0, ry - 3, 0, ry + 4); g.addColorStop(0, "#9fb4b8"); g.addColorStop(0.5, "#4d6064"); g.addColorStop(1, "#1d2a2d");
        c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(0, ry + 4, w, 4); c.fillStyle = g; c.fillRect(0, ry - 3, w, 7);
        // raf: gölge, ön yüz, üst yüz
        g = c.createLinearGradient(0, yb + d / 2 + f, 0, yb + d / 2 + f + 34); g.addColorStop(0, "rgba(0,0,0,0.5)"); g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g; c.fillRect(0, yb + d / 2 + f, w, 34);
        g = c.createLinearGradient(0, yb + d / 2, 0, yb + d / 2 + f); g.addColorStop(0, "#6b4128"); g.addColorStop(1, "#3a2214");
        c.fillStyle = g; c.fillRect(0, yb + d / 2, w, f);
        c.strokeStyle = "rgba(0,0,0,0.12)";
        for (let i = 0; i < 5; i++) { c.beginPath(); const gy = yb + d / 2 + 2 + rnd() * (f - 4); c.moveTo(0, gy); c.bezierCurveTo(w * 0.3, gy + rnd() * 3 - 1.5, w * 0.7, gy - rnd() * 3 + 1.5, w, gy); c.stroke(); }
        g = c.createLinearGradient(0, yb - d / 2, 0, yb + d / 2); g.addColorStop(0, "#b98a5e"); g.addColorStop(1, "#8d6040");
        c.fillStyle = g; c.fillRect(0, yb - d / 2, w, d);
        c.fillStyle = "rgba(255,235,205,0.45)"; c.fillRect(0, yb - d / 2, w, 1);
        c.fillStyle = "rgba(0,0,0,0.3)"; c.fillRect(0, yb + d / 2 - 1, w, 1);
      }
      // en alt rafın altında koyu laboratuvar dolabı (kapaklar + kulplar)
      const last = rows[rows.length - 1], cy0 = last.b - R.y + Math.max(6, tw * 0.18) / 2 + Math.max(8, tw * 0.24), ch = h - cy0;
      if (ch > 40) {
        g = c.createLinearGradient(0, cy0, 0, h); g.addColorStop(0, "rgba(4,10,12,0.55)"); g.addColorStop(1, "rgba(4,10,12,0.35)");
        c.fillStyle = g; c.fillRect(0, cy0, w, ch);
        const n = 3, m = 10, dw = (w - m * (n + 1)) / n, dy = cy0 + 34, dh = ch - 34 - 14;
        for (let i = 0; i < n && dh > 30; i++) {
          const dx = m + i * (dw + m);
          g = c.createLinearGradient(0, dy, 0, dy + dh); g.addColorStop(0, "rgba(120,190,190,0.07)"); g.addColorStop(1, "rgba(120,190,190,0.02)");
          c.fillStyle = g; rr(c, dx, dy, dw, dh, 6); c.fill();
          c.strokeStyle = "rgba(160,230,225,0.10)"; c.lineWidth = 1; rr(c, dx + 0.5, dy + 0.5, dw - 1, dh - 1, 6); c.stroke();
          c.fillStyle = "rgba(0,0,0,0.35)"; rr(c, dx + dw / 2 - 16, dy + 13, 32, 6, 3); c.fill();
          c.fillStyle = "rgba(190,215,215,0.35)"; rr(c, dx + dw / 2 - 16, dy + 11, 32, 5, 2.5); c.fill();
        }
      }
      g = c.createRadialGradient(w / 2, h * 0.45, h * 0.28, w / 2, h * 0.45, h * 0.85);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.55)");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
  }
  // top + iç gölge (ambient occlusion); sx/sy: ezilme
  function drawBall(ctx, x, y, r, k, sx, sy) {
    const S = r * 2 + 2, b = ballSpr(k, r);
    ctx.globalAlpha = 0.55; ctx.drawImage(blob(SH, 0.7), x - r * 1.05, y - r * 0.75, r * 2.3, r * 2.1); ctx.globalAlpha = 1;
    if (sx && (sx !== 1 || sy !== 1)) { ctx.save(); ctx.translate(x, y + r); ctx.scale(sx, sy); ctx.drawImage(b, -S / 2, -r - S / 2, S, S); ctx.restore(); }
    else ctx.drawImage(b, x - S / 2, y - S / 2, S, S);
  }

  // Çözülmüş durumdan geriye doğru geçerli hamlelerle karıştır → her bölüm çözülebilir.
  function genLevel(seed, lvl) {
    const c = Math.min(3 + lvl, COLORS.length);
    const rand = K.rng(((seed ^ Math.imul(lvl + 1, 2654435761)) | 0) + lvl);
    let tubes = [];
    for (let i = 0; i < c; i++) tubes.push([i, i, i, i]);
    tubes.push([], []);
    const steps = 60 + c * 40;
    let last = -1;
    for (let n = 0; n < steps; n++) {
      const moves = [];
      for (let a = 0; a < tubes.length; a++) {
        const A = tubes[a]; if (!A.length) continue;
        const b = A[A.length - 1], rest = A.length - 1;
        // ileri hamle (X→A) geçerli olmalı: A'dan alınınca A boş kalmalı ya da yeni üst aynı renk olmalı
        if (!(rest === 0 || A[rest - 1] === b)) continue;
        for (let x = 0; x < tubes.length; x++) if (x !== a && tubes[x].length < CAP && x * 100 + a !== last) moves.push([a, x]);
      }
      if (!moves.length) break;
      const [a, x] = moves[Math.floor(rand() * moves.length)];
      tubes[x].push(tubes[a].pop()); last = a * 100 + x;
    }
    // tamamlanmış tüp kalmasın diye gerekirse rastgele karıştırmaya düş
    if (tubes.some(t => t.length === CAP && t.every(v => v === t[0]))) {
      for (let tries = 0; tries < 40; tries++) {
        const balls = []; for (let i = 0; i < c; i++) for (let k = 0; k < CAP; k++) balls.push(i);
        for (let i = balls.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [balls[i], balls[j]] = [balls[j], balls[i]]; }
        tubes = []; for (let i = 0; i < c; i++) tubes.push(balls.slice(i * CAP, i * CAP + CAP)); tubes.push([], []);
        if (!tubes.some(t => t.length === CAP && t.every(v => v === t[0]))) break;
      }
    }
    // dolu tüpler önce gelsin
    tubes.sort((p, q) => q.length - p.length);
    return tubes;
  }
  const complete = t => t.length === CAP && t.every(b => b === t[0]);

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, lvl: 0, tubes: genLevel(seed, 0), sel: -1, doneSet: new Set(), wait: 0, R: null, pops: [], parts: [], shakeT: -1, shake: 0, clock: 0, moves: 0, hist: [], undos: 5,
      // görsel durum
      fly: [], tfx: [], bpops: [], selT: 0, enter: 0, undoP: 0 };
    function layout(R) {
      const n = g.tubes.length, rows = n > 6 ? 2 : 1, per = Math.ceil(n / rows);
      // tüpler hem genişliğe hem yüksekliğe sığmalı (2 sıra olunca alt sıra ekran dışına taşmasın)
      const tw = Math.min(64, (R.w - 24) / (per * 1.35), (R.h - 96) / (rows * (CAP + 0.7) + (rows - 1) * 1.15 + 1.4));
      const th = tw * (CAP + 0.7);
      const rowGap = tw * 1.15;
      const totalH = rows * th + (rows - 1) * rowGap;
      const y0 = R.y + Math.max(62 + tw * 1.4, (R.h - totalH) / 2 + 20);
      const pos = [];
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, n - row * per);
        const gap = (R.w - inRow * tw) / (inRow + 1);
        pos.push({ x: R.x + gap + col * (tw + gap), y: y0 + row * (th + rowGap), w: tw, h: th });
      }
      return { pos, tw, th, br: tw * 0.36 };
    }
    const slotY = (p, br, k) => p.y + p.h - br - 6 - k * (br * 2 + 2);
    const hoverY = (p, br) => p.y - br - 8;
    const tf = i => g.tfx[i] || (g.tfx[i] = { wob: 9, wobA: 0, land: 9, landK: -1, sweep: 9, cork: 9 });
    // uçuş: kübik Bezier; kaynaktan dikey çıkar, hedefe dikey iner
    function flyPos(f, L) {
      const p = L.pos[f.to], u = inOut(f.t / f.dur), x3 = p.x + p.w / 2, y3 = slotY(p, L.br, f.slot);
      if (f.drop) return { x: K.lerp(f.x0, x3, u), y: K.lerp(f.y0, y3, u * u), u };
      const top = Math.min(f.y0, p.y) - L.tw * 1.1, v = 1 - u;
      return { x: v * v * v * f.x0 + 3 * v * v * u * f.x0 + 3 * v * u * u * x3 + u * u * u * x3, y: v * v * v * f.y0 + 3 * v * v * u * top + 3 * v * u * u * top + u * u * u * y3, u };
    }
    function land(f) {
      const L = g.R && layout(g.R), p = L && L.pos[f.to], e = tf(f.to);
      e.land = 0; e.landK = f.slot;
      if (!f.drop) { e.wob = 0; e.wobA = Math.min(1, e.wobA * 0.5 + 0.7); SFX.clack(0.35); }
      if (f.done && p) {
        const cx = p.x + p.w / 2;
        e.sweep = 0; e.cork = 0;
        K.parts.spark(g.parts, cx, p.y, K.css(K.mix(RGB[f.c], [255, 255, 255], 0.5)), 14, 240);
        K.parts.burst(g.parts, cx, p.y, COLORS[f.c], 10, 150);
        K.parts.ring(g.parts, cx, p.y + p.h * 0.5, K.css(K.mix(RGB[f.c], [255, 255, 255], 0.4)), p.h * 0.45, 4);
        K.pops.add(g.pops, "+20", cx, p.y - 18, "#ffffff");
        SFX.chime(4 + f.done); buzz(12); K.kick(0.12); K.hitstop(0.04);
      }
      if (f.lvl && g.R) {
        const R = g.R;
        K.pops.add(g.bpops, "BÖLÜM " + f.lvl.n + " TAMAM!", R.x + R.w / 2, R.y + 96, "#ffd34d", true);
        K.pops.add(g.pops, "+" + f.lvl.bonus, R.x + R.w / 2, R.y + 132, "#ffe9a8");
        K.parts.confetti(g.parts, R.x + 16, R.y + R.h - 30, 40, 560);
        K.parts.confetti(g.parts, R.x + R.w - 16, R.y + R.h - 30, 40, 560);
        K.parts.confetti(g.parts, R.x + R.w / 2, R.y + R.h * 0.45, 30, 380);
        L.pos.forEach((q, i) => { if (g.doneSet.has(i)) { tf(i).sweep = -i * 0.05; } });
        SFX.milestone(); buzz(25); K.kick(0.32); K.flash(0.18, "#ffe7a0");
      }
    }
    // dokunulan tüplerdeki uçuşları anında bitir (hızlı oyunda görüntü mantığın gerisinde kalmasın)
    function settle(a, b) { const keep = []; for (const f of g.fly) { if (a == null || f.to === a || f.to === b || f.from === a || f.from === b) land(f); else keep.push(f); } g.fly = keep; }
    function tap(i) {
      if (g.wait > 0) return;
      const t = g.tubes, L = layout(g.R);
      if (g.sel < 0) { if (t[i].length && !g.doneSet.has(i)) { settle(i); g.sel = i; g.selT = 0; SFX.pop(true); } return; }
      const back = s => { const p = L.pos[s], hy = hoverY(p, L.br) + Math.sin(g.clock * 6) * 2.5 * clamp(g.selT * 4, 0, 1); g.fly.push({ c: t[s][t[s].length - 1], from: s, to: s, slot: t[s].length - 1, x0: p.x + p.w / 2, y0: hy, t: 0, dur: 0.17, drop: true }); };
      if (g.sel === i) { back(i); g.sel = -1; SFX.pop(false); return; }
      const src = t[g.sel], dst = t[i], c = src[src.length - 1];
      let run = 0; for (let k = src.length - 1; k >= 0 && src[k] === c; k--) run++;
      const space = CAP - dst.length;
      if (space === 0 || (dst.length && dst[dst.length - 1] !== c)) { back(g.sel); g.shakeT = g.sel; g.shake = 1; tf(i).wob = 0; tf(i).wobA = 0.5; g.sel = -1; SFX.buzz(); K.kick(0.07); return; }
      const m = Math.min(run, space);
      // görsel: topların şimdiki konumlarından hedef yuvalarına uçuşlar (mantıktan önce)
      settle(i);
      const ps = L.pos[g.sel], dist = Math.abs(L.pos[i].x - ps.x) + Math.abs(L.pos[i].y - ps.y), dur = 0.3 + Math.min(0.14, dist * 0.0005);
      const fl = [];
      for (let k = 0; k < m; k++) {
        const y0 = k === 0 ? hoverY(ps, L.br) + Math.sin(g.clock * 6) * 2.5 * clamp(g.selT * 4, 0, 1) : slotY(ps, L.br, src.length - 1 - k);
        fl.push({ c, from: g.sel, to: i, slot: dst.length + k, x0: ps.x + ps.w / 2, y0, t: -k * 0.07, dur });
      }
      g.fly.push(...fl);
      g.hist.push({ from: g.sel, to: i, m });
      for (let k = 0; k < m; k++) dst.push(src.pop());
      g.sel = -1; g.moves++;
      SFX.pop(false);
      if (complete(dst) && !g.doneSet.has(i)) {
        g.doneSet.add(i); g.score += 20;
        fl[fl.length - 1].done = g.doneSet.size; // kutlama top yerine oturunca
      }
      const colorsN = g.tubes.length - 2;
      if (g.doneSet.size === colorsN) {
        const bonus = 100 + g.lvl * 20; g.score += bonus;
        fl[fl.length - 1].lvl = { n: g.lvl + 1, bonus };
        g.wait = 0.9;
      }
    }
    const undoBtn = R => ({ x: R.x + R.w - 128, y: R.y + 10, w: 116, h: 40 });
    const inst = {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: "BÖLÜM " + (g.lvl + 1) }; },
      update(dt) {
        g.clock += dt; g.shake = Math.max(0, g.shake - dt * 4);
        g.selT += dt; g.enter += dt; g.undoP = Math.max(0, g.undoP - dt * 5);
        for (const e of g.tfx) if (e) { e.wob += dt; e.land += dt; e.sweep += dt; e.cork += dt; }
        if (g.fly.length) { const keep = []; for (const f of g.fly) { f.t += dt; if (f.t >= f.dur) land(f); else keep.push(f); } g.fly = keep; }
        if (g.wait > 0) { g.wait -= dt; if (g.wait <= 0) { settle(); g.lvl++; g.tubes = genLevel(seed, g.lvl); g.doneSet = new Set(); g.sel = -1; g.hist = []; g.undos = 5; g.tfx = []; g.enter = 0; } }
        K.pops.update(g.pops, dt); K.pops.update(g.bpops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (type !== "down" || !g.R || g.over) return;
        const L = layout(g.R), u = undoBtn(g.R);
        if (x >= u.x && x <= u.x + u.w && y >= u.y && y <= u.y + u.h) {
          const h = g.hist.pop();
          if (!h || g.undos <= 0 || g.wait > 0) { SFX.buzz(); if (h) g.hist.push(h); g.undoP = 0.6; return; }
          settle(h.from, h.to);
          const pt = L.pos[h.to], A = g.tubes[h.to], B = g.tubes[h.from];
          for (let k = 0; k < h.m; k++) g.fly.push({ c: A[A.length - 1 - k], from: h.to, to: h.from, slot: B.length + k, x0: pt.x + pt.w / 2, y0: slotY(pt, L.br, A.length - 1 - k), t: -k * 0.05, dur: 0.3 });
          for (let k = 0; k < h.m; k++) g.tubes[h.from].push(g.tubes[h.to].pop());
          g.doneSet.delete(h.to); g.undos--; g.sel = -1; g.undoP = 1; SFX.whoosh(); return;
        }
        // tek bir tüp seç: dokunulan noktaya en yakın tüp
        let best = -1, bd = 1e9;
        L.pos.forEach((p, i) => { if (x >= p.x - 12 && x <= p.x + p.w + 12 && y >= p.y - L.tw * 1.1 && y <= p.y + p.h + 12) { const d = Math.abs(x - (p.x + p.w / 2)) + Math.abs(y - (p.y + p.h / 2)) * 0.5; if (d < bd) { bd = d; best = i; } } });
        if (best >= 0) tap(best);
      },
      net() { return { l: g.lvl, t: g.tubes.map(t => t.join("")).join(",") }; },
      _g: g,
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        const L = layout(R), br = L.br, pad = padOf(L.tw);
        const rows = []; L.pos.forEach(p => { if (!rows.some(r => Math.abs(r.b - (p.y + p.h)) < 1)) rows.push({ t: p.y, b: p.y + p.h }); });
        ctx.drawImage(bgLayer(R, rows, L.tw), R.x, R.y, R.w, R.h);
        // üst bilgi: bölüm + renk ilerleme taneleri
        txt(ctx, "BÖLÜM " + (g.lvl + 1), R.x + 16, R.y + 28, 18, "rgba(255,255,255,0.82)", { ls: "3px", align: "left", stroke: 3, strokeColor: "rgba(0,0,0,0.35)" });
        const nC = g.tubes.length - 2, doneC = new Set(); g.doneSet.forEach(i => { if (g.tubes[i].length) doneC.add(g.tubes[i][0]); });
        for (let c = 0; c < nC; c++) {
          const px = R.x + 23 + c * 17, py = R.y + 52;
          if (doneC.has(c)) drawBall(ctx, px, py, 6.5, c);
          else { ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2); ctx.stroke(); }
        }
        // geri al düğmesi (cam hap)
        const u = undoBtn(R), on = g.undos > 0 && g.hist.length > 0, us = 1 - Math.sin(Math.min(1, g.undoP) * Math.PI) * 0.06;
        ctx.save(); ctx.translate(u.x + u.w / 2, u.y + u.h / 2); ctx.scale(us, us); ctx.translate(-u.w / 2, -u.h / 2);
        ctx.fillStyle = "rgba(0,0,0,0.25)"; rr(ctx, 0, 3, u.w, u.h, 12); ctx.fill();
        ctx.fillStyle = on ? "rgba(190,255,245,0.16)" : "rgba(255,255,255,0.05)"; rr(ctx, 0, 0, u.w, u.h, 12); ctx.fill();
        ctx.fillStyle = on ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)"; rr(ctx, 2, 2, u.w - 4, u.h * 0.45, [10, 10, 4, 4]); ctx.fill();
        ctx.strokeStyle = on ? "rgba(200,255,245,0.4)" : "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; rr(ctx, 0.5, 0.5, u.w - 1, u.h - 1, 12); ctx.stroke();
        txt(ctx, "↶ GERİ AL (" + g.undos + ")", u.w / 2, u.h / 2 + 1, 15, on ? "#fff" : "rgba(255,255,255,0.4)", { ls: "0.5px" });
        ctx.restore();
        // uçuşlar: hangi tüpün içinde çizileceğine karar ver
        const fp = g.fly.map(f => { const q = flyPos(f, L); q.f = f; const pf = L.pos[f.from], pt = L.pos[f.to]; q.inT = f.drop ? f.to : q.u < 0.5 ? (q.y > pf.y + br * 0.3 ? f.from : -1) : (q.y > pt.y + br * 0.3 ? f.to : -1); return q; });
        const hidden = (i, k) => g.fly.some(f => f.to === i && f.slot === k);
        // 1) gölgeler ve tamamlanan tüplerin rafa düşen renkli ışığı
        g.tubes.forEach((t, i) => {
          const p = L.pos[i], cx = p.x + p.w / 2, yb = p.y + p.h, ent = clamp((g.enter - i * 0.05) / 0.5, 0, 1);
          ctx.globalAlpha = 0.35 + 0.65 * ent; ctx.drawImage(blob(SH, 0.8), cx - p.w * 0.85, yb - p.w * 0.18, p.w * 1.7, p.w * 0.42); ctx.globalAlpha = 1;
          if (g.doneSet.has(i) && t.length) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.8; ctx.drawImage(blob(RGB[t[0]], 0.5), cx - p.w * 1.2, yb - p.w * 0.35, p.w * 2.4, p.w * 0.8); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; }
        });
        // 2) tüpler: arka cam → toplar → ön cam → parıltı/tıpa
        g.tubes.forEach((t, i) => {
          const p = L.pos[i], e = g.tfx[i], done = g.doneSet.has(i), cx = p.x + p.w / 2, yb = p.y + p.h;
          const ent = clamp((g.enter - i * 0.05) / 0.5, 0, 1), oy = -(1 - backOut(ent)) * 60;
          const sx = g.shakeT === i ? Math.sin(g.clock * 50) * 5 * g.shake : 0;
          const ang = e && e.wob < 1.2 ? e.wobA * 0.05 * Math.exp(-e.wob * 6) * Math.sin(e.wob * 30) : 0;
          ctx.save(); ctx.translate(cx + sx, yb + oy); if (ang) ctx.rotate(ang); ctx.translate(-cx, -yb);
          img(ctx, tubeBack(p.w, p.h), p.x - pad, p.y - pad);
          for (let k = 0; k < t.length; k++) {
            if (hidden(i, k)) continue;
            const by = slotY(p, br, k);
            if (i === g.sel && k === t.length - 1) continue;
            let sq = 0; if (e && e.landK === k && e.land < 0.3) sq = 0.2 * (1 - e.land / 0.3) * Math.cos(e.land * 30);
            drawBall(ctx, cx, by, br, t[k], 1 + sq, 1 - sq);
          }
          for (const q of fp) if (q.inT === i) drawBall(ctx, q.x, q.y, br, q.f.c);
          // seçili top: yukarı süzülür ve hafifçe salınır
          let selB = null;
          if (i === g.sel && t.length) {
            const a = backOut(g.selT / 0.22), y0 = slotY(p, br, t.length - 1), hy = hoverY(p, br) + Math.sin(g.clock * 6) * 2.5 * clamp(g.selT * 4, 0, 1);
            selB = { y: K.lerp(y0, hy, a), c: t[t.length - 1] };
            if (selB.y > p.y + br * 0.3) { drawBall(ctx, cx, selB.y, br, selB.c); selB.drawn = true; }
          }
          img(ctx, tubeFront(p.w, p.h), p.x - pad, p.y - pad);
          // tamamlanınca yukarı doğru akan ışık şeridi
          if (e && e.sweep >= 0 && e.sweep < 0.8 && t.length) {
            const s = e.sweep / 0.8, band = p.h * 0.45, y = yb + band - (p.h + band * 2) * s;
            ctx.save(); tubePath(ctx, p.x, p.y, p.w, p.h); ctx.clip(); ctx.globalCompositeOperation = "lighter";
            const gr = ctx.createLinearGradient(0, y - band, 0, y + band), lc = K.mix(RGB[t[0]], [255, 255, 255], 0.6);
            gr.addColorStop(0, K.css(lc, 0)); gr.addColorStop(0.5, K.css(lc, 0.55 * (1 - s * 0.5))); gr.addColorStop(1, K.css(lc, 0));
            ctx.fillStyle = gr; ctx.fillRect(p.x, y - band, p.w, band * 2); ctx.restore();
          }
          if (done) {
            const cs = corkSpr(p.w), cw = p.w * 0.9 + 4, a = e ? clamp(e.cork / 0.5, 0, 1) : 1, dy = -(1 - bounce(a)) * p.w * 1.6;
            ctx.globalAlpha = clamp(a * 4, 0, 1); img(ctx, cs, cx - cw / 2, p.y - p.w * 0.36 + dy); ctx.globalAlpha = 1;
          }
          if (selB && !selB.drawn) {
            ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.55; ctx.drawImage(blob(RGB[selB.c], 0.6), cx - br * 2, selB.y - br * 2, br * 4, br * 4); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
            drawBall(ctx, cx, selB.y, br, selB.c);
          }
          ctx.restore();
        });
        // 3) tüp dışındaki uçuşlar + hareket izi
        for (const q of fp) {
          if (q.inT >= 0) continue;
          const f = q.f;
          for (let j = 4; j >= 1; j--) {
            const tt = Math.max(0, f.t - j * 0.022); if (tt <= 0) continue;
            const o = flyPos({ ...f, t: tt }, L);
            ctx.globalAlpha = 0.16 * (1 - j / 5); ctx.fillStyle = COLORS[f.c]; ctx.beginPath(); ctx.arc(o.x, o.y, br * (1 - j * 0.1), 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1; drawBall(ctx, q.x, q.y, br, f.c);
        }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1); K.pops.draw(ctx, g.bpops, Math.min(0.8, R.w / 470));
        ctx.restore();
      },
    };
    return inst;
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#173d40", "#0b1a20");
    const tubes = d && typeof d.t === "string" ? d.t.split(",") : [];
    const n = Math.max(1, tubes.length), tw = Math.min(30, (R.w - 20) / (n * 1.4)), th = tw * (CAP + 0.6), br = tw * 0.36;
    const gap = (R.w - n * tw) / (n + 1), y = R.y + (R.h - th) / 2 + 8, pad = padOf(tw);
    ctx.fillStyle = "rgba(120,80,50,0.55)"; ctx.fillRect(R.x, y + th - 2, R.w, 4);
    tubes.forEach((t, i) => {
      const x = R.x + gap + i * (tw + gap);
      img(ctx, tubeBack(tw, th), x - pad, y - pad);
      t.split("").forEach((b, k) => drawBall(ctx, x + tw / 2, y + th - br - 4 - k * (br * 2 + 1), br, +b % COLORS.length));
      img(ctx, tubeFront(tw, th), x - pad, y - pad);
    });
    txt(ctx, "BÖLÜM " + ((d && d.l | 0) + 1), R.x + R.w / 2, R.y + 16, 13, "rgba(255,255,255,0.7)", { ls: "2px" });
  }
  K.register({
    id: "renk", name: "Renk Sıralama", color: "#1fc2b0", desc: "Topları tüplere diz; her tüpte tek renk kalsın.",
    rules: "Tüpe dokun · başka tüpe dokun · aynı renk üst üste",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
