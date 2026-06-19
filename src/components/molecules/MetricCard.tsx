/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../atoms/Card';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean; // positive is good
    isNeutral?: boolean;
  };
  subtitle?: string;
  badge?: React.ReactNode;
  progressValue?: number; // 0 - 100 For visually rich dashboards
  colorTheme?: 'blue' | 'purple' | 'amber' | 'rose' | 'emerald';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  icon,
  trend,
  subtitle,
  badge,
  progressValue,
  colorTheme = 'blue'
}) => {
  const themeStyles = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-600' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-600' },
    amber: { text: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-600' },
    rose: { text: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-600' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-600' }
  };

  const selectedTheme = themeStyles[colorTheme];

  return (
    <Card id={id} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${selectedTheme.bg} ${selectedTheme.text}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          {trend && (
            <span className={`font-semibold ${
              trend.isNeutral 
                ? 'text-slate-500' 
                : trend.isPositive 
                  ? 'text-emerald-600' 
                  : 'text-rose-600'
            }`}>
              {trend.isNeutral ? '•' : trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
        {badge}
      </div>

      {progressValue !== undefined && (
        <div className="mt-3.5 w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${selectedTheme.bar} transition-all duration-500`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      )}
    </Card>
  );
};
