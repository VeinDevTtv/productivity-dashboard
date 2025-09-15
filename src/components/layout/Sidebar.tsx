import React from 'react';
import { UserProgress } from '../../types';
import LevelProgress from '../gamification/LevelProgress';
import Button from '../ui/Button';

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
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'sessions', label: 'Study Timer', icon: '⏱️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'insights', label: 'AI Insights', icon: '🤖' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
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
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  activeView === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="text-lg">{item.icon}</span>
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
            className="w-full justify-start"
            title={isCollapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {!isCollapsed && (
              <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </Button>
          
          {!isCollapsed && (
            <div className="text-xs text-secondary text-center">
              Made with ❤️ for students
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
