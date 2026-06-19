/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  id,
  className = '',
  hoverable = false,
  onClick
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-5 clean-shadow transition-all duration-300 
        ${hoverable ? 'hover:shadow-md hover:border-slate-300 cursor-pointer hover:-translate-y-0.5' : ''} 
        ${className}`}
    >
      {children}
    </div>
  );
};
