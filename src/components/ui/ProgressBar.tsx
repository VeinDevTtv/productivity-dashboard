import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  color?: string;
  variant?: 'default' | 'gradient' | 'animated' | 'striped';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = true,
  showPercentage = true,
  color,
  variant = 'default',
  size = 'md',
  animate = true,
  label,
  className = ''
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  // Animate value changes
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animate]);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2', 
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const labelSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base'
  };

  const getProgressColor = () => {
    if (color) return color;
    
    // Dynamic color based on progress
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#3b82f6'; // blue  
    if (percentage >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const progressColor = getProgressColor();

  const barClasses = [
    'w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700',
    sizeClasses[size],
    variant === 'striped' ? 'bg-striped' : '',
    className
  ].filter(Boolean).join(' ');

  const fillClasses = [
    'h-full transition-all duration-1000 ease-out rounded-full',
    variant === 'gradient' ? 'bg-gradient-to-r' : '',
    variant === 'animated' ? 'animate-pulse' : '',
    variant === 'striped' ? 'bg-striped-animated' : ''
  ].filter(Boolean).join(' ');

  const getFillStyle = () => {
    const baseStyle = {
      width: `${animatedValue}%`,
      transition: animate ? 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
    };

    if (variant === 'gradient') {
      return {
        ...baseStyle,
        background: `linear-gradient(90deg, ${progressColor}, ${adjustColorBrightness(progressColor, 20)})`
      };
    }

    return {
      ...baseStyle,
      backgroundColor: progressColor
    };
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (color: string, amount: number) => {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let b = (num >> 8 & 0x00FF) + amount;
    let g = (num & 0x0000FF) + amount;
    
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    
    return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-gray-700 dark:text-gray-300 ${labelSizes[size]}`}>
            {label || `${value} / ${max}`}
          </span>
          {showPercentage && (
            <span className={`font-medium text-gray-500 dark:text-gray-400 ${labelSizes[size]}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={barClasses}>
        <div
          className={fillClasses}
          style={getFillStyle()}
        >
          {/* Shimmer effect for animated variant */}
          {variant === 'animated' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
          
          {/* Glow effect for high progress */}
          {percentage > 80 && variant !== 'default' && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 10px ${progressColor}40`,
                animation: 'pulse 2s infinite'
              }}
            />
          )}
        </div>
      </div>

      {/* Value indicator */}
      {size === 'lg' || size === 'xl' ? (
        <div className="relative">
          <div 
            className="absolute top-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent transition-all duration-1000"
            style={{
              left: `${Math.max(0, Math.min(95, animatedValue - 2))}%`,
              borderBottomColor: progressColor
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ProgressBar;
