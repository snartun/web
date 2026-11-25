// Blok Yerleştir: parçaları 8×8 tahtaya sürükle, dolan satır ve sütunları patlat.
(() => {
  "use strict";
  const { hash, clamp, hex, mix, css, rr, SFX, buzz, lerp, easeOut } = K;
  const N = 8;
  const COLORS = ["#ff6a3d", "#f4b400", "#2bb673", "#1fc2b0", "#3d8bff", "#8c6bff", "#ff4d8d"];
  const GRAY = "#5d6377";
  const SHAPES = [
    [[0, 0]],
    [[0, 0], [1, 0]], [[0, 0], [0, 1]],
    [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 0], [2, 0], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 1]], [[1, 0], [1, 1], [1, 2], [0, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]],
  ];
  const WEIGHTS = SHAPES.map((s, i) => (i === 10 ? 0.5 : s.length === 5 ? 0.7 : 1));
  const WSUM = WEIGHTS.reduce((a, b) => a + b, 0);
  function pieceAt(seed, k) {
    let r = hash(seed, k * 3 + 11) * WSUM, idx = 0;
    while (idx < SHAPES.length - 1 && r > WEIGHTS[idx]) { r -= WEIGHTS[idx]; idx++; }
    const cells = SHAPES[idx];
    return { cells, w: Math.max(...cells.map(c => c[0])) + 1, h: Math.max(...cells.map(c => c[1])) + 1, color: 1 + Math.floor(hash(seed, k * 3 + 12) * COLORS.length), used: false };
  }

  // ---------- görsel katman (önbellekli) ----------
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const easeBack = t => { t = clamp(t, 0, 1) - 1; return 1 + 2.70158 * t * t * t + 1.70158 * t * t; };
  // Parlak, eğimli jöle/mücevher karo; ışık sol üstten. Her renk+boyut bir kez çizilir.
  const TILE = new Map();
  function tileSprite(col, size) {
    const d = DPR(), s = Math.max(6, Math.round(size)), key = col + s + "|" + d;
    let c = TILE.get(key); if (c) return c;
    if (TILE.size > 160) TILE.clear();
    const p = Math.ceil(s * 0.3); c = mk((s + p * 2) * d, (s + p * 2) * d);
    const x = c.getContext("2d"); x.scale(d, d); x.translate(p, p);
    const b = hex(col), r = s * 0.2, m = s * 0.04, f = s * 0.13;
    // yumuşak gölge (sağ alta düşer)
    x.save(); x.shadowColor = "rgba(0,0,0,0.5)"; x.shadowBlur = s * 0.16 * d; x.shadowOffsetX = s * 0.03 * d; x.shadowOffsetY = s * 0.08 * d;
    x.fillStyle = css(mix(b, [0, 0, 0], 0.45)); rr(x, m, m, s - 2 * m, s - 2 * m, r); x.fill(); x.restore();
    // gövde: eğimli kenar
    let gr = x.createLinearGradient(0, m, 0, s - m);
    gr.addColorStop(0, css(mix(b, [255, 255, 255], 0.5))); gr.addColorStop(0.42, col); gr.addColorStop(1, css(mix(b, [0, 0, 0], 0.45)));
    x.fillStyle = gr; rr(x, m, m, s - 2 * m, s - 2 * m, r); x.fill();
    gr = x.createLinearGradient(m, 0, s - m, 0); // yan ışık: sol açık, sağ koyu
    gr.addColorStop(0, "rgba(255,255,255,0.16)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(0,0,0,0.16)");
    x.fillStyle = gr; rr(x, m, m, s - 2 * m, s - 2 * m, r); x.fill();
    // yüz: hafif içbükey düz yüzey
    gr = x.createLinearGradient(0, f, 0, s - f);
    gr.addColorStop(0, css(mix(b, [0, 0, 0], 0.06))); gr.addColorStop(1, css(mix(b, [255, 255, 255], 0.12)));
    x.fillStyle = gr; rr(x, f, f * 0.85, s - 2 * f, s - 2 * f, r * 0.65); x.fill();
    // cam parlaması (üst bölüm)
    gr = x.createLinearGradient(0, f, 0, s * 0.56);
    gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0.02)");
    x.fillStyle = gr; rr(x, f + s * 0.03, f * 0.85 + s * 0.02, s - 2 * f - s * 0.06, s * 0.3, [r * 0.5, r * 0.5, r * 0.9, r * 0.9]); x.fill();
    // kenar çizgisi: üst açık, alt koyu
    gr = x.createLinearGradient(0, m, 0, s - m);
    gr.addColorStop(0, "rgba(255,255,255,0.6)"); gr.addColorStop(0.5, "rgba(255,255,255,0.04)"); gr.addColorStop(1, "rgba(0,0,0,0.4)");
    x.strokeStyle = gr; x.lineWidth = Math.max(1, s * 0.035); rr(x, m + 0.5, m + 0.5, s - 2 * m - 1, s - 2 * m - 1, r); x.stroke();
    // speküler parıltı
    x.fillStyle = "rgba(255,255,255,0.9)"; x.beginPath(); x.ellipse(f + s * 0.13, f + s * 0.09, s * 0.07, s * 0.035, -0.45, 0, Math.PI * 2); x.fill();
    c.pad = p; c.s = s; TILE.set(key, c); return c;
  }
  // karo: (x,y) sol üst köşe, s boyut; sx/sy ölçek, ay = ölçek çapası (0.5 merkez, 1 alt kenar)
  function tile(ctx, x, y, s, col, a, sx, sy, ay) {
    const sp = tileSprite(col, s), k = s / sp.s, P = sp.pad * k, W = (sp.s + sp.pad * 2) * k;
    if (a != null) ctx.globalAlpha = clamp(a, 0, 1);
    if (!sx && !sy) ctx.drawImage(sp, x - P, y - P, W, W);
    else {
      sx = sx || 1; sy = sy || 1; ay = ay == null ? 0.5 : ay;
      ctx.drawImage(sp, x + s / 2 - (P + s / 2) * sx, y + s * ay - (P + s * ay) * sy, W * sx, W * sy);
    }
    ctx.globalAlpha = 1;
  }
  // sürüklenen parçanın büyük, yumuşak gölgesi (parça+boyut başına bir kez)
  const SHAD = new Map();
  function pieceShadow(p, cs) {
    const d = DPR(), key = p.cells.join(";") + "|" + Math.round(cs) + "|" + d;
    let c = SHAD.get(key); if (c) return c;
    if (SHAD.size > 60) SHAD.clear();
    const pad = Math.ceil(cs * 0.7); c = mk((p.w * cs + pad * 2) * d, (p.h * cs + pad * 2) * d);
    const x = c.getContext("2d"); x.scale(d, d);
    const OFF = 4000; // şekli dışarı çizip yalnız gölgesini içeri düşür
    x.shadowColor = "rgba(0,0,0,0.6)"; x.shadowBlur = cs * 0.38 * d; x.shadowOffsetX = OFF * d; x.fillStyle = "#000";
    x.beginPath();
    for (const [cx, cy] of p.cells) { if (x.roundRect) x.roundRect(pad + cx * cs + 2 - OFF, pad + cy * cs + 2, cs - 4, cs - 4, cs * 0.2); else x.rect(pad + cx * cs + 2 - OFF, pad + cy * cs + 2, cs - 4, cs - 4); }
    x.fill();
    c.pad = pad; SHAD.set(key, c); return c;
  }
  // gren dokusu deseni
  let NOISE = null;
  function noisePat(ctx) {
    if (!NOISE) {
      NOISE = mk(96, 96); const x = NOISE.getContext("2d"), im = x.createImageData(96, 96);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() < 0.5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 16; }
      x.putImageData(im, 0, 0);
    }
    return ctx.createPattern(NOISE, "repeat");
  }
  function layoutOf(R) {
    const cs = Math.floor(Math.min((R.w - 28) / N, (R.h * 0.64) / N));
    const trayH = cs * 3.4, total = cs * N + 18 + trayH;
    const bx = Math.round(R.x + (R.w - cs * N) / 2), by = Math.round(R.y + Math.max(10, (R.h - total) / 2));
    return { cs, bx, by, ty: by + cs * N + 18, trayH };
  }
  // Statik katman: arka plan (vinyet + gren), fiziksel tepsi (eğim, iç gölge), boş yuvalar, parça rafı
  function buildBg(R, L, remote) {
    const d = DPR(), c = mk(R.w * d, R.h * d), x = c.getContext("2d");
    x.scale(d, d); x.translate(-R.x, -R.y);
    const cs = L.cs, bw = cs * N, cx = R.x + R.w / 2;
    let gr = x.createLinearGradient(0, R.y, 0, R.y + R.h);
    gr.addColorStop(0, "#252c52"); gr.addColorStop(0.55, "#161b36"); gr.addColorStop(1, "#0b0e1f");
    x.fillStyle = gr; x.fillRect(R.x, R.y, R.w, R.h);
    gr = x.createRadialGradient(cx, L.by - cs, 0, cx, L.by - cs, R.h * 0.7); // tepeden ışık
    gr.addColorStop(0, "rgba(120,150,255,0.2)"); gr.addColorStop(1, "rgba(120,150,255,0)");
    x.fillStyle = gr; x.fillRect(R.x, R.y, R.w, R.h);
    x.fillStyle = noisePat(x); x.fillRect(R.x, R.y, R.w, R.h);
    gr = x.createRadialGradient(cx, R.y + R.h * 0.45, Math.min(R.w, R.h) * 0.35, cx, R.y + R.h * 0.45, Math.max(R.w, R.h) * 0.75); // vinyet
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.55)");
    x.fillStyle = gr; x.fillRect(R.x, R.y, R.w, R.h);
    // tepsi çerçevesi
    const fp = Math.max(6, Math.round(cs * 0.26)), fx = L.bx - fp, fy = L.by - fp, fw = bw + fp * 2, fr = cs * 0.38;
    x.save(); x.shadowColor = "rgba(0,0,0,0.6)"; x.shadowBlur = 26 * d; x.shadowOffsetY = 12 * d;
    x.fillStyle = "#1b2140"; rr(x, fx, fy, fw, fw, fr); x.fill(); x.restore();
    gr = x.createLinearGradient(0, fy, 0, fy + fw);
    gr.addColorStop(0, "#46528a"); gr.addColorStop(0.08, "#323c6c"); gr.addColorStop(0.92, "#1e2547"); gr.addColorStop(1, "#141932");
    x.fillStyle = gr; rr(x, fx, fy, fw, fw, fr); x.fill();
    x.fillStyle = noisePat(x); rr(x, fx, fy, fw, fw, fr); x.fill();
    x.strokeStyle = "rgba(255,255,255,0.22)"; x.lineWidth = 1; rr(x, fx + 0.5, fy + 0.5, fw - 1, fw - 1, fr); x.stroke();
    // iç oyuk (kuyu) + içe düşen gölge
    const wx = L.bx - 3, wy = L.by - 3, ww = bw + 6, wr = cs * 0.24;
    x.fillStyle = "#0c1024"; rr(x, wx, wy, ww, ww, wr); x.fill();
    x.save(); rr(x, wx, wy, ww, ww, wr); x.clip();
    x.shadowColor = "rgba(0,0,0,0.85)"; x.shadowBlur = cs * 0.35 * d; x.shadowOffsetY = cs * 0.08 * d;
    x.strokeStyle = "#000"; x.lineWidth = 20; rr(x, wx - 10, wy - 10, ww + 20, ww + 20, wr + 10); x.stroke(); x.restore();
    x.strokeStyle = "rgba(255,255,255,0.12)"; x.lineWidth = 1; x.beginPath(); x.moveTo(wx + wr, wy + ww + 0.5); x.lineTo(wx + ww - wr, wy + ww + 0.5); x.stroke();
    // boş yuvalar: hafif çukur
    for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) {
      const sx = L.bx + i * cs + 2, sy = L.by + y * cs + 2, s = cs - 4, k = (i + y) % 2 ? 0 : 0.012;
      gr = x.createLinearGradient(0, sy, 0, sy + s);
      gr.addColorStop(0, "rgba(0,0,0," + (0.32 - k) + ")"); gr.addColorStop(0.35, "rgba(255,255,255," + (0.025 + k) + ")"); gr.addColorStop(1, "rgba(255,255,255," + (0.07 + k) + ")");
      x.fillStyle = gr; rr(x, sx, sy, s, s, cs * 0.17); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.045)"; x.lineWidth = 1; rr(x, sx + 0.5, sy + 0.5, s - 1, s - 1, cs * 0.17); x.stroke();
    }
    if (!remote) {
      // parça rafı: 3 yumuşak spot ışık + ince raf çizgisi
      const sw = R.w / 3;
      for (let i = 0; i < 3; i++) {
        const ex = R.x + sw * (i + 0.5), ey = L.ty + L.trayH * 0.62;
        gr = x.createRadialGradient(ex, ey, 0, ex, ey, sw * 0.5);
        gr.addColorStop(0, "rgba(140,165,255,0.12)"); gr.addColorStop(1, "rgba(140,165,255,0)");
        x.fillStyle = gr; x.fillRect(ex - sw / 2, L.ty - 6, sw, L.trayH + 12);
      }
      gr = x.createLinearGradient(R.x + 20, 0, R.x + R.w - 20, 0);
      gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,0.1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = gr; x.fillRect(R.x + 20, L.ty - 5, R.w - 40, 1);
    }
    return c;
  }

  function create(opts) {
    const seed = opts.seed | 0, duel = opts.mode === "duel";
    const g = { score: 0, over: false, grid: new Array(N * N).fill(0), tray: [], next: 0, combo: 0, drag: null, R: null, fade: [], parts: [], pops: [], clock: 0,
      land: new Float32Array(N * N).fill(9), tin: [0, 0, 0], ret: null, glow: null, heat: 0, bg: null, bgKey: "", overT: 0 };
    function refill() {
      for (let attempt = 0; attempt < 12; attempt++) {
        const k = g.next + attempt * 1000003;
        const t = [pieceAt(seed, k), pieceAt(seed, k + 1), pieceAt(seed, k + 2)];
        if (duel || attempt === 11 || t.some(anyFit)) { g.tray = t; break; }
      }
      g.next += 3;
      g.tin = [0, -0.07, -0.14]; // yeni parçalar sırayla belirir
    }
    const fits = (p, gx, gy) => p.cells.every(([cx, cy]) => { const x = gx + cx, y = gy + cy; return x >= 0 && y >= 0 && x < N && y < N && !g.grid[y * N + x]; });
    const anyFit = p => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (fits(p, x, y)) return true; return false; };
    refill();
    // yerleştirilirse dolacak satır/sütunlar (önizleme için)
    function wouldClear(p, gx, gy) {
      const tmp = g.grid.slice();
      for (const [cx, cy] of p.cells) tmp[(gy + cy) * N + gx + cx] = 9;
      const rows = [], cols = [];
      for (let y = 0; y < N; y++) { let f = true; for (let x = 0; x < N; x++) if (!tmp[y * N + x]) { f = false; break; } if (f) rows.push(y); }
      for (let x = 0; x < N; x++) { let f = true; for (let y = 0; y < N; y++) if (!tmp[y * N + x]) { f = false; break; } if (f) cols.push(x); }
      return { rows, cols };
    }
    const layout = layoutOf;
    function place(p, gx, gy) {
      for (const [cx, cy] of p.cells) g.grid[(gy + cy) * N + gx + cx] = p.color;
      p.used = true;
      let gain = p.cells.length;
      const rows = [], cols = [];
      for (let y = 0; y < N; y++) { let f = true; for (let x = 0; x < N; x++) if (!g.grid[y * N + x]) { f = false; break; } if (f) rows.push(y); }
      for (let x = 0; x < N; x++) { let f = true; for (let y = 0; y < N; y++) if (!g.grid[y * N + x]) { f = false; break; } if (f) cols.push(x); }
      const L = rows.length + cols.length;
      const L0 = layout(g.R), cs = L0.cs;
      // yerleşme: ezilip yaylanma + alt kenarlardan toz
      const pcx = gx + p.w / 2, pcy = gy + p.h / 2;
      for (const [cx, cy] of p.cells) {
        g.land[(gy + cy) * N + gx + cx] = -(cx + cy) * 0.012;
        if (!p.cells.some(c => c[0] === cx && c[1] === cy + 1)) K.parts.dust(g.parts, L0.bx + (gx + cx + 0.5) * cs, L0.by + (gy + cy + 1) * cs - 2, "rgba(150,165,225,1)", 1, 35);
      }
      K.kick(0.05 + p.cells.length * 0.008);
      if (L) {
        g.combo++;
        const clear = new Set();
        rows.forEach(y => { for (let x = 0; x < N; x++) clear.add(y * N + x); });
        cols.forEach(x => { for (let y = 0; y < N; y++) clear.add(y * N + x); });
        let sx = 0, sy = 0;
        for (const i of clear) {
          const x = i % N, y = (i / N) | 0;
          // parçanın olduğu yerden dışa doğru yayılan süpürme gecikmesi
          const dl = 0.035 + 0.032 * Math.min(rows.includes(y) ? Math.abs(x + 0.5 - pcx) : 9, cols.includes(x) ? Math.abs(y + 0.5 - pcy) : 9);
          g.fade.push({ x, y, c: COLORS[g.grid[i] - 1], t: 0, d: dl, hit: false, big: L });
          g.grid[i] = 0; g.land[i] = 9; sx += x; sy += y;
        }
        sx = L0.bx + (sx / clear.size + 0.5) * cs; sy = L0.by + (sy / clear.size + 0.5) * cs;
        gain += 80 * L + 40 * L * (L - 1) + (g.combo > 1 ? 50 * (g.combo - 1) : 0);
        const praise = L >= 4 ? "MUHTEŞEM!" : L === 3 ? "MÜKEMMEL!" : L === 2 ? "SÜPER!" : g.combo > 2 ? "HARİKA!" : "İYİ!";
        const py = clamp(sy - cs * 0.6, L0.by + cs, L0.by + cs * 6.4), px = clamp(sx, L0.bx + cs * 2.5, L0.bx + cs * 5.5);
        K.pops.add(g.pops, praise, px, py, L >= 2 ? "#ffd34d" : "#ffffff", true);
        K.pops.add(g.pops, "+" + (gain - p.cells.length) + (g.combo > 1 ? "  KOMBO ×" + g.combo : ""), px, py + cs * 1.15, g.combo > 1 ? "#ffb36b" : "#8ef0e2");
        g.glow = { rows, cols, life: 0.5 };
        // başarıyla orantılı sarsıntı / donma / flaş
        K.kick(Math.min(0.55, 0.14 + L * 0.1 + g.combo * 0.03)); K.hitstop(Math.min(0.1, 0.035 + L * 0.015)); K.flash(Math.min(0.3, 0.06 + L * 0.06), "#fff6dc");
        K.parts.ring(g.parts, sx, sy, "rgba(255,240,200,1)", cs * (2 + L), 5);
        if (L >= 3) K.parts.ring(g.parts, sx, sy, "#ffd34d", cs * (3 + L), 3);
        if (L >= 3 || g.combo >= 4) K.parts.confetti(g.parts, sx, sy, 18 + L * 6, 320 + L * 40);
        g.heat = Math.min(1, g.heat + 0.25 + L * 0.1);
        if (g.grid.every(v => !v)) { gain += 300; K.pops.add(g.pops, "TAHTA TEMİZ!  +300", L0.bx + L0.cs * 4, L0.by + L0.cs * 5.4, "#ffd34d", true); SFX.milestone(); buzz([30, 40, 60]); K.parts.confetti(g.parts, L0.bx + cs * 4, L0.by + cs * 4, 50, 460); K.flash(0.35, "#fff2c0"); }
        SFX.chime(Math.min(13, g.combo + L - 1)); if (L > 1) SFX.arp([0, 4, 7, 12].slice(0, L + 1), 0.05, 0.5); buzz(L > 1 ? [20, 30, 20] : 20);
      } else { g.combo = 0; SFX.place(); }
      g.score += gain;
      if (g.tray.every(t => t.used)) refill();
      const live = g.tray.filter(t => !t.used);
      if (!live.some(anyFit)) {
        if (duel) {
          for (let i = 0; i < N * N; i++) if (g.grid[i]) g.fade.push({ x: i % N, y: (i / N) | 0, c: COLORS[g.grid[i] - 1], t: 0, d: 0.05 + ((i / N) | 0) * 0.035, hit: false, big: 0 });
          g.grid.fill(0); g.land.fill(9); g.combo = 0;
          K.pops.add(g.pops, "YER KALMADI — TAHTA TEMİZLENDİ", L0.bx + L0.cs * 4, L0.by + L0.cs * 4, "#ff6b78");
          SFX.crash(); K.kick(0.4); K.flash(0.2, "#ff6b78");
        } else { g.over = true; SFX.crash(); K.kick(0.35); K.flash(0.22, "#ff6b78"); }
      }
    }
    function trayHit(x, y) {
      const L = layout(g.R), sw = g.R.w / 3;
      if (y < L.ty - 6 || y > L.ty + L.trayH + 10) return -1;
      const i = Math.floor((x - g.R.x) / sw);
      return i >= 0 && i < 3 && !g.tray[i].used ? i : -1;
    }
    function dragTarget() {
      const d = g.drag, p = g.tray[d.i], L = layout(g.R);
      const ax = d.x - (p.w * L.cs) / 2, ay = d.y - p.h * L.cs - L.cs * 1.1;
      const gx = Math.round((ax - L.bx) / L.cs), gy = Math.round((ay - L.by) / L.cs);
      return { gx, gy, ax, ay, ok: fits(p, gx, gy) };
    }
    // tepsideki parçanın konumu ve karo boyutu
    function trayGeom(i, p, L, R) {
      const sw = R.w / 3, s = Math.min(L.cs * 0.6, (sw - 20) / Math.max(p.w, 3), (L.trayH - 10) / Math.max(p.h, 3));
      return { s, ox: R.x + sw * i + (sw - p.w * s) / 2, oy: L.ty + (L.trayH - p.h * s) / 2 };
    }
    const LIFT = 1.07; // sürüklerken hafif büyür
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      _g: g,
      info() { return { extra: g.combo > 1 ? "KOMBO ×" + g.combo : "" }; },
      update(dt) {
        g.clock += dt;
        for (let i = 0; i < N * N; i++) if (g.land[i] < 9) g.land[i] += dt;
        for (let i = 0; i < 3; i++) g.tin[i] += dt;
        if (g.drag) g.drag.t = Math.min(1, (g.drag.t || 0) + dt / 0.13);
        if (g.ret) { g.ret.t += dt / 0.22; if (g.ret.t >= 1) g.ret = null; }
        g.heat = Math.max(g.combo > 1 ? 0.25 : 0, g.heat - dt * 0.5);
        if (g.over) g.overT = Math.min(1, g.overT + dt * 2);
        const L = g.R && layout(g.R);
        for (const f of g.fade) {
          f.t += dt;
          if (!f.hit && f.t >= f.d && L) {
            f.hit = true;
            const px = L.bx + (f.x + 0.5) * L.cs, py = L.by + (f.y + 0.5) * L.cs;
            K.parts.burst(g.parts, px, py, f.c, f.big >= 3 ? 3 : 4, 170);
            K.parts.spark(g.parts, px, py, "#fff3c8", f.big ? 2 : 1, 240);
          }
        }
        g.fade = g.fade.filter(f => f.t < f.d + 0.16);
        if (g.glow) { g.glow.life -= dt; if (g.glow.life <= 0) g.glow = null; }
        K.parts.update(g.parts, dt); K.pops.update(g.pops, dt);
      },
      pointer(type, x, y) {
        if (!g.R || g.over) return;
        if (type === "down") { const i = trayHit(x, y); if (i >= 0) { g.drag = { i, x, y, t: 0 }; if (g.ret && g.ret.i === i) g.ret = null; SFX.pop(true); } }
        else if (type === "move" && g.drag) { g.drag.x = x; g.drag.y = y; }
        else if ((type === "up" || type === "cancel") && g.drag) {
          const t = dragTarget(), p = g.tray[g.drag.i], i = g.drag.i;
          g.drag = null;
          if (type === "up" && t.ok) place(p, t.gx, t.gy);
          else {
            // geçersiz bırakma: parça tepsiye süzülerek geri döner
            const L = layout(g.R), S = L.cs * LIFT;
            g.ret = { i, x: t.ax - (S - L.cs) * p.w / 2, y: t.ay - (S - L.cs) * p.h / 2, s: S, t: 0 };
            if (type === "up") { SFX.pop(false); buzz(12); }
          }
        }
      },
      net() { return { g: g.grid.join("") }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        const L = layout(R), cs = L.cs, bw = cs * N;
        const key = R.x + "," + R.y + "," + R.w + "," + R.h + "," + DPR();
        if (g.bgKey !== key) { g.bg = buildBg(R, L); g.bgKey = key; }
        ctx.drawImage(g.bg, R.x, R.y, R.w, R.h);
        // kombo ısısı: çerçevenin etrafında sıcak, sabit (titreşmeyen) parıltı
        if (g.heat > 0.02) {
          const fp = Math.max(6, Math.round(cs * 0.26));
          ctx.save(); ctx.globalAlpha = g.heat * 0.7; ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 22 * DPR();
          ctx.strokeStyle = "rgba(255,200,110,0.55)"; ctx.lineWidth = 2; rr(ctx, L.bx - fp + 1, L.by - fp + 1, bw + fp * 2 - 2, bw + fp * 2 - 2, cs * 0.38); ctx.stroke(); ctx.restore();
        }
        // sürükleme hedefi ve dolacak çizgiler
        let t = null, wc = null;
        const pulse = 0.5 + 0.5 * Math.sin(g.clock * 8); // ~1.3 Hz
        if (g.drag) {
          t = dragTarget();
          if (t.ok) {
            const p = g.tray[g.drag.i];
            wc = wouldClear(p, t.gx, t.gy);
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = "rgba(255,220,140," + (0.12 + 0.1 * pulse) + ")";
            for (const y of wc.rows) { rr(ctx, L.bx + 1, L.by + y * cs + 1, bw - 2, cs - 2, cs * 0.2); ctx.fill(); }
            for (const x of wc.cols) { rr(ctx, L.bx + x * cs + 1, L.by + 1, cs - 2, bw - 2, cs * 0.2); ctx.fill(); }
            ctx.globalCompositeOperation = "source-over";
          }
        }
        // dolu karolar (yerleşme yaylanması ile)
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x, v = g.grid[i]; if (!v) continue;
          const a = g.land[i];
          if (a < 0.45) {
            const e = Math.max(0, a), sy = 1 - 0.15 * Math.exp(-e * 11) * Math.cos(e * 30), sxx = 1 + (1 - sy) * 0.7;
            tile(ctx, L.bx + x * cs, L.by + y * cs, cs, COLORS[v - 1], null, sxx, sy, 1);
          } else tile(ctx, L.bx + x * cs, L.by + y * cs, cs, COLORS[v - 1]);
        }
        // patlayacak karolar parlar
        if (wc && (wc.rows.length || wc.cols.length)) {
          ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,240,200," + (0.1 + 0.12 * pulse) + ")";
          for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (g.grid[y * N + x] && (wc.rows.includes(y) || wc.cols.includes(x))) { rr(ctx, L.bx + x * cs + 2, L.by + y * cs + 2, cs - 4, cs - 4, cs * 0.2); ctx.fill(); }
          ctx.globalCompositeOperation = "source-over";
        }
        // yerleşim önizlemesi (hayalet) veya geçersiz konum uyarısı
        if (t) {
          const p = g.tray[g.drag.i];
          if (t.ok) {
            for (const [cx, cy] of p.cells) {
              const X = L.bx + (t.gx + cx) * cs, Y = L.by + (t.gy + cy) * cs;
              tile(ctx, X, Y, cs, COLORS[p.color - 1], 0.32);
              ctx.strokeStyle = "rgba(255,255,255," + (0.35 + 0.2 * pulse) + ")"; ctx.lineWidth = 2; rr(ctx, X + 3, Y + 3, cs - 6, cs - 6, cs * 0.18); ctx.stroke();
            }
          } else if (t.gx > -p.w && t.gy > -p.h && t.gx < N && t.gy < N) {
            ctx.strokeStyle = "rgba(255,95,110,0.55)"; ctx.lineWidth = 2;
            for (const [cx, cy] of p.cells) { const X = t.gx + cx, Y = t.gy + cy; if (X < 0 || Y < 0 || X >= N || Y >= N) continue; rr(ctx, L.bx + X * cs + 4, L.by + Y * cs + 4, cs - 8, cs - 8, cs * 0.18); ctx.stroke(); }
          }
        }
        // satır temizleme: karo beyaza parlar, sonra büyüyüp kaybolur
        for (const f of g.fade) {
          const X = L.bx + f.x * cs, Y = L.by + f.y * cs;
          if (f.t < f.d) {
            const w = clamp((f.t - (f.d - 0.1)) / 0.1, 0, 1);
            tile(ctx, X, Y, cs, f.c, 1, 1 + w * 0.06, 1 + w * 0.06);
            if (w > 0) tile(ctx, X, Y, cs, "#fff8e6", w, 1 + w * 0.06, 1 + w * 0.06);
          } else {
            const k = (f.t - f.d) / 0.16, sc = 1.06 + easeOut(k) * 0.3;
            tile(ctx, X, Y, cs, "#fff8e6", (1 - k) * (1 - k), sc, sc);
          }
        }
        // temizlenen çizgide ışık hüzmesi
        if (g.glow) {
          const a = g.glow.life / 0.5, e = easeOut(1 - a), th = cs * (0.9 - 0.6 * e);
          ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,226,170," + 0.32 * a + ")";
          for (const y of g.glow.rows) ctx.fillRect(L.bx - cs * 0.4 * e, L.by + (y + 0.5) * cs - th / 2, bw + cs * 0.8 * e, th);
          for (const x of g.glow.cols) ctx.fillRect(L.bx + (x + 0.5) * cs - th / 2, L.by - cs * 0.4 * e, th, bw + cs * 0.8 * e);
          ctx.globalCompositeOperation = "source-over";
        }
        // tepsi
        for (let i = 0; i < 3; i++) {
          const p = g.tray[i]; if (p.used || (g.drag && g.drag.i === i) || (g.ret && g.ret.i === i)) continue;
          const { s, ox, oy } = trayGeom(i, p, L, R), fitsAny = anyFit(p), col = fitsAny ? COLORS[p.color - 1] : GRAY;
          const k = g.tin[i] < 0.35 ? easeBack(g.tin[i] / 0.35) : 1; if (k <= 0) continue;
          const mx = ox + p.w * s / 2, my = oy + p.h * s / 2;
          for (const [cx, cy] of p.cells) tile(ctx, mx + (ox + cx * s - mx) * k, my + (oy + cy * s - my) * k, s * k, col, fitsAny ? 1 : 0.75);
        }
        // geri dönen parça
        if (g.ret) {
          const p = g.tray[g.ret.i], tg = trayGeom(g.ret.i, p, L, R), e = easeOut(g.ret.t);
          const s = lerp(g.ret.s, tg.s, e), ox = lerp(g.ret.x, tg.ox, e), oy = lerp(g.ret.y, tg.oy, e);
          for (const [cx, cy] of p.cells) tile(ctx, ox + cx * s, oy + cy * s, s, COLORS[p.color - 1]);
        }
        // sürüklenen parça: büyük yumuşak gölge + hafif büyüme
        if (g.drag) {
          const p = g.tray[g.drag.i], tg = trayGeom(g.drag.i, p, L, R), e = easeOut(g.drag.t), S = cs * LIFT;
          const s = lerp(tg.s, S, e), ox = lerp(tg.ox, t.ax - (S - cs) * p.w / 2, e), oy = lerp(tg.oy, t.ay - (S - cs) * p.h / 2, e);
          const sh = pieceShadow(p, cs), sk = s / cs, sp = sh.pad * sk;
          ctx.globalAlpha = 0.55 * e; ctx.drawImage(sh, ox - sp + cs * 0.16 * e, oy - sp + cs * 0.34 * e, sh.width / DPR() * sk, sh.height / DPR() * sk); ctx.globalAlpha = 1;
          for (const [cx, cy] of p.cells) tile(ctx, ox + cx * s, oy + cy * s, s, COLORS[p.color - 1]);
        }
        if (g.overT > 0) { ctx.fillStyle = "rgba(8,10,22," + 0.45 * g.overT + ")"; ctx.fillRect(R.x, R.y, R.w, R.h); }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, Math.max(0.8, cs / 40));
        ctx.restore();
      },
    };
  }
  // rakip görünümü: aynı malzeme, önbellekli katman
  let RB = null, RBK = "";
  function drawRemote(ctx, R, d) {
    const cs = Math.floor(Math.min((R.w - 20) / N, (R.h - 16) / N)), bx = Math.round(R.x + (R.w - cs * N) / 2), by = Math.round(R.y + (R.h - cs * N) / 2);
    const key = R.x + "," + R.y + "," + R.w + "," + R.h + "," + DPR();
    if (RBK !== key) { RB = buildBg(R, { cs, bx, by, ty: 0, trayH: 0 }, true); RBK = key; }
    ctx.drawImage(RB, R.x, R.y, R.w, R.h);
    const s = d && typeof d.g === "string" ? d.g : "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = +s[y * N + x] || 0;
      if (v) tile(ctx, bx + x * cs, by + y * cs, cs, COLORS[(v - 1) % COLORS.length]);
    }
  }
  K.register({
    id: "blok", name: "Blok Yerleştir", color: "#3d8bff", desc: "Parçaları tahtaya sürükle, dolan satır ve sütunları patlat.",
    rules: "Parçayı sürükle bırak · satır/sütun doldur · kombo yap",
    timeLimit: mode => (mode === "duel" ? 60 : null),
    create, drawRemote,
  });
})();
