// pages/Admin Pages/AdminUserEdit.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/AdminUserEdit.css';

const mockUsers = [
  { id: 1, name: 'John Doe', role: 'Admin' },
  { id: 2, name: 'Jane Smith', role: 'User' },
  { id: 3, name: 'Alice Johnson', role: 'Moderator' },
];

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', role: '' });

  useEffect(() => {
    const user = mockUsers.find(u => u.id === parseInt(id));
    if (user) {
      setUserData({ name: user.name, role: user.role });
    } else {
      // handle user not found 
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated User:', userData);
    navigate('/admin/users');
  };

  return (
    <div className="admin-user-edit">
      <h2>Kullanıcıyı Düzenle</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>İsim</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Rol</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            required
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Moderator">Moderator</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Kaydet</button>
      </form>
    </div>
  );
};

export default AdminUserEdit;
