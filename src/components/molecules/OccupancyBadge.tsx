/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Badge } from '../atoms/Badge';

type OccupancyLevel = 'low' | 'medium' | 'high' | 'critical';

interface OccupancyBadgeProps {
  level: OccupancyLevel;
  showPercent?: boolean;
  className?: string;
  percentage?: number;
}

export const OccupancyBadge: React.FC<OccupancyBadgeProps> = ({
  level,
  showPercent = true,
  className = '',
  percentage
}) => {
  const levelConfig: Record<OccupancyLevel, { label: string; color: 'green' | 'yellow' | 'red' | 'purple'; percentage: number; bg: string }> = {
    low: {
      label: 'Baja',
      color: 'green',
      percentage: percentage || 25,
      bg: 'emerald-500'
    },
    medium: {
      label: 'Media',
      color: 'yellow',
      percentage: percentage || 55,
      bg: 'amber-500'
    },
    high: {
      label: 'Alta',
      color: 'red',
      percentage: percentage || 82,
      bg: 'rose-500'
    },
    critical: {
      label: 'Crítica',
      color: 'purple',
      percentage: percentage || 95,
      bg: 'violet-600'
    }
  };

  const item = levelConfig[level];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Badge color={item.color}>
        {item.label} {showPercent && `${item.percentage}%`}
      </Badge>
      
      {/* Mini state visualization with 3 dots */}
      <div className="flex gap-0.5" title={`${item.label} ocupación`}>
        <span className={`w-1.5 h-1.5 rounded-full ${level === 'low' || level === 'medium' || level === 'high' || level === 'critical' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
        <span className={`w-1.5 h-1.5 rounded-full ${level === 'medium' || level === 'high' || level === 'critical' ? 'bg-amber-500' : 'bg-slate-200'}`} />
        <span className={`w-1.5 h-1.5 rounded-full ${level === 'high' || level === 'critical' ? 'bg-rose-500' : 'bg-slate-200'}`} />
        <span className={`w-1.5 h-1.5 rounded-full ${level === 'critical' ? 'bg-violet-600 animate-pulse' : 'bg-slate-200'}`} />
      </div>
    </div>
  );
};
