/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

type TransitStatus = 'normal' | 'delayed' | 'congested' | 'critical' | 'adjusted';

interface StatusPillProps {
  status: TransitStatus;
  customText?: string;
  className?: string;
  id?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ 
  status, 
  customText,
  className = '', 
  id 
}) => {
  const config: Record<TransitStatus, { bg: string; text: string; dot: string; label: string }> = {
    normal: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Operando Normal'
    },
    delayed: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500 animate-pulse',
      label: 'Retraso Detectado'
    },
    congested: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Alta Congestión'
    },
    critical: {
      bg: 'bg-red-100 border-red-300',
      text: 'text-red-700 font-semibold',
      dot: 'bg-red-600 animate-ping duration-1000',
      label: 'Frecuencia Crítica'
    },
    adjusted: {
      bg: 'bg-violet-50 border-violet-200',
      text: 'text-violet-700',
      dot: 'bg-violet-500',
      label: 'Frecuencia Optimizada'
    }
  };

  const item = config[status];

  return (
    <div
      id={id}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${item.bg} ${item.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      <span>{customText || item.label}</span>
    </div>
  );
};
