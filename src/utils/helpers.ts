import { formatDate as format, isToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, addDays, subDays } from './dateUtils';
import { 
  Task, Goal, StudySession, UserProgress, Achievement, 
  TaskCategory, Priority, DailyAnalytics, WeeklyAnalytics,
  ProductivityInsight, InsightType, InsightImpact
} from '../types';
import { 
  XP_VALUES, LEVEL_PROGRESSION, ACHIEVEMENTS, CATEGORY_COLORS, 
  PRIORITY_COLORS, DEFAULT_SETTINGS 
} from './constants';

export const formatDate = format;

export const isDateToday = isToday;

export const getWeekRange = (date: Date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
};

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
};

export const calculateXPForTask = (task: Task): number => {
  let baseXP = XP_VALUES.TASK_COMPLETION[task.priority];
  if (task.deadline && task.completedAt && task.completedAt <= task.deadline) {
    baseXP *= 1.2;
  }
  return Math.round(baseXP);
};

export const calculateXPForSession = (session: StudySession): number => {
  let baseXP = session.duration * XP_VALUES.STUDY_SESSION_PER_MINUTE;
  if (session.focusScore && session.focusScore >= 8) {
    baseXP *= 1.3;
  }
  return Math.round(baseXP);
};

export const calculateLevelFromXP = (totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } => {
  let level = 1;
  let xpForNextLevel = LEVEL_PROGRESSION.BASE_XP;
  let totalXPForCurrentLevel = 0;
  
  while (totalXP >= xpForNextLevel) {
    totalXPForCurrentLevel = xpForNextLevel;
    level++;
    xpForNextLevel = Math.round(LEVEL_PROGRESSION.BASE_XP * Math.pow(LEVEL_PROGRESSION.MULTIPLIER, level - 1));
  }
  
  return {
    level,
    currentLevelXP: totalXP - totalXPForCurrentLevel,
    nextLevelXP: xpForNextLevel - totalXPForCurrentLevel
  };
};

export const calculateGoalProgress = (goal: Goal): number => {
  return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
};

export const calculateProductivityScore = (
  tasks: Task[],
  sessions: StudySession[],
  goals: Goal[],
  userProgress: UserProgress
): number => {
  const weeklyStudyMinutes = sessions
    .filter(s => s.startTime >= getWeekRange().start)
    .reduce((acc, s) => acc + s.duration, 0);
  const targetWeeklyMinutes = DEFAULT_SETTINGS.goals.dailyStudyTarget * 7;
  const studyScore = Math.min((weeklyStudyMinutes / targetWeeklyMinutes) * 100, 100);
  
  return Math.round(studyScore);
};

export const checkAchievements = (
  tasks: Task[],
  sessions: StudySession[],
  goals: Goal[],
  userProgress: UserProgress,
  currentAchievements: Achievement[]
): Achievement[] => {
  return ACHIEVEMENTS.map(achievementDef => {
    const existing = currentAchievements.find(a => a.id === achievementDef.id);
    let progress = 0;
    
    if (achievementDef.id === 'first_task') {
      progress = tasks.filter(t => t.status === 'completed').length;
    }
    
    const achievement: Achievement = {
      ...achievementDef,
      progress,
      isUnlocked: progress >= achievementDef.requirement,
      unlockedAt: progress >= achievementDef.requirement ? new Date() : undefined
    };
    
    return existing ? { ...existing, ...achievement } : achievement;
  });
};

export const generateProductivityInsights = (
  tasks: Task[],
  sessions: StudySession[],
  goals: Goal[],
  userProgress: UserProgress
): ProductivityInsight[] => {
  return [];
};

export const getCategoryColor = (category: TaskCategory): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS[TaskCategory.OTHER];
};

export const getPriorityColor = (priority: Priority): string => {
  return PRIORITY_COLORS[priority];
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getStreakDays = (sessions: StudySession[], tasks: Task[]): number => {
  return 0; // Simplified for now
};

export const calculateDailyAnalytics = (
  date: Date,
  tasks: Task[],
  sessions: StudySession[],
  goals: Goal[]
): DailyAnalytics => {
  return {
    date,
    studyMinutes: 0,
    tasksCompleted: 0,
    goalsProgress: 0,
    focusScore: 0,
    xpEarned: 0,
    sessionCount: 0,
    categories: {
      [TaskCategory.STUDY]: 0,
      [TaskCategory.PERSONAL]: 0,
      [TaskCategory.FITNESS]: 0,
      [TaskCategory.WORK]: 0,
      [TaskCategory.HOBBY]: 0,
      [TaskCategory.HEALTH]: 0,
      [TaskCategory.SOCIAL]: 0,
      [TaskCategory.OTHER]: 0,
    }
  };
};

export const calculateWeeklyAnalytics = (
  weekStart: Date,
  tasks: Task[],
  sessions: StudySession[],
  goals: Goal[]
): WeeklyAnalytics => {
  return {
    weekStart,
    totalStudyMinutes: 0,
    totalTasksCompleted: 0,
    totalGoalsCompleted: 0,
    averageFocusScore: 0,
    totalXPEarned: 0,
    consistencyScore: 0,
    mostProductiveDay: 'Monday',
    categories: {
      [TaskCategory.STUDY]: 0,
      [TaskCategory.PERSONAL]: 0,
      [TaskCategory.FITNESS]: 0,
      [TaskCategory.WORK]: 0,
      [TaskCategory.HOBBY]: 0,
      [TaskCategory.HEALTH]: 0,
      [TaskCategory.SOCIAL]: 0,
      [TaskCategory.OTHER]: 0,
    }
  };
};
