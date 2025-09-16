import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon, { type IconName } from '../ui/Icon';

interface QuickAction {
  id: string;
  label: string;
  icon: IconName;
  description?: string;
  color?: string;
  variant?: 'primary' | 'secondary' | 'gradient';
  onClick: () => void;
  disabled?: boolean;
  badge?: string | number;
}

interface QuickActionsWidgetProps {
  title?: string;
  actions: QuickAction[];
  layout?: 'grid' | 'list';
  variant?: 'default' | 'glass' | 'elevated';
  animate?: boolean;
  className?: string;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  title = 'Quick Actions',
  actions,
  layout = 'grid',
  variant = 'default',
  animate = true,
  className = ''
}) => {
  const getButtonVariant = (actionVariant?: QuickAction['variant']) => {
    switch (actionVariant) {
      case 'primary': return 'primary';
      case 'secondary': return 'secondary';
      case 'gradient': return 'gradient';
      default: return 'secondary';
    }
  };

  return (
    <Card variant={variant} className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <Icon name="lightning" size={18} className="text-yellow-500" />
      </div>
      
      <div className={`
        ${layout === 'grid' 
          ? `grid gap-3 ${
              actions.length === 1 ? 'grid-cols-1' :
              actions.length === 2 ? 'grid-cols-2' :
              actions.length <= 4 ? 'grid-cols-2 lg:grid-cols-4' :
              'grid-cols-2 lg:grid-cols-3'
            }`
          : 'space-y-3'
        }
      `}>
        {actions.map((action, index) => (
          layout === 'grid' ? (
            <Button
              key={action.id}
              variant={getButtonVariant(action.variant)}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                relative p-4 h-auto flex-col gap-2 min-h-[80px]
                ${animate ? 'animate-scaleIn' : ''}
                hover:shadow-lg hover:scale-[1.02]
                transition-all duration-200
              `}
              style={{
                animationDelay: animate ? `${index * 100}ms` : '0ms',
                ...(action.color && {
                  backgroundColor: `${action.color}10`,
                  borderColor: `${action.color}30`,
                  color: action.color
                })
              }}
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {action.badge}
                </div>
              )}
              
              <Icon 
                name={action.icon} 
                size={24} 
                color={action.color || 'currentColor'}
              />
              <span className="text-sm font-medium text-center">
                {action.label}
              </span>
              
              {action.description && (
                <span className="text-xs opacity-75 text-center">
                  {action.description}
                </span>
              )}
            </Button>
          ) : (
            <div
              key={action.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700
                transition-all duration-200 hover:shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50
                ${animate ? 'animate-slideUp' : ''}
              `}
              style={{ animationDelay: animate ? `${index * 50}ms` : '0ms' }}
            >
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${action.color || '#6b7280'}20` }}
              >
                <Icon 
                  name={action.icon} 
                  size={20} 
                  color={action.color || '#6b7280'}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {action.label}
                </h4>
                {action.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {action.badge && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {action.badge}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="p-2"
                >
                  <Icon name="chevron-right" size={16} />
                </Button>
              </div>
            </div>
          )
        ))}
      </div>
      
      {actions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Icon name="lightning" size={32} className="mx-auto mb-2 opacity-50" />
          <p>No quick actions available</p>
        </div>
      )}
    </Card>
  );
};

export default QuickActionsWidget;
