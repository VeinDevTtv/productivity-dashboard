import React from 'react';
import { Task, Priority, TaskCategory } from '../../types';
import { formatDate, getCategoryColor, getPriorityColor } from '../../utils/helpers';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onComplete, 
  onDelete,
  compact = false 
}) => {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.deadline && new Date() > task.deadline && !isCompleted;

  const priorityVariant = {
    [Priority.LOW]: 'secondary' as const,
    [Priority.MEDIUM]: 'warning' as const,
    [Priority.HIGH]: 'warning' as const,
    [Priority.URGENT]: 'error' as const,
  };

  const priorityIcons = {
    [Priority.LOW]: '⬇️',
    [Priority.MEDIUM]: '➡️',
    [Priority.HIGH]: '⬆️',
    [Priority.URGENT]: '🔥',
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'opacity-60' : ''
      } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
      padding={compact ? 'sm' : 'md'}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and Description */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {isOverdue && (
              <Badge variant="error" size="sm">
                Overdue
              </Badge>
            )}
          </div>

          {task.description && !compact && (
            <p className="text-sm text-secondary mb-3">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            <Badge 
              variant="secondary" 
              size="sm"
              className="text-white"
              style={{ backgroundColor: getCategoryColor(task.category) }}
            >
              {task.category}
            </Badge>

            {/* Priority */}
            <Badge variant={priorityVariant[task.priority]} size="sm">
              {priorityIcons[task.priority]} {task.priority}
            </Badge>

            {/* Deadline */}
            {task.deadline && (
              <span className={`text-sm ${isOverdue ? 'text-red-600' : 'text-secondary'}`}>
                📅 {formatDate(task.deadline)}
              </span>
            )}

            {/* Estimated time */}
            {task.estimatedMinutes && (
              <span className="text-sm text-secondary">
                ⏱️ {task.estimatedMinutes}m
              </span>
            )}

            {/* Completion time */}
            {isCompleted && task.completedAt && (
              <span className="text-sm text-green-600">
                ✅ {formatDate(task.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComplete(task.id)}
                title="Mark as complete"
              >
                ✓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                title="Edit task"
              >
                ✏️
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Progress indicator for estimated vs actual time */}
      {isCompleted && task.estimatedMinutes && task.actualMinutes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-secondary">
            <span>Estimated: {task.estimatedMinutes}m</span>
            <span>Actual: {task.actualMinutes}m</span>
            <span className={
              task.actualMinutes <= task.estimatedMinutes 
                ? 'text-green-600' 
                : 'text-orange-600'
            }>
              {task.actualMinutes <= task.estimatedMinutes ? '✓ On time' : '⚠️ Over estimate'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskCard;
