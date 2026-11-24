// Karanlık Koridor: el feneriyle 5 sayfayı topla, çıkışı bul. Peşindeki şey her sayfada hızlanır.
// Tasarım ilkeleri (araştırma notları): az ve yerinde ani korku, belirsizlik, karanlık, sesle gerilim,
// sayısal gösterge yerine kaba durumlar; yanıp sönme saniyede 3'ü geçmez; ani korkutma kapatılabilir.
(() => {
  "use strict";
  const { hash, clamp, rr, txt, SFX, buzz } = K;
  const MW = 15, MH = 15, PAGES = 5, FOV = Math.PI / 3, VIEW = 9;

  // ---------- harita (tohumlu labirent + birkaç döngü) ----------
  function makeMaze(seed) {
    const rand = K.rng(seed ^ 0x5bd1e995);
    const m = []; for (let y = 0; y < MH; y++) m.push(new Array(MW).fill(1));
    const stack = [[1, 1]]; m[1][1] = 0;
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]].filter(([dx, dy]) => { const nx = cx + dx, ny = cy + dy; return nx > 0 && ny > 0 && nx < MW - 1 && ny < MH - 1 && m[ny][nx] === 1; });
      if (!dirs.length) { stack.pop(); continue; }
      const [dx, dy] = dirs[Math.floor(rand() * dirs.length)];
      m[cy + dy / 2][cx + dx / 2] = 0; m[cy + dy][cx + dx] = 0; stack.push([cx + dx, cy + dy]);
    }
    for (let i = 0; i < 14; i++) { const x = 1 + Math.floor(rand() * (MW - 2)), y = 1 + Math.floor(rand() * (MH - 2)); if (m[y][x] === 1 && ((m[y][x - 1] === 0 && m[y][x + 1] === 0) || (m[y - 1][x] === 0 && m[y + 1][x] === 0))) m[y][x] = 0; }
    const dist = bfs(m, 1, 1);
    const ends = [];
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) if (!m[y][x]) { const n = [m[y][x - 1], m[y][x + 1], m[y - 1][x], m[y + 1][x]].filter(v => !v).length; if (n === 1 && dist[y][x] > 4) ends.push([x, y, dist[y][x]]); }
    ends.sort((a, b) => b[2] - a[2]);
    let far = ends[0] || [MW - 2, MH - 2];
    // çıkış: en uzak çıkmaz sokağın duvarı; sayfalar: diğer çıkmazlara dağıt
    const exit = { x: far[0], y: far[1] };
    const pool = ends.slice(1);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const pages = [];
    for (const e of pool) { if (pages.length >= PAGES) break; if (pages.every(p => Math.abs(p.x - e[0]) + Math.abs(p.y - e[1]) > 3)) pages.push({ x: e[0] + 0.5, y: e[1] + 0.5, got: false }); }
    while (pages.length < PAGES) { const x = 1 + Math.floor(rand() * (MW - 2)), y = 1 + Math.floor(rand() * (MH - 2)); if (!m[y][x] && dist[y][x] > 3) pages.push({ x: x + 0.5, y: y + 0.5, got: false }); }
    const used = new Set(pages.map(p => Math.floor(p.x) + "," + Math.floor(p.y))); used.add(exit.x + "," + exit.y); used.add("1,1");
    const rest = pool.filter(e => !used.has(e[0] + "," + e[1]));
    const lockers = rest.slice(0, 4).map(e => { let ox = 0, oy = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (m[e[1] + dy][e[0] + dx]) { ox = dx * 0.32; oy = dy * 0.32; break; } return { x: e[0] + 0.5 + ox, y: e[1] + 0.5 + oy }; });
    const bodies = rest.slice(4, 7).map(e => ({ x: e[0] + 0.5, y: e[1] + 0.5 }));
    const lamps = [];
    for (let i = 0; i < 200 && lamps.length < 6; i++) { const x = 1 + Math.floor(rand() * (MW - 2)), y = 1 + Math.floor(rand() * (MH - 2)); if (!m[y][x] && lamps.every(l => Math.abs(l.x - x - 0.5) + Math.abs(l.y - y - 0.5) > 4)) lamps.push({ x: x + 0.5, y: y + 0.5, on: true, level: 1, t: rand() * 3 }); }
    return { m, exit, pages, rand, lockers, bodies, lamps };
  }
  function bfs(m, sx, sy) {
    const d = m.map(r => r.map(() => 1e9)); const q = [[sx, sy]]; d[sy][sx] = 0;
    for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!m[ny][nx] && d[ny][nx] > d[y][x] + 1) { d[ny][nx] = d[y][x] + 1; q.push([nx, ny]); } } }
    return d;
  }

  // ---------- duvar yazıları ve izler (çevresel anlatım) ----------
  function decor(base) {
    const n = base.width, out = [];
    const words = ["ARKANA BAKMA", "BURADAYIM", "ÇIKIŞ YOK", "SESSİZ OL", "SENİ GÖRÜYOR"];
    const r = K.rng(4242);
    const blood = (g, a) => "rgba(" + (70 + (r() * 30 | 0)) + ",0,0," + a + ")";
    const drip = (g, x, y, len) => { g.fillStyle = blood(g, 0.7); g.fillRect(x, y, 1.3, len); g.beginPath(); g.arc(x + 0.6, y + len, 1.1, 0, Math.PI * 2); g.fill(); };
    for (let v = 0; v < 7; v++) {
      const c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"); g.drawImage(base, 0, 0);
      const s = n / 64;
      if (v === 0 || v === 6) { // kanlı el izleri
        for (let k = 0; k < (v === 6 ? 4 : 2); k++) {
          const hx = (14 + r() * 36) * s, hy = (14 + r() * 26) * s; g.save(); g.translate(hx, hy); g.rotate((r() - 0.5) * 0.8);
          g.fillStyle = blood(g, 0.72); g.beginPath(); g.ellipse(0, 0, 4.5 * s, 5.5 * s, 0, 0, Math.PI * 2); g.fill();
          for (let f = 0; f < 5; f++) { g.beginPath(); g.ellipse((-4 + f * 2.1) * s, (-7 - (f === 0 ? -2 : f === 2 ? 1.5 : 0)) * s, 0.9 * s, 3 * s, (f - 2) * 0.18, 0, Math.PI * 2); g.fill(); }
          g.restore(); drip(g, hx, hy + 5 * s, (6 + r() * 14) * s);
        }
      } else if (v === 1) { // sürüklenme izi
        g.strokeStyle = blood(g, 0.6); g.lineCap = "round";
        for (let k = 0; k < 4; k++) { g.lineWidth = (2 + r() * 2) * s; g.beginPath(); g.moveTo(8 * s, (20 + k * 4) * s); g.bezierCurveTo(24 * s, (16 + k * 5) * s, 40 * s, (30 + k * 3) * s, 58 * s, (26 + k * 4) * s); g.stroke(); }
        for (let k = 0; k < 6; k++) drip(g, (12 + r() * 40) * s, (28 + r() * 8) * s, (4 + r() * 16) * s);
      } else if (v === 5) { // çentikler
        g.strokeStyle = "rgba(25,22,18,0.75)"; g.lineWidth = 1.2 * s;
        for (let k = 0; k < 4; k++) { for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo((10 + k * 13 + j * 2.4) * s, 18 * s); g.lineTo((10 + k * 13 + j * 2.4) * s, 30 * s); g.stroke(); } g.beginPath(); g.moveTo((8 + k * 13) * s, 28 * s); g.lineTo((20 + k * 13) * s, 20 * s); g.stroke(); }
      } else { // yazı
        const w = words[(v - 2) % words.length];
        g.fillStyle = blood(g, 0.82); g.font = "bold " + Math.round(9 * s) + "px sans-serif"; g.textAlign = "center";
        const parts = w.split(" "); parts.forEach((p, i) => { let x = n / 2 - g.measureText(p).width / 2; for (const ch of p) { g.save(); g.translate(x, (22 + i * 11) * s + (r() - 0.5) * 2 * s); g.rotate((r() - 0.5) * 0.25); g.textAlign = "left"; g.fillText(ch, 0, 0); g.restore(); if (r() < 0.4) drip(g, x + 2 * s, (23 + i * 11) * s, (3 + r() * 9) * s); x += g.measureText(ch).width + 0.6 * s; } });
      }
      out.push(c);
    }
    return out;
  }

  // ---------- prosedürel dokular ----------
  let TEX = null;
  function makeTextures() {
    if (TEX) return TEX;
    const mk = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); return c; };
    const r = K.rng(77);
    const wall = mk(64, 64, (g, w, h) => {
      g.fillStyle = "#6d6a5a"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const v = (r() * 40) | 0; g.fillStyle = "rgba(" + (60 + v) + "," + (58 + v) + "," + (48 + v) + ",0.35)"; g.fillRect(r() * w, r() * h, 1, 1); }
      for (let i = 0; i < 6; i++) { const x = r() * w, y = r() * h * 0.7; const gr = g.createRadialGradient(x, y, 0, x, y, 6 + r() * 12); gr.addColorStop(0, "rgba(40,32,20,0.45)"); gr.addColorStop(1, "rgba(40,32,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
      for (let i = 0; i < 5; i++) { g.strokeStyle = "rgba(30,26,20,0.45)"; g.lineWidth = 0.7; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 10; y += r() * 8; g.lineTo(x, y); } g.stroke(); }
      for (let x = 0; x < w; x++) { const d = r() * 14 + 6; g.fillStyle = "rgba(40,28,18,0.5)"; g.fillRect(x, h - d, 1, d); }
      g.fillStyle = "rgba(20,30,22,0.5)"; g.fillRect(0, h * 0.62, w, 3);
      g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(0, 0, w, h * 0.62);
    });
    const door = mk(64, 64, (g, w, h) => {
      g.fillStyle = "#2b1d14"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#3a281a" : "#33231a"; g.fillRect(8 + i * 10, 4, 9, h - 4); }
      g.fillStyle = "#1a120c"; g.fillRect(6, 2, w - 12, 3); g.fillRect(6, 2, 3, h); g.fillRect(w - 9, 2, 3, h);
      g.fillStyle = "#8a7a4a"; g.fillRect(44, 34, 6, 3);
      g.fillStyle = "rgba(120,10,10,0.75)"; g.font = "bold 10px sans-serif"; g.fillText("ÇIKIŞ", 16, 18);
    });
    const page = mk(32, 40, (g, w, h) => {
      g.fillStyle = "#e9e2cf"; g.fillRect(2, 2, w - 4, h - 4);
      g.strokeStyle = "rgba(20,20,20,0.75)"; g.lineWidth = 1;
      for (let i = 0; i < 7; i++) { g.beginPath(); let x = 5, y = 7 + i * 4.5; g.moveTo(x, y); while (x < w - 6) { x += 2 + r() * 3; g.lineTo(x, y + (r() - 0.5) * 2); } g.stroke(); }
      g.strokeStyle = "rgba(110,10,10,0.8)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(8, 30); g.lineTo(24, 34); g.moveTo(24, 30); g.lineTo(9, 35); g.stroke();
    });
    const thing = mk(48, 128, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "rgba(5,5,6,1)"); bg.addColorStop(1, "rgba(5,5,6,0.95)");
      g.fillStyle = bg;
      g.beginPath(); g.moveTo(w * 0.5, 14); g.quadraticCurveTo(w * 0.95, 30, w * 0.8, 70); g.lineTo(w * 0.9, h); g.lineTo(w * 0.1, h); g.lineTo(w * 0.2, 70); g.quadraticCurveTo(w * 0.05, 30, w * 0.5, 14); g.fill();
      g.fillRect(w * 0.06, 40, 4, 70); g.fillRect(w * 0.86, 40, 4, 72);
      g.fillStyle = "#d9d6cf"; g.beginPath(); g.ellipse(w * 0.5, 16, 9, 13, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#000"; g.beginPath(); g.ellipse(w * 0.42, 14, 2.6, 3.6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(w * 0.58, 14, 2.6, 3.6, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(w * 0.5, 22, 2.4, 3, 0, 0, Math.PI * 2); g.fill();
    });
    const grain = [0, 1, 2, 3].map(() => mk(128, 128, (g, w, h) => { const id = g.createImageData(w, h); for (let i = 0; i < id.data.length; i += 4) { const v = (Math.random() * 255) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }));
    // yakalanma yüzü: çökük göz çukurları, iğne ucu bebekler, damarlı solgun cilt, uzamış ağız
    const face = mk(260, 340, (g, w, h) => {
      g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
      const cx = w / 2;
      g.save(); g.beginPath(); g.ellipse(cx, h * 0.47, w * 0.4, h * 0.46, 0, 0, Math.PI * 2); g.clip();
      const sk = g.createRadialGradient(cx, h * 0.38, 10, cx, h * 0.5, w * 0.55);
      sk.addColorStop(0, "#c9c4b4"); sk.addColorStop(0.55, "#8e8a7c"); sk.addColorStop(1, "#1c1b17");
      g.fillStyle = sk; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5000; i++) { const v = r() * 60 - 30; g.fillStyle = "rgba(" + (110 + v) + "," + (105 + v) + "," + (95 + v) + ",0.12)"; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
      g.strokeStyle = "rgba(60,40,70,0.35)"; g.lineWidth = 0.8;
      for (let i = 0; i < 14; i++) { g.beginPath(); let x = cx + (r() - 0.5) * w * 0.7, y = h * (0.15 + r() * 0.7); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 18; y += (r() - 0.5) * 18; g.lineTo(x, y); } g.stroke(); }
      for (const side of [-1, 1]) { const cg = g.createRadialGradient(cx + side * w * 0.3, h * 0.6, 4, cx + side * w * 0.3, h * 0.6, w * 0.22); cg.addColorStop(0, "rgba(10,8,6,0.55)"); cg.addColorStop(1, "rgba(10,8,6,0)"); g.fillStyle = cg; g.fillRect(0, 0, w, h); }
      for (const side of [-1, 1]) {
        const ex = cx + side * w * 0.17, ey = h * 0.36;
        const eg = g.createRadialGradient(ex, ey, 2, ex, ey, w * 0.16); eg.addColorStop(0, "#000"); eg.addColorStop(0.55, "rgba(0,0,0,0.95)"); eg.addColorStop(1, "rgba(20,15,10,0)");
        g.fillStyle = eg; g.beginPath(); g.ellipse(ex, ey, w * 0.15, h * 0.11, side * 0.15, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(255,250,235,0.95)"; g.beginPath(); g.arc(ex + side * 2, ey + 3, 2.2, 0, Math.PI * 2); g.fill();
        g.fillStyle = "rgba(140,0,0,0.25)"; g.beginPath(); g.ellipse(ex, ey + h * 0.09, w * 0.05, h * 0.03, 0, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = "rgba(0,0,0,0.85)"; g.beginPath(); g.moveTo(cx - 6, h * 0.5); g.lineTo(cx + 6, h * 0.5); g.lineTo(cx, h * 0.46); g.fill();
      const my = h * 0.56, mh = h * 0.36;
      const mg = g.createLinearGradient(0, my, 0, my + mh); mg.addColorStop(0, "#050303"); mg.addColorStop(1, "#000");
      g.fillStyle = mg; g.beginPath(); g.moveTo(cx - w * 0.16, my + 6); g.quadraticCurveTo(cx, my - 8, cx + w * 0.16, my + 6); g.quadraticCurveTo(cx + w * 0.12, my + mh, cx, my + mh + 6); g.quadraticCurveTo(cx - w * 0.12, my + mh, cx - w * 0.16, my + 6); g.fill();
      g.fillStyle = "#b9ad86";
      for (let i = 0; i < 9; i++) { const x = cx - w * 0.14 + i * w * 0.035, len = 8 + r() * 14; g.beginPath(); g.moveTo(x, my + 2); g.lineTo(x + w * 0.017, my + 2 + len); g.lineTo(x + w * 0.032, my + 2); g.fill(); }
      for (let i = 0; i < 7; i++) { const x = cx - w * 0.1 + i * w * 0.033, len = 6 + r() * 12, by = my + mh - 6; g.beginPath(); g.moveTo(x, by); g.lineTo(x + w * 0.016, by - len); g.lineTo(x + w * 0.03, by); g.fill(); }
      g.strokeStyle = "rgba(20,10,10,0.6)"; g.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) { g.beginPath(); let x = cx + (r() - 0.5) * w * 0.6, y = h * (0.1 + r() * 0.3); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 14; y += 6 + r() * 8; g.lineTo(x, y); } g.stroke(); }
      g.restore();
      const vg = g.createRadialGradient(cx, h * 0.47, w * 0.25, cx, h * 0.47, w * 0.55); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.9)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    });
    // daha tekinsiz varlık: uzun, sıska, kollar dizlere kadar, baş yana eğik
    const thing2 = mk(56, 160, (g, w, h) => {
      const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, "#c8c2b6"); sk.addColorStop(0.35, "#8f897c"); sk.addColorStop(1, "#1a1816");
      g.save(); g.translate(w / 2, 0);
      g.fillStyle = "#0c0b0a"; g.beginPath(); g.moveTo(-9, 34); g.lineTo(9, 34); g.lineTo(11, 96); g.lineTo(7, h); g.lineTo(2, h); g.lineTo(0, 100); g.lineTo(-2, h); g.lineTo(-7, h); g.lineTo(-11, 96); g.fill();
      g.fillStyle = sk; g.beginPath(); g.moveTo(-8, 34); g.quadraticCurveTo(0, 30, 8, 34); g.lineTo(9, 70); g.quadraticCurveTo(0, 76, -9, 70); g.fill();
      g.strokeStyle = "rgba(40,30,30,0.6)"; g.lineWidth = 0.8; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-6, 40 + i * 5); g.quadraticCurveTo(0, 42 + i * 5, 6, 40 + i * 5); g.stroke(); }
      g.strokeStyle = "#a9a294"; g.lineCap = "round";
      g.lineWidth = 3; g.beginPath(); g.moveTo(-8, 36); g.lineTo(-17, 72); g.lineTo(-19, 112); g.stroke(); g.beginPath(); g.moveTo(8, 36); g.lineTo(16, 74); g.lineTo(21, 116); g.stroke();
      g.lineWidth = 1.2; for (const sx of [-1, 1]) for (let f = 0; f < 4; f++) { g.beginPath(); g.moveTo(sx * (19 + (sx > 0 ? 2 : 0)), sx > 0 ? 116 : 112); g.lineTo(sx * (17 + f * 2), (sx > 0 ? 116 : 112) + 10 + f); g.stroke(); }
      g.rotate(0.28);
      const hg = g.createRadialGradient(-1, 16, 2, 0, 18, 13); hg.addColorStop(0, "#d6d0c3"); hg.addColorStop(1, "#6d685e");
      g.fillStyle = hg; g.beginPath(); g.ellipse(0, 18, 8.5, 14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#000"; g.beginPath(); g.ellipse(-3.4, 15, 2.6, 3.6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(3.4, 15, 2.6, 3.6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,250,235,0.95)"; g.fillRect(-3.6, 15, 1, 1); g.fillRect(3.2, 15, 1, 1);
      g.fillStyle = "#050303"; g.beginPath(); g.ellipse(0, 25, 3, 5.5, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    });
    const locker = mk(40, 96, (g, w, h) => {
      const lg = g.createLinearGradient(0, 0, w, 0); lg.addColorStop(0, "#3d4548"); lg.addColorStop(0.5, "#596266"); lg.addColorStop(1, "#30373a");
      g.fillStyle = lg; g.fillRect(2, 2, w - 4, h - 2);
      g.fillStyle = "#1d2224"; g.fillRect(w / 2 - 1, 4, 2, h - 6);
      for (let i = 0; i < 6; i++) { g.fillStyle = "#101315"; g.fillRect(6, 10 + i * 4, w / 2 - 9, 2); g.fillRect(w / 2 + 3, 10 + i * 4, w / 2 - 9, 2); }
      g.fillStyle = "rgba(120,70,30,0.5)"; for (let i = 0; i < 60; i++) g.fillRect(2 + r() * (w - 4), 2 + r() * (h - 4), 1.5, 1.5);
      g.fillStyle = "#8a8f90"; g.fillRect(w / 2 - 5, h * 0.5, 2, 6); g.fillRect(w / 2 + 3, h * 0.5, 2, 6);
    });
    const body = mk(96, 40, (g, w, h) => {
      const sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, "#bdb6a6"); sg.addColorStop(1, "#6e685c");
      g.fillStyle = "rgba(60,0,0,0.85)"; g.beginPath(); g.ellipse(w * 0.55, h - 5, w * 0.48, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = sg; g.beginPath(); g.moveTo(6, h - 6); g.quadraticCurveTo(10, h - 22, 22, h - 24); g.quadraticCurveTo(34, h - 34, 50, h - 26); g.quadraticCurveTo(70, h - 30, 88, h - 16); g.lineTo(92, h - 6); g.fill();
      g.strokeStyle = "rgba(40,30,25,0.5)"; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(14 + i * 13, h - 8); g.quadraticCurveTo(18 + i * 13, h - 20, 24 + i * 13, h - 8); g.stroke(); }
      g.fillStyle = "rgba(110,0,0,0.75)"; g.beginPath(); g.ellipse(46, h - 20, 9, 5, 0.2, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(30, h - 14, 4, 3, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#cfc8b8"; g.beginPath(); g.ellipse(91, h - 9, 4, 2.4, 0.4, 0, Math.PI * 2); g.fill();
    });
    const lamp = mk(24, 80, (g, w, h) => {
      g.fillStyle = "#151515"; g.fillRect(w / 2 - 0.6, 0, 1.2, h - 22);
      g.fillStyle = "#2b2b2b"; g.beginPath(); g.moveTo(w / 2 - 9, h - 14); g.lineTo(w / 2 + 9, h - 14); g.lineTo(w / 2 + 4, h - 22); g.lineTo(w / 2 - 4, h - 22); g.fill();
      const bg = g.createRadialGradient(w / 2, h - 10, 0, w / 2, h - 10, 8); bg.addColorStop(0, "#fff7d6"); bg.addColorStop(1, "rgba(255,210,120,0)");
      g.fillStyle = bg; g.beginPath(); g.arc(w / 2, h - 10, 8, 0, Math.PI * 2); g.fill();
    });
    TEX = { wall, wallProc: wall, door, page, thing: thing2, grain, face, locker, body, lamp };
    TEX.decals = decor(wall);
    return TEX;
  }

  const PHOTO = {};
  function photo(n) { if (!PHOTO[n]) { const im = new Image(); im.src = "doku/" + n + ".jpg"; PHOTO[n] = im; } const im = PHOTO[n]; return im.complete && im.naturalWidth ? im : null; }
  ["beton", "zemin", "kapi", "pas"].forEach(photo);
  function upgradeTextures(T) {
    if (T.photo) return;
    const be = photo("beton"), ze = photo("zemin"), ka = photo("kapi"), pa = photo("pas");
    if (!be || !ze || !ka || !pa) return;
    const tint = (im, size, col, extra) => { const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d"); g.drawImage(im, 0, 0, size, size); g.globalCompositeOperation = "multiply"; g.fillStyle = col; g.fillRect(0, 0, size, size); g.globalCompositeOperation = "source-over"; if (extra) extra(g, size); return c; };
    const grime = (g, n) => { g.globalAlpha = 0.55; g.drawImage(T.wallProc, 0, 0, n, n); g.globalAlpha = 1; };
    T.wall = tint(be, 128, "#9a9481", grime);
    T.rust = tint(pa, 128, "#7a6f62", grime);
    T.door = tint(ka, 128, "#6b5a46", (g, n) => { g.fillStyle = "rgba(120,10,10,0.8)"; g.font = "bold 16px sans-serif"; g.fillText("ÇIKIŞ", n * 0.3, n * 0.12); });
    const fc = tint(ze, 128, "#a09888");
    T.floorPx = fc.getContext("2d").getImageData(0, 0, 128, 128).data;
    T.decals = decor(T.wall);
    T.photo = true;
  }

  // ---------- korku sesleri (Web Audio) ----------
  function makeAudio() {
    const AU = K.AU;
    if (!AU.ctx || !AU.sfx) return null;
    const c = AU.ctx, out = c.createGain(); out.gain.value = 0.9; out.connect(AU.sfx);
    const A = { c, out, ok: true };
    // uğultu: küçük ikili (55 Hz & 58,27 Hz) + alçak geçiren gürültü
    A.droneG = c.createGain(); A.droneG.gain.value = 0; A.droneG.connect(out);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320; lp.connect(A.droneG);
    for (const f of [55, 58.27, 82.4]) { const o = c.createOscillator(); o.type = f === 82.4 ? "triangle" : "sawtooth"; o.frequency.value = f; const g = c.createGain(); g.gain.value = f === 82.4 ? 0.12 : 0.22; o.connect(g).connect(lp); o.start(); }
    const lfo = c.createOscillator(); lfo.frequency.value = 0.07; const lg = c.createGain(); lg.gain.value = 140; lfo.connect(lg).connect(lp.frequency); lfo.start();
    const ns = c.createBufferSource(); ns.buffer = AU.noise; ns.loop = true; const nf = c.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 260; nf.Q.value = 0.5; const ng = c.createGain(); ng.gain.value = 0.25; ns.connect(nf).connect(ng).connect(A.droneG); ns.start();
    // parazit (varlık görüldükçe artar)
    A.staticG = c.createGain(); A.staticG.gain.value = 0; A.staticG.connect(out);
    const s2 = c.createBufferSource(); s2.buffer = AU.noise; s2.loop = true; const sf = c.createBiquadFilter(); sf.type = "highpass"; sf.frequency.value = 1800; s2.connect(sf).connect(A.staticG); s2.start();
    // yönlü kaynak (HRTF)
    A.panner = c.createPanner(); A.panner.panningModel = "HRTF"; A.panner.distanceModel = "inverse"; A.panner.refDistance = 1; A.panner.rolloffFactor = 1.2; A.panner.connect(out);
    A.fadeIn = () => { A.droneG.gain.setTargetAtTime(0.4, c.currentTime, 1.5); A.startAmb(); };
    A.startAmb = () => { if (A.amb || !K.BUF.h_ambient) return; A.amb = K.play("h_ambient", { loop: true, vol: 0.0001, dest: A.out }); if (A.amb) A.amb.gainNode.gain.setTargetAtTime(0.75, c.currentTime, 2); };
    A.silence = sec => { const t = c.currentTime; A.droneG.gain.cancelScheduledValues(t); A.droneG.gain.setTargetAtTime(0.0001, t, 0.15); A.droneG.gain.setTargetAtTime(0.55, t + sec, 0.8); };
    A.stop = () => { const t = c.currentTime; try { A.chaseG.gain.setTargetAtTime(0, t, 0.3); if (A.amb) { A.amb.gainNode.gain.setTargetAtTime(0, t, 0.4); A.amb.stop(t + 2); } A.droneG.gain.setTargetAtTime(0, t, 0.3); A.staticG.gain.setTargetAtTime(0, t, 0.2); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 1500); } catch (e) {} A.ok = false; };
    const env = (g, t, a, p, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    const tone = (type, f, t, d, p, dest, slide) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); env(g, t, 0.005, p, d); o.connect(g).connect(dest || out); o.start(t); o.stop(t + d + 0.1); };
    const noise = (t, d, p, type, f, q, dest, a, fEnd) => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = AU.noise; fl.type = type; fl.frequency.setValueAtTime(f, t); if (fEnd) fl.frequency.exponentialRampToValueAtTime(fEnd, t + d); fl.Q.value = q || 0.7; env(g, t, a || 0.003, p, d); s.connect(fl).connect(g).connect(dest || out); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.1); };
    A.heart = k => { if (K.play(k > 0.55 ? "h_heart_fast" : "h_heart_slow", { vol: 0.35 + k * 0.6, dur: k > 0.55 ? 0.42 : 0.6, rate: 1 + k * 0.15, dest: out })) return; const t = c.currentTime; tone("sine", 62, t, 0.12, 0.35 + k * 0.4, null, 40); tone("sine", 55, t + 0.18, 0.14, 0.25 + k * 0.3, null, 38); };
    A.step = (k, run) => { if (K.play(Math.random() < 0.5 ? "h_step1" : "h_step2", { vol: 0.22, rate: 0.95 + Math.random() * 0.1, dest: out })) return; const t = c.currentTime; noise(t, 0.06, 0.05 + k * 0.04, "lowpass", 700 + Math.random() * 300, 0.7); tone("sine", 90, t, 0.05, 0.05 * (run ? 1.5 : 1)); };
    A.thingStep = (x, z, vol) => { vol = vol == null ? 1 : vol; A.panner.positionX ? (A.panner.positionX.value = x, A.panner.positionY.value = 0, A.panner.positionZ.value = z) : A.panner.setPosition(x, 0, z); if (K.play("h_step1", { vol: 1.4 * vol, rate: 0.72 + Math.random() * 0.06, dest: A.panner })) return; const t = c.currentTime; tone("sine", 70, t, 0.18, 0.5, A.panner, 40); noise(t, 0.12, 0.35, "lowpass", 400, 0.8, A.panner); };
    A.distant = (x, z, kind) => {
      A.panner.positionX ? (A.panner.positionX.value = x, A.panner.positionZ.value = z) : A.panner.setPosition(x, 0, z);
      const t = c.currentTime;
      const smp = ["h_door", "h_scrape", "h_whisper", "h_thunder"][kind];
      if (K.play(smp, { vol: kind === 3 ? 0.35 : kind === 2 ? 0.8 : 0.6, rate: 0.9 + Math.random() * 0.15, dest: kind === 3 ? out : A.panner })) return;
      if (kind === 0) { const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = "sawtooth"; o.frequency.setValueAtTime(240, t); o.frequency.linearRampToValueAtTime(330, t + 0.6); o.frequency.linearRampToValueAtTime(210, t + 1.2); f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 6; env(g, t, 0.2, 0.06, 1.2); o.connect(f).connect(g).connect(A.panner); o.start(t); o.stop(t + 1.6); }
      else if (kind === 1) noise(t, 1.0, 0.12, "bandpass", 2400, 12, A.panner, 0.1, 1400);
      else { for (let i = 0; i < 6; i++) noise(t + i * 0.09 + Math.random() * 0.05, 0.08, 0.06, "bandpass", 2500 + Math.random() * 2000, 3, A.panner); }
    };
    A.page = () => { const t = c.currentTime; noise(t, 0.25, 0.25, "highpass", 3000, 0.7, null, 0.02); tone("sine", 41, t + 0.05, 2.2, 0.8, null, 30); tone("sawtooth", 82.4, t + 0.05, 1.6, 0.06); tone("sawtooth", 87.3, t + 0.05, 1.6, 0.06); };
    A.sting = () => { const t = c.currentTime; for (const f of [233, 247, 349, 370]) tone("sawtooth", f, t, 0.9, 0.08); noise(t, 0.6, 0.35, "bandpass", 1500, 1, null, 0.01, 600); tone("sine", 45, t, 1.2, 0.8, null, 30); };
    A.scream = () => { if (K.play("h_jump", { vol: 1, dest: out })) { K.play("h_scream", { vol: 0.75, dest: out, delay: 0.05 }); return; }
      const t = c.currentTime, g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4); g.connect(out);
      for (const [f, d] of [[620, 0], [930, 7], [1240, -9]]) { const o = c.createOscillator(), bp = c.createBiquadFilter(); o.type = "sawtooth"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.25); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 1.3); o.detune.value = d; bp.type = "bandpass"; bp.frequency.value = f * 1.2; bp.Q.value = 2; o.connect(bp).connect(g); o.start(t); o.stop(t + 1.5); }
      noise(t, 1.2, 0.5, "bandpass", 2000, 0.8, g, 0.01, 900); tone("sine", 40, t, 1.4, 0.9, null, 25);
    };
    A.chaseG = c.createGain(); A.chaseG.gain.value = 0; A.chaseG.connect(out);
    { const lpC = c.createBiquadFilter(); lpC.type = "lowpass"; lpC.frequency.value = 260; const pg = c.createGain(); pg.gain.value = 0; lpC.connect(pg).connect(A.chaseG);
      const o1 = c.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 55; o1.connect(lpC); o1.start();
      const lfoC = c.createOscillator(); lfoC.type = "square"; lfoC.frequency.value = 2.3; const lgC = c.createGain(); lgC.gain.value = 0.35; lfoC.connect(lgC).connect(pg.gain); lfoC.start(); pg.gain.value = 0.35;
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = 3; const sg2 = c.createGain(); sg2.gain.value = 0.05; bp.connect(sg2).connect(A.chaseG);
      for (const f of [466.2, 493.9, 698.5]) { const o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; const vib = c.createOscillator(); vib.frequency.value = 5 + Math.random(); const vg = c.createGain(); vg.gain.value = 4; vib.connect(vg).connect(o.frequency); vib.start(); o.connect(bp); o.start(); } }
    A.chase = on => { A.chaseG.gain.setTargetAtTime(on ? 0.6 : 0, c.currentTime, on ? 0.3 : 1.2); };
    A.boom = () => { const t = c.currentTime; tone("sine", 38, t, 2.5, 0.9, null, 25); noise(t, 1.8, 0.3, "lowpass", 300, 0.7); };
    A.click = () => { if (K.play("h_click", { vol: 0.9, dest: out })) return; const t = c.currentTime; tone("square", 2200, t, 0.02, 0.06); noise(t, 0.02, 0.08, "highpass", 4000); };
    A.breath = k => { if (K.play("h_breath", { vol: 0.2 + 0.5 * k, rate: 1 + k * 0.2, dest: out })) return; const t = c.currentTime; noise(t, 0.7, 0.04 + 0.08 * k, "bandpass", 900, 1.2, null, 0.3, 500); noise(t + 0.9, 0.6, 0.03 + 0.06 * k, "bandpass", 700, 1.2, null, 0.25, 400); };
    return A;
  }

  // ---------- oyun ----------
  function create(opts) {
    const seed = opts.seed | 0, T = makeTextures();
    const map = makeMaze(seed), m = map.m;
    const jumpOn = K.store.get("jump", "1") === "1";
    const g = {
      score: 0, over: false, caught: false, escaped: false,
      px: 1.5, py: 1.5, pa: 0, pages: map.pages, got: 0,
      battery: 1, lightOn: true, flick: 0,
      sx: -10, sy: -10, rx: -10, ry: -10, sDir: 0, ai: "dormant", target: null, detect: 0, menace: 0, lastSeen: [1.5, 1.5], lastSeenT: -99, chaseT: 0, searchT: 0, retreatT: 0, stutT: 0, glimpseT: 6, glimpse: null,
      sPath: null, sTimer: 0, sStare: 0, sVisible: false, lastStep: 0, sStepT: 0, running: false, noise: 0, stamina: 1, hidden: false, hideSpotted: false, savedLight: true,
      lightsOutT: 0, hallu: 0, halluT: 30, halluSide: 1, dust: Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, s: 0.6 + Math.random() * 1.4 })),
      joy: null, look: null, clock: 0, bob: 0, heartT: 0, breathT: 3, eventT: 8, scare: 0, glitch: 0, msg: "", msgT: 0, R: null, A: null, started: false, endT: 0,
    };
    // başlangıç yönü: en uzun açık koridora bak
    { let best = -1; for (const [a, dx, dy] of [[0, 1, 0], [Math.PI / 2, 0, 1], [Math.PI, -1, 0], [-Math.PI / 2, 0, -1]]) { let n = 0, x = 1, y = 1; while (!m[y + dy][x + dx]) { x += dx; y += dy; n++; } if (n > best) { best = n; g.pa = a; } } }
    const solid = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); return cx < 0 || cy < 0 || cx >= MW || cy >= MH || m[cy][cx] === 1; };
    function move(dx, dy, r) {
      const nx = g.px + dx, ny = g.py + dy;
      if (!solid(nx + Math.sign(dx) * r, g.py - r * 0.7) && !solid(nx + Math.sign(dx) * r, g.py + r * 0.7)) g.px = nx;
      if (!solid(g.px - r * 0.7, ny + Math.sign(dy) * r) && !solid(g.px + r * 0.7, ny + Math.sign(dy) * r)) g.py = ny;
    }
    function rayCast(a) {
      const dx = Math.cos(a), dy = Math.sin(a);
      let mx = Math.floor(g.px), my = Math.floor(g.py);
      const ddx = Math.abs(1 / dx), ddy = Math.abs(1 / dy);
      let stepX, stepY, sdx, sdy;
      if (dx < 0) { stepX = -1; sdx = (g.px - mx) * ddx; } else { stepX = 1; sdx = (mx + 1 - g.px) * ddx; }
      if (dy < 0) { stepY = -1; sdy = (g.py - my) * ddy; } else { stepY = 1; sdy = (my + 1 - g.py) * ddy; }
      let side = 0;
      for (let i = 0; i < 64; i++) {
        if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
        if (mx < 0 || my < 0 || mx >= MW || my >= MH || m[my][mx]) break;
      }
      const dist = side === 0 ? (mx - g.px + (1 - stepX) / 2) / dx : (my - g.py + (1 - stepY) / 2) / dy;
      let wx = side === 0 ? g.py + dist * dy : g.px + dist * dx; wx -= Math.floor(wx);
      if ((side === 0 && dx < 0) || (side === 1 && dy > 0)) wx = 1 - wx; // dokuyu doğru yönde göster (yazılar ters çıkmasın)
      const isExit = mx === map.exit.x && my === map.exit.y ? false : (Math.abs(mx - map.exit.x) + Math.abs(my - map.exit.y) === 1 && exitWall(mx, my));
      return { dist: Math.max(0.05, dist), side, wx, door: isExit, rust: hash(mx * 31 + 7, my * 17 + 3) > 0.84, deco: hash(mx * 13 + side, my * 29 + 5), mx, my };
    }
    // çıkış kapısı: çıkış hücresinin bitişiğindeki duvar(lar)dan biri
    let exitDoor = null;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = map.exit.x + dx, y = map.exit.y + dy; if (m[y] && m[y][x] === 1) { exitDoor = [x, y]; break; } }
    function exitWall(x, y) { return exitDoor && exitDoor[0] === x && exitDoor[1] === y; }
    const canSee = (x, y) => { const dx = x - g.px, dy = y - g.py, d = Math.hypot(dx, dy); const steps = Math.ceil(d * 4); for (let i = 1; i < steps; i++) if (solid(g.px + (dx * i) / steps, g.py + (dy * i) / steps)) return false; return true; };
    function relAngle(x, y) { let a = Math.atan2(y - g.py, x - g.px) - g.pa; while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
    function audio() { if (!g.A || !g.A.ok || g.A.c !== K.AU.ctx) { g.A = makeAudio(); if (g.A && g.started) g.A.fadeIn(); } return g.A; }
    function spawnFar(minD) {
      const cells = [];
      for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) if (!m[y][x]) { const d = Math.hypot(x + 0.5 - g.px, y + 0.5 - g.py); if (d > minD && !(Math.abs(relAngle(x + 0.5, y + 0.5)) < FOV && canSee(x + 0.5, y + 0.5))) cells.push([x, y]); }
      const c = cells.length ? cells[Math.floor(map.rand() * cells.length)] : [MW - 2, MH - 2];
      g.sx = g.rx = c[0] + 0.5; g.sy = g.ry = c[1] + 0.5; g.sPath = null; g.target = null; g.detect = 0;
    }
    const nearLocker = () => map.lockers.find(l => Math.hypot(l.x - g.px, l.y - g.py) < 0.95);
    function endGame(kind) {
      if (g.over) return;
      g.over = true; g.endT = 0;
      const A = audio();
      if (kind === "caught") {
        g.caught = true; buzz([100, 50, 200]);
        if (jumpOn) { g.scare = 1; if (A) A.scream(); } else if (A) A.boom();
      } else { g.escaped = true; if (A) A.boom(); SFX.win(); }
      setTimeout(() => { if (g.A) g.A.stop(); }, 1800);
    }
    const inst = {
      get score() { return Math.round(g.score); },
      get over() { return g.over && g.endT > 1.6; },
      info() { return { extra: g.hidden ? "SAKLANIYORSUN" : "SAYFA " + g.got + "/" + PAGES + (g.got >= PAGES ? " · ÇIKIŞI BUL" : ""), sub: g.battery > 0.66 ? "FENER ███" : g.battery > 0.33 ? "FENER ██░" : g.battery > 0.05 ? "FENER █░░" : "FENER ░░░" }; },
      dispose() { if (g.A) g.A.stop(); },
      update(dt, active) {
        g.clock += dt; g.msgT = Math.max(0, g.msgT - dt); g.glitch = Math.max(0, g.glitch - dt * 2); g.hallu = Math.max(0, g.hallu - dt);
        if (g.over) { g.endT += dt; g.scare = Math.max(0, g.scare - dt * 0.9); return; }
        if (!active) return;
        const A = audio();
        if (!g.started) { g.started = true; if (A) A.fadeIn(); g.msg = "Sayfaları bul. Sessiz ol."; g.msgT = 3.5; }
        if (A && !A.amb) A.startAmb();
        // lambalar: düzensiz titreme (saniyede en çok ~2 değişim; WCAG 2.3.1)
        for (const l of map.lamps) { l.t -= dt; if (l.t <= 0) { const dead = g.lightsOutT > 0; l.on = dead ? false : !l.on || map.rand() < 0.75; l.t = l.on ? 0.6 + map.rand() * 3.5 : 0.45 + map.rand() * 1.2; } l.level += ((l.on ? 1 : 0) - l.level) * Math.min(1, dt * 18); }
        g.lightsOutT = Math.max(0, g.lightsOutT - dt);
        // hareket: sol çubuk (sonuna kadar it = koş, gürültülü)
        let fwd = 0, turn = 0;
        if (g.joy && !g.hidden) { fwd = clamp(-g.joy.dy / 60, -1, 1); turn = clamp(g.joy.dx / 70, -1, 1); }
        g.running = Math.abs(fwd) > 0.92;
        g.pa += turn * 2.2 * dt;
        const sp = (g.running ? 2.35 : 1.45) * fwd * dt;
        if (sp) { move(Math.cos(g.pa) * sp, Math.sin(g.pa) * sp, 0.22); g.bob += dt * (g.running ? 13 : 9) * Math.abs(fwd); }
        g.noise = g.hidden ? 0 : g.running ? 6 : Math.abs(fwd) > 0.25 ? 2.4 : 0;
        if (Math.abs(fwd) > 0.2) { g.lastStep += dt * Math.abs(fwd) * (g.running ? 1.6 : 1); if (g.lastStep > 0.42) { g.lastStep = 0; if (A) A.step(0.5, g.running); } }
        g.stamina = clamp(g.stamina + (g.running ? -dt / 5 : dt / 9), 0, 1);
        if (g.stamina <= 0 && g.running) { g.running = false; }
        // fener
        if (g.lightOn && !g.hidden) g.battery = Math.max(0, g.battery - dt / 120);
        else g.battery = Math.min(1, g.battery + dt / 400);
        if (g.battery <= 0) g.lightOn = false;
        g.flick = g.lightOn && g.battery < 0.3 ? (Math.sin(g.clock * 2.6) * Math.sin(g.clock * 0.9) > 0.6 ? 0.45 : 1) : 1;
        // sayfalar
        for (const p of g.pages) if (!p.got && !g.hidden && Math.hypot(p.x - g.px, p.y - g.py) < 0.55) {
          p.got = true; g.got++; g.score += 150; g.menace = Math.min(1, g.menace + 0.15);
          if (A) A.page(); buzz(40); g.glitch = 0.6;
          g.msg = g.got >= PAGES ? "Tüm sayfalar. ÇIKIŞ KAPISINI BUL." : g.got + " / " + PAGES; g.msgT = 2.5;
          if (g.ai === "dormant") { g.ai = "roam"; spawnFar(7); }
          if (g.got === 3) { g.lightsOutT = 7; g.lightOn = false; if (A) { A.silence(2.5); setTimeout(() => { if (g.A && !g.over) { const ra = -Math.PI / 2; g.A.distant(Math.sin(ra) * 0.8, -Math.cos(ra) * 0.8, 2); } }, 1800); } g.msg = "…"; }
          if (g.got >= PAGES && g.ai !== "chase") { g.ai = "search"; g.target = [Math.floor(g.px), Math.floor(g.py)]; }
        }
        // çıkış
        if (g.got >= PAGES && exitDoor && !g.hidden && Math.hypot(exitDoor[0] + 0.5 - g.px, exitDoor[1] + 0.5 - g.py) < 1.05) { g.score += 500 + Math.round(g.battery * 100); endGame("escape"); return; }
        // ---------- varlık yapay zekâsı: gör, duy, ara, kovala, geri çekil ----------
        const d = Math.hypot(g.sx - g.px, g.sy - g.py), ra = relAngle(g.sx, g.sy);
        const present = g.ai !== "dormant" && g.ai !== "retreat";
        g.sVisible = present && Math.abs(ra) < FOV / 2 + 0.1 && d < VIEW && canSee(g.sx, g.sy);
        // varlık seni görüyor mu? (önündeki 75° koni, fener açıksa daha uzak)
        let sees = false;
        if (present && !g.hidden) {
          let ang = Math.atan2(g.py - g.sy, g.px - g.sx) - g.sDir; while (ang > Math.PI) ang -= 2 * Math.PI; while (ang < -Math.PI) ang += 2 * Math.PI;
          const range = g.lightOn ? 8.5 : 4.2;
          sees = Math.abs(ang) < 0.65 && d < range && canSee(g.sx, g.sy);
        }
        if (sees) { g.detect = Math.min(1.2, g.detect + dt * (g.lightOn ? 1.5 : 0.8) * (1.3 - d / 10)); g.lastSeen = [g.px, g.py]; g.lastSeenT = g.clock; }
        else g.detect = Math.max(0, g.detect - dt * 0.3);
        if (present && g.ai !== "chase" && g.detect >= 1) {
          g.ai = "chase"; g.chaseT = 0;
          if (A) { A.silence(1.2); setTimeout(() => { if (g.A && !g.over) { g.A.sting(); g.A.chase(true); } }, 90); }
          g.glitch = 1; buzz([60, 40, 60]);
        }
        // duyma: gürültü yarıçapı içindeysen o tarafa gelir (biraz yanılarak)
        if (present && g.ai !== "chase" && g.noise > 0 && d < g.noise) {
          g.ai = "search"; g.target = [clamp(Math.floor(g.px + (map.rand() - 0.5) * 2), 1, MW - 2), clamp(Math.floor(g.py + (map.rand() - 0.5) * 2), 1, MH - 2)]; g.searchT = 4;
        }
        // baskı ölçeri: uzun süre yakınsa geri çekilir (rahatlama evresi)
        if (present) g.menace = clamp(g.menace + dt * (d < 5 ? 1 / 24 : -1 / 45) + (g.ai === "chase" ? dt / 30 : 0), 0, 1.2);
        if (g.ai === "chase") {
          g.chaseT += dt;
          if (!sees && g.clock - g.lastSeenT > 4) { g.ai = "search"; g.target = [Math.floor(g.lastSeen[0]), Math.floor(g.lastSeen[1])]; g.searchT = 5; if (A) A.chase(false); }
        }
        if (present && g.menace >= 1 && !(g.ai === "chase" && sees)) {
          g.ai = "retreat"; g.retreatT = 22 + map.rand() * 14; g.menace = 0.35; g.detect = 0;
          if (A) { A.chase(false); const r2 = relAngle(g.sx, g.sy); A.distant(Math.sin(r2) * d, -Math.cos(r2) * d, 1); }
          g.sx = -10; g.sy = -10;
        }
        if (g.ai === "retreat") { g.retreatT -= dt; if (g.retreatT <= 0) { g.ai = "roam"; spawnFar(6); } }
        if (g.ai === "dormant") {
          // ilk sayfadan önce yalnızca uzakta bir an görünüp kaybolur
          g.glimpseT -= dt;
          if (g.glimpseT <= 0) {
            g.glimpseT = 14 + map.rand() * 10;
            const cx = g.px + Math.cos(g.pa) * 6, cy = g.py + Math.sin(g.pa) * 6;
            if (!solid(cx, cy) && canSee(cx, cy)) { g.glimpse = { x: cx, y: cy, t: 1.3 }; }
          }
          if (g.glimpse) { g.glimpse.t -= dt; if (g.glimpse.t <= 0 || Math.abs(relAngle(g.glimpse.x, g.glimpse.y)) > FOV / 2) g.glimpse = null; }
        }
        if (present) {
          // hedef seçimi
          if (g.ai === "roam") {
            if (!g.target || (Math.floor(g.sx) === g.target[0] && Math.floor(g.sy) === g.target[1])) {
              // yönetmen: oyuncunun genel bölgesine gönder, tam yerine değil
              for (let i = 0; i < 30; i++) { const tx = Math.floor(g.px + (map.rand() - 0.5) * 9), ty = Math.floor(g.py + (map.rand() - 0.5) * 9); if (tx > 0 && ty > 0 && tx < MW - 1 && ty < MH - 1 && !m[ty][tx]) { g.target = [tx, ty]; break; } }
            }
          } else if (g.ai === "search") {
            if (g.target && Math.floor(g.sx) === g.target[0] && Math.floor(g.sy) === g.target[1]) { g.searchT -= dt; g.sDir += dt * 2.2; if (g.searchT <= 0) { g.ai = "roam"; g.target = null; } }
          } else if (g.ai === "chase") g.target = g.hidden && g.hideSpotted ? [Math.floor(g.px), Math.floor(g.py)] : [Math.floor(g.px), Math.floor(g.py)];
          if (g.hidden && !g.hideSpotted && g.ai === "chase") { g.ai = "search"; g.target = [Math.floor(g.px + Math.cos(g.pa) * 2), Math.floor(g.py + Math.sin(g.pa) * 2)]; if (solid(g.target[0] + 0.5, g.target[1] + 0.5)) g.target = [Math.floor(g.px), Math.floor(g.py)]; g.searchT = 5; if (A) A.chase(false); }
          const speed = g.ai === "chase" ? 1.9 + g.got * 0.12 : g.ai === "search" ? 1.05 : 0.7 + g.got * 0.05;
          g.sTimer -= dt;
          if ((g.sTimer <= 0 || !g.sPath) && g.target) {
            g.sTimer = 0.4;
            const dd = bfs(m, g.target[0], g.target[1]);
            const cx = Math.floor(g.sx), cy = Math.floor(g.sy); let best = null, bv = dd[cy] ? dd[cy][cx] : 1e9;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (m[ny] && !m[ny][nx] && dd[ny][nx] < bv) { bv = dd[ny][nx]; best = [nx + 0.5, ny + 0.5]; } }
            g.sPath = best || [g.target[0] + 0.5, g.target[1] + 0.5];
          }
          if (g.sPath) {
            const vx = g.sPath[0] - g.sx, vy = g.sPath[1] - g.sy, vl = Math.hypot(vx, vy);
            if (vl > 0.02) { g.sx += (vx / vl) * Math.min(vl, speed * dt); g.sy += (vy / vl) * Math.min(vl, speed * dt); g.sDir = Math.atan2(vy, vx); }
          }
          // tekinsiz hareket: görüntü konumu kare atlayarak güncellenir
          g.stutT -= dt;
          if (g.stutT <= 0) { g.stutT = g.ai === "chase" ? 0.05 + map.rand() * 0.08 : 0.12 + map.rand() * 0.22; g.rx = g.sx + (map.rand() - 0.5) * 0.08; g.ry = g.sy + (map.rand() - 0.5) * 0.08; }
          // ayak sesleri her zaman gerçek konumundan; duvar arkasındaysa kısık
          g.sStepT -= dt;
          if (g.sStepT <= 0 && A) { g.sStepT = 0.85 / (speed / 0.7); if (d < 11) A.thingStep(Math.sin(ra) * d, -Math.cos(ra) * d, canSee(g.sx, g.sy) ? 1 : 0.45); }
          if (!g.hidden && d < 0.5) { endGame("caught"); return; }
          if (g.hidden && g.hideSpotted && d < 0.8) { g.hidden = false; endGame("caught"); return; }
        }
        // bakmak: parazit (radyo cızırtısı gibi) yakınlıkla artar
        if (g.sVisible && d < 7) g.sStare += dt * (g.lightOn ? 1 : 0.5); else g.sStare = Math.max(0, g.sStare - dt * 0.8);
        if (A) A.staticG.gain.setTargetAtTime(present ? (g.sVisible ? clamp(0.5 - d / 16, 0.05, 0.42) : clamp(0.16 - d / 50, 0, 0.12)) : 0, A.c.currentTime, 0.1);
        // halüsinasyon: kovalamaca yokken nadiren ekran kenarında bir siluet + o taraftan fısıltı
        g.halluT -= dt;
        if (g.halluT <= 0) { g.halluT = 28 + map.rand() * 25; if (g.ai !== "chase" && g.got > 0) { g.hallu = 0.35; g.halluSide = map.rand() < 0.5 ? -1 : 1; if (A) A.distant(g.halluSide * 0.7, -0.3, 2); } }
        // kalp atışı ve nefes: tehlikeye göre
        const k = present ? clamp(1 - d / 9, 0, 1) * (g.ai === "chase" ? 1 : 0.7) : 0;
        g.heartT -= dt;
        if (g.heartT <= 0) { g.heartT = 60 / (62 + 95 * k); if (A && (k > 0.15 || g.hidden)) A.heart(Math.max(k, g.hidden ? 0.5 : 0)); }
        g.breathT -= dt;
        if (g.breathT <= 0) { g.breathT = 3.4 - k * 1.6; if (A && !g.hidden && (k > 0.3 || g.running)) A.breath(Math.max(k, g.running ? 0.6 : 0)); }
        g.eventT -= dt;
        if (g.eventT <= 0) { g.eventT = 7 + map.rand() * 9; if (A) { const a = map.rand() * Math.PI * 2, r = 4 + map.rand() * 5; A.distant(Math.cos(a) * r, Math.sin(a) * r, Math.floor(map.rand() * 4)); } }
      },
      pointer(type, x, y, id) {
        const R = g.R; if (!R || g.over) return;
        if (type === "down") {
          const fb = flashBtn(R), hb = hideBtn(R);
          if (x >= fb.x && x <= fb.x + fb.w && y >= fb.y && y <= fb.y + fb.h) { if (g.battery > 0 && !g.hidden && g.lightsOutT <= 0) { g.lightOn = !g.lightOn; const A = audio(); if (A) A.click(); } return; }
          const lk = nearLocker();
          if ((lk || g.hidden) && x >= hb.x && x <= hb.x + hb.w && y >= hb.y && y <= hb.y + hb.h) {
            const A = audio();
            if (!g.hidden) { g.hidden = true; g.hideSpotted = g.detect > 0.75 || (g.ai === "chase" && g.clock - g.lastSeenT < 1.2); g.savedLight = g.lightOn; g.lightOn = false; g.px = lk.x; g.py = lk.y; if (A) A.distant(0, -0.4, 0); }
            else { g.hidden = false; g.lightOn = g.savedLight && g.battery > 0; if (A) A.distant(0, -0.4, 0); }
            return;
          }
          if (g.hidden) return;
          if (x < R.x + R.w * 0.55) g.joy = { id, x0: x, y0: y, dx: 0, dy: 0 };
          else g.look = { id, x };
        } else if (type === "move") {
          if (g.joy && g.joy.id === id) { g.joy.dx = clamp(x - g.joy.x0, -80, 80); g.joy.dy = clamp(y - g.joy.y0, -80, 80); }
          if (g.look && g.look.id === id) { g.pa += (x - g.look.x) * 0.006; g.look.x = x; }
        } else { if (g.joy && g.joy.id === id) g.joy = null; if (g.look && g.look.id === id) g.look = null; }
      },
      net() { return { x: Math.round(g.px * 10), y: Math.round(g.py * 10), sx: Math.round(Math.max(0, g.sx) * 10), sy: Math.round(Math.max(0, g.sy) * 10), p: g.got, c: g.caught ? 1 : 0, e: g.escaped ? 1 : 0, s: seed }; },
      draw(ctx, R, active) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        // düşük çözünürlüklü sahne (performans + bulanık, kirli görüntü)
        upgradeTextures(T);
        const FP = T.floorPx;
        const RW = 220, RH = Math.max(120, Math.round((RW * R.h) / R.w));
        if (!g.buf || g.buf.width !== RW || g.buf.height !== RH) { g.buf = document.createElement("canvas"); g.buf.width = RW; g.buf.height = RH; g.bctx = g.buf.getContext("2d"); g.zb = new Float32Array(RW); }
        const b = g.bctx, zb = g.zb;
        const bob = Math.sin(g.bob) * RH * 0.012, horizon = RH / 2 + bob;
        const light = g.lightOn ? g.flick * clamp(0.35 + g.battery, 0.35, 1) : 0;
        // zemin ve tavan: perspektifli döküm (beton karolar / lekeli tavan panelleri) + fener ışığı
        if (!g.img || g.img.width !== RW || g.img.height !== RH) g.img = b.createImageData(RW, RH);
        const lamps = map.lamps;
        const px = g.img.data, cosA = Math.cos(g.pa), sinA = Math.sin(g.pa), half = Math.tan(FOV / 2);
        const lx0 = cosA - (-sinA) * half, ly0 = sinA - cosA * half, lx1 = cosA + (-sinA) * half, ly1 = sinA + cosA * half;
        for (let y = 0; y < RH; y++) {
          const fy = y - horizon, floor = fy > 0, p2 = Math.abs(fy);
          if (p2 < 1) { for (let x = 0; x < RW; x++) { const o = (y * RW + x) * 4; px[o] = px[o + 1] = px[o + 2] = 4; px[o + 3] = 255; } continue; }
          const rowD = (RH * 0.5) / p2;
          const stX = (rowD * (lx1 - lx0)) / RW, stY = (rowD * (ly1 - ly0)) / RW;
          let wx = g.px + rowD * lx0, wy = g.py + rowD * ly0;
          for (let x = 0; x < RW; x++, wx += stX, wy += stY) {
            const ca = (x / RW - 0.5) * FOV, cone = Math.max(0, 1 - Math.abs(ca) / (FOV * 0.42));
            const fx = wx - Math.floor(wx), fz = wy - Math.floor(wy);
            let base, cr = 1.05, cgr = 1, cb = 0.86;
            if (FP) {
              const ti = (((fz * 127) | 0) * 128 + ((fx * 127) | 0)) * 4, seam = fx < 0.03 || fz < 0.03 ? 0.6 : 1;
              const f2 = (floor ? 1.05 : 0.6) * seam;
              base = 1; cr = FP[ti] * f2; cgr = FP[ti + 1] * f2; cb = FP[ti + 2] * f2;
            } else if (floor) {
              const grout = fx < 0.04 || fz < 0.04 ? 0.55 : 1;
              const n = hash(Math.floor(wx * 8), Math.floor(wy * 8)) * 0.25 + 0.75;
              const stain = hash(Math.floor(wx * 2), Math.floor(wy * 2) + 99) > 0.8 ? 0.7 : 1;
              base = 118 * grout * n * stain;
            } else {
              const seam = fx < 0.03 || fz < 0.03 ? 0.6 : 1;
              base = 80 * seam * (hash(Math.floor(wx * 4), Math.floor(wy * 4) + 7) * 0.2 + 0.8);
            }
            const spot = floor ? Math.max(0, 1 - Math.hypot(ca / (FOV * 0.32), (rowD - 2.2) / 2.6)) : 0;
            let lum = 0.03 + light * (cone * clamp(1.9 / (rowD * rowD * 0.3 + 0.7), 0, 1) * (floor ? 1 : 0.55) + spot * 0.5);
            for (let li = 0; li < lamps.length; li++) { const l = lamps[li]; if (l.level < 0.02) continue; const ddx = l.x - wx, ddy = l.y - wy, ld2 = ddx * ddx + ddy * ddy; if (ld2 < 5.8) lum += (1 - Math.sqrt(ld2) / 2.4) * 0.55 * l.level * (floor ? 1 : 0.7); }
            if (floor && hash(Math.floor(wx) * 7 + 1, Math.floor(wy) * 11 + 333) > 0.86) { const bx = fx - 0.45, bz = fz - 0.55; if (bx * bx + bz * bz * 1.6 < 0.07) { cr *= 0.6; cgr *= 0.1; cb *= 0.1; } }
            const v = base * lum, o = (y * RW + x) * 4;
            px[o] = v * cr; px[o + 1] = v * cgr; px[o + 2] = v * cb; px[o + 3] = 255;
          }
        }
        b.putImageData(g.img, 0, 0);
        // duvarlar
        for (let i = 0; i < RW; i++) {
          const ca = (i / RW - 0.5) * FOV, a = g.pa + ca, r = rayCast(a);
          const dist = r.dist * Math.cos(ca); zb[i] = dist;
          const h = Math.min(RH * 3, RH / dist);
          const tex = r.door ? T.door : r.deco > 0.8 && T.decals ? T.decals[Math.floor((r.deco - 0.8) * 5 * T.decals.length) % T.decals.length] : r.rust && T.rust ? T.rust : T.wall, tx = Math.floor(r.wx * tex.width);
          b.drawImage(tex, tx, 0, 1, tex.height, i, horizon - h / 2, 1, h);
          const cone = Math.max(0, 1 - Math.abs(ca) / (FOV * 0.42));
          let lum = 0.03 + light * cone * clamp(2.1 / (dist * dist * 0.3 + 0.6), 0, 1.15) + light * 0.08 / (dist + 0.5);
          { const hx = g.px + Math.cos(a) * r.dist, hy = g.py + Math.sin(a) * r.dist; for (const l of map.lamps) if (l.level > 0.02) { const ld = Math.hypot(l.x - hx, l.y - hy); if (ld < 2.4) lum += (1 - ld / 2.4) * 0.6 * l.level; } }
          if (r.side) lum *= 0.78;
          if (r.door && g.got >= PAGES) lum = Math.max(lum, 0.18 + 0.08 * Math.sin(g.clock * 2));
          b.fillStyle = "rgba(0,0,0," + clamp(1 - lum, 0, 0.985) + ")"; b.fillRect(i, horizon - h / 2, 1, h);
        }
        // nesneler (sayfalar, varlık)
        const sprites = [];
        for (const p of g.pages) if (!p.got) sprites.push({ x: p.x, y: p.y, tex: T.page, scale: 0.32, lift: -0.18, glow: true });
        if (g.ai !== "dormant" && g.ai !== "retreat") sprites.push({ x: g.rx, y: g.ry, tex: T.thing, scale: 1.42, lift: 0, thing: true });
        if (g.glimpse) sprites.push({ x: g.glimpse.x, y: g.glimpse.y, tex: T.thing, scale: 1.42, lift: 0, thing: true });
        for (const l of map.lockers) sprites.push({ x: l.x, y: l.y, tex: T.locker, scale: 0.92, lift: 0 });
        for (const bd of map.bodies) sprites.push({ x: bd.x, y: bd.y, tex: T.body, scale: 0.32, lift: 0 });
        for (const l of map.lamps) sprites.push({ x: l.x, y: l.y, tex: T.lamp, scale: 0.5, lift: -0.5, lamp: l });
        for (const s of sprites) s.d = Math.hypot(s.x - g.px, s.y - g.py);
        sprites.sort((a, c) => c.d - a.d);
        for (const s of sprites) {
          const ra = relAngle(s.x, s.y); if (Math.abs(ra) > FOV) continue;
          const dist = s.d * Math.cos(ra); if (dist < 0.2) continue;
          const sh = (RH / dist) * s.scale, sw = sh * (s.tex.width / s.tex.height);
          const cx = (0.5 + ra / FOV) * RW, top = horizon - sh / 2 + (RH / dist) * (0.5 - s.scale / 2) + (RH / dist) * s.lift;
          const cone = Math.max(0, 1 - Math.abs(ra) / (FOV * 0.42));
          let lum = 0.03 + light * cone * clamp(1.6 / (dist * dist * 0.35 + 0.6), 0, 1);
          if (s.glow) lum = Math.max(lum, 0.12);
          if (s.lamp) lum = Math.max(lum, 0.15 + s.lamp.level * 0.85);
          else for (const l of map.lamps) if (l.level > 0.02) { const ld = Math.hypot(l.x - s.x, l.y - s.y); if (ld < 2.4) lum += (1 - ld / 2.4) * 0.5 * l.level; }
          if (s.thing) lum = Math.min(lum, 0.6);
          for (let k = Math.max(0, Math.floor(cx - sw / 2)); k < Math.min(RW, Math.ceil(cx + sw / 2)); k++) {
            if (zb[k] < dist) continue;
            const u = (k - (cx - sw / 2)) / sw; const tx = Math.floor(u * s.tex.width);
            b.drawImage(s.tex, tx, 0, 1, s.tex.height, k, top, 1, sh);
            b.fillStyle = "rgba(0,0,0," + clamp(1 - lum, 0, 0.97) + ")"; b.fillRect(k, top, 1, sh);
          }
        }
        // yukarı ölçekle
        ctx.imageSmoothingEnabled = true;
        const shake = g.glitch * 6 + (g.sStare > 0.5 ? g.sStare * 1.5 : 0);
        ctx.drawImage(g.buf, R.x + (Math.random() - 0.5) * shake, R.y + (Math.random() - 0.5) * shake, R.w, R.h);
        // bozulma: yatay kayma dilimleri (yanıp sönme değil)
        if (g.glitch > 0.05 || g.sStare > 1) {
          const n = 3 + Math.floor((g.glitch + g.sStare * 0.3) * 6);
          for (let i = 0; i < n; i++) { const sy = Math.random() * R.h, sh2 = 4 + Math.random() * 18, off = (Math.random() - 0.5) * 30 * (g.glitch + 0.3); ctx.globalAlpha = 0.6; ctx.drawImage(g.buf, 0, (sy / R.h) * RH, RW, (sh2 / R.h) * RH, R.x + off, R.y + sy, R.w, sh2); ctx.globalAlpha = 1; }
          ctx.fillStyle = "rgba(120,0,0," + Math.min(0.18, g.glitch * 0.25 + g.sStare * 0.03) + ")"; ctx.fillRect(R.x, R.y, R.w, R.h);
        }
        // fener konisi + kenar kararması
        const vg = ctx.createRadialGradient(R.x + R.w / 2, R.y + R.h * 0.55, Math.min(R.w, R.h) * 0.18, R.x + R.w / 2, R.y + R.h * 0.55, Math.max(R.w, R.h) * 0.72);
        vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(0.55, "rgba(0,0,0," + (light ? 0.35 : 0.7) + ")"); vg.addColorStop(1, "rgba(0,0,0," + (light ? 0.9 : 0.97) + ")");
        ctx.fillStyle = vg; ctx.fillRect(R.x, R.y, R.w, R.h);
        // fener ışığında uçuşan toz
        if (light > 0) { ctx.fillStyle = "rgba(255,240,210," + 0.35 * light + ")"; for (const p of g.dust) { p.y += p.v * 0.016; p.x += Math.sin(g.clock + p.v * 100) * 0.0006; if (p.y > 1) { p.y = 0; p.x = Math.random(); } const dx = (p.x - 0.5) * R.w, dy = (p.y - 0.55) * R.h; if (dx * dx + dy * dy < (R.w * 0.32) ** 2) ctx.fillRect(R.x + p.x * R.w, R.y + p.y * R.h, p.s, p.s); } }
        // halüsinasyon: ekran kenarında bir anlık siluet
        if (g.hallu > 0) { const hx = g.halluSide > 0 ? R.x + R.w - R.w * 0.12 : R.x + R.w * 0.02, hh = R.h * 0.7; ctx.globalAlpha = Math.min(0.75, g.hallu * 3); ctx.drawImage(T.thing, hx, R.y + R.h * 0.15, hh * (T.thing.width / T.thing.height), hh); ctx.globalAlpha = 1; }
        // saklanma: dolap kapağının aralıkları
        if (g.hidden) { ctx.fillStyle = "rgba(6,7,8,0.97)"; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.globalCompositeOperation = "destination-over"; ctx.globalCompositeOperation = "source-over"; for (let i = 0; i < 6; i++) { const y = R.y + R.h * (0.3 + i * 0.045); ctx.drawImage(g.buf, 0, (y - R.y) / R.h * RH, RW, 3 / R.h * RH, R.x + R.w * 0.2, y, R.w * 0.6, 5); } }
        // film greni
        const gr = T.grain[(g.clock * 24 | 0) % 4];
        ctx.globalAlpha = 0.09 + g.sStare * 0.03; ctx.globalCompositeOperation = "overlay";
        for (let y = R.y; y < R.y + R.h; y += 128) for (let x = R.x; x < R.x + R.w; x += 128) ctx.drawImage(gr, x, y);
        ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
        // kamera kaydı görünümü: tarama çizgileri, REC, saat
        ctx.fillStyle = "rgba(0,0,0,0.12)"; for (let y = R.y; y < R.y + R.h; y += 3) ctx.fillRect(R.x, y, R.w, 1);
        if (Math.floor(g.clock) % 2 === 0) { ctx.fillStyle = "#d12a2a"; ctx.beginPath(); ctx.arc(R.x + 22, R.y + 24, 6, 0, Math.PI * 2); ctx.fill(); }
        txt(ctx, "REC", R.x + 34, R.y + 25, 15, "rgba(240,235,225,0.85)", { align: "left", w: "700", ls: "2px" });
        { const s2 = Math.floor(g.clock), hh = 3 + Math.floor(s2 / 3600), mm = Math.floor(s2 / 60) % 60, ss = s2 % 60; txt(ctx, "0" + hh + ":" + String(14 + mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0") + "  AM", R.x + R.w - 14, R.y + 25, 14, "rgba(240,235,225,0.7)", { align: "right", w: "700", ls: "1px" }); }
        // mesaj
        if (g.msgT > 0) txt(ctx, g.msg, R.x + R.w / 2, R.y + R.h * 0.2, 20, "rgba(230,220,200," + Math.min(1, g.msgT) * 0.9 + ")", { w: "700", ls: "2px" });
        // kontroller
        if (!g.over) {
          if (g.joy) { ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g.joy.x0, g.joy.y0, 60, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.arc(g.joy.x0 + g.joy.dx * 0.75, g.joy.y0 + g.joy.dy * 0.75, 24, 0, Math.PI * 2); ctx.fill(); }
          else if (active && g.clock < 12) { txt(ctx, "◀ sol: yürü / dön", R.x + R.w * 0.27, R.y + R.h - 30, 14, "rgba(255,255,255,0.35)", { w: "700" }); txt(ctx, "sağ: etrafa bak ▶", R.x + R.w * 0.75, R.y + R.h - 30, 14, "rgba(255,255,255,0.35)", { w: "700" }); }
          const lk = nearLocker(), hb = hideBtn(R);
          if (lk || g.hidden) { ctx.fillStyle = g.hidden ? "rgba(180,40,40,0.35)" : "rgba(255,255,255,0.14)"; rr(ctx, hb.x, hb.y, hb.w, hb.h, 12); ctx.fill(); txt(ctx, g.hidden ? "DOLAPTAN ÇIK" : "SAKLAN", hb.x + hb.w / 2, hb.y + hb.h / 2 + 1, 14, "#f0e6d8", { ls: "1px" }); }
          if (g.running) txt(ctx, "KOŞUYORSUN · GÜRÜLTÜ", R.x + R.w * 0.27, R.y + R.h - 92, 13, "rgba(255,160,140,0.7)", { w: "800", ls: "1px" });
          const fb = flashBtn(R);
          ctx.fillStyle = g.lightOn ? "rgba(255,230,170,0.22)" : "rgba(255,255,255,0.08)"; rr(ctx, fb.x, fb.y, fb.w, fb.h, 12); ctx.fill();
          txt(ctx, g.lightOn ? "FENER AÇIK" : "FENER KAPALI", fb.x + fb.w / 2, fb.y + fb.h / 2 + 1, 14, g.lightOn ? "#ffe6aa" : "rgba(255,255,255,0.6)", { ls: "1px" });
        }
        // son: yakalanma / kaçış
        if (g.over) {
          if (g.caught && g.scare > 0) {
            const k = 1 - g.scare, sc = 0.55 + Math.min(1, k * 3) * 0.9 + k * 0.25, cx = R.x + R.w / 2, cy = R.y + R.h * 0.46;
            ctx.fillStyle = "#000"; ctx.fillRect(R.x, R.y, R.w, R.h);
            const fw = Math.min(R.w * 0.9, R.h * 0.6) * sc, fh = fw * (T.face.height / T.face.width);
            const jx = (Math.random() - 0.5) * 14, jy = (Math.random() - 0.5) * 14;
            ctx.globalAlpha = 0.55; ctx.globalCompositeOperation = "lighter";
            ctx.drawImage(T.face, cx - fw / 2 + jx - 8, cy - fh / 2 + jy, fw, fh);
            ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
            ctx.drawImage(T.face, cx - fw / 2 + jx, cy - fh / 2 + jy, fw, fh);
            ctx.fillStyle = "rgba(120,0,0,0.25)"; ctx.fillRect(R.x, R.y, R.w, R.h);
            for (let i = 0; i < 6; i++) { const sy = R.y + Math.random() * R.h, sh2 = 6 + Math.random() * 22; const off = (Math.random() - 0.5) * 40; ctx.drawImage(T.face, 0, ((sy - (cy - fh / 2 + jy)) / fh) * T.face.height, T.face.width, (sh2 / fh) * T.face.height, cx - fw / 2 + jx + off, sy, fw, sh2); }
            const gr2 = T.grain[(g.clock * 30 | 0) % 4]; ctx.globalAlpha = 0.25; for (let y = R.y; y < R.y + R.h; y += 128) for (let x = R.x; x < R.x + R.w; x += 128) ctx.drawImage(gr2, x, y); ctx.globalAlpha = 1;
          } else {
            ctx.fillStyle = "rgba(0,0,0," + Math.min(0.85, g.endT) + ")"; ctx.fillRect(R.x, R.y, R.w, R.h);
            txt(ctx, g.escaped ? "KAÇTIN…" : "YAKALANDIN", R.x + R.w / 2, R.y + R.h * 0.4, 34, g.escaped ? "#d8e6c8" : "#c43a3a", { f: K.DISP, w: "400", a: Math.min(1, g.endT) });
          }
        }
        ctx.restore();
      },
    };
    const flashBtn = R => ({ x: R.x + R.w - 132, y: R.y + R.h - 64, w: 120, h: 48 });
    const hideBtn = R => ({ x: R.x + R.w - 132, y: R.y + R.h - 122, w: 120, h: 48 });
    Object.defineProperty(inst, "_g", { value: g }); // test için
    return inst;
  }

  // rakip görünümü: küçük harita
  const mazeCache = {};
  function drawRemote(ctx, R, d) {
    ctx.fillStyle = "#07070a"; ctx.fillRect(R.x, R.y, R.w, R.h);
    if (!d || d.s == null) return;
    const mz = mazeCache[d.s] || (mazeCache[d.s] = makeMaze(d.s));
    const cs = Math.floor(Math.min((R.w - 20) / MW, (R.h - 30) / MH)), ox = R.x + (R.w - cs * MW) / 2, oy = R.y + 28 + (R.h - 30 - cs * MH) / 2;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (mz.m[y][x]) { ctx.fillStyle = "#1c1b18"; ctx.fillRect(ox + x * cs, oy + y * cs, cs, cs); }
    ctx.fillStyle = "#e9e2cf"; ctx.beginPath(); ctx.arc(ox + (d.x / 10) * cs, oy + (d.y / 10) * cs, Math.max(2, cs * 0.35), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c43a3a"; ctx.beginPath(); ctx.arc(ox + (d.sx / 10) * cs, oy + (d.sy / 10) * cs, Math.max(2, cs * 0.35), 0, Math.PI * 2); ctx.fill();
    txt(ctx, "SAYFA " + (d.p | 0) + "/" + PAGES + (d.c ? " · YAKALANDI" : d.e ? " · KAÇTI" : ""), R.x + R.w - 12, R.y + R.h - 12, 13, d.c ? "#ff6b6b" : "#d8d2c0", { align: "right", ls: "1px" });
  }

  K.register({
    id: "korku", name: "Karanlık Koridor", color: "#c43a3a", desc: "18+ · Karanlıkta 5 sayfayı topla, çıkışı bul. Seni duyabiliyor.",
    rules: "⚠ 18+ · yoğun korku, kan ve rahatsız edici görüntüler · kulaklık önerilir",
    timeLimit: () => 150, mix: false, noMusic: true,
    create, drawRemote,
  });
})();
