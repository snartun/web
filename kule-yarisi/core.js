// Düello Arenası — ortak çekirdek: yardımcılar, çizim araçları, kayıt, ses motoru.
(() => {
  "use strict";
  const K = (window.K = window.K || {});
  K.GAMES = [];
  K.register = def => K.GAMES.push(def);
  K.game = id => K.GAMES.find(g => g.id === id);

  K.DISP = '"Archivo Black", "Arial Black", Impact, sans-serif';
  K.COND = '"Barlow Condensed", "Arial Narrow", sans-serif';
  K.IN_CLAUDE = !!(window.claude && window.claude.use);

  // ---------- matematik ----------
  K.hash = (a, b) => {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  K.strHash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h | 0; };
  K.rng = seed => { let a = (seed | 0) || 1; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  K.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  K.lerp = (a, b, t) => a + (b - a) * t;
  K.easeOut = t => 1 - Math.pow(1 - K.clamp(t, 0, 1), 3);
  K.hex = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  K.mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  K.css = (c, a) => "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : a) + ")";
  K.ramp = (stops, t) => {
    t = K.clamp(t, 0, 1);
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; return K.mix(a[1], b[1], (t - a[0]) / (b[0] - a[0])); }
    return stops[stops.length - 1][1];
  };
  K.fmt = n => Math.round(n).toLocaleString("tr-TR");
  K.upper = s => s.toLocaleUpperCase("tr-TR");

  // ---------- çizim ----------
  K.rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
  K.hazard = (ctx, x, y, w, h, a, b) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = a; ctx.fillRect(x, y, w, h); ctx.fillStyle = b;
    const s = Math.max(4, h * 1.4);
    for (let i = -h * 2; i < w + h * 2; i += s * 2) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + s, y + h); ctx.lineTo(x + i + s + h, y); ctx.lineTo(x + i + h, y); ctx.fill(); }
    ctx.restore();
  };
  K.txt = (ctx, str, x, y, size, color, o) => {
    o = o || {};
    ctx.globalAlpha = o.a == null ? 1 : K.clamp(o.a, 0, 1);
    ctx.font = (o.w || "800") + " " + size + "px " + (o.f || K.COND);
    ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = o.ls || "0px";
    if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || "rgba(8,10,18,0.75)"; ctx.strokeText(str, x, y); }
    ctx.fillStyle = color; ctx.fillText(str, x, y);
    ctx.globalAlpha = 1;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  };
  K.fit = (ctx, str, maxW, size, f, w) => {
    ctx.font = (w || "800") + " " + size + "px " + (f || K.COND);
    const m = ctx.measureText(str).width;
    return m > maxW ? Math.max(9, Math.floor(size * maxW / m)) : size;
  };
  K.heart = (ctx, x, y, s, fill) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.fillStyle = fill; ctx.fill();
  };
  // parlak bilye / top
  K.ball = (ctx, x, y, r, col) => {
    const c = K.hex(col);
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, K.css(K.mix(c, [255, 255, 255], 0.55)));
    g.addColorStop(0.45, col);
    g.addColorStop(1, K.css(K.mix(c, [0, 0, 0], 0.45)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.45, r * 0.28, r * 0.17, -0.5, 0, Math.PI * 2); ctx.fill();
  };
  // yumuşak arka plan
  K.bg = (ctx, r, top, bot) => {
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(r.x, r.y, r.w, r.h);
  };
  // uçuşan yazılar: belirirken büyüyüp oturur (overshoot), yukarı süzülür
  K.pops = {
    add(list, text, x, y, color, big) { list.push({ text, x, y, c: color || "#fff", life: 1.1, big: !!big }); },
    update(list, dt) { for (const p of list) { p.life -= dt * 0.9; p.y -= dt * (p.life > 0.9 ? 70 : 34); } for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1); },
    draw(ctx, list, scale) {
      for (const p of list) {
        const s = Math.round((p.big ? 34 : 22) * (scale || 1)), age = 1.1 - p.life;
        const k = age < 0.1 ? 0.4 + age * 9 : age < 0.22 ? 1.3 - (age - 0.1) * 2.5 : 1;
        ctx.save(); ctx.translate(p.x, p.y); ctx.scale(k, k);
        K.txt(ctx, p.text, 0, 3, s, "rgba(0,0,0,0.35)", { a: Math.min(1, p.life * 1.6), ls: "1px", f: p.big ? K.DISP : K.COND, w: p.big ? "400" : "800" });
        K.txt(ctx, p.text, 0, 0, s, p.c, { a: Math.min(1, p.life * 1.6), stroke: 4, ls: "1px", f: p.big ? K.DISP : K.COND, w: p.big ? "400" : "800" });
        ctx.restore();
      }
    },
  };
  // parçacıklar: parça (dönen, küçülen), kıvılcım (hız yönünde çizgi, toplamalı ışık), konfeti (savrulan),
  // toz (yavaş büyüyen yumuşak bulut), halka (genişleyen şok dalgası)
  const PCAP = 420;
  const push = (list, p) => { if (list.length < PCAP) list.push(p); };
  K.parts = {
    burst(list, x, y, color, n, spd) {
      for (let i = 0; i < (n || 12); i++) { const a = Math.random() * Math.PI * 2, v = (spd || 160) * (0.4 + Math.random() * 0.8); const l = 0.5 + Math.random() * 0.4; push(list, { k: 0, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: l, max: l, s: 2.5 + Math.random() * 3.5, c: color, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14, g: 420, dr: 0.985 }); }
    },
    spark(list, x, y, color, n, spd) {
      for (let i = 0; i < (n || 10); i++) { const a = Math.random() * Math.PI * 2, v = (spd || 260) * (0.5 + Math.random() * 0.7); const l = 0.25 + Math.random() * 0.3; push(list, { k: 1, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: l, max: l, s: 1.2 + Math.random() * 1.6, c: color || "#ffe9a8", g: 260, dr: 0.94 }); }
    },
    confetti(list, x, y, n, spd, colors) {
      const C = colors || ["#ff5a4e", "#ffd34d", "#2bb673", "#3d8bff", "#a46bff", "#ff7ab8", "#ffffff"];
      for (let i = 0; i < (n || 30); i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = (spd || 380) * (0.45 + Math.random() * 0.7); const l = 1.2 + Math.random() * 0.9; push(list, { k: 2, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: l, max: l, s: 4 + Math.random() * 4, c: C[(Math.random() * C.length) | 0], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 18, g: 300, dr: 0.965, ph: Math.random() * 6 }); }
    },
    dust(list, x, y, color, n, spd) {
      for (let i = 0; i < (n || 8); i++) { const a = Math.random() * Math.PI * 2, v = (spd || 50) * (0.3 + Math.random()); const l = 0.6 + Math.random() * 0.5; push(list, { k: 3, x: x + (Math.random() - 0.5) * 8, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.4 - 12, life: l, max: l, s: 6 + Math.random() * 8, c: color || "rgba(200,180,150,1)", g: -10, dr: 0.94 }); }
    },
    ring(list, x, y, color, r, w) { push(list, { k: 4, x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, s: r || 40, w: w || 4, c: color || "#fff", g: 0, dr: 1 }); },
    update(list, dt) {
      for (const p of list) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g == null ? 300 : p.g) * dt; const d = Math.pow(p.dr || 0.98, dt * 60); p.vx *= d; p.vy *= p.k === 2 ? Math.pow(0.97, dt * 60) : 1; if (p.rot != null) p.rot += (p.vr || 0) * dt; if (p.k === 2) { p.ph += dt * 9; p.vx += Math.sin(p.ph) * 40 * dt; } p.life -= dt; }
      for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
    },
    draw(ctx, list) {
      for (const p of list) {
        const t = K.clamp(p.life / (p.max || 1), 0, 1);
        if (p.k === 1) { // kıvılcım
          ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = t; ctx.strokeStyle = p.c; ctx.lineWidth = p.s; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke(); ctx.globalCompositeOperation = "source-over";
        } else if (p.k === 2) { // konfeti: dönerken incelip kalınlaşır
          ctx.globalAlpha = Math.min(1, t * 3); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.ph))); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s * 0.3, p.s, p.s * 0.6); ctx.restore();
        } else if (p.k === 3) { // toz
          const r = p.s * (1.6 - t * 0.8); ctx.globalAlpha = t * 0.35; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        } else if (p.k === 4) { // şok halkası
          const e = 1 - t; ctx.globalAlpha = t * 0.9; ctx.strokeStyle = p.c; ctx.lineWidth = p.w * t + 0.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.3 + K.easeOut(e) * 0.9), 0, Math.PI * 2); ctx.stroke();
        } else { // parça
          const s = p.s * (0.4 + t * 0.6); ctx.globalAlpha = Math.min(1, t * 2.2); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot || 0); ctx.fillStyle = p.c; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(-s / 2, -s / 2, s, s * 0.35); ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    },
  };
  // ---------- oyun hissi: ekran sarsıntısı (travma²), flaş, kısa donma (hit-stop) ----------
  // Oyunlar yalnızca K.kick / K.flash / K.hitstop çağırır; app.js çizimi K.fxBegin/K.fxEnd ile sarar.
  const RM = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  K.FX = { trauma: 0, flash: 0, flashC: "#ffffff", stop: 0, t: 0 };
  K.kick = amt => { K.FX.trauma = Math.min(1, K.FX.trauma + (RM ? amt * 0.3 : amt)); };
  K.flash = (a, c) => { if (a >= K.FX.flash) { K.FX.flash = Math.min(RM ? 0.25 : 0.6, a); K.FX.flashC = c || "#ffffff"; } };
  K.hitstop = s => { K.FX.stop = Math.max(K.FX.stop, Math.min(0.12, s)); };
  K.fxReset = () => { K.FX.trauma = 0; K.FX.flash = 0; K.FX.stop = 0; };
  K.fxUpdate = dt => { K.FX.t += dt; K.FX.trauma = Math.max(0, K.FX.trauma - dt * 1.5); K.FX.flash = Math.max(0, K.FX.flash - dt * 3.5); };
  K.fxBegin = (ctx, R) => {
    const s = K.FX.trauma * K.FX.trauma; if (s < 0.002) return false;
    const t = K.FX.t * 38, m = 16 * s;
    const ox = (Math.sin(t * 1.13) + Math.sin(t * 2.71 + 1.7) * 0.5) * m * 0.66, oy = (Math.sin(t * 1.37 + 4.1) + Math.sin(t * 3.1) * 0.5) * m * 0.66, rot = Math.sin(t * 0.91 + 2.3) * 0.02 * s;
    const cx = R.x + R.w / 2, cy = R.y + R.h / 2, z = 1 + 0.03 * s + (2 * m) / Math.min(R.w, R.h); // kenar boşluğu görünmesin diye hafif yakınlaş
    ctx.save(); ctx.translate(cx + ox, cy + oy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
    return true;
  };
  K.fxEnd = (ctx, R, began) => {
    if (began) ctx.restore();
    if (K.FX.flash > 0.01) { ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip(); ctx.globalAlpha = K.FX.flash; ctx.fillStyle = K.FX.flashC; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.restore(); }
  };

  // ---------- kayıt ----------
  K.store = {
    get(k, d) { try { const v = localStorage.getItem("kule-" + k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("kule-" + k, String(v)); } catch (e) {} },
  };
  K.best = id => parseInt(K.store.get("best2-" + id, "0"), 10) || 0;
  K.saveBest = (id, s) => { if (s > K.best(id)) { K.store.set("best2-" + id, Math.round(s)); return true; } return false; };

  // ---------- titreşim ----------
  K.buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} };

  // ---------- ses motoru (Web Audio; tüm sesler kodla üretilir) ----------
  const AU = (K.AU = {
    ctx: null, master: null, sfx: null, mus: null, noise: null, windGain: null, windFilt: null, timer: null,
    sfxOn: K.store.get("sfx", "1") === "1", musicOn: K.store.get("music", "1") === "1",
    SFX_VOL: 0.45, MUS_VOL: 0.08, level: 0,
  });
  // iOS, uygulamadan çıkılınca sesi "interrupted" durumuna alır ve kendiliğinden açmaz.
  // Her dokunuşta: çalışmıyorsa devam ettir; kapalı/kesintili ise motoru baştan kur.
  function unlockTick() {
    try { const b = AU.ctx.createBuffer(1, 1, 22050), s = AU.ctx.createBufferSource(); s.buffer = b; s.connect(AU.ctx.destination); s.start(0); } catch (e) {}
  }
  function teardown() {
    try { clearInterval(AU.timer); } catch (e) {}
    try { AU.ctx.close(); } catch (e) {}
    AU.ctx = null; AU.timer = null;
  }
  K.onAudioRebuild = [];
  K.auInit = () => {
    if (AU.ctx) {
      const st = AU.ctx.state;
      if (AU.needRebuild || st === "closed" || st === "interrupted") { AU.needRebuild = false; teardown(); }
      else if (st === "running") return;
      else {
        unlockTick();
        AU.ctx.resume().then(() => { if (AU.ctx && AU.ctx.state !== "running") AU.needRebuild = true; }).catch(() => { AU.needRebuild = true; });
        return;
      }
    }
    try { const C = window.AudioContext || window.webkitAudioContext; AU.ctx = new C({ latencyHint: "interactive" }); } catch (e) { AU.ctx = null; return; }
    unlockTick();
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    const c = AU.ctx;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.2;
    comp.connect(c.destination);
    AU.master = c.createGain(); AU.master.gain.value = 0.9; AU.master.connect(comp);
    AU.sfx = c.createGain(); AU.sfx.gain.value = AU.sfxOn ? AU.SFX_VOL : 0; AU.sfx.connect(AU.master);
    AU.mus = c.createGain(); AU.mus.gain.value = AU.musicOn && !AU.quiet ? AU.MUS_VOL : 0; AU.mus.connect(AU.master);
    const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    AU.noise = buf;
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    AU.windFilt = c.createBiquadFilter(); AU.windFilt.type = "bandpass"; AU.windFilt.frequency.value = 500; AU.windFilt.Q.value = 0.6;
    AU.windGain = c.createGain(); AU.windGain.gain.value = 0;
    src.connect(AU.windFilt).connect(AU.windGain).connect(AU.sfx);
    src.start();
    if (c.state === "suspended") c.resume().catch(() => {});
    MUS.next = c.currentTime + 0.15;
    AU.timer = setInterval(musicSchedule, 90);
    AU.windSrc = null;
    decodeAll();
    for (const f of K.onAudioRebuild) { try { f(); } catch (e) {} }
  };
  const ok = () => AU.ctx && AU.ctx.state === "running";
  // ---------- gerçek kayıtlar (CC0; bkz. KAYNAKLAR.md). Yüklenemezse sentez sese düşülür. ----------
  const SAMPLE_NAMES = ["thud", "collapse", "creak", "wind", "win", "lose", "marble", "marbledrop", "pop", "pop2", "bell", "click", "tick", "confirm", "error", "drop", "glass", "select",
    "h_ambient", "h_heart_slow", "h_heart_fast", "h_breath", "h_step1", "h_step2", "h_door", "h_whisper", "h_scrape", "h_click", "h_jump", "h_scream", "h_thunder"];
  const RAW = {};
  K.BUF = {};
  const fetchRaw = n => RAW[n] || (RAW[n] = fetch("ses/" + n + ".mp3").then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null));
  SAMPLE_NAMES.forEach(fetchRaw);
  function decodeAll() {
    const c = AU.ctx; K.BUF = {};
    for (const n of SAMPLE_NAMES) fetchRaw(n).then(ab => { if (!ab || AU.ctx !== c) return; c.decodeAudioData(ab.slice(0)).then(b => { if (AU.ctx === c) K.BUF[n] = b; }).catch(() => {}); });
  }
  K.play = (n, o) => {
    o = o || {};
    const b = K.BUF[n];
    if (!b || !ok()) return null;
    const c = AU.ctx, src = c.createBufferSource(), g = c.createGain(), t = c.currentTime + (o.delay || 0);
    src.buffer = b; src.playbackRate.value = o.rate || 1;
    if (o.loop) { src.loop = true; src.loopStart = 0.04; src.loopEnd = b.duration - 0.04; }
    g.gain.value = o.vol == null ? 1 : o.vol;
    src.connect(g).connect(o.dest || AU.sfx);
    src.start(t, o.offset || 0);
    if (o.dur) { g.gain.setValueAtTime(g.gain.value, t + o.dur - 0.05); g.gain.linearRampToValueAtTime(0.0001, t + o.dur); src.stop(t + o.dur + 0.02); }
    src.gainNode = g;
    return src;
  };
  const now = () => AU.ctx.currentTime;
  const vary = (v, p) => v * (1 + (Math.random() * 2 - 1) * p);
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, dur, peak, dest, a, slide) {
    const c = AU.ctx, o = c.createOscillator(), g = c.createGain(); a = a || 0.005;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + a + dur);
    env(g, t, a, peak, dur); o.connect(g).connect(dest || AU.sfx); o.start(t); o.stop(t + a + dur + 0.05);
  }
  function noise(t, dur, peak, ftype, freq, q, dest, a, freqEnd) {
    const c = AU.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); a = a || 0.002;
    s.buffer = AU.noise; f.type = ftype; f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + a + dur);
    f.Q.value = q || 0.7; env(g, t, a, peak, dur);
    s.connect(f).connect(g).connect(dest || AU.sfx); s.start(t, Math.random() * 0.4); s.stop(t + a + dur + 0.05);
  }
  function duck(amount, hold) {
    if (!AU.ctx || !AU.musicOn || AU.quiet) return;
    const t = now(), g = AU.mus.gain;
    g.cancelScheduledValues(t); g.setTargetAtTime(AU.MUS_VOL * amount, t, 0.02); g.setTargetAtTime(AU.MUS_VOL, t + (hold || 0.25), 0.18);
  }
  function bell(f, t, v) { v = v || 1; osc("sine", f, t, 0.9, 0.32 * v, null, 0.004); osc("sine", f * 2.01, t, 0.5, 0.11 * v); osc("sine", f * 3.02, t, 0.25, 0.045 * v); }
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
  const note = i => 523.25 * Math.pow(2, PENTA[K.clamp(i, 0, PENTA.length - 1)] / 12);
  const S = (K.SFX = {
    // genel
    click() { if (!ok()) return; if (K.play("click", { vol: 0.7 })) return; osc("triangle", 1400, now(), 0.035, 0.08); },
    beep(go) { if (!ok()) return; osc("square", go ? 988 : 660, now(), go ? 0.35 : 0.12, 0.08); },
    tick() { if (!ok()) return; if (K.play("tick", { vol: 0.8 })) return; osc("square", 1500, now(), 0.035, 0.04); },
    buzz() { if (!ok()) return; if (K.play("error", { vol: 0.8 })) return; const t = now(); osc("square", 140, t, 0.16, 0.06); osc("square", 147, t, 0.16, 0.05); },
    chime(i, v) { if (!ok()) return; bell(note(i), now(), v || 1); duck(0.5, 0.3); },
    arp(list, gap, v) { if (!ok()) return; const t = now(); list.forEach((s, i) => bell(523.25 * Math.pow(2, s / 12), t + i * (gap || 0.08), v || 0.8)); duck(0.4, 0.6); },
    milestone() { S.arp([0, 4, 7, 12, 16]); K.play("bell", { vol: 0.5 }); },
    win() { if (!ok()) return; if (K.play("win", { vol: 0.8 })) { duck(0.2, 2.5); return; } const t = now(); [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => { const f = 392 * Math.pow(2, s / 12); osc("triangle", f, t + i * 0.09, i === 6 ? 0.8 : 0.16, 0.12); osc("sine", f * 2, t + i * 0.09, 0.12, 0.04); }); duck(0.2, 1.2); },
    lose() { if (!ok()) return; if (K.play("lose", { vol: 0.7 })) { duck(0.2, 1.5); return; } const t = now(); [7, 3, 0, -5].forEach((s, i) => osc("triangle", 392 * Math.pow(2, s / 12), t + i * 0.16, i === 3 ? 0.7 : 0.18, 0.12)); duck(0.2, 1.2); },
    pop(up) { if (!ok()) return; if (K.play(up ? "pop" : "pop2", { vol: 0.8, rate: vary(up ? 1.15 : 0.92, 0.04) })) return; const t = now(); osc("sine", up ? vary(520, 0.05) : vary(700, 0.05), t, 0.09, 0.22, null, 0.003, up ? 900 : 380); },
    whoosh() { if (!ok()) return; noise(now(), 0.3, 0.2, "bandpass", 350, 1.4, null, 0.05, 1500); },
    thud(k) { if (!ok()) return; k = k || 1; if (K.play("thud", { vol: 0.95 * k, rate: vary(1, 0.06) })) { duck(0.6, 0.15); return; } const t = now(); osc("sine", vary(150, 0.05), t, 0.22, 0.85 * k, null, 0.003, 48); noise(t, 0.09, vary(0.45, 0.15) * k, "lowpass", vary(1200, 0.12), 0.7); noise(t, 0.014, 0.22 * k, "highpass", 3200, 0.7); duck(0.6, 0.15); },
    clack(v) { if (!ok()) return; v = K.clamp(v, 0.05, 1); if (K.play("marble", { vol: v, rate: vary(1, 0.08) })) return; const t = now(); osc("sine", vary(2400, 0.1), t, 0.03, 0.25 * v, null, 0.001); noise(t, 0.02, 0.25 * v, "highpass", 5000); },
    crash() { if (!ok()) return; if (K.play("collapse", { vol: 0.9, rate: vary(1, 0.05) })) { duck(0.35, 1.2); return; } const t = now(); noise(t, 0.9, 0.55, "lowpass", 2600, 0.6, null, 0.003, 280); osc("sine", 95, t, 0.5, 0.75, null, 0.003, 32); noise(t + 0.07, 0.45, 0.18, "highpass", 3200, 0.5); duck(0.35, 0.5); },
    // kule
    release() { if (!ok()) return; const t = now(); osc("square", vary(1700, 0.05), t, 0.025, 0.05); noise(t, 0.03, 0.08, "highpass", 4500); },
    winch() { if (!ok()) return; osc("sawtooth", 70, now(), 0.32, 0.018, null, 0.05, 110); },
    topple() { if (!ok()) return; const t = now(); noise(t, 0.45, 0.28, "bandpass", 900, 2.5, null, 0.02, 280); osc("sawtooth", 120, t, 0.4, 0.04, null, 0.01, 55); },
    creak() { if (!ok()) return; if (K.play("creak", { vol: 0.8, rate: vary(1, 0.05) })) return; const t = now(); noise(t, 0.5, 0.12, "bandpass", 420, 9, null, 0.06, 260); osc("sawtooth", 82, t, 0.45, 0.025, null, 0.05, 64); },
    fall() { if (!ok()) return; osc("sine", 720, now(), 0.6, 0.07, null, 0.01, 170); },
    lifeLost() { if (!ok()) return; const t = now(); osc("triangle", 440, t, 0.14, 0.14); osc("triangle", 311, t + 0.15, 0.3, 0.14); },
    // blok / kelime
    place() { if (!ok()) return; if (K.play("drop", { vol: 0.8, rate: vary(1, 0.05) })) return; const t = now(); osc("triangle", vary(330, 0.04), t, 0.08, 0.2, null, 0.002, 220); noise(t, 0.03, 0.12, "lowpass", 2000); },
    letter(i) { if (!ok()) return; osc("triangle", 440 * Math.pow(2, (i * 2) / 12), now(), 0.07, 0.1); },
  });
  K.setWind = level => {
    if (!AU.ctx || !AU.windGain) return;
    const t = now();
    if (K.BUF.wind && ok()) {
      if (!AU.windSrc && level > 0) AU.windSrc = K.play("wind", { loop: true, vol: 0.0001 });
      if (AU.windSrc) AU.windSrc.gainNode.gain.setTargetAtTime(level * 0.55, t, 0.4);
      AU.windGain.gain.setTargetAtTime(level * 0.06, t, 0.3);
      return;
    }
    AU.windGain.gain.setTargetAtTime(level * 0.22, t, 0.3);
    AU.windFilt.frequency.setTargetAtTime(380 + level * 420 + Math.sin(t * 0.9) * 120, t, 0.3);
  };
  K.setSfx = on => { AU.sfxOn = on; K.store.set("sfx", on ? "1" : "0"); if (AU.sfx) AU.sfx.gain.setTargetAtTime(on ? AU.SFX_VOL : 0, now(), 0.05); };
  // Bazı oyunlar (korku) menü müziğini tamamen susturur.
  K.musicQuiet = q => {
    q = !!q; if (AU.quiet === q) return; AU.quiet = q;
    if (AU.mus) { const t = now(); AU.mus.gain.cancelScheduledValues(t); AU.mus.gain.setTargetAtTime(AU.musicOn && !q ? AU.MUS_VOL : 0, t, q ? 0.05 : 0.4); }
  };
  K.setMusic = on => { AU.musicOn = on; K.store.set("music", on ? "1" : "0"); if (AU.mus) { AU.mus.gain.cancelScheduledValues(now()); AU.mus.gain.setTargetAtTime(on && !AU.quiet ? AU.MUS_VOL : 0, now(), 0.1); } };
  // iOS/Safari: arka plandan dönünce bağlam "running" görünse de sessiz kalabiliyor (WebKit hatası).
  // Bu yüzden sayfa gizlenince motoru "yeniden kurulacak" diye işaretle; dönüşte ilk dokunuşta sıfırdan kur.
  function markHidden() { if (!AU.ctx) return; AU.needRebuild = true; AU.ctx.suspend().catch(() => {}); }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") markHidden();
    else if (AU.ctx) { AU.ctx.resume().catch(() => {}); }
  });
  window.addEventListener("pagehide", markHidden);
  window.addEventListener("blur", () => { if (document.visibilityState === "hidden") markHidden(); });
  window.addEventListener("pageshow", () => { if (AU.ctx && AU.ctx.state !== "running") AU.ctx.resume().catch(() => {}); });
  // Sayfadaki her dokunuş/tıklama/tuş sesi gerekirse yeniden açar (iOS yalnız kullanıcı hareketiyle izin verir).
  for (const ev of ["pointerdown", "touchend", "click", "keydown"]) document.addEventListener(ev, () => K.auInit(), { capture: true, passive: true });

  // Üretken müzik: 92 BPM, C–G–Am–F; her 8 ölçüde yeni melodi; oyun sırasında yoğunlaşır.
  const MUS = { bpm: 92, step: 0, next: 0, prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]] };
  function musicSchedule() {
    const c = AU.ctx;
    if (!c || c.state !== "running") return;
    const spb = 60 / MUS.bpm / 2;
    if (MUS.next < c.currentTime) MUS.next = c.currentTime + 0.05;
    while (MUS.next < c.currentTime + 0.35) { if (AU.musicOn && !AU.quiet) playStep(MUS.step, MUS.next, spb); MUS.step++; MUS.next += spb; }
  }
  function playStep(s, t, spb) {
    const c = AU.ctx, bar = Math.floor(s / 8), pos = s % 8, chord = MUS.prog[bar % 4], lvl = AU.level;
    if (pos === 0) {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900 + lvl * 400;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.35); g.gain.linearRampToValueAtTime(0.0001, t + spb * 8 + 0.4);
      lp.connect(g).connect(AU.mus);
      for (const n of chord) for (const det of [-6, 6]) { const o = c.createOscillator(); o.type = "triangle"; o.frequency.value = 261.63 * Math.pow(2, n / 12); o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + spb * 8 + 0.5); }
    }
    const root = 65.41 * Math.pow(2, chord[0] / 12);
    if (pos === 0 || pos === 4) osc("sine", root, t, spb * 3, 0.3, AU.mus, 0.01);
    if (pos === 6 && lvl > 0) osc("sine", root * 1.5, t, spb, 0.18, AU.mus, 0.01);
    const phrase = Math.floor(bar / 8), r = K.hash(phrase * 977 + 13, s % 16);
    if (r < (lvl > 0 ? 0.5 : 0.3)) {
      const pool = [0, 2, 4, 7, 9, 12, 14, 16];
      const f = 523.25 * Math.pow(2, pool[Math.floor(K.hash(phrase, s % 16 + 100) * pool.length)] / 12);
      osc("triangle", f, t, spb * 1.6, 0.07, AU.mus, 0.004); osc("sine", f * 2, t, spb * 0.8, 0.02, AU.mus, 0.004);
    }
    if (lvl > 0 && pos % 2 === 1) noise(t, 0.03, 0.035, "highpass", 8000, 0.7, AU.mus);
    if (lvl > 0 && (pos === 2 || pos === 6)) noise(t, 0.08, 0.05, "bandpass", 1800, 0.8, AU.mus);
    if (lvl > 1) { const a = [0, 7, 12, 16][pos % 4]; osc("square", 523.25 * Math.pow(2, (chord[0] + a) / 12), t, spb * 0.5, 0.012, AU.mus); }
  }
})();
