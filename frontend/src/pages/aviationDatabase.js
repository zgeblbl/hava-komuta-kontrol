// src/utils/aviationDatabase.js

// --- VERİ KAYNAĞI (Sizin sağladığınız yapı) ---
export const aviationDatabase = {
  airports: {
    // Türkiye
    'LTFM': { code: 'LTFM', name: 'İstanbul Havalimanı', city: 'İstanbul', country: 'Türkiye', lat: 41.2753, lon: 28.7519, type: 'international' },
    'LTFJ': { code: 'LTFJ', name: 'Sabiha Gökçen Havalimanı', city: 'İstanbul', country: 'Türkiye', lat: 40.8983, lon: 29.3092, type: 'international' },
    'LTAC': { code: 'LTAC', name: 'Esenboğa Havalimanı', city: 'Ankara', country: 'Türkiye', lat: 40.1281, lon: 32.9950, type: 'international' },
    'LTAI': { code: 'LTAI', name: 'Antalya Havalimanı', city: 'Antalya', country: 'Türkiye', lat: 36.8987, lon: 30.8005, type: 'international' },
    'LTBJ': { code: 'LTBJ', name: 'Adnan Menderes Havalimanı', city: 'İzmir', country: 'Türkiye', lat: 38.2924, lon: 27.1570, type: 'international' },
    'LTFE': { code: 'LTFE', name: 'Milas-Bodrum Havalimanı', city: 'Bodrum', country: 'Türkiye', lat: 37.2506, lon: 27.6643, type: 'international' },
    'LTFD': { code: 'LTFD', name: 'Dalaman Havalimanı', city: 'Dalaman', country: 'Türkiye', lat: 36.7131, lon: 28.7925, type: 'international' },
    'LTCG': { code: 'LTCG', name: 'Trabzon Havalimanı', city: 'Trabzon', country: 'Türkiye', lat: 40.9951, lon: 39.7897, type: 'domestic' },
    'LTAF': { code: 'LTAF', name: 'Adana Havalimanı', city: 'Adana', country: 'Türkiye', lat: 36.9822, lon: 35.2804, type: 'international' },
    'LTAY': { code: 'LTAY', name: 'Kayseri Havalimanı', city: 'Kayseri', country: 'Türkiye', lat: 38.7704, lon: 35.4954, type: 'domestic' },
    // Avrupa
    'EDDF': { code: 'EDDF', name: 'Frankfurt Havalimanı', city: 'Frankfurt', country: 'Almanya', lat: 50.0379, lon: 8.5622, type: 'international' },
    'LFPG': { code: 'LFPG', name: 'Charles de Gaulle', city: 'Paris', country: 'Fransa', lat: 49.0097, lon: 2.5479, type: 'international' },
    'EGLL': { code: 'EGLL', name: 'Heathrow', city: 'Londra', country: 'İngiltere', lat: 51.4700, lon: -0.4543, type: 'international' },
    'EHAM': { code: 'EHAM', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Hollanda', lat: 52.3105, lon: 4.7683, type: 'international' },
    'LEMD': { code: 'LEMD', name: 'Madrid Barajas', city: 'Madrid', country: 'İspanya', lat: 40.4983, lon: -3.5676, type: 'international' },
    'LIRF': { code: 'LIRF', name: 'Roma Fiumicino', city: 'Roma', country: 'İtalya', lat: 41.8003, lon: 12.2389, type: 'international' },
    'LFML': { code: 'LFML', name: 'Marsilya', city: 'Marsilya', country: 'Fransa', lat: 43.4393, lon: 5.2214, type: 'international' },
    'LOWW': { code: 'LOWW', name: 'Viyana', city: 'Viyana', country: 'Avusturya', lat: 48.1103, lon: 16.5697, type: 'international' },
    'LSZH': { code: 'LSZH', name: 'Zürih', city: 'Zürih', country: 'İsviçre', lat: 47.4647, lon: 8.5492, type: 'international' },
    'EDDM': { code: 'EDDM', name: 'Münih', city: 'Münih', country: 'Almanya', lat: 48.3538, lon: 11.7861, type: 'international' },
    // Ortadoğu
    'OMDB': { code: 'OMDB', name: 'Dubai International', city: 'Dubai', country: 'BAE', lat: 25.2532, lon: 55.3657, type: 'international' },
    'OIII': { code: 'OIII', name: 'Tahran Imam Khomeini', city: 'Tahran', country: 'İran', lat: 35.4161, lon: 51.1522, type: 'international' },
    'LLBG': { code: 'LLBG', name: 'Ben Gurion', city: 'Tel Aviv', country: 'İsrail', lat: 32.0094, lon: 34.8855, type: 'international' },
    'OEJN': { code: 'OEJN', name: 'King Abdulaziz', city: 'Cidde', country: 'Suudi Arabistan', lat: 21.6796, lon: 39.1565, type: 'international' },
    'OKBK': { code: 'OKBK', name: 'Kuwait International', city: 'Kuveyt', country: 'Kuveyt', lat: 29.2268, lon: 47.9689, type: 'international' },
    // Asya
    'ZBAA': { code: 'ZBAA', name: 'Beijing Capital', city: 'Pekin', country: 'Çin', lat: 40.0801, lon: 116.5844, type: 'international' },
    'RJTT': { code: 'RJTT', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japonya', lat: 35.5494, lon: 139.7798, type: 'international' },
    'RKSI': { code: 'RKSI', name: 'Seoul Incheon', city: 'Seul', country: 'Güney Kore', lat: 37.4602, lon: 126.4407, type: 'international' },
    'WSSS': { code: 'WSSS', name: 'Singapore Changi', city: 'Singapur', country: 'Singapur', lat: 1.3644, lon: 103.9915, type: 'international' },
    'VHHH': { code: 'VHHH', name: 'Hong Kong', city: 'Hong Kong', country: 'Çin', lat: 22.3080, lon: 113.9185, type: 'international' },
    // Amerika
    'KJFK': { code: 'KJFK', name: 'John F. Kennedy', city: 'New York', country: 'ABD', lat: 40.6413, lon: -73.7781, type: 'international' },
    'KLAX': { code: 'KLAX', name: 'Los Angeles', city: 'Los Angeles', country: 'ABD', lat: 33.9425, lon: -118.4081, type: 'international' },
    'KATL': { code: 'KATL', name: 'Atlanta', city: 'Atlanta', country: 'ABD', lat: 33.6407, lon: -84.4277, type: 'international' },
    // Askeri Üsler
    'ETAR': { code: 'ETAR', name: 'Ramstein Air Base', city: 'Ramstein', country: 'Almanya', lat: 49.4369, lon: 7.6003, type: 'military' },
    'LTAG': { code: 'LTAG', name: 'İncirlik Air Base', city: 'Adana', country: 'Türkiye', lat: 37.0021, lon: 35.4259, type: 'military' },
    'LGSA': { code: 'LGSA', name: 'Souda Bay', city: 'Girit', country: 'Yunanistan', lat: 35.5317, lon: 24.1497, type: 'military' }
  },
  // YENİ: Hava savunma sistemleri için stratejik konumlar
  airDefenseLocations: {
    'AD-IST-01': { code: 'AD-IST-01', name: 'İstanbul Batı Savunma', city: 'İstanbul', country: 'Türkiye', lat: 41.1234, lon: 28.3456 },
    'AD-IST-02': { code: 'AD-IST-02', name: 'İstanbul Doğu Savunma', city: 'İstanbul', country: 'Türkiye', lat: 41.0567, lon: 29.2345 },
    'AD-ANK-01': { code: 'AD-ANK-01', name: 'Ankara Merkez Savunma', city: 'Ankara', country: 'Türkiye', lat: 39.8765, lon: 32.7890 },
    'AD-ANK-02': { code: 'AD-ANK-02', name: 'Ankara Kuzey Savunma', city: 'Ankara', country: 'Türkiye', lat: 40.2345, lon: 32.9876 },
    'AD-IZM-01': { code: 'AD-IZM-01', name: 'İzmir Körfez Savunma', city: 'İzmir', country: 'Türkiye', lat: 38.5432, lon: 26.9876 },
    'AD-ADA-01': { code: 'AD-ADA-01', name: 'Adana Bölge Savunma', city: 'Adana', country: 'Türkiye', lat: 37.1234, lon: 35.5678 },
    'AD-DYB-01': { code: 'AD-DYB-01', name: 'Diyarbakır Savunma', city: 'Diyarbakır', country: 'Türkiye', lat: 37.9654, lon: 40.3456 },
    'AD-ERZ-01': { code: 'AD-ERZ-01', name: 'Erzurum Doğu Savunma', city: 'Erzurum', country: 'Türkiye', lat: 39.8765, lon: 41.2345 },
    'AD-ANT-01': { code: 'AD-ANT-01', name: 'Antalya Sahil Savunma', city: 'Antalya', country: 'Türkiye', lat: 36.7890, lon: 30.6543 },
    'AD-TRB-01': { code: 'AD-TRB-01', name: 'Trabzon Karadeniz Savunma', city: 'Trabzon', country: 'Türkiye', lat: 41.1234, lon: 39.6789 },
    'AD-VAN-01': { code: 'AD-VAN-01', name: 'Van Sınır Savunma', city: 'Van', country: 'Türkiye', lat: 38.4567, lon: 43.2345 },
    'AD-HAT-01': { code: 'AD-HAT-01', name: 'Hatay Güney Savunma', city: 'Hatay', country: 'Türkiye', lat: 36.3456, lon: 36.1234 },
    // Müttefik hava savunma sistemleri
    'AD-GER-01': { code: 'AD-GER-01', name: 'Ramstein Savunma', city: 'Ramstein', country: 'Almanya', lat: 49.5123, lon: 7.7234 },
    'AD-GRE-01': { code: 'AD-GRE-01', name: 'Girit Savunma', city: 'Girit', country: 'Yunanistan', lat: 35.4567, lon: 24.2345 }
  },
  aircraftModels: {
    sivil: [
      { model: 'Boeing 737-800', cruiseSpeed: 514, maxAltitude: 41000, range: 5765 },
      { model: 'Boeing 737 MAX 8', cruiseSpeed: 521, maxAltitude: 41000, range: 6570 },
      { model: 'Boeing 787-9', cruiseSpeed: 561, maxAltitude: 43000, range: 14140 },
      { model: 'Boeing 777-300ER', cruiseSpeed: 560, maxAltitude: 43100, range: 13650 },
      { model: 'Airbus A320neo', cruiseSpeed: 514, maxAltitude: 39800, range: 6300 },
      { model: 'Airbus A321neo', cruiseSpeed: 514, maxAltitude: 39800, range: 7400 },
            { model: 'Airbus A330-300', cruiseSpeed: 541, maxAltitude: 41450, range: 11750 },
      { model: 'Airbus A350-900', cruiseSpeed: 561, maxAltitude: 43100, range: 15000 },
      { model: 'Airbus A380-800', cruiseSpeed: 561, maxAltitude: 43000, range: 14800 },
      { model: 'Embraer E195-E2', cruiseSpeed: 515, maxAltitude: 41000, range: 4815 },
      { model: 'Boeing 747-8', cruiseSpeed: 564, maxAltitude: 43100, range: 14320 },
      { model: 'Bombardier CRJ900', cruiseSpeed: 515, maxAltitude: 41000, range: 2876 }
    ],
    askeri: [
      { model: 'F-16 Fighting Falcon', cruiseSpeed: 577, maxAltitude: 50000, range: 4220 },
      { model: 'F-35 Lightning II', cruiseSpeed: 630, maxAltitude: 50000, range: 2220 },
      { model: 'Eurofighter Typhoon', cruiseSpeed: 600, maxAltitude: 65000, range: 2900 },
      { model: 'F-15E Strike Eagle', cruiseSpeed: 650, maxAltitude: 65000, range: 3900 },
      { model: 'F-4E Phantom II', cruiseSpeed: 585, maxAltitude: 60000, range: 2600 },
      { model: 'A-10 Thunderbolt II', cruiseSpeed: 381, maxAltitude: 45000, range: 4000 },
      { model: 'C-130 Hercules', cruiseSpeed: 336, maxAltitude: 28000, range: 3800 },
      { model: 'KC-135 Stratotanker', cruiseSpeed: 530, maxAltitude: 50000, range: 2419 },
      { model: 'P-8 Poseidon', cruiseSpeed: 490, maxAltitude: 41000, range: 8300 },
      { model: 'MQ-9 Reaper', cruiseSpeed: 230, maxAltitude: 50000, range: 1850 }
    ],
    vip: [
      { model: 'Gulfstream G650', cruiseSpeed: 562, maxAltitude: 51000, range: 12964 },
      { model: 'Bombardier Global 7500', cruiseSpeed: 561, maxAltitude: 51000, range: 14260 },
      { model: 'Dassault Falcon 8X', cruiseSpeed: 545, maxAltitude: 51000, range: 11945 },
      { model: 'Boeing BBJ 787', cruiseSpeed: 561, maxAltitude: 43000, range: 17500 },
      { model: 'Airbus ACJ320neo', cruiseSpeed: 514, maxAltitude: 41000, range: 11100 },
      { model: 'Cessna Citation X+', cruiseSpeed: 617, maxAltitude: 51000, range: 6408 }
    ],
    muttefik: [
      { model: 'E-3 Sentry (AWACS)', cruiseSpeed: 360, maxAltitude: 35000, range: 9250 },
      { model: 'E-7 Wedgetail', cruiseSpeed: 530, maxAltitude: 41000, range: 7040 },
      { model: 'P-3 Orion', cruiseSpeed: 328, maxAltitude: 28300, range: 4830 },
      { model: 'C-17 Globemaster III', cruiseSpeed: 515, maxAltitude: 45000, range: 5200 },
      { model: 'A400M Atlas', cruiseSpeed: 485, maxAltitude: 40000, range: 8700 },
      { model: 'Boeing KC-46 Pegasus', cruiseSpeed: 530, maxAltitude: 40100, range: 11830 }
    ],
    'hava-savunma': [
      { model: 'Patriot Missile System', cruiseSpeed: 0, maxAltitude: 0, range: 160 },
      { model: 'S-400 Triumf', cruiseSpeed: 0, maxAltitude: 0, range: 400 },
      { model: 'HAWK XXI', cruiseSpeed: 0, maxAltitude: 0, range: 50 },
      { model: 'Hisar-A+', cruiseSpeed: 0, maxAltitude: 0, range: 15 },
      { model: 'Hisar-O+', cruiseSpeed: 0, maxAltitude: 0, range: 30 },
      { model: 'SAMP/T Aster 30', cruiseSpeed: 0, maxAltitude: 0, range: 120 }
    ]
  },
  airlines: {
    sivil: [
      { code: 'THY', callsignPrefix: 'TK', name: 'Turkish Airlines', country: 'Türkiye' },
      { code: 'PGT', callsignPrefix: 'PC', name: 'Pegasus Airlines', country: 'Türkiye' },
      { code: 'SXS', callsignPrefix: 'XQ', name: 'SunExpress', country: 'Türkiye' },
      { code: 'AJA', callsignPrefix: 'VF', name: 'AnadoluJet', country: 'Türkiye' },
      { code: 'DLH', callsignPrefix: 'LH', name: 'Lufthansa', country: 'Almanya' },
      { code: 'BAW', callsignPrefix: 'BA', name: 'British Airways', country: 'İngiltere' },
      { code: 'AFR', callsignPrefix: 'AF', name: 'Air France', country: 'Fransa' },
      { code: 'KLM', callsignPrefix: 'KL', name: 'KLM', country: 'Hollanda' },
      { code: 'UAE', callsignPrefix: 'EK', name: 'Emirates', country: 'BAE' },
      { code: 'QTR', callsignPrefix: 'QR', name: 'Qatar Airways', country: 'Katar' },
      { code: 'SIA', callsignPrefix: 'SQ', name: 'Singapore Airlines', country: 'Singapur' },
      { code: 'ANA', callsignPrefix: 'NH', name: 'All Nippon Airways', country: 'Japonya' }
    ],
    askeri: [
      { code: 'TUAF', callsignPrefix: 'HVKK', name: 'Türk Hava Kuvvetleri', country: 'Türkiye' },
      { code: 'USAF', callsignPrefix: 'REACH', name: 'US Air Force (AMC)', country: 'ABD' },
      { code: 'RAF', callsignPrefix: 'RRR', name: 'Royal Air Force', country: 'İngiltere' },
      { code: 'GAF', callsignPrefix: 'GAF', name: 'German Air Force', country: 'Almanya' },
      { code: 'FAF', callsignPrefix: 'FAF', name: 'French Air Force', country: 'Fransa' },
      { code: 'NATO', callsignPrefix: 'NATO', name: 'NATO Combined Operations', country: 'Çokuluslu'}
    ]
  },
  missionTypes: {
    sivil: ['PASSENGER_TRANSPORT', 'CARGO_FLIGHT'],
    askeri: ['PATROL', 'INTERCEPT', 'TRAINING', 'TRANSPORT', 'RECON', 'CAP (Combat Air Patrol)'],
    vip: ['VIP_TRANSPORT_DOMESTIC', 'VIP_TRANSPORT_INTERNATIONAL'],
    muttefik: ['AWACS_ORBIT', 'TANKER_SUPPORT', 'JOINT_TRANSPORT', 'SURVEILLANCE_MISSION', 'EXERCISE_PARTICIPATION'],
    'hava-savunma': ['ACTIVE_DEFENSE', 'SYSTEM_STANDBY', 'OPERATIONAL_MAINTENANCE']
  },
  flightStatuses: ['enroute', 'scheduled', 'landed', 'delayed', 'active']
};

// --- YARDIMCI FONKSİYONLAR ---
const getRandomElement = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomCoordOffset = (range = 0.5) => (Math.random() - 0.5) * 2 * range;

export function getDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const generateRandomTrack = (startLat, startLon, endLat, endLon, numWaypoints = 3, isPatrol = false, patrolRadiusKm = 100) => {
  const track = [{ lat: parseFloat(startLat.toFixed(4)), lon: parseFloat(startLon.toFixed(4)) }];
  
  if (isPatrol) {
    const patrolRadiusDeg = patrolRadiusKm / 111;
    for (let i = 1; i <= numWaypoints + 1; i++) {
      const angle = (i / (numWaypoints + 2)) * 2 * Math.PI + (Math.random() - 0.5) * 0.8;
      const currentRadius = patrolRadiusDeg * (0.6 + Math.random() * 0.4);
      track.push({
        lat: parseFloat((startLat + currentRadius * Math.sin(angle)).toFixed(4)),
        lon: parseFloat((startLon + currentRadius * Math.cos(angle)).toFixed(4)),
      });
    }
    track.push({ lat: parseFloat(startLat.toFixed(4)), lon: parseFloat(startLon.toFixed(4)) });
    return track;
  }

  // Normal rota için - basit doğrusal interpolasyon
  if (startLat === endLat && startLon === endLon) return track;

  for (let i = 1; i <= numWaypoints; i++) {
    const progress = i / (numWaypoints + 1);
    const lat = startLat + (endLat - startLat) * progress;
    const lon = startLon + (endLon - startLon) * progress;
    track.push({ lat: parseFloat(lat.toFixed(4)), lon: parseFloat(lon.toFixed(4)) });
  }

  track.push({ lat: parseFloat(endLat.toFixed(4)), lon: parseFloat(endLon.toFixed(4)) });
  return track;
};

let flightIdCounter = Math.floor(Math.random() * 10000);

// Havalimanı yoğunluğunu kontrol eden fonksiyon
const isAirportAvailable = (flights, airportCode) => {
  const airportFlights = flights.filter(f => 
    (f.origin === airportCode || f.destination === airportCode) && 
    ['scheduled', 'enroute', 'active'].includes(f.status)
  );
  return airportFlights.length < 2;
};

// --- ANA UÇUŞ ÜRETİCİ FONKSİYON ---
export const generateRandomFlight = (existingFlights = []) => {
  const flightTypes = Object.keys(aviationDatabase.aircraftModels);
  const selectedFlightType = getRandomElement(flightTypes);
  const modelsInType = aviationDatabase.aircraftModels[selectedFlightType];
  const aircraftData = getRandomElement(modelsInType);
  if (!aircraftData) return null;

  let airlineData;
  if (selectedFlightType === 'sivil' && aviationDatabase.airlines.sivil.length > 0) {
    airlineData = getRandomElement(aviationDatabase.airlines.sivil);
  } else if ((selectedFlightType === 'askeri' || selectedFlightType === 'muttefik') && aviationDatabase.airlines.askeri.length > 0) {
    if (selectedFlightType === 'muttefik' && aircraftData.model.includes('AWACS')) {
      airlineData = aviationDatabase.airlines.askeri.find(a => a.code === 'NATO') || getRandomElement(aviationDatabase.airlines.askeri);
    } else {
      airlineData = getRandomElement(aviationDatabase.airlines.askeri);
    }
  } else if (selectedFlightType === 'vip') {
    airlineData = { code: 'VIP', callsignPrefix: 'TC-V', name: 'VIP Flight', country: 'Türkiye' };
        if (Math.random() < 0.5) airlineData.country = 'ABD';
  } else {
    airlineData = { code: 'SYS', callsignPrefix: 'SYS', name: 'System', country: 'Bilinmiyor' };
  }
  if (!airlineData) airlineData = { code: 'UNK', callsignPrefix: 'UNK', name: 'Unknown Operator', country: 'Bilinmiyor' };

  let originAirport, destinationAirport, destinationName;
  const airportList = Object.values(aviationDatabase.airports);
  
  if (selectedFlightType === 'hava-savunma') {
    // HAVA SAVUNMA SİSTEMLERİ İÇİN ÖZEL MANTIK - STRATEJİK KONUMLAR
    const defenseLocationList = Object.values(aviationDatabase.airDefenseLocations);
    const defenseLocation = getRandomElement(defenseLocationList);
    
    if (!defenseLocation) return null;
    
    // Hava savunma sistemleri için özel konum ve bilgiler
    originAirport = {
      code: defenseLocation.code,
      name: defenseLocation.name,
      city: defenseLocation.city,
      country: defenseLocation.country,
      lat: defenseLocation.lat,
      lon: defenseLocation.lon,
      type: 'air-defense'
    };
    
    destinationAirport = originAirport;
    destinationName = getRandomElement(aviationDatabase.missionTypes['hava-savunma']) || 'ACTIVE_DEFENSE';
  } else {
    // Diğer uçuş tipleri için normal havalimanı seçimi
    originAirport = getRandomElement(airportList.filter(a => {
      const isAvailable = isAirportAvailable(existingFlights, a.code);
      if (selectedFlightType === 'askeri' || selectedFlightType === 'muttefik') {
        return isAvailable && (a.type === 'military' || Math.random() < 0.1);
      }
      return isAvailable && (a.type === 'international' || a.type === 'domestic');
    }));

    if (!originAirport) return null;

    const isMissionFlight = (selectedFlightType === 'askeri' || selectedFlightType === 'muttefik') && Math.random() < 0.4;
    
    if (isMissionFlight) {
      destinationAirport = originAirport;
      destinationName = getRandomElement(aviationDatabase.missionTypes[selectedFlightType]) || 'SPECIAL_MISSION';
    } else {
      destinationAirport = getRandomElement(airportList.filter(a =>
        a.code !== originAirport?.code && 
        isAirportAvailable(existingFlights, a.code) &&
        ((selectedFlightType === 'askeri' || selectedFlightType === 'muttefik') ? 
          (a.type === 'military' || Math.random() < 0.1) :
          (a.type === 'international' || a.type === 'domestic'))
      ));
      
      if (!destinationAirport) return null;
      destinationName = destinationAirport.code;
    }
  }

  let flightStatus = selectedFlightType === 'hava-savunma' ? 'active' : getRandomElement(aviationDatabase.flightStatuses.filter(s => s !== 'active'));

  const now = new Date();
  const departureTime = new Date(now);
  let estimatedArrivalTime;
  
  const distanceKm = (!destinationAirport || destinationAirport.code === originAirport.code || destinationName.includes('MISSION') || destinationName.includes('PATROL'))
    ? (selectedFlightType === 'hava-savunma' ? 0 : getRandomInt(100, 1500))
    : getDistance(originAirport.lat, originAirport.lon, destinationAirport.lat, destinationAirport.lon);
  
  const avgCruiseSpeedKts = aircraftData.cruiseSpeed;
  const flightDurationHours = (avgCruiseSpeedKts > 0 && distanceKm > 0)
    ? (distanceKm / (avgCruiseSpeedKts * 1.852)) + 0.4
    : getRandomInt(1, (selectedFlightType === 'askeri' && aircraftData.model.includes('C-130')) ? 6 : 3);

  if (flightStatus === 'scheduled') {
    departureTime.setMinutes(now.getMinutes() + getRandomInt(10, 180));
    estimatedArrivalTime = new Date(departureTime.getTime() + flightDurationHours * 60 * 60 * 1000);
  } else if (flightStatus === 'landed') {
    estimatedArrivalTime = new Date(now.getTime() - getRandomInt(5, 90) * 60 * 1000);
    departureTime.setTime(estimatedArrivalTime.getTime() - flightDurationHours * 60 * 60 * 1000);
  } else {
    departureTime.setMinutes(now.getMinutes() - getRandomInt(10, Math.floor(flightDurationHours * 60 * 0.85)));
    estimatedArrivalTime = new Date(departureTime.getTime() + flightDurationHours * 60 * 60 * 1000);
    if (flightStatus === 'delayed') {
      const delayMinutes = getRandomInt(15, 120);
      departureTime.setMinutes(departureTime.getMinutes() + delayMinutes);
      estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + delayMinutes);
    }
  }

  // Callsign oluşturma
  let callsign;
  if (selectedFlightType === 'hava-savunma') {
    // Hava savunma sistemleri için özel callsign
    const systemPrefix = aircraftData.model.includes('S-400') ? 'S4' : 
                        aircraftData.model.includes('Patriot') ? 'PAT' : 
                        aircraftData.model.includes('HAWK') ? 'HWK' : 
                        aircraftData.model.includes('Hisar') ? 'HSR' : 'ADS';
    callsign = `${systemPrefix}-${originAirport.code.split('-')[2]}`;
  } else {
    const callsignNumberPart = getRandomInt(1, 9999).toString().padStart(getRandomInt(2, 4), '0');
    let finalCallsignPrefix = airlineData.callsignPrefix;
    if (selectedFlightType === 'vip' && airlineData.callsignPrefix === 'TC-V') {
      finalCallsignPrefix = 'TC-' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      callsign = finalCallsignPrefix;
    } else {
      callsign = `${finalCallsignPrefix}${callsignNumberPart}`.slice(0, 7).toUpperCase();
    }
  }

  // Başlangıç konumu her zaman kalkış havalimanı/konumu olacak
  let currentLat = originAirport.lat;
  let currentLon = originAirport.lon;
  let altitudeFt = 0;
  let speedKts = 0;
  let headingDeg = getRandomInt(0, 359);

  // Uçuş durumuna göre pozisyon ayarlama
  if (flightStatus === 'enroute' || (flightStatus === 'delayed' && new Date() > departureTime)) {
    const flightProgress = Math.max(0.02, Math.min((now.getTime() - departureTime.getTime()) / (estimatedArrivalTime.getTime() - departureTime.getTime()), 0.98));
    
    if (destinationAirport && originAirport.code !== destinationAirport.code) {
      currentLat = originAirport.lat + (destinationAirport.lat - originAirport.lat) * flightProgress;
      currentLon = originAirport.lon + (destinationAirport.lon - originAirport.lon) * flightProgress;
      const dy = destinationAirport.lat - currentLat;
      const dx = destinationAirport.lon - currentLon;
      headingDeg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
    } else {
      currentLat += (Math.random() - 0.5) * 0.5 * flightProgress;
      currentLon += (Math.random() - 0.5) * 0.5 * flightProgress;
    }

    const maxAlt = aircraftData.maxAltitude;
    const cruiseSpd = aircraftData.cruiseSpeed;
    if (flightProgress < 0.15) {
      altitudeFt = Math.round(maxAlt * (flightProgress / 0.15));
      speedKts = Math.round(cruiseSpd * 0.5 + (cruiseSpd * 0.5 * (flightProgress / 0.15)));
    } else if (flightProgress > 0.85 && destinationAirport) {
      altitudeFt = Math.round(maxAlt * ((1 - flightProgress) / 0.15));
      speedKts = Math.round(cruiseSpd * 0.5 + (cruiseSpd * 0.5 * ((1 - flightProgress) / 0.15)));
    } else {
      altitudeFt = getRandomInt(Math.floor(maxAlt * 0.9), maxAlt);
      speedKts = getRandomInt(Math.floor(cruiseSpd * 0.9), cruiseSpd);
    }
    altitudeFt = Math.max(500, Math.min(altitudeFt, maxAlt));
    speedKts = Math.max(100, Math.min(speedKts, cruiseSpd + 30));
  } else if (flightStatus === 'landed' && destinationAirport) {
    currentLat = destinationAirport.lat;
    currentLon = destinationAirport.lon;
  } else if (flightStatus === 'scheduled' || selectedFlightType === 'hava-savunma') {
    // Scheduled uçaklar ve hava savunma sistemleri başlangıç konumunda
    currentLat = originAirport.lat;
    currentLon = originAirport.lon;
  }

  const isStationaryOrPatrol = selectedFlightType === 'hava-savunma' || destinationName.includes('MISSION') || destinationName.includes('PATROL');
  const trackTargetLat = (isStationaryOrPatrol || !destinationAirport) ? originAirport.lat : destinationAirport.lat;
  const trackTargetLon = (isStationaryOrPatrol || !destinationAirport) ? originAirport.lon : destinationAirport.lon;
  
  const track = generateRandomTrack(
    originAirport.lat, originAirport.lon,
    trackTargetLat, trackTargetLon,
    getRandomInt(2, 5),
    isStationaryOrPatrol && selectedFlightType !== 'hava-savunma',
    selectedFlightType === 'hava-savunma' ? aircraftData.range : getRandomInt(80, 200)
  );

  let isAlly = false;
  if (selectedFlightType === 'muttefik') {
    isAlly = true;
  } else if (selectedFlightType === 'askeri' && (airlineData.country === 'Türkiye' || airlineData.country === 'ABD' || airlineData.country === 'Almanya' || airlineData.country === 'İngiltere')) {
    isAlly = true;
  } else if (selectedFlightType === 'hava-savunma' && originAirport.country === 'Türkiye') {
    isAlly = true;
  } else if (selectedFlightType === 'vip' && (airlineData.country === 'Türkiye' || airlineData.country === 'ABD')) {
    isAlly = true;
  }

  flightIdCounter++;
  const flightId = `${callsign.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString().slice(-5)}-${flightIdCounter}`;

  return {
    id: flightId,
    callsign,
    model: aircraftData.model,
    type: selectedFlightType,
    origin: originAirport.code,
    origin_city: originAirport.city,
    origin_country: originAirport.country,
    destination: destinationName,
    destination_city: destinationAirport?.city || (destinationName.includes('MISSION') ? 'Görev Alanı' : 'Bilinmiyor'),
    destination_country: destinationAirport?.country || originAirport.country,
    departureTime: departureTime.toISOString(),
    estimatedArrivalTime: estimatedArrivalTime.toISOString(),
    altitude: Math.round(altitudeFt),
    speed: Math.round(speedKts),
    heading: parseFloat(headingDeg.toFixed(1)),
    track,
    latitude: parseFloat(currentLat.toFixed(4)),
    longitude: parseFloat(currentLon.toFixed(4)),
    status: flightStatus,
    isAlly,
    isDefenseSystem: selectedFlightType === 'hava-savunma',
    distance: distanceKm,
    flightDurationMinutes: Math.round(flightDurationHours * 60)
  };
};

// --- BAŞLANGIÇ UÇUŞLARI ---
const numberOfInitialFlights = getRandomInt(15, 25);
export let initialFlights = [];

// Önce normal uçuşları oluştur
for (let i = 0; i < numberOfInitialFlights; i++) {
  const newFlight = generateRandomFlight(initialFlights);
  if (newFlight && newFlight.type !== 'hava-savunma') {
    initialFlights.push(newFlight);
  }
}

// Sonra hava savunma sistemlerini ekle (3-5 adet)
const numberOfAirDefenseSystems = getRandomInt(3, 5);
for (let i = 0; i < numberOfAirDefenseSystems; i++) {
  // Özel olarak hava savunma sistemi oluştur
  const flightTypes = ['hava-savunma'];
  const selectedFlightType = flightTypes[0];
  const modelsInType = aviationDatabase.aircraftModels[selectedFlightType];
  const aircraftData = getRandomElement(modelsInType);
  
  if (aircraftData) {
    const defenseLocationList = Object.values(aviationDatabase.airDefenseLocations);
    const defenseLocation = defenseLocationList[i % defenseLocationList.length]; // Farklı lokasyonlar kullan
    
    const originAirport = {
      code: defenseLocation.code,
      name: defenseLocation.name,
      city: defenseLocation.city,
      country: defenseLocation.country,
      lat: defenseLocation.lat,
      lon: defenseLocation.lon,
      type: 'air-defense'
    };
    
    const systemPrefix = aircraftData.model.includes('S-400') ? 'S4' : 
                        aircraftData.model.includes('Patriot') ? 'PAT' : 
                        aircraftData.model.includes('HAWK') ? 'HWK' : 
                        aircraftData.model.includes('Hisar') ? 'HSR' : 'ADS';
    const callsign = `${systemPrefix}-${originAirport.code.split('-')[2]}`;
    
    flightIdCounter++;
    const flightId = `${callsign.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString().slice(-5)}-${flightIdCounter}`;
    
    const airDefenseSystem = {
      id: flightId,
      callsign,
      model: aircraftData.model,
      type: selectedFlightType,
      origin: originAirport.code,
      origin_city: originAirport.city,
      origin_country: originAirport.country,
      destination: 'ACTIVE_DEFENSE',
      destination_city: 'Savunma Alanı',
      destination_country: originAirport.country,
      departureTime: new Date().toISOString(),
      estimatedArrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 saat sonra
      altitude: 0,
      speed: 0,
      heading: 0,
      track: [{ lat: originAirport.lat, lon: originAirport.lon }],
      latitude: parseFloat(originAirport.lat.toFixed(4)),
      longitude: parseFloat(originAirport.lon.toFixed(4)),
      status: 'active',
      isAlly: originAirport.country === 'Türkiye',
      isDefenseSystem: true,
      distance: 0,
      flightDurationMinutes: 0
    };
    
    initialFlights.push(airDefenseSystem);
  }
}

console.log(`Başlangıçta ${initialFlights.filter(f => f.type !== 'hava-savunma').length} adet uçuş ve ${initialFlights.filter(f => f.type === 'hava-savunma').length} adet hava savunma sistemi oluşturuldu.`);

// Havalimanlarını da export edelim
export const AIRPORTS_DATA = aviationDatabase.airports;

// Hava savunma lokasyonlarını da export edelim
export const AIR_DEFENSE_LOCATIONS = aviationDatabase.airDefenseLocations;

// Default export
export default aviationDatabase;