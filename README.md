# 🛰️ Hava Komuta Kontrol – Backend

Bu proje FastAPI ile yazılmış bir backend sistemidir. Projeyi çalıştırmak için aşağıdaki adımları izleyin.

---

## 🚀 Projeyi Çalıştırmak İçin Adımlar

### 1. Reponun Klonlanması

Terminal veya komut istemcisine aşağıdaki komutları girin:

```bash
git clone https://github.com/zgeblbl/hava-komuta-kontrol.git
cd hava-komuta-kontrol
git checkout backend
```

---

### 2. Sanal Ortam Oluşturma

```bash
python -m venv venv
```

---

### 3. Sanal Ortamı Aktifleştirme

Windows PowerShell veya CMD kullanıyorsanız:

```bash
.env\Scripts\Activate
```

---

### 4. Gerekli Kütüphaneleri Kurma

```bash
pip install -r requirements.txt
```

---

### 5. Uygulamayı Başlatma

```bash
uvicorn app.main:app --reload
```

---

### 6. Swagger UI (API arayüzü)

Tarayıcıdan şu adresi açın:

[http://localhost:8000/docs](http://localhost:8000/docs)

---

Hepsi bu kadar ✅
