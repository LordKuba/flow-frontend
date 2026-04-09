const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow-production-76f0.up.railway.app';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flow_token');
}

let isRefreshing = false;
let refreshPromise = null;

async function refreshToken() {
  if (isRefreshing) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem('flow_refresh_token') : null;
      if (!rt) return false;
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.session?.access_token) {
        localStorage.setItem('flow_token', data.session.access_token);
        if (data.session.refresh_token) localStorage.setItem('flow_refresh_token', data.session.refresh_token);
        return true;
      }
      return false;
    } catch { return false; }
    finally { isRefreshing = false; refreshPromise = null; }
  })();
  return refreshPromise;
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Auto-refresh on 401 and retry once
  if (res.status === 401 && path !== '/api/auth/login' && path !== '/api/auth/refresh') {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newToken = getToken();
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          ...options.headers,
        },
      });
      const retryData = await retryRes.json().catch(() => ({}));
      if (!retryRes.ok) throw Object.assign(new Error(retryData.error || 'Request failed'), { status: retryRes.status, data: retryData });
      return retryData;
    }
    // Refresh failed — redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flow_token');
      localStorage.removeItem('flow_refresh_token');
      window.location.href = '/login';
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (email, password, name, organizationName) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, organizationName }) }),

  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),

  me: () => request('/api/auth/me'),
  forgotPassword: (email) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
};

// ─── Contacts ────────────────────────────────────────────────────────────────
export const contacts = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/contacts${q ? '?' + q : ''}`);
  },
  get: (id) => request(`/api/contacts/${id}`),
  create: (data) => request('/api/contacts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/contacts/${id}`, { method: 'DELETE' }),
};

// ─── Conversations ───────────────────────────────────────────────────────────
export const conversations = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/conversations${q ? '?' + q : ''}`);
  },
  get: (id) => request(`/api/conversations/${id}`),
  create: (data) => request('/api/conversations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/conversations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  messages: (id) => request(`/api/conversations/${id}/messages`),
  syncHistory: (id) => request(`/api/conversations/${id}/sync-history`, { method: 'POST' }),
  sendMessage: (id, data) => request(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  assign: (id, userId) => request(`/api/conversations/${id}/assign`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) }),
  markRead: (id) => request(`/api/conversations/${id}/read`, { method: 'PUT' }),
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasks = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/tasks${q ? '?' + q : ''}`);
  },
  get: (id) => request(`/api/tasks/${id}`),
  create: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};

// ─── Events ──────────────────────────────────────────────────────────────────
export const events = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/events${q ? '?' + q : ''}`);
  },
  get: (id) => request(`/api/events/${id}`),
  create: (data) => request('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/events/${id}`, { method: 'DELETE' }),
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documents = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/documents${q ? '?' + q : ''}`);
  },
  create: (data) => request('/api/documents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/documents/${id}`, { method: 'DELETE' }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = {
  list: () => request('/api/notifications'),
  readAll: () => request('/api/notifications/read-all', { method: 'PUT' }),
  read: (id) => request(`/api/notifications/${id}/read`, { method: 'PUT' }),
};

// ─── Org ─────────────────────────────────────────────────────────────────────
export const org = {
  get: () => request('/api/org'),
  update: (data) => request('/api/org', { method: 'PUT', body: JSON.stringify(data) }),
  team: () => request('/api/org/team'),
  updateRole: (userId, role) => request(`/api/org/team/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  removeMember: (userId) => request(`/api/org/team/${userId}`, { method: 'DELETE' }),
};

// ─── Stats ───────────────────────────────────────────────────────────────────
export const stats = {
  overview: () => request('/api/stats/overview'),
  leads: (days = 30) => request(`/api/stats/leads?days=${days}`),
  messages: (days = 30) => request(`/api/stats/messages?days=${days}`),
};

// ─── AI ──────────────────────────────────────────────────────────────────────
export const ai = {
  usage: () => request('/api/ai/usage'),
  suggest: (conversationId, context) =>
    request('/api/ai/suggest', { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, context }) }),
  chat: (message, history) =>
    request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
};


// ─── Channels ────────────────────────────────────────────────────────────────
export const channels = {
  list: () => request('/api/channels'),
  disconnect: (channelId) => request(`/api/channels/${channelId}`, { method: 'DELETE' }),
  // Green API (replaces whatsapp-web.js)
  greenapiConnect: (idInstance, apiTokenInstance) =>
    request('/api/channels/greenapi/connect', { method: 'POST', body: JSON.stringify({ idInstance, apiTokenInstance }) }),
  greenapiQr: () => request('/api/channels/greenapi/qr'),
  greenapiStatus: () => request('/api/channels/greenapi/status'),
  greenapiDisconnect: () => request('/api/channels/greenapi/disconnect', { method: 'DELETE' }),
  greenapiImport: () => request('/api/channels/greenapi/import', { method: 'POST' }),
};
