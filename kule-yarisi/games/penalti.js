// Penaltı: parmağını kaydırarak şut çek; yön, güç, yükseklik ve falso kaydırmadan gelir. 8 atış.
(() => {
  "use strict";
  const { hash, clamp, lerp, rr, txt, fit, SFX, buzz } = K;
  const SHOTS = 8, GW = 0.5, GH = 0.33; // kale yarı genişliği ve yüksekliği (dünya birimi)
  const TAU = Math.PI * 2;

  // tribün uğultusu (sentez): filtrelenmiş gürültü, olaylarda kabarır
  function crowd() {
    const AU = K.AU; if (!AU.ctx || !AU.noise) return null;
    const c = AU.ctx, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = AU.noise; src.loop = true; bp.type = "bandpass"; bp.frequency.value = 700; bp.Q.value = 0.5; g.gain.value = 0.0001;
    src.connect(bp).connect(g).connect(AU.sfx); src.start();
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.3; lg.gain.value = 0.02; lfo.connect(lg).connect(g.gain); lfo.start();
    return { c, g, bp, src, set(v, tc) { g.gain.setTargetAtTime(v, c.currentTime, tc || 0.4); }, stop() { try { g.gain.setTargetAtTime(0, c.currentTime, 0.3); src.stop(c.currentTime + 1.5); lfo.stop(c.currentTime + 1.5); } catch (e) {} } };
  }
  function whistle() {
    const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return;
    const c = AU.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = "sine"; o.frequency.value = 2900; lfo.frequency.value = 28; lg.gain.value = 140; lfo.connect(lg).connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.setValueAtTime(0.18, t + 0.38); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g).connect(AU.sfx); o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5);
  }
  function clang() {
    const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return;
    const c = AU.ctx, t = c.currentTime;
    for (const [f, v] of [[523, 0.18], [1187, 0.1], [2245, 0.05]]) { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); o.connect(g).connect(AU.sfx); o.start(t); o.stop(t + 1); }
  }
  function kick(power) { if (!K.play("thud", { vol: 0.7, rate: 1.6 + power * 0.3 })) SFX.thud(0.6); }

  // ---------- çizim yardımcıları (önbellekli katmanlar, sprite'lar) ----------
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const rad = (x, cx, cy, r, stops) => { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; };
  let SPR = null;
  function sprites() {
    if (SPR) return SPR;
    SPR = {};
    let c = mk(64, 64), x = c.getContext("2d"); // yumuşak gölge lekesi
    x.fillStyle = rad(x, 32, 32, 32, [[0, "rgba(0,0,0,1)"], [0.45, "rgba(0,0,0,0.6)"], [1, "rgba(0,0,0,0)"]]); x.fillRect(0, 0, 64, 64); SPR.blob = c;
    c = mk(64, 64); x = c.getContext("2d"); // ışık parlaması (flaş, kıvılcım)
    x.fillStyle = rad(x, 32, 32, 32, [[0, "rgba(255,255,255,1)"], [0.12, "rgba(255,252,240,0.85)"], [0.4, "rgba(255,240,210,0.2)"], [1, "rgba(255,240,210,0)"]]); x.fillRect(0, 0, 64, 64); SPR.glow = c;
    c = mk(128, 128); x = c.getContext("2d"); // top gölgelemesi: üstten projektör, alttan çim yansıması, kenar kararması
    x.beginPath(); x.arc(64, 64, 64, 0, TAU); x.clip();
    x.fillStyle = rad(x, 46, 40, 92, [[0, "rgba(255,255,255,0.25)"], [0.3, "rgba(255,255,255,0)"], [0.62, "rgba(30,40,60,0.18)"], [0.85, "rgba(15,20,35,0.5)"], [1, "rgba(5,10,20,0.75)"]]); x.fillRect(0, 0, 128, 128);
    x.fillStyle = rad(x, 64, 150, 70, [[0, "rgba(90,190,90,0.35)"], [1, "rgba(90,190,90,0)"]]); x.fillRect(0, 0, 128, 128);
    x.fillStyle = "rgba(255,255,255,0.85)"; x.beginPath(); x.ellipse(44, 36, 15, 9, -0.6, 0, TAU); x.fill();
    x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(40, 33, 26, 18, -0.6, 0, TAU); x.fill();
    SPR.shade = c;
    c = mk(4, 4); x = c.getContext("2d"); x.fillStyle = "rgba(0,0,0,0.55)"; x.fillRect(0, 3, 4, 1); x.fillRect(3, 0, 1, 4); SPR.led = c; // LED pano ızgarası
    return SPR;
  }
  // futbol topu: kesik ikozahedron (12 beşgen + 30 dikiş), 3B döndürülüp dik izdüşümle çizilir
  const BALL = (() => {
    const p = (1 + Math.sqrt(5)) / 2, V = [[0, 1, p], [0, -1, p], [0, 1, -p], [0, -1, -p], [1, p, 0], [-1, p, 0], [1, -p, 0], [-1, -p, 0], [p, 0, 1], [-p, 0, 1], [p, 0, -1], [-p, 0, -1]];
    const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
    const at = (a, b, t) => nrm([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    const nb = V.map(a => V.filter(b => b !== a && Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - 2) < 0.01));
    const pents = V.map((a, i) => {
      const c = nrm(a), vs = nb[i].map(b => at(a, b, 1 / 3));
      const t1 = nrm(vs[0].map((v, k) => v - c[k])), t2 = [c[1] * t1[2] - c[2] * t1[1], c[2] * t1[0] - c[0] * t1[2], c[0] * t1[1] - c[1] * t1[0]];
      vs.sort((u, w) => Math.atan2(u[0] * t2[0] + u[1] * t2[1] + u[2] * t2[2], u[0] * t1[0] + u[1] * t1[1] + u[2] * t1[2]) - Math.atan2(w[0] * t2[0] + w[1] * t2[1] + w[2] * t2[2], w[0] * t1[0] + w[1] * t1[1] + w[2] * t1[2]));
      return { c, vs };
    });
    const seams = [];
    V.forEach((a, i) => nb[i].forEach(b => { if (V.indexOf(b) > i) seams.push([at(a, b, 1 / 3), at(a, b, 2 / 3)]); }));
    return { pents, seams };
  })();
  function drawBall(ctx, S, x, y, r, rx, ry, sqx, sqy) {
    // dönüş: önce yatay eksende (ileri yuvarlanma), sonra dikey eksende (falso)
    const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
    const T = v => { const y1 = v[1] * cx - v[2] * sx, z1 = v[1] * sx + v[2] * cx; return [v[0] * cy + z1 * sy, y1, -v[0] * sy + z1 * cy]; };
    ctx.save(); ctx.translate(x, y); ctx.scale(sqx || 1, sqy || 1);
    ctx.fillStyle = "#f2f3f5"; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = "#1b1e26";
    for (const P of BALL.pents) {
      const c = T(P.c); if (c[2] < -0.15) continue;
      ctx.beginPath(); P.vs.forEach((v, i) => { const q = T(v); if (i) ctx.lineTo(q[0] * r, -q[1] * r); else ctx.moveTo(q[0] * r, -q[1] * r); }); ctx.fill();
    }
    if (r > 6) {
      ctx.strokeStyle = "rgba(40,45,60,0.45)"; ctx.lineWidth = Math.max(0.6, r * 0.05); ctx.beginPath();
      for (const s of BALL.seams) { const a = T(s[0]), b = T(s[1]); if (a[2] > 0 && b[2] > 0) { ctx.moveTo(a[0] * r, -a[1] * r); ctx.lineTo(b[0] * r, -b[1] * r); } }
      ctx.stroke();
    }
    ctx.restore();
    ctx.drawImage(S.shade, -r, -r, r * 2, r * 2);
    ctx.restore();
  }

  // ---------- kaleci figürü (ayak ortası orijin, yukarı = -y) ----------
  function keeperFig(ctx, kw, kh, dive, t, flat) {
    const J1 = "#ffc531", J2 = "#c98400", DK = "#15171d", e = dive * dive * (3 - 2 * dive);
    const spread = 0.42 * (1 - e) + 0.1;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    // bacaklar: şort (koyu) uyluk, sarı tozluk, krampon
    for (const s of [-1, 1]) {
      const hx = s * 0.3 * kw, hy = -0.45 * kh, nx = s * (0.3 + spread * 0.8) * kw, ny = -0.22 * kh, fx = s * (0.22 + spread) * kw, fy = 0;
      ctx.strokeStyle = DK; ctx.lineWidth = kw * 0.44; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(nx, ny); ctx.stroke();
      ctx.strokeStyle = flat ? J1 : "#e9e3d6"; ctx.lineWidth = kw * 0.3; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(fx, fy - kh * 0.04); ctx.stroke();
      if (!flat) { ctx.strokeStyle = J2; ctx.lineWidth = kw * 0.31; ctx.beginPath(); ctx.moveTo(lerp(nx, fx, 0.55), lerp(ny, fy, 0.55)); ctx.lineTo(fx, fy - kh * 0.05); ctx.stroke(); }
      ctx.fillStyle = "#0b0c10"; ctx.beginPath(); ctx.ellipse(fx + s * kw * 0.08, fy - kh * 0.02, kw * 0.26, kw * 0.14, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = DK; rr(ctx, -0.7 * kw, -0.58 * kh, 1.4 * kw, 0.2 * kh, 0.18 * kw); ctx.fill();
    // gövde: omuzlar geniş, bel dar; yandan ışık
    if (flat) ctx.fillStyle = J1;
    else { const gr = ctx.createLinearGradient(-0.85 * kw, 0, 0.85 * kw, 0); gr.addColorStop(0, "#ffe07a"); gr.addColorStop(0.45, J1); gr.addColorStop(1, J2); ctx.fillStyle = gr; }
    ctx.beginPath(); ctx.moveTo(-0.82 * kw, -0.97 * kh); ctx.lineTo(0.82 * kw, -0.97 * kh); ctx.quadraticCurveTo(0.9 * kw, -0.9 * kh, 0.66 * kw, -0.5 * kh); ctx.lineTo(-0.66 * kw, -0.5 * kh); ctx.quadraticCurveTo(-0.9 * kw, -0.9 * kh, -0.82 * kw, -0.97 * kh); ctx.fill();
    if (!flat) {
      ctx.fillStyle = DK; ctx.fillRect(-0.74 * kw, -0.8 * kh, 1.48 * kw, 0.055 * kh); // göğüs bandı
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-0.66 * kw, -0.56 * kh, 1.32 * kw, 0.06 * kh);
      ctx.strokeStyle = DK; ctx.lineWidth = kw * 0.09; ctx.beginPath(); ctx.moveTo(-0.22 * kw, -0.97 * kh); ctx.lineTo(0, -0.88 * kh); ctx.lineTo(0.22 * kw, -0.97 * kh); ctx.stroke();
    }
    // kollar: hazır duruşta yanlarda, dalışta başın üstünde uzanır
    const sway = Math.sin(t * 5) * 0.06 * (1 - e);
    for (const s of [-1, 1]) {
      const sx = s * 0.74 * kw, sy = -0.92 * kh;
      const hx = s * lerp(1.65, 1.15, e) * kw, hy = -lerp(0.66 + sway * s, 1.62, e) * kh;
      const ex = (sx + hx) / 2 + s * kw * lerp(0.3, 0.1, e), ey = (sy + hy) / 2 + kh * 0.04;
      if (!flat) { ctx.strokeStyle = J2; ctx.lineWidth = kw * 0.4; ctx.beginPath(); ctx.moveTo(sx, sy + kh * 0.02); ctx.lineTo(ex, ey + kh * 0.02); ctx.lineTo(hx, hy + kh * 0.02); ctx.stroke(); }
      ctx.strokeStyle = J1; ctx.lineWidth = kw * 0.34; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = "#f4f6ef"; ctx.beginPath(); ctx.arc(hx, hy, kw * 0.36, 0, TAU); ctx.fill();
      if (!flat) {
        ctx.strokeStyle = "#8fdc2a"; ctx.lineWidth = kw * 0.12; ctx.beginPath(); ctx.arc(hx, hy, kw * 0.3, 0.3, 2.4); ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.arc(hx + kw * 0.08, hy + kw * 0.08, kw * 0.26, 0, TAU); ctx.fill();
      }
    }
    // baş
    ctx.fillStyle = "#b9876a"; ctx.fillRect(-0.14 * kw, -1.05 * kh, 0.28 * kw, 0.1 * kh);
    ctx.fillStyle = "#c99a74"; ctx.beginPath(); ctx.arc(0, -1.13 * kh, kw * 0.43, 0, TAU); ctx.fill();
    if (!flat) {
      ctx.fillStyle = "rgba(60,30,15,0.28)"; ctx.beginPath(); ctx.arc(kw * 0.1, -1.12 * kh, kw * 0.38, -1.2, 1.6); ctx.fill();
      ctx.fillStyle = "#2a1c14"; ctx.beginPath(); ctx.arc(0, -1.15 * kh, kw * 0.45, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    }
    ctx.lineCap = "butt"; ctx.lineJoin = "miter";
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = {
      score: 0, over: false, shot: 0, goals: 0, results: [], phase: "aim", t: 0, slow: 1, slowT: 0,
      ball: { x: 0, y: 0, z: 0, spin: 0 }, flight: null, keeper: { x: 0, y: 0, dive: 0, lean: 0, react: 0 },
      swipe: null, net: 0, netX: 0, netY: 0, msg: "", msgC: "#fff", msgT: 0, msgT0: 1, pops: [], parts: [], R: null, clock: 0, crowd: null,
      fl: [], flT: 0, cheer: 0, postT: 0, kickT: 0, after: null, trail: [], kHist: [], L: null, Lkey: "",
    };
    const proj = (R, x, y, z) => {
      const gy = R.y + R.h * 0.37, by = R.y + R.h * 0.88, e = 1 - Math.pow(1 - z, 1.5), s = lerp(1, 0.56, e);
      return { x: R.x + R.w / 2 + x * R.w * 0.95 * s, y: lerp(by, gy, e) - y * R.w * 0.95 * s, s };
    };
    // ağın arka düzlemi: b = ağın o noktadaki şişkinliği (0..1+)
    const backP = (R, x, y, b) => { const p = proj(R, x * 0.9, y * 0.82, 1), cx = R.x + R.w / 2; return { x: cx + (p.x - cx) * (1 - b * 0.08), y: p.y - R.h * 0.024 - b * R.h * 0.045 }; };
    const bulge = (x, y) => {
      if (g.net <= 0) return 0;
      const d2 = (x - g.netX) ** 2 + (y - g.netY) ** 2, tt = 1 - g.net;
      return g.net * Math.exp(-d2 / 0.02) + g.net * 0.3 * Math.sin(Math.sqrt(d2) * 38 - tt * 22) * Math.exp(-d2 / 0.07);
    };
    function shoot(sw) {
      const R = g.R, dx = sw.x1 - sw.x0, dy = sw.y0 - sw.y1, len = Math.hypot(dx, dy), dt = Math.max(0.06, sw.t1 - sw.t0);
      if (dy < 30 || len < 40) return false;
      const speed = len / dt;
      const tx = clamp((dx / (R.w * 0.42)) * GW, -GW * 1.6, GW * 1.6);
      const ty = clamp(((len - 60) / (R.h * 0.55)) * GH * (0.6 + Math.min(1, speed / 1600) * 0.6), 0.02, GH * 1.6);
      // falso: kaydırma yolunun orta noktasının doğrudan sapması
      const mx = (sw.x0 + sw.x1) / 2, curve = clamp(((sw.xm != null ? sw.xm : mx) - mx) / (R.w * 0.25), -1, 1) * 0.22;
      const power = clamp(speed / 1800, 0.3, 1.2);
      g.flight = { tx, ty, curve, T: lerp(0.75, 0.42, clamp(power, 0, 1)), t: 0 };
      // kaleci kararı: tohumlu tahmin + atışlar ilerledikçe daha iyi okur
      const r1 = hash(seed, g.shot * 7 + 1), r2 = hash(seed, g.shot * 7 + 2);
      const readChance = 0.3 + g.shot * 0.05, readsIt = r1 < readChance;
      const guessDir = readsIt ? Math.sign(tx) || (r2 < 0.5 ? -1 : 1) : r2 < 0.38 ? -1 : r2 < 0.76 ? 1 : 0;
      g.keeper.target = guessDir * (0.22 + hash(seed, g.shot * 7 + 3) * 0.18);
      g.keeper.high = readsIt && ty > GH * 0.55;
      g.keeper.react = 0.12 + hash(seed, g.shot * 7 + 4) * 0.1;
      g.phase = "fly"; g.t = 0;
      kick(power); buzz(15);
      // vuruş hissi: top ezilir, çim ve tebeşir tozu kalkar, hafif sarsıntı
      const b = proj(R, 0, 0, 0);
      g.kickT = 1; g.trail.length = 0; g.after = null;
      K.parts.burst(g.parts, b.x, b.y + 6, "#3f8f3a", 7, 120); K.parts.burst(g.parts, b.x, b.y + 6, "#6fbf5a", 5, 90);
      K.parts.dust(g.parts, b.x, b.y + 8, "#e8efe0", 5, 40);
      K.kick(0.1 + Math.min(1, power) * 0.08); SFX.whoosh();
      return true;
    }
    function resolve() {
      const f = g.flight, x = f.tx + f.curve, y = f.ty, k = g.keeper;
      const kx = k.x, reach = 0.17, keeperHigh = k.high ? 0.3 : 0.22;
      let res;
      const inside = Math.abs(x) < GW - 0.015 && y < GH - 0.01;
      const post = !inside && (Math.abs(Math.abs(x) - GW) < 0.03 && y < GH + 0.02 || (Math.abs(y - GH) < 0.025 && Math.abs(x) < GW + 0.02));
      if (post) res = "post";
      else if (!inside) res = "miss";
      else if (Math.abs(x - kx) < reach && y < keeperHigh + 0.03) res = "save";
      else res = "goal";
      g.results.push(res);
      const R = g.R, p = proj(R, x, y, 1), sx = Math.sign(x) || 1;
      // topun sonrası (yalnızca görsel): ağa gömülür / sekip döner / tribüne gider
      const A = { res, x, y, z: 1, d: 0, vx: 0, vy: 0, vz: 0, t: 0, a: 1, spin: g.ball.spin, sx };
      if (res === "goal") { A.vy = -0.2; }
      else if (res === "save") { A.vz = -0.55; A.vx = sx * 0.45; A.vy = 0.7; }
      else if (res === "post") { A.vz = -0.75; A.vx = -sx * 0.3; A.vy = y > GH - 0.03 ? 0.6 : 0.25; }
      else { A.vx = Math.abs(x) > GW ? sx * 0.5 : sx * 0.1; A.vy = y > GH ? 0.5 : 0.1; }
      g.after = A;
      if (res === "goal") {
        const corner = Math.abs(x) > GW * 0.62 && y > GH * 0.55;
        const pts = 100 + (corner ? 60 : 0) + (Math.abs(x) > GW * 0.6 ? 20 : 0);
        g.score += pts; g.goals++;
        g.net = 1; g.netX = x; g.netY = y; g.slow = 0.35; g.slowT = 0.45;
        g.msg = corner ? "KÖŞEYE GOL!" : "GOOOL!"; g.msgC = "#ffd34d"; g.msgT = 1.6;
        K.pops.add(g.pops, "+" + pts, p.x, p.y - 20, "#ffd34d", true);
        K.parts.ring(g.parts, p.x, p.y, "#ffffff", R.w * 0.12, 5); K.parts.spark(g.parts, p.x, p.y, "#fff3c4", 14, 260);
        K.parts.burst(g.parts, p.x, p.y, "#ffffff", 14, 200);
        const cy = R.y + R.h * 0.3, CC = ["#ffc531", "#ffffff", "#1b2a6b", "#ff5a4e", "#ffd34d"];
        K.parts.confetti(g.parts, R.x + R.w * 0.12, cy, corner ? 40 : 26, 420, CC); K.parts.confetti(g.parts, R.x + R.w * 0.88, cy, corner ? 40 : 26, 420, CC);
        if (corner) K.parts.confetti(g.parts, R.x + R.w / 2, R.y + R.h * 0.6, 30, 520, CC);
        K.kick(corner ? 0.55 : 0.42); K.flash(corner ? 0.32 : 0.24, "#fff4d0"); K.hitstop(0.07);
        g.cheer = 1;
        if (g.crowd) { g.crowd.set(0.55, 0.08); setTimeout(() => g.crowd && g.crowd.set(0.12, 1.2), 1400); }
        SFX.chime(8); K.play("bell", { vol: 0.35 }); buzz([30, 40, 80]);
      } else if (res === "save") {
        g.msg = "KURTARDI!"; g.msgC = "#ff9aa4"; g.msgT = 1.4;
        K.parts.spark(g.parts, p.x, p.y, "#ffffff", 12, 220); K.parts.burst(g.parts, p.x, p.y, "#f4f6ef", 6, 140); K.parts.ring(g.parts, p.x, p.y, "rgba(255,255,255,0.8)", R.w * 0.07, 3);
        K.kick(0.3); K.hitstop(0.06);
        if (!K.play("thud", { vol: 0.8, rate: 0.9 })) SFX.thud(0.8);
        if (g.crowd) { g.crowd.set(0.32, 0.1); setTimeout(() => g.crowd && g.crowd.set(0.1, 1), 900); }
        buzz(40);
      } else if (res === "post") {
        g.msg = "DİREK!"; g.msgC = "#cfd6e6"; g.msgT = 1.4; clang(); buzz([60, 30, 60]);
        g.postT = 1; K.parts.spark(g.parts, p.x, p.y, "#fff1b8", 18, 300); K.parts.ring(g.parts, p.x, p.y, "#e9eef5", R.w * 0.06, 3);
        K.kick(0.5); K.hitstop(0.08); K.flash(0.1, "#ffffff");
        if (g.crowd) { g.crowd.set(0.3, 0.05); setTimeout(() => g.crowd && g.crowd.set(0.1, 1), 800); }
      } else { g.msg = "AUT"; g.msgC = "#a3a9b8"; g.msgT = 1.2; K.kick(0.08); if (g.crowd) g.crowd.set(0.06, 0.3); }
      g.msgT0 = g.msgT;
      g.phase = "result"; g.t = 0;
    }
    // görsel top sonrası fiziği (oyun kuralına etkisi yok)
    function afterStep(dt) {
      const A = g.after; if (!A) return;
      A.t += dt; A.spin += dt * (A.res === "goal" ? 6 : 14) * Math.max(0, 1 - A.t);
      if (A.res === "goal") { A.d = Math.min(1, A.d + dt * 6); if (A.t > 0.12) { A.vy -= 3 * dt; A.y += A.vy * dt; if (A.y < 0) { A.y = 0; A.vy = Math.abs(A.vy) * 0.35; } } return; }
      A.vy -= 2.6 * dt; A.x += A.vx * dt; A.y += A.vy * dt; A.z = Math.max(0.35, A.z + A.vz * dt);
      if (A.y < 0) { A.y = 0; A.vy = Math.abs(A.vy) * 0.45; A.vx *= 0.7; A.vz *= 0.6; }
      if (A.res === "miss") A.a = Math.max(0, 1 - A.t * 2.2);
    }

    // ---------- statik katmanlar: boyut değişince bir kez kurulur ----------
    function build(R) {
      const d = DPR(), W = R.w, H = R.h, L = {};
      const layer = (y0, y1, sc) => { sc = sc || d; const c = mk(W * sc, (y1 - y0) * sc), x = c.getContext("2d"); x.scale(sc, sc); x.translate(-R.x, -(R.y + y0)); return { c, x, y0, h: y1 - y0 }; };
      const rnd = K.rng(9137);
      // 1) gökyüzü, projektör kuleleri, tribün çatısı ve duvarı
      const B = layer(0, H * 0.31), b = B.x;
      let gr = b.createLinearGradient(0, R.y, 0, R.y + H * 0.31); gr.addColorStop(0, "#02050c"); gr.addColorStop(0.35, "#091122"); gr.addColorStop(1, "#1a2740");
      b.fillStyle = gr; b.fillRect(R.x, R.y, W, H * 0.31);
      for (let i = 0; i < 45; i++) { b.fillStyle = "rgba(220,230,255," + (0.15 + rnd() * 0.4) + ")"; b.fillRect(R.x + rnd() * W, R.y + rnd() * H * 0.09, 1, 1); }
      for (const sx of [0.08, 0.92]) {
        const lx = R.x + W * sx, ly = R.y + H * 0.05;
        b.fillStyle = "#0a0f1b"; b.fillRect(lx - 2, ly, 4, H * 0.08);
        b.strokeStyle = "rgba(120,140,170,0.25)"; b.lineWidth = 0.8; b.beginPath(); for (let j = 0; j < 5; j++) { b.moveTo(lx - 2, ly + j * H * 0.016); b.lineTo(lx + 2, ly + (j + 1) * H * 0.016); } b.stroke();
        b.fillStyle = "#1a2233"; rr(b, lx - 18, ly - 10, 36, 19, 2); b.fill();
        for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { b.fillStyle = "#fffdf2"; b.beginPath(); b.arc(lx - 13.5 + i * 6.75, ly - 5.5 + j * 5.5, 2.3, 0, TAU); b.fill(); }
      }
      b.fillStyle = "#070b15"; b.fillRect(R.x, R.y + H * 0.1, W, H * 0.032);
      b.strokeStyle = "rgba(140,160,200,0.12)"; b.lineWidth = 1; b.beginPath(); for (let x = 0; x < W; x += 14) { b.moveTo(R.x + x, R.y + H * 0.1); b.lineTo(R.x + x + 7, R.y + H * 0.132); b.lineTo(R.x + x + 14, R.y + H * 0.1); } b.stroke();
      b.fillStyle = "rgba(170,190,225,0.35)"; b.fillRect(R.x, R.y + H * 0.131, W, 1.5);
      gr = b.createLinearGradient(0, R.y + H * 0.133, 0, R.y + H * 0.31); gr.addColorStop(0, "#0f1627"); gr.addColorStop(1, "#212c45");
      b.fillStyle = gr; b.fillRect(R.x, R.y + H * 0.133, W, H * 0.18);
      L.back = B;
      // 2) seyirciler: yarı çözünürlükte çizilir → doğal derinlik bulanıklığı; dilimlenip dalga yapar
      const cs = Math.max(1, d * 0.55), C = layer(H * 0.125, H * 0.305, cs), c = C.x;
      const SH = ["#ffc531", "#ffc531", "#f4b400", "#1b2a6b", "#c43a3a", "#e9e2cf", "#2a2f3f", "#3d8bff", "#ffffff"], SK = ["#e0b48c", "#c99a74", "#8d5f3f", "#f1c9a5", "#a8775a"];
      const rows = 12;
      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1), y = R.y + H * (0.143 + t * 0.15), hr = 1.6 + t * 2, step = hr * 2.3, fade = 0.55 * (1 - t);
        for (let x = R.x - rnd() * step; x < R.x + W + step; x += step * (0.8 + rnd() * 0.4)) {
          if (rnd() < 0.05) continue;
          const sh = K.mix(K.hex(SH[(rnd() * SH.length) | 0]), [20, 28, 48], fade), sk = K.mix(K.hex(SK[(rnd() * SK.length) | 0]), [20, 28, 48], fade + 0.1);
          const jx = x + (rnd() - 0.5) * hr * 0.6, jy = y + (rnd() - 0.5) * hr * 0.5;
          if (rnd() < 0.12) { c.strokeStyle = K.css(sh); c.lineWidth = hr * 0.5; c.lineCap = "round"; c.beginPath(); c.moveTo(jx - hr * 0.9, jy + hr); c.lineTo(jx - hr * 1.3, jy - hr * 1.4); c.moveTo(jx + hr * 0.9, jy + hr); c.lineTo(jx + hr * 1.3, jy - hr * 1.4); c.stroke(); }
          c.fillStyle = K.css(sh); c.beginPath(); c.ellipse(jx, jy + hr * 1.55, hr * 1.2, hr * 1.25, 0, 0, TAU); c.fill();
          c.fillStyle = K.css(K.mix(sh, [255, 255, 255], 0.2)); c.beginPath(); c.ellipse(jx, jy + hr * 0.75, hr * 0.9, hr * 0.35, 0, Math.PI, TAU); c.fill();
          c.fillStyle = K.css(sk); c.beginPath(); c.arc(jx, jy, hr * 0.8, 0, TAU); c.fill();
          const hat = rnd(); if (hat < 0.45) { c.fillStyle = hat < 0.12 ? K.css(sh) : "rgba(25,18,14,0.9)"; c.beginPath(); c.arc(jx, jy - hr * 0.1, hr * 0.82, Math.PI * 1.05, Math.PI * 1.95); c.fill(); }
          if (rnd() < 0.06) { c.fillStyle = rnd() < 0.5 ? "#ffc531" : "#1b2a6b"; c.fillRect(jx - hr * 2.4, jy - hr * 2.1, hr * 4.8, hr * 0.85); }
        }
      }
      c.globalCompositeOperation = "source-atop"; gr = c.createLinearGradient(0, R.y + H * 0.13, 0, R.y + H * 0.3); gr.addColorStop(0, "rgba(14,20,36,0.55)"); gr.addColorStop(0.6, "rgba(14,20,36,0.1)"); gr.addColorStop(1, "rgba(255,240,210,0.08)");
      c.fillStyle = gr; c.fillRect(R.x, R.y + H * 0.12, W, H * 0.19); c.globalCompositeOperation = "source-over";
      L.crowd = C;
      // 3) projektör parlaması (toplamalı çizilir): hale, çekirdek, yatay ışık çizgisi, ışık konisi
      const G = layer(0, H * 0.6), q = G.x;
      for (const sx of [0.08, 0.92]) {
        const lx = R.x + W * sx, ly = R.y + H * 0.05;
        q.fillStyle = rad(q, lx, ly, W * 0.45, [[0, "rgba(255,246,220,0.3)"], [0.25, "rgba(255,244,215,0.1)"], [1, "rgba(255,240,210,0)"]]); q.fillRect(R.x, R.y, W, H * 0.6);
        q.fillStyle = rad(q, lx, ly, W * 0.07, [[0, "rgba(255,255,250,0.9)"], [1, "rgba(255,255,250,0)"]]); q.fillRect(lx - W * 0.07, ly - W * 0.07, W * 0.14, W * 0.14);
        q.save(); q.translate(lx, ly); q.scale(6, 0.16); q.fillStyle = rad(q, 0, 0, W * 0.06, [[0, "rgba(255,250,235,0.45)"], [1, "rgba(255,250,235,0)"]]); q.fillRect(-W * 0.06, -W * 0.06, W * 0.12, W * 0.12); q.restore();
        gr = q.createLinearGradient(0, ly, 0, R.y + H * 0.6); gr.addColorStop(0, "rgba(255,250,230,0.07)"); gr.addColorStop(1, "rgba(255,250,230,0)");
        q.fillStyle = gr; q.beginPath(); q.moveTo(lx - 12, ly); q.lineTo(lx + 12, ly); q.lineTo(R.x + W * (0.5 + (0.5 - sx) * 0.1) + W * 0.32, R.y + H * 0.6); q.lineTo(R.x + W * (0.5 + (0.5 - sx) * 0.1) - W * 0.32, R.y + H * 0.6); q.fill();
      }
      L.glow = G;
      // 4) reklam panosu tabanı, çim (biçme şeritleri + doku), tebeşir çizgileri
      const fy0 = H * 0.295, F = layer(fy0, H), f = F.x;
      f.fillStyle = "#060a14"; f.fillRect(R.x, R.y + H * 0.298, W, H * 0.034);
      f.fillStyle = "rgba(255,255,255,0.12)"; f.fillRect(R.x, R.y + H * 0.298, W, 1);
      const gy = R.y + H * 0.332;
      gr = f.createLinearGradient(0, gy, 0, R.y + H); gr.addColorStop(0, "#143a1e"); gr.addColorStop(0.18, "#1c5428"); gr.addColorStop(1, "#2d8239");
      f.fillStyle = gr; f.fillRect(R.x, gy, W, R.y + H - gy);
      f.fillStyle = "rgba(0,0,0,0.35)"; f.fillRect(R.x, gy, W, 2);
      const quad = (a, b2, c2, d2) => { f.beginPath(); f.moveTo(a.x, a.y); f.lineTo(b2.x, b2.y); f.lineTo(c2.x, c2.y); f.lineTo(d2.x, d2.y); f.fill(); };
      for (let i = -5; i < 9; i++) { const z0 = i / 9, z1 = (i + 1) / 9; f.fillStyle = i & 1 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"; quad(proj(R, -4, 0, z0), proj(R, 4, 0, z0), proj(R, 4, 0, z1), proj(R, -4, 0, z1)); }
      f.fillStyle = "rgba(255,255,255,0.03)";
      for (let x0 = -3.2; x0 < 3.2; x0 += 0.5) quad(proj(R, x0, 0, -0.7), proj(R, x0 + 0.25, 0, -0.7), proj(R, x0 + 0.25, 0, 1), proj(R, x0, 0, 1));
      // çim dokusu: küçük ot çizgileri; uzakta küçültülmüş desen
      const nc = mk(96, 96), nx = nc.getContext("2d");
      for (let i = 0; i < 1400; i++) { const l = rnd() < 0.5; nx.fillStyle = l ? "rgba(170,230,140," + (0.12 + rnd() * 0.18) + ")" : "rgba(0,30,0," + (0.15 + rnd() * 0.2) + ")"; nx.fillRect(rnd() * 96, rnd() * 96, 1, 1 + rnd() * 2.5); }
      const pat = f.createPattern(nc, "repeat");
      for (const [y0, y1, s] of [[0.332, 0.45, 0.45], [0.45, 0.65, 0.7], [0.65, 1, 1]]) { f.save(); f.beginPath(); f.rect(R.x, R.y + H * y0, W, H * (y1 - y0)); f.clip(); f.translate(R.x, R.y); f.scale(s, s); f.globalAlpha = 0.7; f.fillStyle = pat; f.fillRect(0, 0, W / s, H / s); f.restore(); }
      // projektör ışık havuzu, ufukta pus, aşınmış çim (penaltı noktası, kale ağzı)
      f.fillStyle = rad(f, R.x + W / 2, R.y + H * 0.66, W * 0.85, [[0, "rgba(255,255,225,0.08)"], [1, "rgba(255,255,225,0)"]]); f.fillRect(R.x, gy, W, H);
      gr = f.createLinearGradient(0, gy, 0, R.y + H * 0.45); gr.addColorStop(0, "rgba(30,45,70,0.38)"); gr.addColorStop(1, "rgba(30,45,70,0)"); f.fillStyle = gr; f.fillRect(R.x, gy, W, H * 0.12);
      const worn = (p, rx, ry, a) => { f.save(); f.globalAlpha = a; f.translate(p.x, p.y); f.scale(rx / 32, ry / 32); f.fillStyle = rad(f, 0, 0, 32, [[0, "rgba(120,104,62,1)"], [0.6, "rgba(110,100,60,0.5)"], [1, "rgba(110,100,60,0)"]]); f.fillRect(-32, -32, 64, 64); f.restore(); };
      worn(proj(R, 0, 0, 0), W * 0.11, W * 0.035, 0.45); worn(proj(R, 0, 0, 0.98), W * 0.26, W * 0.022, 0.5);
      // kale içi zemin gölgesi
      { const a = proj(R, -GW, 0, 1), b2 = proj(R, GW, 0, 1), c2 = backP(R, GW, 0, 0), d2 = backP(R, -GW, 0, 0); f.fillStyle = "rgba(0,0,0,0.25)"; quad(a, b2, c2, d2); }
      // tebeşir: ayrı tuvalde çiz, rastgele noktalarla aşındır, sonra bas
      const T = layer(fy0, H), t2 = T.x; t2.strokeStyle = "#f4f6f2"; t2.lineCap = "round";
      const chalk = pts => { for (let i = 1; i < pts.length; i++) { const [xa, za] = pts[i - 1], [xb, zb] = pts[i], n = 10; for (let j = 0; j < n; j++) { const p = proj(R, lerp(xa, xb, j / n), 0, lerp(za, zb, j / n)), q2 = proj(R, lerp(xa, xb, (j + 1) / n), 0, lerp(za, zb, (j + 1) / n)); t2.lineWidth = 2.4 * Math.pow(p.s, 1.6); t2.beginPath(); t2.moveTo(p.x, p.y); t2.lineTo(q2.x, q2.y); t2.stroke(); } } };
      chalk([[-4, 1], [4, 1]]); chalk([[-0.9, 1], [-0.9, 0.55], [0.9, 0.55], [0.9, 1]]); chalk([[-1.6, 1], [-1.6, 0.05], [1.6, 0.05], [1.6, 1]]);
      { const p = proj(R, 0, 0, 0); t2.fillStyle = "#f4f6f2"; t2.beginPath(); t2.ellipse(p.x, p.y + 7, 6, 2.4, 0, 0, TAU); t2.fill(); }
      t2.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 9000; i++) { t2.fillStyle = "rgba(0,0,0," + (0.3 + rnd() * 0.6) + ")"; t2.fillRect(R.x + rnd() * W, R.y + fy0 + rnd() * (H - fy0), 1 + rnd(), 1); }
      f.save(); f.setTransform(1, 0, 0, 1, 0, 0); f.globalAlpha = 0.82; f.drawImage(T.c, 0, 0); f.restore();
      L.front = F;
      // 5) vinyet (küçük tuval, esnetilerek çizilir)
      const vc = mk(64, 128), vx = vc.getContext("2d");
      vx.save(); vx.scale(1, 2); vx.fillStyle = rad(vx, 32, 32, 46, [[0, "rgba(0,0,0,0)"], [0.62, "rgba(0,0,0,0)"], [1, "rgba(0,0,8,0.5)"]]); vx.fillRect(0, 0, 64, 64); vx.restore();
      L.vig = vc;
      return L;
    }
    const blit = (ctx, R, l) => ctx.drawImage(l.c, R.x, R.y + l.y0, R.w, l.h);

    return {
      get score() { return g.score; },
      get over() { return g.over; },
      _g: g,
      info() { return { extra: "ATIŞ " + Math.min(SHOTS, g.shot + 1) + "/" + SHOTS + " · " + g.goals + " GOL" }; },
      dispose() { if (g.crowd) { g.crowd.stop(); g.crowd = null; } },
      update(dt, active) {
        g.clock += dt;
        if (active && !g.crowd) { g.crowd = crowd(); if (g.crowd) g.crowd.set(0.1, 1); whistle(); }
        if (g.slowT > 0) { g.slowT -= dt; if (g.slowT <= 0) g.slow = 1; }
        const sdt = dt * g.slow;
        g.net = Math.max(0, g.net - dt * 1.4); g.msgT = Math.max(0, g.msgT - dt);
        g.cheer = Math.max(0, g.cheer - dt * 0.4); g.postT = Math.max(0, g.postT - dt * 3); g.kickT = Math.max(0, g.kickT - dt * 7);
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
        // tribün fotoğraf flaşları: tek tek söner (yanıp sönme değil); golden sonra çoğalır
        g.flT -= dt * (1.4 + g.cheer * 14);
        while (g.flT < 0) { g.flT += 1; if (g.fl.length < 24) g.fl.push({ x: Math.random(), y: Math.random(), l: 0.4 }); }
        for (const f of g.fl) f.l -= dt; g.fl = g.fl.filter(f => f.l > 0);
        // kaleci: bekleme salınımı, sonra dalış
        const k = g.keeper;
        if (g.phase === "aim") { k.x = Math.sin(g.clock * 1.6) * 0.05; k.y = 0; k.dive = 0; }
        if (g.phase === "fly") {
          const f = g.flight; f.t += sdt; g.t += sdt;
          const u = clamp(f.t / f.T, 0, 1);
          g.ball.z = u; g.ball.x = lerp(0, f.tx, u) + f.curve * Math.sin(u * Math.PI / 2) * u; g.ball.y = f.ty * Math.sin(u * Math.PI * 0.5) + 0.02 * (1 - u); g.ball.spin += sdt * 20;
          if (f.t > k.react) { const kt = clamp((f.t - k.react) / (f.T - k.react), 0, 1); k.x = lerp(k.x, k.target, Math.min(1, sdt * 9)); k.dive = kt; k.y = (k.high ? 0.16 : 0.07) * Math.sin(kt * Math.PI * 0.9); }
          if (u >= 1) resolve();
        } else if (g.phase === "result") {
          g.t += dt; afterStep(dt);
          if (g.t > 1.6) { g.shot++; if (g.shot >= SHOTS) { g.over = true; if (g.crowd) g.crowd.set(0.25, 0.3); } else { g.phase = "aim"; g.ball = { x: 0, y: 0, z: 0, spin: 0 }; g.keeper = { x: 0, y: 0, dive: 0, react: 0 }; g.after = null; g.trail.length = 0; whistle(); } }
        }
      },
      pointer(type, x, y) {
        if (!g.R || g.over || g.phase !== "aim") return;
        const now = performance.now() / 1000;
        if (type === "down") { const b = proj(g.R, 0, 0, 0); if (Math.hypot(x - b.x, y - b.y) < g.R.w * 0.3) g.swipe = { x0: x, y0: y, x1: x, y1: y, t0: now, t1: now, pts: [[x, y]] }; }
        else if (type === "move" && g.swipe) { g.swipe.x1 = x; g.swipe.y1 = y; g.swipe.t1 = now; g.swipe.pts.push([x, y]); }
        else if ((type === "up" || type === "cancel") && g.swipe) {
          const sw = g.swipe; g.swipe = null;
          if (type !== "up") return;
          sw.t1 = now; if (sw.pts.length > 2) sw.xm = sw.pts[Math.floor(sw.pts.length / 2)][0];
          shoot(sw);
        }
      },
      net() { return { s: g.shot, gl: g.goals, r: g.results.map(r => r[0]).join("") }; },
      draw(ctx, R) {
        g.R = R;
        const S = sprites(), key = R.x + "," + R.y + "," + R.w + "x" + R.h + "@" + DPR();
        if (g.Lkey !== key) { g.L = build(R); g.Lkey = key; }
        const L = g.L, W = R.w, H = R.h, cxm = R.x + W / 2;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, W, H); ctx.clip();
        // gökyüzü + tribün
        blit(ctx, R, L.back);
        // seyirciler: 16 dilim, golde dalga gibi zıplar
        { const C = L.crowd, n = 16, sw = C.c.width / n, dw = W / n, amp = H * 0.012;
          for (let i = 0; i < n; i++) { const off = -g.cheer * amp * Math.max(0, Math.sin(g.clock * 8 - i * 0.55)) - Math.max(0, Math.sin(g.clock * 1.3 + i * 1.7)) * 0.6; ctx.drawImage(C.c, i * sw, 0, sw, C.c.height, R.x + i * dw - 0.3, R.y + C.y0 + off, dw + 0.6, C.h); } }
        // fotoğraf flaşları
        ctx.globalCompositeOperation = "lighter";
        for (const f of g.fl) { const a = f.l / 0.4, s = 3 + 9 * a; ctx.globalAlpha = a * a; ctx.drawImage(S.glow, R.x + f.x * W - s, R.y + H * (0.15 + f.y * 0.14) - s, s * 2, s * 2); }
        ctx.globalAlpha = 1; blit(ctx, R, L.glow); ctx.globalCompositeOperation = "source-over";
        // saha
        blit(ctx, R, L.front);
        // LED reklam panosu: kayan yazı, golde "GOOOL"
        { const y0 = R.y + H * 0.3, bh = H * 0.03, goal = g.cheer > 0.35, msg = goal ? "GOOOL!   ·   GOOOL!   ·   " : "DÜELLO ARENASI   ·   PENALTI   ·   ", fs = Math.round(bh * 0.72);
          ctx.save(); ctx.beginPath(); ctx.rect(R.x, y0, W, bh); ctx.clip();
          ctx.font = "800 " + fs + "px " + K.COND; if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
          const mw = ctx.measureText(msg).width || 1, off = -((g.clock * (goal ? 90 : 26)) % mw);
          ctx.fillStyle = goal ? "#fff3a8" : "#f4b400"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
          for (let x = R.x + off; x < R.x + W; x += mw) ctx.fillText(msg, x, y0 + bh / 2 + 1);
          if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
          ctx.globalAlpha = 0.6; ctx.fillStyle = S.ledPat || (S.ledPat = ctx.createPattern(S.led, "repeat")); ctx.fillRect(R.x, y0, W, bh); ctx.globalAlpha = 1;
          ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(R.x, y0, W, bh * 0.4);
          ctx.restore(); }
        // kale ağı: arka düzlem, yan ve üst ağlar; golde şişip dalgalanır
        const pj = (x, y) => proj(R, x, y, 1), bk = (x, y) => backP(R, x, y, bulge(x, y));
        const NI = 20, NJ = 9;
        ctx.fillStyle = "rgba(235,240,248,0.05)"; { const a = bk(-GW, 0), b = bk(GW, 0), c = bk(GW, GH), d = bk(-GW, GH); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.fill(); }
        ctx.strokeStyle = "rgba(230,236,244,0.32)"; ctx.lineWidth = 0.8; ctx.beginPath();
        for (let i = 0; i <= NI; i++) { const x = -GW + (i / NI) * GW * 2; for (let j = 0; j <= NJ; j++) { const p = bk(x, (j / NJ) * GH); if (j) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } }
        for (let j = 0; j <= NJ; j++) { const y = (j / NJ) * GH; for (let i = 0; i <= NI; i++) { const p = bk(-GW + (i / NI) * GW * 2, y); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } }
        ctx.stroke();
        ctx.strokeStyle = "rgba(235,240,248,0.4)"; ctx.beginPath();
        for (const sx of [-1, 1]) for (let j = 0; j <= NJ; j++) { const y = (j / NJ) * GH, a = pj(sx * GW, y), b = bk(sx * GW, y); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        for (const sx of [-1, 1]) for (let t = 1; t < 4; t++) { const a = pj(sx * GW, 0), b = bk(sx * GW, 0), c = pj(sx * GW, GH), d = bk(sx * GW, GH); ctx.moveTo(lerp(a.x, b.x, t / 4), lerp(a.y, b.y, t / 4)); ctx.lineTo(lerp(c.x, d.x, t / 4), lerp(c.y, d.y, t / 4)); }
        for (let i = 0; i <= NI; i += 2) { const x = -GW + (i / NI) * GW * 2, a = pj(x, GH), b = bk(x, GH); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        ctx.stroke();
        // arka destek boruları
        ctx.strokeStyle = "rgba(200,206,216,0.55)"; ctx.lineWidth = 1.5; ctx.beginPath(); for (const sx of [-1, 1]) { const a = bk(sx * GW, GH), b = bk(sx * GW, 0); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke();
        // direkler: silindir gölgeleme; direğe çarpınca titrer
        const tl = pj(-GW, GH), trp = pj(GW, GH), bl = pj(-GW, 0), br = pj(GW, 0), pw = Math.max(3, W * 0.013);
        const vib = g.postT > 0 ? Math.sin(g.clock * 70) * g.postT * 2.2 : 0;
        ctx.save(); ctx.translate(vib, 0); ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = pw; ctx.beginPath(); ctx.moveTo(bl.x + 2, bl.y + 1); ctx.lineTo(bl.x + pw * 2.5, bl.y + 3); ctx.moveTo(br.x + 2, br.y + 1); ctx.lineTo(br.x + pw * 2.5, br.y + 3); ctx.stroke();
        const frame = () => { ctx.beginPath(); ctx.moveTo(bl.x, bl.y); ctx.lineTo(tl.x, tl.y); ctx.lineTo(trp.x, trp.y); ctx.lineTo(br.x, br.y); ctx.stroke(); };
        ctx.strokeStyle = "#8d96a3"; ctx.lineWidth = pw; frame();
        ctx.save(); ctx.translate(-pw * 0.18, -pw * 0.15); ctx.strokeStyle = "#f7f9fc"; ctx.lineWidth = pw * 0.6; frame(); ctx.restore();
        ctx.save(); ctx.translate(-pw * 0.25, -pw * 0.22); ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = pw * 0.18; frame(); ctx.restore();
        ctx.restore();
        // kaleci: zemin gölgesi, dalış hayaletleri (hareket bulanıklığı), gövde
        const k = g.keeper, kp = proj(R, k.x, k.y, 1), kg = proj(R, k.x, 0, 1), ks = kp.s * W * 0.95, kh = ks * 0.2, kw = ks * 0.07;
        const kdir = Math.sign(k.target || 0), rot = kdir * k.dive * 1.25, hop = g.phase === "aim" ? -Math.abs(Math.sin(g.clock * 3.2)) * kh * 0.05 : 0;
        { const sw2 = kw * 2.4 + k.dive * kh * 0.9 * Math.abs(kdir), a = 0.4 * Math.max(0.3, 1 - k.y * 4); ctx.globalAlpha = a; ctx.drawImage(S.blob, kg.x + kdir * k.dive * kh * 0.45 - sw2, kg.y - kw * 0.45, sw2 * 2, kw * 1.1); ctx.globalAlpha = 1; }
        g.kHist.push({ x: kp.x, y: kp.y, rot, dive: k.dive }); if (g.kHist.length > 7) g.kHist.shift();
        if (g.phase === "fly" && k.dive > 0.05 && k.dive < 0.98) {
          for (let i = 0; i < g.kHist.length - 1; i += 2) { const h = g.kHist[i]; ctx.save(); ctx.globalAlpha = 0.1 + i * 0.03; ctx.translate(h.x, h.y); ctx.rotate(h.rot); keeperFig(ctx, kw, kh, h.dive, g.clock, true); ctx.restore(); }
          ctx.globalAlpha = 1;
        }
        ctx.save(); ctx.translate(kp.x, kp.y + hop); ctx.rotate(rot); keeperFig(ctx, kw, kh, k.dive, g.clock, false); ctx.restore();
        // top: görsel konum (sonrası dahil), yüksekliğe göre gölge, iz, döner paneller
        let bx = g.ball.x, by = g.ball.y, bz = g.ball.z, spin = g.ball.spin, alpha = 1, depth = 0;
        const A = g.phase === "result" ? g.after : null;
        if (A) { bx = A.x; by = A.y; bz = A.z; spin = A.spin; alpha = A.a; depth = A.d; }
        let bp = proj(R, bx, by, bz), gp = proj(R, bx, 0, bz);
        if (depth > 0) { const q = backP(R, bx, by, bulge(bx, by) * 0.8), q0 = backP(R, bx, 0, 0); bp = { x: lerp(bp.x, q.x, depth * 0.7), y: lerp(bp.y, q.y, depth * 0.7), s: bp.s * (1 - depth * 0.08) }; gp = { x: lerp(gp.x, q0.x, depth * 0.7), y: lerp(gp.y, q0.y, depth * 0.7), s: gp.s }; }
        const br2 = Math.max(4, bp.s * W * 0.035) * (A && A.res === "miss" ? 1 - A.t * 0.3 : 1);
        { const hgt = Math.max(0, gp.y - bp.y), sw2 = br2 * (1.15 + hgt * 0.012), a = 0.5 / (1 + hgt * 0.04); ctx.globalAlpha = a * alpha; ctx.drawImage(S.blob, gp.x - sw2, gp.y + br2 * 0.2 - sw2 * 0.3, sw2 * 2, sw2 * 0.6); ctx.globalAlpha = 1; }
        if (g.phase === "fly" || (A && A.t < 0.5)) { g.trail.push({ x: bp.x, y: bp.y, r: br2 }); if (g.trail.length > 9) g.trail.shift(); } else if (g.trail.length) g.trail.shift();
        if (g.trail.length > 1) {
          ctx.lineCap = "round"; const n = g.trail.length;
          for (let i = 1; i < n; i++) { const a = g.trail[i - 1], b = g.trail[i], t = i / n; ctx.strokeStyle = "rgba(255,255,255," + (t * 0.28 * alpha) + ")"; ctx.lineWidth = b.r * 1.7 * t; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
          ctx.lineCap = "butt";
        }
        const sq = g.kickT;
        ctx.globalAlpha = alpha;
        drawBall(ctx, S, bp.x, bp.y, br2, -spin * 0.9, (g.flight ? g.flight.curve : 0) * spin * 2, 1 + sq * 0.22, 1 - sq * 0.18);
        ctx.globalAlpha = 1;
        // atış öncesi: topun etrafında yavaş nabız gibi halka
        if (g.phase === "aim" && !g.swipe) { const t = (g.clock * 0.8) % 1, p0 = proj(R, 0, 0, 0); ctx.strokeStyle = "rgba(255,255,255," + (0.35 * (1 - t)) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p0.x, p0.y + 3, 14 + t * 22, (14 + t * 22) * 0.4, 0, 0, TAU); ctx.stroke(); }
        // kaydırma izi: incelen, parlayan kuyruk
        if (g.swipe && g.swipe.pts.length > 1) {
          const P = g.swipe.pts, n = P.length, from = Math.max(1, n - 40); ctx.lineCap = "round";
          ctx.globalCompositeOperation = "lighter";
          for (let i = from; i < n; i++) { const t = (i - from + 1) / (n - from); ctx.strokeStyle = "rgba(255,240,190," + (0.08 + t * 0.25) + ")"; ctx.lineWidth = 4 + t * 12; ctx.beginPath(); ctx.moveTo(P[i - 1][0], P[i - 1][1]); ctx.lineTo(P[i][0], P[i][1]); ctx.stroke(); }
          ctx.globalCompositeOperation = "source-over";
          for (let i = from; i < n; i++) { const t = (i - from + 1) / (n - from); ctx.strokeStyle = "rgba(255,255,255," + (0.2 + t * 0.7) + ")"; ctx.lineWidth = 1.5 + t * 4; ctx.beginPath(); ctx.moveTo(P[i - 1][0], P[i - 1][1]); ctx.lineTo(P[i][0], P[i][1]); ctx.stroke(); }
          ctx.lineCap = "butt";
        }
        if (g.phase === "aim" && g.shot < 2 && !g.swipe) txt(ctx, "Toptan kaleye doğru kaydır · kavis = falso", cxm, R.y + H * 0.95, 15, "rgba(255,255,255,0.8)", { w: "700", stroke: 3, strokeColor: "rgba(0,20,0,0.35)" });
        K.parts.draw(ctx, g.parts);
        ctx.drawImage(L.vig, R.x, R.y, W, H);
        // atış geçmişi
        { const n = SHOTS, sp = 26, x0 = cxm - n * sp / 2 + sp / 2, y = R.y + 18;
          ctx.fillStyle = "rgba(0,0,0,0.35)"; rr(ctx, x0 - 16, y - 13, n * sp + 6, 26, 13); ctx.fill();
          for (let i = 0; i < n; i++) {
            const r = g.results[i], x = x0 + i * sp;
            if (r) { ctx.fillStyle = r === "goal" ? "#2bb673" : "#c43a3a"; ctx.beginPath(); ctx.arc(x, y, 8.5, 0, TAU); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.arc(x, y - 2, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.fill(); txt(ctx, r === "goal" ? "✓" : "✕", x, y + 1, 11, "#fff"); }
            else { ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.beginPath(); ctx.arc(x, y, 7.5, 0, TAU); ctx.fill(); if (i === g.shot && !g.over) { ctx.strokeStyle = "rgba(255,255,255," + (0.55 + 0.35 * Math.sin(g.clock * 3)) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 9.5, 0, TAU); ctx.stroke(); } }
          } }
        // sonuç yazısı: taşarak belirir
        if (g.msgT > 0) {
          const age = g.msgT0 - g.msgT, sc = age < 0.12 ? 0.4 + age / 0.12 * 0.85 : age < 0.26 ? 1.25 - (age - 0.12) / 0.14 * 0.25 : 1, a = Math.min(1, g.msgT * 2);
          const fs = fit(ctx, g.msg, W - 30, Math.round(W * 0.14), K.DISP, "400");
          ctx.save(); ctx.translate(cxm, R.y + H * 0.5); ctx.scale(sc, sc);
          txt(ctx, g.msg, 0, 5, fs, "rgba(0,0,0,0.4)", { f: K.DISP, w: "400", a });
          txt(ctx, g.msg, 0, 0, fs, g.msgC, { f: K.DISP, w: "400", stroke: 8, a });
          ctx.restore();
        }
        K.pops.draw(ctx, g.pops, 1.1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#0b1326", "#1d5a2a");
    ctx.fillStyle = "rgba(255,255,255,0.04)"; for (let i = 0; i < 6; i += 2) ctx.fillRect(R.x, R.y + R.h * (0.5 + i * 0.09), R.w, R.h * 0.09);
    const r = d && typeof d.r === "string" ? d.r : "";
    txt(ctx, ((d && d.gl) | 0) + " GOL", R.x + R.w / 2, R.y + R.h * 0.42, Math.round(Math.min(40, R.h * 0.26)), "#fff", { f: K.DISP, w: "400", stroke: 4 });
    for (let i = 0; i < SHOTS; i++) { const c = r[i], x = R.x + R.w / 2 - SHOTS * 12 + i * 24 + 12, y = R.y + R.h * 0.72; ctx.fillStyle = c === "g" ? "#2bb673" : c ? "#c43a3a" : "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); }
  }
  K.register({
    id: "penalti", name: "Penaltı", color: "#2bb673", desc: "Kaydırarak şut çek: yön, güç, falso. Kaleciyi avla.",
    rules: "Toptan kaleye kaydır · kavisli kaydır = falso · üst köşe bonus",
    timeLimit: () => null,
    create, drawRemote,
  });
})();
