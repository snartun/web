// Refleks: ekran yeşile döner dönmez dokun. 5 tur; erken dokunan o turdan puan alamaz.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const ROUNDS = 5;
  const backOut = t => { t = clamp(t, 0, 1) - 1; return 1 + 2.70158 * t * t * t + 1.70158 * t * t; };
  // derece: süreye göre etiket + renk
  const grade = v => v < 0 ? ["ERKEN!", "#ff5a6e"] : v >= 1000 ? ["ÇOK GEÇ", "#ff9aa4"] : v < 200 ? ["ŞİMŞEK!", "#7df9ff"] : v < 250 ? ["MÜKEMMEL", "#ffd34d"] : v < 300 ? ["HARİKA", "#5be38a"] : v < 400 ? ["İYİ", "#8ab4ff"] : ["YAVAŞ", "#c9ced9"];

  // ---------- önbellekli sahne arka planları (durum başına bir kez çizilir) ----------
  const SPR = new Map();
  function spr(key, w, h, fn) {
    const d = Math.min(2, window.devicePixelRatio || 1); key += "@" + d;
    let c = SPR.get(key);
    if (!c) {
      c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w * d)); c.height = Math.max(1, Math.ceil(h * d)); c.cw = w; c.ch = h;
      const x = c.getContext("2d"); x.scale(d, d); fn(x, w, h);
      if (SPR.size > 40) SPR.clear();
      SPR.set(key, c);
    }
    return c;
  }
  // [merkez, kenar, ışık]
  const STAGE = { idle: ["#262d42", "#0c0f18", "rgba(140,160,255,0.10)"], wait: ["#b8283f", "#4a0b17", "rgba(255,120,130,0.14)"], go: ["#1fc466", "#0a6131", "rgba(220,255,200,0.20)"], res: ["#232a3d", "#0b0e17", "rgba(140,200,255,0.08)"], early: ["#5a1420", "#16050a", "rgba(255,80,90,0.10)"] };
  function stage(kind, w, h) {
    return spr("st" + kind + w + "x" + h, w, h, (c) => {
      const S = STAGE[kind], cx = w / 2, cy = h * 0.42, big = Math.hypot(w, h) * 0.62;
      let g = c.createRadialGradient(cx, cy, 0, cx, cy, big);
      g.addColorStop(0, S[0]); g.addColorStop(1, S[1]);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // hedef tahtası gibi ince eş merkezli halkalar (derinlik)
      c.strokeStyle = "rgba(255,255,255,0.035)"; c.lineWidth = 1;
      for (let r = 40; r < big; r += 34) { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); }
      g = c.createRadialGradient(cx, -h * 0.1, 0, cx, -h * 0.1, h * 0.7);
      g.addColorStop(0, S[2]); g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // ince gren
      const rnd = K.rng(5);
      for (let i = 0; i < 900; i++) { c.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.05)"; c.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
      g = c.createRadialGradient(cx, h * 0.45, Math.min(w, h) * 0.35, cx, h * 0.45, big * 0.95);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.5)");
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    });
  }
  function glow(col) {
    return spr("gl" + col, 64, 64, (c) => {
      const g = c.createRadialGradient(32, 32, 0, 32, 32, 32), rgb = K.hex(col);
      g.addColorStop(0, K.css(rgb, 0.55)); g.addColorStop(0.45, K.css(rgb, 0.2)); g.addColorStop(1, K.css(rgb, 0));
      c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    });
  }
  // tur çipi: cam kapsül, sonuç gelince alttan renkli sıvıyla dolar
  function chip(ctx, x, y, w, h, i, v, fill, cur, best, pulse) {
    ctx.fillStyle = "rgba(0,0,0,0.3)"; rr(ctx, x, y + 3, w, h, 10); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.07)"; rr(ctx, x, y, w, h, 10); ctx.fill();
    if (v != null && fill > 0) {
      const col = grade(v)[1], fh = h * fill;
      ctx.save(); rr(ctx, x, y, w, h, 10); ctx.clip();
      ctx.fillStyle = col; ctx.globalAlpha = v < 0 ? 0.85 : 0.92; ctx.fillRect(x, y + h - fh, w, fh);
      ctx.globalAlpha = 1; ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
      if (fill < 1) { ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(x, y + h - fh, w, 2); }
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,255,255,0.16)"; rr(ctx, x + 3, y + 2, w - 6, h * 0.38, [8, 8, 3, 3]); ctx.fill();
    ctx.lineWidth = best ? 2.5 : cur ? 2 : 1;
    ctx.strokeStyle = best ? "#ffd34d" : cur ? "rgba(255,255,255," + (0.45 + 0.35 * pulse) + ")" : "rgba(255,255,255,0.16)";
    rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 10); ctx.stroke();
    const filled = v != null && fill > 0.5;
    const s = !filled ? String(i + 1) : v < 0 ? "ERKEN" : v >= 1000 ? "—" : Math.round(v) + "";
    txt(ctx, s, x + w / 2, y + h / 2 + 1, filled ? (v < 0 ? Math.min(15, w * 0.26) : 16) : 16, filled ? "#141623" : "rgba(255,255,255,0.55)", { w: "800" });
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, k: 0, st: "wait", t: 0, delay: 0, rt: [], msg: "", R: null, pops: [], parts: [], clock: 0, started: false,
      // görsel durum
      tap: null, showAt: 0, goAt2: 0, chipAt: [], crack: null, bgK: "idle", bgP: "idle", bgAt: -9, last: 0 };
    const newRound = () => { g.st = "wait"; g.t = 0; // bekleme: sabit 1,4 sn + üstel (belleksiz) rastgele kısım (ort. 1,3 sn, en çok 5,6 sn). Eşit dağılımda
    // ~3,5 sn'den sonra yeşil "kesin" gelir ve tahminle basılabilir; üstelde ne kadar beklersen bekle tahmin edemezsin.
    g.delay = 1.4 + Math.min(4.2, -1.3 * Math.log(1 - hash(seed, g.k * 7 + 3) * 0.999)); };
    newRound();
    // erken dokunuşta dokunulan noktadan yayılan cam çatlağı
    function mkCrack(x, y, R) {
      const L = [], n = 7 + ((Math.random() * 3) | 0), maxL = Math.max(R.w, R.h) * 0.55;
      for (let i = 0; i < n; i++) {
        let a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.6, px = x, py = y, len = maxL * (0.4 + Math.random() * 0.6);
        const pts = [[px, py]], segs = 5 + ((Math.random() * 4) | 0);
        for (let s = 0; s < segs; s++) {
          a += (Math.random() - 0.5) * 0.7; const sl = (len / segs) * (0.6 + Math.random() * 0.8);
          px += Math.cos(a) * sl; py += Math.sin(a) * sl; pts.push([px, py]);
          if (Math.random() < 0.3) { const b = a + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6), bl = sl * (0.8 + Math.random()); L.push({ p: [[px, py], [px + Math.cos(b) * bl, py + Math.sin(b) * bl]], d: (s + 1) / segs }); }
        }
        L.push({ p: pts, d: 0 });
      }
      // merkezde örümcek ağı halkası
      const ring = []; for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 2, r = 16 + Math.random() * 10; ring.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      L.push({ p: ring, d: 0.1 });
      return L;
    }
    function finish(rt, early) {
      g.rt.push(early ? -1 : rt);
      const pts = early ? 0 : Math.max(0, Math.round(1000 - rt));
      g.score += pts;
      g.st = "show"; g.t = 0;
      g.msg = early ? "ERKEN!" : rt >= 1000 ? "ÇOK GEÇ" : Math.round(rt) + " ms";
      const R = g.R, tp = g.tap; g.tap = null;
      g.showAt = g.clock; g.chipAt[g.rt.length - 1] = g.clock; g.last = early ? -1 : rt; g.crack = null;
      const miss = early || rt >= 1000; // erken ya da süre doldu: ödül değil, ceza geri bildirimi
      if (R) K.pops.add(g.pops, miss ? "0" : "+" + pts, R.x + R.w / 2, R.y + R.h * 0.62, miss ? "#ff9aa4" : "#ffd34d", !miss && rt < 250);
      if (early) {
        SFX.buzz(); buzz([50, 30, 50]); K.play("glass", { vol: 0.45, rate: 1.15 });
        K.kick(0.42);
        if (R) { const x = tp ? tp.x : R.x + R.w / 2, y = tp ? tp.y : R.y + R.h * 0.42; g.crack = { L: mkCrack(x, y, R), x, y }; K.parts.spark(g.parts, x, y, "#ffd0d4", 16, 320); K.parts.burst(g.parts, x, y, "rgba(255,220,225,0.9)", 10, 200); }
      } else {
        if (rt >= 1000) { SFX.buzz(); buzz([30, 20, 30]); } else { SFX.chime(rt < 220 ? 10 : rt < 300 ? 7 : rt < 400 ? 4 : 1); buzz(15); }
        const col = grade(rt)[1];
        if (R) {
          const cx = R.x + R.w / 2, cy = R.y + R.h * 0.42;
          K.parts.burst(g.parts, cx, cy, col, rt < 300 ? 22 : 12, 240);
          K.parts.ring(g.parts, cx, cy, col, Math.min(R.w, R.h) * 0.5, 5);
          if (tp) { K.parts.ring(g.parts, tp.x, tp.y, "#ffffff", 70, 4); K.parts.spark(g.parts, tp.x, tp.y, "#ffffff", 14, 300); }
        }
        if (rt < 1000) K.kick(rt < 220 ? 0.3 : rt < 300 ? 0.2 : 0.12);
        if (rt < 250) K.hitstop(0.05); // sonuç ekranında: ölçülen süreyi etkilemez
        if (R && rt < 220) K.parts.confetti(g.parts, R.x + R.w / 2, R.y + R.h * 0.42, 26, 420);
      }
    }
    const stats = () => { const v = g.rt.filter(x => x > 0 && x < 1000); return { v, avg: v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0, best: v.length ? Math.min(...v) : 0 }; };
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { const v = g.rt.filter(x => x > 0 && x < 1000); return { extra: "TUR " + Math.min(ROUNDS, g.k + 1) + "/" + ROUNDS + (v.length ? " · ort. " + Math.round(v.reduce((a, b) => a + b, 0) / v.length) + " ms" : "") }; },
      update(dt, active) {
        g.clock += dt;
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
        if (!active || g.over) return;
        g.t += dt;
        if (g.st === "wait" && g.t >= g.delay) {
          // goAt burada yalnızca yedek; asıl ölçüm başlangıcı yeşilin ilk çizildiği karede (draw sonunda) yazılır
          g.st = "go"; g.t = 0; g.goAt = performance.now(); g.goShown = false; SFX.beep(true);
          g.goAt2 = g.clock; const R = g.R; if (R) { const cx = R.x + R.w / 2, cy = R.y + R.h * 0.42; K.parts.ring(g.parts, cx, cy, "#ffffff", Math.min(R.w, R.h) * 0.6, 6); K.parts.spark(g.parts, cx, cy, "#eaffd8", 18, 380); }
        }
        else if (g.st === "go" && g.t >= 1.0) finish(1000, false);
        else if (g.st === "show" && g.t >= 1.1) { g.k++; if (g.k >= ROUNDS) { g.over = true; } else newRound(); }
      },
      pointer(type, x, y) {
        if (type !== "down" || g.over) return;
        if (x != null && (g.st === "wait" || g.st === "go")) g.tap = { x, y };
        if (g.st === "wait") finish(0, true);
        else if (g.st === "go") { const rt = performance.now() - g.goAt; if (rt < 100) finish(0, true); else finish(rt, false); } // <100 ms: tahmin sayılır (atletizm kuralı)
      },
      net() { return { k: g.k, r: g.rt.slice() }; },
      _g: g,
      draw(ctx, R, active) {
        g.R = R;
        // tüm sahne arka planlarını bu boyut için önceden üret (geri sayımda): yeşilin ilk karesi
        // tembel sprite üretimiyle gecikmesin (ilk turda ölçülen süreye ~30–50 ms ekleniyordu)
        const wk = R.w + "x" + R.h;
        if (g.warm !== wk) { g.warm = wk; for (const s in STAGE) stage(s, R.w, R.h); for (const v of [-1, 150, 220, 270, 350, 500, 1000]) glow(grade(v)[1]); }
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        const st = active ? g.st : "idle", T = g.clock;
        // arka plan: "go" anında anlık (ölçüm adil olsun); diğer geçişler 0,3 sn yumuşak (ani parlaklık sıçraması yok)
        const kind = st === "go" ? "go" : st === "wait" ? "wait" : st === "show" ? (g.last < 0 ? "early" : "res") : "idle";
        if (kind !== g.bgK) { g.bgP = g.bgK; g.bgK = kind; g.bgAt = kind === "go" ? -9 : T; }
        const fade = clamp((T - g.bgAt) / 0.3, 0, 1);
        if (fade < 1) ctx.drawImage(stage(g.bgP, R.w, R.h), R.x, R.y, R.w, R.h);
        ctx.globalAlpha = fade; ctx.drawImage(stage(kind, R.w, R.h), R.x, R.y, R.w, R.h); ctx.globalAlpha = 1;
        const cx = R.x + R.w / 2, cy = R.y + R.h * 0.42, rad = Math.min(R.w, R.h) * 0.26;
        const big = Math.round(Math.min(64, R.w / 6));
        if (st === "wait") {
          // gergin bekleyiş: içe doğru daralan halkalar + yavaş kalp atışı
          const hb = Math.pow(Math.max(0, Math.sin(T * 7)), 8) * 0.035;
          for (let j = 0; j < 3; j++) { const ph = ((T * 0.6 + j / 3) % 1), r = rad * (1.9 - ph * 0.85); ctx.strokeStyle = "rgba(255,200,205," + (0.16 * ph).toFixed(3) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
          ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.arc(cx, cy + 6, rad * (1 + hb), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.beginPath(); ctx.arc(cx, cy, rad * (1 + hb), 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 3; ctx.lineCap = "round";
          for (let j = 0; j < 3; j++) { const a = T * 1.6 + (j * Math.PI * 2) / 3; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.14, a, a + 1.2); ctx.stroke(); }
          ctx.lineCap = "butt";
          txt(ctx, "BEKLE…", cx, cy, big, "#ffffff", { f: K.DISP, w: "400", stroke: 6, strokeColor: "rgba(60,0,10,0.35)" });
          txt(ctx, "Yeşil olunca dokun", cx, cy + big * 0.9, 18, "rgba(255,255,255,0.8)", { w: "700" });
        } else if (st === "go") {
          const e = T - g.goAt2;
          // dönen ışık huzmeleri + merkezden yayılan halkalar (2,5 Hz; yanıp sönme yok)
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(T * 0.5); ctx.fillStyle = "rgba(255,255,255,0.07)";
          for (let j = 0; j < 12; j++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R.h, (j * Math.PI) / 6, (j * Math.PI) / 6 + 0.16); ctx.closePath(); ctx.fill(); }
          ctx.restore();
          for (let j = 0; j < 3; j++) { const ph = e - j * 0.4; if (ph < 0) continue; const q = (ph % 1.2) / 1.2; ctx.strokeStyle = "rgba(255,255,255," + (0.35 * (1 - q)).toFixed(3) + ")"; ctx.lineWidth = 4 * (1 - q) + 1; ctx.beginPath(); ctx.arc(cx, cy, rad * (1.05 + q * 1.6), 0, Math.PI * 2); ctx.stroke(); }
          const s = 0.7 + 0.3 * backOut(e / 0.14);
          ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
          ctx.fillStyle = "rgba(0,60,25,0.25)"; ctx.beginPath(); ctx.arc(0, 8, rad, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(20,160,80,0.12)"; ctx.beginPath(); ctx.arc(0, rad * 0.12, rad * 0.9, 0, Math.PI * 2); ctx.fill();
          txt(ctx, "DOKUN!", 0, 2, K.fit(ctx, "DOKUN!", rad * 1.6, Math.round(big * 1.2), K.DISP, "400"), "#0f9a4c", { f: K.DISP, w: "400" });
          ctx.restore();
        } else if (st === "show") {
          const e = T - g.showAt, v = g.last, [lab, col] = grade(v);
          if (v < 0) {
            // çatlak: dokunulan noktadan hızla yayılır, sonda söner
            const cr = g.crack, rev = clamp(e / 0.14, 0, 1), fa = 1 - clamp((e - 0.75) / 0.35, 0, 1);
            if (cr && fa > 0) {
              ctx.lineJoin = "round";
              for (const pass of [["rgba(0,0,0,0.55)", 3, 1], ["rgba(255,225,230,0.75)", 1.2, -0.6]]) {
                ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1]; ctx.globalAlpha = fa;
                for (const l of cr.L) {
                  const f = clamp((rev - l.d * 0.6) / 0.6, 0, 1); if (f <= 0) continue;
                  const n = l.p.length - 1, upto = f * n; ctx.beginPath(); ctx.moveTo(l.p[0][0] + pass[2], l.p[0][1] + pass[2]);
                  for (let i = 1; i <= Math.ceil(upto); i++) { const a = l.p[i - 1], b = l.p[i], u = Math.min(1, upto - (i - 1)); ctx.lineTo(a[0] + (b[0] - a[0]) * u + pass[2], a[1] + (b[1] - a[1]) * u + pass[2]); }
                  ctx.stroke();
                }
              }
              ctx.globalAlpha = 1;
            }
            // RGB kayması + kesik şeritler (kısa, yalnız yazı çevresinde)
            const gl = Math.exp(-e * 7), q = Math.floor(e * 12), jx = (hash(q, 11) - 0.5) * 18 * gl;
            const fs = Math.round(big * 1.05);
            ctx.save(); ctx.globalCompositeOperation = "lighter";
            txt(ctx, "ERKEN!", cx - 6 * gl - jx, cy, fs, "rgba(255,40,60,0.7)", { f: K.DISP, w: "400" });
            txt(ctx, "ERKEN!", cx + 6 * gl + jx, cy, fs, "rgba(40,220,255,0.55)", { f: K.DISP, w: "400" });
            ctx.restore();
            txt(ctx, "ERKEN!", cx, cy, fs, "#ffe3e6", { f: K.DISP, w: "400", stroke: 5, strokeColor: "rgba(40,0,8,0.5)" });
            if (gl > 0.15) for (let j = 0; j < 3; j++) {
              const by = cy - fs * 0.5 + hash(q, j + 3) * fs, bh = 3 + hash(q, j + 9) * 7, ox = (hash(q, j + 21) - 0.5) * 30 * gl;
              const bx = cx - R.w * 0.44 + hash(q, j + 33) * R.w * 0.1, bw2 = R.w * 0.78;
              ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw2, bh); ctx.clip();
              ctx.fillStyle = "rgba(60,0,10,0.85)"; ctx.fillRect(bx, by, bw2, bh);
              txt(ctx, "ERKEN!", cx + ox, cy, fs, "#ff9aa4", { f: K.DISP, w: "400" }); ctx.restore();
            }
            txt(ctx, "Yeşili bekle", cx, cy + big * 0.95, 18, "rgba(255,210,215,0.85)", { w: "700", a: clamp((e - 0.1) * 5, 0, 1) });
          } else {
            // süre ekrana "yumruk" gibi iner, ardından renkli derece etiketi kayarak gelir
            ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.9; ctx.drawImage(glow(col), cx - rad * 1.7, cy - rad * 1.7, rad * 3.4, rad * 3.4); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.02, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
            const s = e < 0.26 ? K.lerp(2.3, 1, backOut(e / 0.26)) : 1, num = v >= 1000 ? "—" : String(Math.round(v)), fs = Math.round(big * 1.35);
            ctx.save(); ctx.translate(cx, cy - big * 0.12); ctx.scale(s, s);
            txt(ctx, num, 0, 5, fs, "rgba(0,0,0,0.4)", { f: K.DISP, w: "400", a: clamp(e * 10, 0, 1) });
            txt(ctx, num, 0, 0, fs, "#ffffff", { f: K.DISP, w: "400", a: clamp(e * 10, 0, 1), stroke: 5, strokeColor: "rgba(0,0,0,0.25)" });
            ctx.restore();
            if (v < 1000) txt(ctx, "MİLİSANİYE", cx, cy + big * 0.55, 13, "rgba(255,255,255,0.6)", { ls: "3px", a: clamp((e - 0.1) * 6, 0, 1) });
            const la = clamp((e - 0.12) / 0.2, 0, 1), ly = cy + big * 1.15 + (1 - backOut(la)) * 18;
            if (la > 0) {
              ctx.font = "800 20px " + K.COND; const lw = ctx.measureText(lab).width + 40;
              ctx.globalAlpha = la; ctx.fillStyle = col; rr(ctx, cx - lw / 2, ly - 17, lw, 34, 17); ctx.fill();
              ctx.fillStyle = "rgba(255,255,255,0.3)"; rr(ctx, cx - lw / 2 + 4, ly - 15, lw - 8, 12, [10, 10, 4, 4]); ctx.fill(); ctx.globalAlpha = 1;
              txt(ctx, lab, cx, ly + 1, 20, "#141623", { ls: "2px", a: la });
            }
          }
        } else if (g.over) {
          const { v: okV, avg, best } = stats();
          // bantlar ekranda yazan ≈273 ms ortancayı "ORTALAMA" içine alır (eskiden 273 ms "ortalamanın üstü" sayılıyordu)
          const label = !avg ? "—" : avg < 200 ? "ŞİMŞEK GİBİ" : avg < 235 ? "ÇOK HIZLI" : avg < 260 ? "ORTALAMANIN ÜSTÜ" : avg < 300 ? "ORTALAMA" : "BİRAZ YAVAŞ";
          const col = avg ? grade(avg)[1] : "#c9ced9";
          ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.6; ctx.drawImage(glow(col), cx - rad * 1.8, cy - rad * 1.8, rad * 3.6, rad * 3.6); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
          const allOk = okV.length === ROUNDS || !okV.length;
          txt(ctx, allOk ? ROUNDS + " TURUN ORTALAMASI" : okV.length + " GEÇERLİ TURUN ORTALAMASI", cx, cy - big * 1.15, allOk ? 15 : 14, "rgba(255,255,255,0.6)", { ls: allOk ? "4px" : "2px" });
          txt(ctx, avg ? avg + " ms" : "—", cx, cy - big * 0.3, big, "#ffffff", { f: K.DISP, w: "400", stroke: 5, strokeColor: "rgba(0,0,0,0.3)" });
          txt(ctx, label, cx, cy + big * 0.55, 22, col === "#c9ced9" ? "#ffd34d" : col, { ls: "2px" });
          txt(ctx, "İnsanların ortanca değeri ≈ 273 ms", cx, cy + big * 0.55 + 28, 15, "rgba(255,255,255,0.7)", { w: "600" });
          if (best) txt(ctx, "★ EN İYİ: " + Math.round(best) + " ms", cx, cy + big * 0.55 + 62, 20, "#ffd34d", { ls: "1px" });
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rad * 1.14, 0, Math.PI * 2); ctx.stroke();
          txt(ctx, "HAZIR OL", cx, cy, big, "#ffffff", { f: K.DISP, w: "400" });
        }
        // tur çipleri
        const bw = Math.min(64, (R.w - 40) / ROUNDS - 8), y = R.y + R.h - 64, { best } = stats(), pulse = 0.5 + 0.5 * Math.sin(T * 4);
        for (let i = 0; i < ROUNDS; i++) {
          const x = cx - (ROUNDS * (bw + 8)) / 2 + i * (bw + 8) + 4, v = g.rt[i], at = g.chipAt[i];
          const fill = v == null ? 0 : at == null ? 1 : clamp((T - at) / 0.35, 0, 1);
          const isBest = g.over && best && v === best;
          if (isBest) txt(ctx, "EN İYİ", x + bw / 2, y - 14, 12, "#ffd34d", { ls: "1px" });
          chip(ctx, x, y, bw, 40, i, v, 1 - Math.pow(1 - fill, 3), active && !g.over && i === g.k, isBest, pulse);
        }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1.2);
        ctx.restore();
        // süre ölçümü yeşil gerçekten çizildikten sonra başlar (update ile çizim arasındaki iş sayılmaz)
        if (active && g.st === "go" && !g.goShown) { g.goShown = true; g.goAt = performance.now(); }
      },
    };
  }
  function drawRemote(ctx, R, d) {
    ctx.drawImage(stage("idle", R.w, R.h), R.x, R.y, R.w, R.h);
    const r = d && Array.isArray(d.r) ? d.r : [], n = 5, bw = Math.min(56, (R.w - 30) / n - 6), y = R.y + R.h / 2 - 18;
    for (let i = 0; i < n; i++) {
      const x = R.x + R.w / 2 - (n * (bw + 6)) / 2 + i * (bw + 6) + 3, v = r[i];
      chip(ctx, x, y, bw, 36, i, v, v == null ? 0 : 1, (d && d.k | 0) === i && v == null, false, 0.5);
    }
  }
  K.register({
    id: "refleks", name: "Refleks", color: "#18c964", desc: "Ekran yeşile döner dönmez dokun. 5 tur, en hızlı kazanır.",
    rules: "Kırmızıda bekle · yeşilde hemen dokun · erken dokunma",
    timeLimit: () => null,
    create, drawRemote,
  });
})();
