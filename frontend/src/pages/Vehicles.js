import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { vehicleAPI } from '../api';

const EMPTY_FORM = { owner_name: '', owner_phone: '', vehicle_number: '', vehicle_type: 'Car', brand: '', model: '', year: new Date().getFullYear() };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehicleAPI.list();
      setVehicles(res.data);
    } catch { toast.error('Failed to load vehicles'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleAPI.create(form);
      toast.success('Vehicle registered!');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchVehicles();
    } catch (err) {
      const msg = err.response?.data?.vehicle_number?.[0] || 'Something went wrong';
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle and all its service records?')) return;
    try {
      await vehicleAPI.delete(id);
      toast.success('Deleted');
      fetchVehicles();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>🚗 Vehicles</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Register Vehicle</button>
      </div>

      {vehicles.length === 0 ? (
        <div className="card"><div className="empty-state"><p>No vehicles registered yet.</p></div></div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Owner</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Year</th>
                <th>Services</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>
                    <strong>{v.vehicle_number}</strong><br />
                    <span style={{ color: '#666', fontSize: '0.82rem' }}>{v.brand} {v.model}</span>
                  </td>
                  <td>{v.owner_name}</td>
                  <td>{v.owner_phone}</td>
                  <td>{v.vehicle_type}</td>
                  <td>{v.year}</td>
                  <td><span className="badge badge-pending">{v.total_services} records</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Register New Vehicle</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Owner Name *</label>
                  <input required value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} placeholder="Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input required value={form.owner_phone} onChange={e => setForm({...form, owner_phone: e.target.value})} placeholder="9876543210" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Vehicle Number *</label>
                  <input required value={form.vehicle_number} onChange={e => setForm({...form, vehicle_number: e.target.value.toUpperCase()})} placeholder="MP09AB1234" />
                </div>
                <div className="form-group">
                  <label>Vehicle Type *</label>
                  <select value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}>
                    <option>Car</option>
                    <option>Bike</option>
                    <option>Truck</option>
                    <option>Auto</option>
                    <option>Bus</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Brand *</label>
                  <input required value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Maruti, Honda, etc." />
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input required value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="Swift, City, etc." />
                </div>
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input type="number" required min="1990" max={new Date().getFullYear()} value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
