import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <p>&copy; {new Date().getFullYear()} Tüm hakları saklıdır. | a Yetenek 3 Komuta Kontrol Projesidir.</p>
    </footer>
  );
};

export default Footer;
