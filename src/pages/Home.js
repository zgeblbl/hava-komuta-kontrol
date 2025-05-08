import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="home-container"> {/* Bu class için CSS tanımlamalarınız olabilir */}
      <h1>Hava Komuta Kontrol Sistemine Hoş Geldiniz</h1>
      <p>
        Bu sistem, hava araçlarının kontrolü ve yönetimi için geliştirilmiş
        kapsamlı bir platformdur.
      </p>
      <div className="cta-buttons">
        <Link to="/login" className="btn btn-primary">
          Giriş Yap
        </Link>
        {/* Eğer kayıt özelliği varsa:
        <Link to="/register" className="btn btn-secondary">
          Kayıt Ol
        </Link>
        */}
      </div>
      <div className="features">
        <div className="feature-card">
          {/* "Gerçek Zamanlı İzleme" başlığını veya tüm kartı link yapabilirsiniz */}
          <Link to="/flight-control" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>Gerçek Zamanlı İzleme</h3>
            <p>Hava araçlarınızı anlık olarak takip edin ve kontrol edin.</p>
            {/* İsterseniz buraya bir "Görüntüle ->" gibi bir buton da ekleyebilirsiniz */}
            {/* <button className="btn btn-info">Haritayı Görüntüle</button> */}
          </Link>
        </div>
        <div className="feature-card">
          {/* Diğer özellikler için de linkler eklenebilir */}
          <h3>Detaylı Raporlama</h3>
          <p>Uçuş verilerini analiz edin ve detaylı raporlar oluşturun. (Yakında)</p>
        </div>
        <div className="feature-card">
          <h3>Gelişmiş Kontrol</h3>
          <p>Araçlarınızı uzaktan kontrol edin ve görevler atayın. (Yakında)</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home; 