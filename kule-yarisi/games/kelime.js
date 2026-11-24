// Kelime Avı: 7 harften Türkçe kelimeler bul. Sözlük: dictionary-tr (MIT, © Harun Reşit Zafer).
(() => {
  "use strict";
  const { hash, clamp, rr, txt, fit, SFX, buzz, upper } = K;
  const PUZZLES = ["aeklnyı", "ailnsyı", "aaknrst", "aekrstı", "aaekmrt", "aklnouy", "aknstyı", "aeklopy", "deiklrt", "aaknryz", "aeklmns", "aklrsış", "deeiklm", "aamnstv", "aklopsy", "aaeklns", "aaklryı", "aaiklst", "ahnrsyı", "aaeklrs", "aailmst", "aaekmrs", "aabhmst", "aeklmnr", "aiklory", "aklmoty", "aeikmrs", "aaklmst", "deiklns", "aklnosy", "aaknrsı", "aabkrty", "akmstyı", "aeiklps", "aabelms", "adeiklr", "ahklnrı", "adeiklt", "aelnsyı", "aaklmrs", "aalrstı", "aaklprs", "aklotyı", "aaklnyı", "aalmstç", "aakrsyz", "aknorsı", "anrstyı", "aabkmst", "aaklmsy", "aahklms", "aaklnsy", "aahkrst", "aekmrst", "abknrış", "aklruyı", "alnrsyı", "aaknsty", "ahklryı", "aaekmsy", "ahmrsyı", "aeklnoy", "aaklmry", "aekloyı", "aeeklst", "aakmrsı", "aelmpst", "aklopyı", "aeeklmt", "aalrsty", "aklnryı", "adelmns", "aaklnoy", "aahlmns", "aeiknrs", "aklnçış", "aakprst", "aalmrsy", "aafkrsy", "aklorsy", "aekmnrs", "aklnory", "aaklory", "aalnryı", "aeklmnt", "abklnış", "aaklort", "aklnrsı", "aaalmst", "aalnstı", "aakryzı", "aiklnsı", "ahlrsyı", "aahmrst", "aeklmst", "aalmstı", "aaklrst", "aaknsyı", "aaekrsy", "aelmstı", "aklsyzı", "aaiknry", "aeklmrs", "aablmst", "aaeklmt", "aelmrsı", "aiklrsı", "aeiklst", "aklrçış", "aahkmst", "aaelmrs", "aaklpst", "almnsyı", "aadkory", "deiknrs", "aaelnst", "aamnrsy", "aanrstı", "afklrsı", "aakrsyı", "aakmnst", "aaknrış", "adklory", "aabhlst", "ahklrsı", "aalmstt", "aakopry", "aabknsy", "akloprt", "aaknryı", "aablnst", "aalmrst", "aaeknry", "aklrsçı", "aaknrsy", "aaklsty", "deikmrs", "aalmnos", "aahlmst", "aarstyı", "abklnrı", "abeiklt", "aanrsyı", "aabklrt", "aadlmns", "aaiklms", "aalnstv", "aeklnrs", "aeklpst", "aklouyş", "aklntyı", "aaeklms", "aklopry", "aarstüı", "alnstyı", "aalmnst", "aaekrst", "aklmory", "aklmnyı", "aahksty", "abeikln", "aiklosy", "aeeiklm", "aalrsyı", "aailmns", "aaklnry", "aamrsyı", "aaklpry", "aknorst", "aaknpry", "aeklmss", "deiklms", "aaekmst", "aabkory", "degiklr", "aeklmps", "aablmns", "aklryzı", "aaklrsy", "aamrsty", "aakrsty", "aakmryı", "aalnost", "aaklnsç", "aeiklmr", "aadelms", "aabknst", "abklrış", "aeklmsu", "aklorty", "aaklmns", "abkrsış", "aklstyı", "aakrtış", "aakmnsy", "aadlmst", "abeikls", "aaeklrt", "akrsyzı", "aiklnyı", "aklnyzı", "aejklms", "aakmnrs", "aahlsty", "aikloty", "aeklmot", "aaiklns", "aakmrty", "aaklnpy", "aeiklrs", "adeikls", "abeiklm", "aaikrsy", "ahknrsı", "aabklns", "adklosy", "almrstı", "aalnstç", "aemrsyı", "aklnoyı", "aklnoty", "aknrtyı", "aabklms", "aeeklms", "aabklst", "adorsyı", "aeilmst", "aalmnsı", "aeklrsı", "aeiklmt", "aaklnrs", "aabmnst", "aeikrst", "aeiklrt", "aalmnrs", "ahkrsyı", "aklnrış", "abeiklr", "aeklmrt", "aklmrsı", "aakmnry", "aalnrsı", "aaiklrs", "aeklopt", "aeklmtı", "akopryı", "aaklnsı", "aeklmsı", "aakmsyç", "aaklstç", "aabklry", "abknrsı", "adkoryı", "aeklort", "aadmnst", "aelmrst", "aabknry", "aamrsyç", "aeklnrt", "aakntyı", "aknrsış", "aaklnrt", "akrstyı", "adknrsı", "amnrsyı", "aklsçış", "akoruyş", "akklory", "aailnst", "aahklst", "aalmrsı", "adeklmo", "aeklmoy", "aekllms", "aabkrış", "aaekrty", "deiklmr", "aaklmsş", "aamrstı", "aanrsty", "aakloty", "aeklosy", "aaklmrt", "aeiklns", "aakrtyı", "aeklmpt", "aekklms", "abklrsı", "aekloty", "abklsış", "aaknrty", "aaklnst", "aeiklms", "aabklny", "aamnrsı", "aaklnps", "aahrstı", "deiklnr", "aaklrış", "aelmnst", "aakprty", "ahknryı", "aaklrsı", "aklosyı", "akoprsy", "aaeklmr", "aaelrst", "aakpryı", "akloryı", "aakmryç", "aeknrst", "akmrsyı", "aeknrsı", "almrsyı", "aakmpst", "aalmpst", "abklnsı", "aalnsyı", "aakstyı", "aaeklst", "ahlnryı", "akmrstı", "aeiklmn", "akkrsyı", "aabkryı", "aabkrst", "aabknty", "aabkrsy", "adlorsy", "aalnrsy", "aakrstı", "abkrstı", "aklmoyı", "akrsçış", "eikmnrs", "aaklmsı", "aabkrsı", "adeikln", "aiklnrı", "aalnrst", "aekmrsı", "akoprst", "aknsyzı", "aaemnst", "aaklosy", "aklorst", "aarstış", "aeklrst", "aakmprs", "deiklrs", "aakmsty", "akrstış", "deikmnr", "aeklory", "aamnrst", "aahmsty", "aeikmns", "aaklnty", "aakrsış", "aelmstv", "aklrtış", "aaklrty", "aakmrsy", "akoprty", "adeiklm", "aeilmns", "aaklmsç", "aakmrst", "aabelst", "aaelmst", "aaklnrı", "aaklmps", "aablnsy", "aekrtış", "aklrstı", "aaelmns", "abiklst", "aknrstı", "aknryzı", "aamnstç", "adeklmn", "adeiknr", "eiklnrs", "aahlnst", "aakprsı", "adkorsy", "aahmnst", "akmrsış", "aklnsyı", "adeikrs", "aakprsy", "abkrtış", "aamnors", "aalmstv", "aklstış", "deiklmn", "aklopty", "aklmryı", "amnorsı", "aeiklnr"];
  // Hedef kelimeler: elle derlenmiş yaygın Türkçe kelimeler (yalnız sözlükte de bulunanlar)
  const COMMON = new Set(["abla", "ahır", "aile", "akıl", "akış", "akşam", "alan", "alarm", "alem", "alet", "almak", "alt", "alçak", "alım", "alın", "alış", "ama", "amaç", "ana", "anahtar", "anne", "anı", "ara", "araba", "aralık", "araç", "arka", "arkadaş", "arsa", "artış", "arı", "asal", "asil", "asker", "aslan", "asma", "ası", "ata", "ateş", "atlas", "avcı", "avlu", "avuç", "ayak", "ayna", "aynı", "ayran", "ayı", "azık", "ağa", "ağaç", "ağır", "aşk", "aşı", "bacak", "bacı", "bahar", "bak", "bakan", "bakır", "bakış", "bal", "balon", "balta", "balık", "bank", "barak", "barış", "bas", "basamak", "basit", "baskı", "bat", "batı", "bay", "bayan", "bayrak", "bazen", "bağ", "baş", "başka", "bebek", "beden", "bel", "bela", "belge", "ben", "benek", "berber", "besin", "beton", "beyaz", "bez", "bezgin", "beş", "biber", "bil", "bilek", "bilet", "bilgi", "bilim", "bin", "bina", "bir", "bira", "birim", "bit", "bitiş", "bitki", "biz", "bodur", "bol", "bolluk", "boy", "boya", "boyun", "bozkır", "bozuk", "boğaz", "boş", "bul", "bulmak", "bulut", "burun", "burç", "buz", "buzul", "buğday", "böcek", "bölge", "bölüm", "börek", "bük", "büro", "büyük", "bıyık", "bıçak", "cadde", "cadı", "cam", "cami", "can", "canlı", "ceket", "cep", "cevap", "ceviz", "dakika", "dal", "dalga", "dalış", "dam", "damat", "damla", "dana", "dar", "darı", "davul", "dağ", "dede", "defter", "dek", "del", "deli", "dem", "den", "deniz", "der", "dere", "dergi", "derin", "ders", "destan", "deve", "değer", "deş", "dik", "dikiş", "dil", "dilek", "dip", "direk", "diz", "dişi", "doktor", "dol", "dolap", "dolar", "dolma", "dolu", "domates", "dost", "doğa", "dudak", "dur", "duvar", "duygu", "dök", "dön", "dönüm", "dörtlü", "döv", "dükkan", "dünya", "düz", "düzen", "düş", "ebe", "ece", "ecel", "ekim", "ekin", "ekmek", "eldiven", "ele", "elma", "elmas", "emek", "emir", "emlak", "engel", "enlem", "erik", "erkek", "erken", "eski", "etek", "evet", "evlat", "evren", "ezgi", "eşek", "eşya", "fakir", "fal", "far", "fare", "fasıl", "fener", "fidan", "fikir", "fil", "fiyat", "fındık", "fırça", "fırın", "fıstık", "gaz", "gazete", "gazoz", "gece", "gel", "gelin", "gelir", "gem", "gemi", "gen", "genç", "ger", "gerdan", "gerçek", "geyik", "gezgin", "gezi", "gibi", "gidon", "giriş", "git", "giysi", "gurur", "gök", "göl", "gölet", "gölge", "gömlek", "gönül", "gör", "göz", "göç", "gün", "güneş", "güvey", "güzel", "güç", "haber", "hak", "hal", "halat", "halı", "ham", "hamal", "hamur", "han", "hane", "harita", "harç", "hasat", "hasta", "hat", "hatıra", "hava", "havuç", "hayal", "hayat", "hayvan", "hayır", "hazine", "hece", "hedef", "hediye", "helva", "hesap", "horoz", "hırka", "hız", "hızlı", "hızır", "iki", "iklim", "ilan", "ilaç", "ileri", "ilk", "ince", "inci", "inek", "insan", "iplik", "iri", "irmik", "isim", "iskele", "iskelet", "izin", "işçi", "kabak", "kabuk", "kadeh", "kadın", "kafa", "kaftan", "kal", "kale", "kalem", "kalkan", "kalp", "kalın", "kamera", "kamış", "kan", "kanal", "kanat", "kap", "kapak", "kaplan", "kapı", "kar", "kara", "karar", "kardeş", "karga", "karpuz", "kartal", "karın", "kas", "kasa", "kasap", "kat", "katır", "kavak", "kavga", "kavun", "kay", "kaya", "kayık", "kaz", "kazak", "kazan", "kaç", "kağıt", "kaşık", "kedi", "kek", "kel", "kelime", "kem", "keman", "kemer", "kemik", "kenar", "kepçe", "kes", "kese", "kesik", "keten", "keçi", "kibrit", "kil", "kiler", "kim", "kimse", "kin", "kir", "kira", "kiraz", "kirpi", "kitap", "kitle", "koca", "kok", "kol", "kolay", "koltuk", "kolye", "konak", "konu", "kopya", "kor", "korku", "kova", "koy", "koyun", "koş", "koşu", "kral", "kubbe", "kul", "kulak", "kule", "kum", "kumar", "kumaş", "kumru", "kumsal", "kundak", "kupa", "kur", "kurt", "kusur", "kutu", "kuyruk", "kuyu", "kuzu", "kuş", "kömür", "köpek", "köprü", "köşe", "küs", "kılıf", "kılıç", "kır", "kırmızı", "kış", "laf", "lale", "lamba", "leke", "lezzet", "leğen", "liman", "limon", "maden", "makas", "mal", "mangal", "marul", "mas", "masa", "masal", "maske", "mat", "maymun", "meclis", "mektup", "melek", "memur", "mendil", "merak", "mercan", "mermer", "mesaj", "met", "metin", "meydan", "meyve", "mezar", "mide", "millet", "mimar", "minder", "misafir", "mola", "mor", "motor", "muhtar", "muz", "mısra", "mısır", "nal", "nalbant", "nane", "nar", "nefes", "nehir", "nem", "nesne", "nine", "ninni", "nişan", "nokta", "ocak", "oda", "oklava", "oku", "okul", "olay", "olta", "omuz", "ora", "orak", "ordu", "orkide", "orman", "orta", "oruç", "otel", "otlak", "oto", "ova", "oya", "oyun", "ozan", "pabuç", "palamut", "palto", "pamuk", "papatya", "para", "park", "parti", "pas", "pasta", "patates", "pazar", "pek", "pekmez", "pencere", "perde", "peri", "pide", "pil", "pilot", "pire", "pirinç", "pişman", "plaka", "polis", "posta", "radyo", "rakam", "raket", "rakı", "ray", "rehber", "reis", "renk", "resim", "ret", "reçel", "roman", "ruh", "rüya", "rüzgar", "saat", "sabah", "saban", "sabun", "sacayak", "sahil", "sakal", "saksı", "sal", "salata", "salep", "salon", "salı", "sam", "saman", "san", "sanal", "sanat", "sandık", "sapan", "sar", "saray", "sarı", "sat", "satır", "satış", "say", "sayfa", "sayı", "saz", "saç", "sağanak", "sebze", "sedir", "sekiz", "sel", "selam", "semer", "sen", "sepet", "ser", "sergi", "serin", "ses", "sev", "sevgi", "seçim", "sil", "silgi", "simit", "sincap", "sinek", "sinema", "sis", "siyah", "soba", "sofra", "sohbet", "sokak", "son", "sonra", "sopa", "sor", "sorgu", "soru", "sorun", "sos", "soyad", "soğan", "soğuk", "spor", "sucuk", "sulu", "sunak", "söz", "sünger", "sür", "süre", "sürü", "süt", "sütun", "sıcak", "sıfır", "sınav", "sınır", "sır", "sıra", "sırık", "tabak", "tahta", "taksi", "takım", "talep", "tam", "tandır", "tarak", "tarih", "tarla", "tas", "tasa", "tasarı", "tat", "tatil", "tava", "tavan", "tavla", "tavuk", "tavşan", "taze", "taş", "tek", "tekel", "tekne", "tel", "telefon", "temiz", "tencere", "tepe", "tepsi", "ter", "terzi", "tespih", "testi", "teyze", "tez", "tilki", "tiyatro", "tohum", "tok", "tokat", "ton", "top", "topaç", "toprak", "torba", "tren", "tulum", "turna", "turşu", "tut", "tutar", "tuz", "tuzak", "tuğla", "tülbent", "tür", "tütün", "tırpan", "ulu", "ulus", "umut", "uslu", "usta", "uyku", "uyu", "uzak", "uzay", "uzman", "uzun", "uçak", "uçurum", "vadi", "vakit", "vapur", "var", "vatan", "vazo", "ver", "vida", "yabancı", "yak", "yal", "yalı", "yamak", "yamaç", "yan", "yanak", "yanıt", "yap", "yaprak", "yar", "yarım", "yas", "yastık", "yat", "yatak", "yavru", "yayla", "yaz", "yazar", "yazık", "yağ", "yaşam", "yel", "yelken", "yem", "yemek", "yen", "yengeç", "yer", "yetki", "yeşil", "yok", "yokuş", "yol", "yolcu", "yonca", "yorgan", "yosun", "yoğurt", "yular", "yumruk", "yumurta", "yön", "yük", "yün", "yürek", "yüz", "yüzük", "yık", "yıl", "yılan", "yıldız", "zaman", "zambak", "zarar", "zemin", "zeytin", "zil", "zirve", "zor", "zurna", "çakal", "çakıl", "çal", "çalış", "çam", "çamur", "çanta", "çare", "çarşı", "çatal", "çatı", "çay", "çek", "çekiç", "çene", "çevre", "çeşit", "çiftlik", "çivi", "çizgi", "çizme", "çiçek", "çocuk", "çorba", "çöl", "çöz", "çık", "çıkış", "çıt", "öde", "ödül", "ölç", "ölüm", "önce", "ördek", "örnek", "ört", "örtü", "öte", "özel", "ücret", "ünlü", "üst", "üstat", "üzüm", "ılık", "ırmak", "ıslak", "ışık", "şahin", "şaka", "şal", "şalgam", "şalvar", "şan", "şapka", "şarkı", "şeftali", "şehir", "şeker", "şemsiye", "şer", "şerbet", "şerit", "şimdi", "şimşek", "şiş", "şişe", "şok"]);
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

  // Hedefler yalnız yaygın kelimelerden: en uzun yaygın kelime + farklı uzunluklardan, toplam en çok 6
  function goalsFor(valid, seed, k) {
    const c = [...valid].filter(w => COMMON.has(w));
    const rank = w => K.hash(seed + k * 7, w.length * 977 + w.charCodeAt(0) * 31 + w.charCodeAt(w.length - 1));
    c.sort((a, b) => b.length - a.length || rank(a) - rank(b));
    const out = c.length ? [c[0]] : [];
    for (const n of [6, 5, 4, 4, 3, 3, 5, 4, 3]) { if (out.length >= 6) break; const w = c.filter(x => x.length === n && !out.includes(x)).sort((a, b) => rank(a) - rank(b))[0]; if (w) out.push(w); }
    return out.sort((a, b) => a.length - b.length || a.localeCompare(b, "tr"));
  }

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, k: 0, letters: [], order: [], pick: [], found: [], goals: [], reveal: {}, bonus: 0, valid: null, msg: "", msgT: 0, shake: 0, R: null, pops: [], parts: [], clock: 0, loadErr: false, swipe: null, hints: 3, finger: null, solvedT: 0 };
    function loadPuzzle() {
      for (let tries = 0; tries < 40; tries++) {
        const idx = Math.floor(K.hash(seed, 1 + g.k * 13 + tries) * PUZZLES.length) % PUZZLES.length;
        const letters = PUZZLES[idx].split("");
        for (let i = letters.length - 1; i > 0; i--) { const j = Math.floor(K.hash(seed + g.k, 50 + i + tries) * (i + 1)); [letters[i], letters[j]] = [letters[j], letters[i]]; }
        const valid = solve(letters.join("")), goals = goalsFor(valid, seed, g.k);
        if (goals.length >= 5 || tries === 39) { g.letters = letters; g.order = letters.map((_, i) => i); g.valid = valid; g.goals = goals; g.found = []; g.reveal = {}; g.pick = []; return; }
      }
    }
    const ready = () => { if (WORDS && !g.valid) loadPuzzle(); };
    if (WORDS) ready(); else K.loadWords().then(ready).catch(() => { g.loadErr = true; });
    const word = () => g.pick.map(i => g.letters[i]).join("");
    function layout(R) {
      const wheelR = Math.min(R.w * 0.3, R.h * 0.15);
      const tile = Math.max(38, Math.min(56, wheelR * 0.58));
      const btnY = R.y + R.h - 54;
      const cx = R.x + R.w / 2, cy = btnY - 16 - tile * 0.6 - wheelR;
      const pos = g.order.map((li, k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / g.letters.length; return { li, x: cx + Math.cos(a) * wheelR, y: cy + Math.sin(a) * wheelR }; });
      const btns = [{ id: "mix", label: "↻ KARIŞTIR", x: R.x + 14 }, { id: "hint", label: "İPUCU (" + g.hints + ")", x: R.x + R.w - 14 - 130 }].map(b => ({ ...b, y: btnY, w: 130, h: 42 }));
      return { cx, cy, wheelR, tile, pos, btns, wordY: cy - wheelR - tile * 0.55 - 26, slotTop: R.y + 14, slotBottom: cy - wheelR - tile * 0.55 - 56 };
    }
    function submit() {
      const w = word(); g.pick = [];
      if (!g.valid || w.length < 3) return;
      const L = layout(g.R);
      if (g.found.includes(w)) { g.msg = "Zaten buldun"; g.msgT = 1; SFX.pop(false); return; }
      if (!g.valid.has(w)) { g.msg = "Sözlükte yok"; g.msgT = 1; g.shake = 1; SFX.buzz(); buzz(30); return; }
      g.found.push(w);
      const isGoal = g.goals.includes(w), pangram = w.length === g.letters.length;
      let pts = Math.round((PTS[w.length] || 30) * (isGoal ? 1.5 : 0.6)) + (pangram ? 150 : 0);
      g.score += pts;
      if (isGoal) { SFX.chime(Math.min(12, w.length * 2 - 2)); buzz(20); K.parts.burst(g.parts, L.cx, L.slotTop + 40, "#8ef0e2", 18, 220); }
      else { g.bonus++; SFX.chime(Math.min(8, w.length), 0.6); }
      K.pops.add(g.pops, (pangram ? "TÜM HARFLER!  " : isGoal ? "" : "BONUS  ") + "+" + pts, L.cx, L.wordY - 6, isGoal ? "#8ef0e2" : "#ffd34d", pangram);
      if (g.goals.every(x => g.found.includes(x))) {
        g.score += 200; g.solvedT = 1.4;
        K.pops.add(g.pops, "BULMACA TAMAM!  +200", L.cx, L.slotTop + 60, "#ffd34d", true);
        SFX.milestone(); buzz([30, 40, 60]);
      }
    }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: g.valid ? "BULMACA " + (g.k + 1) + " · " + g.found.filter(w => g.goals.includes(w)).length + "/" + g.goals.length + (g.bonus ? " · bonus " + g.bonus : "") : "" }; },
      update(dt) {
        g.clock += dt; g.msgT = Math.max(0, g.msgT - dt); g.shake = Math.max(0, g.shake - dt * 4);
        if (g.solvedT > 0) { g.solvedT -= dt; if (g.solvedT <= 0) { g.k++; loadPuzzle(); } }
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (!g.R || g.over || !g.valid || g.solvedT > 0) return;
        const L = layout(g.R);
        if (type === "down") {
          for (const b of L.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            if (b.id === "mix") { for (let i = g.order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [g.order[i], g.order[j]] = [g.order[j], g.order[i]]; } SFX.whoosh(); }
            else {
              const left = g.goals.filter(w => !g.found.includes(w));
              if (!left.length || g.hints <= 0) { SFX.buzz(); return; }
              const w = left[Math.floor(Math.random() * left.length)], r = g.reveal[w] || 0;
              g.reveal[w] = Math.min(w.length - 1, r + 1); g.hints--; SFX.chime(3, 0.6);
            }
            return;
          }
          for (const p of L.pos) if (Math.hypot(x - p.x, y - p.y) < L.tile * 0.62) { g.pick = [p.li]; g.swipe = true; g.finger = { x, y }; SFX.letter(1); return; }
          return;
        }
        if (type === "move" && g.swipe) {
          g.finger = { x, y };
          for (const p of L.pos) if (Math.hypot(x - p.x, y - p.y) < L.tile * 0.48) {
            const n = g.pick.length;
            if (n >= 2 && g.pick[n - 2] === p.li) { g.pick.pop(); SFX.pop(false); }
            else if (!g.pick.includes(p.li)) { g.pick.push(p.li); SFX.letter(g.pick.length); }
          }
          return;
        }
        if ((type === "up" || type === "cancel") && g.swipe) { g.swipe = false; g.finger = null; if (type === "up") submit(); else g.pick = []; }
      },
      _g: g,
      net() { return { f: g.found.filter(w => g.goals.includes(w)).length, t: g.goals.length, b: g.bonus, k: g.k }; },
      draw(ctx, R) {
        g.R = R;
        ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
        K.bg(ctx, R, "#2a1d40", "#120f24");
        const L = layout(R);
        if (!g.valid) { txt(ctx, g.loadErr ? "Sözlük yüklenemedi. İnterneti kontrol et." : "Sözlük yükleniyor…", R.x + R.w / 2, R.y + R.h * 0.3, 18, "#cbbcf0", { w: "700" }); ctx.restore(); return; }
        // hedef kutuları
        const rows = g.goals.length, areaH = Math.max(80, L.slotBottom - L.slotTop);
        const box = Math.floor(Math.min(36, (areaH - (rows - 1) * 6) / rows, (R.w - 40) / 7.5));
        g.goals.forEach((w, i) => {
          const y = L.slotTop + i * (box + 6), x0 = R.x + (R.w - w.length * (box + 4)) / 2, got = g.found.includes(w), rv = g.reveal[w] || 0;
          for (let j = 0; j < w.length; j++) {
            const x = x0 + j * (box + 4);
            ctx.fillStyle = got ? "#f4b400" : "rgba(255,255,255,0.1)"; rr(ctx, x, y, box, box, box * 0.18); ctx.fill();
            if (got || j < rv) txt(ctx, upper(w[j]), x + box / 2, y + box / 2 + 1, Math.round(box * 0.62), got ? "#1b1400" : "rgba(255,255,255,0.7)", { f: K.DISP, w: "400" });
          }
        });
        // yazılan kelime
        const w = upper(word()), sx = g.shake ? Math.sin(g.clock * 60) * 8 * g.shake : 0;
        if (w) { ctx.fillStyle = "rgba(244,180,0,0.18)"; ctx.font = "400 30px " + K.DISP; const ww = ctx.measureText(w).width + 30; rr(ctx, L.cx - ww / 2, L.wordY - 22, ww, 44, 22); ctx.fill(); txt(ctx, w, L.cx + sx, L.wordY, fit(ctx, w, R.w - 40, 30, K.DISP, "400"), "#ffffff", { f: K.DISP, w: "400", ls: "3px" }); }
        else txt(ctx, g.msgT > 0 ? g.msg : "Parmağını harflerin üstünden kaydır", L.cx, L.wordY, 16, g.msgT > 0 ? "#ff9aa4" : "rgba(255,255,255,0.45)", { w: "700" });
        // çark
        ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.beginPath(); ctx.arc(L.cx, L.cy, L.wheelR + L.tile * 0.72, 0, Math.PI * 2); ctx.fill();
        if (g.pick.length) {
          ctx.strokeStyle = "rgba(244,180,0,0.75)"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
          g.pick.forEach((li, k) => { const p = L.pos.find(q => q.li === li); if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
          if (g.finger) ctx.lineTo(g.finger.x, g.finger.y);
          ctx.stroke(); ctx.lineCap = "butt";
        }
        for (const p of L.pos) {
          const sel = g.pick.includes(p.li), r = L.tile / 2 * (sel ? 1.08 : 1);
          ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(p.x, p.y + 3, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = sel ? "#f4b400" : "#f3efe7"; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
          txt(ctx, upper(g.letters[p.li]), p.x, p.y + 1, Math.round(L.tile * 0.55), sel ? "#1b1400" : "#2a1d40", { f: K.DISP, w: "400" });
        }
        for (const b of L.btns) { ctx.fillStyle = "rgba(255,255,255,0.1)"; rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill(); txt(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, 16, b.id === "hint" && g.hints <= 0 ? "rgba(255,255,255,0.35)" : "#f3efe7", { ls: "1px" }); }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1);
        ctx.restore();
      },
    };
  }
  function drawRemote(ctx, R, d) {
    K.bg(ctx, R, "#2a1d40", "#120f24");
    const f = d ? d.f | 0 : 0, t = d ? d.t | 0 : 0;
    txt(ctx, "BULMACA " + ((d && d.k | 0) + 1), R.x + R.w / 2, R.y + R.h * 0.3, 15, "#cbbcf0", { ls: "2px" });
    txt(ctx, f + " / " + t, R.x + R.w / 2, R.y + R.h * 0.55, Math.round(Math.min(44, R.h * 0.28)), "#ffffff", { f: K.DISP, w: "400" });
    txt(ctx, "hedef · bonus " + (d ? d.b | 0 : 0), R.x + R.w / 2, R.y + R.h * 0.78, 14, "#cbbcf0", { w: "700" });
  }
  K.register({
    id: "kelime", name: "Kelime Avı", color: "#8c6bff", desc: "Harfleri kaydırarak kelime kur, hedef kutuları doldur.",
    rules: "Parmağını harflerin üstünden kaydır, bırak · hedef kutuları doldur",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
