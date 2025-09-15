import React, { useState } from 'react';
import { Achievement, AchievementCategory, AchievementRarity } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import Tabs from '../ui/Tabs';

interface AchievementsPanelProps {
  achievements: Achievement[];
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  // Group achievements by unlock status
  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked);
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked);

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'text-gray-600';
      case AchievementRarity.RARE:
        return 'text-blue-600';
      case AchievementRarity.EPIC:
        return 'text-purple-600';
      case AchievementRarity.LEGENDARY:
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRarityBadgeVariant = (rarity: AchievementRarity) => {
    switch (rarity) {
      case AchievementRarity.COMMON:
        return 'secondary' as const;
      case AchievementRarity.RARE:
        return 'primary' as const;
      case AchievementRarity.EPIC:
        return 'error' as const;
      case AchievementRarity.LEGENDARY:
        return 'warning' as const;
      default:
        return 'secondary' as const;
    }
  };

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <Card 
      className={`transition-all duration-200 ${
        achievement.isUnlocked 
          ? 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10' 
          : 'opacity-75'
      }`}
      padding="sm"
    >
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${achievement.isUnlocked ? '' : 'text-gray-500'}`}>
              {achievement.title}
            </h4>
            {achievement.isUnlocked && (
              <Badge variant="success" size="sm">
                ✓ Unlocked
              </Badge>
            )}
            <Badge variant={getRarityBadgeVariant(achievement.rarity)} size="sm">
              {achievement.rarity}
            </Badge>
          </div>
          
          <p className="text-sm text-secondary mb-3">
            {achievement.description}
          </p>
          
          {/* Progress */}
          <div className="mb-2">
            <ProgressBar
              value={achievement.progress}
              max={achievement.requirement}
              showLabel={true}
              color={achievement.isUnlocked ? 'var(--color-success)' : 'var(--color-primary)'}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary">
              Category: {achievement.category}
            </span>
            <span className={`font-medium ${getRarityColor(achievement.rarity)}`}>
              +{achievement.xpValue} XP
            </span>
            {achievement.unlockedAt && (
              <span className="text-green-600">
                Unlocked {achievement.unlockedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const achievementStats = {
    total: achievements.length,
    unlocked: unlockedAchievements.length,
    totalXP: unlockedAchievements.reduce((acc, a) => acc + a.xpValue, 0),
    byRarity: Object.values(AchievementRarity).reduce((acc, rarity) => {
      acc[rarity] = achievements.filter(a => a.rarity === rarity && a.isUnlocked).length;
      return acc;
    }, {} as Record<AchievementRarity, number>)
  };

  const unlockedTab = (
    <div className="space-y-3">
      {unlockedAchievements.length > 0 ? (
        unlockedAchievements
          .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
          .map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-secondary mb-2">No achievements unlocked yet</h3>
          <p className="text-secondary">Start completing tasks and study sessions to earn your first achievement!</p>
        </div>
      )}
    </div>
  );

  const lockedTab = (
    <div className="space-y-3">
      {lockedAchievements.length > 0 ? (
        lockedAchievements
          .sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))
          .map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-secondary mb-2">All achievements unlocked!</h3>
          <p className="text-secondary">Congratulations! You've achieved everything available.</p>
        </div>
      )}
    </div>
  );

  const allTab = (
    <div className="space-y-3">
      {/* Unlocked first, then locked */}
      {unlockedAchievements
        .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
        .map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))
      }
      {lockedAchievements
        .sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement))
        .map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))
      }
    </div>
  );

  const tabs = [
    { 
      id: 'all', 
      label: `All (${achievements.length})`, 
      content: allTab,
      icon: '🏆'
    },
    { 
      id: 'unlocked', 
      label: `Unlocked (${unlockedAchievements.length})`, 
      content: unlockedTab,
      icon: '✅'
    },
    { 
      id: 'locked', 
      label: `Locked (${lockedAchievements.length})`, 
      content: lockedTab,
      icon: '🔒'
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Achievements</h2>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {achievementStats.unlocked}/{achievementStats.total}
            </div>
            <div className="text-sm text-secondary">Achievements</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {achievementStats.totalXP}
            </div>
            <div className="text-sm text-secondary">XP Earned</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((achievementStats.unlocked / achievementStats.total) * 100)}%
            </div>
            <div className="text-sm text-secondary">Completion</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {achievementStats.byRarity[AchievementRarity.LEGENDARY] || 0}
            </div>
            <div className="text-sm text-secondary">Legendary</div>
          </Card>
        </div>

        {/* Rarity Breakdown */}
        <Card padding="sm" className="mb-6">
          <h4 className="font-medium mb-3">Achievement Breakdown by Rarity</h4>
          <div className="grid grid-cols-4 gap-4 text-center">
            {Object.values(AchievementRarity).map(rarity => (
              <div key={rarity}>
                <div className={`text-lg font-bold ${getRarityColor(rarity)}`}>
                  {achievementStats.byRarity[rarity] || 0}
                </div>
                <div className="text-xs text-secondary capitalize">{rarity}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Achievement Tabs */}
      <Tabs tabs={tabs} defaultTab="all" />
    </div>
  );
};

export default AchievementsPanel;
