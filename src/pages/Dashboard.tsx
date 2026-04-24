import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../contexts/AppStateContext';

export default function Dashboard() {
    const { state } = useAppState();
    const dispatch = useAppDispatch();
    const { categories, transactions, budgets, accounts, accountBalances, selectedMonth } = state;

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({ type: 'SET_SELECTED_MONTH', payload: e.target.value });
    };

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach(t => {
            const month = t.date.substring(0, 7);
            months.add(month);
        });
        const current = new Date();
        const currentMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        months.add(currentMonth);
        return Array.from(months).sort().reverse();
    }, [transactions]);

    const currentMonthTransactions = useMemo(() =>
        transactions.filter(t => t.date.startsWith(selectedMonth)),
        [transactions, selectedMonth]
    );

    const income = useMemo(() =>
        currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
        [currentMonthTransactions]
    );

    const expense = useMemo(() =>
        currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        [currentMonthTransactions]
    );

    const balance = income - expense;

    const budgetUsage = useMemo(() => {
        const currentMonthBudgets = budgets.filter(b => b.month === selectedMonth);
        return currentMonthBudgets.map(budget => {
            const spent = currentMonthTransactions
                .filter(t => t.budgetId === budget.id)
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                ...budget,
                spent,
                percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
            };
        });
    }, [budgets, currentMonthTransactions, selectedMonth]);

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="px-4 py-2 border rounded-lg bg-white"
                >
                    {availableMonths.length === 0 ? (
                        <option value={selectedMonth}>{selectedMonth}</option>
                    ) : (
                        availableMonths.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))
                    )}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500">Income</div>
                    <div className="text-2xl font-bold text-green-600">¥{income.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500">Expense</div>
                    <div className="text-2xl font-bold text-red-600">¥{expense.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500">Balance</div>
                    <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ¥{balance.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
                    {budgetUsage.length === 0 ? (
                        <p className="text-gray-500">No budgets for this month</p>
                    ) : (
                        <div className="space-y-4">
                            {budgetUsage.map(budget => (
                                <div key={budget.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{budget.name}</span>
                                        <span>¥{budget.spent} / ¥{budget.amount}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${budget.percentage > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                    {recentTransactions.length === 0 ? (
                        <p className="text-gray-500">No transactions yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentTransactions.map(t => {
                                const category = categories.find(c => c.id === t.categoryId);
                                const account = accounts.find(a => a.id === t.accountId);
                                return (
                                    <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">
                                                {category?.icon || '💰'}
                                            </span>
                                            <div>
                                                <div className="font-medium">{t.description || 'No description'}</div>
                                                <div className="text-sm text-gray-500">
                                                    {category?.name} · {account?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}¥{t.amount.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
                {accounts.length === 0 ? (
                    <p className="text-gray-500">No accounts yet</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {accounts.filter(a => a.isActive).map(account => {
                            const latestBalance = accountBalances
                                .filter((ab: { accountId: number }) => ab.accountId === account.id)
                                .sort((a: { year: number; month: number }, b: { year: number; month: number }) => {
                                    if (a.year !== b.year) return b.year - a.year;
                                    return b.month - a.month;
                                })[0];
                            return (
                                <div key={account.id} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{account.icon}</span>
                                        <span className="font-medium">{account.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 capitalize mb-1">{account.type}</div>
                                    <div className="text-xl font-bold">
                                        ¥{latestBalance?.closingBalance.toLocaleString() || '0'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}