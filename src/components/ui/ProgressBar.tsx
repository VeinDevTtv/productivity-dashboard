import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabel = true,
  color = 'var(--color-primary)',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const barClasses = [
    'progress-bar',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{value} / {max}</span>
          <span className="text-sm text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={barClasses}>
        <div
          className="progress-fill transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
