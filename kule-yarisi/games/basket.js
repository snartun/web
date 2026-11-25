// Basket: yukarı kaydırarak potaya at. Temiz sayı 3, çembere değip giren 2. Üst üste 3 sayı = ATEŞTE (×2).
(() => {
  "use strict";
  const { hash, clamp, lerp, rr, txt, fit, SFX, buzz } = K;
  const RIM_Y = 0.42, RIM_R = 0.06;
  function swish() { const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return; const c = AU.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = AU.noise; f.type = "bandpass"; f.frequency.setValueAtTime(2500, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.25); f.Q.value = 1.2; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); s.connect(f).connect(g).connect(AU.sfx); s.start(t); s.stop(t + 0.35); }
  function rim(v) { const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return; const c = AU.ctx, t = c.currentTime; for (const [fq, a] of [[310, 0.2 * v], [905, 0.08 * v], [1650, 0.04 * v]]) { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = fq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.001, a), t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g).connect(AU.sfx); o.start(t); o.stop(t + 0.6); } }
  function bounce(v) { if (!K.play("thud", { vol: 0.5 * v, rate: 1.3 })) SFX.thud(0.4 * v); }

  // sahne izdüşümü: z=0 atış çizgisi, z=1 pota düzlemi
  const proj = (R, x, y, z) => {
    const fy = R.y + R.h * 0.88, hy = R.y + R.h * 0.6, e = 1 - Math.pow(1 - z, 1.4), s = lerp(1, 0.72, e);
    return { x: R.x + R.w / 2 + x * R.w * 0.9 * s, y: lerp(fy, hy, e) - y * R.h * 0.9 * s, s };
  };
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

  // ---------- top: dönen deri dokusu + sabit ışıklı gölgelendirme (ikisi de bir kez üretilir) ----------
  let SPR = null;
  function sprites() {
    if (SPR) return SPR;
    const S = 128, r = S / 2;
    const tex = mk(S, S), a = tex.getContext("2d");
    a.beginPath(); a.arc(r, r, r, 0, Math.PI * 2); a.clip();
    const base = a.createRadialGradient(r * 0.8, r * 0.75, 0, r, r, r); base.addColorStop(0, "#f27a2a"); base.addColorStop(1, "#d2561a");
    a.fillStyle = base; a.fillRect(0, 0, S, S);
    const rn = K.rng(91);
    for (let i = 0; i < 1500; i++) { a.fillStyle = rn() < 0.6 ? "rgba(90,30,5,0.22)" : "rgba(255,196,150,0.18)"; a.beginPath(); a.arc(rn() * S, rn() * S, 0.7 + rn() * 0.9, 0, Math.PI * 2); a.fill(); }
    a.lineCap = "round";
    for (const [col, lw] of [["#2a1206", 4.4], ["rgba(255,170,110,0.16)", 1.2]]) {
      a.strokeStyle = col; a.lineWidth = lw;
      a.beginPath(); a.moveTo(0, r); a.bezierCurveTo(S * 0.3, r - 7, S * 0.7, r + 7, S, r); a.stroke();
      a.beginPath(); a.moveTo(r, 0); a.bezierCurveTo(r + 6, S * 0.35, r - 6, S * 0.65, r, S); a.stroke();
      a.beginPath(); a.arc(-r * 0.55, r, r * 1.15, -0.95, 0.95); a.stroke();
      a.beginPath(); a.arc(S + r * 0.55, r, r * 1.15, Math.PI - 0.95, Math.PI + 0.95); a.stroke();
    }
    const shade = mk(S, S), b = shade.getContext("2d");
    b.beginPath(); b.arc(r, r, r, 0, Math.PI * 2); b.clip();
    const sh = b.createRadialGradient(r * 0.62, r * 0.55, r * 0.05, r, r, r * 1.02);
    sh.addColorStop(0, "rgba(255,236,210,0.5)"); sh.addColorStop(0.22, "rgba(255,200,150,0.14)"); sh.addColorStop(0.55, "rgba(0,0,0,0)"); sh.addColorStop(0.85, "rgba(40,10,0,0.38)"); sh.addColorStop(1, "rgba(15,4,0,0.75)");
    b.fillStyle = sh; b.fillRect(0, 0, S, S);
    b.strokeStyle = "rgba(255,190,140,0.32)"; b.lineWidth = 3; b.beginPath(); b.arc(r, r, r - 2.5, 0.2, 1.45); b.stroke();
    const sp = b.createRadialGradient(r * 0.6, r * 0.48, 0, r * 0.6, r * 0.48, r * 0.26); sp.addColorStop(0, "rgba(255,255,255,0.6)"); sp.addColorStop(1, "rgba(255,255,255,0)");
    b.fillStyle = sp; b.fillRect(0, 0, S, S);
    const shadow = mk(64, 64), c = shadow.getContext("2d"), sg = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "rgba(0,0,0,0.6)"); sg.addColorStop(0.5, "rgba(0,0,0,0.25)"); sg.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = sg; c.fillRect(0, 0, 64, 64);
    const glow = mk(64, 64), d = glow.getContext("2d"), gg = d.createRadialGradient(32, 32, 0, 32, 32, 32);
    gg.addColorStop(0, "rgba(255,250,220,1)"); gg.addColorStop(0.25, "rgba(255,190,80,0.8)"); gg.addColorStop(0.6, "rgba(255,90,20,0.3)"); gg.addColorStop(1, "rgba(255,60,0,0)"); d.fillStyle = gg; d.fillRect(0, 0, 64, 64);
    const white = mk(64, 64), e = white.getContext("2d"), wg = e.createRadialGradient(32, 32, 0, 32, 32, 32);
    wg.addColorStop(0, "rgba(255,255,255,1)"); wg.addColorStop(0.3, "rgba(255,250,235,0.5)"); wg.addColorStop(1, "rgba(255,245,225,0)"); e.fillStyle = wg; e.fillRect(0, 0, 64, 64);
    return (SPR = { tex, shade, shadow, glow, white });
  }

  // ---------- salon katmanları (boyut başına bir kez): A arka plan+tavan, C seyirci (bulanık), F ışık konisi+reklam bandı+parke ----------
  let LAY = null;
  function person(ctx, x, y, sc, lit, rn) {
    const shirts = ["#e0661c", "#1f3a6b", "#d9dde6", "#1a1c22", "#b8322a", "#1f8a8a", "#e0661c", "#3c4250"];
    const skins = ["#e8b48f", "#c98e64", "#8d5a3b", "#f1c7a6"];
    const dark = [8, 10, 18], c = K.css(K.mix(K.hex(shirts[(rn() * shirts.length) | 0]), dark, 1 - lit)), sk = K.css(K.mix(K.hex(skins[(rn() * skins.length) | 0]), dark, 1 - lit));
    ctx.fillStyle = c; rr(ctx, x - 5 * sc, y - 2 * sc, 10 * sc, 13 * sc, 4 * sc); ctx.fill();
    if (rn() < 0.16) { ctx.strokeStyle = sk; ctx.lineWidth = 2.2 * sc; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - 4 * sc, y); ctx.lineTo(x - 6 * sc, y - 11 * sc); ctx.moveTo(x + 4 * sc, y); ctx.lineTo(x + 6.5 * sc, y - 10 * sc); ctx.stroke(); }
    ctx.fillStyle = sk; ctx.beginPath(); ctx.arc(x, y - 5.5 * sc, 3.6 * sc, 0, Math.PI * 2); ctx.fill();
    if (rn() < 0.3) { ctx.fillStyle = K.css(K.mix([40, 26, 18], dark, 1 - lit)); ctx.beginPath(); ctx.arc(x, y - 6.6 * sc, 3.6 * sc, Math.PI, 0); ctx.fill(); }
  }
  function layers(R) {
    const fontsOK = !document.fonts || document.fonts.status === "loaded";
    const key = R.w + "x" + R.h + (fontsOK ? "f" : "");
    if (LAY && LAY.key === key) return LAY;
    const d = dpr(), W = R.w, H = R.h, L = { x: 0, y: 0, w: W, h: H };
    const make = () => { const c = mk(W * d, H * d), x = c.getContext("2d"); x.scale(d, d); return [c, x]; };
    const lightsX = [0.12, 0.31, 0.5, 0.69, 0.88];
    // A: koyu salon + tavan ışıkları
    const [A, a] = make();
    const bg = a.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#04050a"); bg.addColorStop(0.3, "#0b0e18"); bg.addColorStop(0.56, "#161a27"); bg.addColorStop(1, "#0d0f16");
    a.fillStyle = bg; a.fillRect(0, 0, W, H);
    a.strokeStyle = "rgba(120,130,150,0.12)"; a.lineWidth = 1;
    for (let i = 0; i <= 10; i++) { a.beginPath(); a.moveTo(i * W / 10, 0); a.lineTo(W / 2 + (i * W / 10 - W / 2) * 0.6, H * 0.07); a.stroke(); }
    a.beginPath(); a.moveTo(0, H * 0.07); a.lineTo(W, H * 0.07); a.stroke();
    for (const lx of lightsX) {
      const x = lx * W, y = H * 0.035, gl = a.createRadialGradient(x, y, 0, x, y, W * 0.16);
      gl.addColorStop(0, "rgba(255,244,220,0.42)"); gl.addColorStop(0.3, "rgba(255,236,200,0.12)"); gl.addColorStop(1, "rgba(255,236,200,0)");
      a.fillStyle = gl; a.fillRect(x - W * 0.16, y - W * 0.16, W * 0.32, W * 0.32);
      a.fillStyle = "#fffaf0"; a.beginPath(); a.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2); a.fill();
    }
    // C: seyirci — arka sıralar daha düşük çözünürlükte (daha bulanık): alan derinliği
    const [C, c] = make();
    const RN = 13, rn = K.rng(1234), rowY = r => H * (0.1 + 0.42 * Math.pow(r / (RN - 1), 1.2));
    const spot = x => 0.5 + 0.5 * Math.exp(-Math.pow((x - W / 2) / (W * 0.38), 2));
    for (const [r0, r1, q] of [[0, 7, 0.24], [7, RN, 0.4]]) {
      const lo = mk(W * q, H * q), lx = lo.getContext("2d"); lx.scale(q, q);
      for (let r = r0; r < r1; r++) {
        const y = rowY(r), sc = 0.55 + r * 0.075, sp = 10.5 * sc, rl = 0.22 + 0.78 * (r / RN);
        lx.fillStyle = "rgba(34,38,54," + (0.5 + rl * 0.4) + ")"; lx.fillRect(0, y + 5 * sc, W, 4 * sc);
        for (let x = -sp + (r % 2) * sp * 0.5; x < W + sp; x += sp * (0.85 + rn() * 0.35)) { if (rn() < 0.07) continue; person(lx, x, y, sc, rl * spot(x) * 0.72, rn); }
      }
      c.imageSmoothingEnabled = true; if ("imageSmoothingQuality" in c) c.imageSmoothingQuality = "high";
      c.drawImage(lo, 0, 0, W, H);
    }
    const haze = c.createLinearGradient(0, H * 0.06, 0, H * 0.4); haze.addColorStop(0, "rgba(6,8,14,0.85)"); haze.addColorStop(1, "rgba(30,36,56,0)");
    c.fillStyle = haze; c.fillRect(0, 0, W, H * 0.4);
    // F: ışık konisi, LED reklam bandı, cilalı parke
    const [F, f] = make();
    const fy = H * 0.56;
    const cone = f.createLinearGradient(0, 0, 0, H); cone.addColorStop(0, "rgba(255,240,215,0.13)"); cone.addColorStop(0.6, "rgba(255,240,215,0.05)"); cone.addColorStop(1, "rgba(255,240,215,0.02)");
    f.fillStyle = cone; f.beginPath(); f.moveTo(W * 0.44, 0); f.lineTo(W * 0.56, 0); f.lineTo(W * 1.05, H); f.lineTo(-W * 0.05, H); f.fill();
    f.fillStyle = "rgba(255,244,225,0.05)"; f.beginPath(); f.moveTo(W * 0.47, 0); f.lineTo(W * 0.53, 0); f.lineTo(W * 0.78, H); f.lineTo(W * 0.22, H); f.fill();
    const bTop = H * 0.515;
    f.fillStyle = "#07080d"; f.fillRect(0, bTop - 2, W, fy - bTop + 2);
    const led = f.createLinearGradient(0, bTop, 0, fy); led.addColorStop(0, "#1a0c04"); led.addColorStop(0.5, "#2a1306"); led.addColorStop(1, "#140803");
    f.fillStyle = led; f.fillRect(0, bTop, W, fy - bTop);
    const bh = fy - bTop, ls = "BASKET · DÜELLO ARENASI · ";
    f.save(); f.beginPath(); f.rect(0, bTop, W, bh); f.clip(); f.shadowColor = "rgba(255,120,40,0.8)"; f.shadowBlur = 6;
    f.font = "400 " + Math.round(bh * 0.55) + "px " + K.DISP; const tw = f.measureText(ls).width || 200;
    for (let x = -tw * 0.3; x < W; x += tw) txt(f, ls, x, bTop + bh / 2 + 1, Math.round(bh * 0.55), "#ff8a3a", { f: K.DISP, w: "400", align: "left" });
    f.restore();
    f.fillStyle = "rgba(0,0,0,0.35)"; for (let y = bTop; y < fy; y += 2) f.fillRect(0, y, W, 1); // LED tarama çizgileri
    f.fillStyle = "rgba(255,255,255,0.18)"; f.fillRect(0, bTop, W, 1);
    // parke
    const pg = f.createLinearGradient(0, fy, 0, H); pg.addColorStop(0, "#5e3518"); pg.addColorStop(0.35, "#8f5629"); pg.addColorStop(1, "#c88a4e");
    f.fillStyle = pg; f.fillRect(0, fy, W, H - fy);
    const strip = i => [proj(L, i * 0.12, 0, 1), { x: proj(L, i * 0.12, 0, 0).x + i * W * 0.05, y: H }];
    for (let i = -13; i <= 12; i++) {
      const [a0, b0] = strip(i), [a1, b1] = strip(i + 1), v = hash(i + 40, 7);
      f.fillStyle = v < 0.5 ? "rgba(60,25,5," + (0.04 + v * 0.12) + ")" : "rgba(255,210,150," + ((v - 0.5) * 0.12) + ")";
      f.beginPath(); f.moveTo(a0.x, fy); f.lineTo(a1.x, fy); f.lineTo(b1.x, b1.y); f.lineTo(b0.x, b0.y); f.fill();
      for (let k = 0; k < 6; k++) { const u = (k + hash(i, k + 9)) / 6, y = lerp(fy, H, u * u), x0 = lerp(a0.x, b0.x, u * u), x1 = lerp(a1.x, b1.x, u * u); f.fillStyle = "rgba(50,20,5,0.3)"; f.fillRect(x0, y, x1 - x0, 1); }
    }
    f.strokeStyle = "rgba(55,25,8,0.4)"; f.lineWidth = 1;
    for (let i = -12; i <= 12; i++) { const [a0, b0] = strip(i); f.beginPath(); f.moveTo(a0.x, fy); f.lineTo(b0.x, b0.y); f.stroke(); }
    // saha çizgileri: boya alanı, serbest atış yayı, dip çizgi, üçlük yayı
    const k0 = proj(L, -0.32, 0, 0.55), k1 = proj(L, 0.32, 0, 0.55), k2 = proj(L, 0.32, 0, 1), k3 = proj(L, -0.32, 0, 1);
    f.fillStyle = "rgba(255,106,26,0.2)"; f.beginPath(); f.moveTo(k3.x, k3.y); f.lineTo(k0.x, k0.y); f.lineTo(k1.x, k1.y); f.lineTo(k2.x, k2.y); f.fill();
    f.strokeStyle = "rgba(255,255,255,0.6)"; f.lineWidth = 2;
    f.beginPath(); f.moveTo(k3.x, k3.y); f.lineTo(k0.x, k0.y); f.lineTo(k1.x, k1.y); f.lineTo(k2.x, k2.y); f.stroke();
    const kc = proj(L, 0, 0, 0.55), krx = (k1.x - k0.x) / 2;
    f.beginPath(); f.ellipse(kc.x, kc.y, krx, krx * 0.24, 0, 0, Math.PI); f.stroke();
    f.setLineDash([6, 6]); f.beginPath(); f.ellipse(kc.x, kc.y, krx, krx * 0.24, 0, Math.PI, Math.PI * 2); f.stroke(); f.setLineDash([]);
    const bl0 = proj(L, -2, 0, 1), bl1 = proj(L, 2, 0, 1); f.beginPath(); f.moveTo(bl0.x, bl0.y); f.lineTo(bl1.x, bl1.y); f.stroke();
    const hc = proj(L, 0, 0, 1); f.lineWidth = 2.5; f.beginPath(); f.ellipse(hc.x, hc.y, W * 0.47, H * 0.2, 0, 0.08, Math.PI - 0.08); f.stroke();
    // cila: spot ışığının ve tavan lambalarının yansımaları
    const sh = f.createRadialGradient(0, 0, 0, 0, 0, 1); sh.addColorStop(0, "rgba(255,240,220,0.22)"); sh.addColorStop(1, "rgba(255,240,220,0)");
    f.save(); f.translate(W / 2, H * 0.76); f.scale(W * 0.42, H * 0.12); f.fillStyle = sh; f.beginPath(); f.arc(0, 0, 1, 0, Math.PI * 2); f.fill(); f.restore();
    for (const lx of lightsX) { f.save(); f.translate(W / 2 + (lx - 0.5) * W * 1.3, H * 0.66); f.scale(W * 0.025, H * 0.1); f.fillStyle = sh; f.globalAlpha = 0.55; f.beginPath(); f.arc(0, 0, 1, 0, Math.PI * 2); f.fill(); f.restore(); }
    const wallAO = f.createLinearGradient(0, fy, 0, fy + H * 0.05); wallAO.addColorStop(0, "rgba(0,0,0,0.45)"); wallAO.addColorStop(1, "rgba(0,0,0,0)");
    f.fillStyle = wallAO; f.fillRect(0, fy, W, H * 0.05);
    const side = f.createLinearGradient(0, 0, W, 0); side.addColorStop(0, "rgba(0,0,0,0.35)"); side.addColorStop(0.25, "rgba(0,0,0,0)"); side.addColorStop(0.75, "rgba(0,0,0,0)"); side.addColorStop(1, "rgba(0,0,0,0.35)");
    f.fillStyle = side; f.fillRect(0, fy, W, H - fy);
    // B: direk + panya (cam) — pota düzlemindeki sabit yükseklik; yalnız x kayar
    const hp0 = proj(L, 0, RIM_Y, 1), s = hp0.s * W * 0.9, bw = s * 0.36, bhh = s * 0.22, poleB = H * 0.58 - hp0.y, top = -bhh * 0.92 - 6;
    const B = mk((bw + 24) * d, (poleB - top + 8) * d), b = B.getContext("2d"); b.scale(d, d); b.translate(bw / 2 + 12, -top);
    b.fillStyle = "rgba(0,0,0,0.45)"; b.beginPath(); b.ellipse(-s * 0.02, poleB, s * 0.1, 3, 0, 0, Math.PI * 2); b.fill();
    const pw = s * 0.018, pole = b.createLinearGradient(-pw, 0, pw, 0); pole.addColorStop(0, "#14161b"); pole.addColorStop(0.65, "#4d5360"); pole.addColorStop(1, "#1c1f25");
    b.fillStyle = pole; b.fillRect(-pw, -s * 0.05, pw * 2, poleB + s * 0.05);
    const pad = b.createLinearGradient(-s * 0.04, 0, s * 0.04, 0); pad.addColorStop(0, "#0f1a30"); pad.addColorStop(0.65, "#2b4a80"); pad.addColorStop(1, "#14223d");
    b.fillStyle = pad; rr(b, -s * 0.04, poleB - s * 0.07, s * 0.08, s * 0.07, 3); b.fill();
    const gx = -bw / 2, gy = -bhh * 0.92;
    b.strokeStyle = "#2a2e37"; b.lineWidth = 2.5; b.beginPath(); b.moveTo(0, -s * 0.03); b.lineTo(gx + bw * 0.2, gy + bhh * 0.3); b.moveTo(0, -s * 0.03); b.lineTo(gx + bw * 0.8, gy + bhh * 0.3); b.stroke();
    const glass = b.createLinearGradient(0, gy, 0, gy + bhh); glass.addColorStop(0, "rgba(215,235,250,0.32)"); glass.addColorStop(1, "rgba(160,195,225,0.14)");
    b.fillStyle = glass; rr(b, gx, gy, bw, bhh, 3); b.fill();
    b.save(); rr(b, gx, gy, bw, bhh, 3); b.clip();
    b.fillStyle = "rgba(255,255,255,0.2)"; b.beginPath(); b.moveTo(gx + bw * 0.08, gy + bhh); b.lineTo(gx + bw * 0.38, gy); b.lineTo(gx + bw * 0.52, gy); b.lineTo(gx + bw * 0.22, gy + bhh); b.fill();
    b.fillStyle = "rgba(255,255,255,0.09)"; b.beginPath(); b.moveTo(gx + bw * 0.58, gy + bhh); b.lineTo(gx + bw * 0.88, gy); b.lineTo(gx + bw * 0.93, gy); b.lineTo(gx + bw * 0.63, gy + bhh); b.fill();
    const tg = b.createLinearGradient(0, gy, 0, gy + bhh * 0.3); tg.addColorStop(0, "rgba(255,255,255,0.22)"); tg.addColorStop(1, "rgba(255,255,255,0)"); b.fillStyle = tg; b.fillRect(gx, gy, bw, bhh * 0.3);
    b.restore();
    b.strokeStyle = "rgba(0,0,0,0.35)"; b.lineWidth = 1; rr(b, gx + 2.5, gy + 2.5, bw - 5, bhh - 5, 2); b.stroke();
    const fr = b.createLinearGradient(0, gy, 0, gy + bhh); fr.addColorStop(0, "#ffffff"); fr.addColorStop(1, "#aeb6c2");
    b.strokeStyle = fr; b.lineWidth = 3; rr(b, gx, gy, bw, bhh, 3); b.stroke();
    b.shadowColor = "rgba(255,106,26,0.6)"; b.shadowBlur = 4; b.strokeStyle = "#ff6a1a"; b.lineWidth = 2.2; b.strokeRect(-bw * 0.17, gy + bhh * 0.45, bw * 0.34, bhh * 0.42); b.shadowBlur = 0;
    b.fillStyle = "#1c1f26"; b.fillRect(gx + 2, gy + bhh - 3.5, bw - 4, 3);
    const rw = RIM_R * s * 1.6; b.fillStyle = "#3a3f4a"; b.fillRect(-4, -rw * 0.28 - 4, 8, 6); b.fillStyle = "rgba(255,255,255,0.3)"; b.fillRect(-4, -rw * 0.28 - 4, 8, 1);
    LAY = { key, A, C, F, B, bOx: -(bw / 2 + 12), bOy: top, bW: bw + 24, bH: poleB - top + 8, poleB, rw, s };
    return LAY;
  }
  let VIG = null;
  function vignette(w, h) {
    if (VIG && VIG.w === w && VIG.h === h) return VIG.c;
    const c = mk(w / 2, h / 2), x = c.getContext("2d"), gr = x.createRadialGradient(c.width / 2, c.height * 0.55, Math.min(c.width, c.height) * 0.3, c.width / 2, c.height * 0.55, Math.hypot(c.width, c.height) * 0.6);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.5)"); x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height);
    VIG = { w, h, c }; return c;
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, n: 0, made: 0, streak: 0, phase: "aim", t: 0, ball: null, swipe: null, hoopX: 0, netSw: 0, msg: "", msgC: "#fff", msgT: 0, msgT0: 1, pops: [], parts: [], R: null, clock: 0, fire: [],
      sqA: 0, sqT: 9, spawnT: 1, rimWob: 0, boardWob: 0, cheer: 0, flashes: [], trail: [] };
    const startX = () => (hash(seed, g.n * 3 + 1) - 0.5) * 0.5;
    g.ball = { x: startX(), y: 0, z: 0, spin: 0, sx: 0 };
    // görsel yay: + uzama (dikey), − basılma (yatay); kısa sönümlü salınım
    const squash = a => { g.sqA = a; g.sqT = 0; };
    function shoot(sw) {
      const R = g.R, dx = sw.x1 - sw.x0, dy = sw.y0 - sw.y1;
      if (dy < 40) return;
      const ideal = R.h * 0.42, perr = clamp(dy / ideal - 1, -0.8, 0.8);
      const aimX = g.ball.x + (dx / (R.w * 0.5)) * 0.5;
      const ex = aimX - g.hoopX, ax = Math.abs(ex), ap = Math.abs(perr);
      let res;
      if (ax < 0.022 && ap < 0.09) res = "swish";
      else if (ax < 0.05 && ap < 0.17) res = "in";
      else if (ax < 0.09 && ap < 0.28) res = "rimout";
      else res = perr > 0.25 ? "board" : "miss";
      const endY = RIM_Y + 0.02 + perr * 0.18;
      g.shot = { res, ex, perr, sx: g.ball.x, ex2: g.hoopX + ex, ey: res === "swish" || res === "in" ? RIM_Y + 0.015 : endY, T: 0.85, t: 0, apex: 0.55 + Math.max(0, perr) * 0.2 };
      g.phase = "fly"; g.n++;
      if (!K.play("drop", { vol: 0.5, rate: 0.7 })) SFX.pop(true);
      const bp = proj(R, g.ball.x, 0, 0); squash(0.28); K.kick(0.05); K.parts.dust(g.parts, bp.x, bp.y + R.w * 0.05, "rgb(150,110,80)", 5, 40); g.trail = [];
    }
    function crowdFlash(n) { for (let i = 0; i < n; i++) g.flashes.push({ x: Math.random(), y: 0.12 + Math.random() * 0.36, life: 0.12 + Math.random() * 0.08, d: Math.random() * 0.35 }); }
    function settle() {
      const s = g.shot, R = g.R, hp = proj(R, g.hoopX, RIM_Y, 1), rw = RIM_R * hp.s * R.w * 0.9 * 1.6;
      if (s.res === "swish" || s.res === "in") {
        g.streak++; g.made++;
        const fireOn = g.streak >= 3, base = s.res === "swish" ? 3 : 2, pts = base * (fireOn ? 2 : 1);
        g.score += pts; g.netSw = 1;
        if (s.res === "swish") swish(); else { rim(0.7); setTimeout(swish, 120); }
        g.msg = s.res === "swish" ? (fireOn ? "ATEŞTE! TEMİZ!" : "TEMİZ SAYI!") : fireOn ? "ATEŞTE!" : "SAYI!"; g.msgC = fireOn ? "#ff7a2e" : "#ffd34d"; g.msgT = 1; g.msgT0 = 1;
        K.pops.add(g.pops, "+" + pts, hp.x, hp.y - 30, fireOn ? "#ff7a2e" : "#ffd34d", true);
        K.parts.burst(g.parts, hp.x, hp.y, fireOn ? "#ff7a2e" : "#ffffff", 18, 200);
        const big = s.res === "swish";
        K.hitstop(big ? 0.07 : 0.05); K.kick((big ? 0.16 : 0.12) + (fireOn ? 0.08 : 0)); K.flash(big ? 0.14 : 0.08, fireOn ? "#ff9a3c" : "#fff4d6");
        K.parts.ring(g.parts, hp.x, hp.y, fireOn ? "#ffb070" : "#ffffff", rw * 3.4, big ? 5 : 3);
        if (big || fireOn) K.parts.confetti(g.parts, hp.x, hp.y - rw, 16 + Math.min(20, g.streak * 3), 320, fireOn ? ["#ff7a2e", "#ffd34d", "#ff4d1a", "#ffffff"] : null);
        if (!big) { K.parts.spark(g.parts, hp.x + Math.sign(s.ex || 1) * rw, hp.y, "#ffd9a0", 10, 220); g.rimWob = 0.7; }
        g.cheer = big ? 1 : 0.6; crowdFlash(big ? 7 : 3);
        SFX.chime(Math.min(10, 2 + g.streak)); buzz(s.res === "swish" ? [20, 30, 40] : 20);
        if (g.streak === 3) { SFX.milestone(); K.kick(0.3); K.flash(0.25, "#ff7a2e"); K.parts.confetti(g.parts, R.x + R.w / 2, R.y + R.h * 0.3, 40, 420, ["#ff7a2e", "#ffd34d", "#ff4d1a", "#ffffff"]); crowdFlash(10); }
      } else {
        if (g.streak >= 3) { g.msg = "ATEŞ SÖNDÜ"; g.msgC = "#a3a9b8"; g.msgT = 1; }
        else { g.msg = s.res === "rimout" ? "ÇEMBERDEN DÖNDÜ" : s.res === "board" ? "PANYA!" : "KISA KALDI"; g.msgC = "#cfd6e6"; g.msgT = 0.9; }
        g.msgT0 = g.msgT;
        g.streak = 0;
        if (s.res === "rimout") { rim(1); K.kick(0.2); K.hitstop(0.04); g.rimWob = 1; g.netSw = 0.3; K.parts.spark(g.parts, hp.x + Math.sign(s.ex || 1) * rw, hp.y, "#ffe0b0", 14, 260); }
        else if (s.res === "board") { rim(0.3); bounce(1); K.kick(0.15); g.boardWob = 1; const bp = proj(R, g.ball.x, g.ball.y, 1); K.parts.spark(g.parts, bp.x, bp.y, "#e8f4ff", 7, 170); K.parts.ring(g.parts, bp.x, bp.y, "rgba(220,240,255,0.8)", rw * 1.6, 2); }
        else bounce(0.6);
      }
      g.phase = "after"; g.t = 0;
    }
    function drawBall(ctx, x, y, r, spin, kx, ky, alpha) {
      const S = sprites();
      ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.translate(x, y); ctx.scale(kx, ky);
      ctx.save(); ctx.rotate(spin); ctx.drawImage(S.tex, -r, -r, r * 2, r * 2); ctx.restore();
      ctx.drawImage(S.shade, -r, -r, r * 2, r * 2);
      ctx.restore();
    }
    // file: 12 düğüm × 4 sıra elmas örgü; top içinden geçerken şişer, sayıda uzayıp sallanır
    function netNodes(hp, rw, netL, ball) {
      const N = 12, J = 4, sway = Math.sin(g.clock * 16) * g.netSw * 3, L = netL * (1 + 0.28 * g.netSw * (0.6 + 0.4 * Math.cos(g.clock * 12))), out = [];
      for (let j = 0; j <= J; j++) {
        const tj = j / J; let r = rw * (1 - 0.45 * tj);
        if (ball) { const dd = (ball.y - hp.y) / netL; if (dd > -0.3 && dd < 1.4) r *= 1 + Math.min(0.42, ball.r / rw * 0.38) * Math.exp(-((tj - dd) * (tj - dd)) / 0.06); }
        const row = [];
        for (let i = 0; i < N; i++) { const th = ((i + (j % 2) * 0.5) / N) * Math.PI * 2; row.push({ x: hp.x + r * Math.cos(th) + sway * tj, y: hp.y + L * tj + r * 0.28 * Math.sin(th), f: Math.sin(th) }); }
        out.push(row);
      }
      return out;
    }
    function drawNet(ctx, nodes, front) {
      const N = nodes[0].length;
      ctx.strokeStyle = front ? "rgba(250,250,250,0.9)" : "rgba(200,205,215,0.4)"; ctx.lineWidth = front ? 1.1 : 0.9;
      ctx.beginPath();
      for (let j = 0; j < nodes.length - 1; j++) for (let i = 0; i < N; i++) {
        const a = nodes[j][i], o = j % 2, b1 = nodes[j + 1][(i - 1 + o + N) % N], b2 = nodes[j + 1][(i + o) % N];
        if ((a.f + b1.f > 0) === front) { ctx.moveTo(a.x, a.y); ctx.lineTo(b1.x, b1.y); }
        if ((a.f + b2.f > 0) === front) { ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); }
      }
      ctx.stroke();
    }
    function drawRim(ctx, hp, rw, s, front) {
      const lw = Math.max(3, s * 0.012), y = hp.y + Math.sin(g.clock * 45) * g.rimWob * 1.6;
      const gr = ctx.createLinearGradient(hp.x - rw, 0, hp.x + rw, 0);
      gr.addColorStop(0, "#7a2405"); gr.addColorStop(0.3, "#e2500f"); gr.addColorStop(0.45, "#ffb27a"); gr.addColorStop(0.6, "#ff6a1a"); gr.addColorStop(1, "#8a2a05");
      const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : Math.PI * 2;
      ctx.strokeStyle = "rgba(60,15,0,0.8)"; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(hp.x, y + 1, rw, rw * 0.28, 0, a0, a1); ctx.stroke();
      ctx.strokeStyle = gr; ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(hp.x, y, rw, rw * 0.28, 0, a0, a1); ctx.stroke();
      if (front) { ctx.strokeStyle = "rgba(255,235,210,0.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(hp.x, y - lw * 0.3, rw, rw * 0.28, 0, Math.PI * 0.55, Math.PI * 0.8); ctx.stroke(); }
    }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      _g: g,
      info() { return { extra: g.made + "/" + g.n + " isabet" + (g.streak >= 3 ? " · ATEŞTE ×2" : g.streak ? " · seri " + g.streak : "") }; },
      update(dt) {
        g.clock += dt; g.msgT = Math.max(0, g.msgT - dt); g.netSw = Math.max(0, g.netSw - dt * 1.8);
        g.sqT += dt; g.spawnT += dt; g.rimWob = Math.max(0, g.rimWob - dt * 3.5); g.boardWob = Math.max(0, g.boardWob - dt * 4); g.cheer = Math.max(0, g.cheer - dt * 1.2);
        for (const f of g.flashes) { if (f.d > 0) f.d -= dt; else f.life -= dt; } g.flashes = g.flashes.filter(f => f.life > 0);
        // pota 6 isabetten sonra sağa sola kaymaya başlar (tohumlu hız)
        if (g.made >= 6) g.hoopX = Math.sin(g.clock * (0.7 + hash(seed, 9) * 0.5 + g.made * 0.02)) * Math.min(0.28, 0.08 + (g.made - 6) * 0.02);
        if (g.phase === "fly") {
          const s = g.shot; s.t += dt; const u = clamp(s.t / s.T, 0, 1);
          g.ball.z = u; g.ball.x = lerp(s.sx, s.ex2, u); g.ball.y = lerp(0, s.ey, u) + s.apex * 4 * u * (1 - u); g.ball.spin -= dt * 14;
          if (u >= 1) settle();
        } else if (g.phase === "after") {
          g.t += dt; const s = g.shot;
          g.ball.spin -= dt * 6;
          if (s.res === "swish" || s.res === "in") { g.ball.y -= dt * 0.6; g.ball.x = lerp(g.ball.x, g.hoopX, dt * 8); }
          else if (s.res === "rimout") { g.ball.x += Math.sign(s.ex || 1) * dt * 0.35; g.ball.y += (0.1 - g.t * 1.2) * dt * 3; }
          else {
            const was = g.ball.y; g.ball.y = Math.max(0, g.ball.y - dt * 0.9); g.ball.z = Math.max(0.6, g.ball.z - dt * 0.4);
            if (was > 0 && g.ball.y === 0 && g.R) { const p = proj(g.R, g.ball.x, 0, g.ball.z); squash(-0.3); K.kick(0.06); K.parts.dust(g.parts, p.x, p.y, "rgb(150,110,80)", 6, 50); }
          }
          if (g.t > 0.55) { g.phase = "aim"; g.ball = { x: startX(), y: 0, z: 0, spin: 0 }; g.spawnT = 0; }
        }
        if (g.streak >= 3 && g.phase !== "after" && g.fire.length < 60) g.fire.push({ x: g.ball.x + (Math.random() - 0.5) * 0.03, y: g.ball.y, z: g.ball.z, life: 0.5, s: 0.7 + Math.random() * 0.6 });
        for (const f of g.fire) { f.life -= dt; f.y += dt * 0.15; } g.fire = g.fire.filter(f => f.life > 0);
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (!g.R || g.over || g.phase !== "aim") return;
        if (type === "down") { const b = proj(g.R, g.ball.x, 0, 0); if (Math.hypot(x - b.x, y - b.y) < g.R.w * 0.28) g.swipe = { x0: x, y0: y, x1: x, y1: y }; }
        else if (type === "move" && g.swipe) { g.swipe.x1 = x; g.swipe.y1 = y; }
        else if ((type === "up" || type === "cancel") && g.swipe) { const sw = g.swipe; g.swipe = null; if (type === "up") shoot(sw); }
      },
      net() { return { m: g.made, n: g.n, f: g.streak >= 3 ? 1 : 0, h: Math.round(g.hoopX * 100) }; },
      draw(ctx, R) {
        g.R = R;
        const LY = layers(R), S = sprites(), fire = g.streak >= 3;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        // salon katmanları (önbellekten); seyirci sayıda zıplar
        ctx.drawImage(LY.A, R.x, R.y, R.w, R.h);
        const jump = g.cheer > 0 ? -Math.abs(Math.sin(g.clock * 13)) * g.cheer * 4 : 0;
        ctx.drawImage(LY.C, R.x, R.y + jump, R.w, R.h);
        for (const f of g.flashes) if (f.d <= 0) { const fx = R.x + f.x * R.w, fy = R.y + f.y * R.h, z = 10 + 14 * (f.life / 0.2); ctx.globalAlpha = Math.min(1, f.life * 8); ctx.drawImage(S.white, fx - z / 2, fy - z / 2, z, z); }
        ctx.globalAlpha = 1;
        ctx.drawImage(LY.F, R.x, R.y, R.w, R.h);
        if (fire) { const fg = ctx.createLinearGradient(0, R.y + R.h * 0.5, 0, R.y + R.h); fg.addColorStop(0, "rgba(255,90,20,0)"); fg.addColorStop(1, "rgba(255,90,20," + (0.1 + 0.04 * Math.sin(g.clock * 2)) + ")"); ctx.fillStyle = fg; ctx.fillRect(R.x, R.y + R.h * 0.5, R.w, R.h * 0.5); }
        const hp = proj(R, g.hoopX, RIM_Y, 1), s = hp.s * R.w * 0.9, rw = RIM_R * s * 1.6, netL = s * 0.11;
        const poleY = R.y + R.h * 0.58, bwob = Math.sin(g.clock * 30) * g.boardWob * 1.5;
        // cilalı zeminde pota yansıması
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, poleY, R.w, R.h * 0.1); ctx.clip(); ctx.globalAlpha = 0.11; ctx.translate(0, poleY * 2); ctx.scale(1, -1);
        ctx.drawImage(LY.B, hp.x + LY.bOx, hp.y + LY.bOy, LY.bW, LY.bH); ctx.restore();
        // top gölgesi (yükseldikçe büyür ve silikleşir) + zemindeyken yansıması
        const b = g.ball, bp = proj(R, b.x, b.y, b.z), shp = proj(R, b.x, 0, b.z), br0 = Math.max(6, bp.s * R.w * 0.06);
        const sk = clamp(1 - b.y * 1.6, 0.2, 1), shw = br0 * (2.6 - sk * 0.6), shh = br0 * (0.75 - sk * 0.1);
        const cY = shp.y + br0 * 0.85; ctx.globalAlpha = sk; ctx.drawImage(S.shadow, shp.x - shw / 2, cY - shh / 2, shw, shh); ctx.globalAlpha = 1;
        // direk + panya, çember (arka yarı), file (arka)
        ctx.drawImage(LY.B, hp.x + LY.bOx, hp.y + LY.bOy + bwob, LY.bW, LY.bH);
        drawRim(ctx, hp, rw, s, false);
        const behind = b.z > 0.95 && b.y < RIM_Y + 0.02;
        // top yayı: kalkışta uzar, zemine çarpınca basılır; yeni top yaylanarak belirir
        const sq = g.sqA * Math.exp(-g.sqT * 9) * Math.cos(g.sqT * 22), press = g.swipe ? 1.06 : 1, pop = g.spawnT < 0.3 ? 0.6 + 0.4 * Math.sin(Math.min(1, g.spawnT / 0.3) * Math.PI * 0.5) + Math.sin(g.spawnT / 0.3 * Math.PI) * 0.12 : 1;
        const br = br0 * press * pop, kx = 1 - sq * 0.8, ky = 1 + sq;
        const nodes = netNodes(hp, rw, netL, behind ? { y: bp.y, r: br } : null);
        drawNet(ctx, nodes, false);
        const ballLayer = () => {
          // hareket izi
          if (g.phase === "fly") { g.trail.push({ x: bp.x, y: bp.y, r: br }); if (g.trail.length > 9) g.trail.shift(); } else if (g.trail.length) g.trail.shift();
          for (let i = 0; i < g.trail.length - 1; i++) { const p = g.trail[i], k = (i + 1) / g.trail.length; ctx.fillStyle = fire ? "rgba(255,120,40," + 0.22 * k + ")" : "rgba(255,200,150," + 0.14 * k + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.5 + 0.5 * k), 0, Math.PI * 2); ctx.fill(); }
          // ateş: renk doğarken sabitlenir (titreşmez), toplamalı parıltı
          if (g.fire.length) { ctx.globalCompositeOperation = "lighter"; for (const f of g.fire) { const p = proj(R, f.x, f.y, f.z), z = 26 * p.s * f.s * (0.4 + f.life * 1.4); ctx.globalAlpha = Math.min(1, f.life * 1.8); ctx.drawImage(S.glow, p.x - z / 2, p.y - z / 2 - (0.5 - f.life) * 20, z, z); } ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; }
          if (g.swipe) { ctx.globalAlpha = 0.5; ctx.drawImage(S.white, bp.x - br * 1.8, bp.y - br * 1.8, br * 3.6, br * 3.6); ctx.globalAlpha = 1; }
          if (b.y < 0.12 && !behind) drawBall(ctx, bp.x, cY * 2 - bp.y, br, -b.spin, kx, -ky, 0.1 * (1 - b.y / 0.12));
          drawBall(ctx, bp.x, bp.y + (sq < 0 ? br * (1 - ky) : 0), br, b.spin, kx, ky);
        };
        if (behind) ballLayer();
        drawNet(ctx, nodes, true);
        drawRim(ctx, hp, rw, s, true);
        if (!behind) ballLayer();
        // kaydırma izi: incelen ışık şeridi
        if (g.swipe) {
          const sw = g.swipe, dx = sw.x1 - sw.x0, dy = sw.y1 - sw.y0, l = Math.hypot(dx, dy);
          if (l > 4) {
            const nx = -dy / l, ny = dx / l, gr = ctx.createLinearGradient(sw.x0, sw.y0, sw.x1, sw.y1); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,0.6)");
            ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(sw.x0 + nx, sw.y0 + ny); ctx.lineTo(sw.x1 + nx * 6, sw.y1 + ny * 6); ctx.arc(sw.x1, sw.y1, 6, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI); ctx.lineTo(sw.x0 - nx, sw.y0 - ny); ctx.fill();
          }
        }
        if (g.n < 2 && g.phase === "aim" && !g.swipe) txt(ctx, "Topu potaya doğru yukarı kaydır", R.x + R.w / 2, R.y + R.h * 0.96, 15, "rgba(255,255,255," + (0.6 + 0.2 * Math.sin(g.clock * 3)) + ")", { w: "700", stroke: 3, strokeColor: "rgba(0,0,0,0.35)" });
        K.parts.draw(ctx, g.parts);
        if (g.msgT > 0) {
          const age = g.msgT0 - g.msgT, k = age < 0.08 ? 0.5 + age * 10 : age < 0.2 ? 1.3 - (age - 0.08) * 2.5 : 1, mx = R.x + R.w / 2, my = R.y + R.h * 0.24;
          const sz = fit(ctx, g.msg, (R.w - 30) / 1.3, Math.round(R.w * 0.1), K.DISP, "400");
          if (g.msgC !== "#cfd6e6" && g.msgC !== "#a3a9b8") { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35 * Math.min(1, g.msgT * 2); ctx.drawImage(S.glow, mx - R.w * 0.45, my - sz * 1.6, R.w * 0.9, sz * 3.2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; }
          ctx.save(); ctx.translate(mx, my); ctx.scale(k, k);
          txt(ctx, g.msg, 0, 4, sz, "rgba(0,0,0,0.4)", { f: K.DISP, w: "400", a: Math.min(1, g.msgT * 2) });
          txt(ctx, g.msg, 0, 0, sz, g.msgC, { f: K.DISP, w: "400", stroke: 6, a: Math.min(1, g.msgT * 2) });
          ctx.restore();
        }
        K.pops.draw(ctx, g.pops, 1.1);
        ctx.drawImage(vignette(R.w, R.h), R.x, R.y, R.w, R.h);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#07090f", "#3a2412");
    const gl = ctx.createRadialGradient(R.x + R.w / 2, R.y + R.h * 0.1, 0, R.x + R.w / 2, R.y + R.h * 0.1, R.h); gl.addColorStop(0, "rgba(255,240,210,0.14)"); gl.addColorStop(1, "rgba(255,240,210,0)");
    ctx.fillStyle = gl; ctx.fillRect(R.x, R.y, R.w, R.h);
    txt(ctx, ((d && d.m) | 0) + " / " + ((d && d.n) | 0), R.x + R.w / 2, R.y + R.h * 0.45, Math.round(Math.min(40, R.h * 0.26)), d && d.f ? "#ff7a2e" : "#fff", { f: K.DISP, w: "400", stroke: 4 });
    txt(ctx, d && d.f ? "ATEŞTE!" : "İSABET", R.x + R.w / 2, R.y + R.h * 0.72, 15, "#cbd2e0", { ls: "2px" });
  }
  K.register({
    id: "basket", name: "Basket", color: "#ff6a1a", desc: "60 saniyede potaya at. Temiz sayı 3, seri yaparsan ateşlen.",
    rules: "Topu yukarı kaydır · temiz = 3 · çembere değerek = 2 · 3 seri = ×2",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
