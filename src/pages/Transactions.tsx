import { useState, useMemo } from 'react';
import { useAppState, useAppDispatch, useTransactionRepository } from '../contexts';
import { Modal } from '../components/ui/Modal';
import { AddTransactionForm } from '../components/forms/AddTransactionForm';
import type { Category } from '../services/database/schemas/Category';
import type { Account } from '../services/database/schemas/Account';
import type { Transaction } from '../services/database/schemas/Transaction';

type SortField = 'date' | 'amount' | 'type';
type SortDirection = 'asc' | 'desc';

export default function Transactions() {
    const { state } = useAppState();
    const dispatch = useAppDispatch();
    const transactionRepo = useTransactionRepository();
    const { transactions, categories, accounts } = state;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Search and filters
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');
    const [filterAccount, setFilterAccount] = useState<number | 'all'>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [amountMin, setAmountMin] = useState<string>('');
    const [amountMax, setAmountMax] = useState<string>('');

    // Quick date presets
    const [datePreset, setDatePreset] = useState<string>('all');

    const datePresets = [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' },
        { label: 'Last Month', value: 'lastMonth' },
        { label: 'This Year', value: 'year' },
        { label: 'Custom', value: 'custom' },
    ];

    const getDateRangeFromPreset = (preset: string): { from: string; to: string } => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();

        switch (preset) {
            case 'today':
                return {
                    from: new Date(year, month, day).toISOString().split('T')[0],
                    to: new Date(year, month, day).toISOString().split('T')[0]
                };
            case 'week':
                const startOfWeek = new Date(year, month, day - day);
                const endOfWeek = new Date(year, month, day + (6 - day));
                return {
                    from: startOfWeek.toISOString().split('T')[0],
                    to: endOfWeek.toISOString().split('T')[0]
                };
            case 'month':
                return {
                    from: new Date(year, month, 1).toISOString().split('T')[0],
                    to: new Date(year, month + 1, 0).toISOString().split('T')[0]
                };
            case 'lastMonth':
                return {
                    from: new Date(year, month - 1, 1).toISOString().split('T')[0],
                    to: new Date(year, month, 0).toISOString().split('T')[0]
                };
            case 'year':
                return {
                    from: new Date(year, 0, 1).toISOString().split('T')[0],
                    to: new Date(year, 11, 31).toISOString().split('T')[0]
                };
            default:
                return { from: '', to: '' };
        }
    };

    const handleDatePresetChange = (preset: string) => {
        setDatePreset(preset);
        if (preset !== 'custom') {
            const range = getDateRangeFromPreset(preset);
            setDateFrom(range.from);
            setDateTo(range.to);
        }
    };

    // Sorting
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Advanced filter visibility
    const [showAdvanced, setShowAdvanced] = useState(false);

    const clearFilters = () => {
        setSearchText('');
        setFilterType('all');
        setFilterCategory('all');
        setFilterAccount('all');
        setDateFrom('');
        setDateTo('');
        setAmountMin('');
        setAmountMax('');
        setDatePreset('all');
    };

    const hasActiveFilters = searchText || filterType !== 'all' || filterCategory !== 'all' ||
        filterAccount !== 'all' || dateFrom || dateTo || amountMin || amountMax;

    const filteredTransactions = useMemo(() => {
        let result = transactions.filter((t: Transaction) => {
            // Search text
            if (searchText && !t.description?.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && t.type !== filterType) return false;

            // Category filter
            if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;

            // Account filter
            if (filterAccount !== 'all' && t.accountId !== filterAccount) return false;

            // Date range filter
            if (dateFrom && t.date < dateFrom) return false;
            if (dateTo && t.date > dateTo) return false;

            // Amount range filter
            if (amountMin && t.amount < parseFloat(amountMin)) return false;
            if (amountMax && t.amount > parseFloat(amountMax)) return false;

            return true;
        });

        // Sort
        result.sort((a: Transaction, b: Transaction) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = a.date.localeCompare(b.date);
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [transactions, searchText, filterType, filterCategory, filterAccount, dateFrom, dateTo, amountMin, amountMax, sortField, sortDirection]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN');
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIndicator = (field: SortField) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    // Summary stats
    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const expense = filteredTransactions
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        return { income, expense, count: filteredTransactions.length };
    }, [filteredTransactions]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + Add Transaction
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Showing</div>
                    <div className="text-2xl font-bold">{stats.count} transactions</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Income</div>
                    <div className="text-2xl font-bold text-green-600">+¥{stats.income.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Expense</div>
                    <div className="text-2xl font-bold text-red-600">-¥{stats.expense.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Net</div>
                    <div className={`text-2xl font-bold ${stats.income - stats.expense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {stats.income - stats.expense >= 0 ? '+' : '-'}¥{Math.abs(stats.income - stats.expense).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Search and Basic Filters */}
            <div className="bg-white rounded-xl shadow p-4 space-y-4">
                {/* Date Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                    {datePresets.map(preset => (
                        <button
                            key={preset.value}
                            onClick={() => handleDatePresetChange(preset.value)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                datePreset === preset.value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search description..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
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
                        <label className="block text-sm font-medium text-gray-500 mb-1">Account</label>
                        <select
                            value={filterAccount}
                            onChange={e => setFilterAccount(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="all">All Accounts</option>
                            {accounts.map((a: Account) => (
                                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                        {showAdvanced ? 'Hide Advanced' : 'Advanced'}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="flex flex-wrap gap-4 items-end pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Min Amount</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={amountMin}
                                onChange={e => setAmountMin(e.target.value)}
                                className="px-4 py-2 border rounded-lg w-32"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Max Amount</label>
                            <input
                                type="number"
                                placeholder="999999"
                                value={amountMax}
                                onChange={e => setAmountMax(e.target.value)}
                                className="px-4 py-2 border rounded-lg w-32"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('date')}
                                >
                                    Date{getSortIndicator('date')}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Account</th>
                                <th
                                    className="px-6 py-3 text-right text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100"
                                    onClick={() => toggleSort('amount')}
                                >
                                    Amount{getSortIndicator('amount')}
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredTransactions.map((t: Transaction) => {
                                const category = categories.find((c: Category) => c.id === t.categoryId);
                                const account = accounts.find((a: Account) => a.id === t.accountId);
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">{formatDate(t.date)}</td>
                                        <td className="px-6 py-4 font-medium">{t.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2">
                                                <span>{category?.icon}</span>
                                                <span>{category?.name}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2">
                                                <span>{account?.icon}</span>
                                                <span>{account?.name}</span>
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setEditingTransaction(t);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!transactionRepo) return;
                                                    if (window.confirm(`Delete transaction "${t.description || t.id}"?`)) {
                                                        try {
                                                            await transactionRepo.delete(t.id);
                                                            dispatch({ type: 'DELETE_TRANSACTION', payload: t.id });
                                                        } catch (err) {
                                                            console.error('Failed to delete transaction:', err);
                                                            alert('Failed to delete transaction');
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Transaction"
            >
                <AddTransactionForm onSuccess={() => setShowAddModal(false)} onCancel={() => setShowAddModal(false)} />
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                }}
                title="Edit Transaction"
            >
                {editingTransaction && (
                    <AddTransactionForm
                        initialData={editingTransaction}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setEditingTransaction(null);
                        }}
                        onCancel={() => {
                            setShowEditModal(false);
                            setEditingTransaction(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}