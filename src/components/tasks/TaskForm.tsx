import React, { useState, useEffect } from 'react';
import { Task, TaskFormData, TaskCategory, Priority } from '../../types';
import { formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
  task?: Task; // For editing existing tasks
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: TaskCategory.STUDY,
    priority: Priority.MEDIUM,
    deadline: '',
    estimatedMinutes: undefined
  });

  const [errors, setErrors] = useState<Partial<TaskFormData>>({});

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        deadline: task.deadline ? formatDate(task.deadline, 'yyyy-MM-dd') : '',
        estimatedMinutes: task.estimatedMinutes
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: TaskCategory.STUDY,
        priority: Priority.MEDIUM,
        deadline: '',
        estimatedMinutes: undefined
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    if (formData.estimatedMinutes !== undefined && formData.estimatedMinutes <= 0) {
      newErrors.estimatedMinutes = 'Estimated time must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof TaskFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' 
      ? (e.target.value ? parseInt(e.target.value) : undefined)
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const categoryOptions = Object.values(TaskCategory).map(category => ({
    value: category,
    label: category
  }));

  const priorityOptions = Object.values(Priority).map(priority => ({
    value: priority,
    label: priority.charAt(0).toUpperCase() + priority.slice(1)
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          id="title"
          label="Title *"
          value={formData.title}
          onChange={handleChange('title')}
          error={errors.title}
          placeholder="Enter task title..."
          autoFocus
        />

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Enter task description..."
            className="input textarea"
            rows={3}
          />
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="category"
            label="Category *"
            value={formData.category}
            onChange={handleChange('category')}
            options={categoryOptions}
          />

          <Select
            id="priority"
            label="Priority *"
            value={formData.priority}
            onChange={handleChange('priority')}
            options={priorityOptions}
          />
        </div>

        {/* Deadline and Estimated Time */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="deadline"
            label="Deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange('deadline')}
            error={errors.deadline}
            min={formatDate(new Date(), 'yyyy-MM-dd')}
          />

          <Input
            id="estimatedMinutes"
            label="Estimated Time (minutes)"
            type="number"
            value={formData.estimatedMinutes || ''}
            onChange={handleChange('estimatedMinutes')}
            error={errors.estimatedMinutes}
            placeholder="e.g., 60"
            min="1"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
