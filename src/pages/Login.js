import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import Footer from '../components/Footer';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState(null);
  const navigate = useNavigate();

  // Mock değerler
  const mockCredentials = {
    admin: {
      email: 'admin@example.com',
      password: 'admin123'
    },
    user: {
      email: 'user@example.com',
      password: 'user123'
    }
  };

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

    // Mock giriş kontrolü
    if (formData.email === mockCredentials[loginType].email && 
        formData.password === mockCredentials[loginType].password) {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('userType', loginType);
      navigate('/home');
    } else {
      setError('Geçersiz e-posta veya şifre');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>Giriş Seçimi</h2>
        <div className="login-type-buttons">
          <button onClick={() => setLoginType('admin')} className={loginType === 'admin' ? 'selected' : ''}>
            Admin Girişi
          </button>
          <button onClick={() => setLoginType('user')} className={loginType === 'user' ? 'selected' : ''}>
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
                />
              </div>
              <button type="submit" className="btn-primary">
                Giriş Yap
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
