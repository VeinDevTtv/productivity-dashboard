import React, { useState } from 'react';
import { useProductivityHub } from './hooks/useProductivityHub';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardOverview from './components/dashboard/DashboardOverview';
import TaskList from './components/tasks/TaskList';
import GoalList from './components/goals/GoalList';
import SessionTimer from './components/sessions/SessionTimer';
import SessionHistory from './components/sessions/SessionHistory';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import AIInsights from './components/insights/AIInsights';
import AchievementsPanel from './components/gamification/AchievementsPanel';
import Tabs from './components/ui/Tabs';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    // State
    userProgress,
    tasks,
    goals,
    studySessions,
    achievements,
    analytics,
    insights,
    activeSession,
    theme,
    notifications,
    
    // Task functions
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    
    // Goal functions
    createGoal,
    updateGoal,
    deleteGoal,
    
    // Session functions
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    
    // UI functions
    setTheme,
    markNotificationAsRead,
    removeNotification
  } = useProductivityHub();

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleClearNotifications = () => {
    notifications.forEach(n => removeNotification(n.id));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardOverview
            tasks={tasks}
            goals={goals}
            sessions={studySessions}
            userProgress={userProgress}
            achievements={achievements}
            onTaskComplete={completeTask}
            onTaskEdit={(task) => updateTask(task.id, task)}
            onTaskDelete={deleteTask}
            onGoalEdit={(goal) => updateGoal(goal.id, goal)}
            onGoalDelete={deleteGoal}
            onGoalUpdateProgress={(goalId, newValue) => updateGoal(goalId, { currentValue: newValue })}
          />
        );
        
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
            showCompleted={true}
          />
        );
        
      case 'goals':
        return (
          <GoalList
            goals={goals}
            onCreateGoal={createGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            showCompleted={true}
          />
        );
        
      case 'sessions':
        const sessionTabs = [
          {
            id: 'timer',
            label: 'Timer',
            icon: '⏱️',
            content: (
              <SessionTimer
                activeSession={activeSession}
                onStartSession={startSession}
                onPauseSession={pauseSession}
                onResumeSession={resumeSession}
                onEndSession={endSession}
              />
            )
          },
          {
            id: 'history',
            label: 'History',
            icon: '📚',
            content: (
              <SessionHistory sessions={studySessions} />
            )
          }
        ];
        
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Study Sessions</h2>
            <Tabs tabs={sessionTabs} defaultTab="timer" />
          </div>
        );
        
      case 'analytics':
        return (
          <AnalyticsDashboard
            sessions={studySessions}
            tasks={tasks}
            goals={goals}
            analytics={analytics}
          />
        );
        
      case 'insights':
        return (
          <AIInsights
            insights={insights}
            userProgress={userProgress}
          />
        );
        
      case 'achievements':
        return (
          <AchievementsPanel achievements={achievements} />
        );
        
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        userProgress={userProgress}
        activeView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          userProgress={userProgress}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onClearNotifications={handleClearNotifications}
          currentView={currentView}
        />

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className={`max-w-7xl mx-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : ''}`}>
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Notifications overlay */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 animate-slideIn ${
                notification.type === 'success' ? 'bg-green-100 border-green-500 text-green-800' :
                notification.type === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                notification.type === 'error' ? 'bg-red-100 border-red-500 text-red-800' :
                'bg-blue-100 border-blue-500 text-blue-800'
              } border-l-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-current opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading overlay (if needed) */}
      {/* Add loading state here if needed */}
    </div>
  );
}

export default App;