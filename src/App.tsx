/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MetroProvider, useMetro } from './contexts/MetroContext';
import { LandingView } from './modules/landing/LandingView';
import { PassengerView } from './modules/passenger/PassengerView';
import { ControlCenterView } from './modules/controlCenter/ControlCenterView';
import { Badge } from './components/atoms/Badge';
import { 
  Sparkles, 
  Map, 
  User, 
  Cpu, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XOctagon, 
  HelpCircle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

function NavigationFooter({ currentView, setView }: { currentView: string; setView: (v: any) => void }) {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full shadow-lg flex items-center gap-6 z-50">
      <button 
        onClick={() => setView('landing')} 
        className={`text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer focus:outline-none ${
          currentView === 'landing' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-blue-600'
        }`}
      >
        <HelpCircle className="w-4 h-4" /> Inicio
      </button>

      <div className="w-px h-4 bg-slate-300" />

      <button 
        onClick={() => setView('passenger')} 
        className={`text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer focus:outline-none ${
          currentView === 'passenger' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-blue-600'
        }`}
      >
        <User className="w-4 h-4" /> Pasajero
      </button>

      <div className="w-px h-4 bg-slate-300" />

      <button 
        onClick={() => setView('admin')} 
        className={`text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer focus:outline-none ${
          currentView === 'admin' ? 'text-violet-600 font-extrabold' : 'text-slate-500 hover:text-violet-600'
        }`}
      >
        <Shield className="w-4 h-4" /> Centro de Control
      </button>
    </nav>
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'passenger' | 'admin'>('landing');
  const { toasts, removeToast } = useMetro();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans selection:bg-blue-600/10 text-slate-900 flex flex-col justify-between">
      
      {/* PRIMARY ACTIVE VIEW */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingView onSelectView={(view) => setCurrentView(view)} />
        )}
        {currentView === 'passenger' && (
          <PassengerView onBackToHome={() => setCurrentView('landing')} />
        )}
        {currentView === 'admin' && (
          <ControlCenterView onBackToHome={() => setCurrentView('landing')} />
        )}
      </div>

      {/* PERSISTENT FLOATING ACCESSIBILITY NAVIGATION SHORTCUTS */}
      <NavigationFooter currentView={currentView} setView={setCurrentView} />

      {/* REAL-TIME SYSTEM STATE POPUP TOASTS */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((toast) => {
          const styles = {
            success: {
              border: 'border-l-4 border-l-emerald-500 border-slate-100',
              bg: 'bg-white/95 backdrop-blur-md',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            },
            warning: {
              border: 'border-l-4 border-l-amber-500 border-slate-100',
              bg: 'bg-white/95 backdrop-blur-md',
              icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
            },
            error: {
              border: 'border-l-4 border-l-rose-500 border-slate-100',
              bg: 'bg-white/95 backdrop-blur-md',
              icon: <XOctagon className="w-5 h-5 text-rose-500" />
            },
            info: {
              border: 'border-l-4 border-l-blue-500 border-slate-100',
              bg: 'bg-white/95 backdrop-blur-md',
              icon: <Info className="w-5 h-5 text-blue-500" />
            }
          };

          const cur = styles[toast.type];

          return (
            <div
              key={toast.id}
              className={`p-4 rounded-xl shadow-lg flex items-start gap-3 pointer-events-auto transition-all duration-300 border animate-slide-up ${cur.border} ${cur.bg}`}
            >
              <div className="flex-shrink-0 mt-0.5">{cur.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">{toast.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 rounded-md p-1 hover:bg-slate-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <MetroProvider>
      <MainApp />
    </MetroProvider>
  );
}
