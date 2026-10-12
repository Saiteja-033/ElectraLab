const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081/api').replace(/\/+$/, '');

const TOKEN_KEY = 'electralab_auth_token';
const USER_KEY = 'electralab_user_profile';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

const getHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = authStorage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Health
  getHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const data = await res.json().catch(() => null);
      if (data && data.status) {
        return data;
      }
      return { status: res.ok ? 'UP' : 'OFFLINE', database: 'DISCONNECTED' };
    } catch {
      return { status: 'OFFLINE', database: 'DISCONNECTED' };
    }
  },

  // Auth Endpoints
  getAuthStatus: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/status`);
      if (!res.ok) return { adminConfigured: true };
      return res.json();
    } catch {
      return { adminConfigured: true };
    }
  },

  login: async ({ email, password, portalRole, role }) => {
    try {
      const roleToSend = role || portalRole;
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: roleToSend }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors && typeof data.errors === 'object') {
          const firstFieldError = Object.values(data.errors)[0];
          throw new Error(firstFieldError || data.message || 'Validation failed');
        }
        throw new Error(data.message || data.error || 'Login failed. Please check your credentials.');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to contact backend server on port 8081. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  registerStudent: async (studentData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors && typeof data.errors === 'object') {
          const firstFieldError = Object.values(data.errors)[0];
          throw new Error(firstFieldError || data.message || 'Validation failed');
        }
        throw new Error(data.message || data.error || 'Student registration failed');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to contact backend server on port 8081. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  setupAdmin: async (adminData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/setup-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors && typeof data.errors === 'object') {
          const firstFieldError = Object.values(data.errors)[0];
          throw new Error(firstFieldError || data.message || 'Validation failed');
        }
        throw new Error(data.message || data.error || 'Administrator setup failed');
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to contact backend server on port 8081. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(true),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user session profile');
    }
    return res.json();
  },

  // Equipment Endpoints
  getAllEquipment: async (category = '', search = '') => {
    let url = `${API_BASE_URL}/equipment`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getHeaders(false) });
    if (!res.ok) throw new Error('Failed to fetch equipment catalog');
    return res.json();
  },

  getEquipmentById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/equipment/${id}`);
    if (!res.ok) throw new Error('Failed to fetch equipment details');
    return res.json();
  },

  createEquipment: async (data) => {
    const res = await fetch(`${API_BASE_URL}/equipment`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to create equipment');
    }
    return result;
  },

  updateEquipment: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to update equipment');
    }
    return result;
  },

  deleteEquipment: async (id) => {
    const res = await fetch(`${API_BASE_URL}/equipment/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result.message || 'Failed to delete equipment');
    }
  },

  toggleEquipmentMaintenance: async (id, underMaintenance) => {
    const res = await fetch(`${API_BASE_URL}/admin/equipment/${id}/maintenance?underMaintenance=${underMaintenance}`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to update maintenance status');
    }
    return result;
  },

  // Allocations Endpoints
  getAllAllocations: async (rollNumber = '') => {
    let url = `${API_BASE_URL}/allocations`;
    if (rollNumber) url += `?rollNumber=${encodeURIComponent(rollNumber)}`;
    const res = await fetch(url, {
      headers: getHeaders(true),
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result.message || 'Failed to fetch allocations');
    }
    return res.json();
  },

  issueEquipment: async (data) => {
    const res = await fetch(`${API_BASE_URL}/allocations/issue`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to issue equipment');
    }
    return result;
  },

  returnEquipment: async (id, remarks = '') => {
    const res = await fetch(`${API_BASE_URL}/allocations/${id}/return`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ remarks }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to return equipment');
    }
    return result;
  },

  // Student Directory Endpoints (Admin only)
  getAllStudents: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/students`, {
      headers: getHeaders(true),
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result.message || 'Failed to fetch student directory');
    }
    return res.json();
  },

  toggleStudentStatus: async (id, active) => {
    const res = await fetch(`${API_BASE_URL}/admin/students/${id}/status?active=${active}`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to update student account status');
    }
    return result;
  },

  // Feedback & Maintenance Reporting Endpoints
  submitFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(feedbackData),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to submit feedback report');
    }
    return result;
  },

  getAllFeedback: async () => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      headers: getHeaders(true),
    });
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result.message || 'Failed to fetch lab feedback');
    }
    return res.json();
  },

  resolveFeedback: async (id) => {
    const res = await fetch(`${API_BASE_URL}/feedback/${id}/resolve`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to resolve feedback report');
    }
    return result;
  },
};
