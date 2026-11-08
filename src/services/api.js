/**
 * Mirac CRM - API Client Service
 * Connects React Frontend to Laravel Backend API (http://127.0.0.1:8000/api)
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';
function getAuthHeaders() {
  const token = localStorage.getItem('mirac_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication & Face ID
  auth: {
    login: (username, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    faceLogin: (payload) =>
      request('/auth/face-login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getFaceUsers: () => request('/auth/face-users'),
    enrollFace: (userId, descriptor, photoUrl) =>
      request('/auth/enroll-face', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, face_descriptor: descriptor, face_photo_url: photoUrl }),
      }),
    sendOtp: (email) =>
      request('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email, otp) =>
      request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Dashboard Analytics
  dashboard: {
    getMetrics: (filter = 'today') => request(`/dashboard/metrics?filter=${filter}`),
  },

  // Leads Management
  leads: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/leads?${q}`);
    },
    get: (id) => request(`/leads/${id}`),
    create: (data) =>
      request('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/leads/${id}`, {
        method: 'DELETE',
      }),
    addFollowUp: (id, data) =>
      request(`/leads/${id}/follow-up`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logCall: (id, data) =>
      request(`/leads/${id}/call`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    import: (payload) =>
      request('/leads/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Admin Configuration
  admin: {
    getRoles: () => request('/admin/roles'),
    createRole: (data) =>
      request('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRole: (id, data) =>
      request(`/admin/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteRole: (id) =>
      request(`/admin/roles/${id}`, {
        method: 'DELETE',
      }),
    updateRolePermissions: (id, permissions) =>
      request(`/admin/roles/${id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }),
    getStaff: () => request('/admin/staff'),
    createStaff: (data) =>
      request('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStaff: (id, data) =>
      request(`/admin/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteStaff: (id) =>
      request(`/admin/staff/${id}`, {
        method: 'DELETE',
      }),
    getLeadSettings: (type) => request(`/admin/lead-settings${type ? `?type=${type}` : ''}`),
    createLeadSetting: (data) =>
      request('/admin/lead-settings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteLeadSetting: (id) =>
      request(`/admin/lead-settings/${id}`, {
        method: 'DELETE',
      }),
    getFormLayout: () => request('/admin/form-layout'),
    updateFormLayout: (fields) =>
      request('/admin/form-layout', {
        method: 'POST',
        body: JSON.stringify({ fields }),
      }),
    getColumnCustomization: () => request('/admin/column-customization'),
    updateColumnCustomization: (columns) =>
      request('/admin/column-customization', {
        method: 'POST',
        body: JSON.stringify({ columns }),
      }),
    getCompanyProfile: () => request('/admin/company-profile'),
    updateCompanyProfile: (data) =>
      request('/admin/company-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAutoAssignments: () => request('/admin/auto-assignments'),
    updateAutoAssignment: (id, data) =>
      request(`/admin/auto-assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getGoogleSheetSyncs: () => request('/admin/google-sheet-syncs'),
    triggerGoogleSheetSync: (id) =>
      request(`/admin/google-sheet-syncs/${id}/trigger`, {
        method: 'POST',
      }),
  },

  // Attendance & HR
  attendance: {
    getTodayStatus: (userId) => request(`/attendance/today-status${userId ? `?user_id=${userId}` : ''}`),
    punch: (data) =>
      request('/attendance/punch', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getReport: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/attendance/report?${q}`);
    },
  },

  // Operations Portal
  operations: {
    getDailyReports: (date, userId) => {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (userId) params.append('user_id', userId);
      return request(`/operations/daily-reports?${params.toString()}`);
    },
    submitDailyReport: (data) =>
      request('/operations/daily-reports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getManagementChecklist: () => request('/operations/management-checklist'),
    updateChecklistItem: (id, data) =>
      request(`/operations/management-checklist/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getReportingMatrix: () => request('/operations/reporting-matrix'),
  },
};
