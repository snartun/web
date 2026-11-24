// Renk Sıralama: tüplerdeki topları her tüpte tek renk kalacak şekilde diz.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const CAP = 4;
  // Okabe–Ito tabanlı, renk körü dostu palet + her renge bir sembol
  const COLORS = ["#D55E00", "#E69F00", "#009E73", "#0072B2", "#a46bff", "#CC79A7", "#56B4E9", "#F0E442"];
  function glyph(ctx, x, y, r, k) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = Math.max(1.5, r * 0.18);
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
  function ballG(ctx, x, y, r, k) { K.ball(ctx, x, y, r, COLORS[k]); glyph(ctx, x, y + r * 0.05, r, k); }
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
    const g = { score: 0, over: false, lvl: 0, tubes: genLevel(seed, 0), sel: -1, doneSet: new Set(), wait: 0, R: null, pops: [], parts: [], shakeT: -1, shake: 0, clock: 0, moves: 0, hist: [], undos: 5 };
    function layout(R) {
      const n = g.tubes.length, rows = n > 6 ? 2 : 1, per = Math.ceil(n / rows);
      const tw = Math.min(64, (R.w - 24) / (per * 1.35));
      const th = tw * (CAP + 0.7);
      const rowGap = tw * 1.3;
      const totalH = rows * th + (rows - 1) * rowGap;
      const y0 = R.y + Math.max(70, (R.h - totalH) / 2 + 20);
      const pos = [];
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, n - row * per);
        const gap = (R.w - inRow * tw) / (inRow + 1);
        pos.push({ x: R.x + gap + col * (tw + gap), y: y0 + row * (th + rowGap), w: tw, h: th });
      }
      return { pos, tw, th, br: tw * 0.36 };
    }
    function tap(i) {
      if (g.wait > 0) return;
      const t = g.tubes;
      if (g.sel < 0) { if (t[i].length && !g.doneSet.has(i)) { g.sel = i; SFX.pop(true); } return; }
      if (g.sel === i) { g.sel = -1; SFX.pop(false); return; }
      const src = t[g.sel], dst = t[i], c = src[src.length - 1];
      let run = 0; for (let k = src.length - 1; k >= 0 && src[k] === c; k--) run++;
      const space = CAP - dst.length;
      if (space === 0 || (dst.length && dst[dst.length - 1] !== c)) { g.shakeT = g.sel; g.shake = 1; g.sel = -1; SFX.buzz(); return; }
      const m = Math.min(run, space);
      g.hist.push({ from: g.sel, to: i, m });
      for (let k = 0; k < m; k++) dst.push(src.pop());
      g.sel = -1; g.moves++;
      SFX.pop(false);
      if (complete(dst) && !g.doneSet.has(i)) {
        g.doneSet.add(i); g.score += 20;
        const L = layout(g.R), p = L.pos[i];
        K.parts.burst(g.parts, p.x + p.w / 2, p.y, COLORS[c], 14, 160);
        K.pops.add(g.pops, "+20", p.x + p.w / 2, p.y - 12, "#ffffff");
        SFX.chime(4 + g.doneSet.size); buzz(12);
      }
      const colorsN = g.tubes.length - 2;
      if (g.doneSet.size === colorsN) {
        const bonus = 100 + g.lvl * 20; g.score += bonus;
        K.pops.add(g.pops, "BÖLÜM " + (g.lvl + 1) + " TAMAM!  +" + bonus, g.R.x + g.R.w / 2, g.R.y + 40, "#ffd34d", true);
        SFX.milestone(); buzz(25);
        g.wait = 0.9;
      }
    }
    const undoBtn = R => ({ x: R.x + R.w - 128, y: R.y + 10, w: 116, h: 40 });
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: "BÖLÜM " + (g.lvl + 1) }; },
      update(dt) {
        g.clock += dt; g.shake = Math.max(0, g.shake - dt * 4);
        if (g.wait > 0) { g.wait -= dt; if (g.wait <= 0) { g.lvl++; g.tubes = genLevel(seed, g.lvl); g.doneSet = new Set(); g.sel = -1; g.hist = []; g.undos = 5; } }
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (type !== "down" || !g.R || g.over) return;
        const L = layout(g.R), u = undoBtn(g.R);
        if (x >= u.x && x <= u.x + u.w && y >= u.y && y <= u.y + u.h) {
          const h = g.hist.pop();
          if (!h || g.undos <= 0 || g.wait > 0) { SFX.buzz(); if (h) g.hist.push(h); return; }
          for (let k = 0; k < h.m; k++) g.tubes[h.from].push(g.tubes[h.to].pop());
          g.doneSet.delete(h.to); g.undos--; g.sel = -1; SFX.whoosh(); return;
        }
        L.pos.forEach((p, i) => { if (x >= p.x - 10 && x <= p.x + p.w + 10 && y >= p.y - L.tw * 1.4 && y <= p.y + p.h + 10) tap(i); });
      },
      net() { return { l: g.lvl, t: g.tubes.map(t => t.join("")).join(",") }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        K.bg(ctx, R, "#123a3a", "#0b1a20");
        const L = layout(R);
        txt(ctx, "BÖLÜM " + (g.lvl + 1), R.x + 16, R.y + 30, 18, "rgba(255,255,255,0.75)", { ls: "3px", align: "left" });
        const u = undoBtn(R);
        ctx.fillStyle = g.undos > 0 && g.hist.length ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"; rr(ctx, u.x, u.y, u.w, u.h, 10); ctx.fill();
        txt(ctx, "↶ GERİ AL (" + g.undos + ")", u.x + u.w / 2, u.y + u.h / 2 + 1, 15, g.undos > 0 && g.hist.length ? "#fff" : "rgba(255,255,255,0.4)", { ls: "0.5px" });
        g.tubes.forEach((t, i) => {
          const p = L.pos[i], sx = g.shakeT === i ? Math.sin(g.clock * 50) * 5 * g.shake : 0, done = g.doneSet.has(i);
          // tüp
          ctx.fillStyle = "rgba(255,255,255,0.08)"; rr(ctx, p.x + sx, p.y, p.w, p.h, [4, 4, p.w / 2, p.w / 2]); ctx.fill();
          ctx.strokeStyle = done ? "#ffd34d" : "rgba(255,255,255,0.35)"; ctx.lineWidth = 2; rr(ctx, p.x + sx, p.y, p.w, p.h, [4, 4, p.w / 2, p.w / 2]); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(p.x + sx + p.w * 0.18, p.y + 6, p.w * 0.1, p.h - 20);
          t.forEach((b, k) => {
            let bx = p.x + sx + p.w / 2, by = p.y + p.h - L.br - 6 - k * (L.br * 2 + 2);
            if (i === g.sel && k === t.length - 1) by = p.y - L.br - 8 + Math.sin(g.clock * 8) * 3;
            ballG(ctx, bx, by, L.br, b);
          });
          if (done) { ctx.fillStyle = "#ffd34d"; rr(ctx, p.x + sx - 3, p.y - 6, p.w + 6, 7, 3); ctx.fill(); }
        });
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#123a3a", "#0b1a20");
    const tubes = d && typeof d.t === "string" ? d.t.split(",") : [];
    const n = Math.max(1, tubes.length), tw = Math.min(30, (R.w - 20) / (n * 1.4)), th = tw * (CAP + 0.6), br = tw * 0.36;
    const gap = (R.w - n * tw) / (n + 1), y = R.y + (R.h - th) / 2 + 8;
    tubes.forEach((t, i) => {
      const x = R.x + gap + i * (tw + gap);
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5; rr(ctx, x, y, tw, th, [3, 3, tw / 2, tw / 2]); ctx.stroke();
      t.split("").forEach((b, k) => ballG(ctx, x + tw / 2, y + th - br - 4 - k * (br * 2 + 1), br, +b % COLORS.length));
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
