/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMetro } from '../../contexts/MetroContext';
import { SimulatedMap } from '../../components/organisms/SimulatedMap';
import { MetricCard } from '../../components/molecules/MetricCard';
import { StatusPill } from '../../components/atoms/StatusPill';
import { Badge } from '../../components/atoms/Badge';
import { OccupancyBadge } from '../../components/molecules/OccupancyBadge';
import { Button } from '../../components/atoms/Button';
import { Card } from '../../components/atoms/Card';
import { AlertCard } from '../../components/molecules/AlertCard';
import { PEAK_DEMAND_FORECAST } from '../../mocks/metroData';
import { 
  ArrowLeft, 
  Settings, 
  MapPin, 
  Compass,
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  Bus as BusIcon, 
  ListCollapse, 
  CheckCircle, 
  PlusCircle, 
  RotateCcw, 
  Share2, 
  Activity, 
  Sparkles, 
  AlertTriangle,
  UserCheck,
  Send,
  Wrench,
  Construction
} from 'lucide-react';

interface ControlCenterViewProps {
  onBackToHome: () => void;
  id?: string;
}

export const ControlCenterView: React.FC<ControlCenterViewProps> = ({
  onBackToHome,
  id
}) => {
  const { 
    routes, 
    stations, 
    buses, 
    alerts, 
    incidents, 
    recommendations, 
    addToast,
    addIncident,
    resolveIncident,
    resolveAlert,
    updateAlertStatus,
    applyRecommendation,
    simulateAdditionalBus,
    triggerSimulatedAlert,
    resetSimulation
  } = useMetro();

  // Tabs for main content workspace
  const [mainTab, setMainTab] = useState<'gps' | 'corridors' | 'demand'>('gps');

  // Selected Route or Station for sub-details
  const [selectedRouteId, setSelectedRouteId] = useState<string>('T2');
  
  // Incident submission form state
  const [newIncType, setNewIncType] = useState('Obstrucción mecánica vehicular');
  const [newIncLocation, setNewIncLocation] = useState('Sector Cañaveral Norte');
  const [newIncRoute, setNewIncRoute] = useState('T2');
  const [newIncOfficer, setNewIncOfficer] = useState('Inspector Carlos Arenas');

  // Interactive Demand Chart Hover State
  const [hoveredHour, setHoveredHour] = useState<any>(null);

  // Stats Quantifications
  const totalBusesActive = buses.length;
  const criticalStations = stations.filter(s => s.occupancyCurrent > 80);
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const activeIncidents = incidents.filter(i => i.status === 'active');
  const avgDelayValue = (routes.reduce((acc, r) => acc + r.delayMinutes, 0) / routes.length);

  const handleExportReport = () => {
    addToast(
      'success', 
      'Reporte Consolidado Exportado', 
      'Se ha generado y descargado el informe en tiempo real de operaciones Metrolínea (PDF/CSV).'
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncLocation || !newIncOfficer) {
      addToast('error', 'Campos incompletos', 'Por favor llena todos los campos de ubicación y responsable.');
      return;
    }

    addIncident({
      type: newIncType,
      location: newIncLocation,
      affectedRoute: `Ruta ${newIncRoute}`,
      status: 'active',
      officerInCharge: newIncOfficer
    });

    // Reset fields
    setNewIncLocation('');
    setNewIncOfficer('Inspector Auxiliar');
  };

  const handleApplyQuickFix = (routeId: string) => {
    simulateAdditionalBus(routeId);
  };

  return (
    <div id={id} className="min-h-screen bg-[#f4f7fb] text-slate-900 pb-16">
      
      {/* ADMINISTRATIVE TOPBAR ACTIONS */}
      <header className="glass sticky top-0 z-40 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToHome}
              className="border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Volver al inicio
            </Button>
            
            <div className="h-6 w-px bg-slate-350" />

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Metro<span className="text-blue-600">Flow</span> <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text font-black">AI</span>
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider pl-1.5 uppercase">// CENTRO_CONTROL</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerSimulatedAlert}
              className="bg-white border-amber-300 hover:bg-amber-50/50 text-amber-600 text-xs font-bold cursor-pointer"
              icon={<AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
            >
              Activar Alerta IA
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              className="bg-white border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reiniciar Simulación
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportReport}
              className="text-xs font-semibold bg-blue-600 cursor-pointer"
              icon={<Share2 className="w-3.5 h-3.5" />}
            >
              Exportar Reporte
            </Button>
          </div>
        </div>
      </header>

      {/* CORE OPERATIVE AREA */}
      <main className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* TELEMETRY GENERAL KPIs DASHBOARD GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Buses en Operación"
            value={`${totalBusesActive} UNID`}
            icon={<BusIcon className="w-5 h-5" />}
            subtitle="Unidades activas GPS"
            trend={{ value: '+1 Backup', isPositive: true }}
            progressValue={75}
            colorTheme="blue"
          />

          <MetricCard
            title="Retraso Promedio"
            value={`${avgDelayValue.toFixed(1)} MIN`}
            icon={<Clock className="w-5 h-5" />}
            subtitle="Regulado vía carril mixto"
            trend={{ value: '-2.4m vs horario pico', isPositive: true }}
            progressValue={Math.min(100, Math.max(10, avgDelayValue * 8))}
            colorTheme={avgDelayValue > 6 ? 'rose' : avgDelayValue > 3 ? 'amber' : 'emerald'}
          />

          <MetricCard
            title="Estaciones Congestión"
            value={`${criticalStations.length} / ${stations.length}`}
            icon={<ShieldAlert className="w-5 h-5" />}
            subtitle={`Provenza colapsando (~92%)`}
            trend={{ value: 'Alerta crítica', isPositive: false }}
            progressValue={(criticalStations.length / stations.length) * 100}
            colorTheme={criticalStations.length > 1 ? 'purple' : 'amber'}
          />

          <MetricCard
            title="Alertas Inteligentes"
            value={`${activeAlerts.length} ACT`}
            icon={<Activity className="w-5 h-5" />}
            subtitle="1 Incidente en resolución"
            trend={{ value: 'Se requiere atención', isPositive: false, isNeutral: true }}
            progressValue={80}
            colorTheme="rose"
          />
        </div>

        {/* METROFLOW CENTRAL COMMANDING INTERACTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: LEFT SIDEBAR FOR INPUT ACTIONS & LOGISTICS (SPAN 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* INCIDENTS LOGISTICS CENTER (Stateful incident adder) */}
            <Card className="p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 font-sans">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-850 uppercase tracking-wider">🛠️ Control de Incidentes Viales</h3>
                </div>
                <Badge color="red" className="animate-pulse">{activeIncidents.length} Activos</Badge>
              </div>

              {/* ACTIVE INCIDENTS LIST */}
              <div className="space-y-3 mb-4">
                {activeIncidents.length === 0 ? (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-150 rounded-lg text-center text-xs text-emerald-700 font-medium font-sans">
                    ✔ No hay incidentes activos ni bloqueos reportados. Tránsito limpio.
                  </div>
                ) : (
                  activeIncidents.map(inc => (
                    <div key={inc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:border-slate-350 transition-all font-sans">
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="font-extrabold text-slate-800 uppercase tracking-tight text-[11px] block">{inc.type}</span>
                        <Badge color="red">{inc.id}</Badge>
                      </div>

                      <div className="text-slate-600 font-semibold leading-relaxed space-y-1 mb-2.5">
                        <p>📍 <strong>Ubicación:</strong> {inc.location}</p>
                        <p>🚍 <strong>Afectación:</strong> {inc.affectedRoute}</p>
                        <p>👮 <strong>Reportó:</strong> {inc.officerInCharge}</p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => resolveIncident(inc.id)}
                        className="w-full py-1 text-[10px] bg-emerald-55 hover:bg-emerald-100/80 text-emerald-700 font-extrabold border border-emerald-150 cursor-pointer"
                        icon={<CheckCircle className="w-3.5 h-3.5" />}
                      >
                        Marcar como Resuelto
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* ADD NEW INCIDENT PANEL */}
              <form onSubmit={handleFormSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3.5 font-sans">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Reportar Nuevo Bloqueo Vía</span>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">TIPO DE INCIDENTE</label>
                  <select
                    value={newIncType}
                    onChange={(e) => setNewIncType(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Obstrucción en vía mixta">Obstrucción en vía mixta (Vehículo varado)</option>
                    <option value="Falla mecánica de bus">Falla mecánica (Metrolínea)</option>
                    <option value="Congestión severa">Congestión severa por lluvias</option>
                    <option value="Accidente de tránsito de terceros">Accidente de tránsito terceros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">UBICACIÓN O TRAMO</label>
                  <input
                    type="text"
                    value={newIncLocation}
                    onChange={(e) => setNewIncLocation(e.target.value)}
                    placeholder="Ej. Entrada Estación UIS"
                    className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">RUTA AFECTADA</label>
                    <select
                      value={newIncRoute}
                      onChange={(e) => setNewIncRoute(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">RESPONSABLE</label>
                    <input
                      type="text"
                      value={newIncOfficer}
                      onChange={(e) => setNewIncOfficer(e.target.value)}
                      placeholder="Nombre inspector"
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="danger"
                  className="w-full py-1.5 text-xs cursor-pointer hover:bg-red-700"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Agregar Bloqueo Operativo
                </Button>
              </form>
            </Card>

            {/* AI DECISION ADVISING LIST (Recommendations) */}
            <Card className="p-5 border-2 border-violet-500/20 bg-linear-to-b from-white to-violet-50/5 font-sans">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-violet-100">
                <span className="p-1.5 rounded bg-violet-100 text-violet-700">
                  <Sparkles className="w-4.5 h-4.5 text-violet-600 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-805 uppercase tracking-wider">💡 Acciones Sugeridas por IA</h3>
                  <p className="text-[9px] text-slate-400 font-medium font-semibold">Decisiones operativas automatizadas.</p>
                </div>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`p-3.5 rounded-xl border transition-all ${
                      rec.applied 
                        ? 'bg-slate-50 border-slate-200 opacity-60' 
                        : 'bg-white border-violet-150 hover:shadow-xs hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="font-extrabold text-xs text-slate-800">{rec.title}</h4>
                      <Badge color={rec.priority === 'critical' ? 'red' : rec.priority === 'high' ? 'purple' : 'yellow'}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-slate-600 text-xs mb-3 font-semibold leading-relaxed">
                      {rec.suggestion}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100/60">
                      <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase text-[9px]">
                        ★ impacto: {rec.impact}
                      </span>

                      {rec.applied ? (
                        <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 uppercase">
                          ✓ Aplicada
                        </span>
                      ) : (
                        <button
                          onClick={() => applyRecommendation(rec.id)}
                          className="text-xs px-2.5 py-1 text-white bg-linear-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 font-extrabold rounded-lg shadow-sm cursor-pointer active:scale-95 transition"
                        >
                          Aplicar Decisión IA
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* COLUMN 2: RIGHT MAIN WORKSPACE AREA WITH TABS (SPAN 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TABS CONTROLLER CONTAINER */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1 shadow-sm font-sans">
              <button
                onClick={() => setMainTab('gps')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                  mainTab === 'gps' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" /> Consola GPS & Mapas
              </button>
              <button
                onClick={() => setMainTab('corridors')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                  mainTab === 'corridors' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="w-4 h-4" /> Corredores y Regularidad
              </button>
              <button
                onClick={() => setMainTab('demand')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none relative ${
                  mainTab === 'demand' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" /> Demanda y Alertas Públicas
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
              </button>
            </div>

            {/* TAB PANELS: GPS MAP */}
            {mainTab === 'gps' && (
              <Card className="p-5 overflow-hidden animate-slide-up font-sans">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                      🗺️ Telemetría Satelital de Unidades Metrolínea en Vivo
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">Ubicación GNSS calculada de flotas.</p>
                  </div>
                  <Badge color="green">GPS Activo</Badge>
                </div>

                <SimulatedMap interactive={true} className="w-full" />

                <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
                  <div className="p-2.5 rounded bg-slate-900 text-white border border-slate-950">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Velocidad media</span>
                    <span className="font-extrabold text-blue-400 font-mono">22.8 km/h</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 text-white border border-slate-950">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Afluencia Total</span>
                    <span className="font-extrabold text-emerald-450 font-mono">4.5k Pax/h</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 text-white border border-slate-950">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Eficiencia ETA</span>
                    <span className="font-extrabold text-yellow-500 font-mono">94.7%</span>
                  </div>
                </div>
              </Card>
            )}

            {/* TAB PANELS: CORRIDORS */}
            {mainTab === 'corridors' && (
              <Card className="p-5 animate-slide-up font-sans">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">📋 Corredores de Servicio y Regularidad Operativa</h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-semibold">Consolidado general de frecuencias. Presiona +1 Bus para inyectar flotas.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Sentido</th>
                        <th className="py-2.5 px-3 text-center">Buses Act.</th>
                        <th className="py-2.5 px-3 text-center">Demora</th>
                        <th className="py-2.5 px-3">Ocupación</th>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3 text-right">Ajuste Rápido IA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold font-mono">
                      {routes.map((route) => (
                        <tr 
                          key={route.id} 
                          className={`hover:bg-slate-50/85 transition-colors cursor-pointer ${selectedRouteId === route.id ? 'bg-blue-50/20' : ''}`}
                          onClick={() => setSelectedRouteId(route.id)}
                        >
                          <td className="py-3 px-3 font-mono font-extrabold text-blue-600">{route.id}</td>
                          <td className="py-3 px-3 font-sans">
                            <span className="text-[11px] font-bold block leading-none">{route.name.split('—')[1] || route.name}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Talle: {route.avgTimeMinutes}m promedio</span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-extrabold">{route.activeBuses}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-mono font-extrabold ${route.delayMinutes > 5 ? 'text-rose-600' : 'text-slate-600'}`}>
                              +{route.delayMinutes}m
                            </span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <OccupancyBadge level={route.occupancy} showPercent={false} />
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <StatusPill status={route.status} />
                          </td>
                          <td className="py-3 px-3 text-right font-sans">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyQuickFix(route.id);
                              }}
                              className="text-[10px] py-1 px-1.5 font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-100 uppercase active:scale-95 cursor-pointer"
                            >
                              +1 Bus
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* TAB PANELS: DEMAND & ALERTS */}
            {mainTab === 'demand' && (
              <div className="space-y-6 animate-slide-up font-sans">
                
                <Card className="p-5 font-sans">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                        <TrendingUp className="w-5 h-5 text-violet-600 animate-pulse" /> 
                        Pronóstico Inteligente de Demanda de Pasajeros
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5 font-semibold">
                        Pasajeros en tiempo real y proyecciones de congestión futura diaria en Bucaramanga.
                      </p>
                    </div>
                    <div className="bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full border border-violet-150 text-[10px] font-bold uppercase">
                      Predicción Integrada
                    </div>
                  </div>

                  {/* CUSTOM TIMELINE DEMAND CHART */}
                  <div className="relative pt-6">
                    <div className="h-44 flex items-end justify-between gap-1 w-full relative">
                      <div className="absolute inset-x-0 h-1/4 border-b border-dashed border-slate-150 pointer-events-none" />
                      <div className="absolute inset-x-0 h-2/4 border-b border-dashed border-slate-150 pointer-events-none" />
                      <div className="absolute inset-x-0 h-3/4 border-b border-dashed border-slate-150 pointer-events-none" />
                      
                      {PEAK_DEMAND_FORECAST.map((item, idx) => {
                        const maxCount = 7500;
                        const percent = (item.passengers / maxCount) * 100;
                        const isPeak = item.risk === 'critical';
                        const isHigh = item.risk === 'high';

                        return (
                          <div 
                            key={idx} 
                            className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                            onMouseEnter={() => setHoveredHour(item)}
                            onMouseLeave={() => setHoveredHour(null)}
                          >
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 z-30 pointer-events-none transition-all duration-200 transform translate-y-1 group-hover:-translate-y-0 text-center w-28 bg-slate-950 text-white rounded p-1.5 text-[9px] shadow-lg">
                              <p className="font-extrabold text-slate-300 font-sans">Hora: {item.hour}</p>
                              <p className="font-bold text-emerald-450 mt-0.5 font-sans font-mono font-semibold">Demanda: {item.passengers} pax</p>
                              <p className="text-[8px] text-slate-400 font-semibold font-sans">Riesgo: {item.risk.toUpperCase()}</p>
                            </div>

                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500 relative ${
                                isPeak 
                                  ? 'bg-linear-to-t from-purple-600 to-rose-500 hover:brightness-110 shadow-lg' 
                                  : isHigh 
                                    ? 'bg-linear-to-t from-indigo-650 to-amber-500 hover:brightness-110' 
                                    : 'bg-linear-to-t from-blue-550 to-blue-200 hover:brightness-110'
                              }`}
                              style={{ height: `${percent}%` }}
                            >
                              {isPeak && <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
                            </div>

                            <span className="text-[8px] font-mono font-bold text-slate-400 mt-1.5 block leading-none">
                              {item.hour}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="h-6" />

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs flex justify-between items-center bg-slate-100/50">
                      <div className="flex items-center gap-1 text-slate-500 font-semibold">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Saturación del Corredor:</span>
                        <strong className="text-slate-800 ml-1">
                          {hoveredHour ? `${hoveredHour.hour} (${hoveredHour.passengers} Pax)` : 'Pasa el cursor sobre las barras de arriba'}
                        </strong>
                      </div>
                      <div>
                        {hoveredHour && (
                          <Badge color={hoveredHour.risk === 'critical' ? 'red' : hoveredHour.risk === 'high' ? 'yellow' : 'green'}>
                            RANGO: {hoveredHour.risk.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* PUBLIC ALERTS TABLIST CONTROL */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 font-sans">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      📢 Alertas Informativas en Tableros de Pasajeros
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 font-sans">Haz clic para resolver o investigar las alertas colectivas que ven tus pasajeros.</p>
                  </div>

                  {activeAlerts.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-450 font-medium">
                      ✓ No hay alertas emitidas en el tablero de cara al usuario.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeAlerts.map((alert) => (
                        <AlertCard 
                          key={alert.id} 
                          alert={alert} 
                          isAdmin={true} 
                          onResolve={resolveAlert}
                          onInvestigate={(id) => updateAlertStatus(id, 'investigating')}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};
