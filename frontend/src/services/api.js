const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('medicare_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  registerPatient: async (patientData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Directory & Availability
  getDepartments: async () => {
    const res = await fetch(`${API_BASE}/departments`);
    return res.json();
  },

  getServices: async (departmentId) => {
    const url = departmentId ? `${API_BASE}/services?department_id=${departmentId}` : `${API_BASE}/services`;
    const res = await fetch(url);
    return res.json();
  },

  getDoctors: async (departmentId = '', search = '') => {
    const params = new URLSearchParams();
    if (departmentId) params.append('department_id', departmentId);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/doctors?${params.toString()}`);
    return res.json();
  },

  getDoctorById: async (id) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    return res.json();
  },

  getDoctorSlots: async (doctorId, date) => {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability?date=${date}`);
    return res.json();
  },

  submitReview: async (doctorId, rating, comment) => {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment })
    });
    return res.json();
  },

  getPatients: async (search = '') => {
    const url = search ? `${API_BASE}/patients?search=${encodeURIComponent(search)}` : `${API_BASE}/patients`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  // Appointments
  bookAppointment: async (appointmentData) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData)
    });
    return res.json();
  },

  getAppointments: async (status = '', date = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/appointments?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  updateAppointmentStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // EHR Consultation & Patient History
  getPatientHistory: async (patientId) => {
    const res = await fetch(`${API_BASE}/ehr/patient/${patientId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  saveConsultation: async (consultationData) => {
    const res = await fetch(`${API_BASE}/ehr/consultation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(consultationData)
    });
    return res.json();
  },

  // Invoices & Billing
  getInvoices: async (status = '') => {
    const url = status ? `${API_BASE}/billing/invoices?status=${status}` : `${API_BASE}/billing/invoices`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  payInvoice: async (invoiceId, paymentMethod, amount) => {
    const res = await fetch(`${API_BASE}/billing/pay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ invoice_id: invoiceId, payment_method: paymentMethod, amount })
    });
    return res.json();
  },

  // Lab Tests
  getLabTests: async () => {
    const res = await fetch(`${API_BASE}/lab-tests`, { headers: getHeaders() });
    return res.json();
  },

  updateLabTest: async (id, status, resultNotes) => {
    const res = await fetch(`${API_BASE}/lab-tests/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, result_notes: resultNotes })
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    return res.json();
  },

  markNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Admin Stats & Doctor Creation
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() });
    return res.json();
  },

  createDoctor: async (doctorData) => {
    const res = await fetch(`${API_BASE}/admin/doctors`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(doctorData)
    });
    return res.json();
  }
};
