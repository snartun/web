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

  // ---------- görsel katman (önbellekli sprite'lar; ışık üstten) ----------
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const SPR = new Map();
  const cached = (key, build) => { let c = SPR.get(key); if (!c) { if (SPR.size > 80) SPR.clear(); c = build(); SPR.set(key, c); } return c; };
  let NOISE = null;
  function noisePat(x) {
    if (!NOISE) {
      NOISE = mk(96, 96); const n = NOISE.getContext("2d"), im = n.createImageData(96, 96);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() < 0.5 ? 0 : 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 14; }
      n.putImageData(im, 0, 0);
    }
    return x.createPattern(NOISE, "repeat");
  }
  // Arka plan: mor gece gradyanı + yumuşak bokeh ışıkları + gren + vinyet
  function buildBg(R) {
    const d = DPR(), c = mk(R.w * d, R.h * d), x = c.getContext("2d");
    x.scale(d, d); x.translate(-R.x, -R.y);
    let gr = x.createLinearGradient(0, R.y, 0, R.y + R.h);
    gr.addColorStop(0, "#33214f"); gr.addColorStop(0.5, "#221640"); gr.addColorStop(1, "#110c22");
    x.fillStyle = gr; x.fillRect(R.x, R.y, R.w, R.h);
    const rnd = K.rng(77);
    const cols = ["255,170,90", "180,120,255", "255,120,180", "120,170,255"];
    for (let i = 0; i < 16; i++) {
      const bx = R.x + rnd() * R.w, by = R.y + rnd() * R.h, br = 18 + rnd() * 60, cc = cols[i % cols.length], a = 0.05 + rnd() * 0.08;
      gr = x.createRadialGradient(bx, by, 0, bx, by, br);
      gr.addColorStop(0, "rgba(" + cc + "," + a + ")"); gr.addColorStop(0.7, "rgba(" + cc + "," + a * 0.6 + ")"); gr.addColorStop(1, "rgba(" + cc + ",0)");
      x.fillStyle = gr; x.beginPath(); x.arc(bx, by, br, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = noisePat(x); x.fillRect(R.x, R.y, R.w, R.h);
    gr = x.createRadialGradient(R.x + R.w / 2, R.y + R.h * 0.45, Math.min(R.w, R.h) * 0.3, R.x + R.w / 2, R.y + R.h * 0.45, Math.max(R.w, R.h) * 0.75);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.5)");
    x.fillStyle = gr; x.fillRect(R.x, R.y, R.w, R.h);
    return c;
  }
  // yavaş süzülen bokeh topu (tek sprite)
  const orb = () => cached("orb" + DPR(), () => {
    const d = DPR(), s = 64, c = mk(s * d, s * d), x = c.getContext("2d"); x.scale(d, d);
    const gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, "rgba(255,214,150,0.5)"); gr.addColorStop(0.55, "rgba(255,190,120,0.18)"); gr.addColorStop(1, "rgba(255,190,120,0)");
    x.fillStyle = gr; x.fillRect(0, 0, s, s); return c;
  });
  // Çark: kadife/ahşap halkalı disk, metalik kenar, iç gölge
  function discSprite(D) {
    D = Math.round(D);
    return cached("disc" + D + "|" + DPR(), () => {
      const d = DPR(), p = Math.ceil(D * 0.18), S = D * 2 + p * 2, c = mk(S * d, S * d), x = c.getContext("2d");
      x.scale(d, d); const o = p + D;
      x.save(); x.shadowColor = "rgba(0,0,0,0.6)"; x.shadowBlur = D * 0.12 * d; x.shadowOffsetY = D * 0.05 * d;
      x.fillStyle = "#1c1233"; x.beginPath(); x.arc(o, o, D, 0, Math.PI * 2); x.fill(); x.restore();
      let gr = x.createLinearGradient(0, o - D, 0, o + D); // metalik kenar
      gr.addColorStop(0, "#8f7bc0"); gr.addColorStop(0.5, "#4a3a72"); gr.addColorStop(1, "#24193f");
      x.fillStyle = gr; x.beginPath(); x.arc(o, o, D, 0, Math.PI * 2); x.fill();
      const Di = D - Math.max(4, D * 0.035);
      gr = x.createRadialGradient(o, o - Di * 0.3, Di * 0.1, o, o, Di);
      gr.addColorStop(0, "#43306c"); gr.addColorStop(0.75, "#2c1f4c"); gr.addColorStop(1, "#1d1436");
      x.fillStyle = gr; x.beginPath(); x.arc(o, o, Di, 0, Math.PI * 2); x.fill();
      x.save(); x.beginPath(); x.arc(o, o, Di, 0, Math.PI * 2); x.clip();
      const rnd = K.rng(5); // ince halka dokusu
      for (let i = 0; i < 26; i++) { x.strokeStyle = "rgba(255,255,255," + (0.012 + rnd() * 0.025) + ")"; x.lineWidth = 0.5 + rnd() * 1.5; x.beginPath(); x.arc(o, o, Di * (0.15 + rnd() * 0.85), 0, Math.PI * 2); x.stroke(); }
      x.fillStyle = noisePat(x); x.fillRect(o - Di, o - Di, Di * 2, Di * 2);
      x.shadowColor = "rgba(0,0,0,0.8)"; x.shadowBlur = D * 0.1 * d; x.shadowOffsetY = D * 0.03 * d; // içe düşen gölge
      x.strokeStyle = "#000"; x.lineWidth = 20; x.beginPath(); x.arc(o, o, Di + 10, 0, Math.PI * 2); x.stroke();
      x.restore();
      x.strokeStyle = "rgba(255,255,255,0.28)"; x.lineWidth = 1; x.beginPath(); x.arc(o, o, D - 0.5, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
      c.o = o; return c;
    });
  }
  // Harf taşı: yuvarlak seramik (krem) veya bal rengi (seçili)
  const TONES = { cream: ["#fffaf0", "#efe4cc", "#b9a17a"], gold: ["#ffe7a3", "#f4b400", "#a86f00"] };
  function tokenSprite(r, tone) {
    r = Math.round(r);
    return cached("tok" + tone + r + "|" + DPR(), () => {
      const d = DPR(), p = Math.ceil(r * 0.4), S = (r + p) * 2, c = mk(S * d, S * d), x = c.getContext("2d"), T = TONES[tone];
      x.scale(d, d); const o = r + p;
      x.save(); x.shadowColor = "rgba(0,0,0,0.5)"; x.shadowBlur = r * 0.3 * d; x.shadowOffsetY = r * 0.14 * d;
      x.fillStyle = T[2]; x.beginPath(); x.arc(o, o, r, 0, Math.PI * 2); x.fill(); x.restore();
      let gr = x.createLinearGradient(0, o - r, 0, o + r);
      gr.addColorStop(0, T[0]); gr.addColorStop(0.5, T[1]); gr.addColorStop(1, T[2]);
      x.fillStyle = gr; x.beginPath(); x.arc(o, o, r, 0, Math.PI * 2); x.fill();
      gr = x.createRadialGradient(o, o + r * 0.1, r * 0.2, o, o, r * 0.86); // hafif çanak yüzey
      gr.addColorStop(0, T[1]); gr.addColorStop(1, T[0]);
      x.fillStyle = gr; x.beginPath(); x.arc(o, o, r * 0.84, 0, Math.PI * 2); x.fill();
      gr = x.createLinearGradient(0, o - r * 0.8, 0, o);
      gr.addColorStop(0, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = gr; x.beginPath(); x.ellipse(o, o - r * 0.42, r * 0.58, r * 0.34, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = "rgba(0,0,0,0.18)"; x.lineWidth = 1; x.beginPath(); x.arc(o, o, r - 0.5, 0, Math.PI * 2); x.stroke();
      c.o = o; return c;
    });
  }
  // Hedef kutusu: boşken içe gömük yuva, dolunca bal rengi seramik karo
  function slotSprite(b, full) {
    b = Math.round(b);
    return cached("slot" + (full ? 1 : 0) + b + "|" + DPR(), () => {
      const d = DPR(), p = Math.ceil(b * 0.3), S = b + p * 2, c = mk(S * d, S * d), x = c.getContext("2d"), r = b * 0.2;
      x.scale(d, d); x.translate(p, p);
      if (!full) {
        x.fillStyle = "rgba(8,4,20,0.5)"; K.rr(x, 0, 0, b, b, r); x.fill();
        x.save(); K.rr(x, 0, 0, b, b, r); x.clip();
        x.shadowColor = "rgba(0,0,0,0.9)"; x.shadowBlur = b * 0.18 * d; x.shadowOffsetY = b * 0.08 * d;
        x.strokeStyle = "#000"; x.lineWidth = 12; K.rr(x, -6, -6, b + 12, b + 12, r + 6); x.stroke(); x.restore();
        x.strokeStyle = "rgba(255,255,255,0.12)"; x.lineWidth = 1; x.beginPath(); x.moveTo(r, b - 0.5); x.lineTo(b - r, b - 0.5); x.stroke();
      } else {
        x.save(); x.shadowColor = "rgba(0,0,0,0.45)"; x.shadowBlur = b * 0.16 * d; x.shadowOffsetY = b * 0.08 * d;
        x.fillStyle = "#9a6500"; K.rr(x, 0, 0, b, b, r); x.fill(); x.restore();
        let gr = x.createLinearGradient(0, 0, 0, b);
        gr.addColorStop(0, "#ffe9a8"); gr.addColorStop(0.45, "#f6bd1e"); gr.addColorStop(1, "#b57a00");
        x.fillStyle = gr; K.rr(x, 0, 0, b, b, r); x.fill();
        const f = b * 0.1; gr = x.createLinearGradient(0, f, 0, b - f);
        gr.addColorStop(0, "#f2b51c"); gr.addColorStop(1, "#ffd25a");
        x.fillStyle = gr; K.rr(x, f, f * 0.9, b - 2 * f, b - 2 * f, r * 0.7); x.fill();
        gr = x.createLinearGradient(0, f, 0, b * 0.5);
        gr.addColorStop(0, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = gr; K.rr(x, f + 2, f, b - 2 * f - 4, b * 0.3, r * 0.5); x.fill();
        x.strokeStyle = "rgba(255,255,255,0.5)"; x.lineWidth = 1; K.rr(x, 0.5, 0.5, b - 1, b - 1, r); x.stroke();
      }
      c.p = p; return c;
    });
  }
  // Düğme: kabarık hap şekli
  function btnSprite(w, h, hot) {
    return cached("btn" + w + "x" + h + (hot ? "h" : "") + "|" + DPR(), () => {
      const d = DPR(), p = 10, c = mk((w + p * 2) * d, (h + p * 2) * d), x = c.getContext("2d"), r = h / 2;
      x.scale(d, d); x.translate(p, p);
      x.save(); x.shadowColor = "rgba(0,0,0,0.5)"; x.shadowBlur = 10 * d; x.shadowOffsetY = 4 * d;
      x.fillStyle = hot ? "#5a3a10" : "#2a1d46"; K.rr(x, 0, 0, w, h, r); x.fill(); x.restore();
      let gr = x.createLinearGradient(0, 0, 0, h);
      if (hot) { gr.addColorStop(0, "#7a5a2a"); gr.addColorStop(1, "#46300f"); } else { gr.addColorStop(0, "#54407e"); gr.addColorStop(1, "#2c1f4a"); }
      x.fillStyle = gr; K.rr(x, 0, 0, w, h, r); x.fill();
      gr = x.createLinearGradient(0, 0, 0, h * 0.55);
      gr.addColorStop(0, "rgba(255,255,255,0.22)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = gr; K.rr(x, 3, 2, w - 6, h * 0.5, [r - 2, r - 2, 6, 6]); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.18)"; x.lineWidth = 1; K.rr(x, 0.5, 0.5, w - 1, h - 1, r); x.stroke();
      c.p = p; return c;
    });
  }
  const easeBack = t => { t = clamp(t, 0, 1) - 1; return 1 + 2.70158 * t * t * t + 1.70158 * t * t; };

  function create(opts) {
    const seed = opts.seed | 0;
    const g = { score: 0, over: false, k: 0, letters: [], order: [], pick: [], found: [], goals: [], reveal: {}, bonus: 0, valid: null, msg: "", msgT: 0, shake: 0, R: null, pops: [], parts: [], clock: 0, loadErr: false, swipe: null, hints: 3, finger: null, solvedT: 0,
      // görsel durum
      lift: [], pt: [], disp: [], fly: [], landT: {}, echo: null, press: null, inT: 0, shownK: -1, bg: null, bgKey: "", revT: {} };
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
    // hedef kutusu geometrisi (çizim ve uçuş hedefi için)
    function slotGeo(R, L) {
      const rows = g.goals.length, areaH = Math.max(80, L.slotBottom - L.slotTop);
      return Math.floor(Math.min(36, (areaH - (rows - 1) * 6) / rows, (R.w - 40) / 7.5));
    }
    const slotXY = (R, L, box, i, j, len) => ({ x: R.x + (R.w - len * (box + 4)) / 2 + j * (box + 4), y: L.slotTop + i * (box + 6) });
    function submit() {
      const picked = g.pick.slice();
      const w = word(); g.pick = [];
      if (!g.valid || w.length < 3) return;
      const L = layout(g.R);
      if (g.found.includes(w)) { g.msg = "Zaten buldun"; g.msgT = 1.3; g.echo = { w, kind: "dup", t: 0 }; SFX.pop(false); return; }
      if (!g.valid.has(w)) { g.msg = "Sözlükte yok"; g.msgT = 1.4; g.shake = 1; g.echo = { w, kind: "bad", t: 0 }; K.kick(0.1); SFX.buzz(); buzz(30); return; }
      g.found.push(w);
      const isGoal = g.goals.includes(w), pangram = w.length === g.letters.length;
      let pts = Math.round((PTS[w.length] || 30) * (isGoal ? 1.5 : 0.6)) + (pangram ? 150 : 0);
      g.score += pts;
      if (isGoal) {
        SFX.chime(Math.min(12, w.length * 2 - 2)); buzz(20);
        // harfler çarktan hedef kutulara sırayla uçar
        const gi = g.goals.indexOf(w); g.landT[w] = [];
        picked.forEach((li, j) => { const p = (g.disp[li] && g.disp[li].x != null) ? g.disp[li] : L.pos.find(q => q.li === li); g.fly.push({ ch: upper(w[j]), w, gi, j, x0: p.x, y0: p.y, t: -j * 0.055 }); });
        K.kick(0.08 + w.length * 0.015);
      } else {
        g.bonus++; SFX.chime(Math.min(8, w.length), 0.6);
        g.echo = { w, kind: "ok", t: 0 };
        K.parts.spark(g.parts, L.cx, L.wordY, "#ffd34d", 10, 200);
      }
      K.pops.add(g.pops, (pangram ? "TÜM HARFLER!  " : isGoal ? "" : "BONUS  ") + "+" + pts, L.cx, L.wordY - 6, isGoal ? "#8ef0e2" : "#ffd34d", pangram);
      if (pangram) { K.flash(0.2, "#ffe7a3"); K.hitstop(0.06); K.parts.ring(g.parts, L.cx, L.cy, "#ffd34d", L.wheelR * 1.6, 5); }
      if (g.goals.every(x => g.found.includes(x))) {
        g.score += 200; g.solvedT = 1.4;
        const my = (L.slotTop + L.slotBottom) / 2;
        K.pops.add(g.pops, "BULMACA TAMAM!", L.cx, my, "#ffd34d", true); K.pops.add(g.pops, "+200", L.cx, my + 36, "#8ef0e2");
        SFX.milestone(); buzz([30, 40, 60]);
        // bitiş kutlaması
        K.parts.confetti(g.parts, L.cx - g.R.w * 0.3, L.wordY, 34, 460); K.parts.confetti(g.parts, L.cx + g.R.w * 0.3, L.wordY, 34, 460);
        K.flash(0.22, "#fff0c0"); K.kick(0.3); K.hitstop(0.07);
      }
    }
    return {
      get score() { return g.score; },
      get over() { return g.over; },
      info() { return { extra: g.valid ? "BULMACA " + (g.k + 1) + " · " + g.found.filter(w => g.goals.includes(w)).length + "/" + g.goals.length + (g.bonus ? " · bonus " + g.bonus : "") : "" }; },
      update(dt) {
        g.clock += dt; g.msgT = Math.max(0, g.msgT - dt); g.shake = Math.max(0, g.shake - dt * 2.2);
        if (g.solvedT > 0) { g.solvedT -= dt; if (g.solvedT <= 0) { g.k++; loadPuzzle(); } }
        // yeni bulmaca: taşlar sırayla belirir
        if (g.valid && g.shownK !== g.k) { g.shownK = g.k; g.inT = 0; g.landT = {}; g.fly = []; g.revT = {}; g.disp = []; g.lift = []; g.pt = []; }
        g.inT += dt;
        if (g.echo) { g.echo.t += dt; if (g.echo.t > 0.6) g.echo = null; }
        if (g.press) { g.press.t += dt; if (g.press.t > 0.2) g.press = null; }
        for (const k in g.revT) g.revT[k] += dt;
        for (const w in g.landT) for (let j = 0; j < g.landT[w].length; j++) if (g.landT[w][j] != null) g.landT[w][j] += dt;
        if (g.R && g.valid) {
          const L = layout(g.R), box = slotGeo(g.R, L), a = 1 - Math.exp(-dt * 16);
          for (const p of L.pos) {
            const li = p.li, sel = g.pick.includes(li) ? 1 : 0;
            g.lift[li] = (g.lift[li] || 0) + (sel - (g.lift[li] || 0)) * Math.min(1, dt * 18);
            if (g.pt[li] != null) g.pt[li] += dt;
            const D = g.disp[li] || (g.disp[li] = { x: p.x, y: p.y });
            D.x += (p.x - D.x) * a; D.y += (p.y - D.y) * a; // karıştırınca kayarak yer değiştirir
          }
          for (const f of g.fly) {
            f.t += dt;
            if (f.t >= 0.4 && !f.done) {
              f.done = true; (g.landT[f.w] || (g.landT[f.w] = []))[f.j] = 0;
              const s = slotXY(g.R, L, box, f.gi, f.j, f.w.length);
              K.parts.spark(g.parts, s.x + box / 2, s.y + box / 2, "#ffe7a3", 4, 160);
              SFX.letter(f.j + 2);
            }
          }
          g.fly = g.fly.filter(f => !f.done);
        }
        K.pops.update(g.pops, dt); K.parts.update(g.parts, dt);
      },
      pointer(type, x, y) {
        if (!g.R || g.over || !g.valid || g.solvedT > 0) return;
        const L = layout(g.R);
        if (type === "down") {
          for (const b of L.btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
            g.press = { id: b.id, t: 0 };
            if (b.id === "mix") { for (let i = g.order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [g.order[i], g.order[j]] = [g.order[j], g.order[i]]; } SFX.whoosh(); }
            else {
              const left = g.goals.filter(w => !g.found.includes(w));
              if (!left.length || g.hints <= 0) { SFX.buzz(); return; }
              const w = left[Math.floor(Math.random() * left.length)], r = g.reveal[w] || 0;
              g.reveal[w] = Math.min(w.length - 1, r + 1); g.hints--; SFX.chime(3, 0.6);
              g.revT[w + "|" + (g.reveal[w] - 1)] = 0;
            }
            return;
          }
          for (const p of L.pos) if (Math.hypot(x - p.x, y - p.y) < L.tile * 0.62) { g.pick = [p.li]; g.pt[p.li] = 0; g.swipe = true; g.finger = { x, y }; g.echo = null; SFX.letter(1); return; }
          return;
        }
        if (type === "move" && g.swipe) {
          g.finger = { x, y };
          for (const p of L.pos) if (Math.hypot(x - p.x, y - p.y) < L.tile * 0.48) {
            const n = g.pick.length;
            if (n >= 2 && g.pick[n - 2] === p.li) { g.pick.pop(); SFX.pop(false); }
            else if (!g.pick.includes(p.li)) { g.pick.push(p.li); g.pt[p.li] = 0; SFX.letter(g.pick.length); }
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
        const bk = R.x + "," + R.y + "," + R.w + "," + R.h + "," + DPR();
        if (g.bgKey !== bk) { g.bg = buildBg(R); g.bgKey = bk; }
        ctx.drawImage(g.bg, R.x, R.y, R.w, R.h);
        // süzülen bokeh
        const ob = orb();
        for (let i = 0; i < 6; i++) {
          const t = g.clock * (0.05 + i * 0.012) + i * 1.7, s = 40 + (i % 3) * 30;
          const ox = R.x + ((Math.sin(t) * 0.5 + 0.5) * 0.9 + 0.05) * R.w, oy = R.y + ((Math.cos(t * 0.8 + i) * 0.5 + 0.5) * 0.9 + 0.05) * R.h;
          ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 1.3); ctx.drawImage(ob, ox - s / 2, oy - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
        const L = layout(R);
        if (!g.valid) { txt(ctx, g.loadErr ? "Sözlük yüklenemedi. İnterneti kontrol et." : "Sözlük yükleniyor…", R.x + R.w / 2, R.y + R.h * 0.3, 18, "#cbbcf0", { w: "700" }); ctx.restore(); return; }
        // hedef kutuları
        const box = slotGeo(R, L), solvedE = g.solvedT > 0 ? 1.4 - g.solvedT : -1;
        const emp = slotSprite(box, false), ful = slotSprite(box, true), sp = emp.p * box / Math.round(box), SW = emp.width / DPR() * box / Math.round(box);
        g.goals.forEach((w, i) => {
          const rv = g.reveal[w] || 0, lt = g.landT[w];
          for (let j = 0; j < w.length; j++) {
            const { x, y } = slotXY(R, L, box, i, j, w.length);
            const land = lt && lt[j] != null ? lt[j] : (g.found.includes(w) && !lt ? 9 : -1);
            ctx.drawImage(emp, x - sp, y - sp, SW, SW);
            if (land >= 0) {
              // iniş: ezilip zıplayarak oturur; bulmaca bitince dalga
              let k = land < 0.3 ? 1 + 0.22 * Math.exp(-land * 14) * Math.cos(land * 26) : 1, oy = 0;
              if (solvedE >= 0) { const ph = solvedE * 7 - j * 0.45 - i * 0.35; if (ph > 0 && ph < Math.PI) oy = -Math.sin(ph) * box * 0.22; }
              ctx.save(); ctx.translate(x + box / 2, y + box / 2 + oy); ctx.scale(k, 2 - k);
              ctx.drawImage(ful, -box / 2 - sp, -box / 2 - sp, SW, SW);
              txt(ctx, upper(w[j]), 0, 1, Math.round(box * 0.6), "#3a2200", { f: K.DISP, w: "400" });
              ctx.restore();
            } else if (j < rv) {
              const rt = g.revT[w + "|" + j], k = rt != null && rt < 0.35 ? easeBack(rt / 0.35) : 1;
              ctx.save(); ctx.translate(x + box / 2, y + box / 2 + 1); ctx.scale(k, k);
              txt(ctx, upper(w[j]), 0, 0, Math.round(box * 0.6), "rgba(255,231,163,0.75)", { f: K.DISP, w: "400" });
              ctx.restore();
            }
          }
        });
        // yazılan kelime: harfler tek tek zıplayarak girer; hatada sallanır
        const cur = g.pick.length ? g.pick.map(li => ({ ch: upper(g.letters[li]), t: g.pt[li] || 1 })) : null;
        const ech = !cur && g.echo && g.echo.kind !== "ok" ? g.echo : null, eok = !cur && g.echo && g.echo.kind === "ok" ? g.echo : null;
        const show = cur || (ech ? [...upper(ech.w)].map(ch => ({ ch, t: 1 })) : eok ? [...upper(eok.w)].map(ch => ({ ch, t: 1 })) : null);
        if (show) {
          const size = fit(ctx, show.map(s => s.ch).join(""), R.w - 60, 30, K.DISP, "400");
          ctx.font = "400 " + size + "px " + K.DISP;
          const ws = show.map(s => ctx.measureText(s.ch).width + 3), tw = ws.reduce((a, b) => a + b, 0), pw = tw + 34;
          let a = 1, dx = 0, dy = 0, tint = "rgba(244,180,0,0.22)", edge = "rgba(255,210,120,0.45)", col = "#ffffff";
          if (ech) {
            const e = ech.t; a = clamp((0.6 - e) / 0.2, 0, 1);
            dx = Math.sin(e * 46) * 9 * Math.exp(-e * 5) * (ech.kind === "bad" ? 1 : 0.5);
            tint = ech.kind === "bad" ? "rgba(255,70,90,0.28)" : "rgba(255,180,60,0.22)"; edge = ech.kind === "bad" ? "rgba(255,120,130,0.7)" : edge; col = ech.kind === "bad" ? "#ffd0d5" : "#fff1c8";
          } else if (eok) { const e = eok.t / 0.6; a = 1 - e; dy = -easeBack(e) * 18; }
          ctx.globalAlpha = a;
          ctx.fillStyle = "rgba(0,0,0,0.3)"; rr(ctx, L.cx - pw / 2 + dx, L.wordY - 22 + 3 + dy, pw, 44, 22); ctx.fill();
          ctx.fillStyle = tint; rr(ctx, L.cx - pw / 2 + dx, L.wordY - 22 + dy, pw, 44, 22); ctx.fill();
          ctx.strokeStyle = edge; ctx.lineWidth = 1.5; rr(ctx, L.cx - pw / 2 + dx + 0.75, L.wordY - 22 + dy + 0.75, pw - 1.5, 42.5, 21.5); ctx.stroke();
          let x = L.cx - tw / 2 + dx;
          show.forEach((s, i) => {
            const k = s.t < 0.18 ? easeBack(s.t / 0.18) : 1;
            ctx.save(); ctx.translate(x + ws[i] / 2, L.wordY + dy); ctx.scale(k, k);
            txt(ctx, s.ch, 0, 2, size, "rgba(0,0,0,0.35)", { f: K.DISP, w: "400", a });
            txt(ctx, s.ch, 0, 0, size, col, { f: K.DISP, w: "400", a });
            ctx.restore(); x += ws[i];
          });
          ctx.globalAlpha = 1;
        } else txt(ctx, g.msgT > 0 ? g.msg : "Parmağını harflerin üstünden kaydır", L.cx, L.wordY, 16, g.msgT > 0 ? "#ff9aa4" : "rgba(255,255,255,0.5)", { w: "700", a: g.msgT > 0 ? Math.min(1, g.msgT * 3) : 1 });
        // çark
        const D = L.wheelR + L.tile * 0.72, disc = discSprite(D), dk = D / Math.round(D), DS = disc.width / DPR() * dk;
        ctx.drawImage(disc, L.cx - disc.o * dk, L.cy - disc.o * dk, DS, DS);
        const dp = li => g.disp[li] || L.pos.find(q => q.li === li);
        // parlayan kurdele: geniş yumuşak hale + orta + parlak çekirdek
        if (g.pick.length) {
          const pts = g.pick.map(li => { const p = dp(li); return [p.x, p.y - (g.lift[li] || 0) * 3]; });
          if (g.finger) pts.push([g.finger.x, g.finger.y]);
          ctx.lineCap = "round"; ctx.lineJoin = "round";
          const path = () => { ctx.beginPath(); pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); };
          ctx.globalCompositeOperation = "lighter";
          path(); ctx.strokeStyle = "rgba(255,170,40,0.16)"; ctx.lineWidth = 24; ctx.stroke();
          path(); ctx.strokeStyle = "rgba(255,190,60,0.4)"; ctx.lineWidth = 12; ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
          path(); ctx.strokeStyle = "rgba(255,236,170,0.95)"; ctx.lineWidth = 4.5; ctx.stroke();
          if (g.finger) { ctx.globalCompositeOperation = "lighter"; ctx.drawImage(ob, g.finger.x - 22, g.finger.y - 22, 44, 44); ctx.globalCompositeOperation = "source-over"; }
          ctx.lineCap = "butt"; ctx.lineJoin = "miter";
        }
        // harf taşları
        const r0 = L.tile / 2;
        L.pos.forEach((p0, n) => {
          const li = p0.li, p = dp(li), lift = g.lift[li] || 0, sel = g.pick.includes(li);
          const ie = clamp((g.inT - n * 0.05) / 0.35, 0, 1); if (ie <= 0) return;
          const pt = g.pt[li], bump = sel && pt != null && pt < 0.2 ? Math.sin((pt / 0.2) * Math.PI) * 0.14 : 0;
          const k = easeBack(ie) * (1 + 0.1 * lift + bump), y = p.y - lift * 3;
          const spr = tokenSprite(r0, sel ? "gold" : "cream"), sk = r0 / Math.round(r0) * k, so = spr.o * sk, ss = spr.width / DPR() * sk;
          if (lift > 0.05) { ctx.globalAlpha = 0.3 * lift; ctx.fillStyle = "#000"; ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + r0 * 0.5, r0 * k, r0 * 0.5 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
          ctx.drawImage(spr, p.x - so, y - so, ss, ss);
          txt(ctx, upper(g.letters[li]), p.x, y + 2 * k, Math.round(L.tile * 0.55 * k), sel ? "#3a2400" : "#2e2145", { f: K.DISP, w: "400" });
        });
        // uçan harfler (çarktan kutulara yay çizerek)
        if (g.fly.length) {
          for (const f of g.fly) {
            if (f.t < 0) continue;
            const e = clamp(f.t / 0.4, 0, 1), ee = e * e * (3 - 2 * e), s = slotXY(R, L, box, f.gi, f.j, f.w.length);
            const tx = s.x + box / 2, ty = s.y + box / 2, x = K.lerp(f.x0, tx, ee), y = K.lerp(f.y0, ty, ee) - Math.sin(e * Math.PI) * 50;
            const sz = K.lerp(L.tile * 0.9, box, ee);
            ctx.save(); ctx.translate(x, y); ctx.rotate((1 - ee) * (f.j % 2 ? 0.3 : -0.3));
            ctx.globalAlpha = 0.25; ctx.fillStyle = "#000"; rr(ctx, -sz / 2 + 2, -sz / 2 + 6, sz, sz, sz * 0.2); ctx.fill(); ctx.globalAlpha = 1;
            ctx.drawImage(ful, -sz / 2 - sp * sz / box, -sz / 2 - sp * sz / box, SW * sz / box, SW * sz / box);
            txt(ctx, f.ch, 0, 1, Math.round(sz * 0.6), "#3a2200", { f: K.DISP, w: "400" });
            ctx.restore();
          }
        }
        // düğmeler (basınca çöker)
        for (const b of L.btns) {
          const hot = b.id === "hint" && g.hints > 0, bs = btnSprite(b.w, b.h, hot), pr = g.press && g.press.id === b.id ? Math.sin(Math.min(1, g.press.t / 0.2) * Math.PI) : 0;
          const k = 1 - pr * 0.06;
          ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h / 2 + pr * 2); ctx.scale(k, k);
          ctx.drawImage(bs, -b.w / 2 - bs.p, -b.h / 2 - bs.p, b.w + bs.p * 2, b.h + bs.p * 2);
          txt(ctx, b.label, 0, 1, 16, b.id === "hint" && g.hints <= 0 ? "rgba(255,255,255,0.35)" : hot ? "#ffe7a3" : "#f3efe7", { ls: "1px" });
          ctx.restore();
        }
        K.parts.draw(ctx, g.parts); K.pops.draw(ctx, g.pops, 1);
        ctx.restore();
      },
    };
  }
  let RB = null, RBK = "";
  function drawRemote(ctx, R, d) {
    const key = R.x + "," + R.y + "," + R.w + "," + R.h + "," + DPR();
    if (RBK !== key) { RB = buildBg(R); RBK = key; }
    ctx.drawImage(RB, R.x, R.y, R.w, R.h);
    const f = d ? d.f | 0 : 0, t = d ? d.t | 0 : 0;
    txt(ctx, "BULMACA " + ((d && d.k | 0) + 1), R.x + R.w / 2, R.y + R.h * 0.3, 15, "#cbbcf0", { ls: "2px" });
    txt(ctx, f + " / " + t, R.x + R.w / 2, R.y + R.h * 0.55, Math.round(Math.min(44, R.h * 0.28)), "#ffffff", { f: K.DISP, w: "400" });
    // ilerleme kutucukları
    if (t > 0 && t < 12) {
      const b = Math.round(Math.min(14, R.h * 0.08)), gap = 5, x0 = R.x + (R.w - t * (b + gap) + gap) / 2, y = R.y + R.h * 0.68;
      const e = slotSprite(b, false), fl = slotSprite(b, true), p = e.p, S = e.width / DPR();
      for (let i = 0; i < t; i++) ctx.drawImage(i < f ? fl : e, x0 + i * (b + gap) - p, y - p, S, S);
    }
    txt(ctx, "hedef · bonus " + (d ? d.b | 0 : 0), R.x + R.w / 2, R.y + R.h * 0.86, 14, "#cbbcf0", { w: "700" });
  }
  K.register({
    id: "kelime", name: "Kelime Avı", color: "#8c6bff", desc: "Harfleri kaydırarak kelime kur, hedef kutuları doldur.",
    rules: "Parmağını harflerin üstünden kaydır, bırak · hedef kutuları doldur",
    timeLimit: () => 60,
    create, drawRemote,
  });
})();
