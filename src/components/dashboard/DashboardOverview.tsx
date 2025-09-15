import React from 'react';
import { Task, Goal, StudySession, UserProgress, Achievement } from '../../types';
import { formatDuration, calculateGoalProgress } from '../../utils/helpers';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import LevelProgress from '../gamification/LevelProgress';
import TaskCard from '../tasks/TaskCard';
import GoalCard from '../goals/GoalCard';

interface DashboardOverviewProps {
  tasks: Task[];
  goals: Goal[];
  sessions: StudySession[];
  userProgress: UserProgress;
  achievements: Achievement[];
  onTaskComplete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onGoalEdit: (goal: Goal) => void;
  onGoalDelete: (goalId: string) => void;
  onGoalUpdateProgress: (goalId: string, newValue: number) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tasks,
  goals,
  sessions,
  userProgress,
  achievements,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
  onGoalEdit,
  onGoalDelete,
  onGoalUpdateProgress
}) => {
  // Filter data for dashboard
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const todayTasks = activeTasks.filter(t => 
    (t.deadline && t.deadline >= today && t.deadline < tomorrow) ||
    (t.createdAt >= today && t.createdAt < tomorrow)
  ).slice(0, 5);
  
  const urgentTasks = activeTasks
    .filter(t => t.priority === 'urgent' || (t.deadline && t.deadline <= tomorrow))
    .slice(0, 3);

  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);
  
  const recentSessions = sessions
    .filter(s => s.endTime && s.startTime >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 5);

  const recentAchievements = achievements
    .filter(a => a.isUnlocked && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3);

  // Calculate today's stats
  const todayStats = {
    studyTime: sessions
      .filter(s => s.startTime >= today && s.startTime < tomorrow && s.endTime)
      .reduce((acc, s) => acc + s.duration, 0),
    tasksCompleted: tasks
      .filter(t => t.completedAt && t.completedAt >= today && t.completedAt < tomorrow)
      .length,
    focusScore: (() => {
      const todaySessions = sessions.filter(s => 
        s.startTime >= today && s.startTime < tomorrow && s.focusScore
      );
      return todaySessions.length > 0
        ? todaySessions.reduce((acc, s) => acc + (s.focusScore || 0), 0) / todaySessions.length
        : 0;
    })()
  };

  const getQuickActionItems = () => {
    const actions = [];
    
    if (activeTasks.length === 0) {
      actions.push({
        icon: '📝',
        title: 'Create your first task',
        description: 'Start organizing your work with tasks',
        color: 'blue'
      });
    } else if (todayTasks.length === 0) {
      actions.push({
        icon: '🎯',
        title: 'Plan today\'s tasks',
        description: 'Set deadlines for today to stay focused',
        color: 'green'
      });
    }

    if (activeGoals.length === 0) {
      actions.push({
        icon: '🚀',
        title: 'Set a goal',
        description: 'Define what you want to achieve',
        color: 'purple'
      });
    }

    if (userProgress.streakDays === 0) {
      actions.push({
        icon: '🔥',
        title: 'Start your streak',
        description: 'Complete a study session today',
        color: 'orange'
      });
    }

    return actions.slice(0, 2);
  };

  const quickActions = getQuickActionItems();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Stats */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDuration(todayStats.studyTime)}
                </div>
                <div className="text-sm text-secondary">Study Time</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {todayStats.tasksCompleted}
                </div>
                <div className="text-sm text-secondary">Tasks Done</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {todayStats.focusScore > 0 ? todayStats.focusScore.toFixed(1) : '—'}
                </div>
                <div className="text-sm text-secondary">Focus Score</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Level Progress */}
        <LevelProgress userProgress={userProgress} compact />
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className={`border-l-4 border-l-${action.color}-500 hover:shadow-md transition-shadow cursor-pointer`}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{action.icon}</div>
                <div>
                  <h4 className="font-medium">{action.title}</h4>
                  <p className="text-sm text-secondary">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Tasks</h3>
            <Badge variant="primary" size="sm">
              {todayTasks.length} tasks
            </Badge>
          </div>
          
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onTaskEdit}
                  onComplete={onTaskComplete}
                  onDelete={onTaskDelete}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-secondary">No tasks for today</p>
              <p className="text-sm text-secondary">Create a task or set deadlines to get started!</p>
            </div>
          )}
        </Card>

        {/* Active Goals */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Active Goals</h3>
            <Badge variant="primary" size="sm">
              {activeGoals.length} goals
            </Badge>
          </div>
          
          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={onGoalEdit}
                  onDelete={onGoalDelete}
                  onUpdateProgress={onGoalUpdateProgress}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-secondary">No active goals</p>
              <p className="text-sm text-secondary">Set your first goal to track progress!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Study Sessions */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Study Sessions</h3>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">📚</div>
                    <div>
                      <div className="font-medium text-sm">
                        {session.title || `${session.type} session`}
                      </div>
                      <div className="text-xs text-secondary">
                        {session.category} • {formatDuration(session.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.focusScore && (
                      <Badge variant="primary" size="sm">
                        {session.focusScore}/10
                      </Badge>
                    )}
                    <span className="text-xs text-secondary">
                      +{session.xpEarned} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-secondary">No recent sessions</p>
              <p className="text-sm text-secondary">Start a study session to see your progress!</p>
            </div>
          )}
        </Card>

        {/* Recent Achievements */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map(achievement => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-secondary">{achievement.description}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning" size="sm">
                      +{achievement.xpValue} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-secondary">No achievements yet</p>
              <p className="text-sm text-secondary">Complete tasks and sessions to unlock achievements!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Urgent Tasks Alert */}
      {urgentTasks.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600">Urgent Tasks</h3>
          </div>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-white dark:bg-red-900/20 rounded">
                <span className="font-medium">{task.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="error" size="sm">{task.priority}</Badge>
                  {task.deadline && (
                    <span className="text-xs text-red-600">
                      Due: {task.deadline.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardOverview;
