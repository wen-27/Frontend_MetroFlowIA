/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Route, Station, Bus, Alert, Incident, AiRecommendation, ChatMessage, DemandForecastPoint } from '../types';
import { metroApi } from '../services/metroApi';

const ASSISTANT_RESPONSES = [
  {
    keywords: ['como llego', 'cómo llego', 'buses a', 'ruta', 'cañaveral a estadio', 'provenza a quebras'],
    response: 'La mejor opción recomendada por IA es tomar la ruta **R1** en el **Portal Cacique**, viajar directo o tomar la ruta **R5** en el **Portal Cañaveral** hacia el **Portal Provenza**. El tiempo estimado medio es de **20-30 minutos** con una ocupación media.'
  },
  {
    keywords: ['ocupacion', 'ocupación', 'lleno', 'congestion', 'congestión', 'provenza', 'portal provenza'],
    response: 'El **Portal Provenza** presenta ocupación alta. El sistema de inteligencia artificial sugiere aplicar despacho de unidad express de apoyo.'
  },
  {
    keywords: ['tiempo', 'retraso', 'r1', 'r3', 'llegada r3'],
    response: 'La ruta **R3** posee unidades activas con frecuencia estable. El próximo bus pasará por tu estación más cercana en pocos minutos.'
  },
  {
    keywords: ['alertas', 'incidentes', 'paso algo', 'problema', 'que pasa', 'retrasos'],
    response: 'Actualmente hay alertas activas. El centro de operaciones ya está monitoreando demoras e incidentes para desplegar buses auxiliares.'
  }
];

const DEFAULT_AI_RESPONSE = 'Hola, soy el Asistente Inteligente de MetroFlow AI. Te guiaré con gusto sobre rutas, tiempos de llegada, alertas e información general en tiempo real del sistema Metrolínea.';

interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

interface MetroContextType {
  routes: Route[];
  stations: Station[];
  buses: Bus[];
  alerts: Alert[];
  incidents: Incident[];
  recommendations: AiRecommendation[];
  peakDemandForecast: DemandForecastPoint[];
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Passenger actions
  searchRoute: (origin: string, destination: string) => any;
  
  // Control center actions
  addIncident: (incident: Omit<Incident, 'id' | 'activeDurationMinutes'>) => void;
  resolveIncident: (id: string) => void;
  resolveAlert: (id: string) => void;
  updateAlertStatus: (id: string, status: Alert['status']) => void;
  applyRecommendation: (id: string) => void;
  simulateAdditionalBus: (routeId: string) => void;
  triggerSimulatedAlert: () => void;
  resetSimulation: () => void;
  
  // Chat assistance
  chatHistory: ChatMessage[];
  sendChatMessage: (text: string) => void;
  clearChat: () => void;
}

const MetroContext = createContext<MetroContextType | undefined>(undefined);

export const MetroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [peakDemandForecast, setPeakDemandForecast] = useState<DemandForecastPoint[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '🤖 ¡Hola! Soy el Asistente de Movilidad de MetroFlow AI. Te ayudaré a consultar rutas, estados del servicio en tiempo real y tiempos estimados de llegada en Metrolínea. ¿A dónde deseas viajar hoy?',
      timestamp: '09:30 AM',
      suggestions: ['¿Cómo llego de Portal Cañaveral al Portal Estadio Montanini?', '¿Hay retrasos actuales?', '¿Está llena la estación Portal Provenza?']
    }
  ]);

  const loadBackendState = async () => {
    const state = await metroApi.getState();
    setRoutes(state.routes);
    setStations(state.stations);
    setBuses(state.buses);
    setAlerts(state.alerts);
    setIncidents(state.incidents);
    setRecommendations(state.recommendations);
    setPeakDemandForecast(state.peakDemandForecast);
  };

  useEffect(() => {
    loadBackendState().catch(() => {
      addToast('error', 'Backend no disponible', 'No se pudo conectar con MetroFlow API en http://localhost:5000.');
    });
  }, []);

  // Toast utility
  const addToast = (type: 'success' | 'warning' | 'info' | 'error', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto-remove after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Search transit route intelligently based on station levels, routes, delays
  const searchRoute = (origin: string, destination: string) => {
    if (!origin || !destination || stations.length === 0 || routes.length === 0) return null;

    // Normalizing
    const orig = origin.trim().toLowerCase();
    const dest = destination.trim().toLowerCase();

    // Check matches
    const originStation = stations.find(s => s.name.toLowerCase().includes(orig)) || stations[0];
    const destStation = stations.find(s => s.name.toLowerCase().includes(dest)) || stations[2];

    const matchingRoute = routes.find(r => 
      r.name.toLowerCase().includes(originStation.name.toLowerCase()) || 
      r.name.toLowerCase().includes(destStation.name.toLowerCase())
    ) || routes[0];

    const pathMinutes = matchingRoute.avgTimeMinutes + matchingRoute.delayMinutes;
    // Calculate walking, transfers
    let walkMinutes = 4;
    let transfers = 0;
    let confidence = 96;

    if (originStation.id === 'ST-01' && destStation.id === 'ST-03') {
      // Cañaveral -> UIS (Explicit example)
      transfers = 1;
      walkMinutes = 6;
      confidence = 94;
    } else if (originStation.id === destStation.id) {
      walkMinutes = 1;
      confidence = 99;
    } else {
      transfers = Math.floor(Math.random() * 2);
      walkMinutes = Math.floor(Math.random() * 5) + 3;
      confidence = 90 + Math.floor(Math.random() * 8);
    }

    const nextBus = buses.find(b => b.routeId === matchingRoute.id) || { etaMinutes: 6, occupancy: 'medium' };

    return {
      originName: originStation.name,
      destName: destStation.name,
      routeCode: matchingRoute.id,
      routeName: matchingRoute.name,
      totalTime: pathMinutes + walkMinutes,
      nextArrivalMinutes: nextBus.etaMinutes,
      transfers,
      walkTime: walkMinutes,
      estimatedOccupancy: nextBus.occupancy,
      confidenceScore: confidence,
      status: matchingRoute.status,
      aiAdvice: `La inteligencia artificial detecta que la estación ${originStation.name} tiene un ${originStation.occupancyCurrent}% de ocupación. Se sugiere abordar en plataforma intermedia. El tiempo total aproximado es de ${pathMinutes + walkMinutes} minutos.`
    };
  };

  // Control Center actions: Add incident and trigger warnings
  const addIncident = async (newIncident: Omit<Incident, 'id' | 'activeDurationMinutes'>) => {
    const id = 'INC-' + (100 + incidents.length + 1);
    const incident: Incident = {
      ...newIncident,
      id,
      activeDurationMinutes: 1
    };

    try {
      await metroApi.createIncident(incident);
      await loadBackendState();
      addToast('error', 'Nuevo Incidente Operativo', `${incident.type} reportado en ${incident.location}.`);
    } catch {
      addToast('error', 'Error API', 'No se pudo registrar el incidente en el backend.');
    }
  };

  // Resolve Incident (Restores transit parameters)
  const resolveIncident = async (id: string) => {
    const incident = incidents.find(i => i.id === id);
    if (!incident) return;
    await metroApi.resolveIncident(id);
    await loadBackendState();
    addToast('success', 'Incidente Resuelto', `Obstrucción resuelta con éxito en ${incident.location}. Se restablecen frecuencias poco a poco.`);
  };

  // Dismiss / Resolve alert
  const resolveAlert = async (id: string) => {
    await metroApi.updateAlertStatus(id, 'resolved');
    await loadBackendState();
    addToast('info', 'Alerta Atendida', 'La notificación operativa ha sido marcada como resuelta.');
  };

  const updateAlertStatus = async (id: string, status: Alert['status']) => {
    await metroApi.updateAlertStatus(id, status);
    await loadBackendState();
    addToast('success', 'Alerta Actualizada', `El estado de la alerta es ahora: ${status.toUpperCase()}`);
  };

  // Simulate addition of a backup bus
  const simulateAdditionalBus = async (routeId: string) => {
    const targetRoute = routes.find(r => r.id === routeId);
    if (!targetRoute) return;
    await metroApi.simulateAdditionalBus(routeId);
    await loadBackendState();
    addToast('success', 'Buses Adicionales Despachados', `Unidad de refuerzo de IA incorporada a la ruta ${routeId}.`);
  };

  // Apply IA Recommendations that affects states
  const applyRecommendation = async (id: string) => {
    const rec = recommendations.find(r => r.id === id);
    if (!rec || rec.applied) return;

    await metroApi.applyRecommendation(id);

    if (rec.type === 'frequency' && rec.targetId) {
      await simulateAdditionalBus(rec.targetId);
      await simulateAdditionalBus(rec.targetId);
    } else if (rec.type === 'dispatch' && rec.targetId) {
      await simulateAdditionalBus(rec.targetId);
    }

    await loadBackendState();
    addToast('success', 'Decisión IA Aplicada', `Recomendación: "${rec.title}" se ejecutó en tiempo real.`);
  };

  // Create a randomized dynamic alert from simulated operations
  const triggerSimulatedAlert = () => {
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const alertTypes: Alert['type'][] = ['demanda inusual', 'baja frecuencia', 'alta ocupación', 'congestión'];
    const selectedType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    let description = '';
    let recommendation = '';
    let level: Alert['level'] = 'warning';

    if (selectedType === 'demanda inusual') {
      description = `Afluencia de público superior al 35% en accesos conectados a ${randomRoute.origin}.`;
      recommendation = `Desplegar flotas vacías de apoyo e incrementar intervalo a 4 minutos.`;
      level = 'warning';
    } else if (selectedType === 'baja frecuencia') {
      description = `Frecuencia extendida reportada en el tramo de ${randomRoute.destination}.`;
      recommendation = `Autorizar salidas especiales desde el taller alterno.`;
      level = 'critical';
    } else {
      description = `Aglomeración alta detectada en los torniquetes de ${randomRoute.origin}.`;
      recommendation = `Informar a pasajeros sobre la ruta ${randomRoute.id} alternativa.`;
      level = 'info';
    }

    const newAlert: Alert = {
      id: `AL-${Date.now().toString().slice(-4)}`,
      type: selectedType,
      target: randomRoute.name,
      level,
      description,
      recommendation,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'new'
    };

    setAlerts((prev) => [newAlert, ...prev]);
    addToast('warning', 'Alerta Inteligente Emitida', `Se reporta ${selectedType} en ${randomRoute.id}.`);
  };

  // Re-initialize to mock standard values
  const resetSimulation = async () => {
    await metroApi.reset();
    await loadBackendState();
    addToast('info', 'Reiniciar Simulación', 'Los datos del sistema se restablecieron a sus valores de fábrica.');
  };

  // Send message to virtual assistant
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMessage]);

    // Perform state-aware pattern matching to give exact numbers dynamically!
    // E.g. if the user asks about Provenza, give the ACTUAL stateful occupancy (which may have been reduced by dispatcher actions!)
    setTimeout(() => {
      const normalizedInput = text.toLowerCase();
      let matchedResponse = '';
      let suggestions: string[] = [];

      // Dynamic real-time values puller
      if (normalizedInput.includes('provenza')) {
        const provState = stations.find(s => s.name === 'Portal Provenza');
        const occupancy = provState ? provState.occupancyCurrent : 94;
        matchedResponse = `La estación **Portal Provenza** presenta una ocupación actual del **${occupancy}%** (${occupancy > 85 ? 'Nivel Crítico' : occupancy > 60 ? 'Alto' : 'Normal'}). ${
          occupancy > 80 
            ? 'La IA recomienda abordar las unidades exprés R5 o R6 que pasan frecuentemente.' 
            : 'El flujo de transbordo se encuentra estabilizado.'
        }`;
        suggestions = ['¿Cómo llego de Portal Cañaveral al Portal Estadio Montanini?', '¿Hay retrasos actuales?'];
      } else if (normalizedInput.includes('cañaveral') && (normalizedInput.includes('estadio') || normalizedInput.includes('montanini'))) {
        const r3Route = routes.find(r => r.id === 'R3') || routes.find(r => r.id === 'R1');
        const delay = r3Route ? r3Route.delayMinutes : 5;
        const eta = buses.find(b => b.routeId === 'R3')?.etaMinutes || 4;
        matchedResponse = `Para ir del **Portal Cañaveral** al **Portal Estadio Montanini**, la ruta recomendada es tomar el conector o la ruta **R3** (frecuencia actual: ${r3Route?.activeBuses} buses activos). El próximo bus pasará por Cañaveral en **${eta} minutos**. El trayecto estimado es de **${34 + delay} minutos** (retraso actual en ruta: ${delay} min).`;
        suggestions = ['¿Está llena la estación Portal Provenza?', '¿Hay retrasos actuales?'];
      } else if (normalizedInput.includes('retraso') || normalizedInput.includes('alertas') || normalizedInput.includes('problema')) {
        const activeDelays = routes.filter(r => r.delayMinutes > 0);
        if (activeDelays.length > 0) {
          const delayText = activeDelays.map(r => `**${r.id}** (+${r.delayMinutes} mins)`).join(', ');
          matchedResponse = `Actualmente detectamos demoras activas en: ${delayText}. El mayor retraso se ubica en el corredor de la ruta **${
            activeDelays.sort((a,b)=>b.delayMinutes - a.delayMinutes)[0]?.id
          }**. El centro de operaciones ya está desplegando buses auxiliares de apoyo.`;
        } else {
          matchedResponse = '¡Excelente noticia! Todas las rutas de Metrolínea se encuentran operando **A TIEMPO** sin retrasos significativos.';
        }
        suggestions = ['¿Cómo llego de Portal Cañaveral al Portal Estadio Montanini?', '¿Está llena la estación Portal Provenza?'];
      } else if (normalizedInput.includes('r3') || normalizedInput.includes('ruta r3')) {
        const r3 = routes.find(r => r.id === 'R3');
        const eta = buses.find(b => b.routeId === 'R3')?.etaMinutes || 4;
        matchedResponse = `La ruta **R3 (Portal Cacique ↔ Portal Estadio Montanini)** cuenta con **${r3?.activeBuses} buses activos**. Próximo arribo en **${eta} minutos**. Estado del tramo: **${r3?.status.toUpperCase()}** con retraso de **${r3?.delayMinutes} min**.`;
        suggestions = ['¿Hay retrasos en otra ruta?', '¿Cómo llego al Portal Estadio Montanini?'];
      } else {
        // Fallback search keywords
        const staticMatch = ASSISTANT_RESPONSES.find(r => 
          r.keywords.some(keyword => normalizedInput.includes(keyword))
        );
        matchedResponse = staticMatch ? staticMatch.response : DEFAULT_AI_RESPONSE;
        suggestions = ['¿Cómo llego del Portal Cañaveral al Portal Estadio Montanini?', '¿Hay retrasos actuales?', '¿Está llena la estación Portal Provenza?'];
      }

      const aiMsgId = Math.random().toString(36).substring(2, 9);
      setChatHistory((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: matchedResponse,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          suggestions
        }
      ]);
    }, 900);
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: 'welcome',
        sender: 'ai',
        text: '🤖 Historial reiniciado. Cuéntame, ¿en qué puedo asistirte con respecto al sistema de Metrolínea hoy?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['¿Cómo llego del Portal Cañaveral al Portal Estadio Montanini?', '¿Hay retrasos?', '¿Qué tan llena está la estación Portal Provenza?']
      }
    ]);
  };

  return (
    <MetroContext.Provider
      value={{
        routes,
        stations,
        buses,
        alerts,
        incidents,
        recommendations,
        peakDemandForecast,
        toasts,
        addToast,
        removeToast,
        searchRoute,
        addIncident,
        resolveIncident,
        resolveAlert,
        updateAlertStatus,
        applyRecommendation,
        simulateAdditionalBus,
        triggerSimulatedAlert,
        resetSimulation,
        chatHistory,
        sendChatMessage,
        clearChat
      }}
    >
      {children}
    </MetroContext.Provider>
  );
};

export const useMetro = () => {
  const context = useContext(MetroContext);
  if (context === undefined) {
    throw new Error('useMetro must be used within a MetroProvider');
  }
  return context;
};
