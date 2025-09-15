// Core Types for Productivity Hub

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedMinutes?: number;
  actualMinutes?: number;
  xpValue: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  xpValue: number;
}

export interface StudySession {
  id: string;
  title?: string;
  category: TaskCategory;
  type: SessionType;
  startTime: Date;
  endTime?: Date;
  duration: number;
  isActive: boolean;
  isPaused: boolean;
  pausedDuration: number;
  notes?: string;
  focusScore?: number;
  xpEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  xpValue: number;
  rarity: AchievementRarity;
}

export interface UserProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: Date;
  productivityScore: number;
  totalStudyHours: number;
  totalTasksCompleted: number;
  totalGoalsCompleted: number;
}

export interface ProductivityInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  recommendation: string;
  impact: InsightImpact;
  dataPoints: Array<{
    label: string;
    value: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  generatedAt: Date;
}

export interface Analytics {
  daily: DailyAnalytics[];
  weekly: WeeklyAnalytics[];
  monthly: MonthlyAnalytics[];
}

export interface DailyAnalytics {
  date: Date;
  studyMinutes: number;
  tasksCompleted: number;
  goalsProgress: number;
  focusScore: number;
  xpEarned: number;
  sessionCount: number;
  categories: Record<TaskCategory, number>;
}

export interface WeeklyAnalytics {
  weekStart: Date;
  totalStudyMinutes: number;
  totalTasksCompleted: number;
  totalGoalsCompleted: number;
  averageFocusScore: number;
  totalXPEarned: number;
  consistencyScore: number;
  mostProductiveDay: string;
  categories: Record<TaskCategory, number>;
}

export interface MonthlyAnalytics {
  month: number;
  year: number;
  totalStudyHours: number;
  totalTasksCompleted: number;
  totalGoalsCompleted: number;
  averageFocusScore: number;
  totalXPEarned: number;
  streakDays: number;
  productivityTrend: 'improving' | 'declining' | 'stable';
  achievements: Achievement[];
}

export interface AppState {
  user: UserProgress;
  tasks: Task[];
  goals: Goal[];
  studySessions: StudySession[];
  achievements: Achievement[];
  insights: ProductivityInsight[];
  analytics: Analytics;
  activeSession?: StudySession;
  selectedDate: Date;
  theme: 'light' | 'dark';
  isLoading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface TaskFormData {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  deadline?: string;
  estimatedMinutes?: number;
}

export interface GoalFormData {
  title: string;
  description?: string;
  category: TaskCategory;
  targetValue: number;
  unit: string;
  deadline?: string;
}

export interface SessionFormData {
  title?: string;
  category: TaskCategory;
  type: SessionType;
  duration?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  date?: Date;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  category?: string;
}

export enum TaskCategory {
  STUDY = 'Study',
  PERSONAL = 'Personal',
  FITNESS = 'Fitness',
  WORK = 'Work',
  HOBBY = 'Hobby',
  HEALTH = 'Health',
  SOCIAL = 'Social',
  OTHER = 'Other'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SessionType {
  POMODORO = 'pomodoro',
  DEEP_WORK = 'deep_work',
  CUSTOM = 'custom',
  BREAK = 'break'
}

export enum AchievementCategory {
  TASKS = 'tasks',
  STUDY_TIME = 'study_time',
  CONSISTENCY = 'consistency',
  FOCUS = 'focus',
  GOALS = 'goals',
  SPECIAL = 'special'
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum InsightType {
  PRODUCTIVITY_PATTERN = 'productivity_pattern',
  FOCUS_TREND = 'focus_trend',
  CATEGORY_DISTRIBUTION = 'category_distribution',
  OPTIMAL_SCHEDULE = 'optimal_schedule',
  STREAK_OPPORTUNITY = 'streak_opportunity',
  GOAL_RECOMMENDATION = 'goal_recommendation'
}

export enum InsightImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
