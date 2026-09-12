// API client for the AtomiX Hospital Automation backend (Node/Express + SQLite).
// Set VITE_API_URL in your .env (defaults to http://localhost:4000).

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'atomix_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return undefined as unknown as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `Request failed: ${res.status}`);
  }
  return body as T;
}

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: any; message: string }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  me: () => request<{ user: any }>('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
};

// ---- Generic CRUD factory (mirrors backend's generic collection routes) ----
function crud<T = any>(resource: string) {
  return {
    list: (query?: Record<string, string>) => {
      const qs = query ? `?${new URLSearchParams(query).toString()}` : '';
      return request<T[]>(`/api/${resource}${qs}`);
    },
    get: (id: string) => request<T>(`/api/${resource}/${id}`),
    create: (data: Partial<T>) =>
      request<T>(`/api/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<T>) =>
      request<T>(`/api/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    replace: (id: string, data: T) =>
      request<T>(`/api/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/api/${resource}/${id}`, { method: 'DELETE' }),
  };
}

export const patientsApi = crud('patients');
export const staffApi = {
  ...crud('staff'),
  checkIn: (id: string) => request(`/api/staff/${id}/check-in`, { method: 'POST' }),
  checkOut: (id: string) => request(`/api/staff/${id}/check-out`, { method: 'POST' }),
};
export const medicinesApi = {
  ...crud('medicines'),
  adjustStock: (id: string, delta: number) =>
    request(`/api/medicines/${id}/adjust-stock`, { method: 'POST', body: JSON.stringify({ delta }) }),
};
export const vendingApi = {
  ...crud('vending-machines'),
  dispense: (id: string, slotNumber: number, quantity = 1) =>
    request(`/api/vending-machines/${id}/dispense`, {
      method: 'POST',
      body: JSON.stringify({ slotNumber, quantity }),
    }),
};
export const robotsApi = {
  ...crud('robots'),
  dispatch: (id: string, mission: any) =>
    request(`/api/robots/${id}/dispatch`, { method: 'POST', body: JSON.stringify({ mission }) }),
  setStatus: (id: string, patch: any) =>
    request(`/api/robots/${id}/status`, { method: 'POST', body: JSON.stringify(patch) }),
};
export const iotApi = crud('iot-devices');
export const visitsApi = {
  ...crud('visits'),
  setVitals: (id: string, vitals: any) =>
    request(`/api/visits/${id}/vitals`, { method: 'POST', body: JSON.stringify({ vitals }) }),
  setStatus: (id: string, status: string) =>
    request(`/api/visits/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
};
export const prescriptionsApi = {
  ...crud('prescriptions'),
  setStatus: (id: string, status: string) =>
    request(`/api/prescriptions/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
};
export const auditApi = crud('audit-logs');
export const alertsApi = {
  ...crud('alerts'),
  markRead: (id: string) => request(`/api/alerts/${id}/read`, { method: 'POST' }),
};
export const traceabilityApi = crud('traceability');
export const emergenciesApi = {
  ...crud('emergencies'),
  advanceStage: (id: string, body?: { title?: string; actor?: string }) =>
    request(`/api/emergencies/${id}/advance-stage`, { method: 'POST', body: JSON.stringify(body || {}) }),
  assignDoctor: (id: string, doctor: any) =>
    request(`/api/emergencies/${id}/assign-doctor`, { method: 'POST', body: JSON.stringify({ doctor }) }),
  assignNurse: (id: string, nurse: any) =>
    request(`/api/emergencies/${id}/assign-nurse`, { method: 'POST', body: JSON.stringify({ nurse }) }),
  dispatchTeam: (id: string, team: any) =>
    request(`/api/emergencies/${id}/dispatch-team`, { method: 'POST', body: JSON.stringify({ team }) }),
  prepareMedicine: (id: string, medicineId: string) =>
    request(`/api/emergencies/${id}/prepare-medicine`, { method: 'POST', body: JSON.stringify({ medicineId }) }),
  teamReached: (id: string) => request(`/api/emergencies/${id}/team-reached`, { method: 'POST' }),
  resolve: (id: string, outcomeNotes?: string) =>
    request(`/api/emergencies/${id}/resolve`, { method: 'POST', body: JSON.stringify({ outcomeNotes }) }),
};
export const cameraApi = {
  ...crud('camera-nodes'),
  triggerAnomaly: (id: string, anomalyType: string, location?: string) =>
    request(`/api/camera-nodes/${id}/anomaly`, { method: 'POST', body: JSON.stringify({ anomalyType, location }) }),
  clearAnomaly: (id: string) => request(`/api/camera-nodes/${id}/clear-anomaly`, { method: 'POST' }),
};
