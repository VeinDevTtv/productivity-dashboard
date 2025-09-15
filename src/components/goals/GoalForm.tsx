import React, { useState, useEffect } from 'react';
import { Goal, GoalFormData, TaskCategory } from '../../types';
import { formatDate } from '../../utils/helpers';
import { GOAL_UNITS } from '../../utils/constants';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: GoalFormData) => void;
  goal?: Goal; // For editing existing goals
  isLoading?: boolean;
}

const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: TaskCategory.STUDY,
    targetValue: 1,
    unit: 'tasks',
    deadline: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  // Initialize form data when goal changes
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        targetValue: goal.targetValue,
        unit: goal.unit,
        deadline: goal.deadline ? formatDate(goal.deadline, 'yyyy-MM-dd') : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: TaskCategory.STUDY,
        targetValue: 1,
        unit: 'tasks',
        deadline: ''
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.targetValue <= 0) {
      newErrors.targetValue = 'Target value must be positive';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
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

  const handleChange = (field: keyof GoalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' 
      ? (e.target.value ? parseInt(e.target.value) : 1)
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

  const unitOptions = GOAL_UNITS.map(unit => ({
    value: unit,
    label: unit.charAt(0).toUpperCase() + unit.slice(1)
  }));

  // Quick target presets
  const quickTargets = [1, 5, 10, 25, 50, 100];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? 'Edit Goal' : 'Create New Goal'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          id="title"
          label="Goal Title *"
          value={formData.title}
          onChange={handleChange('title')}
          error={errors.title}
          placeholder="e.g., Complete 50 study sessions"
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
            placeholder="Describe your goal in more detail..."
            className="input textarea"
            rows={3}
          />
        </div>

        {/* Category */}
        <Select
          id="category"
          label="Category *"
          value={formData.category}
          onChange={handleChange('category')}
          options={categoryOptions}
        />

        {/* Target Value and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              id="targetValue"
              label="Target Value *"
              type="number"
              value={formData.targetValue}
              onChange={handleChange('targetValue')}
              error={errors.targetValue}
              min="1"
            />
            {/* Quick target buttons */}
            <div className="flex gap-1 mt-2">
              {quickTargets.map(target => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, targetValue: target }))}
                  className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {target}
                </button>
              ))}
            </div>
          </div>

          <Select
            id="unit"
            label="Unit *"
            value={formData.unit}
            onChange={handleChange('unit')}
            options={unitOptions}
            error={errors.unit}
          />
        </div>

        {/* Deadline */}
        <Input
          id="deadline"
          label="Deadline (Optional)"
          type="date"
          value={formData.deadline}
          onChange={handleChange('deadline')}
          error={errors.deadline}
          min={formatDate(new Date(), 'yyyy-MM-dd')}
          helperText="Set a deadline to create urgency and track progress over time"
        />

        {/* Goal Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Goal Preview:</h4>
          <p className="text-sm">
            <strong>{formData.title || 'Your goal title'}</strong>
            <br />
            Target: {formData.targetValue} {formData.unit}
            <br />
            Category: {formData.category}
            {formData.deadline && (
              <>
                <br />
                Deadline: {formatDate(new Date(formData.deadline))}
              </>
            )}
          </p>
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
            {goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalForm;
