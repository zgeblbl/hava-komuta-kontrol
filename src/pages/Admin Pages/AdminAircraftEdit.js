// pages/Admin Pages/AdminAircraftEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/AdminAircraftEdit.css';

const mockAircrafts = [
  { id: 1, code: 'TK101', model: 'Boeing 737', status: 'Active' },
  { id: 2, code: 'LH202', model: 'Airbus A320', status: 'Inactive' },
  { id: 3, code: 'BA303', model: 'Concorde', status: 'Active' },
];

const AdminAircraftEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState(null);

  useEffect(() => {
    const foundAircraft = mockAircrafts.find(a => a.id === parseInt(id));
    if (foundAircraft) {
      setAircraft(foundAircraft);
    } else {
      navigate('/admin/aircraft');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAircraft(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Saving aircraft:', aircraft);
    navigate('/admin/aircraft');
  };

  const handleCancel = () => {
    navigate('/admin/aircraft');
  };

  if (!aircraft) return null;

  return (
    <div className="admin-aircraft-edit">
      <h2>Uçak Bilgilerini Düzenle</h2>
      <form className="edit-form">
        <label>
          Uçuş Kodu:
          <input
            type="text"
            name="code"
            value={aircraft.code}
            onChange={handleChange}
          />
        </label>
        <label>
          Model:
          <input
            type="text"
            name="model"
            value={aircraft.model}
            onChange={handleChange}
          />
        </label>
        <label>
          Durum:
          <select name="status" value={aircraft.status} onChange={handleChange}>
            <option value="Active">Aktif</option>
            <option value="Inactive">Pasif</option>
          </select>
        </label>
        <div className="btn-group">
          <button type="button" className="save-btn" onClick={handleSave}>
            Kaydet
          </button>
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            İptal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAircraftEdit;
