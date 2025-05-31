// pages/AdminPanel.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import '../../styles/AdminPanel.css';


const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <h2 className="admin-header-light">Admin Paneli</h2>
        <p className="admin-subtext-light">Aşağıdan bir operasyon seçiniz:</p>
      <div className="admin-buttons">
        <Link to="users" className="admin-btn">Kullanıcıları Yönet</Link>
        <Link to="aircraft" className="admin-btn">Uçuşları Yönet</Link>
      </div>
      <Outlet /> {/* Render nested routes here */}
    </div>
  );
};

export default AdminPanel;
