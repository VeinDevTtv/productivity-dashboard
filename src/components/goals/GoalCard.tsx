import React from 'react';
import { Goal } from '../../types';
import { formatDate, getCategoryColor, calculateGoalProgress } from '../../utils/helpers';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onUpdateProgress: (goalId: string, newValue: number) => void;
  compact?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onEdit, 
  onDelete,
  onUpdateProgress,
  compact = false 
}) => {
  const progress = calculateGoalProgress(goal);
  const isCompleted = goal.isCompleted;
  const isOverdue = goal.deadline && new Date() > goal.deadline && !isCompleted;

  const handleProgressUpdate = (increment: number) => {
    const newValue = Math.max(0, Math.min(goal.targetValue, goal.currentValue + increment));
    onUpdateProgress(goal.id, newValue);
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10' : ''
      } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
      padding={compact ? 'sm' : 'md'}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
              {goal.title}
            </h3>
            {isCompleted && (
              <Badge variant="success" size="sm">
                ✅ Completed
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="error" size="sm">
                Overdue
              </Badge>
            )}
          </div>

          {goal.description && !compact && (
            <p className="text-sm text-secondary mb-3">{goal.description}</p>
          )}

          {/* Progress */}
          <div className="mb-3">
            <ProgressBar
              value={goal.currentValue}
              max={goal.targetValue}
              showLabel={false}
              color={getCategoryColor(goal.category)}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-medium">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
              <span className="text-sm text-secondary">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Progress Update Controls */}
          {!isCompleted && (
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleProgressUpdate(-1)}
                disabled={goal.currentValue <= 0}
              >
                -1
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleProgressUpdate(1)}
                disabled={goal.currentValue >= goal.targetValue}
              >
                +1
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleProgressUpdate(5)}
                disabled={goal.currentValue >= goal.targetValue}
              >
                +5
              </Button>
              {goal.currentValue < goal.targetValue && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleProgressUpdate(goal.targetValue - goal.currentValue)}
                >
                  Complete Goal
                </Button>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            <Badge 
              variant="secondary" 
              size="sm"
              className="text-white"
              style={{ backgroundColor: getCategoryColor(goal.category) }}
            >
              {goal.category}
            </Badge>

            {/* Deadline */}
            {goal.deadline && (
              <span className={`text-sm ${isOverdue ? 'text-red-600' : 'text-secondary'}`}>
                📅 {formatDate(goal.deadline)}
              </span>
            )}

            {/* Created date */}
            <span className="text-sm text-secondary">
              Created {formatDate(goal.createdAt)}
            </span>

            {/* Completion date */}
            {isCompleted && goal.completedAt && (
              <span className="text-sm text-green-600">
                ✅ Completed {formatDate(goal.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              title="Edit goal"
            >
              ✏️
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(goal.id)}
            title="Delete goal"
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Achievement indicator */}
      {isCompleted && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span>🎉</span>
            <span>Goal achieved! Great work!</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GoalCard;
