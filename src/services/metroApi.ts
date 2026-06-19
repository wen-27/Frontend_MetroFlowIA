import { AdminBus, AdminRoute, Alert, Incident, MetroStatePayload, UpsertBusPayload, UpsertRoutePayload } from '../types';

const API_BASE_URL = import.meta.env.VITE_METROFLOW_API_URL || 'http://localhost:5000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = await response.json();
      message = payload.message || payload.title || message;
    } catch {
      // Keep status text when the API returns an empty error response.
    }
    throw new Error(`MetroFlow API ${response.status}: ${message}`);
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
  getAdminRoutes: () => request<AdminRoute[]>('/api/admin/manage/routes'),
  createRoute: (route: UpsertRoutePayload) =>
    request<AdminRoute>('/api/admin/manage/routes', { method: 'POST', body: JSON.stringify(route) }),
  updateRoute: (code: string, route: UpsertRoutePayload) =>
    request<AdminRoute>(`/api/admin/manage/routes/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(route) }),
  deleteRoute: (code: string) =>
    request<void>(`/api/admin/manage/routes/${encodeURIComponent(code)}`, { method: 'DELETE' }),
  getAdminBuses: () => request<AdminBus[]>('/api/admin/manage/buses'),
  createBus: (bus: UpsertBusPayload) =>
    request<AdminBus>('/api/admin/manage/buses', { method: 'POST', body: JSON.stringify(bus) }),
  updateBus: (code: string, bus: UpsertBusPayload) =>
    request<AdminBus>(`/api/admin/manage/buses/${encodeURIComponent(code)}`, { method: 'PUT', body: JSON.stringify(bus) }),
  deleteBus: (code: string) =>
    request<void>(`/api/admin/manage/buses/${encodeURIComponent(code)}`, { method: 'DELETE' }),
  reset: () => request<void>('/api/app/reset', { method: 'POST' })
};
