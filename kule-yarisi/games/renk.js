// Renk Sıralama: tüplerdeki topları her tüpte tek renk kalacak şekilde diz.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const CAP = 4;
  const COLORS = ["#ff5a4e", "#f4b400", "#2bb673", "#3d8bff", "#a46bff", "#ff7ab8", "#1fc2b0", "#ff9a3d"];
  function genLevel(seed, lvl) {
    const c = Math.min(3 + lvl, COLORS.length);
    const rand = K.rng(((seed ^ (lvl * 2654435761)) | 0) + lvl);
    let tubes;
    for (let attempt = 0; attempt < 30; attempt++) {
      const balls = [];
      for (let i = 0; i < c; i++) for (let k = 0; k < CAP; k++) balls.push(i);
      for (let i = balls.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [balls[i], balls[j]] = [balls[j], balls[i]]; }
      tubes = [];
      for (let i = 0; i < c; i++) tubes.push(balls.slice(i * CAP, i * CAP + CAP));
      tubes.push([], []);
      const done = tubes.filter(t => t.length === CAP && t.every(b => b === t[0])).length;
      if (done === 0) break;
    }
    return tubes;
  }
  const complete = t => t.length === CAP && t.every(b => b === t[0]);

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, lvl: 0, tubes: genLevel(seed, 0), sel: -1, doneSet: new Set(), wait: 0, R: null, pops: [], parts: [], shakeT: -1, shake: 0, clock: 0, moves: 0 };
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
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: "BÖLÜM " + (g.lvl + 1) }; },
      update(dt) {
        g.clock += dt; g.shake = Math.max(0, g.shake - dt * 4);
        if (g.wait > 0) { g.wait -= dt; if (g.wait <= 0) { g.lvl++; g.tubes = genLevel(seed, g.lvl); g.doneSet = new Set(); g.sel = -1; } }
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (type !== "down" || !g.R || g.over) return;
        const L = layout(g.R);
        L.pos.forEach((p, i) => { if (x >= p.x - 10 && x <= p.x + p.w + 10 && y >= p.y - L.tw * 1.4 && y <= p.y + p.h + 10) tap(i); });
      },
      net() { return { l: g.lvl, t: g.tubes.map(t => t.join("")).join(",") }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        K.bg(ctx, R, "#123a3a", "#0b1a20");
        const L = layout(R);
        txt(ctx, "BÖLÜM " + (g.lvl + 1), R.x + R.w / 2, R.y + 26, 18, "rgba(255,255,255,0.7)", { ls: "3px" });
        g.tubes.forEach((t, i) => {
          const p = L.pos[i], sx = g.shakeT === i ? Math.sin(g.clock * 50) * 5 * g.shake : 0, done = g.doneSet.has(i);
          // tüp
          ctx.fillStyle = "rgba(255,255,255,0.08)"; rr(ctx, p.x + sx, p.y, p.w, p.h, [4, 4, p.w / 2, p.w / 2]); ctx.fill();
          ctx.strokeStyle = done ? "#ffd34d" : "rgba(255,255,255,0.35)"; ctx.lineWidth = 2; rr(ctx, p.x + sx, p.y, p.w, p.h, [4, 4, p.w / 2, p.w / 2]); ctx.stroke();
          ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(p.x + sx + p.w * 0.18, p.y + 6, p.w * 0.1, p.h - 20);
          t.forEach((b, k) => {
            let bx = p.x + sx + p.w / 2, by = p.y + p.h - L.br - 6 - k * (L.br * 2 + 2);
            if (i === g.sel && k === t.length - 1) by = p.y - L.br - 8 + Math.sin(g.clock * 8) * 3;
            K.ball(ctx, bx, by, L.br, COLORS[b]);
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
      t.split("").forEach((b, k) => K.ball(ctx, x + tw / 2, y + th - br - 4 - k * (br * 2 + 1), br, COLORS[+b % COLORS.length]));
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
