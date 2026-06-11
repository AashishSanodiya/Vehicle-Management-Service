import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { componentAPI } from '../api';

const EMPTY_FORM = { name: '', component_type: 'part', description: '', purchase_price: '', repair_price: '', stock_quantity: '' };

export default function Components() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { fetchComponents(); }, []);

  const fetchComponents = async () => {
    try {
      const res = await componentAPI.list();
      setComponents(res.data);
    } catch { toast.error('Failed to load components'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, component_type: c.component_type, description: c.description, purchase_price: c.purchase_price, repair_price: c.repair_price, stock_quantity: c.stock_quantity }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await componentAPI.update(editing.id, form);
        toast.success('Component updated!');
      } else {
        await componentAPI.create(form);
        toast.success('Component added!');
      }
      setShowModal(false);
      fetchComponents();
    } catch { toast.error('Something went wrong'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this component?')) return;
    try {
      await componentAPI.delete(id);
      toast.success('Deleted');
      fetchComponents();
    } catch { toast.error('Cannot delete — may be in use'); }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Components & Pricing</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Component</button>
      </div>

      <div className="card">
        {components.length === 0 ? (
          <div className="empty-state"><p>No components yet. Add your first spare part or service.</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Purchase Price</th>
                <th>Repair Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong><br /><span style={{ color: '#999', fontSize: '0.78rem' }}>{c.description}</span></td>
                  <td><span className="badge" style={{ background: c.component_type === 'part' ? '#e0e7ff' : '#fce7f3', color: c.component_type === 'part' ? '#3730a3' : '#9d174d' }}>{c.component_type === 'part' ? 'Spare Part' : 'Labor/Service'}</span></td>
                  <td>₹{parseFloat(c.purchase_price).toLocaleString()}</td>
                  <td>₹{parseFloat(c.repair_price).toLocaleString()}</td>
                  <td>{c.stock_quantity} units</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)} style={{ marginRight: 6 }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit Component' : 'Add New Component'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Component Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Brake Pad" />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select value={form.component_type} onChange={e => setForm({...form, component_type: e.target.value})}>
                    <option value="part">Spare Part</option>
                    <option value="labor">Labor/Service</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional details" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Purchase Price (₹) *</label>
                  <input type="number" min="0" step="0.01" required value={form.purchase_price} onChange={e => setForm({...form, purchase_price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Repair Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.repair_price} onChange={e => setForm({...form, repair_price: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Component'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
