import React, { useState, useEffect } from 'react';
import { useCategoryRepository, useBudgetRepository, useAppDispatch } from '../../contexts';
import type { Budget } from '../../services/database/schemas/Budget';
import type { Category } from '../../services/database/schemas/Category';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface AddBudgetFormProps {
  initialData?: Budget;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddBudgetForm: React.FC<AddBudgetFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const categoryRepo = useCategoryRepository();
  const budgetRepo = useBudgetRepository();
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<Category[]>([]);
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>(
    initialData ? {
      name: initialData.name,
      categoryId: initialData.categoryId,
      amount: initialData.amount,
      period: initialData.period,
      startDate: initialData.startDate.split('T')[0],
      endDate: initialData.endDate.split('T')[0],
      month: initialData.month,
      isRegular: initialData.isRegular,
      isBudgetExceeded: initialData.isBudgetExceeded,
    } : {
      name: '',
      categoryId: 0,
      amount: 0,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
      month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      isRegular: true,
      isBudgetExceeded: false,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!categoryRepo || !budgetRepo) {
    console.log('[AddBudgetForm] Repository not ready, showing loading...');
    return <div className="text-gray-500">Loading...</div>;
  }

  console.log('[AddBudgetForm] Form ready, repositories loaded');

  useEffect(() => {
    const loadCategories = async () => {
      console.log('[AddBudgetForm] Loading categories...');
      const cats = await categoryRepo.findAll();
      console.log('[AddBudgetForm] Categories loaded:', cats.length);
      setCategories(cats);
      if (cats.length > 0 && formData.categoryId === 0) {
        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
        console.log('[AddBudgetForm] Set default category:', cats[0].name);
      }
    };
    console.log('[AddBudgetForm] Effect: loading initial data');
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddBudgetForm] Submit started', { formData, isEditing, initialData });
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        console.log('[AddBudgetForm] Validation failed: empty name');
        throw new Error('Budget name is required');
      }
      if (formData.categoryId === 0) {
        console.log('[AddBudgetForm] Validation failed: no category');
        throw new Error('Please select a category');
      }
      if (formData.amount <= 0) {
        console.log('[AddBudgetForm] Validation failed: invalid amount', formData.amount);
        throw new Error('Amount must be greater than 0');
      }

      if (isEditing && initialData) {
        console.log('[AddBudgetForm] Updating budget in database...', formData);
        await budgetRepo.update(initialData.id, formData);
        const updatedBudget = { ...initialData, ...formData };
        console.log('[AddBudgetForm] Budget updated in DB:', updatedBudget);
        dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
        console.log('[AddBudgetForm] State updated successfully');
      } else {
        console.log('[AddBudgetForm] Creating budget in database...', formData);
        const newBudget = await budgetRepo.create(formData);
        console.log('[AddBudgetForm] Budget created in DB:', newBudget);
        dispatch({ type: 'ADD_BUDGET', payload: newBudget });
        console.log('[AddBudgetForm] State updated successfully');
      }

      if (onSuccess) {
        console.log('[AddBudgetForm] Calling onSuccess callback');
        onSuccess();
      }

      if (!isEditing) {
        setFormData({
          name: '',
          categoryId: categories.length > 0 ? categories[0].id : 0,
          amount: 0,
          period: 'monthly',
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
          month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
          isRegular: true,
          isBudgetExceeded: false,
        });
        console.log('[AddBudgetForm] Form reset complete');
      }
    } catch (err) {
      console.error('[AddBudgetForm] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add budget');
    } finally {
      setIsSubmitting(false);
      console.log('[AddBudgetForm] Submit finished, isSubmitting set to false');
    }
  };

  const handleChange = (field: string, value: unknown) => {
    console.log(`[AddBudgetForm] Field changed: ${field} =`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Budget</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Budget Name"
        value={formData.name}
        onChange={e => handleChange('name', e.target.value)}
        placeholder="e.g., Monthly Food Budget"
        required
      />

      <Select
        label="Category"
        value={formData.categoryId}
        onChange={e => handleChange('categoryId', parseInt(e.target.value))}
        options={categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
        required
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={e => handleChange('amount', parseFloat(e.target.value) || 0)}
        required
      />

      <Select
        label="Period"
        value={formData.period}
        onChange={e => handleChange('period', e.target.value)}
        options={[
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={e => handleChange('startDate', e.target.value)}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={e => handleChange('endDate', e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>Add</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
};