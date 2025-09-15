import React from 'react';
import { UserProgress, Notification as NotificationType } from '../../types';
import { formatDate } from '../../utils/helpers';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface HeaderProps {
  userProgress: UserProgress;
  notifications: NotificationType[];
  onNotificationClick: (id: string) => void;
  onClearNotifications: () => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({
  userProgress,
  notifications,
  onNotificationClick,
  onClearNotifications,
  currentView
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getViewTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Task Management';
      case 'goals': return 'Goal Tracking';
      case 'sessions': return 'Study Timer';
      case 'analytics': return 'Analytics';
      case 'insights': return 'AI Insights';
      case 'achievements': return 'Achievements';
      default: return 'StudyHub';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to crush your goals today?",
      "Every study session counts!",
      "You're building something amazing!",
      "Progress, not perfection!",
      "Your future self will thank you!",
      "Knowledge is power!",
      "One step closer to your dreams!",
      "Stay focused and keep going!"
    ];
    const today = new Date().getDate();
    return messages[today % messages.length];
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title and greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {getViewTitle(currentView)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getGreeting()}! {getMotivationalMessage()}
          </p>
        </div>

        {/* Right: User info and notifications */}
        <div className="flex items-center gap-4">
          {/* Current streak */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <span className="text-lg">🔥</span>
            <div className="text-sm">
              <div className="font-medium text-orange-600">{userProgress.streakDays} day streak</div>
            </div>
          </div>

          {/* Level display */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-lg">⚡</span>
            <div className="text-sm">
              <div className="font-medium text-blue-600">Level {userProgress.level}</div>
              <div className="text-xs text-gray-500">
                {userProgress.currentXP}/{userProgress.nextLevelXP} XP
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Notifications</h3>
                      {notifications.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={onClearNotifications}
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <span className="text-2xl mb-2 block">🔕</span>
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                          onClick={() => {
                            onNotificationClick(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(notification.createdAt, 'MMM dd, HH:mm')}
                              </p>
                              {notification.action && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="mt-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.action?.callback();
                                    setShowNotifications(false);
                                  }}
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick stats on mobile */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-orange-600 font-medium">{userProgress.streakDays}🔥</span>
            <span className="text-blue-600 font-medium">L{userProgress.level}</span>
          </div>
        </div>
      </div>

      {/* Quick action bar (optional) */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span>📅</span>
          <span>{formatDate(new Date())}</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span>💯</span>
          <span>Productivity: {userProgress.productivityScore}/100</span>
        </div>
        
        {userProgress.totalStudyHours > 0 && (
          <>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <span>📚</span>
              <span>{Math.round(userProgress.totalStudyHours)}h studied total</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
