// pages/Admin Pages/AdminUsers.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users] = useState([
    { id: 1, name: 'John Doe', role: 'Admin' },
    { id: 2, name: 'Jane Smith', role: 'User' },
    { id: 3, name: 'Alice Johnson', role: 'Moderator' },
  ]);

  return (
    <div className="admin-users">
      <h2>Kullanıcıları Yönet</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>İsim</th>
            <th>Rol</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <Link to={`/admin/users/edit/${user.id}`} className="admin-btn">
                  Düzenle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
