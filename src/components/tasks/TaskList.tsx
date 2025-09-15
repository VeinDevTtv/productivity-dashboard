import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskCategory, Priority } from '../../types';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';

interface TaskListProps {
  tasks: Task[];
  onCreateTask: (taskData: any) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  showCompleted?: boolean;
  compact?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onCreateTask,
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
  showCompleted = false,
  compact = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'deadline' | 'priority'>('created');

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Status filter
        if (!showCompleted && task.status === TaskStatus.COMPLETED) {
          return false;
        }

        // Search filter
        if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Category filter
        if (filterCategory !== 'all' && task.category !== filterCategory) {
          return false;
        }

        // Priority filter
        if (filterPriority !== 'all' && task.priority !== filterPriority) {
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
          
          case 'priority':
            const priorityOrder = { [Priority.URGENT]: 0, [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          
          case 'created':
          default:
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
  }, [tasks, showCompleted, searchTerm, filterCategory, filterPriority, sortBy]);

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (taskData: any) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onCreateTask(taskData);
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...Object.values(TaskCategory).map(category => ({
      value: category,
      label: category
    }))
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    ...Object.values(Priority).map(priority => ({
      value: priority,
      label: priority.charAt(0).toUpperCase() + priority.slice(1)
    }))
  ];

  const sortOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'priority', label: 'Priority' }
  ];

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => 
      t.deadline && 
      new Date() > t.deadline && 
      t.status !== TaskStatus.COMPLETED
    ).length;

    return { total, completed, pending, overdue };
  }, [tasks]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tasks</h2>
          <div className="flex gap-4 text-sm text-secondary mt-1">
            <span>{taskStats.pending} pending</span>
            <span>{taskStats.completed} completed</span>
            {taskStats.overdue > 0 && (
              <span className="text-red-600">{taskStats.overdue} overdue</span>
            )}
          </div>
        </div>
        <Button onClick={handleCreateTask}>
          + New Task
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select
          options={categoryOptions}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
        />
        
        <Select
          options={priorityOptions}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
        />
        
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'created' | 'deadline' | 'priority')}
        />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-secondary mb-2">
              {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
            </h3>
            <p className="text-secondary mb-4">
              {tasks.length === 0 
                ? 'Create your first task to get started!' 
                : 'Try adjusting your search or filters.'
              }
            </p>
            {tasks.length === 0 && (
              <Button onClick={handleCreateTask}>
                Create Your First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </div>
  );
};

export default TaskList;
