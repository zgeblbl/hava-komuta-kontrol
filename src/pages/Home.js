import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Hava Komuta Kontrol Sistemine Hoş Geldiniz</h1>
      <p>
        Bu sistem, hava araçlarının kontrolü ve yönetimi için geliştirilmiş
        kapsamlı bir platformdur.
      </p>
      <div className="cta-buttons">
        <Link to="/login" className="btn btn-primary">
          Giriş Yap
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Kayıt Ol
        </Link>
      </div>
      <div className="features">
        <div className="feature-card">
          <h3>Gerçek Zamanlı İzleme</h3>
          <p>Hava araçlarınızı anlık olarak takip edin ve kontrol edin.</p>
        </div>
        <div className="feature-card">
          <h3>Detaylı Raporlama</h3>
          <p>Uçuş verilerini analiz edin ve detaylı raporlar oluşturun.</p>
        </div>
        <div className="feature-card">
          <h3>Gelişmiş Kontrol</h3>
          <p>Araçlarınızı uzaktan kontrol edin ve görevler atayın.</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 