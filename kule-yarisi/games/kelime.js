// Kelime Avı: 7 harften Türkçe kelimeler bul. Sözlük: dictionary-tr (MIT, © Harun Reşit Zafer).
(() => {
  "use strict";
  const { hash, clamp, rr, txt, fit, SFX, buzz, upper } = K;
  const PUZZLES = ["acforsı", "eefiklş", "aklpçıı", "aamrtyı", "eeikltt", "aakklvı", "eeikstş", "aaabkrs", "eijnost", "akltuuv", "aiikrst", "aartyış", "akstzıı", "aallmsu", "eeikmsz", "anptıış", "aknçıış", "akntçıı", "deiilnr", "aiikllm", "deiills", "ceiirsv", "aakmmsı", "egiimsz", "eeilmmt", "eiilrtş", "deilmnö", "abhkltı", "eiiltşş", "aprtyıı", "eiiklvç", "adklmoı", "abiklsu", "beeilmr", "abiikmt", "abcktuı", "defiilr", "aiimnsz", "cdeilmo", "acklouz", "aabegkl", "arsuzış", "abemnsu", "eklsyöü", "aflptuı", "eiilnzç", "aaknnyı", "adknsuı", "aenorsy", "adeehlt", "aabintı", "aakllnp", "eiilmrt", "aknrtıı", "afhiltı", "eiiknss", "eiilntç", "aknttıı", "aadlmos", "abchirı", "eglnçöü", "acmnsıı", "aaklmmı", "aeklmnı", "aeiklly", "eeiilmç", "aailmtz", "acdilrı", "aaflmos", "aaclmrı", "beehils", "deiilmr", "aflmuış", "egilszü", "aabgmor", "aaaflmn", "cdeeils", "abdeert", "abeiptç", "eiklory", "ahilrtı", "ceiikll", "achilzı", "aalmnou", "aackmyı", "acekmnı", "eeeklmç", "aabmnoy", "aalmmış", "aaaknry", "acknyıı", "aacknzı", "ahiilnt", "aalmtzı", "eeeklmn", "aahklyı", "bdeeiin", "aamsstu", "eeikmty", "eikrtçö", "aaflszı", "aanprtı", "aacklçı", "aeiirst", "afknrsı", "aabmtyı", "kklorsu", "aakklnı", "aackmnı", "eeikmrç", "klnoruu", "aakmntı", "aakklmı", "egiilnç", "deiimnz", "aakknor", "abkltıı", "bceeklö", "eeiklpş", "deiiklr", "aiimnst", "egiilmş", "aeimnsy", "aorrtyı", "abhimtı", "deiimrş", "aelstvı", "amoryış", "eiikksç", "eiklmnö", "ceiiknr", "alnrsıı", "ceiimns", "eikklnö", "aadklnı", "beikluş", "akkmorz", "acekmtu", "aahlltı", "aackllı", "aadkory", "aceilnz", "eiilnrç", "aaklors", "abdeilr", "ceiilln", "aaelmtş", "adefiil", "eiiprsz", "aadkors", "aeilltş", "deeikls", "ceeiklş", "adiikrş", "aagklmı", "ceeikms", "eklnrüü", "aeprsçı", "aadkloş", "afilmrı", "aeikszş", "deimrtü", "aackmrı", "deemnöş", "adknyıı", "abcnorı", "aeeilrt", "eeinrvy", "aaclssı", "eeiklçş", "aiiklmv", "aehlmrı", "aaclmsı", "aclnsıı", "aaksyış", "alnsuuy", "amryıış", "aklssıı", "akpyıış", "ackltuu", "almnouz", "aacclnı", "eeiklyş", "aaklmnı", "acmrtıı", "aijlops", "aalmzçı", "aaijlms", "akpyzıı", "aklltıı", "eefilns", "aaknpsı", "defiinr", "aaalmsy", "aahilnn", "aamyçış", "eiilmzç", "aehkllı", "acmryıı", "aehilps", "abiklsı", "aackmru", "aefiltz", "aenssçı", "aaakmtu", "eiilstt", "aklsıış", "aacknrı", "dorstuy", "eikpttü", "aaakmrs", "aiikmtv", "eeilsvç", "ceiiknş", "eiikkls", "eiikmpr", "aaimnot", "aklrıış", "efiilrş", "aahlnzı", "egilnçü", "alnsıış", "ceiilns", "eiipsty", "adprtıı", "deeimnt", "aabkort", "aacryçı", "aiilmnt", "deiillr", "aclsuuç", "aaadklr", "aklmyıı", "aiklotv", "aantyış", "iiiklns", "aabklzı", "eelrsty", "aacnyzı", "aeikklt", "aacnors", "aacklrı", "eeilmss", "acklçıı", "beiilzş", "ceeiprs", "aacltış", "eimnsuç", "aaalrzı", "eilmyzü", "akmnsıı", "aakmmuy", "amotuzç", "aaadlmı", "aeiklmm", "ahlsıış", "abdlnou", "aktuışş", "ackortı", "eiimnst"];
  const PTS = { 3: 30, 4: 60, 5: 100, 6: 150, 7: 250 };
  let WORDS = null, loadP = null;
  K.loadWords = () => {
    if (!loadP) loadP = fetch("kelimeler.txt").then(r => { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
      .then(t => { WORDS = t.split("\n").filter(Boolean); return WORDS; })
      .catch(e => { loadP = null; throw e; });
    return loadP;
  };
  function counts(s) { const m = {}; for (const ch of s) m[ch] = (m[ch] || 0) + 1; return m; }
  function solve(letters) {
    const bc = counts(letters), out = [];
    for (const w of WORDS) { if (w.length > letters.length) continue; const c = {}; let ok = true; for (const ch of w) { c[ch] = (c[ch] || 0) + 1; if (!bc[ch] || c[ch] > bc[ch]) { ok = false; break; } } if (ok) out.push(w); }
    return new Set(out);
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const base = PUZZLES[Math.floor(hash(seed, 1) * PUZZLES.length) % PUZZLES.length] || "kelimea";
    const letters = base.split("");
    for (let i = letters.length - 1; i > 0; i--) { const j = Math.floor(hash(seed, 50 + i) * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; }
    const g = { score: 0, over: false, letters, order: letters.map((_, i) => i), pick: [], found: [], valid: null, err: null, msg: null, msgT: 0, shake: 0, R: null, pops: [], parts: [], clock: 0, loadErr: false };
    const ready = () => { if (WORDS && !g.valid) g.valid = solve(letters.join("")); };
    if (WORDS) ready(); else K.loadWords().then(ready).catch(() => { g.loadErr = true; });
    const word = () => g.pick.map(i => g.letters[i]).join("");
    function layout(R) {
      const wheelR = Math.min(R.w * 0.34, R.h * 0.19);
      const tile = Math.max(36, Math.min(58, wheelR * 0.52));
      const cx = R.x + R.w / 2, cy = R.y + R.h - 12 - 44 - 14 - tile * 0.5 - wheelR;
      const pos = g.order.map((li, k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / g.letters.length; return { li, x: cx + Math.cos(a) * wheelR, y: cy + Math.sin(a) * wheelR }; });
      const by = cy + wheelR + tile * 0.5 + 14, bw = Math.min(110, (R.w - 48) / 3);
      const btns = [{ id: "del", label: "SİL", x: R.x + R.w / 2 - bw * 1.5 - 10 }, { id: "mix", label: "KARIŞTIR", x: R.x + R.w / 2 - bw / 2 }, { id: "ok", label: "GÖNDER", x: R.x + R.w / 2 + bw / 2 + 10 }].map(b => ({ ...b, y: by, w: bw, h: 44 }));
      return { cx, cy, wheelR, tile, pos, btns, wordY: cy - wheelR - tile * 0.5 - 34 };
    }
    function submit() {
      const w = word();
      if (!g.valid) return;
      if (w.length < 3) { flash("En az 3 harf"); return; }
      if (g.found.includes(w)) { flash("Zaten buldun"); SFX.pop(false); g.pick = []; return; }
      if (!g.valid.has(w)) { flash("Sözlükte yok"); g.shake = 1; SFX.buzz(); buzz(30); g.pick = []; return; }
      let pts = PTS[w.length] || 30;
      const pangram = w.length === g.letters.length;
      if (pangram) pts += 150;
      g.found.push(w); g.score += pts;
      const L = layout(g.R);
      K.pops.add(g.pops, (pangram ? "TÜM HARFLER! " : "") + "+" + pts, L.cx, L.wordY - 20, pangram ? "#ffd34d" : "#8ef0e2", pangram);
      K.parts.burst(g.parts, L.cx, L.wordY, pangram ? "#ffd34d" : "#8ef0e2", 16, 200);
      SFX.chime(Math.min(12, w.length * 2 - 4)); buzz(15);
      g.pick = [];
    }
    function flash(m) { g.msg = m; g.msgT = 1.1; }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: g.valid ? g.found.length + " / " + g.valid.size + " kelime" : "" }; },
      update(dt) { g.clock += dt; g.msgT = Math.max(0, g.msgT - dt); g.shake = Math.max(0, g.shake - dt * 4); K.pops.update(g.pops, dt); K.parts.update(g.parts, dt); },
      pointer(type, x, y) {
        if (type !== "down" || !g.R || g.over) return;
        const L = layout(g.R);
        for (const p of L.pos) if (Math.hypot(x - p.x, y - p.y) < L.tile * 0.62) {
          if (g.pick.includes(p.li)) { if (g.pick[g.pick.length - 1] === p.li) { g.pick.pop(); SFX.pop(false); } return; }
          g.pick.push(p.li); SFX.letter(g.pick.length); return;
        }
        for (const b of L.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
          if (b.id === "del") { if (g.pick.length) { g.pick.pop(); SFX.pop(false); } }
          else if (b.id === "mix") { for (let i = g.order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [g.order[i], g.order[j]] = [g.order[j], g.order[i]]; } SFX.whoosh(); }
          else submit();
          return;
        }
        if (y > L.wordY - 30 && y < L.wordY + 30 && g.pick.length) submit();
      },
      net() { return { f: g.found.length, t: g.valid ? g.valid.size : 0, l: g.found.length ? g.found[g.found.length - 1].length : 0 }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        K.bg(ctx, R, "#2a1d40", "#120f24");
        const L = layout(R);
        // bulunan kelimeler
        const top = R.y + 14, areaH = L.wordY - 50 - top;
        if (!g.valid) {
          txt(ctx, g.loadErr ? "Sözlük yüklenemedi. İnterneti kontrol et." : "Sözlük yükleniyor…", R.x + R.w / 2, top + Math.max(30, areaH / 2), 18, "#cbbcf0", { w: "700" });
        } else {
          const list = g.found.slice().sort((a, b) => b.length - a.length || a.localeCompare(b, "tr"));
          let x = R.x + 14, y = top, size = Math.max(13, Math.min(17, R.w / 26)), hh = size + 12;
          ctx.font = "800 " + size + "px " + K.COND;
          for (const w of list) {
            const label = upper(w), ww = ctx.measureText(label).width + 18;
            if (x + ww > R.x + R.w - 14) { x = R.x + 14; y += hh + 6; }
            if (y + hh > top + areaH) break;
            ctx.fillStyle = w.length === g.letters.length ? "rgba(244,180,0,0.3)" : "rgba(142,240,226,0.15)"; rr(ctx, x, y, ww, hh, hh / 2); ctx.fill();
            txt(ctx, label, x + ww / 2, y + hh / 2 + 1, size, w.length === g.letters.length ? "#ffd34d" : "#c7f5ee", { ls: "1px" });
            x += ww + 6;
          }
          if (!list.length) txt(ctx, "Bulduğun kelimeler burada görünecek", R.x + R.w / 2, top + 20, 15, "rgba(203,188,240,0.6)", { w: "600" });
        }
        // yazılan kelime
        const w = upper(word());
        const sx = g.shake ? Math.sin(g.clock * 60) * 8 * g.shake : 0;
        if (w) txt(ctx, w, L.cx + sx, L.wordY, fit(ctx, w, R.w - 40, 40, K.DISP, "400"), "#ffffff", { f: K.DISP, w: "400", ls: "4px" });
        else txt(ctx, g.msgT > 0 ? g.msg : "Harflere dokun", L.cx, L.wordY, 18, g.msgT > 0 ? "#ff9aa4" : "rgba(255,255,255,0.45)", { w: "700" });
        if (w && g.msgT > 0) txt(ctx, g.msg, L.cx, L.wordY + 28, 15, "#ff9aa4", { w: "700" });
        // harf çarkı
        ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.beginPath(); ctx.arc(L.cx, L.cy, L.wheelR + L.tile * 0.75, 0, Math.PI * 2); ctx.fill();
        if (g.pick.length > 1) {
          ctx.strokeStyle = "rgba(244,180,0,0.6)"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath();
          g.pick.forEach((li, k) => { const p = L.pos.find(q => q.li === li); if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
          ctx.stroke(); ctx.lineCap = "butt";
        }
        for (const p of L.pos) {
          const sel = g.pick.includes(p.li), r = L.tile / 2;
          ctx.fillStyle = sel ? "#f4b400" : "#f3efe7"; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.arc(p.x, p.y + r * 0.12, r, 0, Math.PI); ctx.fill();
          txt(ctx, upper(g.letters[p.li]), p.x, p.y + 1, Math.round(L.tile * 0.55), sel ? "#1b1400" : "#2a1d40", { f: K.DISP, w: "400" });
        }
        for (const b of L.btns) {
          ctx.fillStyle = b.id === "ok" ? "#f4b400" : "rgba(255,255,255,0.1)"; rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
          txt(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, 17, b.id === "ok" ? "#1b1400" : "#f3efe7", { ls: "1px" });
        }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#2a1d40", "#120f24");
    const f = d ? d.f | 0 : 0, t = d ? d.t | 0 : 0;
    txt(ctx, f + (t ? " / " + t : ""), R.x + R.w / 2, R.y + R.h * 0.42, Math.round(Math.min(48, R.h * 0.3)), "#ffffff", { f: K.DISP, w: "400" });
    txt(ctx, "KELİME BULDU", R.x + R.w / 2, R.y + R.h * 0.68, 15, "#cbbcf0", { ls: "2px" });
    if (d && d.l) { const n = d.l, s = 12; for (let i = 0; i < n; i++) { ctx.fillStyle = "#8ef0e2"; rr(ctx, R.x + R.w / 2 - (n * (s + 4)) / 2 + i * (s + 4), R.y + R.h * 0.82, s, s, 3); ctx.fill(); } }
  }
  K.register({
    id: "kelime", name: "Kelime Avı", color: "#8c6bff", desc: "7 harften Türkçe kelimeler bul; uzun kelime daha çok puan.",
    rules: "Harflere sırayla dokun · GÖNDER · en az 3 harf",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
