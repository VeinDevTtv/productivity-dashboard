import { TaskCategory, Priority, SessionType, AchievementCategory, AchievementRarity } from '../types';

export const XP_VALUES = {
  TASK_COMPLETION: {
    [Priority.LOW]: 10,
    [Priority.MEDIUM]: 25,
    [Priority.HIGH]: 50,
    [Priority.URGENT]: 75,
  },
  STUDY_SESSION_PER_MINUTE: 2,
};

export const LEVEL_PROGRESSION = {
  BASE_XP: 1000,
  MULTIPLIER: 1.5,
};

export const SESSION_DURATIONS = {
  [SessionType.POMODORO]: 25,
  [SessionType.DEEP_WORK]: 90,
  [SessionType.CUSTOM]: 60,
  [SessionType.BREAK]: 15,
};

export const CATEGORY_COLORS = {
  [TaskCategory.STUDY]: '#6366f1',
  [TaskCategory.PERSONAL]: '#8b5cf6',
  [TaskCategory.FITNESS]: '#10b981',
  [TaskCategory.WORK]: '#f59e0b',
  [TaskCategory.HOBBY]: '#06b6d4',
  [TaskCategory.HEALTH]: '#ef4444',
  [TaskCategory.SOCIAL]: '#ec4899',
  [TaskCategory.OTHER]: '#6b7280',
};

export const PRIORITY_COLORS = {
  [Priority.LOW]: '#6b7280',
  [Priority.MEDIUM]: '#f59e0b',
  [Priority.HIGH]: '#f97316',
  [Priority.URGENT]: '#ef4444',
};

export const ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    category: AchievementCategory.TASKS,
    requirement: 1,
    xpValue: 50,
    rarity: AchievementRarity.COMMON,
  },
];

export const PRODUCTIVITY_TIPS = [
  "Break large tasks into smaller, manageable chunks",
  "Use the Pomodoro Technique for better focus",
  "Set specific deadlines for your goals",
  "Review your progress weekly",
];

export const STORAGE_KEYS = {
  TASKS: 'productivity_hub_tasks',
  GOALS: 'productivity_hub_goals',
  STUDY_SESSIONS: 'productivity_hub_sessions',
  USER_PROGRESS: 'productivity_hub_progress',
  ACHIEVEMENTS: 'productivity_hub_achievements',
  THEME: 'productivity_hub_theme',
};

export const CHART_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#ef4444',
];

export const DEFAULT_SETTINGS = {
  theme: 'light' as const,
  goals: {
    dailyStudyTarget: 120,
  },
};

export const GOAL_UNITS = [
  'tasks',
  'hours',
  'minutes',
  'sessions',
  'pages',
  'chapters',
];

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  TIME: 'HH:mm',
};
