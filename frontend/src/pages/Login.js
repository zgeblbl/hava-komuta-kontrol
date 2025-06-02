import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';
import Footer from '../components/Footer';
import { authService } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password,
        loginType // 'admin' veya 'user'
      );

      // Token ve kullanıcı bilgilerini sakla
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('userType', response.userType);

      // Başarılı giriş sonrası yönlendirme
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/flight-control');
      }
    } catch (error) {
      setError(error.message || 'Giriş başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>Giriş Seçimi</h2>
        <div className="login-type-buttons">
          <button 
            onClick={() => setLoginType('admin')} 
            className={loginType === 'admin' ? 'selected' : ''}
            disabled={loading}
          >
            Admin Girişi
          </button>
          <button 
            onClick={() => setLoginType('user')} 
            className={loginType === 'user' ? 'selected' : ''}
            disabled={loading}
          >
            Kullanıcı Girişi
          </button>
        </div>

        {loginType && (
          <>
            <h3>{loginType === 'admin' ? 'Admin Girişi' : 'Kullanıcı Girişi'}</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">E-posta</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Şifre</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Login;
