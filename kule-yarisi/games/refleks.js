// Refleks: ekran yeşile döner dönmez dokun. 5 tur; erken dokunan o turdan puan alamaz.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const ROUNDS = 5;
  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, k: 0, st: "wait", t: 0, delay: 0, rt: [], msg: "", R: null, pops: [], parts: [], clock: 0, started: false };
    const newRound = () => { g.st = "wait"; g.t = 0; g.delay = 1.3 + hash(seed, g.k * 7 + 3) * 2.4; };
    newRound();
    function finish(rt, early) {
      g.rt.push(early ? -1 : rt);
      const pts = early ? 0 : Math.max(0, Math.round(1000 - rt));
      g.score += pts;
      g.st = "show"; g.t = 0;
      g.msg = early ? "ERKEN!" : rt >= 1000 ? "ÇOK GEÇ" : Math.round(rt) + " ms";
      const R = g.R;
      if (R) K.pops.add(g.pops, early ? "0" : "+" + pts, R.x + R.w / 2, R.y + R.h * 0.62, early ? "#ff9aa4" : "#ffd34d", !early && rt < 250);
      if (early) { SFX.buzz(); buzz([50, 30, 50]); }
      else { SFX.chime(rt < 220 ? 10 : rt < 300 ? 7 : rt < 400 ? 4 : 1); buzz(15); if (R) K.parts.burst(g.parts, R.x + R.w / 2, R.y + R.h * 0.42, "#ffffff", 18, 220); }
    }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { const v = g.rt.filter(x => x > 0 && x < 1000); return { extra: "TUR " + Math.min(ROUNDS, g.k + 1) + "/" + ROUNDS + (v.length ? " · ort. " + Math.round(v.reduce((a, b) => a + b, 0) / v.length) + " ms" : "") }; },
      update(dt, active) {
        g.clock += dt;
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
        if (!active || g.over) return;
        g.t += dt;
        if (g.st === "wait" && g.t >= g.delay) { g.st = "go"; g.t = 0; g.goAt = performance.now(); SFX.beep(true); }
        else if (g.st === "go" && g.t >= 1.0) finish(1000, false);
        else if (g.st === "show" && g.t >= 1.1) { g.k++; if (g.k >= ROUNDS) { g.over = true; } else newRound(); }
      },
      pointer(type) {
        if (type !== "down" || g.over) return;
        if (g.st === "wait") finish(0, true);
        else if (g.st === "go") { const rt = performance.now() - g.goAt; if (rt < 100) finish(0, true); else finish(rt, false); } // <100 ms: tahmin sayılır (atletizm kuralı)
      },
      net() { return { k: g.k, r: g.rt.slice() }; },
      draw(ctx, R, active) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        const st = active ? g.st : "idle";
        const bgc = st === "go" ? ["#18c964", "#0d8a43"] : st === "wait" ? ["#b3263a", "#6d1222"] : ["#1d2233", "#11141f"];
        K.bg(ctx, R, bgc[0], bgc[1]);
        const cx = R.x + R.w / 2, cy = R.y + R.h * 0.42, rad = Math.min(R.w, R.h) * 0.26;
        const pulse = st === "wait" ? 1 + Math.sin(g.clock * 3) * 0.03 : st === "go" ? 1.08 : 1;
        ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.arc(cx, cy, rad * pulse * 1.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.arc(cx, cy, rad * pulse, 0, Math.PI * 2); ctx.fill();
        const big = Math.round(Math.min(64, R.w / 6));
        if (st === "wait") { txt(ctx, "BEKLE…", cx, cy, big, "#ffffff", { f: K.DISP, w: "400" }); txt(ctx, "Yeşil olunca dokun", cx, cy + big * 0.9, 18, "rgba(255,255,255,0.8)", { w: "700" }); }
        else if (st === "go") txt(ctx, "DOKUN!", cx, cy, Math.round(big * 1.2), "#ffffff", { f: K.DISP, w: "400" });
        else if (st === "show") txt(ctx, g.msg, cx, cy, big, g.msg === "ERKEN!" ? "#ff9aa4" : "#ffffff", { f: K.DISP, w: "400" });
        else if (g.over) {
          const v = g.rt.filter(x => x > 0 && x < 1000), avg = v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
          const label = !avg ? "—" : avg < 200 ? "ŞİMŞEK GİBİ" : avg < 240 ? "ÇOK HIZLI" : avg < 280 ? "ORTALAMANIN ÜSTÜ" : avg < 330 ? "ORTALAMA" : "BİRAZ YAVAŞ";
          txt(ctx, avg ? avg + " ms" : "—", cx, cy - big * 0.3, big, "#ffffff", { f: K.DISP, w: "400" });
          txt(ctx, label, cx, cy + big * 0.55, 22, "#ffd34d", { ls: "2px" });
          txt(ctx, "İnsanların ortanca değeri ≈ 273 ms", cx, cy + big * 0.55 + 28, 15, "rgba(255,255,255,0.7)", { w: "600" });
        } else txt(ctx, "HAZIR OL", cx, cy, big, "#ffffff", { f: K.DISP, w: "400" });
        // tur geçmişi
        const bw = Math.min(64, (R.w - 40) / ROUNDS - 8), y = R.y + R.h - 64;
        for (let i = 0; i < ROUNDS; i++) {
          const x = cx - (ROUNDS * (bw + 8)) / 2 + i * (bw + 8) + 4, v = g.rt[i];
          ctx.fillStyle = v == null ? "rgba(255,255,255,0.12)" : v < 0 ? "rgba(255,90,110,0.85)" : "rgba(255,255,255,0.9)"; rr(ctx, x, y, bw, 40, 8); ctx.fill();
          txt(ctx, v == null ? String(i + 1) : v < 0 ? "ERKEN" : v >= 1000 ? "—" : Math.round(v) + "", x + bw / 2, y + 21, v == null ? 16 : 15, v == null ? "rgba(255,255,255,0.6)" : "#1b1d2a", { w: "800" });
        }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1.2);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#1d2233", "#11141f");
    const r = d && Array.isArray(d.r) ? d.r : [], n = 5, bw = Math.min(56, (R.w - 30) / n - 6), y = R.y + R.h / 2 - 18;
    for (let i = 0; i < n; i++) {
      const x = R.x + R.w / 2 - (n * (bw + 6)) / 2 + i * (bw + 6) + 3, v = r[i];
      ctx.fillStyle = v == null ? "rgba(255,255,255,0.12)" : v < 0 ? "rgba(255,90,110,0.85)" : "rgba(255,255,255,0.9)"; rr(ctx, x, y, bw, 36, 7); ctx.fill();
      txt(ctx, v == null ? String(i + 1) : v < 0 ? "ERKEN" : v >= 1000 ? "—" : Math.round(v) + "", x + bw / 2, y + 19, 14, v == null ? "rgba(255,255,255,0.6)" : "#1b1d2a", { w: "800" });
    }
  }
  K.register({
    id: "refleks", name: "Refleks", color: "#18c964", desc: "Ekran yeşile döner dönmez dokun. 5 tur, en hızlı kazanır.",
    rules: "Kırmızıda bekle · yeşilde hemen dokun · erken dokunma",
    timeLimit: () => null,
    create, drawRemote,
  });
})();
