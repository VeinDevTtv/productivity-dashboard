import React, { useState, useMemo } from 'react';
import { StudySession, Task, Goal, Analytics, TaskCategory } from '../../types';
import { 
  formatDuration, 
  getCategoryColor, 
  calculateDailyAnalytics,
  getWeekRange,
  getMonthRange 
} from '../../utils/helpers';
import { SimpleBarChart, SimpleLineChart, SimplePieChart } from '../charts/SimpleChart';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import Select from '../ui/Select';

interface AnalyticsDashboardProps {
  sessions: StudySession[];
  tasks: Task[];
  goals: Goal[];
  analytics: Analytics;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sessions,
  tasks,
  goals,
  analytics
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = getWeekRange(now).start;
        break;
      case 'month':
        startDate = getMonthRange(now).start;
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    return {
      sessions: sessions.filter(s => s.startTime >= startDate),
      tasks: tasks.filter(t => t.createdAt >= startDate),
      goals: goals.filter(g => g.createdAt >= startDate)
    };
  }, [sessions, tasks, goals, timeframe]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const completedSessions = filteredData.sessions.filter(s => s.endTime);
    const completedTasks = filteredData.tasks.filter(t => t.status === 'completed');
    const completedGoals = filteredData.goals.filter(g => g.isCompleted);
    
    const totalStudyTime = completedSessions.reduce((acc, s) => acc + s.duration, 0);
    const avgFocus = completedSessions.length > 0
      ? completedSessions
          .filter(s => s.focusScore)
          .reduce((acc, s) => acc + (s.focusScore || 0), 0) / 
        completedSessions.filter(s => s.focusScore).length
      : 0;
    
    const totalXP = [
      ...completedTasks.map(t => t.xpValue || 0),
      ...completedSessions.map(s => s.xpEarned || 0)
    ].reduce((acc, xp) => acc + xp, 0);

    return {
      totalSessions: completedSessions.length,
      totalStudyTime,
      totalTasks: completedTasks.length,
      totalGoals: completedGoals.length,
      avgFocus: avgFocus || 0,
      totalXP
    };
  }, [filteredData]);

  // Study time by category
  const categoryData = useMemo(() => {
    const categoryTotals = Object.values(TaskCategory).map(category => {
      const minutes = filteredData.sessions
        .filter(s => s.category === category && s.endTime)
        .reduce((acc, s) => acc + s.duration, 0);
      
      return {
        label: category,
        value: minutes,
        color: getCategoryColor(category)
      };
    }).filter(item => item.value > 0);

    return categoryTotals;
  }, [filteredData.sessions]);

  // Daily study time trend
  const dailyTrendData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date;
    });

    return last14Days.map(date => {
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayMinutes = filteredData.sessions
        .filter(s => s.startTime >= dayStart && s.startTime < dayEnd && s.endTime)
        .reduce((acc, s) => acc + s.duration, 0);

      return {
        date: new Date(date),
        value: dayMinutes,
      };
    });
  }, [filteredData.sessions]);

  // Weekly performance
  const weeklyData = useMemo(() => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return weekDays.map((day, index) => {
      const minutes = filteredData.sessions
        .filter(s => {
          const sessionDay = s.startTime.getDay();
          return sessionDay === index && s.endTime;
        })
        .reduce((acc, s) => acc + s.duration, 0);

      return {
        label: day,
        value: minutes
      };
    });
  }, [filteredData.sessions]);

  // Focus score distribution
  const focusDistribution = useMemo(() => {
    const ranges = [
      { label: '1-3', min: 1, max: 3 },
      { label: '4-6', min: 4, max: 6 },
      { label: '7-8', min: 7, max: 8 },
      { label: '9-10', min: 9, max: 10 }
    ];

    return ranges.map(range => {
      const count = filteredData.sessions.filter(s => 
        s.focusScore && s.focusScore >= range.min && s.focusScore <= range.max
      ).length;

      return {
        label: range.label,
        value: count
      };
    }).filter(item => item.value > 0);
  }, [filteredData.sessions]);

  const timeframeOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  const overviewTab = (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summaryStats.totalSessions}</div>
          <div className="text-sm text-secondary">Study Sessions</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatDuration(summaryStats.totalStudyTime)}
          </div>
          <div className="text-sm text-secondary">Study Time</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">{summaryStats.totalTasks}</div>
          <div className="text-sm text-secondary">Tasks Completed</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {summaryStats.avgFocus > 0 ? summaryStats.avgFocus.toFixed(1) : '—'}
          </div>
          <div className="text-sm text-secondary">Avg Focus Score</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Study Time by Category</h3>
          {categoryData.length > 0 ? (
            <SimplePieChart data={categoryData} size={250} />
          ) : (
            <div className="text-center py-8 text-secondary">
              No study sessions recorded yet
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Daily Study Time (Last 14 Days)</h3>
          {dailyTrendData.some(d => d.value > 0) ? (
            <SimpleLineChart data={dailyTrendData} height={250} />
          ) : (
            <div className="text-center py-8 text-secondary">
              No study data for the last 14 days
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const trendsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Weekly Pattern</h3>
          {weeklyData.some(d => d.value > 0) ? (
            <SimpleBarChart data={weeklyData} height={200} />
          ) : (
            <div className="text-center py-8 text-secondary">
              No weekly pattern data available
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Focus Score Distribution</h3>
          {focusDistribution.length > 0 ? (
            <SimpleBarChart data={focusDistribution} height={200} />
          ) : (
            <div className="text-center py-8 text-secondary">
              No focus score data available
            </div>
          )}
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Insights</h3>
        <div className="space-y-3">
          {summaryStats.totalSessions === 0 ? (
            <p className="text-secondary">Complete some study sessions to see insights!</p>
          ) : (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm">
                  📚 You've completed <strong>{summaryStats.totalSessions}</strong> study sessions 
                  totaling <strong>{formatDuration(summaryStats.totalStudyTime)}</strong>.
                </p>
              </div>
              
              {summaryStats.avgFocus > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm">
                    🎯 Your average focus score is <strong>{summaryStats.avgFocus.toFixed(1)}/10</strong>.
                    {summaryStats.avgFocus >= 8 
                      ? ' Excellent focus! Keep it up!'
                      : summaryStats.avgFocus >= 6
                      ? ' Good focus. Try eliminating distractions to improve.'
                      : ' Consider shorter sessions or a quieter environment.'
                    }
                  </p>
                </div>
              )}

              {categoryData.length > 1 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm">
                    📊 You're studying across <strong>{categoryData.length}</strong> different categories. 
                    Great for balanced learning!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );

  const goalsTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredData.goals.length}</div>
          <div className="text-sm text-secondary">Total Goals</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">{summaryStats.totalGoals}</div>
          <div className="text-sm text-secondary">Completed</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {filteredData.goals.length > 0 
              ? Math.round((summaryStats.totalGoals / filteredData.goals.length) * 100)
              : 0}%
          </div>
          <div className="text-sm text-secondary">Success Rate</div>
        </Card>
      </div>

      {filteredData.goals.length > 0 ? (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
          <div className="space-y-4">
            {filteredData.goals.slice(0, 5).map(goal => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-secondary">
                      {goal.currentValue}/{goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: getCategoryColor(goal.category)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-secondary mb-2">No goals set</h3>
            <p className="text-secondary">Create your first goal to track progress!</p>
          </div>
        </Card>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', content: overviewTab, icon: '📊' },
    { id: 'trends', label: 'Trends', content: trendsTab, icon: '📈' },
    { id: 'goals', label: 'Goals', content: goalsTab, icon: '🎯' }
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Select
          options={timeframeOptions}
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'all')}
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />
    </div>
  );
};

export default AnalyticsDashboard;
