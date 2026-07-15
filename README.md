# 🌍 Good News (Güzel Haberler)

> "Çünkü güzel şeyler de haber değeri taşır."

**Good News**, dünyadan ve yerelden yalnızca pozitif, umut verici ve ilham kaynağı olan gelişmeleri derleyen yapay zeka destekli, modern bir haber platformudur. Kötü haber sarmalından (doomscrolling) bunalan okurlar için ruh sağlığını destekleyici, temiz ve motive edici bir okuma deneyimi sunar.

## ✨ Temel Özellikler (Key Features)

| Özellik | Açıklama |
| :--- | :--- |
| 📍 **Akıllı Lokasyon Yönlendirmesi** | Next.js Proxy/Middleware ile IP tabanlı sessiz yönlendirme. Gelen kullanıcının ülkesine göre haber havuzu filtreleme (Yerel vs Evrensel haber akışı). |
| 🤖 **AI Gatekeeper** | Arka planda çalışan otonom Cron Job sistemi. Haberleri analiz ederek sadece yüksek skorlu pozitif olanları süzer ve bölgesel (`TR_LOCAL`) veya global (`UNIVERSAL`) olarak etiketler. |
| 🏆 **İyilik Serisi (Streak Tracker)** | Kullanıcıların okuduğu pozitif haber sayısını sayar. 3, 5 ve 10'uncu haberlerde motive edici zarif oyunlaştırma (Toast) bildirimleri ile ruh sağlığına puan kazandırır. |
| 📚 **Gelişmiş Sayfalama & Kategoriler** | Dinamik "Load More" (Daha Fazla Yükle) mantığı, akıllı deduplication (mükerrer kayıt engelleme) ve pürüzsüz Server-Client veri senkronizasyonu. |
| 🌍 **Tam i18n & Tema Desteği** | Kod tabanında %100 Server-Client destekli çoklu dil (Türkçe/İngilizce) mimarisi ve `next-themes` ile kusursuz çalışan Dark/Light mode entegrasyonu. |

## 🛠 Kullanılan Teknolojiler (Built With)

Proje, endüstri standardı modern web teknolojileri kullanılarak inşa edilmiştir:

- **Framework:** Next.js (App Router, Server Actions)
- **Kütüphane:** React 19
- **Veritabanı & Backend:** Supabase (PostgreSQL)
- **Yapay Zeka:** Gemini AI (Google GenAI)
- **Stilleme:** Tailwind CSS v4
- **Bileşen & Bildirimler:** Sonner (Toast) & React Markdown

## 🚀 Kurulum Adımları (Getting Started)

Projeyi kendi ortamınızda (lokalde) çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### 1. Depoyu Klonlayın ve Bağımlılıkları Kurun
```bash
git clone https://github.com/KULLANICI_ADI/goodnews.git
cd goodnews
npm install
