/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { AlertCircle, AlertTriangle, Info, Clock, Check, ArrowRight } from 'lucide-react';
import { Alert } from '../../types';

interface AlertCardProps {
  alert: Alert;
  isAdmin?: boolean;
  onResolve?: (id: string) => void;
  onInvestigate?: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  isAdmin = false,
  onResolve,
  onInvestigate
}) => {
  const levelConfig = {
    info: {
      border: 'border-l-4 border-l-blue-500 border-slate-100',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      badgeColor: 'blue' as const,
      bg: 'bg-blue-50/20'
    },
    warning: {
      border: 'border-l-4 border-l-amber-500 border-slate-100',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      badgeColor: 'yellow' as const,
      bg: 'bg-amber-50/20'
    },
    critical: {
      border: 'border-l-4 border-l-rose-500 border-slate-100',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />,
      badgeColor: 'red' as const,
      bg: 'bg-rose-50/10'
    }
  };

  const style = levelConfig[alert.level];

  return (
    <Card className={`${style.border} ${style.bg} p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-xs`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {style.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-slate-800 text-sm">
              {alert.target}
            </span>
            <Badge color={style.badgeColor} className="capitalize">
              {alert.type}
            </Badge>
            {alert.status === 'resolved' ? (
              <Badge color="green">Resuelta</Badge>
            ) : alert.status === 'investigating' ? (
              <Badge color="yellow">En Revisión</Badge>
            ) : (
              <Badge color="slate" className="animate-pulse">Nueva</Badge>
            )}
            
            <span className="text-slate-400 text-xs flex items-center gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {alert.timestamp}
            </span>
          </div>

          <h4 className="text-slate-700 text-sm mb-1.5 leading-relaxed">{alert.description}</h4>
          
          <div className="mt-2.5 bg-slate-50/80 rounded-md p-2 border border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-violet-700 block mb-0.5">💡 Recomendación de MetroFlow AI:</span>
            {alert.recommendation}
          </div>

          {isAdmin && alert.status !== 'resolved' && (
            <div className="mt-3 flex items-center gap-2 justify-end pt-1.5 border-t border-slate-100/50">
              {alert.status === 'new' && onInvestigate && (
                <button
                  onClick={() => onInvestigate(alert.id)}
                  className="text-xs px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition font-medium"
                >
                  Marcar en revisión
                </button>
              )}
              {onResolve && (
                <button
                  onClick={() => onResolve(alert.id)}
                  className="text-xs px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition font-medium flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Resolver
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
