export const initialFlights = [
    {
      id: 'THY123',
      callsign: 'TK123',
      model: 'Boeing 737-800',
      origin: 'LTFM', // İstanbul Havalimanı
      destination: 'EDDF', // Frankfurt Havalimanı
      departureTime: '2024-03-16T10:00:00Z',
      estimatedArrivalTime: '2024-03-16T13:00:00Z',
      altitude: 35000, // feet
      speed: 450, // knots
      heading: 270, // degrees
      track: [ // Örnek rota izi (gerçek haritada koordinatlar olur)
        { lat: 41.2753, lon: 28.7519 },
        { lat: 42.5, lon: 25.0 },
        { lat: 45.0, lon: 20.0 },
        { lat: 48.0, lon: 15.0 },
        { lat: 50.0379, lon: 8.5622 }
      ],
      latitude: 41.2753, // Başlangıç pozisyonu (Harita için)
      longitude: 28.7519, // Başlangıç pozisyonu (Harita için)
      status: 'enroute', // 'enroute', 'scheduled', 'landed', 'delayed'
      type: 'sivil', // 'sivil', 'askeri', 'vip', 'muttefik', 'hava-savunma'
      isAlly: false,
      isDefenseSystem: false,
    },
    {
      id: 'PEG456',
      callsign: 'PGT456',
      model: 'Airbus A320neo',
      origin: 'LTFJ', // Sabiha Gökçen
      destination: 'LTAI', // Antalya
      departureTime: '2024-03-16T11:30:00Z',
      estimatedArrivalTime: '2024-03-16T12:30:00Z',
      altitude: 28000,
      speed: 400,
      heading: 180,
      track: [ // Örnek rota izi (gerçek haritada koordinatlar olur)
        { lat: 41.2753, lon: 28.7519 },
        { lat: 42.5, lon: 25.0 },
        { lat: 45.0, lon: 20.0 },
        { lat: 48.0, lon: 15.0 },
        { lat: 50.0379, lon: 8.5622 }
      ],
      latitude: 40.8983,
      longitude: 29.3092,
      status: 'scheduled',
      type: 'sivil',
      isAlly: false,
      isDefenseSystem: false,
    },
    {
      id: 'HVKK001',
      callsign: 'TUKF01',
      model: 'F-16 Fighting Falcon',
      origin: 'LTBJ', // İzmir Adnan Menderes (Askeri kısım varsayalım)
      destination: 'PATROL', // Devriye görevi
      departureTime: '2024-03-16T09:00:00Z',
      estimatedArrivalTime: '2024-03-16T12:00:00Z', // Görev bitişi
      altitude: 20000,
      speed: 550,
      heading: 45,
      track: [ // Örnek rota izi (gerçek haritada koordinatlar olur)
        { lat: 41.2753, lon: 28.7519 },
        { lat: 42.5, lon: 25.0 },
        { lat: 45.0, lon: 20.0 },
        { lat: 48.0, lon: 15.0 },
        { lat: 50.0379, lon: 8.5622 }
      ],
      latitude: 38.2924,
      longitude: 27.1570,
      status: 'enroute',
      type: 'askeri',
      isAlly: true, // Kendi askeri uçağımız, müttefik sayılabilir
      isDefenseSystem: false,
    },
    {
      id: 'NATO789',
      callsign: 'AWACS01',
      model: 'E-3 Sentry (AWACS)',
      origin: 'ETAR', // Ramstein Air Base
      destination: 'EASTMED', // Doğu Akdeniz Gözetleme
      departureTime: '2024-03-16T08:00:00Z',
      estimatedArrivalTime: '2024-03-16T16:00:00Z',
      altitude: 30000,
      speed: 380,
      heading: 135,
      track: [ // Örnek rota izi (gerçek haritada koordinatlar olur)
        { lat: 41.2753, lon: 28.7519 },
        { lat: 42.5, lon: 25.0 },
        { lat: 45.0, lon: 20.0 },
        { lat: 48.0, lon: 15.0 },
        { lat: 50.0379, lon: 8.5622 }
      ],
      latitude: 49.4435, // Örnek harita pozisyonu
      longitude: 7.6010,  // Örnek harita pozisyonu
      status: 'enroute',
      type: 'muttefik', // Slayttaki dark mode'da 'Müttefik uçak' #32CD32
      isAlly: true,
      isDefenseSystem: false,
    },
    {
      id: 'DEF001',
      callsign: 'PATRIOT1',
      model: 'Patriot Missile System', // Uçak değil ama haritada gösterilebilir bir sistem
      origin: 'ANKARA',
      destination: 'STATIC',
      altitude: 0, // Yerde
      speed: 0,
      heading: 0,
      track: [ // Örnek rota izi (gerçek haritada koordinatlar olur)
        { lat: 41.2753, lon: 28.7519 },
        { lat: 42.5, lon: 25.0 },
        { lat: 45.0, lon: 20.0 },
        { lat: 48.0, lon: 15.0 },
        { lat: 50.0379, lon: 8.5622 }
      ],
      latitude: 39.9208,
      longitude: 32.8541,
      status: 'active',
      type: 'hava-savunma', // Slayttaki dark mode'da 'Hava savunma sistemleri' #DC143C
      isAlly: true,
      isDefenseSystem: true,
    },
    {
      id: 'VIP001',
      callsign: 'TC-TRK',
      model: 'Gulfstream G650',
      origin: 'LTAC', // Ankara Esenboğa
      destination: 'LFPG', // Paris Charles de Gaulle
      departureTime: '2024-03-16T14:00:00Z',
      estimatedArrivalTime: '2024-03-16T17:30:00Z',
      altitude: 41000,
      speed: 500,
      heading: 300,
      track: [ // Örnek rota izi (gerçek haritada koordinatlar olur)
        { lat: 41.2753, lon: 28.7519 },
        { lat: 42.5, lon: 25.0 },
        { lat: 45.0, lon: 20.0 },
        { lat: 48.0, lon: 15.0 },
        { lat: 50.0379, lon: 8.5622 }
      ],
      latitude: 40.1281,
      longitude: 32.9950,
      status: 'enroute',
      type: 'vip', // Slayttaki bonus kategoriden
      isAlly: true, // Genelde kendi VIP uçağı müttefiktir
      isDefenseSystem: false,
    }
  ];
  
  // Uçak tiplerine göre renkleri belirlemek için bir yardımcı fonksiyon
  // Bu fonksiyon AircraftIcon bileşeninde kullanılacak.
  export const getAircraftColorVars = (flight, isSelected, theme) => {
    // Slayt 2'deki renkler öncelikli.
    // Tema bilgisini de alarak global.css'deki değişken isimlerini döndüreceğiz.
  
    // 1. Koyu Tema (Dark Mode) – Uçuş Takip Uygamaları İçin İdeal
    //    Vurgulu Renkler:
    //    Uçak ikonu: #00BFFF (açık mavi) veya #FFD700 (altın sarısı) -> --aircraft-default
    //    Seçili uçak: #FF4500 (turuncu-kırmızı) -> --aircraft-selected
    //    Hava savunma sistemleri: #DC143C (koyu kırmızı) -> --defense-system (global.css'de böyle adlandırdım)
    //    Müttefik uçak: #32CD32 (lime yeşili) -> --aircraft-ally (global.css'de böyle adlandırdım)
  
    // 2. Açık Tema (Light Mode)
    //    Uçak ikonu: #007BFF (mavi) veya #FFA500 (turuncu) -> --aircraft-default
    //    Seçili uçak: #FF0000 (kırmızı) -> --aircraft-selected
    //    (Hava savunma ve müttefik için Light Mode'da özel renk belirtilmemiş, Dark Mode'dakileri kullanabiliriz veya global.css'deki light tema default'larını)
  
    // Bonus: Uçaklara Göre Renk Kategorileri (global.css'e eklenmeli)
    //    Sivil uçak: #2196F3 (mavi) -> --aircraft-sivil
    //    Askeri uçak: #F44336 (kırmızı) -> --aircraft-askeri
    //    VIP/Devlet uçakları: #9C27B0 (mor) -> --aircraft-vip
    //    Müttefik uçak: #4CAF50 (yeşil) -> Bu, Dark Mode'daki #32CD32 ile çakışıyor. Slayttaki tema renkleri öncelikli olmalı.
  
    // global.css'deki tema değişkenlerini kullanalım:
    // :root[data-theme="dark"] { --aircraft-default: #00BFFF; --aircraft-selected: #FF4500; --aircraft-ally: #32CD32; --defense-system: #DC143C; }
    // :root[data-theme="light"] { --aircraft-default: #007BFF; --aircraft-selected: #FF0000; --aircraft-ally: #32CD32; /* Light için belirtilmemiş, dark ile aynı olabilir */ --defense-system: #DC143C; /* Light için belirtilmemiş, dark ile aynı olabilir */ }
    // :root[data-theme="military"] { --aircraft-default: #90EE90; --aircraft-selected: #FF6B6B; --aircraft-ally: #98FB98; --defense-system: #FF4444; }
  
    // Bonus renkler için de CSS değişkenleri tanımlamış olalım (global.css'e eklenecek)
    // :root { --aircraft-sivil-bonus: #2196F3; --aircraft-askeri-bonus: #F44336; --aircraft-vip-bonus: #9C27B0; --aircraft-muttefik-bonus: #4CAF50; }
  
    if (isSelected) {
      return 'var(--aircraft-selected)';
    }
  
    // Öncelik: Hava Savunma Sistemi mi?
    if (flight.type === 'hava-savunma' || flight.isDefenseSystem) {
      return 'var(--defense-system)';
    }
  
    // Öncelik: Müttefik mi? (Slayt Dark Mode'a göre)
    if (flight.type === 'muttefik' || (flight.isAlly && flight.type !== 'askeri' && flight.type !== 'vip')) { // Kendi askeri/vip'si müttefikten farklı renkte olabilir
      // Eğer tema Dark ise slayttaki özel rengi (lime yeşili) kullan.
      // Light ve Military için global.css'deki --aircraft-ally yeterli.
      // Ancak global.css'de tüm temalar için --aircraft-ally tanımlı, bu yüzden direkt onu kullanabiliriz.
      return 'var(--aircraft-ally)';
    }
    
    // Bonus Kategoriler (Eğer slayttaki Dark/Light mode öncelikleri yoksa)
    // Bu kısım global.css'e eklenmeli veya mevcut --aircraft-default'u override etmeli.
    // Şimdilik, eğer `type` bonus kategorilerden biriyse, o rengi kullanalım.
    // global.css'e bu değişkenleri eklediğinizi varsayıyorum (örneğin --aircraft-sivil-color)
    // Veya bunları global.css'deki temaların içine yedirebilirsiniz.
    // Örn: :root[data-theme="dark"] { --aircraft-sivil: #2196F3; ... }
    // Şimdilik daha basit bir mantık:
  
    if (flight.type === 'sivil') {
      // Slaytta sivil için özel bir renk belirtilmemiş (dark/light ana listesinde).
      // Bonusu kullanabiliriz veya default.
      // Eğer global.css'de temaya göre --aircraft-sivil tanımlıysa o kullanılır.
      // Yoksa --aircraft-default kullanılır.
      // Bu ayrımı CSS'te class'larla yapmak daha iyi olabilir.
      // Şimdilik, bonus renk için özel bir değişken adı varsayalım.
      return 'var(--aircraft-sivil-bonus, var(--aircraft-default))'; // Eğer --aircraft-sivil-bonus yoksa default'a düş.
    }
    if (flight.type === 'askeri') {
      return 'var(--aircraft-askeri-bonus, var(--aircraft-default))';
    }
    if (flight.type === 'vip') {
      return 'var(--aircraft-vip-bonus, var(--aircraft-default))';
    }
  
    // Hiçbiri değilse, genel uçak ikonu rengi
    return 'var(--aircraft-default)';
  };
  
  // Bonus renkleri global.css'e eklemeniz gerekecek:
  /*
  :root {
    --aircraft-sivil-bonus: #2196F3;
    --aircraft-askeri-bonus: #F44336;
    --aircraft-vip-bonus: #9C27B0;
    // --aircraft-muttefik-bonus: #4CAF50; // Bu zaten --aircraft-ally ile yönetiliyor olabilir.
  }
  */
  // VEYA daha iyisi, bu bonus renkleri doğrudan tema tanımlarınızın içine yedirin:
  /*
  :root[data-theme="dark"] {
    ...
    --aircraft-sivil: var(--aircraft-sivil-bonus); // veya #2196F3;
    --aircraft-askeri: var(--aircraft-askeri-bonus); // veya #F44336;
    --aircraft-vip: var(--aircraft-vip-bonus);       // veya #9C27B0;
  }
  :root[data-theme="light"] {
    ...
    --aircraft-sivil: var(--aircraft-sivil-bonus);
    --aircraft-askeri: var(--aircraft-askeri-bonus);
    --aircraft-vip: var(--aircraft-vip-bonus);
  }
  etc.
  */
  // Bu durumda getAircraftColorVars içinde sadece type'a göre ilgili değişkeni (örn: var(--aircraft-sivil)) döndürmek yeterli olur.
  // Şimdilik yukarıdaki fallbackli yapıyı bırakıyorum.