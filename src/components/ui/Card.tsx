import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'outlined';
  interactive?: boolean;
  animate?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  variant = 'default',
  interactive = false,
  animate = true,
  style,
  onClick
}) => {
  const paddingClasses = {
    none: '',
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const baseClasses = `
    rounded-lg transition-all duration-300 ease-out
    ${animate ? 'transform-gpu' : ''}
    ${(hover || interactive || onClick) ? 'cursor-pointer' : ''}
    ${animate && (hover || interactive || onClick) ? 'hover:scale-[1.02] hover:-translate-y-1' : ''}
  `.replace(/\s+/g, ' ').trim();

  const variantClasses = {
    default: `
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      shadow-sm hover:shadow-md
    `,
    glass: `
      bg-white/70 dark:bg-gray-800/70 
      backdrop-blur-md border border-white/20 dark:border-gray-700/20
      shadow-lg hover:shadow-xl
      before:absolute before:inset-0 before:bg-gradient-to-br 
      before:from-white/10 before:to-transparent before:rounded-lg before:pointer-events-none
      relative overflow-hidden
    `,
    elevated: `
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      shadow-lg hover:shadow-2xl
      ring-1 ring-black/5 dark:ring-white/5
    `,
    gradient: `
      bg-gradient-to-br from-white via-blue-50 to-indigo-100
      dark:from-gray-800 dark:via-gray-800 dark:to-gray-900
      border border-blue-200 dark:border-gray-700
      shadow-lg hover:shadow-xl
      relative overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-br 
      before:from-blue-500/5 before:to-purple-500/5 before:rounded-lg before:pointer-events-none
    `,
    outlined: `
      bg-transparent 
      border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
      hover:bg-gray-50/50 dark:hover:bg-gray-800/50
    `
  };

  const interactiveClasses = interactive || onClick ? `
    hover:shadow-lg active:scale-[0.98]
    focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50
  ` : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    interactiveClasses,
    paddingClasses[padding],
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={classes} 
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-lg pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

export default Card;
