import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const componentAPI = {
  list: () => API.get('/components/'),
  create: (data) => API.post('/components/', data),
  update: (id, data) => API.put(`/components/${id}/`, data),
  delete: (id) => API.delete(`/components/${id}/`),
};

export const vehicleAPI = {
  list: () => API.get('/vehicles/'),
  get: (id) => API.get(`/vehicles/${id}/`),
  create: (data) => API.post('/vehicles/', data),
  update: (id, data) => API.put(`/vehicles/${id}/`, data),
  delete: (id) => API.delete(`/vehicles/${id}/`),
};

export const serviceAPI = {
  list: (vehicleId) => API.get(`/services/${vehicleId ? `?vehicle_id=${vehicleId}` : ''}`),
  get: (id) => API.get(`/services/${id}/`),
  create: (data) => API.post('/services/', data),
  update: (id, data) => API.patch(`/services/${id}/`, data),
  calculateTotal: (id) => API.post(`/services/${id}/calculate_total/`),
  processPayment: (id, data) => API.post(`/services/${id}/process_payment/`, data),
};

export const issueAPI = {
  list: (serviceId) => API.get(`/issues/?service_id=${serviceId}`),
  create: (data) => API.post('/issues/', data),
  update: (id, data) => API.put(`/issues/${id}/`, data),
  delete: (id) => API.delete(`/issues/${id}/`),
};

export const revenueAPI = {
  get: (period, params = {}) => API.get(`/revenue/?period=${period}`, { params }),
};

export default API;
