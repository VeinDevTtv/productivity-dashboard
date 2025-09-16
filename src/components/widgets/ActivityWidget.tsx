import React from 'react';
import Card from '../ui/Card';
import Icon from '../ui/Icon';

interface ActivityItem {
  id: string;
  type: 'task_completed' | 'goal_achieved' | 'session_finished' | 'level_up' | 'achievement_unlocked';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: {
    xp?: number;
    duration?: number;
    category?: string;
  };
}

interface ActivityWidgetProps {
  title?: string;
  activities: ActivityItem[];
  maxItems?: number;
  showTimestamps?: boolean;
  variant?: 'default' | 'glass' | 'compact';
  className?: string;
}

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  title = 'Recent Activity',
  activities,
  maxItems = 5,
  showTimestamps = true,
  variant = 'default',
  className = ''
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed': return { icon: 'check' as const, color: '#10b981' };
      case 'goal_achieved': return { icon: 'target' as const, color: '#3b82f6' };
      case 'session_finished': return { icon: 'clock' as const, color: '#8b5cf6' };
      case 'level_up': return { icon: 'lightning' as const, color: '#f59e0b' };
      case 'achievement_unlocked': return { icon: 'trophy' as const, color: '#ef4444' };
      default: return { icon: 'star' as const, color: '#6b7280' };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const getTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed': return 'Task Completed';
      case 'goal_achieved': return 'Goal Achieved';
      case 'session_finished': return 'Study Session';
      case 'level_up': return 'Level Up';
      case 'achievement_unlocked': return 'Achievement';
      default: return 'Activity';
    }
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card variant={variant} className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
        <Icon name="clock" size={18} className="text-gray-400" />
      </div>
      
      {displayActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Icon name="calendar" size={32} className="mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity, index) => {
            const { icon, color } = getActivityIcon(activity.type);
            
            return (
              <div
                key={activity.id}
                className={`
                  flex items-start gap-3 p-3 rounded-lg
                  transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50
                  animate-slideUp
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon name={icon} size={16} color={color} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </h4>
                    {showTimestamps && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  {activity.description && variant !== 'compact' && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium" style={{ color }}>
                      {getTypeLabel(activity.type)}
                    </span>
                    
                    {activity.metadata?.xp && (
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Icon name="lightning" size={10} />
                        <span>+{activity.metadata.xp} XP</span>
                      </div>
                    )}
                    
                    {activity.metadata?.duration && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Icon name="clock" size={10} />
                        <span>{Math.round(activity.metadata.duration / 60)}m</span>
                      </div>
                    )}
                    
                    {activity.metadata?.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.metadata.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {activities.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all activity ({activities.length} items)
          </button>
        </div>
      )}
    </Card>
  );
};

export default ActivityWidget;
