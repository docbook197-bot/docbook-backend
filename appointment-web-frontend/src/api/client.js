import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  completeDoctorProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    return api.post('/auth/complete-doctor-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Doctor endpoints
export const doctorAPI = {
  search: (params) => api.get('/doctors/search', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getAllDoctors: (page = 1) => api.get('/admin/doctors', { params: { page } }),
  updateAvailability: (data) => api.post('/doctor/availability', data),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/doctors/${doctorId}/available-slots`, { params: { date } }),
};

// Appointment endpoints
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getMyAppointments: (params) => api.get('/appointments/my', { params }),
  getDoctorAppointments: (params) => api.get('/doctor/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  approve: (id) => api.post(`/appointments/${id}/approve`),
  reject: (id, data) => api.post(`/appointments/${id}/reject`, data),
  reschedule: (id, data) => api.post(`/appointments/${id}/reschedule`, data),
  complete: (id, data) => api.post(`/appointments/${id}/complete`, data),
  cancel: (id) => api.post(`/appointments/${id}/cancel`),
};

export default api;
