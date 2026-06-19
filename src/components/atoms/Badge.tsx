/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'blue', 
  className = '', 
  id 
}) => {
  const colorMap: Record<BadgeColor, string> = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
};
