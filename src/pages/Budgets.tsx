import { useState, useMemo } from 'react';
import { useAppState, useAppDispatch, useBudgetRepository } from '../contexts';
import { Modal } from '../components/ui/Modal';
import { AddBudgetForm } from '../components/forms/AddBudgetForm';
import type { Budget } from '../services/database/schemas/Budget';
import type { Category } from '../services/database/schemas/Category';
import type { Transaction } from '../services/database/schemas/Transaction';

type SortField = 'name' | 'amount' | 'spent' | 'percentage';
type SortDirection = 'asc' | 'desc';

export default function Budgets() {
    const { state } = useAppState();
    const dispatch = useAppDispatch();
    const budgetRepo = useBudgetRepository();
    const { budgets, categories, transactions, selectedMonth } = state;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Search and filters
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'exceeded'>('all');
    const [showOnlyExceedBudget, setShowOnlyExceedBudget] = useState(false);

    // Sorting
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const clearFilters = () => {
        setSearchText('');
        setFilterCategory('all');
        setFilterStatus('all');
        setShowOnlyExceedBudget(false);
    };

    const hasActiveFilters = searchText || filterCategory !== 'all' || filterStatus !== 'all' || showOnlyExceedBudget;

    const currentMonthBudgets = budgets.filter((b: Budget) => b.month === selectedMonth);

    const budgetData = useMemo(() => {
        return currentMonthBudgets.map((budget: Budget) => {
            const category = categories.find((c: Category) => c.id === budget.categoryId);
            const budgetTransactions = transactions.filter((t: Transaction) => t.budgetId === budget.id && t.date.startsWith(selectedMonth));
            const spent = budgetTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            return {
                ...budget,
                category,
                spent,
                percentage,
                remaining: budget.amount - spent,
                isExceeded: percentage > 100,
            };
        });
    }, [currentMonthBudgets, categories, transactions, selectedMonth]);

    const filteredBudgets = useMemo(() => {
        let result = budgetData.filter((budget: typeof budgetData[0]) => {
            if (searchText && !budget.name?.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
            if (filterCategory !== 'all' && budget.categoryId !== filterCategory) return false;
            if (filterStatus === 'exceeded' && !budget.isExceeded) return false;
            if (filterStatus === 'normal' && budget.isExceeded) return false;
            if (showOnlyExceedBudget && !budget.isExceeded) return false;
            return true;
        });

        result.sort((a: typeof budgetData[0], b: typeof budgetData[0]) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'spent':
                    comparison = a.spent - b.spent;
                    break;
                case 'percentage':
                    comparison = a.percentage - b.percentage;
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [budgetData, searchText, filterCategory, filterStatus, showOnlyExceedBudget, sortField, sortDirection]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIndicator = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    const stats = useMemo(() => {
        const totalBudgeted = budgetData.reduce((sum: number, b: typeof budgetData[0]) => sum + b.amount, 0);
        const totalSpent = budgetData.reduce((sum: number, b: typeof budgetData[0]) => sum + b.spent, 0);
        const exceededCount = budgetData.filter((b: typeof budgetData[0]) => b.isExceeded).length;
        return { totalBudgeted, totalSpent, exceededCount, count: budgetData.length };
    }, [budgetData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Budgets - {selectedMonth}</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + Add Budget
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Total Budgets</div>
                    <div className="text-2xl font-bold">{stats.count}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Budgeted</div>
                    <div className="text-2xl font-bold text-blue-600">¥{stats.totalBudgeted.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Spent</div>
                    <div className="text-2xl font-bold text-red-600">¥{stats.totalSpent.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Exceeded</div>
                    <div className={`text-2xl font-bold ${stats.exceededCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.exceededCount} budgets
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search budget name..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((c: Category) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as 'all' | 'normal' | 'exceeded')}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="normal">Normal</option>
                            <option value="exceeded">Exceeded</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOnlyExceedBudget}
                            onChange={e => setShowOnlyExceedBudget(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Show only exceeded</span>
                    </label>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                {filteredBudgets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {hasActiveFilters ? 'No budgets match your filters' : 'No budgets for this month'}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('name')}
                                >
                                    Budget{getSortIndicator('name')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                <th
                                    className="px-6 py-3 text-right text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('amount')}
                                >
                                    Budgeted{getSortIndicator('amount')}
                                </th>
                                <th
                                    className="px-6 py-3 text-right text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('spent')}
                                >
                                    Spent{getSortIndicator('spent')}
                                </th>
                                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Remaining</th>
                                <th
                                    className="px-6 py-3 text-center text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('percentage')}
                                >
                                    Progress{getSortIndicator('percentage')}
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredBudgets.map((budget: typeof budgetData[0]) => (
                                <tr key={budget.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{budget.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-2">
                                            <span>{budget.category?.icon}</span>
                                            <span>{budget.category?.name}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">¥{budget.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">¥{budget.spent.toLocaleString()}</td>
                                    <td className={`px-6 py-4 text-right font-semibold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ¥{budget.remaining.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-24">
                                                <div
                                                    className={`h-full transition-all ${budget.isExceeded ? 'bg-red-500' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-sm font-medium ${budget.isExceeded ? 'text-red-600' : 'text-gray-500'}`}>
                                                {budget.percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => {
                                                setEditingBudget(budget);
                                                setShowEditModal(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-700 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!budgetRepo) return;
                                                if (window.confirm(`Delete budget "${budget.name}"?`)) {
                                                    try {
                                                        await budgetRepo.delete(budget.id);
                                                        dispatch({ type: 'DELETE_BUDGET', payload: budget.id });
                                                    } catch (err) {
                                                        console.error('Failed to delete budget:', err);
                                                        alert('Failed to delete budget');
                                                    }
                                                }
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Budget"
            >
                <AddBudgetForm onSuccess={() => setShowAddModal(false)} onCancel={() => setShowAddModal(false)} />
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingBudget(null);
                }}
                title="Edit Budget"
            >
                {editingBudget && (
                    <AddBudgetForm
                        initialData={editingBudget}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setEditingBudget(null);
                        }}
                        onCancel={() => {
                            setShowEditModal(false);
                            setEditingBudget(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}