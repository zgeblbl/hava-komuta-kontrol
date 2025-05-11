// pages/Admin Pages/AdminAircraft.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/AdminAircraft.css';

const AdminAircraft = () => {
  const [aircrafts] = useState([
    { id: 1, code: 'TK101', model: 'Boeing 737', status: 'Active' },
    { id: 2, code: 'LH202', model: 'Airbus A320', status: 'Inactive' },
    { id: 3, code: 'BA303', model: 'Concorde', status: 'Active' },
  ]);

  return (
    <div className="admin-aircraft">
      <h2>Uçuşları Yönet</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Uçuş Kodu</th>
            <th>Model</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {aircrafts.map(aircraft => (
            <tr key={aircraft.id}>
              <td>{aircraft.code}</td>
              <td>{aircraft.model}</td>
              <td>{aircraft.status}</td>
              <td>
                <Link to={`/admin/aircraft/edit/${aircraft.id}`} className="admin-btn">
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

export default AdminAircraft;
