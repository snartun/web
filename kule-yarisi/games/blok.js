// Blok Yerleştir: parçaları 8×8 tahtaya sürükle, dolan satır ve sütunları patlat.
(() => {
  "use strict";
  const { hash, clamp, hex, mix, css, rr, txt, SFX, buzz } = K;
  const N = 8;
  const COLORS = ["#ff6a3d", "#f4b400", "#2bb673", "#1fc2b0", "#3d8bff", "#8c6bff", "#ff4d8d"];
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
  function cell(ctx, x, y, s, col, alpha) {
    const c = hex(col);
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = css(mix(c, [0, 0, 0], 0.3)); rr(ctx, x + 1, y + 1, s - 2, s - 2, s * 0.18); ctx.fill();
    ctx.fillStyle = col; rr(ctx, x + 1, y + 1, s - 2, s - 2 - s * 0.1, s * 0.18); ctx.fill();
    ctx.fillStyle = css(mix(c, [255, 255, 255], 0.35)); rr(ctx, x + s * 0.18, y + s * 0.12, s * 0.64, s * 0.14, s * 0.07); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function create(opts) {
    const seed = opts.seed | 0, duel = opts.mode === "duel";
    const g = { score: 0, over: false, grid: new Array(N * N).fill(0), tray: [], next: 0, combo: 0, drag: null, R: null, fade: [], parts: [], pops: [], shake: 0, clock: 0 };
    function refill() { g.tray = [pieceAt(seed, g.next), pieceAt(seed, g.next + 1), pieceAt(seed, g.next + 2)]; g.next += 3; }
    refill();
    const fits = (p, gx, gy) => p.cells.every(([cx, cy]) => { const x = gx + cx, y = gy + cy; return x >= 0 && y >= 0 && x < N && y < N && !g.grid[y * N + x]; });
    const anyFit = p => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (fits(p, x, y)) return true; return false; };
    function layout(R) {
      const cs = Math.floor(Math.min((R.w - 28) / N, (R.h * 0.64) / N));
      const trayH = cs * 3.4, total = cs * N + 18 + trayH;
      const bx = Math.round(R.x + (R.w - cs * N) / 2), by = Math.round(R.y + Math.max(10, (R.h - total) / 2));
      return { cs, bx, by, ty: by + cs * N + 18, trayH };
    }
    function place(p, gx, gy) {
      for (const [cx, cy] of p.cells) g.grid[(gy + cy) * N + gx + cx] = p.color;
      p.used = true;
      let gain = p.cells.length;
      const rows = [], cols = [];
      for (let y = 0; y < N; y++) { let f = true; for (let x = 0; x < N; x++) if (!g.grid[y * N + x]) { f = false; break; } if (f) rows.push(y); }
      for (let x = 0; x < N; x++) { let f = true; for (let y = 0; y < N; y++) if (!g.grid[y * N + x]) { f = false; break; } if (f) cols.push(x); }
      const L = rows.length + cols.length;
      const L0 = layout(g.R);
      if (L) {
        g.combo++;
        const clear = new Set();
        rows.forEach(y => { for (let x = 0; x < N; x++) clear.add(y * N + x); });
        cols.forEach(x => { for (let y = 0; y < N; y++) clear.add(y * N + x); });
        for (const i of clear) {
          const x = i % N, y = (i / N) | 0;
          g.fade.push({ x, y, c: COLORS[g.grid[i] - 1], life: 0.35 });
          K.parts.burst(g.parts, L0.bx + (x + 0.5) * L0.cs, L0.by + (y + 0.5) * L0.cs, COLORS[g.grid[i] - 1], 3, 140);
          g.grid[i] = 0;
        }
        gain += 80 * L + 40 * L * (L - 1) + (g.combo > 1 ? 50 * (g.combo - 1) : 0);
        K.pops.add(g.pops, (L > 1 ? L + " ÇİZGİ! " : "") + "+" + (gain - p.cells.length) + (g.combo > 1 ? "  KOMBO ×" + g.combo : ""), L0.bx + L0.cs * 4, L0.by + L0.cs * 3.5, "#ffd34d", L > 1);
        SFX.arp(L > 1 ? [0, 4, 7, 12] : [0, 7], 0.06, 0.6); SFX.chime(Math.min(10, 2 + g.combo)); buzz(20);
        g.shake = Math.min(1, 0.25 + L * 0.15);
      } else { g.combo = 0; SFX.place(); }
      g.score += gain;
      if (g.tray.every(t => t.used)) refill();
      const live = g.tray.filter(t => !t.used);
      if (!live.some(anyFit)) {
        if (duel) {
          for (let i = 0; i < N * N; i++) if (g.grid[i]) g.fade.push({ x: i % N, y: (i / N) | 0, c: COLORS[g.grid[i] - 1], life: 0.5 });
          g.grid.fill(0); g.combo = 0;
          K.pops.add(g.pops, "YER KALMADI — TAHTA TEMİZLENDİ", L0.bx + L0.cs * 4, L0.by + L0.cs * 4, "#ff6b78");
          SFX.crash();
        } else { g.over = true; SFX.crash(); }
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
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: g.combo > 1 ? "KOMBO ×" + g.combo : "" }; },
      update(dt) {
        g.clock += dt; g.shake = Math.max(0, g.shake - dt * 2.5);
        for (const f of g.fade) f.life -= dt; g.fade = g.fade.filter(f => f.life > 0);
        K.parts.update(g.parts, dt); K.pops.update(g.pops, dt);
      },
      pointer(type, x, y) {
        if (!g.R || g.over) return;
        if (type === "down") { const i = trayHit(x, y); if (i >= 0) { g.drag = { i, x, y }; SFX.pop(true); } }
        else if (type === "move" && g.drag) { g.drag.x = x; g.drag.y = y; }
        else if ((type === "up" || type === "cancel") && g.drag) {
          const t = dragTarget(), p = g.tray[g.drag.i];
          g.drag = null;
          if (type === "up" && t.ok) place(p, t.gx, t.gy);
          else if (type === "up") SFX.pop(false);
        }
      },
      net() { return { g: g.grid.join("") }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        K.bg(ctx, R, "#1d2340", "#0f1326");
        const L = layout(R), cs = L.cs;
        if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 8 * g.shake, (Math.random() - 0.5) * 8 * g.shake);
        ctx.fillStyle = "rgba(255,255,255,0.05)"; rr(ctx, L.bx - 8, L.by - 8, cs * N + 16, cs * N + 16, 12); ctx.fill();
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const v = g.grid[y * N + x];
          if (v) cell(ctx, L.bx + x * cs, L.by + y * cs, cs, COLORS[v - 1]);
          else { ctx.fillStyle = (x + y) % 2 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)"; rr(ctx, L.bx + x * cs + 1, L.by + y * cs + 1, cs - 2, cs - 2, cs * 0.16); ctx.fill(); }
        }
        // sürüklenen parçanın gölgesi ve dolacak çizgiler
        let t = null;
        if (g.drag) {
          t = dragTarget();
          if (t.ok) {
            const p = g.tray[g.drag.i];
            for (const [cx, cy] of p.cells) cell(ctx, L.bx + (t.gx + cx) * cs, L.by + (t.gy + cy) * cs, cs, COLORS[p.color - 1], 0.35);
          }
        }
        for (const f of g.fade) { const k = f.life / 0.35; cell(ctx, L.bx + f.x * cs + cs * (1 - k) / 2, L.by + f.y * cs + cs * (1 - k) / 2, cs * k, f.c, k); }
        // tepsi
        const sw = R.w / 3;
        for (let i = 0; i < 3; i++) {
          const p = g.tray[i]; if (p.used || (g.drag && g.drag.i === i)) continue;
          const s = Math.min(cs * 0.6, (sw - 20) / Math.max(p.w, 3), (L.trayH - 10) / Math.max(p.h, 3));
          const ox = R.x + sw * i + (sw - p.w * s) / 2, oy = L.ty + (L.trayH - p.h * s) / 2;
          const fitsAny = anyFit(p);
          for (const [cx, cy] of p.cells) cell(ctx, ox + cx * s, oy + cy * s, s, fitsAny ? COLORS[p.color - 1] : "#555a6b");
        }
        if (g.drag) {
          const p = g.tray[g.drag.i];
          for (const [cx, cy] of p.cells) cell(ctx, t.ax + cx * cs, t.ay + cy * cs, cs, COLORS[p.color - 1], 0.92);
        }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, Math.max(0.8, cs / 40));
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#1d2340", "#0f1326");
    const cs = Math.floor(Math.min((R.w - 20) / N, (R.h - 16) / N)), bx = R.x + (R.w - cs * N) / 2, by = R.y + (R.h - cs * N) / 2;
    const s = d && typeof d.g === "string" ? d.g : "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = +s[y * N + x] || 0;
      if (v) cell(ctx, bx + x * cs, by + y * cs, cs, COLORS[(v - 1) % COLORS.length]);
      else { ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(bx + x * cs + 1, by + y * cs + 1, cs - 2, cs - 2); }
    }
  }
  K.register({
    id: "blok", name: "Blok Yerleştir", color: "#3d8bff", desc: "Parçaları tahtaya sürükle, dolan satır ve sütunları patlat.",
    rules: "Parçayı sürükle bırak · satır/sütun doldur · kombo yap",
    timeLimit: mode => (mode === "duel" ? 60 : null),
    create, drawRemote,
  });
})();
