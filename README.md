# Hava Komuta Kontrol Sistemi

Bu proje, hava araçlarının ve havaalanlarının yönetimi için geliştirilmiş bir API sistemidir. FastAPI framework'ü kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- Hava aracı yönetimi (ekleme, güncelleme, silme, listeleme)
- Havaalanı yönetimi (ekleme, güncelleme, silme, listeleme)
- Kullanıcı kimlik doğrulama ve yetkilendirme
- PostgreSQL veritabanı entegrasyonu
- CORS desteği
- Swagger/OpenAPI dokümantasyonu

## 📋 Gereksinimler

- Python 3.8+
- PostgreSQL
- pip (Python paket yöneticisi)

## 🛠️ Kurulum

1. Projeyi klonlayın:
```bash
git clone [proje-url]
cd hava-komuta-kontrol
```

2. Sanal ortam oluşturun ve aktifleştirin:
```bash
python -m venv venv
# Windows için:
venv\Scripts\activate
# Linux/Mac için:
source venv/bin/activate
```

3. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

4. `.env` dosyası oluşturun ve veritabanı bağlantı bilgilerinizi ekleyin:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key
```

5. Veritabanını oluşturun:
```bash
# PostgreSQL'de yeni bir veritabanı oluşturun
createdb dbname
```

6. Uygulamayı başlatın:
```bash
uvicorn app.main:app --reload
```

## 🔌 API Endpoints

### Kimlik Doğrulama (`/api/auth`)

#### Kullanıcı Kaydı
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "testuser",
    "email": "user@example.com",
    "password": "strongpassword123"
}
```

Yanıt:
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "testuser",
    "email": "user@example.com",
    "role": "user",
    "created_at": "2024-04-19T12:00:00"
}
```

#### Kullanıcı Girişi
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=testuser&password=strongpassword123
```

Yanıt:
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
}
```

### Hava Araçları (`/api/aircrafts`)

#### Hava Aracı Listesi
```http
GET /api/aircrafts
Authorization: Bearer <token>
```

Yanıt:
```json
[
    {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "callsign": "THY123",
        "type": "F-16",
        "status": "active",
        "latitude": 41.2751,
        "longitude": 28.7519,
        "altitude": 10000,
        "speed": 450,
        "heading": 180,
        "departure_airport_id": "123e4567-e89b-12d3-a456-426614174001",
        "destination_airport_id": "123e4567-e89b-12d3-a456-426614174002",
        "created_at": "2024-04-19T12:00:00"
    }
]
```

#### Yeni Hava Aracı Ekleme
```http
POST /api/aircrafts
Authorization: Bearer <token>
Content-Type: application/json

{
    "callsign": "THY456",
    "type": "F-35",
    "status": "active",
    "latitude": 41.2751,
    "longitude": 28.7519,
    "altitude": 12000,
    "speed": 500,
    "heading": 90,
    "departure_airport_id": "123e4567-e89b-12d3-a456-426614174001",
    "destination_airport_id": "123e4567-e89b-12d3-a456-426614174002"
}
```

Yanıt:
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "callsign": "THY456",
    "type": "F-35",
    "status": "active",
    "latitude": 41.2751,
    "longitude": 28.7519,
    "altitude": 12000,
    "speed": 500,
    "heading": 90,
    "departure_airport_id": "123e4567-e89b-12d3-a456-426614174001",
    "destination_airport_id": "123e4567-e89b-12d3-a456-426614174002",
    "created_at": "2024-04-19T12:00:00"
}
```

#### Hava Aracı Güncelleme
```http
PUT /api/aircrafts/{aircraft_id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "status": "jammed",
    "altitude": 15000,
    "speed": 600,
    "heading": 270
}
```

Yanıt:
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "callsign": "THY456",
    "type": "F-35",
    "status": "jammed",
    "latitude": 41.2751,
    "longitude": 28.7519,
    "altitude": 15000,
    "speed": 600,
    "heading": 270,
    "departure_airport_id": "123e4567-e89b-12d3-a456-426614174001",
    "destination_airport_id": "123e4567-e89b-12d3-a456-426614174002",
    "created_at": "2024-04-19T12:00:00"
}
```

### Havaalanları (`/api/airports`)

#### Havaalanı Listesi
```http
GET /api/airports?skip=0&limit=10
Authorization: Bearer <token>
```

Yanıt:
```json
[
    {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "icao_code": "LTFM",
        "iata_code": "IST",
        "name": "İstanbul Havalimanı",
        "city": "İstanbul",
        "country": "Türkiye",
        "latitude": 41.2751,
        "longitude": 28.7519,
        "elevation": 99
    }
]
```

#### Yeni Havaalanı Ekleme
```http
POST /api/airports
Authorization: Bearer <token>
Content-Type: application/json

{
    "icao_code": "LTAC",
    "iata_code": "ESB",
    "name": "Ankara Esenboğa Havalimanı",
    "city": "Ankara",
    "country": "Türkiye",
    "latitude": 40.1281,
    "longitude": 32.9951,
    "elevation": 953
}
```

Yanıt:
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "icao_code": "LTAC",
    "iata_code": "ESB",
    "name": "Ankara Esenboğa Havalimanı",
    "city": "Ankara",
    "country": "Türkiye",
    "latitude": 40.1281,
    "longitude": 32.9951,
    "elevation": 953
}
```

#### Havaalanı Güncelleme
```http
PUT /api/airports/{airport_id}
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Ankara Esenboğa Uluslararası Havalimanı",
    "elevation": 954
}
```

Yanıt:
```json
{
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "icao_code": "LTAC",
    "iata_code": "ESB",
    "name": "Ankara Esenboğa Uluslararası Havalimanı",
    "city": "Ankara",
    "country": "Türkiye",
    "latitude": 40.1281,
    "longitude": 32.9951,
    "elevation": 954
}
```

## 📚 API Dokümantasyonu

API dokümantasyonuna aşağıdaki URL'lerden erişebilirsiniz:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Şifre hashleme (bcrypt)
- CORS koruması
- Rate limiting

## 🧪 Test

Testleri çalıştırmak için:
```bash
pytest
```

## 📝 Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.
