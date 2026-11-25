# Düello Arenası — devam notu (oturum devri)

Oyun: `kule-yarisi/` (tek sayfa canvas). Dal: `claude/cool-archimedes-cqk1mn`; yayın: aynı içerik `gh-pages` dalına push edilir.
Yayından önce `sw.js` içindeki önbellek adını bir artır (şu an `duello-arenasi-v14`).

## Yapı
- `core.js`: K yardımcıları, ses motoru (Web Audio + `ses/*.mp3`), müzik. `K.musicQuiet(true)` menü müziğini susturur.
- `app.js`: menü, tek kişi / online akışı, XP. Oyun tanımında `noMusic: true` olursa müzik susar.
- `games/*.js`: her oyun `K.register({id, name, rules, timeLimit, create, drawRemote})`.
  Örnek API: `score, over, info(), update(dt, active), draw(ctx, R, active), pointer(type, x, y, id), net(), dispose()`.
- Test: `python3 -m http.server 8765` (kule-yarisi içinde) + Playwright; `window.__arena.startSingle('korku')`, `window.__arena.M.inst._g` oyun durumu.

## Ortak efekt katmanı (core.js)
- `K.kick(0..1)` ekran sarsıntısı, `K.flash(a, renk)`, `K.hitstop(sn ≤0.12)`; app.js oyun çizimini `K.fxBegin/K.fxEnd` ile sarar.
- Parçacıklar: `K.parts.burst / spark / confetti / dust / ring`; `K.pops` belirirken büyüyüp oturur.

## Testler sessiz olmalı
Kullanıcı isteği: tüm oyun testleri sessiz. Tarayıcıda `K.setSfx(false); K.setMusic(false)`; başsız tarayıcılar `--mute-audio` ile.

## Yapıldı
- Korku: menü müziği susturuldu; tek joystick; 2 ipucu hakkı.
- Korku görselleri (`doku/`, ayrıntı KAYNAKLAR.md): Nano Banana Pro varyasyonlarından her türün en iyisi seçildi; eksik "omuz arkası" ve tutarsız "dört ayakla koşan" ElevenLabs FLUX.2 Pro ile üretildi (koşanın arka planı BiRefNet). Duvar/zemin/tavan/kapı/kan yazısı gerçek doku; el izleri kan yazılı fotoğraftan kırpılır; yaratık dolaşırken yürür, kovalarken dört ayak; ani korku sahneleri: 1. sayfa kapı aralığı, 3. sayfa karartması sonrası tavan, 4. sayfa veya arkanı döndüğünde omuz arkası; 2. sayfa ve yakalanmada yüz.
- Korku gerçekçilik: koridor yankısı (konvolüsyon), duvar arkası sesler boğuk, yakındaki yaratığın nefesi, elde kamera salınımı, fener sıcak noktası, tehlikede renk solması + kalp atışıyla kızaran kenarlar, kromatik sapma, sade ipucu işareti, kanlı çarşaf altında ceset.
- Misket hatası: çember temizlenince yeni dizilim çemberde kalan atıcının üstüne doğup misketi rastgele fırlatıyordu → düzeltildi; toprak sürtünmesi/esneklik gerçekçi (`PHYS`).
- Tüm oyunların grafikleri ve oyun hissi yenilendi (kurallar/puanlama/ağ verisi aynı).

- Mantık denetimi (her hata betikle yeniden üretilip düzeltildi): blok/kelime 6, kule/basket 8, renk/refleks 2, penaltı/misket 14, korku 11, app.js/sw.js 10. Ayrıntı: git log.

## KALAN / öneriler
- Gerçek orta seviye telefonda kare hızı kontrolü (özellikle penaltı ilk kare, korku, blok).
- Yürüyen yaratık ve yakalanma yüzünün arka planı yerelde silindi (BiRefNet değil); istenirse kullanıcı dosyaları ElevenLabs akışına yükleyip BiRefNet'ten geçirebilir.
- Kullanıcı kararı bekleyenler: karışık düelloda tur beraberliği ham puan toplamıyla bozuluyor (oyun ölçekleri farklı; normalleştirme önerildi); Refleks'te erken dokunuş turu yakıyor (yeniden başlatma alternatifi); Misket'te süre biterken yuvarlanan misket sayılmıyor (app.js'in atışı bitirmesi gerekir).
- Gerçekçi görseller için kaynak seçimi: ücretsiz CC0 (ambientCG WoodFloor041 parke, Facade001 cephe, Poly Haven puresky gökyüzü) ve/veya ElevenLabs tribün görselleri.
