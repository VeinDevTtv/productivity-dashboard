import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Task, Goal, StudySession, UserProgress, Achievement, 
  AppState, TaskFormData, GoalFormData, SessionFormData,
  TaskStatus, SessionType, TaskCategory, Priority,
  Analytics, ProductivityInsight, Notification
} from '../types';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';
import { 
  generateId, calculateXPForTask, calculateXPForSession, calculateLevelFromXP,
  calculateProductivityScore, checkAchievements, generateProductivityInsights,
  getStreakDays, calculateDailyAnalytics, calculateWeeklyAnalytics
} from '../utils/helpers';

// Main hook for managing the entire productivity hub state
export function useProductivityHub() {
  // Local storage hooks
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []);
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEYS.GOALS, []);
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>(STORAGE_KEYS.USER_PROGRESS, {
    level: 1,
    currentXP: 0,
    nextLevelXP: 1000,
    totalXP: 0,
    streakDays: 0,
    longestStreak: 0,
    lastActiveDate: new Date(),
    productivityScore: 0,
    totalStudyHours: 0,
    totalTasksCompleted: 0,
    totalGoalsCompleted: 0
  });
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');
  
  // UI state
  const [activeSession, setActiveSession] = useState<StudySession | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Update user progress whenever tasks or sessions change
  useEffect(() => {
    const totalXP = [
      ...tasks.filter(t => t.status === TaskStatus.COMPLETED).map(calculateXPForTask),
      ...studySessions.filter(s => s.endTime).map(calculateXPForSession)
    ].reduce((acc, xp) => acc + xp, 0);

    const levelInfo = calculateLevelFromXP(totalXP);
    const streakDays = getStreakDays(studySessions, tasks);
    const productivityScore = calculateProductivityScore(tasks, studySessions, goals, userProgress);
    const totalStudyHours = studySessions.reduce((acc, s) => acc + s.duration, 0) / 60;
    const totalTasksCompleted = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const totalGoalsCompleted = goals.filter(g => g.isCompleted).length;

    setUserProgress(prev => ({
      ...prev,
      level: levelInfo.level,
      currentXP: levelInfo.currentLevelXP,
      nextLevelXP: levelInfo.nextLevelXP,
      totalXP,
      streakDays,
      longestStreak: Math.max(prev.longestStreak, streakDays),
      productivityScore,
      totalStudyHours,
      totalTasksCompleted,
      totalGoalsCompleted
    }));

    // Check for new achievements
    const updatedAchievements = checkAchievements(tasks, studySessions, goals, userProgress, achievements);
    const newlyUnlocked = updatedAchievements.filter(a => 
      a.isUnlocked && !achievements.find(existing => existing.id === a.id && existing.isUnlocked)
    );

    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
      newlyUnlocked.forEach(achievement => {
        addNotification({
          type: 'success',
          title: 'Achievement Unlocked!',
          message: `${achievement.icon} ${achievement.title}`,
          action: {
            label: 'View',
            callback: () => console.log('View achievement')
          }
        });
      });
    }
  }, [tasks, studySessions, goals, achievements, userProgress, setUserProgress, setAchievements]);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Task management functions
  const createTask = useCallback((taskData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority,
      status: TaskStatus.TODO,
      deadline: taskData.deadline ? new Date(taskData.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedMinutes: taskData.estimatedMinutes,
      xpValue: 0 // Will be calculated when completed
    };

    setTasks(prev => [...prev, newTask]);
    
    addNotification({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" has been added to your list`
    });

    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  }, [setTasks]);

  const completeTask = useCallback((taskId: string, actualMinutes?: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completedTask = {
          ...task,
          status: TaskStatus.COMPLETED,
          completedAt: new Date(),
          actualMinutes,
          updatedAt: new Date()
        };
        
        const xpEarned = calculateXPForTask(completedTask);
        
        addNotification({
          type: 'success',
          title: 'Task Completed!',
          message: `Great job! You earned ${xpEarned} XP`
        });

        return completedTask;
      }
      return task;
    }));
  }, [setTasks]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    addNotification({
      type: 'info',
      title: 'Task Deleted',
      message: 'Task has been removed from your list'
    });
  }, [setTasks]);

  // Goal management functions
  const createGoal = useCallback((goalData: GoalFormData) => {
    const newGoal: Goal = {
      id: generateId(),
      title: goalData.title,
      description: goalData.description,
      category: goalData.category,
      targetValue: goalData.targetValue,
      currentValue: 0,
      unit: goalData.unit,
      deadline: goalData.deadline ? new Date(goalData.deadline) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCompleted: false,
      xpValue: 0
    };

    setGoals(prev => [...prev, newGoal]);
    
    addNotification({
      type: 'success',
      title: 'Goal Created',
      message: `"${newGoal.title}" has been set`
    });

    return newGoal;
  }, [setGoals]);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, ...updates, updatedAt: new Date() };
        
        // Check if goal is now completed
        if (!goal.isCompleted && updatedGoal.currentValue >= updatedGoal.targetValue) {
          updatedGoal.isCompleted = true;
          updatedGoal.completedAt = new Date();
          
          addNotification({
            type: 'success',
            title: 'Goal Achieved!',
            message: `🎉 Congratulations on completing "${updatedGoal.title}"`
          });
        }
        
        return updatedGoal;
      }
      return goal;
    }));
  }, [setGoals]);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    
    addNotification({
      type: 'info',
      title: 'Goal Deleted',
      message: 'Goal has been removed'
    });
  }, [setGoals]);

  // Study session management
  const startSession = useCallback((sessionData: SessionFormData) => {
    const newSession: StudySession = {
      id: generateId(),
      title: sessionData.title,
      category: sessionData.category,
      type: sessionData.type,
      startTime: new Date(),
      duration: 0,
      isActive: true,
      isPaused: false,
      pausedDuration: 0,
      xpEarned: 0
    };

    setActiveSession(newSession);
    setStudySessions(prev => [...prev, newSession]);
    
    addNotification({
      type: 'info',
      title: 'Session Started',
      message: `${sessionData.type} session is now active`
    });

    return newSession;
  }, [setStudySessions]);

  const pauseSession = useCallback(() => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, isPaused: true } : undefined);
      setStudySessions(prev => prev.map(session =>
        session.id === activeSession.id
          ? { ...session, isPaused: true }
          : session
      ));
    }
  }, [activeSession, setStudySessions]);

  const resumeSession = useCallback(() => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, isPaused: false } : undefined);
      setStudySessions(prev => prev.map(session =>
        session.id === activeSession.id
          ? { ...session, isPaused: false }
          : session
      ));
    }
  }, [activeSession, setStudySessions]);

  const endSession = useCallback((focusScore?: number, notes?: string) => {
    if (activeSession) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60));
      
      const completedSession: StudySession = {
        ...activeSession,
        endTime,
        duration,
        isActive: false,
        focusScore,
        notes,
        xpEarned: calculateXPForSession({ ...activeSession, duration, focusScore })
      };

      setStudySessions(prev => prev.map(session =>
        session.id === activeSession.id ? completedSession : session
      ));

      setActiveSession(undefined);
      
      addNotification({
        type: 'success',
        title: 'Session Complete!',
        message: `You studied for ${duration} minutes and earned ${completedSession.xpEarned} XP`
      });
    }
  }, [activeSession, setStudySessions]);

  // Notification management
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      id: generateId(),
      createdAt: new Date(),
      isRead: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Analytics calculations
  const analytics = useMemo((): Analytics => {
    const today = new Date();
    
    // Generate daily analytics for the past 30 days
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return calculateDailyAnalytics(date, tasks, studySessions, goals);
    }).reverse();

    // Generate weekly analytics for the past 12 weeks
    const weekly = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      return calculateWeeklyAnalytics(weekStart, tasks, studySessions, goals);
    }).reverse();

    // Monthly analytics would be calculated similarly
    const monthly = []; // Simplified for this implementation

    return { daily, weekly, monthly };
  }, [tasks, studySessions, goals]);

  // AI insights
  const insights = useMemo(() => {
    return generateProductivityInsights(tasks, studySessions, goals, userProgress);
  }, [tasks, studySessions, goals, userProgress]);

  // Filtered data based on selected date
  const todayTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => 
      (task.deadline && task.deadline >= today && task.deadline < tomorrow) ||
      (task.createdAt >= today && task.createdAt < tomorrow)
    );
  }, [tasks]);

  const activeTasks = useMemo(() => {
    return tasks.filter(task => task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.CANCELLED);
  }, [tasks]);

  const activeGoals = useMemo(() => {
    return goals.filter(goal => !goal.isCompleted);
  }, [goals]);

  // App state object
  const appState: AppState = {
    user: userProgress,
    tasks,
    goals,
    studySessions,
    achievements,
    insights,
    analytics,
    activeSession,
    selectedDate,
    theme,
    isLoading,
    notifications
  };

  return {
    // State
    appState,
    tasks,
    goals,
    studySessions,
    achievements,
    userProgress,
    analytics,
    insights,
    activeSession,
    theme,
    notifications,
    
    // Computed values
    todayTasks,
    activeTasks,
    activeGoals,
    
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
    setSelectedDate,
    addNotification,
    markNotificationAsRead,
    removeNotification,
    
    // Utility
    isLoading,
    setIsLoading
  };
}
