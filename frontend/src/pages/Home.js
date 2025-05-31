import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/HomePage.css';

import { 
  FaBroadcastTower, 
  FaChartPie, 
  FaTasks, 
  FaSignInAlt, 
  FaPlane, 
  FaMapMarkedAlt, 
  FaDatabase,
  FaArrowRight
} from 'react-icons/fa';

function Home() {
  return (
    <>
      <div className="homepage">
        <div className="login-bar">
          <div className="login-bar-content">
            <span className="login-text">Sisteme erişim:</span>
            <Link to="/login" className="login-button">
              <FaSignInAlt /> Giriş Yap
            </Link>
          </div>
        </div>

        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="live-indicator">
              <div className="pulse"></div>
              <span className="live-text">CANLI İZLEME AKTİF</span>
            </div>
            <h1 className="hero-title">Hava Sahasında Tam Kontrol ve Üstünlük</h1>
            <p className="hero-subtitle">
              Gelişmiş radar sistemleri ve gerçek zamanlı veri akışı ile her an, her uçuşu 
              kesintisiz izleyin. Askeri ve sivil hava sahası kontrolünde yeni nesil teknoloji.
            </p>
            <div className="hero-cta-buttons">
              <Link to="/login" className="btn btn-primary btn-hero">
                <FaPlane /> Kontrol Paneline Geç
              </Link>
            </div>
          </div>
        </section>

        <section className="value-prop-section">
          <h2 className="section-title">Neden Bu Sistem?</h2>
          <p className="section-subtitle">
            Hava sahası kontrolünde en üst düzey güvenlik, verimlilik ve analiz imkanları için 
            tasarlanmış kapsamlı çözüm
          </p>
          <div className="value-points-grid">
            <div className="value-point">
              <FaBroadcastTower className="value-icon" />
              <h4>Kesintisiz İzleme</h4>
              <p>Geniş kapsama alanıyla tüm hava hareketlerini 7/24 anlık olarak takip edin. 
              İleri radar teknolojisi ile en zorlu hava koşullarında bile maksimum görünürlük.</p>
            </div>
            <div className="value-point">
              <FaChartPie className="value-icon" />
              <h4>Stratejik Analiz</h4>
              <p>Gelişmiş algoritma ve yapay zeka destekli analiz araçlarıyla uçuş verileri üzerinde 
              derinlemesine inceleme yapın. Tehdit analizleri ve optimizasyon için veri odaklı karar alma.</p>
            </div>
            <div className="value-point">
              <FaTasks className="value-icon" />
              <h4>Etkin Görev Yönetimi</h4>
              <p>Operasyonel planlarınızı kolayca oluşturun, atayın ve takip edin. Koordinasyonu 
              artırın, görev atamalarını optimize edin ve anlık geri bildirim alın.</p>
            </div>
          </div>
        </section>

        <section className="detailed-features-section">
          <div className="feature-detail-item">
            <div className="feature-detail-text">
              <h3>Gerçek Zamanlı Uçuş Takibi</h3>
              <p>Milisaniye hassasiyetinde konum, hız, yükseklik ve yön bilgileriyle hava sahasına tam hakimiyet. 
              Gelişmiş filtreleme ve uyarı sistemleriyle kritik durumları anında tespit edin. Çok katmanlı 
              harita sistemi ile farklı veri setlerini aynı anda analiz etme olanağı.</p>
              <Link to="/flight-control" className="btn btn-outline">
                Kontrol Merkezine Geç <FaArrowRight />
              </Link>
            </div>
            <div className="feature-detail-image">
              <img src="https://via.placeholder.com/500x350/333/808080?text=Gerçek+Zamanlı+Harita" alt="Kontrol Paneli" />
            </div>
          </div>
          
          <div className="feature-detail-item reverse">
            <div className="feature-detail-text">
              <h3>Kapsamlı Veri Analizi</h3>
              <p>Geçmiş uçuş kayıtları, performans metrikleri ve olay analizleriyle operasyonel verimliliği artırın. 
              Özelleştirilebilir raporlarla ihtiyaç duyduğunuz bilgilere hızla ulaşın. Anomali tespiti ve 
              tahmine dayalı analiz araçlarıyla potansiyel sorunları önceden belirleyin.</p>
              <Link to="/analytics" className="btn btn-outline">
                Analiz Araçlarını Keşfet <FaArrowRight />
              </Link>
            </div>
            <div className="feature-detail-image">
               <img src="https://via.placeholder.com/500x350/444/808080?text=Veri+Analiz+Ekranı" alt="Analiz Ekranı" />
            </div>
          </div>
          
          <div className="feature-detail-item">
            <div className="feature-detail-text">
              <h3>Entegre Görev Yönetimi</h3>
              <p>Planlama, koordinasyon ve takip süreçlerini tek bir platformda birleştirin. 
              Ekip üyeleri arasında gerçek zamanlı iletişim, belge paylaşımı ve durum güncellemesi 
              olanakları. Acil durum prosedürleri ve otomatik görev atamaları ile hızlı müdahale 
              kapasitesini artırın.</p>
              <Link to="/mission-control" className="btn btn-outline">
                Görev Merkezini İncele <FaArrowRight />
              </Link>
            </div>
            <div className="feature-detail-image">
              <img src="https://via.placeholder.com/500x350/333/808080?text=Görev+Yönetim+Paneli" alt="Görev Merkezi" />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Home;