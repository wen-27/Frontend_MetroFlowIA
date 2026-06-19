/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Route {
  id: string; // e.g. "T2"
  name: string; // e.g. "T2 — Cañaveral → UIS"
  origin: string;
  destination: string;
  activeBuses: number;
  avgTimeMinutes: number;
  delayMinutes: number;
  occupancy: 'low' | 'medium' | 'high' | 'critical';
  status: 'normal' | 'congested' | 'delayed' | 'critical' | 'adjusted';
  pathCoordinates?: [number, number][]; // Street-by-street multi-point coordinates for realistic mapping
}

export interface Bus {
  id: string; // e.g. "BUS-204"
  routeId: string;
  driverName: string;
  latitude: number; // For map representation
  longitude: number;
  occupancy: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'delayed' | 'maintenance';
  nextStation: string;
  etaMinutes: number;
}

export interface Station {
  id: string; // e.g. "ST-01"
  name: string;
  occupancyCurrent: number; // 0 - 100 %
  occupancyPrediction20Min: number; // 0 - 100 %
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  capacity: number;
}

export interface Alert {
  id: string;
  type: 'congestión' | 'retraso' | 'alta ocupación' | 'incidente' | 'baja frecuencia' | 'demanda inusual' | 'alternativa';
  target: string; // Route or Station name
  level: 'info' | 'warning' | 'critical';
  description: string;
  recommendation: string;
  timestamp: string; // e.g. "09:24 AM"
  status: 'new' | 'investigating' | 'resolved' | 'escalated';
}

export interface Incident {
  id: string;
  type: string; // e.g. "Falla mecánica", "Obstrucción vial"
  location: string;
  affectedRoute: string;
  status: 'active' | 'reinforcing' | 'resolved';
  activeDurationMinutes: number;
  officerInCharge: string;
}

export interface AiRecommendation {
  id: string;
  title: string;
  impact: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  applied: boolean;
  type: 'frequency' | 'dispatch' | 'alert' | 'route';
  targetId: string; // Route or station ID
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface DemandForecastPoint {
  hour: string;
  passengers: number;
  capacity: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface MetroStatePayload {
  routes: Route[];
  stations: Station[];
  buses: Bus[];
  alerts: Alert[];
  incidents: Incident[];
  recommendations: AiRecommendation[];
  peakDemandForecast: DemandForecastPoint[];
}

export interface AdminRouteStation {
  code: string;
  name: string;
  stopOrder: number;
  estimatedMinutesFromStart: number;
  isTransferPoint: boolean;
}

export interface AdminRoute {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  avgTimeMinutes: number;
  delayMinutes: number;
  occupancy: Route['occupancy'];
  status: Route['status'];
  routeType: string;
  activeBuses: number;
  stations: AdminRouteStation[];
}

export interface AdminBus {
  id: string;
  internalCode: string;
  plate: string;
  driverName: string;
  busType: string;
  capacity: number;
  currentOccupancy: number;
  occupancy: Bus['occupancy'];
  routeId: string;
  routeName: string;
  nextStation: string;
  etaMinutes: number;
  status: Bus['status'];
  latitude?: number;
  longitude?: number;
}

export interface UpsertRoutePayload {
  code?: string;
  name: string;
  description?: string;
  stationCodes: string[];
  avgTimeMinutes: number;
  delayMinutes: number;
  occupancy: Route['occupancy'];
  status: Route['status'];
  routeType: string;
}

export interface UpsertBusPayload {
  internalCode: string;
  plate?: string;
  driverName: string;
  busType: string;
  capacity: number;
  currentOccupancy: number;
  occupancy: Bus['occupancy'];
  routeCode: string;
  nextStationCode?: string;
  etaMinutes: number;
  status: Bus['status'];
}
