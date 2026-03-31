const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow-production-76f0.up.railway.app';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flow_token');
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
  sendMessage: (id, data) => request(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  assign: (id, userId) => request(`/api/conversations/${id}/assign`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) }),
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
  whatsappQr: (disclaimerAccepted = true) =>
    request('/api/channels/whatsapp/qr', { method: 'POST', body: JSON.stringify({ disclaimer_accepted: disclaimerAccepted }) }),
  whatsappStatus: () => request('/api/channels/whatsapp/qr/status'),
};
