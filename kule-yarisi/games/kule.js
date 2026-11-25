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
  // gerçek fotoğraf dokuları (CC0): bulutlu gökyüzü (Poly Haven kloofendal puresky, 360° → yatayda dikişsiz), cam cephe (ambientCG Facade001)
  const SKYIMG = new Image(); SKYIMG.src = "doku/gokyuzu.jpg";
  const FACADE = new Image(); FACADE.src = "doku/cephe.jpg";
  let facPat = null, facCtx = null;
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
  // Işık sağ üstten gelir (güneş): sağ kenarlar parlak, sol kenarlar gölgede.
  const winLit = (idx, i, night) => { const thr = 0.12 + hash(idx, i + 200) * 0.45; return hash(idx, i) < 0.6 && night > thr ? Math.min(1, (night - thr) * 3) : 0; };
  const LIT_C = ["255,206,128", "255,226,170", "214,232,255", "255,176,96"];
  function glassWin(ctx, wx, wy, ww, wh, idx, i, night, gold, frameC) {
    ctx.fillStyle = frameC; ctx.fillRect(wx - 1.5, wy - 1.5, ww + 3, wh + 3);
    const lit = winLit(idx, i, night);
    const gg = ctx.createLinearGradient(0, wy, 0, wy + wh);
    if (gold) { gg.addColorStop(0, "#fff0c0"); gg.addColorStop(1, "#b88a2a"); }
    else { gg.addColorStop(0, css(mix(hex("#b9d8ef"), hex("#1c2540"), night * 0.85))); gg.addColorStop(1, css(mix(hex("#3f5d7c"), hex("#0b0f1e"), night))); }
    ctx.fillStyle = gg; ctx.fillRect(wx, wy, ww, wh);
    if (lit > 0) {
      const c = LIT_C[(hash(idx, i + 70) * 4) | 0], lg = ctx.createLinearGradient(0, wy, 0, wy + wh);
      lg.addColorStop(0, "rgba(" + c + "," + lit * 0.98 + ")"); lg.addColorStop(1, "rgba(" + c + "," + lit * 0.7 + ")");
      ctx.fillStyle = lg; ctx.fillRect(wx, wy, ww, wh);
      const cur = hash(idx, i + 90); // perde / iç gölge
      if (cur < 0.35) { ctx.fillStyle = "rgba(60,30,20," + lit * 0.35 + ")"; ctx.fillRect(cur < 0.17 ? wx : wx + ww * 0.62, wy, ww * 0.38, wh); }
    }
    ctx.fillStyle = "rgba(255,255,255," + (0.28 - night * 0.18) + ")"; // çapraz yansıma
    ctx.beginPath(); ctx.moveTo(wx + ww * 0.15, wy + wh); ctx.lineTo(wx + ww * 0.55, wy); ctx.lineTo(wx + ww * 0.75, wy); ctx.lineTo(wx + ww * 0.35, wy + wh); ctx.fill();
    ctx.fillStyle = frameC; ctx.fillRect(wx + ww / 2 - 0.5, wy, 1, wh); // kayıt
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(wx - 2, wy + wh + 1.5, ww + 4, 1.2); // denizlik
  }
  function drawFloor(ctx, x, y, w, h, idx, night, perfect) {
    if (w < 0.5) return;
    const p = COL;
    if (idx === 0) {
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, "#a9a399"); g.addColorStop(0.6, "#d8d2c6"); g.addColorStop(1, "#ebe6dc");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      const gx = x + w * 0.1, gy = y + h * 0.26, gw = w * 0.8, gh0 = h * 0.46;
      const lg = ctx.createLinearGradient(0, gy, 0, gy + gh0); lg.addColorStop(0, css(mix(hex("#5f7690"), hex("#ffd58a"), night * 0.7))); lg.addColorStop(1, css(mix(hex("#1d2633"), hex("#d79a4a"), night * 0.6)));
      ctx.fillStyle = "#3b3f47"; ctx.fillRect(gx - 2, gy - 2, gw + 4, gh0 + 4);
      ctx.fillStyle = lg; ctx.fillRect(gx, gy, gw, gh0);
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.moveTo(gx + gw * 0.1, gy + gh0); ctx.lineTo(gx + gw * 0.3, gy); ctx.lineTo(gx + gw * 0.42, gy); ctx.lineTo(gx + gw * 0.22, gy + gh0); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)"; for (let i = 1; i < 6; i++) ctx.fillRect(gx + (gw / 6) * i, gy, 1, gh0);
      ctx.fillStyle = p.accent; ctx.fillRect(x, y, w, Math.max(2, h * 0.1));
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, y, w, 1);
      hazard(ctx, x, y + h * 0.78, w, h * 0.16, "#22252b", "#f4b400");
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x, y, Math.max(1.5, w * 0.01), h);
      return;
    }
    const style = idx < 10 ? 0 : idx < 20 ? 1 : 2, slab = Math.max(2, h * 0.2), gh = h - slab, gold = perfect;
    if (style === 0) {
      // konut: sıcak sıva, çerçeveli camlar, balkon korkulukları
      const wc = hex(gold ? "#f6e2a8" : p.wall), wg = ctx.createLinearGradient(x, 0, x + w, 0);
      wg.addColorStop(0, css(mix(wc, [110, 60, 40], 0.14))); wg.addColorStop(0.65, css(wc)); wg.addColorStop(1, css(mix(wc, [255, 255, 255], 0.18)));
      ctx.fillStyle = wg; ctx.fillRect(x, y, w, gh);
      ctx.fillStyle = "rgba(120,70,40,0.1)"; for (let k = 0, n = (w * gh / 90) | 0; k < n; k++) ctx.fillRect(x + hash(idx * 31 + k, 3) * w, y + hash(idx * 31 + k, 4) * gh, 1, 1);
      if (night > 0) { ctx.fillStyle = "rgba(6,10,28," + night * 0.55 + ")"; ctx.fillRect(x, y, w, gh); }
      const nW = Math.max(1, Math.round(w / (h * 0.9))), step = w / nW, ww = step * 0.46, wh = gh * 0.56, fc = css(mix(hex(gold ? "#a07a1a" : p.wallD), hex("#141826"), night * 0.6));
      for (let i = 0; i < nW; i++) {
        const wx = x + i * step + (step - ww) / 2, wy = y + gh * 0.18;
        glassWin(ctx, wx, wy, ww, wh, idx, i, night, gold, fc);
        if (hash(idx, i + 50) < 0.4) { ctx.fillStyle = fc; ctx.fillRect(wx - 3, wy + wh - 1, ww + 6, 2); for (let k = 0; k <= 4; k++) ctx.fillRect(wx - 3 + (ww + 6) * k / 4, wy + wh * 0.7, 1, wh * 0.3); ctx.fillRect(wx - 3, wy + wh * 0.7, ww + 6, 1); }
        else if (hash(idx, i + 60) < 0.25) { ctx.fillStyle = css(mix(hex("#e4e6ea"), hex("#3a3f4c"), night * 0.7)); ctx.fillRect(wx + ww + 3, wy + wh * 0.55, Math.min(step * 0.2, 9), wh * 0.35); } // klima
      }
    } else if (style === 1) {
      // ofis: mavi-gri cam giydirme cephe, açık renk alüminyum doğramalar
      const g = ctx.createLinearGradient(0, y, 0, y + gh);
      if (gold) { g.addColorStop(0, "#fff3cf"); g.addColorStop(0.5, "#e9bf57"); g.addColorStop(1, "#9a6f1a"); }
      else { g.addColorStop(0, "#d9ebf7"); g.addColorStop(0.45, "#7fa7c9"); g.addColorStop(1, "#33557a"); }
      ctx.fillStyle = g; ctx.fillRect(x, y, w, gh);
      if (night > 0) { ctx.fillStyle = "rgba(8,14,32," + night * 0.7 + ")"; ctx.fillRect(x, y, w, gh); }
      const nP = Math.max(2, Math.round(w / Math.max(9, h * 0.55))), step = w / nP;
      for (let i = 0; i < nP; i++) { const lit = winLit(idx, i, night); if (lit > 0) { const c = LIT_C[(hash(idx, i + 70) * 4) | 0]; ctx.fillStyle = "rgba(" + c + "," + lit * 0.85 + ")"; ctx.fillRect(x + i * step + 1, y + 1, step - 2, gh - 2); if (hash(idx, i + 80) < 0.4) { ctx.fillStyle = "rgba(40,30,30," + lit * 0.3 + ")"; ctx.fillRect(x + i * step + step * 0.3, y + gh * 0.45, step * 0.25, gh * 0.55); } } }
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, gh); ctx.clip();
      const rx = x + (hash(idx, 7) * 1.3 - 0.15) * w;
      ctx.fillStyle = "rgba(255,255,255," + 0.28 * (1 - night * 0.7) + ")";
      ctx.beginPath(); ctx.moveTo(rx, y + gh); ctx.lineTo(rx + gh * 0.8, y); ctx.lineTo(rx + gh * 0.8 + w * 0.12, y); ctx.lineTo(rx + w * 0.12, y + gh); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255," + 0.12 * (1 - night * 0.7) + ")";
      ctx.beginPath(); ctx.moveTo(rx + w * 0.2, y + gh); ctx.lineTo(rx + w * 0.2 + gh * 0.8, y); ctx.lineTo(rx + w * 0.24 + gh * 0.8, y); ctx.lineTo(rx + w * 0.24, y + gh); ctx.fill();
      ctx.restore();
      const mc = css(mix(hex("#e9eef3"), hex("#5a6478"), night * 0.6));
      for (let i = 1; i < nP; i++) { ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x + i * step - 2, y, 1, gh); ctx.fillStyle = mc; ctx.fillRect(x + i * step - 1, y, 2, gh); }
      ctx.fillStyle = mc; ctx.fillRect(x, y + gh * 0.62, w, 1.5);
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, y, w, 1);
    } else {
      // gökdelen: koyu füme cam, metal dikey kanatlar, ince aydınlatma
      const g = ctx.createLinearGradient(0, y, 0, y + gh);
      if (gold) { g.addColorStop(0, "#f7e2a6"); g.addColorStop(0.5, "#c99a35"); g.addColorStop(1, "#6e4c0e"); }
      else { g.addColorStop(0, "#5d7391"); g.addColorStop(0.5, "#2a3a54"); g.addColorStop(1, "#141c2b"); }
      ctx.fillStyle = g; ctx.fillRect(x, y, w, gh);
      const nP = Math.max(3, Math.round(w / Math.max(7, h * 0.36))), step = w / nP;
      for (let i = 0; i < nP; i++) { const lit = winLit(idx, i, night); if (lit > 0) { ctx.fillStyle = "rgba(200,225,255," + lit * 0.75 + ")"; ctx.fillRect(x + i * step + 2, y + gh * 0.15, step - 4, gh * 0.7); } }
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, gh); ctx.clip();
      const rg = ctx.createLinearGradient(x, y, x + w, y + gh);
      rg.addColorStop(0, "rgba(255,255,255,0)"); rg.addColorStop(0.45, "rgba(255,255,255," + 0.22 * (1 - night * 0.6) + ")"); rg.addColorStop(0.55, "rgba(255,255,255,0)");
      ctx.fillStyle = rg; ctx.fillRect(x, y, w, gh);
      ctx.restore();
      const fg = ctx.createLinearGradient(0, 0, 3, 0);
      fg.addColorStop(0, "#6d7889"); fg.addColorStop(0.5, "#e8eef5"); fg.addColorStop(1, "#9aa7b8");
      ctx.fillStyle = fg;
      for (let i = 0; i <= nP; i++) { const fx = Math.max(x, x + i * step - 1.5); ctx.save(); ctx.translate(fx, 0); ctx.fillRect(0, y, 3, gh); ctx.restore(); }
    }
    // döşeme: beton plak + renkli şerit
    const sl = ctx.createLinearGradient(0, y + gh, 0, y + h);
    sl.addColorStop(0, css(mix(hex(gold ? "#fff1c4" : "#f4f0e8"), hex("#4b4f63"), night * 0.7))); sl.addColorStop(1, css(mix(hex(gold ? "#d9bd74" : "#bdb6aa"), hex("#2a2d3a"), night * 0.7)));
    ctx.fillStyle = sl; ctx.fillRect(x, y + gh, w, slab);
    ctx.fillStyle = gold ? "#f4b400" : p.accent; ctx.fillRect(x, y + gh, w, Math.max(1.5, slab * 0.34));
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, y + gh, w, 0.8);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(x, y + h - 1, w, 1);
    const ew = Math.max(1.5, Math.min(4, w * 0.012));
    ctx.fillStyle = "rgba(0,0,0,0.26)"; ctx.fillRect(x, y, ew, h);
    ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(x + w - ew, y, ew, gh);
    const sg = ctx.createLinearGradient(0, y, 0, y + gh * 0.25); sg.addColorStop(0, "rgba(0,0,0,0.2)"); sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg; ctx.fillRect(x, y, w, gh * 0.25);
    if (gold) { ctx.fillStyle = "rgba(255,240,190,0.45)"; ctx.fillRect(x, y, w, 1.5); }
  }
  // Kat görüntüleri ekran dışı tuvallerde önbelleklenir (gece değeri 1/20 adımla nicelenir).
  const fCache = new Map();
  function floorSprite(idx, w, h, night, perfect) {
    const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h)), nq = Math.round(night * 20) / 20;
    const key = idx + "|" + W + "|" + H + "|" + nq + "|" + (perfect ? 1 : 0);
    let c = fCache.get(key);
    if (!c) {
      if (fCache.size > 160) fCache.clear();
      const d = Math.min(window.devicePixelRatio || 1, 2); c = document.createElement("canvas"); c.width = Math.ceil(W * d); c.height = Math.ceil(H * d);
      const x = c.getContext("2d"); x.scale(d, d); drawFloor(x, 0, 0, W, H, idx, nq, perfect); fCache.set(key, c);
    }
    return c;
  }
  const blit = (ctx, x, y, w, h, idx, night, perfect) => { if (w >= 0.5) ctx.drawImage(floorSprite(idx, w, h, night, perfect), x, y, w, h); };
  // ekran kenarı kararması (yarım çözünürlükte, boyut başına bir kez)
  let vig = null;
  function vignette(w, h) {
    if (vig && vig.w === w && vig.h === h) return vig.c;
    const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w / 2)); c.height = Math.max(1, Math.ceil(h / 2));
    const x = c.getContext("2d"), gr = x.createRadialGradient(c.width / 2, c.height * 0.45, Math.min(c.width, c.height) * 0.3, c.width / 2, c.height * 0.45, Math.hypot(c.width, c.height) * 0.62);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(6,8,22,0.34)"); x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height);
    vig = { w, h, c }; return c;
  }
  let gravel = null, gravelP = null, gravelCtx = null;
  function gravelPat(ctx) {
    if (!gravel) { gravel = document.createElement("canvas"); gravel.width = gravel.height = 64; const x = gravel.getContext("2d"), r = rnd(77); for (let i = 0; i < 240; i++) { x.fillStyle = r() < 0.55 ? "rgba(0,0,0,0.2)" : "rgba(255,240,220,0.13)"; x.fillRect(r() * 64, r() * 64, 1 + r() * 1.5, 1 + r()); } }
    if (gravelCtx !== ctx) { gravelP = ctx.createPattern(gravel, "repeat"); gravelCtx = ctx; }
    return gravelP;
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
      swayT: 0, swayAmp: 0, balance: 0, squash: 0, acc: 0, glint: null, L: null,
      debris: [], pops: [], fxp: [], rings: [], streaks: [], planes: [], birds: [], meteors: [], clock: 0,
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
    // efekt koordinatları: dünya pikseli (kamera kaymasından bağımsız; çizimde kamera kadar ötelenir)
    const PX = x => g.L ? g.L.ox + x * g.L.s : 0, PY = y => g.L ? g.L.base0 - y * g.L.BH : 0;
    const DUST = "rgb(226,214,196)";
    function dust(x, y, n, big) { if (!g.L) return; const sp = g.L.BH * (big ? 2.4 : 1.5); for (let s = -1; s <= 1; s += 2) { const ex = PX(x + s * BW / 2), ey = PY(y); for (let i = 0; i < n; i++) { const l = 0.55 + Math.random() * 0.5; g.fxp.push({ k: 3, x: ex + s * Math.random() * 4, y: ey - Math.random() * 3, vx: s * sp * (0.4 + Math.random() * 0.9), vy: -Math.random() * sp * 0.35, life: l, max: l, s: 4 + Math.random() * (big ? 9 : 6), c: DUST, g: -8, dr: 0.9 }); } } }
    function chunks(x, y, n, col, spd) { if (g.L) K.parts.burst(g.fxp, PX(x), PY(y), col, n, spd || g.L.BH * 4); }
    function confetti() { if (g.L) { K.parts.confetti(g.fxp, PX(0.25), PY(top() + 1), 26, g.L.BH * 11); K.parts.confetti(g.fxp, PX(0.75), PY(top() + 1), 26, g.L.BH * 11); } }
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
      g.streak = 0; K.kick(0.42); K.flash(0.16, "#ff3b3b");
      buzz([40, 40, 90]); setTimeout(() => { if (!g.disposed) SFX.crash(); }, 250);
      g.lives--;
      if (g.lives > 0) { SFX.lifeLost(); popW(g.lives + " CAN KALDI", "#ff6b78", 2.4); g.phase = "settle"; g.phaseT = -0.35; }
      else { g.phase = "dead"; g.over = true; g.deadT = 0; } // son çöküş görünsün diye bitiş ~0,9 sn sonra bildirilir
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
        const fy = st.fail, fb = removed[0];
        chunks(fb.x + swayAt(fy), fy, 22, "#bdb6aa"); chunks(fb.x + swayAt(fy), fy, 10, COL.accent); dust(fb.x + swayAt(fy), fy, 10, true);
        K.kick(0.25); K.hitstop(0.05); SFX.topple(); updateSway(); loseLife();
        return;
      }
      if (g.balance > 0.7) SFX.creak();
      updateSway();
      const n = floors();
      if (n > 0 && n % 10 === 0) { K.flash(0.3, "#fff6dc"); K.kick(0.2); confetti(); if (g.L) K.parts.ring(g.fxp, PX(0.5), PY(top() - 0.5), "#ffe9a8", g.L.BH * 5, 6); popW(n + ". KAT!", "#ffffff", 3.2, true); setTimeout(() => SFX.milestone(), 120); }
      if (PLANE_FLOORS.includes(n)) { const dir = Math.random() < 0.5 ? 1 : -1; g.planes.push({ dir, x: dir > 0 ? -0.4 : 1.4, y: top() + 4.5 + Math.random() * 2 }); }
    }
    function land() {
      const f = g.fall, ti = g.blocks.length - 1, tb = g.blocks[ti];
      // destek: alttaki katın gerçek yarı genişliği (1. kat geniş tabana oturur)
      const topX = tb.x + swayAt(ti), d = f.x - topX, ad = Math.abs(d), y = top(), half = tb.w / 2;
      if (ad <= PERFECT * BW) {
        const ni = g.blocks.length;
        g.blocks.push({ x: topX - swayAt(ni), w: BW, perfect: true });
        g.streak++;
        const gain = 25 + 25 * g.streak; g.score += gain;
        g.rings.push({ x: topX, y, life: 1 });
        g.pops.push({ text: (g.streak > 1 ? "KUSURSUZ ×" + g.streak : "KUSURSUZ") + "  +" + gain, life: 1.1, x: topX, y: y + 1.4, c: "#ffd34d" });
        g.squash = 1; g.glint = { i: ni, t: 0 };
        const k = Math.min(1, g.streak / 6);
        K.hitstop(0.05 + k * 0.03); K.kick(0.12 + k * 0.14); K.flash(0.1 + k * 0.12, "#fff1c2");
        if (g.L) { const cx = PX(topX), cy = PY(y); K.parts.ring(g.fxp, cx, cy, "#ffe08a", g.L.BH * (2.2 + k * 1.6), 4 + k * 3); K.parts.spark(g.fxp, cx - BW * g.L.s / 2, cy, "#ffe9a8", 6 + k * 6, g.L.BH * 6); K.parts.spark(g.fxp, cx + BW * g.L.s / 2, cy, "#ffe9a8", 6 + k * 6, g.L.BH * 6); if (g.streak >= 3) K.parts.confetti(g.fxp, cx, cy - g.L.BH, 10 + g.streak * 2, g.L.BH * 8, ["#ffd34d", "#fff3c4", "#ff6a3d", "#ffffff"]); }
        SFX.thud(0.7); SFX.chime(g.streak - 1); buzz(15); dust(topX, y, 4);
        afterLanding();
      } else if (ad <= half) {
        const ni = g.blocks.length;
        g.blocks.push({ x: f.x - swayAt(ni), w: BW, perfect: false });
        g.streak = 0; g.score += 25;
        g.pops.push({ text: "+25", life: 0.9, x: f.x, y: y + 1.3, c: "#ffffff" });
        g.squash = 1; K.kick(0.24); K.hitstop(0.03);
        SFX.thud(1); buzz(10); dust(f.x, y, 7); chunks(f.x, y, 5, "#a49d92", g.L ? g.L.BH * 2.5 : 0);
        afterLanding();
      } else if (ad < half + BW / 2) {
        const side = d > 0 ? 1 : -1;
        g.topple = { side, px: topX + side * half, bx: f.x, y, th: 0, w: 0 };
        g.phase = "topple"; g.fall = null;
        K.kick(0.16); if (g.L) { const px = g.topple.px; chunks(px, y, 9, "#bdb6aa"); K.parts.dust(g.fxp, PX(px), PY(y), DUST, 6, g.L.BH * 0.8); }
        SFX.thud(0.6); SFX.topple();
      } else {
        g.debris.push({ x: f.x, y: f.y, w: BW, vy: f.vy, vx: 0, rot: 0, vr: (Math.random() - 0.5) * 2, perfect: false });
        g.fall = null; SFX.fall(); loseLife();
      }
    }
    function step(dt, active) {
      g.swayT += dt;
      if (g.over) { g.deadT += dt; return; }
      if (g.phase === "lower") { g.phaseT += dt; g.t += dt; if (g.phaseT >= 0.42) g.phase = "swing"; }
      else if (g.phase === "swing") { if (active) g.t += dt; }
      else if (g.phase === "drop") {
        const f = g.fall; f.vy += G * dt; f.y -= f.vy * dt; f.rot *= Math.exp(-10 * dt);
        const w = windAt(g.blocks.length);
        if (w) { const dx = w.dir * w.s * 0.1 * dt; if (Math.abs(f.drift + dx) <= 0.15 * BW) { f.drift += dx; f.x += dx; } }
        if (f.y <= top()) { f.y = top(); land(); }
      } else if (g.phase === "topple") {
        // kenar üzerinde dönen dikdörtgen: tork = ağırlık × ağırlık merkezinin kenara yatay uzaklığı (kat birimiyle);
        // kenardan az taşan blok bir an sallanıp yavaş, çok taşan hızla devrilir
        const tp = g.topple, e = Math.max(0.15, Math.abs(tp.bx - tp.px) / BHW), lever = e * Math.cos(tp.th) + 0.5 * Math.sin(tp.th);
        tp.w += G * lever / (e * e + 0.25 + (Math.pow(BW / BHW, 2) + 1) / 12) * dt; tp.th += tp.w * dt;
        if (tp.th > 1.3) {
          const phi = -tp.side * tp.th, dx = tp.bx - tp.px, dyu = 0.5 * BHW;
          const cx = tp.px + dx * Math.cos(phi) - dyu * Math.sin(phi), cy = tp.y + (dx * Math.sin(phi) + dyu * Math.cos(phi)) / BHW;
          g.debris.push({ x: cx, y: cy - 0.5, w: BW, vy: 1.5, vx: tp.side * 0.18, rot: tp.side * tp.th, vr: tp.side * tp.w, perfect: false });
          chunks(cx, cy, 8, "#bdb6aa"); g.topple = null; loseLife();
        }
      } else if (g.phase === "settle") { g.phaseT += dt; if (g.phaseT >= 0.25 && active) spawnNext(); }
      g.retract = Math.max(0, g.retract - dt);
    }
    function fx(dt, active) {
      g.clock += dt;
      g.cam += (Math.max(0, top() - g.vf * 0.28) - g.cam) * Math.min(1, dt * 4);
      g.squash = Math.max(0, g.squash - dt * 6);
      if (g.glint) { g.glint.t += dt * 1.8; if (g.glint.t > 1) g.glint = null; }
      for (const d of g.debris) {
        d.vy += G * dt; d.y -= d.vy * dt; d.x += d.vx * dt; d.rot += d.vr * dt;
        if (g.L && Math.random() < dt * 14) K.parts.dust(g.fxp, PX(d.x), PY(d.y + 0.5), "rgb(200,190,176)", 1, 10); // düşerken toz izi
        if (g.L && !d.hit && d.y < 0.2 && g.cam < 1.5) { // zemine çarpma (yalnız zemin görünürken)
          d.hit = true; d.y = -50; K.kick(0.18); SFX.thud(0.6);
          chunks(d.x, 0.2, 14, "#bdb6aa"); chunks(d.x, 0.2, 6, COL.accent); K.parts.dust(g.fxp, PX(d.x), PY(0.1), DUST, 14, g.L.BH * 2.2);
        }
      }
      g.debris = g.debris.filter(d => d.y > g.cam - 15);
      K.parts.update(g.fxp, dt);
      for (const s of g.pops) { s.age = (s.age || 0) + dt; s.life -= dt * 0.8; s.y += dt * (s.age < 0.12 ? 2.4 : 0.9); } g.pops = g.pops.filter(s => s.life > 0);
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
      _g: g,
      dispose() { g.disposed = true; }, // gecikmeli sesler menüde çalmasın
      get score() { return g.score; },
      get over() { return g.over && g.deadT >= 0.9; },
      get windLevel() { return g.windLevel; },
      info() { return { lives: g.lives, maxLives: LIVES, extra: g.streak > 1 ? "SERİ ×" + g.streak : "", sub: "KAT " + floors() + " · " + (floors() * FLOOR_M).toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " m" }; },
      update(dt, active) {
        g.acc += dt;
        while (g.acc >= STEP) { step(STEP, active); g.acc -= STEP; }
        fx(dt, active);
      },
      pointer(type) {
        if (type !== "down" || g.over || g.phase !== "swing") return;
        // bırakılan blok, ekranda asılı çizildiği yerden düşer (makara 6 px aşağıda, blok merkezi ipin ucundan yarım kat aşağıda)
        const a = hookAngle(), lc = ROPE + 0.5, py = pivotY() - (g.L ? 6 / g.L.BH : 0);
        g.fall = { x: 0.5 + Math.sin(a) * lc * BHW, y: py - Math.cos(a) * lc - 0.5, vy: 0, rot: a, drift: 0 };
        g.phase = "drop"; g.retract = 0.3;
        SFX.release(); SFX.whoosh();
      },
      net() { const off = Math.max(0, g.blocks.length - 12); return { n: floors(), off, b: g.blocks.slice(off).map(b => Math.round(b.x * 1000) * (b.perfect ? -1 : 1)) }; },
      draw(ctx, R, active) {
        const t = g.clock;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); ctx.translate(R.x, R.y);
        const VW = R.w, playH = R.h;
        const s = Math.min(VW, playH / (BHW * 8.5)), ox = (VW - s) / 2, BH = BHW * s, site = BH * 0.9, base0 = playH - site;
        g.vf = base0 / BH; g.L = { s, ox, BH, base0 };
        const sx = x => ox + x * s, camPx = g.cam * BH, sy = y => base0 - y * BH + camPx;
        const alt = g.cam / SKY_FLOORS, night = clamp((alt - 0.4) / 0.35, 0, 1);
        const { top: skyTop, bot } = sky(ctx, { x: 0, y: 0, w: VW, h: playH }, alt, t, night);
        // gündüz: gerçek bulutlu gökyüzü fotoğrafı; kule yükseldikçe (alacakaranlık/gece) solar, rüzgârla yavaşça kayar
        const dayA = clamp(1 - alt * 2.2, 0, 1) * (1 - night);
        if (dayA > 0.01 && SKYIMG.naturalWidth) {
          const ih = SKYIMG.naturalHeight, hgt = Math.min(playH * 0.62, ih * 2.1), w = SKYIMG.naturalWidth * (hgt / ih) * 0.6, off = (t * 3) % w, y0 = Math.min(0, -camPx * 0.04);
          ctx.globalAlpha = dayA * 0.92; ctx.drawImage(SKYIMG, -off, y0, w, hgt); ctx.drawImage(SKYIMG, w - off, y0, w, hgt);
          const fade = ctx.createLinearGradient(0, y0 + hgt * 0.62, 0, y0 + hgt); fade.addColorStop(0, css(bot, 0)); fade.addColorStop(1, css(bot, 1));
          ctx.fillStyle = fade; ctx.fillRect(0, y0 + hgt * 0.62, VW, hgt * 0.38 + 1); ctx.globalAlpha = 1;
        }
        // güneş: geniş hale + parlak çekirdek
        const sr = Math.max(14, Math.min(VW, playH) * 0.06), sunY = playH * (0.14 + alt * 1.6), sunX = VW * 0.8;
        if (sunY < playH + sr) {
          const sg = ctx.createRadialGradient(sunX, sunY, sr * 0.6, sunX, sunY, sr * 6); sg.addColorStop(0, "rgba(255,240,200,0.5)"); sg.addColorStop(0.35, "rgba(255,214,150,0.16)"); sg.addColorStop(1, "rgba(255,200,120,0)");
          ctx.fillStyle = sg; ctx.fillRect(sunX - sr * 6, sunY - sr * 6, sr * 12, sr * 12);
          const sc = mix(hex("#fff6dc"), hex("#ff9a5c"), clamp(alt * 2.5, 0, 1)), cg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sr);
          cg.addColorStop(0, "#ffffff"); cg.addColorStop(0.7, css(sc)); cg.addColorStop(1, css(sc, 0.85));
          ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(sunX, sunY, sr, 0, Math.PI * 2); ctx.fill();
        }
        if (night > 0.2) {
          const mx = VW * 0.2, my = playH * 0.14; ctx.globalAlpha = Math.min(1, (night - 0.2) * 1.6);
          const mg = ctx.createRadialGradient(mx, my, sr * 0.5, mx, my, sr * 3); mg.addColorStop(0, "rgba(230,235,255,0.22)"); mg.addColorStop(1, "rgba(230,235,255,0)");
          ctx.fillStyle = mg; ctx.fillRect(mx - sr * 3, my - sr * 3, sr * 6, sr * 6);
          ctx.fillStyle = "#f4f1e6"; ctx.beginPath(); ctx.arc(mx, my, sr * 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = css(skyTop); ctx.beginPath(); ctx.arc(mx + sr * 0.35, my - sr * 0.15, sr * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }
        for (const m of g.meteors) { const mx = m.x * VW, my = sy(m.y), mg = ctx.createLinearGradient(mx, my, mx + 40, my - 60); mg.addColorStop(0, "rgba(255,255,255," + m.life + ")"); mg.addColorStop(1, "rgba(255,255,255,0)"); ctx.strokeStyle = mg; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 40, my - 60); ctx.stroke(); }
        // şehir silüeti: iki katman paralaks + atmosfer pusu; güneş tarafı (sağ) yüzler aydınlık
        const farBase = base0 + camPx * 0.12, nearBase = base0 + camPx * 0.28;
        const skyline = (list, baseY, col, scale, lit, face) => {
          if (baseY - playH * 0.5 > playH) return;
          ctx.fillStyle = css(col);
          for (const b of list) { const bh = b.h * playH * scale, bx = b.x * VW, bw = b.w * VW; ctx.fillRect(bx, baseY - bh, bw, bh + 2); if (b.cap > 0.75) ctx.fillRect(bx + bw * 0.4, baseY - bh - bh * 0.12, bw * 0.2, bh * 0.12); }
          // cam cephe dokusu: binalara pencere ızgarası ve yansıma (gece söner, ışıklı pencereler kalır)
          if (FACADE.naturalWidth && night < 0.95) {
            if (facCtx !== ctx) { facPat = ctx.createPattern(FACADE, "repeat"); facCtx = ctx; }
            const k = scale > 0.88 ? 0.22 : 0.3; if (facPat.setTransform) facPat.setTransform(new DOMMatrix([k, 0, 0, k, 0, baseY]));
            ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = 0.6 * (1 - night); ctx.fillStyle = facPat;
            for (const b of list) { const bh = b.h * playH * scale; ctx.fillRect(b.x * VW, baseY - bh, b.w * VW, bh + 2); }
            ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
          }
          if (face > 0) { ctx.fillStyle = css(mix(col, bot, face)); for (const b of list) { const bh = b.h * playH * scale, bx = b.x * VW, bw = b.w * VW; ctx.fillRect(bx + bw * 0.8, baseY - bh, bw * 0.2, bh + 2); } }
          if (lit > 0) { ctx.fillStyle = "rgba(255,206,120," + lit + ")"; for (const b of list) { const bh = b.h * playH * scale, bx = b.x * VW, bw = b.w * VW; for (const w of b.wins) ctx.fillRect(bx + w[0] * bw - 1, baseY - bh + w[1] * bh, 2, 2.5); } }
          if (night > 0.3 && scale < 0.88) for (const b of list) if (b.cap > 0.75) { const bh = b.h * playH * scale, bx = b.x * VW + b.w * VW * 0.5; if (Math.sin(t * 2.4 + b.x * 40) > 0.2) { ctx.fillStyle = "rgba(255,60,60," + night + ")"; ctx.fillRect(bx - 1, baseY - bh * 1.12 - 2, 2, 2); } }
        };
        skyline(cityFar, farBase, mix(bot, ramp(FAR_TINT, alt), 0.55), 0.9, night * 0.5, 0.2 * (1 - night));
        const hz = ctx.createLinearGradient(0, farBase - playH * 0.35, 0, farBase); hz.addColorStop(0, css(bot, 0)); hz.addColorStop(1, css(bot, 0.45));
        ctx.fillStyle = hz; ctx.fillRect(0, farBase - playH * 0.35, VW, playH * 0.35);
        skyline(cityNear, nearBase, mix(bot, ramp(NEAR_TINT, alt), 0.85), 0.85, night * 0.85, 0.3 * (1 - night));
        if (nearBase - playH * 0.14 < playH) { const fg = ctx.createLinearGradient(0, nearBase - playH * 0.14, 0, nearBase); fg.addColorStop(0, css(bot, 0)); fg.addColorStop(1, css(bot, 0.35)); ctx.fillStyle = fg; ctx.fillRect(0, nearBase - playH * 0.14, VW, playH * 0.14); }
        const spr = sprites();
        for (const c of clouds) {
          const cy = base0 - c.alt * BH * 2.2 + camPx * 0.85; if (cy < -80 || cy > playH + 40) continue;
          const sp = spr[c.sp], cw = VW * 0.45 * c.s, ch = cw * sp.height / sp.width, cx = ((c.x + t * c.v) % 1.4) - 0.2;
          ctx.globalAlpha = 0.75 * (1 - night * 0.8) * (1 - dayA * 0.8); ctx.drawImage(sp, cx * VW - cw / 2, cy - ch / 2, cw, ch); // gündüz fotoğraf bulutları baskın
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = night > 0.5 ? "rgba(220,225,240,0.7)" : "rgba(30,35,45,0.75)"; ctx.lineWidth = 1.4;
        for (const b of g.birds) for (const f of b.flock) { const bx = sx(b.x + f.ox), by = sy(b.y + f.oy), wv = Math.sin(t * 10 + f.ph) * 4; ctx.beginPath(); ctx.moveTo(bx - 6, by - wv); ctx.quadraticCurveTo(bx - 3, by - 2, bx, by); ctx.quadraticCurveTo(bx + 3, by - 2, bx + 6, by - wv); ctx.stroke(); }
        for (const pl of g.planes) plane(ctx, sx(pl.x), sy(pl.y), Math.max(0.7, s / 420), pl.dir, night, t);
        // zemin: çakıl dokusu, şantiye panosu, taban altında ortam gölgesi
        const groundY = sy(0);
        if (groundY < playH + 10) {
          const gg = ctx.createLinearGradient(0, groundY, 0, groundY + site + 40);
          gg.addColorStop(0, css(mix(hex("#7a6248"), hex("#2a2330"), night))); gg.addColorStop(1, css(mix(hex("#4b3a2a"), hex("#15121b"), night)));
          ctx.fillStyle = gg; ctx.fillRect(0, groundY, VW, site + 60);
          ctx.save(); ctx.translate(0, groundY); ctx.fillStyle = gravelPat(ctx); ctx.fillRect(0, 0, VW, site + 60); ctx.restore();
          const hoardH = BH * 0.55, hg = ctx.createLinearGradient(0, groundY - hoardH, 0, groundY);
          hg.addColorStop(0, css(mix(hex("#40566a"), hex("#1d2433"), night))); hg.addColorStop(1, css(mix(hex("#2b3c4b"), hex("#141a26"), night)));
          ctx.fillStyle = hg; ctx.fillRect(0, groundY - hoardH, VW, hoardH);
          ctx.fillStyle = "rgba(255,255,255,0.08)"; for (let x = 0; x < VW; x += Math.max(24, VW / 12)) ctx.fillRect(x, groundY - hoardH, 1, hoardH);
          hazard(ctx, 0, groundY - hoardH, VW, Math.max(3, hoardH * 0.16), "#1c1f24", "#f4b400");
          ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(0, groundY, VW, 3);
          const ao = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); ao.addColorStop(0, "rgba(0,0,0,0.45)"); ao.addColorStop(1, "rgba(0,0,0,0)");
          ctx.save(); ctx.translate(sx(0.5) - BH * 0.3, groundY + 2); ctx.scale(BASE_W * s * 0.7, BH * 0.35); ctx.fillStyle = ao; ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          for (const cx of [VW * 0.08, VW * 0.92]) {
            const ch = BH * 0.5, cw = ch * 0.7, cy = groundY + site * 0.55;
            ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(cx - cw * 0.3, cy + 2, cw * 0.8, 2.5, 0, 0, Math.PI * 2); ctx.fill();
            const cg = ctx.createLinearGradient(cx - cw / 2, 0, cx + cw / 2, 0); cg.addColorStop(0, "#c94a0a"); cg.addColorStop(0.6, "#ff7a26"); cg.addColorStop(1, "#ffb070");
            ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(cx - cw / 2, cy); ctx.lineTo(cx, cy - ch); ctx.lineTo(cx + cw / 2, cy); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.fillRect(cx - cw * 0.25, cy - ch * 0.55, cw * 0.5, ch * 0.14);
            ctx.fillStyle = "#222"; ctx.fillRect(cx - cw * 0.6, cy, cw * 1.2, 3);
          }
        }
        // kule: her kat, üstündeki katın gölgesini (ışık sağ üstten → gölge sola) alır
        const last = g.blocks.length - 1, shH = BH * 0.55;
        const csg = ctx.createLinearGradient(0, 0, 0, shH); csg.addColorStop(0, "rgba(8,10,22,0.42)"); csg.addColorStop(1, "rgba(8,10,22,0)");
        for (let i = 0; i <= last; i++) {
          const b = g.blocks[i], y = sy(i + 1); if (y > playH || y + BH < -BH) continue;
          const bx = b.x + swayAt(i), x0 = sx(bx - b.w / 2), w0 = b.w * s;
          if (i === last && g.squash > 0 && i > 0) { const q = easeOut(g.squash), wpx = b.w * s * (1 + 0.07 * q), hpx = BH * (1 - 0.12 * q); blit(ctx, sx(bx) - wpx / 2, y + (BH - hpx), wpx, hpx, i, night, b.perfect); }
          else blit(ctx, x0, y, w0, BH, i, night, b.perfect);
          if (i < last) { const nb = g.blocks[i + 1]; ctx.save(); ctx.beginPath(); ctx.rect(x0, y, w0, BH); ctx.clip(); ctx.translate(sx(nb.x + swayAt(i + 1) - nb.w / 2) - BH * 0.22, y); ctx.fillStyle = csg; ctx.fillRect(0, 0, nb.w * s, shH); ctx.restore(); }
          if (g.glint && g.glint.i === i) { // kusursuz oturuşta altın parıltı süpürmesi
            const gt = g.glint.t, cx = x0 - BH + (w0 + BH * 2) * easeOut(gt);
            ctx.save(); ctx.beginPath(); ctx.rect(x0, y, w0, BH); ctx.clip(); ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = "rgba(255,226,150," + 0.3 * (1 - gt) + ")"; ctx.fillRect(x0, y, w0, BH);
            ctx.fillStyle = "rgba(255,246,214," + 0.7 * (1 - gt) + ")"; ctx.beginPath(); ctx.moveTo(cx, y + BH); ctx.lineTo(cx + BH * 0.6, y); ctx.lineTo(cx + BH * 1.0, y); ctx.lineTo(cx + BH * 0.4, y + BH); ctx.fill();
            ctx.restore();
          }
        }
        if (g.over && last > 0) {
          const b = g.blocks[last], x = sx(b.x + swayAt(last) - b.w / 2), y = sy(last + 1), w = b.w * s, h = BH;
          ctx.fillStyle = css(mix(hex("#5a606e"), hex("#262a36"), night)); ctx.fillRect(x + w * 0.06, y - h * 0.35, w * 0.88, h * 0.35);
          ctx.fillStyle = COL.accent; ctx.fillRect(x + w * 0.06, y - h * 0.35, w * 0.88, 2);
          ctx.strokeStyle = "#c8ccd4"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.7, y - h * 0.35); ctx.lineTo(x + w * 0.7, y - h * 1.6); ctx.stroke();
          ctx.fillStyle = Math.sin(t * 4) > 0 ? "#ff3b3b" : "#5a1010"; ctx.beginPath(); ctx.arc(x + w * 0.7, y - h * 1.6, 3, 0, Math.PI * 2); ctx.fill();
        }
        // asılı / düşen bloğun kule tepesine düşen gölgesi (yaklaştıkça koyulaşır)
        const topY = sy(top()), tb = g.blocks[last], tbx = tb.x + swayAt(last);
        const dropShadow = (fx, k) => {
          const lo = Math.max(sx(tbx - tb.w / 2), sx(fx - BW / 2) - BH * 0.15), hi = Math.min(sx(tbx + tb.w / 2), sx(fx + BW / 2) - BH * 0.15); if (hi <= lo) return;
          ctx.save(); ctx.beginPath(); ctx.rect(lo, topY, hi - lo, BH); ctx.clip(); ctx.translate(0, topY); ctx.globalAlpha = 0.25 + 0.75 * k; ctx.fillStyle = csg; ctx.fillRect(lo, 0, hi - lo, shH * (0.5 + 0.5 * k)); ctx.restore();
        };
        // vinç: arka/ön kafes (derinlik), kalın kirişler, araba ve makaralar
        const pvx = sx(0.5), pvy = sy(pivotY()), craneC = mix(hex("#f4b400"), hex("#8a6a1a"), night * 0.6);
        const jd = Math.max(7, BH * 0.36), lw = Math.max(1, s / 420);
        if (pvy > -jd * 2) {
          ctx.strokeStyle = css(mix(craneC, [30, 26, 20], 0.55), 0.7); ctx.lineWidth = lw; lattice(ctx, -4 - jd * 0.5, pvy - 2, VW + 4, jd);
          ctx.strokeStyle = css(craneC); ctx.lineWidth = lw * 1.3; lattice(ctx, -4, pvy, VW + 4, jd);
          ctx.fillStyle = css(craneC); ctx.fillRect(-4, pvy - jd - 1.5, VW + 8, 3); ctx.fillRect(-4, pvy - 1.5, VW + 8, 3);
          ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fillRect(-4, pvy - jd - 1.5, VW + 8, 1); ctx.fillRect(-4, pvy - 1.5, VW + 8, 1);
          ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-4, pvy + 1, VW + 8, 1);
          const tg = ctx.createLinearGradient(0, pvy, 0, pvy + 10); tg.addColorStop(0, "#4a4f59"); tg.addColorStop(1, "#1d2026");
          ctx.fillStyle = tg; rr(ctx, pvx - 15, pvy + 1, 30, 9, 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(pvx - 13, pvy + 2, 26, 1);
          for (const wx of [pvx - 9, pvx + 9]) { ctx.fillStyle = "#15171b"; ctx.beginPath(); ctx.arc(wx, pvy, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#8a909c"; ctx.beginPath(); ctx.arc(wx, pvy, 1.2, 0, Math.PI * 2); ctx.fill(); }
          if (night > 0.3) { const on = Math.sin(t * 3) > 0; if (on) { ctx.fillStyle = "rgba(255,60,60,0.25)"; ctx.beginPath(); ctx.arc(VW - 8, pvy - jd, 7, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = on ? "#ff3b3b" : "#5a1010"; ctx.beginPath(); ctx.arc(VW - 8, pvy - jd, 2.5, 0, Math.PI * 2); ctx.fill(); }
        }
        const hanging = !g.over && (g.phase === "lower" || g.phase === "swing");
        if (hanging) { const a = hookAngle(), L = ropeLen(); dropShadow(0.5 + Math.sin(a) * (L + 0.5) * BHW, 0.15); }
        if (!g.over && (hanging || g.retract > 0)) {
          const a = hanging ? hookAngle() : 0, L = (hanging ? ropeLen() : ROPE * (0.3 + 0.7 * (g.retract / 0.3))) * BH;
          const hbT = L - BH * 0.8, hbH = BH * 0.24, hr = Math.max(2.5, BH * 0.08), hkY = hbT + hbH + 3, hkB = hkY + hr * 2;
          ctx.save(); ctx.translate(pvx, pvy + 6); ctx.rotate(-a);
          ctx.strokeStyle = "#23262c"; ctx.lineWidth = Math.max(1, lw * 1.3);
          ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(-3, hbT + 2); ctx.moveTo(3, 0); ctx.lineTo(3, hbT + 2); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(3.6, 0); ctx.lineTo(3.6, hbT + 2); ctx.stroke();
          // kanca bloğu (makara) + kanca
          const hg = ctx.createLinearGradient(-9, 0, 9, 0); hg.addColorStop(0, "#b07c00"); hg.addColorStop(0.65, "#f4b400"); hg.addColorStop(1, "#ffd860");
          ctx.fillStyle = hg; rr(ctx, -9, hbT, 18, hbH, 3); ctx.fill();
          ctx.fillStyle = "#1c1f24"; ctx.fillRect(-9, hbT + hbH * 0.55, 18, hbH * 0.18);
          ctx.fillStyle = "#2a2d33"; ctx.beginPath(); ctx.arc(0, hbT + hbH * 0.32, Math.min(4, hbH * 0.28), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(-7, hbT + 1, 14, 1);
          ctx.strokeStyle = "#3a3e46"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(0, hbT + hbH); ctx.lineTo(0, hkY); ctx.arc(0, hkY + hr, hr, -Math.PI / 2, Math.PI * 0.95); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, hkY + hr, hr, -Math.PI / 3, Math.PI / 4); ctx.stroke(); ctx.lineCap = "butt";
          if (hanging) {
            const bwp = BW * s;
            ctx.strokeStyle = "rgba(30,30,34,0.45)"; ctx.lineWidth = 0.9; // arka sapanlar
            ctx.beginPath(); ctx.moveTo(0, hkB); ctx.lineTo(-bwp / 2 + 14, L); ctx.moveTo(0, hkB); ctx.lineTo(bwp / 2 - 14, L); ctx.stroke();
            ctx.strokeStyle = "rgba(20,20,22,0.85)"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(0, hkB); ctx.lineTo(-bwp / 2 + 4, L); ctx.moveTo(0, hkB); ctx.lineTo(bwp / 2 - 4, L); ctx.stroke();
            blit(ctx, -bwp / 2, L, bwp, BH, g.blocks.length, night, false);
          }
          ctx.restore();
        }
        if (g.phase === "drop" && g.fall) {
          const f = g.fall, k = clamp(1 - (f.y - top()) / (DROP_H + 1), 0, 1);
          dropShadow(f.x, k);
          if (f.vy > 2) { // hız çizgileri
            const fx0 = sx(f.x), fyT = sy(f.y + 1), ln = Math.min(BH * 2.2, f.vy * BH * 0.07);
            ctx.strokeStyle = "rgba(255,255,255," + Math.min(0.4, f.vy * 0.025) + ")"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
            ctx.beginPath(); for (const o of [-0.38, -0.12, 0.16, 0.4]) { const lx = fx0 + o * BW * s, l2 = ln * (0.6 + hash(o * 100 | 0, 3) * 0.4); ctx.moveTo(lx, fyT - 3); ctx.lineTo(lx, fyT - 3 - l2); } ctx.stroke(); ctx.lineCap = "butt";
          }
          ctx.save(); ctx.translate(sx(f.x), sy(f.y + 0.5)); ctx.rotate(-f.rot);
          blit(ctx, -BW * s / 2, -BH / 2, BW * s, BH, g.blocks.length, night, false); ctx.restore();
        }
        if (g.phase === "topple" && g.topple) {
          const tp = g.topple; ctx.save(); ctx.translate(sx(tp.px), sy(tp.y)); ctx.rotate(tp.side * tp.th);
          blit(ctx, (tp.bx - BW / 2 - tp.px) * s, -BH, BW * s, BH, g.blocks.length, night, false); ctx.restore();
        }
        for (const d of g.debris) { ctx.save(); ctx.translate(sx(d.x), sy(d.y + 0.5)); ctx.rotate(d.rot); blit(ctx, -d.w * s / 2, -BH / 2, d.w * s, BH, 3, night, d.perfect); ctx.fillStyle = "rgba(10,12,24," + 0.15 + ")"; ctx.fillRect(-d.w * s / 2, -BH / 2, d.w * s, BH); ctx.restore(); }
        // efekt parçacıkları (dünya pikseli → kamera ötelemesi)
        if (g.fxp.length) { ctx.save(); ctx.translate(0, camPx); K.parts.draw(ctx, g.fxp); ctx.restore(); }
        for (const r of g.rings) { const y = sy(r.y + 0.5), e = easeOut(1 - r.life), gr = e * BH * 1.4; ctx.strokeStyle = "rgba(255,226,120," + r.life + ")"; ctx.lineWidth = 1 + 2.5 * r.life; rr(ctx, sx(r.x) - BW * s / 2 - gr, y - BH / 2 - gr * 0.5, BW * s + gr * 2, BH + gr, 4); ctx.stroke(); }
        for (const q of g.pops) {
          const size = Math.round(Math.max(15, BH * (q.big ? 1.1 : 0.62))), a = q.age || 0, k = a < 0.1 ? 0.4 + a * 9 : a < 0.22 ? 1.3 - (a - 0.1) * 2.5 : 1;
          const f = q.big ? K.DISP : K.COND, w = q.big ? "400" : "800", fs = fit(ctx, q.text, (VW - 24) / 1.3, size, f, w), al = Math.min(1, q.life * 1.6);
          ctx.save(); ctx.translate(clamp(sx(q.x), 70, VW - 70), sy(q.y)); ctx.scale(k, k);
          txt(ctx, q.text, 0, 3, fs, "rgba(0,0,0,0.35)", { a: al, ls: "1px", f, w });
          txt(ctx, q.text, 0, 0, fs, q.c, { a: al, stroke: 4, ls: "1px", f, w });
          ctx.restore();
        }
        if (g.streaks.length) { ctx.lineWidth = 1.2; ctx.lineCap = "round"; for (const st of g.streaks) { ctx.strokeStyle = "rgba(255,255,255," + st.a + ")"; const y = st.y * playH * 0.8; ctx.beginPath(); ctx.moveTo(st.x * VW, y); ctx.lineTo((st.x - Math.sign(st.v) * st.l) * VW, y); ctx.stroke(); } ctx.lineCap = "butt"; }
        ctx.drawImage(vignette(VW, playH), 0, 0, VW, playH);
        // rozetler
        let bx = 12;
        const pill = (label, bg) => { const size = Math.round(clamp(VW / 26, 13, 17)); ctx.font = "800 " + size + "px " + K.COND; const w = ctx.measureText(label).width + 22; ctx.fillStyle = bg; rr(ctx, bx, 12, w, size + 12, (size + 12) / 2); ctx.fill(); txt(ctx, label, bx + w / 2, 12 + (size + 12) / 2 + 1, size, "#fff", { ls: "0.5px" }); bx += w + 8; };
        if (active && !g.over) {
          const wind = windAt(g.blocks.length);
          if (wind) pill("RÜZGÂR " + (wind.dir > 0 ? "→" : "←") + " " + (wind.s > 0.9 ? "SERT" : "ORTA"), "rgba(14,17,26,0.78)");
          else if (windAt(g.blocks.length + 1)) pill("RÜZGÂR GELİYOR", "rgba(14,17,26,0.6)");
          if (g.balance > 0.7) pill("⚠ DENGE KRİTİK", "rgba(230,110,20," + (0.75 + 0.25 * Math.sin(t * 8)) + ")");
        }
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

  K._kuleFloor = drawFloor; // önizleme/test için
  K.register({
    id: "kule", name: "Kule Yarışı", color: "#ff6a3d", desc: "Vinçten bloğu bırak, kuleni dengede tutarak yükselt.",
    rules: "Blok sallanırken dokun · tam üstüne oturt · 3 can",
    timeLimit: mode => (mode === "duel" ? 60 : null),
    create, drawRemote,
  });
})();
