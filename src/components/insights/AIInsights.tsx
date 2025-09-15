import React, { useMemo } from 'react';
import { ProductivityInsight, UserProgress, InsightImpact } from '../../types';
import { PRODUCTIVITY_TIPS } from '../../utils/constants';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

interface AIInsightsProps {
  insights: ProductivityInsight[];
  userProgress: UserProgress;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, userProgress }) => {
  // Get a random productivity tip
  const dailyTip = useMemo(() => {
    const today = new Date().getDate();
    return PRODUCTIVITY_TIPS[today % PRODUCTIVITY_TIPS.length];
  }, []);

  const getImpactColor = (impact: InsightImpact) => {
    switch (impact) {
      case InsightImpact.HIGH:
        return 'text-red-600';
      case InsightImpact.MEDIUM:
        return 'text-orange-600';
      case InsightImpact.LOW:
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: InsightImpact) => {
    switch (impact) {
      case InsightImpact.HIGH:
        return '🔥';
      case InsightImpact.MEDIUM:
        return '⚡';
      case InsightImpact.LOW:
        return '💡';
      default:
        return '📊';
    }
  };

  const getProductivityScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-primary)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getProductivityMessage = (score: number) => {
    if (score >= 90) return "Outstanding! You're in the zone! 🔥";
    if (score >= 80) return "Excellent productivity! Keep it up! 🌟";
    if (score >= 70) return "Great work! You're doing well! 👍";
    if (score >= 60) return "Good progress! Room for improvement! 📈";
    if (score >= 50) return "Decent effort! Let's push harder! 💪";
    if (score >= 40) return "Getting started! Stay consistent! 🎯";
    return "Time to build momentum! You got this! 🚀";
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return "Incredible streak! You're unstoppable! 🏆";
    if (streak >= 14) return "Amazing consistency! Keep the momentum! 🔥";
    if (streak >= 7) return "Week-long streak! You're on fire! ⚡";
    if (streak >= 3) return "Great start! Building good habits! 🌱";
    if (streak >= 1) return "Good job! Every day counts! 👍";
    return "Ready to start your streak? Let's go! 🚀";
  };

  return (
    <div className="space-y-6">
      {/* Productivity Score Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🤖 AI Study Coach</h3>
          <Badge variant="primary" size="sm">Beta</Badge>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Productivity Score</span>
            <span className="text-2xl font-bold" style={{ color: getProductivityScoreColor(userProgress.productivityScore) }}>
              {userProgress.productivityScore}/100
            </span>
          </div>
          <ProgressBar 
            value={userProgress.productivityScore} 
            max={100} 
            color={getProductivityScoreColor(userProgress.productivityScore)}
            showLabel={false}
          />
          <p className="text-sm text-secondary mt-2">
            {getProductivityMessage(userProgress.productivityScore)}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Current Streak</span>
            <span className="text-xl font-bold text-orange-600">
              {userProgress.streakDays} {userProgress.streakDays === 1 ? 'day' : 'days'} 🔥
            </span>
          </div>
          <p className="text-sm text-secondary">
            {getStreakMessage(userProgress.streakDays)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {Math.round(userProgress.totalStudyHours)}h
            </div>
            <div className="text-xs text-secondary">Study Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {userProgress.totalTasksCompleted}
            </div>
            <div className="text-xs text-secondary">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              Lvl {userProgress.level}
            </div>
            <div className="text-xs text-secondary">Level</div>
          </div>
        </div>
      </Card>

      {/* Daily Tip */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-medium mb-2">Daily Productivity Tip</h4>
            <p className="text-sm text-secondary leading-relaxed">{dailyTip}</p>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personalized Insights</h3>
          {insights.map((insight) => (
            <Card key={insight.id} className="border-l-4" style={{ borderLeftColor: getImpactColor(insight.impact).replace('text-', '') }}>
              <div className="flex items-start gap-3">
                <div className="text-xl">{getImpactIcon(insight.impact)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge 
                      variant={insight.impact === InsightImpact.HIGH ? 'error' : insight.impact === InsightImpact.MEDIUM ? 'warning' : 'primary'} 
                      size="sm"
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary mb-3">{insight.description}</p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm">
                      <strong>💡 Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                  
                  {/* Data Points */}
                  {insight.dataPoints.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-2">Key Metrics:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {insight.dataPoints.map((point, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <div className="font-medium">{point.label}</div>
                            <div className="text-secondary">
                              {typeof point.value === 'number' ? point.value.toFixed(1) : point.value}
                              {point.trend && (
                                <span className={`ml-1 ${
                                  point.trend === 'up' ? 'text-green-600' : 
                                  point.trend === 'down' ? 'text-red-600' : 
                                  'text-gray-600'
                                }`}>
                                  {point.trend === 'up' ? '↗️' : point.trend === 'down' ? '↘️' : '➡️'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-secondary mb-2">Generating Insights...</h3>
            <p className="text-secondary">
              Complete more study sessions and tasks to unlock personalized AI insights!
            </p>
          </div>
        </Card>
      )}

      {/* Study Suggestions */}
      <Card>
        <h4 className="font-medium mb-4">🎯 Smart Suggestions</h4>
        <div className="space-y-3">
          {userProgress.streakDays === 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Start Your Streak:</strong> Begin with just a 25-minute Pomodoro session to kickstart your productivity journey!
              </p>
            </div>
          )}
          
          {userProgress.totalStudyHours < 1 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>First Hour Goal:</strong> Reach your first hour of study time! Break it into short, focused sessions.
              </p>
            </div>
          )}
          
          {userProgress.totalTasksCompleted === 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Task Management:</strong> Create and complete your first task to start building productive habits!
              </p>
            </div>
          )}
          
          {userProgress.productivityScore < 50 && userProgress.totalStudyHours > 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Boost Your Score:</strong> Try shorter, more focused sessions with breaks in between to improve your productivity score.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AIInsights;
