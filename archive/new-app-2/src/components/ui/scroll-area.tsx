import React from 'react';

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`relative overflow-auto ${className}`}
    {...props}
  >
    {children}
  </div>
);