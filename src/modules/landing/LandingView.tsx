/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewSelectorCard } from '../../components/molecules/ViewSelectorCard';
import { 
  Bus, 
  Map, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  BrainCircuit, 
  Clock, 
  Activity, 
  Compass, 
  Wifi, 
  ChevronRight,
  TrendingUp,
  Sliders,
  BellRing
} from 'lucide-react';
import { useMetro } from '../../contexts/MetroContext';

interface LandingViewProps {
  onSelectView: (view: 'passenger' | 'admin') => void;
  id?: string;
}

export const LandingView: React.FC<LandingViewProps> = ({ 
  onSelectView, 
  id 
}) => {
  const { routes, stations, alerts } = useMetro();

  // Quantify live parameters to populate selector cards dynamic badges
  const activeAlertsCount = alerts.filter(a => a.status !== 'resolved').length;
  const criticalStationsCount = stations.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high').length;
  const maxDelay = Math.max(...routes.map(r => r.delayMinutes));

  const passengerIndicators = [
    { label: 'ETA Próximo Bus', value: '6 min', color: 'emerald' as const },
    { label: 'Ocupación Promedio', value: 'Ajustada', color: 'violet' as const },
    { label: 'Rutas Habilitadas', value: '5 Corredores' },
    { label: 'Soporte Clientes', value: 'Asistente IA' }
  ];

  const adminIndicators = [
    { label: 'Alertas Operativas', value: `${activeAlertsCount} Activas`, color: activeAlertsCount > 1 ? 'rose' : 'emerald' as const },
    { label: 'Cuellos de Botella', value: `${criticalStationsCount} Estaciones`, color: criticalStationsCount > 0 ? 'amber' : 'emerald' as const },
    { label: 'Demorá Máxima', value: `+${maxDelay} min`, color: maxDelay > 5 ? 'rose' : 'emerald' as const },
    { label: 'Demanda 1 Hor.', value: '+24% Previsto', color: 'violet' as const }
  ];

  const problemsList = [
    { title: "Tiempos de espera inciertos", text: "Pasajeros pierden tiempo valioso en estaciones debido a la falta de información confiable en tiempo real." },
    { title: "Estaciones colapsadas", text: "Plataformas como Provenza y Cañaveral experimentan picos de congestión severos sin aviso previo." },
    { title: "Buses con alta ocupación", text: "Dificultad de planificación que obliga a abordar unidades saturadas que comprometen la comodidad." },
    { title: "Retrasos e incidentes opacos", text: "Falta de canales automatizados y conversacionales para notificar desvíos surgidos de imprevistos viales." }
  ];

  const solutionsList = [
    { title: "Predicción de llegada exacta", text: "Modelado predictivo continuo de tiempos estimados de arribo (ETA) alimentado por coordenadas GNSS." },
    { title: "Control de afluencia preventiva", text: "Alertas tempranas de mitigación que avisan al operador 20 minutos antes de que ocurra una saturación física." },
    { title: "Asistencia de rutas alternativas", text: "Asistente inteligente que calcula transbordos alternos basándose en demoras para acortar caminatas." },
    { title: "Despacho dinámico automatizado", text: "Botones operativos de toma de decisión rápida sugeridos por IA para agregar vehículos de reserva." }
  ];

  return (
    <div id={id} className="min-h-screen bg-slate-50/50 text-slate-900 pb-16 relative overflow-hidden">
      
      {/* Structural visual header banner */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-blue-50/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-blue-100/30 blur-3xl pointer-events-none" />
      <div className="absolute top-[15%] right-[5%] w-[350px] h-[350px] rounded-full bg-violet-100/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8 relative z-10">
        
        {/* Core display navigation title block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-violet-600/10 to-blue-600/10 border border-violet-200/50 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-700 mb-6 backdrop-blur-xs">
            <BrainCircuit className="w-4 h-4 animate-spin-slow text-violet-600" />
            <span>SISTEMA DE MOVILIDAD INTELIGENTE OPTIMIZADO CON IA</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4 bg-clip-text">
            Metro<span className="text-blue-600">Flow</span> <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">AI</span>
          </h1>
          
          <p className="text-lg md:text-xl font-medium text-slate-600 mb-3">
            Movilidad inteligente para Metrolínea
          </p>
          
          <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
            Plataforma interactiva de alta fidelidad basada en inteligencia artificial para predecir tiempos de llegada, estimar ocupación de andenes, recomendar desvíos óptimos y coordinar despachos operativos en tiempo real.
          </p>
        </div>

        {/* ACCESS GATEWAY CARDS SELECTOR GRID */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <ViewSelectorCard
            title="Experiencia del Pasajero"
            description="Consulta de forma rápida e inteligente qué bus tomar, a qué hora pasará, su nivel de saturación de pasajeros y obtén recomendaciones del Asistente Virtual."
            icon={<Bus className="w-6 h-6" />}
            buttonText="Entrar como Pasajero"
            onClick={() => onSelectView('passenger')}
            variant="passenger"
            indicators={passengerIndicators}
          />

          <ViewSelectorCard
            title="Centro de Control Inteligente"
            description="Supervisión analítica global dirigida a coordinadores viales. Monitorea unidades activas, visualiza riesgos de congestión y ejecuta ajustes mecánicos sugeridos por IA."
            icon={<Map className="w-6 h-6" />}
            buttonText="Entrar al Centro de Control"
            onClick={() => onSelectView('admin')}
            variant="admin"
            indicators={adminIndicators}
          />
        </div>

        {/* METROFLOW AI CORE TECHNOLOGIES */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs max-w-5xl mx-auto mb-20 relative">
          <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-slate-350">
            METROFLOW-CORE // V1.4
          </div>
          
          <div className="flex items-center gap-2 mb-8">
            <span className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tecnologías de Inteligencia Artificial Aplicadas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Predicción de Tiempos (ETA)</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Algoritmos de regresión temporal que analizan la velocidad media del carril mixto, semáforos y bloqueos para proveer tiempos exactos de arribo a estaciones.
              </p>
            </div>

            <div className="p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-violet-600 font-bold text-sm">
                <Activity className="w-4 h-4" />
                <span>Análisis de Densidad</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Estimadores de peso y conteo por cámaras térmicas integradas en torniquetes para predecir e identificar cuellos de botella 20 minutos antes de que ocurran.
              </p>
            </div>

            <div className="p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-sm">
                <Compass className="w-4 h-4" />
                <span>Despacho Inteligente</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Agente despachador experto que calcula automáticamente el impacto de inyectar buses vacíos o modificar frecuencias para estabilizar la afluencia en horas pico.
              </p>
            </div>
          </div>
        </div>

        {/* COMPARATIVE MATRIX: THE PROBLEM VS THE SOLUTION */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-2xl font-bold tracking-tight text-slate-800 mb-10">
            ¿Cómo MetroFlow AI revoluciona la gestión de Metrolínea?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Problem block */}
            <div className="bg-rose-50/40 rounded-2xl border border-rose-100 p-6 md:p-8">
              <div className="flex items-center gap-2.5 text-rose-700 font-bold text-lg mb-6">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse" />
                <span>El Desafío Metrolínea</span>
              </div>

              <div className="space-y-5">
                {problemsList.map((prob, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="w-5 h-5 bg-rose-105 border border-rose-200 text-rose-700 rounded-full flex items-center justify-center text-xs font-bold leading-none mt-0.5 flex-shrink-0">
                      ✗
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{prob.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">{prob.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Solution block */}
            <div className="bg-emerald-50/40 rounded-2xl border border-emerald-100 p-6 md:p-8">
              <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-lg mb-6">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>La Solución MetroFlow AI</span>
              </div>

              <div className="space-y-5">
                {solutionsList.map((sol, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="w-5 h-5 bg-emerald-105 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold leading-none mt-0.5 flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-850 text-sm">{sol.title}</h4>
                      <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-semibold">{sol.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200/50 text-xs text-slate-400 font-medium">
          Métrica de Desempeño: Precisión global de ETA actual del 94.7% · Bucaramanga, Colombia
        </div>

      </div>
    </div>
  );
};
