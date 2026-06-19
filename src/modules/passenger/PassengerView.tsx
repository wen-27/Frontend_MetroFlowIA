/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMetro } from '../../contexts/MetroContext';
import { SimulatedMap } from '../../components/organisms/SimulatedMap';
import { AssistantChat } from '../../components/organisms/AssistantChat';
import { StatusPill } from '../../components/atoms/StatusPill';
import { Badge } from '../../components/atoms/Badge';
import { OccupancyBadge } from '../../components/molecules/OccupancyBadge';
import { AlertCard } from '../../components/molecules/AlertCard';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Navigation, 
  Bell, 
  Compass, 
  Route as RouteIcon,
  ChevronsRight,
  UserCheck
} from 'lucide-react';

interface PassengerViewProps {
  onBackToHome: () => void;
  id?: string;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  onBackToHome,
  id
}) => {
  const { routes, stations, buses, alerts, searchRoute, addToast } = useMetro();

  // Search state
  const [origin, setOrigin] = useState('Cañaveral');
  const [destination, setDestination] = useState('UIS');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Tabs for alerts list vs predictions
  const [activeTab, setActiveTab] = useState<'predictions' | 'alerts'>('predictions');
  
  // Tabs for main content pane (sidebar setup)
  const [mainTab, setMainTab] = useState<'map' | 'etas' | 'chat'>('map');

  // Trigger optimal path calculation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      addToast('error', 'Campos vacíos', 'Por favor selecciona un punto de inicio y un destino.');
      return;
    }
    if (origin === destination) {
      addToast('warning', 'Mismo punto', 'El origen y el destino no pueden ser el mismo.');
      return;
    }

    const result = searchRoute(origin, destination);
    setSearchResult(result);
    setHasSearched(true);
    addToast('success', 'Ruta Optimizada de IA', `Cálculo de recorrido exitoso hacia ${destination}.`);
  };

  // Preset quick origin / destination setters
  const handleQuickSearch = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
    const result = searchRoute(orig, dest);
    setSearchResult(result);
    setHasSearched(true);
  };

  // Filter routes delay or alert list count
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  return (
    <div id={id} className="min-h-screen bg-[#f4f7fb] text-slate-900 pb-16">
      
      {/* HEADER SECTION */}
      <header className="glass sticky top-0 z-40 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToHome}
              className="border-slate-350 hover:bg-slate-100 text-slate-700 cursor-pointer"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Volver al inicio
            </Button>
            
            <div className="h-6 w-px bg-slate-300" />
 
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
                Metro<span className="text-blue-600">Flow</span> <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text font-black">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PASAJERO: ONLINE
              </span>
            </div>
          </div>
 
          <div className="flex items-center gap-2">
            {/* Quick alert badge counter */}
            <span className="text-xs text-slate-500 font-semibold hidden md:inline">
              Bucaramanga • Serv. Activo
            </span>
            <button
              onClick={() => {
                setActiveTab('alerts');
                addToast('info', 'Incidentes Críticos', `Mostrando ${activeAlerts.length} alertas activas del sistema.`);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100/60 cursor-pointer transition"
              title="Alertas activas"
            >
              <Bell className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER BODY GRAPH */}
      <main className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 lg:px-8">
        
        {/* Banner with brief user help */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-5 md:p-6 mb-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-300 via-pink-500 to-violet-800 rounded-full" />
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-lg md:text-xl font-bold tracking-tight mb-1 flex items-center gap-1.5">
              Portal del Pasajero Inteligente <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            </h2>
            <p className="text-slate-100 text-xs md:text-sm leading-relaxed opacity-95">
              Nuestra IA calcula tiempos estimados basados en telemetría satelital continua de buses e histórico de congestión. Consulta rutas recomendadas con filtros automáticos de cuello de botella operativos.
            </p>
          </div>
        </div>

        {/* TWO-COLUMN SIDEBAR LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: LEFT SIDEBAR (SPAN 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ROUTE SEARCH FORM */}
            <Card className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-600" /> Planificador de Ruta IA
              </h3>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">📍 ESTACIÓN DE ORIGEN</label>
                  <div className="relative">
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800"
                    >
                      {stations.map(st => (
                        <option key={st.id} value={st.name}>{st.name} {st.occupancyCurrent > 75 ? '⚠️(Llena)' : ''}</option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">🏁 ESTACIÓN DESEA IR (DESTINO)</label>
                  <div className="relative">
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-800"
                    >
                      {stations.map(st => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                    <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-2.5"
                  icon={<Search className="w-4 h-4" />}
                >
                  Buscar Mejor Ruta
                </Button>
              </form>

              {/* Quick links preset searches for presentation */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block mb-2">BÚSQUEDAS FRECUENTES RECOMENDADAS:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleQuickSearch('Cañaveral', 'UIS')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                  >
                    Cañaveral → UIS
                  </button>
                  <button
                    onClick={() => handleQuickSearch('Provenza', 'Centro')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                  >
                    Provenza → Centro
                  </button>
                  <button
                    onClick={() => handleQuickSearch('Girón', 'Provenza')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                  >
                    Girón → Provenza
                  </button>
                </div>
              </div>
            </Card>

            {/* ROUTE FINDER RESULT CARD */}
            {hasSearched && searchResult && (
              <Card className="border-2 border-violet-500/30 bg-linear-to-b from-white to-violet-50/5 p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <Badge color="purple" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Sugerencia Red Neutra IA
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-500">Confianza: {searchResult.confidenceScore}%</span>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">CÁLCULO ÓPTIMO</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{searchResult.totalTime}</span>
                    <span className="text-xs font-bold text-slate-500">minutos totales</span>
                  </div>
                </div>

                {/* Animated graphic path nodes */}
                <div className="my-4 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{searchResult.originName}</p>
                      <p className="text-[9px] text-slate-400">Aborda la ruta troncal <strong className="text-indigo-600">{searchResult.routeCode}</strong></p>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-350 ml-1.5 h-6 my-1" />

                  {searchResult.transfers > 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Estación Provenza (Transbordo)</p>
                          <p className="text-[9px] text-slate-400">Cambio a vehículo expreso sentido Norte</p>
                        </div>
                      </div>
                      <div className="border-l-2 border-dashed border-slate-350 ml-1.5 h-6 my-1" />
                    </>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 block flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{searchResult.destName}</p>
                      <p className="text-[9px] text-slate-400">Llegada estimada a destino</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic meta information parameters */}
                <div className="grid grid-cols-2 gap-2 my-4 text-center">
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Próximo arribo</span>
                    <span className="font-extrabold text-[#2563eb] text-sm flex items-center justify-center gap-0.5">
                      <Clock className="w-3.5 h-3.5" /> En {searchResult.nextArrivalMinutes}m
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Ocupación bus</span>
                    <div className="mt-1 flex justify-center">
                      <OccupancyBadge level={searchResult.estimatedOccupancy} showPercent={false} />
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed italic bg-violet-50/50 p-2.5 rounded-lg border border-violet-100 font-medium">
                  "{searchResult.aiAdvice}"
                </p>
              </Card>
            )}

            {/* QUICK REAL-TIME TRANSIT ADVISER Badges status */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Ocupación Estaciones Críticas:</h4>
              <div className="space-y-2">
                {stations.slice(0, 3).map(st => (
                  <div key={st.id} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{st.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{st.occupancyCurrent}%</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        st.riskLevel === 'critical' ? 'bg-purple-600 animate-pulse' : st.riskLevel === 'high' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMN 2: MAIN WORKSPACE AREA WITH TABS (SPAN 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TABS CONTROLLER CONTAINER */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1 shadow-sm">
              <button
                onClick={() => setMainTab('map')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                  mainTab === 'map' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" /> Mapa En Vivo (GPS)
              </button>
              <button
                onClick={() => setMainTab('etas')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none ${
                  mainTab === 'etas' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" /> Tiempos de Viaje (ETA)
              </button>
              <button
                onClick={() => setMainTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer focus:outline-none relative ${
                  mainTab === 'chat' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> Asistente de Viaje IA
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
              </button>
            </div>

            {/* TAB PANELS: MAP */}
            {mainTab === 'map' && (
              <Card className="p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight uppercase">Consola Interactiva del Corredor Bucaramanga</h3>
                  </div>
                  <Badge color="green">GPS Activo</Badge>
                </div>
                
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  El mapa interactivo simula la geolocalización GNSS de los buses. Haz clic en las estaciones o buses para consultar flujos, velocidad media, e instrucciones de la IA en tiempo real.
                </p>

                <SimulatedMap interactive={true} className="w-full" />
                
                <div className="mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs text-slate-600 leading-relaxed font-semibold">
                  📌 <strong>Guía del Usuario:</strong> Los buses con etiqueta <span className="text-indigo-600 font-bold">T2</span> y <span className="text-purple-600 font-bold">P8</span> circulan en carriles exclusivos de la Autopista Sur. Las líneas punteadas muestran el sentido de avance satelital continuo.
                </div>
              </Card>
            )}

            {/* TAB PANELS: ETAS */}
            {mainTab === 'etas' && (
              <div className="space-y-6 animate-slide-up">
                
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                    ⏱️ Horarios Estimados de Arribo (ETA)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routes.map((route) => {
                      const associatedBuses = buses.filter(b => b.routeId === route.id);
                      const nearestBus = associatedBuses.length > 0 
                        ? associatedBuses.sort((a,b) => a.etaMinutes - b.etaMinutes)[0]
                        : null;
                      
                      return (
                        <Card key={route.id} className="p-3.5 hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-7 h-7 bg-blue-50 text-blue-700 font-extrabold rounded-md flex items-center justify-center text-xs border border-blue-150 font-mono">
                                {route.id}
                              </span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-slate-800 leading-none truncate">{route.name}</h4>
                                <p className="text-[9px] text-slate-400 mt-0.5 truncate">{route.origin} → {route.destination}</p>
                              </div>
                            </div>

                            <StatusPill status={route.status} customText={route.delayMinutes > 3 ? `+${route.delayMinutes}m` : 'Normal'} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-50 text-xs">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400">Próxima unidad</span>
                              <strong className="text-slate-800 text-xs mt-0.5 flex items-center gap-1 font-mono">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {nearestBus ? `en ${nearestBus.etaMinutes} min` : 'Sin datos'}
                              </strong>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 block pb-0.5">Ocupación estimada</span>
                              <OccupancyBadge level={route.occupancy} showPercent={false} />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
                    🔔 Incidencias Colectivas y Alertas de Corredor
                  </h3>

                  {activeAlerts.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50/50 border border-slate-200 rounded-xl">
                      <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-medium">No hay alertas activas en el corredor Metrolínea.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} isAdmin={false} />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB PANELS: CHAT */}
            {mainTab === 'chat' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 animate-slide-up space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1">
                    💬 Chat Conversacional Asistente de Viajes
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Haz tus consultas sobre retrasos, incidentes, mejores rutas y horarios de Bucaramanga y el área metropolitana en un entorno conversacional interactivo.</p>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                  <AssistantChat />
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};
