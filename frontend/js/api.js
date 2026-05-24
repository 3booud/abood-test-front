// Drop4Life API client — clean wrapper over the Express backend
// Same-origin by default; override via window.DROP4LIFE_API_BASE if hosting frontend/backend separately.
const API_BASE = (typeof window.DROP4LIFE_API_BASE === 'string' && window.DROP4LIFE_API_BASE)
  ? window.DROP4LIFE_API_BASE.replace(/\/$/, '') + '/api'
  : window.location.origin + '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const API = {
  // Health
  health: () => request('/health'),

  // Stats / Insights
  stats: () => request('/stats'),
  insights: () => request('/insights'),
  activity: () => request('/activity'),

  // Donors
  getDonors: () => request('/donors'),
  addDonor: (data) => request('/donors', { method: 'POST', body: JSON.stringify(data) }),
  deleteDonor: (code) => request(`/donors/${code}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/inventory'),
  addInventory: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),

  // Requests
  getRequests: () => request('/requests'),
  addRequest: (data) => request('/requests', { method: 'POST', body: JSON.stringify(data) }),
  approveRequest: (code) => request(`/requests/${code}/approve`, { method: 'PUT' }),
  rejectRequest: (code) => request(`/requests/${code}/reject`, { method: 'PUT' }),
  shipRequest: (code) => request(`/requests/${code}/ship`, { method: 'PUT' }),
};

// Expose globally
window.API = API;
