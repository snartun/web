// Basket: yukarı kaydırarak potaya at. Temiz sayı 3, çembere değip giren 2. Üst üste 3 sayı = ATEŞTE (×2).
(() => {
  "use strict";
  const { hash, clamp, lerp, rr, txt, fit, SFX, buzz } = K;
  const RIM_Y = 0.42, RIM_R = 0.06;
  function swish() { const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return; const c = AU.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = AU.noise; f.type = "bandpass"; f.frequency.setValueAtTime(2500, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.25); f.Q.value = 1.2; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); s.connect(f).connect(g).connect(AU.sfx); s.start(t); s.stop(t + 0.35); }
  function rim(v) { const AU = K.AU; if (!AU.ctx || AU.ctx.state !== "running") return; const c = AU.ctx, t = c.currentTime; for (const [fq, a] of [[310, 0.2 * v], [905, 0.08 * v], [1650, 0.04 * v]]) { const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = fq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.001, a), t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g).connect(AU.sfx); o.start(t); o.stop(t + 0.6); } }
  function bounce(v) { if (!K.play("thud", { vol: 0.5 * v, rate: 1.3 })) SFX.thud(0.4 * v); }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, n: 0, made: 0, streak: 0, phase: "aim", t: 0, ball: null, swipe: null, hoopX: 0, netSw: 0, msg: "", msgC: "#fff", msgT: 0, pops: [], parts: [], R: null, clock: 0, shake: 0, fire: [] };
    const startX = () => (hash(seed, g.n * 3 + 1) - 0.5) * 0.5;
    g.ball = { x: startX(), y: 0, z: 0, spin: 0, sx: 0 };
    const proj = (R, x, y, z) => {
      const fy = R.y + R.h * 0.88, hy = R.y + R.h * 0.6, e = 1 - Math.pow(1 - z, 1.4), s = lerp(1, 0.72, e);
      return { x: R.x + R.w / 2 + x * R.w * 0.9 * s, y: lerp(fy, hy, e) - y * R.h * 0.9 * s, s };
    };
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
    }
    function settle() {
      const s = g.shot, R = g.R, hp = proj(R, g.hoopX, RIM_Y, 1);
      if (s.res === "swish" || s.res === "in") {
        g.streak++; g.made++;
        const fireOn = g.streak >= 3, base = s.res === "swish" ? 3 : 2, pts = base * (fireOn ? 2 : 1);
        g.score += pts; g.netSw = 1;
        if (s.res === "swish") swish(); else { rim(0.7); setTimeout(swish, 120); }
        g.msg = s.res === "swish" ? (fireOn ? "ATEŞTE! TEMİZ!" : "TEMİZ SAYI!") : fireOn ? "ATEŞTE!" : "SAYI!"; g.msgC = fireOn ? "#ff7a2e" : "#ffd34d"; g.msgT = 1;
        K.pops.add(g.pops, "+" + pts, hp.x, hp.y - 30, fireOn ? "#ff7a2e" : "#ffd34d", true);
        K.parts.burst(g.parts, hp.x, hp.y, fireOn ? "#ff7a2e" : "#ffffff", 18, 200);
        SFX.chime(Math.min(10, 2 + g.streak)); buzz(s.res === "swish" ? [20, 30, 40] : 20);
        if (g.streak === 3) { SFX.milestone(); g.shake = 0.5; }
      } else {
        if (g.streak >= 3) { g.msg = "ATEŞ SÖNDÜ"; g.msgC = "#a3a9b8"; g.msgT = 1; }
        else { g.msg = s.res === "rimout" ? "ÇEMBERDEN DÖNDÜ" : s.res === "board" ? "PANYA!" : "KISA KALDI"; g.msgC = "#cfd6e6"; g.msgT = 0.9; }
        g.streak = 0;
        if (s.res === "rimout") rim(1); else if (s.res === "board") { rim(0.3); bounce(1); } else bounce(0.6);
      }
      g.phase = "after"; g.t = 0;
    }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      _g: g,
      info() { return { extra: g.made + "/" + g.n + " isabet" + (g.streak >= 3 ? " · ATEŞTE ×2" : g.streak ? " · seri " + g.streak : "") }; },
      update(dt) {
        g.clock += dt; g.msgT = Math.max(0, g.msgT - dt); g.netSw = Math.max(0, g.netSw - dt * 1.8); g.shake = Math.max(0, g.shake - dt * 2);
        // pota 6 isabetten sonra sağa sola kaymaya başlar (tohumlu hız)
        if (g.made >= 6) g.hoopX = Math.sin(g.clock * (0.7 + hash(seed, 9) * 0.5 + g.made * 0.02)) * Math.min(0.28, 0.08 + (g.made - 6) * 0.02);
        if (g.phase === "fly") {
          const s = g.shot; s.t += dt; const u = clamp(s.t / s.T, 0, 1);
          g.ball.z = u; g.ball.x = lerp(s.sx, s.ex2, u); g.ball.y = lerp(0, s.ey, u) + s.apex * 4 * u * (1 - u); g.ball.spin -= dt * 14;
          if (u >= 1) settle();
        } else if (g.phase === "after") {
          g.t += dt; const s = g.shot;
          if (s.res === "swish" || s.res === "in") { g.ball.y -= dt * 0.6; g.ball.x = lerp(g.ball.x, g.hoopX, dt * 8); }
          else if (s.res === "rimout") { g.ball.x += Math.sign(s.ex || 1) * dt * 0.35; g.ball.y += (0.1 - g.t * 1.2) * dt * 3; }
          else { g.ball.y = Math.max(0, g.ball.y - dt * 0.9); g.ball.z = Math.max(0.6, g.ball.z - dt * 0.4); }
          if (g.t > 0.55) { g.phase = "aim"; g.ball = { x: startX(), y: 0, z: 0, spin: 0 }; }
        }
        if (g.streak >= 3 && g.phase !== "after") g.fire.push({ x: g.ball.x + (Math.random() - 0.5) * 0.03, y: g.ball.y, z: g.ball.z, life: 0.5 });
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
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 10 * g.shake, (Math.random() - 0.5) * 6 * g.shake);
        // salon: karanlık tribün, spot ışığı
        K.bg(ctx, R, "#07090f", "#1b1f2c");
        for (let i = 0; i < 120; i++) { ctx.fillStyle = ["#2a2f3f", "#3a2f2f", "#2f3a4a"][i % 3]; ctx.beginPath(); ctx.arc(R.x + hash(i, 1) * R.w, R.y + R.h * 0.08 + hash(i, 2) * R.h * 0.32, 3 + hash(i, 3) * 3, 0, Math.PI * 2); ctx.fill(); }
        const sp = ctx.createRadialGradient(R.x + R.w / 2, R.y + R.h * 0.35, 10, R.x + R.w / 2, R.y + R.h * 0.5, R.w * 0.8); sp.addColorStop(0, "rgba(255,240,210,0.25)"); sp.addColorStop(1, "rgba(255,240,210,0)"); ctx.fillStyle = sp; ctx.fillRect(R.x, R.y, R.w, R.h);
        // parke: perspektifli tahtalar
        const fy = R.y + R.h * 0.56;
        const pg = ctx.createLinearGradient(0, fy, 0, R.y + R.h); pg.addColorStop(0, "#7a4a22"); pg.addColorStop(1, "#c9844a"); ctx.fillStyle = pg; ctx.fillRect(R.x, fy, R.w, R.y + R.h - fy);
        ctx.strokeStyle = "rgba(60,30,10,0.35)"; ctx.lineWidth = 1;
        for (let i = -12; i <= 12; i++) { const a = proj(R, i * 0.12, 0, 1), b = proj(R, i * 0.12 * 1.0, 0, 0); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + i * R.w * 0.05, R.y + R.h); ctx.stroke(); }
        ctx.fillStyle = "rgba(255,255,255,0.12)"; const glare = ctx.createRadialGradient(R.x + R.w / 2, R.y + R.h * 0.8, 5, R.x + R.w / 2, R.y + R.h * 0.8, R.w * 0.5); glare.addColorStop(0, "rgba(255,255,255,0.18)"); glare.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = glare; ctx.fillRect(R.x, fy, R.w, R.h);
        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2; { const a = proj(R, -0.32, 0, 0.55), b = proj(R, 0.32, 0, 0.55), c2 = proj(R, 0.32, 0, 1), d = proj(R, -0.32, 0, 1); ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c2.x, c2.y); ctx.stroke(); }
        // pota: direk, panya, çember, file
        const hp = proj(R, g.hoopX, RIM_Y, 1), s = hp.s * R.w * 0.9;
        ctx.fillStyle = "#30343d"; ctx.fillRect(hp.x - s * 0.015, hp.y - s * 0.05, s * 0.03, R.y + R.h * 0.58 - hp.y + s * 0.05);
        const bw = s * 0.36, bh = s * 0.22, bx = hp.x - bw / 2, by = hp.y - bh * 0.92;
        ctx.fillStyle = "rgba(220,235,245,0.35)"; rr(ctx, bx, by, bw, bh, 3); ctx.fill(); ctx.strokeStyle = "#e8eef5"; ctx.lineWidth = 2; rr(ctx, bx, by, bw, bh, 3); ctx.stroke();
        ctx.strokeStyle = "#ff6a1a"; ctx.lineWidth = 2; ctx.strokeRect(hp.x - bw * 0.17, by + bh * 0.45, bw * 0.34, bh * 0.42);
        const rw = RIM_R * s * 1.6, sway = Math.sin(g.clock * 22) * g.netSw * 4;
        ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1;
        for (let i = 0; i <= 8; i++) { const t = i / 8, x0 = hp.x - rw + t * rw * 2, x1 = hp.x - rw * 0.55 + t * rw * 1.1 + sway; ctx.beginPath(); ctx.moveTo(x0, hp.y); ctx.lineTo(x1, hp.y + s * 0.11 + g.netSw * s * 0.03); ctx.stroke(); }
        for (let j = 1; j <= 3; j++) { const t = j / 3; ctx.beginPath(); ctx.moveTo(hp.x - rw * (1 - 0.45 * t) + sway * t, hp.y + s * 0.11 * t); ctx.lineTo(hp.x + rw * (1 - 0.45 * t) + sway * t, hp.y + s * 0.11 * t); ctx.stroke(); }
        ctx.strokeStyle = "#ff5a14"; ctx.lineWidth = Math.max(3, s * 0.012); ctx.beginPath(); ctx.ellipse(hp.x, hp.y, rw, rw * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
        // ateş izi
        for (const f of g.fire) { const p = proj(R, f.x, f.y, f.z); ctx.fillStyle = "rgba(255," + (120 + Math.random() * 100 | 0) + ",30," + f.life + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, 6 * p.s * f.life * 2, 0, Math.PI * 2); ctx.fill(); }
        // top (çemberin arkasındaysa çemberin önünü yeniden çiz)
        const b = g.ball, bp = proj(R, b.x, b.y, b.z), shp = proj(R, b.x, 0, b.z), br = Math.max(6, bp.s * R.w * 0.06);
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(shp.x, shp.y + 4, br * 1.05, br * 0.3, 0, 0, Math.PI * 2); ctx.fill();
        const bg2 = ctx.createRadialGradient(bp.x - br * 0.35, bp.y - br * 0.35, br * 0.1, bp.x, bp.y, br); bg2.addColorStop(0, "#ffa65c"); bg2.addColorStop(0.6, "#e0661c"); bg2.addColorStop(1, "#7a3008");
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(bp.x, bp.y, br, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(bp.x, bp.y); ctx.rotate(b.spin); ctx.strokeStyle = "rgba(30,12,4,0.8)"; ctx.lineWidth = Math.max(1, br * 0.07);
        ctx.beginPath(); ctx.moveTo(-br, 0); ctx.lineTo(br, 0); ctx.moveTo(0, -br); ctx.lineTo(0, br); ctx.stroke();
        ctx.beginPath(); ctx.arc(-br * 1.25, 0, br * 0.85, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(br * 1.25, 0, br * 0.85, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
        ctx.restore();
        if (b.z > 0.95 && b.y < RIM_Y + 0.02) { ctx.strokeStyle = "#ff5a14"; ctx.lineWidth = Math.max(3, s * 0.012); ctx.beginPath(); ctx.ellipse(hp.x, hp.y, rw, rw * 0.28, 0, 0, Math.PI); ctx.stroke(); }
        if (g.swipe) { ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(g.swipe.x0, g.swipe.y0); ctx.lineTo(g.swipe.x1, g.swipe.y1); ctx.stroke(); ctx.lineCap = "butt"; }
        if (g.n < 2 && g.phase === "aim" && !g.swipe) txt(ctx, "Topu potaya doğru yukarı kaydır", R.x + R.w / 2, R.y + R.h * 0.96, 15, "rgba(255,255,255,0.75)", { w: "700" });
        if (g.msgT > 0) txt(ctx, g.msg, R.x + R.w / 2, R.y + R.h * 0.24, fit(ctx, g.msg, R.w - 30, Math.round(R.w * 0.1), K.DISP, "400"), g.msgC, { f: K.DISP, w: "400", stroke: 6, a: Math.min(1, g.msgT * 2) });
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1.1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#07090f", "#3a2412");
    txt(ctx, ((d && d.m) | 0) + " / " + ((d && d.n) | 0), R.x + R.w / 2, R.y + R.h * 0.45, Math.round(Math.min(40, R.h * 0.26)), d && d.f ? "#ff7a2e" : "#fff", { f: K.DISP, w: "400" });
    txt(ctx, d && d.f ? "ATEŞTE!" : "İSABET", R.x + R.w / 2, R.y + R.h * 0.72, 15, "#cbd2e0", { ls: "2px" });
  }
  K.register({
    id: "basket", name: "Basket", color: "#ff6a1a", desc: "60 saniyede potaya at. Temiz sayı 3, seri yaparsan ateşlen.",
    rules: "Topu yukarı kaydır · temiz = 3 · çembere değerek = 2 · 3 seri = ×2",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
