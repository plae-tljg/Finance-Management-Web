import React, { useState } from 'react';
import { useAccountRepository, useAppDispatch } from '../../contexts';
import type { Account } from '../../services/database/schemas/Account';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/FormField';
import { Button } from '../ui/Button';

interface AddAccountFormProps {
  initialData?: Account;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddAccountForm: React.FC<AddAccountFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const accountRepo = useAccountRepository();
  const dispatch = useAppDispatch();
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>(
    initialData ? {
      name: initialData.name,
      type: initialData.type,
      currency: initialData.currency,
      icon: initialData.icon,
      isActive: initialData.isActive,
    } : {
      name: '',
      type: 'bank',
      currency: 'CNY',
      icon: '',
      isActive: true,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!accountRepo) {
    console.log('[AddAccountForm] Repository not ready, showing loading...');
    return <div className="text-gray-500">Loading...</div>;
  }

  console.log('[AddAccountForm] Form ready, repository loaded');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AddAccountForm] Submit started', { formData, isEditing, initialData });
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        console.log('[AddAccountForm] Validation failed: empty name');
        throw new Error('Account name is required');
      }
      if (!formData.icon.trim()) {
        console.log('[AddAccountForm] Validation failed: empty icon');
        throw new Error('Account icon is required');
      }

      if (isEditing && initialData) {
        console.log('[AddAccountForm] Updating account in database...', formData);
        await accountRepo.update(initialData.id, formData);
        const updatedAccount = { ...initialData, ...formData };
        console.log('[AddAccountForm] Account updated in DB:', updatedAccount);
        dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
        console.log('[AddAccountForm] State updated successfully');
      } else {
        console.log('[AddAccountForm] Creating account in database...', formData);
        const newAccount = await accountRepo.create(formData);
        console.log('[AddAccountForm] Account created in DB:', newAccount);
        dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
        console.log('[AddAccountForm] State updated successfully');
      }

      if (onSuccess) {
        console.log('[AddAccountForm] Calling onSuccess callback');
        onSuccess();
      }

      if (!isEditing) {
        setFormData({
          name: '',
          type: 'bank',
          currency: 'CNY',
          icon: '',
          isActive: true,
        });
        console.log('[AddAccountForm] Form reset complete');
      }
    } catch (err) {
      console.error('[AddAccountForm] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add account');
    } finally {
      setIsSubmitting(false);
      console.log('[AddAccountForm] Submit finished, isSubmitting set to false');
    }
  };

  const handleChange = (field: string, value: unknown) => {
    console.log(`[AddAccountForm] Field changed: ${field} =`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Account</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Name"
        value={formData.name}
        onChange={e => handleChange('name', e.target.value)}
        placeholder="e.g., Bank of China"
        required
      />

      <Input
        label="Icon"
        value={formData.icon}
        onChange={e => handleChange('icon', e.target.value)}
        placeholder="e.g., 🏦"
        required
      />

      <Select
        label="Type"
        value={formData.type}
        onChange={e => handleChange('type', e.target.value)}
        options={[
          { value: 'bank', label: '🏦 Bank Account' },
          { value: 'cash', label: '💵 Cash' },
          { value: 'digital', label: '📱 Digital Wallet' },
          { value: 'credit', label: '💳 Credit Card' },
        ]}
        required
      />

      <Input
        label="Currency"
        value={formData.currency}
        onChange={e => handleChange('currency', e.target.value)}
        placeholder="e.g., CNY"
        required
      />

      <Checkbox
        label="Active"
        checked={formData.isActive}
        onChange={e => handleChange('isActive', e.target.checked)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>Add</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
};