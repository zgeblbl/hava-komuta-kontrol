/*export const initialFlights = [
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
  */
 
// src/mockFlightData.js

// src/utils/aviationDatabase.js dosyasından başlangıç uçuşlarını import et
// DİKKAT: Eğer aviationDatabase.js dosyası 'utils' klasöründe değil de
// direkt 'src' altında ise yolu './aviationDatabase' olarak değiştirin.
import { initialFlights as generatedInitialFlights } from './aviationDatabase';

// 1. Başlangıç Uçuşları
// aviationDatabase.js'den (içindeki flightDataGenerator mantığıyla) gelen başlangıç uçuşlarını kullanıyoruz.
export const initialFlights = generatedInitialFlights;

/**
 * Uçak ikonları için CSS renk değişkenlerini döndürür.
 * @param {object} flight - Uçuş objesi (aviationDatabase.js/generateRandomFlight'tan gelen yapıya uygun)
 * @param {boolean} isSelected - Uçağın seçili olup olmadığı
 * @param {string} theme - Aktif tema (Bu parametre doğrudan kullanılmıyor, CSS değişkenleri temaya göre ayarlı)
 * @returns {string} - CSS renk değişkeni (örn: 'var(--aircraft-sivil)')
 */
export const getAircraftColorVars = (flight, isSelected, theme) => {
  if (!flight || typeof flight.type === 'undefined') {
    return 'var(--aircraft-default)';
  }

  if (isSelected) {
    return 'var(--aircraft-selected)';
  }

  if (flight.isDefenseSystem || flight.type === 'hava-savunma') {
    return 'var(--defense-system)';
  }

  switch (flight.type.toLowerCase()) {
    case 'sivil':
      return 'var(--aircraft-sivil)';
    case 'askeri':
      return 'var(--aircraft-askeri)';
    case 'vip':
      return 'var(--aircraft-vip)';
    case 'muttefik':
      return 'var(--aircraft-ally)';
    default:
      return 'var(--aircraft-default)';
  }
};

// ÖRNEK CSS Değişkenleri (global.css veya tema dosyanıza eklenmeli)
/*
:root[data-theme="dark"] {
  --aircraft-default: #00BFFF;
  --aircraft-selected: #FF4500;
  --aircraft-sivil: #64B5F6;
  --aircraft-askeri: #E57373;
  --aircraft-vip: #BA68C8;
  --aircraft-ally: #32CD32;
  --defense-system: #DC143C;

  --flight-path-default: rgba(0, 191, 255, 0.6);
  --flight-path-selected: rgba(255, 69, 0, 0.9);

  --airport-icon-international: rgba(100, 150, 255, 0.9);
  --airport-icon-domestic: rgba(150, 200, 100, 0.9);
  --airport-icon-military: rgba(255, 100, 100, 0.9);
  --airport-icon-other: rgba(180, 180, 180, 0.8);
}

// Diğer temalar (light, military) için de benzer değişkenler tanımlanmalı.
*/