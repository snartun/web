# Düello Arenası — devam notu (oturum devri)

Oyun: `kule-yarisi/` (tek sayfa canvas). Dal: `claude/cool-archimedes-cqk1mn`; yayın: aynı içerik `gh-pages` dalına push edilir.
Yayından önce `sw.js` içindeki önbellek adını bir artır (şu an `duello-arenasi-v9`).

## Yapı
- `core.js`: K yardımcıları, ses motoru (Web Audio + `ses/*.mp3`), müzik. `K.musicQuiet(true)` menü müziğini susturur.
- `app.js`: menü, tek kişi / online akışı, XP. Oyun tanımında `noMusic: true` olursa müzik susar.
- `games/*.js`: her oyun `K.register({id, name, rules, timeLimit, create, drawRemote})`.
  Örnek API: `score, over, info(), update(dt, active), draw(ctx, R, active), pointer(type, x, y, id), net(), dispose()`.
- Test: `python3 -m http.server 8765` (kule-yarisi içinde) + Playwright; `window.__arena.startSingle('korku')`, `window.__arena.M.inst._g` oyun durumu.

## Yapıldı
- Korku: menü müziği susturuldu; tek joystick (ekrana bas, yöne sürükle; aşağı = arkanı dön; sonuna kadar = koş; koridor hizalama, köşede otomatik kıvrılma); 2 ipucu hakkı (yol boyunca ok + adım sayısı); gerçekçi yaratık `doku/yaratik.webp` (ElevenLabs FLUX.2 Pro + arka plan silme) koridorda; 2. ve 4. sayfadan sonra ve yakalanınca ekrana fırlama (`lunge()`).

## Kullanıcının istekleri — KALAN
1. **Görseller**: Kullanıcı Nano Banana Pro ile her görselin 4 varyasyonunu üretti (masaüstünde `indir.zip`). Her türden en iyisini seç, küçült (webp/jpg), `doku/` içine koy ve korku oyununda kullan:
   1 yakalanma yüzü (yakalanınca `lunge` yerine/ile), 2 kapı aralığından bakan (oyun içi ani korku), 3 tavanda sürünen, 4 omuz arkası,
   5 yürüyen yaratık yandan, 6 dört ayakla koşan (kovalamada sprite; arka plan silinmeli), 7 duvar dokusu, 8 zemin dokusu (döşenebilir; `upgradeTextures` içindeki beton/zemin yerine), 9 çıkış kapısı, 10 kan yazılı duvar, 11 sayfa.
   Beğenilmeyen/eksik olanlar ElevenLabs ile üretilebilir (kalan ~3.500 kredi; flux-2-pro ≈ 273, arka plan silme ≈ 30).
2. **Misket hatası**: "kafasına göre alandan atıyor" — misketler sebepsiz çember dışı sayılıyor/atılıyor. `games/misket.js` `physics()` incelenip Playwright ile yeniden üretilmeli, sonra düzeltilmeli.
3. **Tüm oyunların grafikleri kötü**: kule, blok, kelime, renk, misket, refleks, penaltı, basket — daha gerçekçi/profesyonel görünüm, efekt ve "juice" (kaynak: `gamedev-skills/awesome-gamedev-agent-skills` → disciplines/game-feel, audio-design).
4. Korku daha gerçekçi ve gerici olmalı (+18): ses, efekt, sahneler; çocukça olmamalı.

Commit sonu: `Co-Authored-By` satırı ekle; model adını commit'e yazma.
