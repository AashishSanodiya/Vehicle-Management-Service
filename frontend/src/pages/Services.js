import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { serviceAPI, vehicleAPI, issueAPI, componentAPI } from '../api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [paymentDone, setPaymentDone] = useState(null);

  const [serviceForm, setServiceForm] = useState({ vehicle: '', description: '', labor_charge: 0 });
  const [issueForm, setIssueForm] = useState({ title: '', description: '', resolution_type: 'new_part', component: '', quantity: 1, unit_price: '' });
  const [paymentForm, setPaymentForm] = useState({ payment_method: 'cash', notes: '' });

  useEffect(() => {
    Promise.all([fetchServices(), fetchVehicles(), fetchComponents()]);
  }, []);

  const fetchServices = async () => {
    try {
      const res = await serviceAPI.list();
      setServices(res.data);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };
  const fetchVehicles = async () => {
    const res = await vehicleAPI.list();
    setVehicles(res.data);
  };
  const fetchComponents = async () => {
    const res = await componentAPI.list();
    setComponents(res.data);
  };

  const createService = async (e) => {
    e.preventDefault();
    try {
      await serviceAPI.create(serviceForm);
      toast.success('Service record created!');
      setShowServiceModal(false);
      setServiceForm({ vehicle: '', description: '', labor_charge: 0 });
      fetchServices();
    } catch { toast.error('Failed to create service'); }
  };

  const openIssueModal = (service) => {
    setSelectedService(service);
    setIssueForm({ title: '', description: '', resolution_type: 'new_part', component: '', quantity: 1, unit_price: '' });
    setShowIssueModal(true);
  };

  const handleComponentChange = (componentId, resolutionType) => {
    const comp = components.find(c => c.id === parseInt(componentId));
    if (comp) {
      const price = resolutionType === 'repair' ? comp.repair_price : comp.purchase_price;
      setIssueForm(f => ({ ...f, component: componentId, unit_price: price }));
    }
  };

  const addIssue = async (e) => {
    e.preventDefault();
    try {
      await issueAPI.create({ ...issueForm, service_record: selectedService.id });
      toast.success('Issue added!');
      setShowIssueModal(false);
      fetchServices();
    } catch { toast.error('Failed to add issue'); }
  };

  const deleteIssue = async (issueId, serviceId) => {
    if (!window.confirm('Remove this issue?')) return;
    try {
      await issueAPI.delete(issueId);
      toast.success('Issue removed');
      fetchServices();
    } catch { toast.error('Failed to remove'); }
  };

  const updateStatus = async (service, status) => {
    try {
      await serviceAPI.update(service.id, { status });
      toast.success('Status updated');
      fetchServices();
    } catch { toast.error('Failed to update status'); }
  };

  const openPayment = (service) => {
    setSelectedService(service);
    setPaymentDone(null);
    setPaymentForm({ payment_method: 'cash', notes: '' });
    setShowPaymentModal(true);
  };

  const processPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await serviceAPI.processPayment(selectedService.id, paymentForm);
      setPaymentDone(res.data);
      toast.success('Payment processed!');
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h2>🔧 Service Records</h2>
        <button className="btn btn-primary" onClick={() => setShowServiceModal(true)}>+ New Service</button>
      </div>

      {services.length === 0 ? (
        <div className="card"><div className="empty-state"><p>No service records yet.</p></div></div>
      ) : (
        services.map(service => (
          <div className="card" key={service.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: '1rem' }}>#{service.id} — {service.vehicle_info}</strong>
                <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>{service.description}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge badge-${service.status}`}>{service.status.replace('_', ' ')}</span>
                <select
                  className="btn btn-outline btn-sm"
                  value={service.status}
                  onChange={e => updateStatus(service, e.target.value)}
                  disabled={service.status === 'paid'}
                  style={{ padding: '5px 8px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                {service.status !== 'paid' && (
                  <button className="btn btn-outline btn-sm" onClick={() => openIssueModal(service)}>+ Issue</button>
                )}
                {service.status === 'completed' && (
                  <button className="btn btn-success btn-sm" onClick={() => openPayment(service)}>💳 Pay</button>
                )}
              </div>
            </div>

            {service.issues && service.issues.length > 0 && (
              <div style={{ marginTop: 16, borderTop: '1px solid #f0f2f5', paddingTop: 12 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555', marginBottom: 8 }}>ISSUES & COMPONENTS</p>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Issue</th>
                      <th>Resolution</th>
                      <th>Component</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.issues.map(issue => (
                      <tr key={issue.id}>
                        <td><strong>{issue.title}</strong></td>
                        <td><span className="badge" style={{ background: issue.resolution_type === 'new_part' ? '#e0e7ff' : '#fce7f3', color: issue.resolution_type === 'new_part' ? '#3730a3' : '#9d174d' }}>{issue.resolution_type === 'new_part' ? 'New Part' : 'Repair'}</span></td>
                        <td>{issue.component_name || '—'}</td>
                        <td>{issue.quantity}</td>
                        <td>₹{parseFloat(issue.unit_price).toLocaleString()}</td>
                        <td><strong>₹{parseFloat(issue.total_cost).toLocaleString()}</strong></td>
                        <td>{service.status !== 'paid' && <button className="btn btn-danger btn-sm" onClick={() => deleteIssue(issue.id, service.id)}>✕</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 20, fontSize: '0.88rem', color: '#555' }}>
              <span>Labor: <strong>₹{parseFloat(service.labor_charge).toLocaleString()}</strong></span>
              <span style={{ fontSize: '1rem', color: '#0f3460' }}>Total: <strong>₹{parseFloat(service.total_amount).toLocaleString()}</strong></span>
              {service.status === 'paid' && <span style={{ color: '#10b981' }}>✅ Paid: <strong>₹{parseFloat(service.paid_amount).toLocaleString()}</strong></span>}
            </div>
          </div>
        ))
      )}

      {/* New Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Service Record</h3>
            <form onSubmit={createService}>
              <div className="form-group">
                <label>Vehicle *</label>
                <select required value={serviceForm.vehicle} onChange={e => setServiceForm({...serviceForm, vehicle: e.target.value})}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} — {v.brand} {v.model} ({v.owner_name})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Description *</label>
                <textarea rows={3} required value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Describe what needs to be done..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>Labor Charge (₹)</label>
                <input type="number" min="0" value={serviceForm.labor_charge} onChange={e => setServiceForm({...serviceForm, labor_charge: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowServiceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Issue Modal */}
      {showIssueModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Issue — {selectedService.vehicle_info}</h3>
            <form onSubmit={addIssue}>
              <div className="form-group">
                <label>Issue Title *</label>
                <input required value={issueForm.title} onChange={e => setIssueForm({...issueForm, title: e.target.value})} placeholder="e.g. Worn brake pads" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={issueForm.description} onChange={e => setIssueForm({...issueForm, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Resolution Type *</label>
                <select value={issueForm.resolution_type} onChange={e => {
                  setIssueForm({...issueForm, resolution_type: e.target.value});
                  if (issueForm.component) handleComponentChange(issueForm.component, e.target.value);
                }}>
                  <option value="new_part">Use New Component</option>
                  <option value="repair">Repair Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Component / Part *</label>
                <select required value={issueForm.component} onChange={e => handleComponentChange(e.target.value, issueForm.resolution_type)}>
                  <option value="">Select component...</option>
                  {components.map(c => <option key={c.id} value={c.id}>{c.name} (New: ₹{c.purchase_price} / Repair: ₹{c.repair_price})</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" min="1" value={issueForm.quantity} onChange={e => setIssueForm({...issueForm, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Unit Price (₹) *</label>
                  <input type="number" min="0" step="0.01" required value={issueForm.unit_price} onChange={e => setIssueForm({...issueForm, unit_price: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {paymentDone ? (
              <div className="payment-success">
                <div className="checkmark">✅</div>
                <h4>Payment Successful!</h4>
                <p style={{ color: '#666', marginBottom: 8 }}>Transaction ID: <strong>{paymentDone.payment.transaction_id}</strong></p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f3460' }}>₹{parseFloat(paymentDone.payment.amount).toLocaleString()}</p>
                <p style={{ color: '#999', fontSize: '0.85rem', marginTop: 4 }}>via {paymentDone.payment.payment_method.toUpperCase()}</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowPaymentModal(false)}>Done</button>
              </div>
            ) : (
              <>
                <h3>Process Payment</h3>
                <div style={{ background: '#f8f9ff', padding: 16, borderRadius: 8, marginBottom: 20 }}>
                  <p style={{ color: '#666', fontSize: '0.85rem' }}>{selectedService.vehicle_info}</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f3460', marginTop: 4 }}>₹{parseFloat(selectedService.total_amount).toLocaleString()}</p>
                  <p style={{ color: '#999', fontSize: '0.8rem' }}>Total Amount Due</p>
                </div>
                <form onSubmit={processPayment}>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select value={paymentForm.payment_method} onChange={e => setPaymentForm({...paymentForm, payment_method: e.target.value})}>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <input value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} placeholder="Any additional notes..." />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">Confirm Payment ₹{parseFloat(selectedService.total_amount).toLocaleString()}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
