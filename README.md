# 🎓 LinguaLearn A1-A2 Master (English Learning Platform)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fperegrinefalcontr%2Flingualearn-english&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&project-name=lingualearn-english)

Sıfırdan A1 ve A2 seviyelerini eksiksiz öğreten, Leitner 5 Kutulu Akıllı Tekrar Sistemi (SRS), 14 Kapsamlı Ünite ve 1.400 Soru Havuzu, Gerçek Hayat Konuşma Senaryoları (Havalimanı, Kafe, Otel, Alışveriş, Doktor) ve Seviye Bitirme Sınavları ile donatılmış modern web ve mobil uyumlu İngilizce öğrenim platformu.

---

## 🚀 Canlı Altyapı & Entegrasyonlar

- **Backend & Veritabanı:** Supabase PostgreSQL (EU Central - Frankfurt)
  - Proje: `lingualearn-english` (`gbfpbzelnnnepfvsmzjd`)
  - Canlı Tablolar: `words` (283 kelime), `lessons` (14 ünite, 1.400 soru), `scenarios` (5 senaryo), `exams` (A1 & A2 sınavları).
  - Row Level Security (RLS) ve indeksler aktif.
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Dağıtım (Deployment):** Vercel & GitHub Entegrasyonu.
- **GitHub Deposu:** [peregrinefalcontr/lingualearn-english](https://github.com/peregrinefalcontr/lingualearn-english)

---

## 🛠️ Vercel Üzerinde Yayına Alma (1-Click Deployment)

1. [Vercel Dashboard](https://vercel.com/new)'a gidin.
2. **Import Git Repository** bölümünden `peregrinefalcontr/lingualearn-english` deposunu seçin.
3. **Environment Variables** bölümüne şu iki anahtarı ekleyin:
   - `VITE_SUPABASE_URL`: `https://gbfpbzelnnnepfvsmzjd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZnBiemVsbm5uZXBmdnNtempkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MDgyNTQsImV4cCI6MjEwNDQ4NDI1NH0.ceg5rLqJjG3SAzomGHeP5AdL59fXRRIVRP4OOYW_rbQ`
4. **Deploy** butonuna tıklayın. Siteniz saniyeler içinde dünya çapında canlı yayına geçer!

---

## 💻 Yerel Geliştirme (Localhost)

```bash
# 1. Projeyi klonlayın
git clone https://github.com/peregrinefalcontr/lingualearn-english.git
cd lingualearn-english

# 2. Bağımlılıkları yükleyin
npm install
npm --prefix client install
npm --prefix server install

# 3. Geliştirici sunucusunu başlatın
npm run dev
```

Platform yerel olarak `http://localhost:5173` adresinde çalışır.

---

## 🌟 Öne Çıkan Özellikler

1. **A1-A2 Akademi (14 Ünite & 1.400 Soru):**
   - Her ünitede detaylı Türkçe formül tabloları, Türkçeden düşünme tuzakları, interaktif iki dilli sesli diyaloglar ve 100 soruluk kavrama testi.
2. **Gerçek Hayat Konuşma Senaryoları:**
   - Havalimanı pasaport kontrolü, kafe/restoran siparişi, otel check-in, mağaza alışverişi ve doktor randevusu diyalogları, telaffuz pratiği ve durum testleri.
3. **Leitner 5 Kutulu SRS (Spaced Repetition):**
   - 283 A1-A2 kelimesi, hafıza kutuları, başarı oranları ve akıllı tekrar döngüsü.
4. **Cümle Tamamlama & Çeviri Atölyesi:**
   - Çoktan seçmeli ve yazılı çeviri pratikleri.
5. **Hata Defteri:**
   - Testlerde veya pratiklerde yapılan hataların otomatik kaydedilip tekrar çözülebildiği kişisel öğrenme alanı.
6. **A1 & A2 Seviye Bitirme Sınavları:**
   - 20 soruluk resmi seviye bitirme sınavları ve başarı sertifikası ekranı.
