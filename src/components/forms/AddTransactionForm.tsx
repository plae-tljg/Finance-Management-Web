import React, { useState } from 'react';
import { useCategoryRepository, useBudgetRepository, useTransactionRepository, useAccountRepository, useAppDispatch } from '../../contexts';
import type { Transaction } from '../../services/database/schemas/Transaction';
import type { Category } from '../../services/database/schemas/Category';
import type { Budget } from '../../services/database/schemas/Budget';
import type { Account } from '../../services/database/schemas/Account';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface AddTransactionFormProps {
    initialData?: Transaction;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const categoryRepo = useCategoryRepository();
    const budgetRepo = useBudgetRepository();
    const accountRepo = useAccountRepository();
    const transactionRepo = useTransactionRepository();
    const dispatch = useAppDispatch();
    const isEditing = !!initialData;

    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>(
        initialData ? {
            amount: initialData.amount,
            categoryId: initialData.categoryId,
            accountId: initialData.accountId,
            budgetId: initialData.budgetId,
            description: initialData.description || '',
            date: initialData.date.split('T')[0],
            type: initialData.type,
        } : {
            amount: 0,
            categoryId: 0,
            accountId: 0,
            budgetId: 0,
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
        }
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!categoryRepo || !budgetRepo || !accountRepo || !transactionRepo) {
        console.log('[AddTransactionForm] One or more repositories not ready, showing loading...');
        return <div className="text-gray-500">Loading...</div>;
    }

    console.log('[AddTransactionForm] Form ready, all repositories loaded');

    const loadCategories = async () => {
        console.log('[AddTransactionForm] Loading categories...');
        const cats = await categoryRepo.findAll();
        console.log('[AddTransactionForm] Categories loaded:', cats.length);
        setCategories(cats);
        if (cats.length > 0 && formData.categoryId === 0) {
            setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
            console.log('[AddTransactionForm] Set default category:', cats[0].name);
        }
    };

    const loadBudgets = async () => {
        console.log('[AddTransactionForm] Loading budgets...');
        const budgetsData = await budgetRepo.findAll();
        console.log('[AddTransactionForm] Budgets loaded:', budgetsData.length);
        setBudgets(budgetsData);
        if (budgetsData.length > 0 && formData.budgetId === 0) {
            setFormData(prev => ({ ...prev, budgetId: budgetsData[0].id }));
            console.log('[AddTransactionForm] Set default budget:', budgetsData[0].name);
        }
    };

    const loadAccounts = async () => {
        console.log('[AddTransactionForm] Loading accounts...');
        const accountsData = await accountRepo.findActive();
        console.log('[AddTransactionForm] Accounts loaded:', accountsData.length);
        setAccounts(accountsData);
        if (accountsData.length > 0 && formData.accountId === 0) {
            setFormData(prev => ({ ...prev, accountId: accountsData[0].id }));
            console.log('[AddTransactionForm] Set default account:', accountsData[0].name);
        }
    };

    React.useEffect(() => {
        console.log('[AddTransactionForm] Effect: loading initial data');
        loadCategories();
        loadBudgets();
        loadAccounts();
    }, []);

    React.useEffect(() => {
        if (formData.categoryId > 0) {
            const category = categories.find(c => c.id === formData.categoryId);
            if (category) {
                console.log('[AddTransactionForm] Category type auto-update:', category.type);
                setFormData(prev => ({ ...prev, type: category.type }));
            }
        }
    }, [formData.categoryId, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[AddTransactionForm] Submit started', { formData, isEditing, initialData });
        setError(null);
        setIsSubmitting(true);

        try {
            if (formData.categoryId === 0) {
                console.log('[AddTransactionForm] Validation failed: no category');
                throw new Error('Please select a category');
            }
            if (formData.accountId === 0) {
                console.log('[AddTransactionForm] Validation failed: no account');
                throw new Error('Please select an account');
            }
            if (formData.budgetId === 0) {
                console.log('[AddTransactionForm] Validation failed: no budget');
                throw new Error('Please select a budget');
            }
            if (formData.amount <= 0) {
                console.log('[AddTransactionForm] Validation failed: invalid amount', formData.amount);
                throw new Error('Amount must be greater than 0');
            }

            if (isEditing && initialData) {
                console.log('[AddTransactionForm] Updating transaction in database...', formData);
                await transactionRepo.update(initialData.id, formData);
                const updatedTransaction = { ...initialData, ...formData };
                console.log('[AddTransactionForm] Transaction updated in DB:', updatedTransaction);
                dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
                console.log('[AddTransactionForm] State updated successfully');
            } else {
                console.log('[AddTransactionForm] Creating transaction in database...', formData);
                const newTransaction = await transactionRepo.create(formData);
                console.log('[AddTransactionForm] Transaction created in DB:', newTransaction);
                dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
                console.log('[AddTransactionForm] State updated successfully');
            }

            if (onSuccess) {
                console.log('[AddTransactionForm] Calling onSuccess callback');
                onSuccess();
            }

            if (!isEditing) {
                setFormData({
                    amount: 0,
                    categoryId: categories.length > 0 ? categories[0].id : 0,
                    accountId: accounts.length > 0 ? accounts[0].id : 0,
                    budgetId: budgets.length > 0 ? budgets[0].id : 0,
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    type: 'expense',
                });
                console.log('[AddTransactionForm] Form reset complete');
            }
        } catch (err) {
            console.error('[AddTransactionForm] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to add transaction');
        } finally {
            setIsSubmitting(false);
            console.log('[AddTransactionForm] Submit finished, isSubmitting set to false');
        }
    };

    const handleChange = (field: string, value: unknown) => {
        console.log(`[AddTransactionForm] Field changed: ${field} =`, value);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Transaction</h3>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <Select
                label="Type"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                options={[
                    { value: 'expense', label: 'Expense' },
                    { value: 'income', label: 'Income' },
                ]}
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
                label="Category"
                value={formData.categoryId}
                onChange={e => handleChange('categoryId', parseInt(e.target.value))}
                options={filteredCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
                placeholder="Select category"
                required
            />

            <Select
                label="Account"
                value={formData.accountId}
                onChange={e => handleChange('accountId', parseInt(e.target.value))}
                options={accounts.map(a => ({ value: a.id, label: `${a.icon} ${a.name}` }))}
                placeholder="Select account"
                required
            />

            <Select
                label="Budget"
                value={formData.budgetId}
                onChange={e => handleChange('budgetId', parseInt(e.target.value))}
                options={budgets.map(b => ({ value: b.id, label: b.name }))}
                placeholder="Select budget"
                required
            />

            <Input
                label="Description"
                value={formData.description || ''}
                onChange={e => handleChange('description', e.target.value || '')}
                placeholder="e.g., Lunch at restaurant"
            />

            <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={e => handleChange('date', e.target.value)}
                required
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