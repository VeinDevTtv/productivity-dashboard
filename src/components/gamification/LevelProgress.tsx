import React from 'react';
import { UserProgress } from '../../types';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';

interface LevelProgressProps {
  userProgress: UserProgress;
  compact?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ userProgress, compact = false }) => {
  const progressPercentage = (userProgress.currentXP / userProgress.nextLevelXP) * 100;
  
  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Legendary Scholar';
    if (level >= 40) return 'Master Student';
    if (level >= 30) return 'Expert Learner';
    if (level >= 20) return 'Advanced Student';
    if (level >= 15) return 'Dedicated Scholar';
    if (level >= 10) return 'Committed Learner';
    if (level >= 5) return 'Rising Star';
    if (level >= 3) return 'Motivated Student';
    return 'New Student';
  };

  const getLevelEmoji = (level: number) => {
    if (level >= 50) return '👑';
    if (level >= 40) return '🎖️';
    if (level >= 30) return '🏆';
    if (level >= 20) return '🥇';
    if (level >= 15) return '🌟';
    if (level >= 10) return '⭐';
    if (level >= 5) return '🔥';
    if (level >= 3) return '📚';
    return '🌱';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-red-600';
    if (streak >= 14) return 'text-orange-600';
    if (streak >= 7) return 'text-yellow-600';
    if (streak >= 3) return 'text-green-600';
    return 'text-blue-600';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Legendary Streak! 🔥';
    if (streak >= 14) return 'Amazing Consistency! ⚡';
    if (streak >= 7) return 'Weekly Warrior! 💪';
    if (streak >= 3) return 'Building Momentum! 🚀';
    if (streak >= 1) return 'Great Start! 👍';
    return 'Ready to Begin! 🌟';
  };

  if (compact) {
    return (
      <Card padding="sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getLevelEmoji(userProgress.level)}</span>
            <div>
              <div className="font-bold">Level {userProgress.level}</div>
              <div className="text-xs text-secondary">{getLevelTitle(userProgress.level)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-orange-600">{userProgress.streakDays}🔥</div>
            <div className="text-xs text-secondary">day streak</div>
          </div>
        </div>
        <ProgressBar
          value={userProgress.currentXP}
          max={userProgress.nextLevelXP}
          showLabel={false}
          color="var(--color-primary)"
        />
        <div className="text-xs text-secondary mt-1">
          {userProgress.currentXP} / {userProgress.nextLevelXP} XP ({Math.round(progressPercentage)}%)
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">{getLevelEmoji(userProgress.level)}</div>
        <h3 className="text-2xl font-bold mb-1">Level {userProgress.level}</h3>
        <Badge variant="primary" size="sm">{getLevelTitle(userProgress.level)}</Badge>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Experience Progress</span>
          <span className="text-sm text-secondary">
            {userProgress.currentXP} / {userProgress.nextLevelXP} XP
          </span>
        </div>
        <ProgressBar
          value={userProgress.currentXP}
          max={userProgress.nextLevelXP}
          showLabel={false}
          color="var(--color-primary)"
        />
        <div className="text-center mt-2">
          <span className="text-sm text-secondary">
            {userProgress.nextLevelXP - userProgress.currentXP} XP until Level {userProgress.level + 1}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{userProgress.totalXP.toLocaleString()}</div>
          <div className="text-sm text-secondary">Total XP</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className={`text-2xl font-bold ${getStreakColor(userProgress.streakDays)}`}>
            {userProgress.streakDays}🔥
          </div>
          <div className="text-sm text-secondary">Day Streak</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(userProgress.totalStudyHours)}h
          </div>
          <div className="text-sm text-secondary">Study Time</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {userProgress.productivityScore}/100
          </div>
          <div className="text-sm text-secondary">Productivity</div>
        </div>
      </div>

      {/* Streak Section */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Current Streak</h4>
          <span className="text-lg font-bold text-orange-600">
            {userProgress.streakDays} {userProgress.streakDays === 1 ? 'day' : 'days'}
          </span>
        </div>
        <p className="text-sm text-secondary">
          {getStreakMessage(userProgress.streakDays)}
        </p>
        {userProgress.longestStreak > userProgress.streakDays && (
          <p className="text-xs text-secondary mt-1">
            Personal best: {userProgress.longestStreak} days
          </p>
        )}
      </div>

      {/* Achievement Summary */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-3">Quick Stats</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {userProgress.totalTasksCompleted}
            </div>
            <div className="text-xs text-secondary">Tasks</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {userProgress.totalGoalsCompleted}
            </div>
            <div className="text-xs text-secondary">Goals</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {userProgress.level}
            </div>
            <div className="text-xs text-secondary">Level</div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 text-center">
        {progressPercentage < 25 && (
          <p className="text-sm text-secondary">
            🚀 Just getting started! Every XP counts toward your next level.
          </p>
        )}
        {progressPercentage >= 25 && progressPercentage < 50 && (
          <p className="text-sm text-secondary">
            💪 Quarter way there! Keep the momentum going.
          </p>
        )}
        {progressPercentage >= 50 && progressPercentage < 75 && (
          <p className="text-sm text-secondary">
            🔥 Halfway to the next level! You're doing great.
          </p>
        )}
        {progressPercentage >= 75 && progressPercentage < 90 && (
          <p className="text-sm text-secondary">
            ⚡ Almost there! Just a little more to level up.
          </p>
        )}
        {progressPercentage >= 90 && (
          <p className="text-sm text-secondary">
            🎯 So close to leveling up! One more push!
          </p>
        )}
      </div>
    </Card>
  );
};

export default LevelProgress;
