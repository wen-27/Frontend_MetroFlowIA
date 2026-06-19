import { Alert, Incident, MetroStatePayload } from '../types';

const API_BASE_URL = import.meta.env.VITE_METROFLOW_API_URL || 'http://localhost:5000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    throw new Error(`MetroFlow API ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const metroApi = {
  getState: () => request<MetroStatePayload>('/api/app/state'),
  createIncident: (incident: Omit<Incident, 'id' | 'activeDurationMinutes'>) =>
    request<Incident>('/api/app/incidents', { method: 'POST', body: JSON.stringify(incident) }),
  resolveIncident: (id: string) =>
    request<void>(`/api/app/incidents/${encodeURIComponent(id)}/resolve`, { method: 'PUT' }),
  updateAlertStatus: (id: string, status: Alert['status']) =>
    request<void>(`/api/app/alerts/${encodeURIComponent(id)}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  applyRecommendation: (id: string) =>
    request<void>(`/api/app/recommendations/${encodeURIComponent(id)}/apply`, { method: 'POST' }),
  simulateAdditionalBus: (routeId: string) =>
    request<void>(`/api/app/routes/${encodeURIComponent(routeId)}/simulate-bus`, { method: 'POST' }),
  reset: () => request<void>('/api/app/reset', { method: 'POST' })
};
