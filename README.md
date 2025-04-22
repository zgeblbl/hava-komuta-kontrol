# Hava Komuta Kontrol Sistemi

Modern ve kullanıcı dostu bir arayüze sahip hava komuta kontrol sistemi. React ile geliştirilmiş bu uygulama, hava trafiği kontrolü ve yönetimi için gerekli temel özellikleri içerir.

## 🚀 Özellikler

- 🌓 Çoklu Tema Desteği (Koyu, Açık, Askeri)
- 🗺️ Farklı Harita Görünümleri (Uydu, Arazi, Askeri, Hibrit)
- 🌍 Çoklu Dil Desteği (Türkçe, İngilizce)
- 📡 Gerçek Zamanlı Uçuş Takibi
- 🎯 Gelişmiş Harita Katmanları
- 🔔 Özelleştirilebilir Bildirimler
- ⚡ Performans Optimizasyonu

## 🛠️ Teknolojiler

- React 18
- React Router v6
- Context API (Durum Yönetimi)
- CSS Modules
- Modern JavaScript (ES6+)

## 📁 Proje Yapısı

```
src/
├── components/      # Yeniden kullanılabilir bileşenler
│   ├── Settings/   # Ayarlar bileşenleri
│   ├── Profile/    # Profil bileşenleri
│   └── Navbar/     # Navigasyon bileşeni
├── context/        # Context API dosyaları
│   └── SettingsContext.js  # Ayarlar yönetimi
├── hooks/          # Özel React hooks
├── locales/        # Dil dosyaları
├── pages/          # Sayfa bileşenleri
├── styles/         # CSS dosyaları
│   ├── global.css  # Global stil değişkenleri
│   ├── Settings.css
│   └── Profile.css
├── App.js          # Ana uygulama bileşeni
└── index.js        # Giriş noktası
```

## 🚀 Kurulum


1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Uygulamayı başlatın:
   ```bash
   npm start
   ```

## 🔧 Kullanılabilir Komutlar

- `npm start`: Geliştirme modunda uygulamayı başlatır
- `npm build`: Production için uygulamayı derler
- `npm test`: Testleri çalıştırır
- `npm run eject`: CRA yapılandırmasını özelleştirir

## 🌐 Ortam Değişkenleri

Uygulamayı yapılandırmak için `.env` dosyası oluşturun:

```env
REACT_APP_API_URL=your_api_url
REACT_APP_MAP_KEY=your_map_api_key
```

## 🎨 Tema Özelleştirme

Uygulama üç farklı tema seçeneği sunar:
- 🌞 Açık Tema
- 🌙 Koyu Tema
- 🎖️ Askeri Tema

Temalar CSS değişkenleri kullanılarak yönetilir ve gerçek zamanlı olarak değiştirilebilir.


