import React from 'react';
import Card from '../ui/Card';
import Icon, { type IconName } from '../ui/Icon';

interface StatItem {
  label: string;
  value: string | number;
  icon: IconName;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: string;
  trend?: number[];
}

interface StatsWidgetProps {
  title?: string;
  stats: StatItem[];
  variant?: 'default' | 'glass' | 'gradient';
  animate?: boolean;
  className?: string;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  stats,
  variant = 'default',
  animate = true,
  className = ''
}) => {
  const getChangeColor = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType?: 'increase' | 'decrease' | 'neutral'): IconName => {
    switch (changeType) {
      case 'increase': return 'arrow-up';
      case 'decrease': return 'arrow-down';
      case 'neutral': return 'arrow-right';
      default: return 'arrow-right';
    }
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      }
      if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card 
      variant={variant} 
      className={`${className}`}
      animate={animate}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}
      
      <div className={`grid gap-4 ${
        stats.length === 1 ? 'grid-cols-1' :
        stats.length === 2 ? 'grid-cols-2' :
        stats.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 lg:grid-cols-4'
      }`}>
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`
              relative p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50
              transition-all duration-300 hover:shadow-md hover:scale-[1.02]
              ${animate ? 'animate-fadeIn' : ''}
              bg-gradient-to-br from-white to-gray-50/50 
              dark:from-gray-800 dark:to-gray-900/50
            `}
            style={{ 
              animationDelay: animate ? `${index * 100}ms` : '0ms',
              borderColor: stat.color ? `${stat.color}20` : undefined
            }}
          >
            {/* Background decoration */}
            <div 
              className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-10"
              style={{ backgroundColor: stat.color || '#6b7280' }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Icon 
                  name={stat.icon} 
                  size={20} 
                  className="flex-shrink-0"
                  color={stat.color || 'currentColor'}
                />
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${getChangeColor(stat.changeType)}`}>
                    <Icon name={getChangeIcon(stat.changeType)} size={12} />
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              
              <div className="mb-1">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: stat.color || 'currentColor' }}
                >
                  {formatValue(stat.value)}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
              
              {/* Mini trend line */}
              {stat.trend && stat.trend.length > 0 && (
                <div className="mt-2 h-6 flex items-end gap-px">
                  {stat.trend.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm opacity-70 transition-all duration-300 hover:opacity-100"
                      style={{
                        height: `${Math.max(2, (value / Math.max(...stat.trend!)) * 100)}%`,
                        backgroundColor: stat.color || '#6b7280'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatsWidget;
