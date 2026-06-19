/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { ChevronRight, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ViewSelectorCardProps {
  id?: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  variant: 'passenger' | 'admin';
  indicators: Array<{ label: string; value: string | number; color?: 'emerald' | 'amber' | 'rose' | 'violet' }>;
}

export const ViewSelectorCard: React.FC<ViewSelectorCardProps> = ({
  id,
  title,
  description,
  icon,
  buttonText,
  onClick,
  variant,
  indicators
}) => {
  const isPassenger = variant === 'passenger';
  
  return (
    <Card 
      id={id}
      onClick={onClick}
      hoverable
      className={`relative p-6 flex flex-col justify-between overflow-hidden border-2 transition-all duration-300 group ${
        isPassenger 
          ? 'hover:border-blue-500/80 bg-linear-to-b from-white to-blue-50/10' 
          : 'hover:border-violet-500/80 bg-linear-to-b from-white to-violet-50/10'
      }`}
    >
      {/* Absolute graphic glow backdrop styling */}
      <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-30 transition-all duration-500 group-hover:scale-150 ${
        isPassenger ? 'bg-blue-400' : 'bg-purple-400'
      }`} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3.5 rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-110 ${
            isPassenger 
              ? 'bg-blue-600 text-white' 
              : 'bg-linear-to-br from-violet-600 to-indigo-600 text-white'
          }`}>
            {icon}
          </div>
          
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            isPassenger 
              ? 'bg-blue-50/50 text-blue-700 border-blue-200' 
              : 'bg-violet-50/50 text-violet-700 border-violet-200'
          }`}>
            {isPassenger ? <Sparkles className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {isPassenger ? 'Consulta Ciudadana (IA)' : 'Backoffice Crítico'}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2 group-hover:text-slate-900 leading-snug">
          {title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {/* Visual indicators widget box */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          {isPassenger ? '📊 Mini Indicadores en Tiempo Real:' : '⚡ Parámetros de Monitoreo:'}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-8">
          {indicators.map((ind, idx) => {
            const colors = {
              emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
              amber: 'bg-amber-50 text-amber-700 border-amber-100',
              rose: 'bg-rose-50 text-rose-700 border-rose-100',
              violet: 'bg-violet-50 text-violet-700 border-violet-100',
            };
            const col = ind.color ? colors[ind.color] : 'bg-slate-50 text-slate-700 border-slate-150';
            
            return (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border text-xs flex flex-col justify-center ${col}`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">{ind.label}</span>
                <span className="font-extrabold text-sm mt-0.5">{ind.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <Button 
          variant={isPassenger ? 'primary' : 'intelligence'} 
          className="w-full justify-between"
          icon={<ArrowRight className="w-4 h-4 order-last group-hover:translate-x-1 transition-transform" />}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};
