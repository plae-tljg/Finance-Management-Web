import { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../contexts/AppStateContext';
import { useCategoryRepository } from '../contexts';
import { Modal } from '../components/ui/Modal';
import { AddCategoryForm } from '../components/forms/AddCategoryForm';
import type { Category } from '../services/database/schemas/Category';

type FilterType = 'all' | 'income' | 'expense';
type SortField = 'name' | 'sortOrder';
type SortDirection = 'asc' | 'desc';

export default function Categories() {
    const { state } = useAppState();
    const dispatch = useAppDispatch();
    const categoryRepo = useCategoryRepository();
    const { categories } = state;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    // Search and filters
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [showInactive, setShowInactive] = useState(false);

    // Sorting
    const [sortField, setSortField] = useState<SortField>('sortOrder');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const clearFilters = () => {
        setSearchText('');
        setFilterType('all');
        setShowInactive(false);
    };

    const hasActiveFilters = searchText || filterType !== 'all' || showInactive;

    const filteredCategories = useMemo(() => {
        let result = categories.filter((c: Category) => {
            // Search text
            if (searchText && !c.name?.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && c.type !== filterType) return false;

            // Inactive filter
            if (!showInactive && !c.isActive) return false;

            return true;
        });

        // Sort
        result.sort((a: Category, b: Category) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = (a.name || '').localeCompare(b.name || '');
                    break;
                case 'sortOrder':
                    comparison = a.sortOrder - b.sortOrder;
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [categories, searchText, filterType, showInactive, sortField, sortDirection]);

    const incomeCategories = filteredCategories.filter(c => c.type === 'income');
    const expenseCategories = filteredCategories.filter(c => c.type === 'expense');

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

    // Stats
    const stats = useMemo(() => {
        const income = categories.filter(c => c.type === 'income').length;
        const expense = categories.filter(c => c.type === 'expense').length;
        const inactive = categories.filter(c => !c.isActive).length;
        return { income, expense, inactive, total: categories.length };
    }, [categories]);

    if (!categoryRepo) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    const handleDelete = async (id: number) => {
        console.log('[Categories] Delete requested for category id:', id);
        try {
            console.log('[Categories] Calling categoryRepo.delete...');
            await categoryRepo.delete(id);
            console.log('[Categories] Delete successful, dispatching DELETE_CATEGORY...');
            dispatch({ type: 'DELETE_CATEGORY', payload: id });
            console.log('[Categories] State updated, closing confirm dialog');
            setDeleteConfirm(null);
        } catch (err) {
            console.error('[Categories] Delete failed:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + Add Category
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Total</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Income</div>
                    <div className="text-2xl font-bold text-green-600">{stats.income}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Expense</div>
                    <div className="text-2xl font-bold text-red-600">{stats.expense}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Inactive</div>
                    <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search category name..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value as FilterType)}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={e => setShowInactive(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span className="text-sm">Show inactive</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 bg-green-50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💰</span>
                            <h3 className="font-semibold text-gray-700">Income Categories</h3>
                            <span className="text-sm text-gray-500">({incomeCategories.length})</span>
                        </div>
                        <button
                            onClick={() => toggleSort('name')}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Sort{getSortIndicator('name')}
                        </button>
                    </div>
                    <div className="divide-y">
                        {incomeCategories.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No income categories</div>
                        ) : (
                            incomeCategories.map((category: Category) => (
                                <div key={category.id} className={`px-6 py-4 hover:bg-gray-50 flex items-center justify-between ${!category.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{category.icon}</span>
                                        <div>
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-sm text-gray-500">
                                                Sort: {category.sortOrder} • {category.isDefault ? 'Default' : 'Custom'}{!category.isActive ? ' • Inactive' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                        >
                                            ✏️
                                        </button>
                                        {category.isDefault && (
                                            <span className="px-2 py-1 text-xs bg-gray-100 rounded">Default</span>
                                        )}
                                        {!category.isActive && (
                                            <span className="px-2 py-1 text-xs bg-gray-200 rounded">Inactive</span>
                                        )}
                                        <button
                                            onClick={() => setDeleteConfirm(category.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 bg-red-50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">💸</span>
                            <h3 className="font-semibold text-gray-700">Expense Categories</h3>
                            <span className="text-sm text-gray-500">({expenseCategories.length})</span>
                        </div>
                        <button
                            onClick={() => toggleSort('name')}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Sort{getSortIndicator('name')}
                        </button>
                    </div>
                    <div className="divide-y">
                        {expenseCategories.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No expense categories</div>
                        ) : (
                            expenseCategories.map((category: Category) => (
                                <div key={category.id} className={`px-6 py-4 hover:bg-gray-50 flex items-center justify-between ${!category.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{category.icon}</span>
                                        <div>
                                            <div className="font-medium">{category.name}</div>
                                            <div className="text-sm text-gray-500">
                                                Sort: {category.sortOrder} • {category.isDefault ? 'Default' : 'Custom'}{!category.isActive ? ' • Inactive' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                        >
                                            ✏️
                                        </button>
                                        {category.isDefault && (
                                            <span className="px-2 py-1 text-xs bg-gray-100 rounded">Default</span>
                                        )}
                                        {!category.isActive && (
                                            <span className="px-2 py-1 text-xs bg-gray-200 rounded">Inactive</span>
                                        )}
                                        <button
                                            onClick={() => setDeleteConfirm(category.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Category"
            >
                <AddCategoryForm onSuccess={() => setShowAddModal(false)} onCancel={() => setShowAddModal(false)} />
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                }}
                title="Edit Category"
            >
                {editingCategory && (
                    <AddCategoryForm
                        initialData={editingCategory}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setEditingCategory(null);
                        }}
                        onCancel={() => {
                            setShowEditModal(false);
                            setEditingCategory(null);
                        }}
                    />
                )}
            </Modal>

            <Modal
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Category"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">Are you sure you want to delete this category?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}