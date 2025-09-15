import React, { useState, useMemo } from 'react';
import { Goal, TaskCategory } from '../../types';
import { calculateGoalProgress } from '../../utils/helpers';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface GoalListProps {
  goals: Goal[];
  onCreateGoal: (goalData: any) => void;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: string) => void;
  showCompleted?: boolean;
  compact?: boolean;
}

const GoalList: React.FC<GoalListProps> = ({
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  showCompleted = false,
  compact = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'deadline' | 'progress'>('created');

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter(goal => {
        // Completion filter
        if (!showCompleted && goal.isCompleted) {
          return false;
        }

        // Search filter
        if (searchTerm && !goal.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && goal.category !== filterCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'deadline':
            if (!a.deadline && !b.deadline) return 0;
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline.getTime() - b.deadline.getTime();
          
          case 'progress':
            const progressA = calculateGoalProgress(a);
            const progressB = calculateGoalProgress(b);
            return progressB - progressA; // Higher progress first
          
          case 'created':
          default:
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
  }, [goals, showCompleted, searchTerm, filterCategory, sortBy]);

  const handleCreateGoal = () => {
    setEditingGoal(undefined);
    setIsFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (goalData: any) => {
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalData);
    } else {
      onCreateGoal(goalData);
    }
    setIsFormOpen(false);
    setEditingGoal(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGoal(undefined);
  };

  const handleUpdateProgress = (goalId: string, newValue: number) => {
    onUpdateGoal(goalId, { currentValue: newValue });
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.values(TaskCategory).map(category => ({
      value: category,
      label: category
    }))
  ];

  const sortOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'progress', label: 'Progress' }
  ];

  const goalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.isCompleted).length;
    const active = total - completed;
    const overdue = goals.filter(g => 
      g.deadline && 
      new Date() > g.deadline && 
      !g.isCompleted
    ).length;

    const avgProgress = active > 0 
      ? goals
          .filter(g => !g.isCompleted)
          .reduce((acc, g) => acc + calculateGoalProgress(g), 0) / active
      : 0;

    return { total, completed, active, overdue, avgProgress };
  }, [goals]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <div className="flex gap-4 text-sm text-secondary mt-1">
            <span>{goalStats.active} active</span>
            <span>{goalStats.completed} completed</span>
            {goalStats.overdue > 0 && (
              <span className="text-red-600">{goalStats.overdue} overdue</span>
            )}
            {goalStats.active > 0 && (
              <span>{Math.round(goalStats.avgProgress)}% avg progress</span>
            )}
          </div>
        </div>
        <Button onClick={handleCreateGoal}>
          + New Goal
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          options={categoryOptions}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
        />
        
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'created' | 'deadline' | 'progress')}
        />
      </div>

      {/* Goal List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-secondary mb-2">
              {goals.length === 0 ? 'No goals yet' : 'No goals match your filters'}
            </h3>
            <p className="text-secondary mb-4">
              {goals.length === 0 
                ? 'Set your first goal and start achieving!' 
                : 'Try adjusting your search or filters.'
              }
            </p>
            {goals.length === 0 && (
              <Button onClick={handleCreateGoal}>
                Create Your First Goal
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={onDeleteGoal}
                onUpdateProgress={handleUpdateProgress}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        goal={editingGoal}
      />
    </div>
  );
};

export default GoalList;
