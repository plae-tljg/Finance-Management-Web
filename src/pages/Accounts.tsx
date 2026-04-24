import { useState, useMemo } from 'react';
import { useAppState, useAppDispatch, useAccountRepository } from '../contexts';
import { Modal } from '../components/ui/Modal';
import { AddAccountForm } from '../components/forms/AddAccountForm';
import { AccountBalanceModal } from '../components/forms/AccountBalanceModal';
import type { Account } from '../services/database/schemas/Account';
import type { AccountBalance } from '../services/database/schemas/AccountBalance';

type FilterType = 'all' | 'bank' | 'cash' | 'digital' | 'credit';

export default function Accounts() {
    const { state } = useAppState();
    const dispatch = useAppDispatch();
    const accountRepo = useAccountRepository();
    const { accounts, accountBalances } = state;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [balanceAccount, setBalanceAccount] = useState<Account | null>(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    // Search and filters
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [showInactive, setShowInactive] = useState(false);

    const clearFilters = () => {
        setSearchText('');
        setFilterType('all');
        setShowInactive(false);
    };

    const hasActiveFilters = searchText || filterType !== 'all' || showInactive;

    const getLatestBalance = (accountId: number) => {
        const balances = accountBalances
            .filter((ab: AccountBalance) => ab.accountId === accountId)
            .sort((a: AccountBalance, b: AccountBalance) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
        return balances[0]?.closingBalance || 0;
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter((a: Account) => {
            // Search text
            if (searchText && !a.name?.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && a.type !== filterType) return false;

            // Inactive filter
            if (!showInactive && !a.isActive) return false;

            return true;
        });
    }, [accounts, searchText, filterType, showInactive]);

    const groupedAccounts = filteredAccounts.reduce((groups: Record<string, Account[]>, account: Account) => {
        const type = account.type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(account);
        return groups;
    }, {});

    const typeLabels: Record<string, string> = {
        bank: 'Bank Accounts',
        cash: 'Cash',
        digital: 'Digital Wallets',
        credit: 'Credit Cards',
    };

    const typeIcons: Record<string, string> = {
        bank: '🏦',
        cash: '💵',
        digital: '📱',
        credit: '💳',
    };

    // Stats
    const stats = useMemo(() => {
        const totalBalance = filteredAccounts
            .filter((a: Account) => a.isActive && a.type !== 'credit')
            .reduce((sum: number, a: Account) => sum + getLatestBalance(a.id), 0);
        const creditBalance = filteredAccounts
            .filter((a: Account) => a.isActive && a.type === 'credit')
            .reduce((sum: number, a: Account) => sum + getLatestBalance(a.id), 0);
        const inactive = accounts.filter((a: Account) => !a.isActive).length;
        return {
            total: filteredAccounts.length,
            active: filteredAccounts.filter((a: Account) => a.isActive).length,
            inactive,
            totalBalance,
            creditBalance
        };
    }, [filteredAccounts, accounts]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Accounts</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + Add Account
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Total Accounts</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Active</div>
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Inactive</div>
                    <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Total Balance</div>
                    <div className="text-2xl font-bold text-blue-600">¥{stats.totalBalance.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="text-sm text-gray-500">Credit Balance</div>
                    <div className={`text-2xl font-bold ${stats.creditBalance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        ¥{stats.creditBalance.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search account name..."
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
                            <option value="bank">Bank</option>
                            <option value="cash">Cash</option>
                            <option value="digital">Digital</option>
                            <option value="credit">Credit</option>
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

            {/* Accounts by Type */}
            {Object.keys(groupedAccounts).length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                    {hasActiveFilters ? 'No accounts match your filters' : 'No accounts yet'}
                </div>
            ) : (
                Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                    <div key={type} className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex items-center gap-2">
                            <span className="text-xl">{typeIcons[type]}</span>
                            <h3 className="font-semibold text-gray-700">{typeLabels[type]}</h3>
                            <span className="text-sm text-gray-500">({typeAccounts.length})</span>
                        </div>
                        <div className="divide-y">
                            {typeAccounts.map((account: Account) => (
                                <div key={account.id} className={`px-6 py-4 hover:bg-gray-50 ${!account.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{account.icon}</span>
                                            <div>
                                                <div className="font-medium">{account.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {account.currency} • {account.isActive ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`text-xl font-bold ${getLatestBalance(account.id) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                ¥{getLatestBalance(account.id).toLocaleString()}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setBalanceAccount(account);
                                                    setShowBalanceModal(true);
                                                }}
                                                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded"
                                            >
                                                Balance
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingAccount(account);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!accountRepo) return;
                                                    if (window.confirm(`Delete account "${account.name}"?`)) {
                                                        try {
                                                            await accountRepo.delete(account.id);
                                                            dispatch({ type: 'DELETE_ACCOUNT', payload: account.id });
                                                        } catch (err) {
                                                            console.error('Failed to delete account:', err);
                                                            alert('Failed to delete account');
                                                        }
                                                    }
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Account"
            >
                <AddAccountForm onSuccess={() => setShowAddModal(false)} onCancel={() => setShowAddModal(false)} />
            </Modal>

            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingAccount(null);
                }}
                title="Edit Account"
            >
                {editingAccount && (
                    <AddAccountForm
                        initialData={editingAccount}
                        onSuccess={() => {
                            setShowEditModal(false);
                            setEditingAccount(null);
                        }}
                        onCancel={() => {
                            setShowEditModal(false);
                            setEditingAccount(null);
                        }}
                    />
                )}
            </Modal>

            <Modal
                isOpen={showBalanceModal}
                onClose={() => {
                    setShowBalanceModal(false);
                    setBalanceAccount(null);
                }}
                title="Manage Balances"
            >
                {balanceAccount && (
                    <AccountBalanceModal
                        account={balanceAccount}
                        balances={accountBalances.filter((ab: AccountBalance) => ab.accountId === balanceAccount.id)}
                        onSuccess={() => {
                            setShowBalanceModal(false);
                            setBalanceAccount(null);
                        }}
                        onCancel={() => {
                            setShowBalanceModal(false);
                            setBalanceAccount(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
}