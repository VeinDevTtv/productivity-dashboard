import React from 'react';
import { UserProgress } from '../../types';
import LevelProgress from '../gamification/LevelProgress';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface SidebarProps {
  userProgress: UserProgress;
  activeView: string;
  onViewChange: (view: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userProgress,
  activeView,
  onViewChange,
  theme,
  onThemeToggle,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' as const },
    { id: 'tasks', label: 'Tasks', icon: 'tasks' as const },
    { id: 'goals', label: 'Goals', icon: 'target' as const },
    { id: 'sessions', label: 'Study Timer', icon: 'timer' as const },
    { id: 'analytics', label: 'Analytics', icon: 'chart' as const },
    { id: 'insights', label: 'AI Insights', icon: 'brain' as const },
    { id: 'achievements', label: 'Achievements', icon: 'trophy' as const },
  ];

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StudyHub
            </h1>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 transform hover:scale-110"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon 
              name={isCollapsed ? 'chevron-right' : 'chevron-left'} 
              size={20}
              className="transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Level Progress - Compact when collapsed */}
      {!isCollapsed && (
        <div className="p-4">
          <LevelProgress userProgress={userProgress} compact />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-700/50'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon 
                  name={item.icon} 
                  size={isCollapsed ? 20 : 18}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    activeView === item.id ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme Toggle and Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <Button
            onClick={onThemeToggle}
            variant="ghost"
            icon={theme === 'dark' ? 'sun' : 'moon'}
            className="w-full justify-start"
            title={isCollapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          >
            {!isCollapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </Button>
          
          {!isCollapsed && (
            <div className="text-xs text-secondary text-center flex items-center justify-center gap-1">
              Made with <Icon name="heart" size={12} className="text-red-500 animate-pulse" /> for students
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
