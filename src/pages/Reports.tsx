import { useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import type { Category } from '../services/database/schemas/Category';
import type { Account } from '../services/database/schemas/Account';
import type { Transaction } from '../services/database/schemas/Transaction';

interface CategorySummaryItem {
    category: Category;
    total: number;
    count: number;
}

interface AccountSummaryItem {
    account: Account;
    total: number;
    count: number;
}

export default function Reports() {
    const { state } = useAppState();
    const { transactions, categories, accounts, selectedMonth } = state;

    const currentMonthTransactions = useMemo(() =>
        transactions.filter((t: Transaction) => t.date.startsWith(selectedMonth)),
        [transactions, selectedMonth]
    );

    const income = useMemo(() =>
        currentMonthTransactions
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        [currentMonthTransactions]
    );

    const expense = useMemo(() =>
        currentMonthTransactions
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        [currentMonthTransactions]
    );

    const categorySummary = useMemo(() => {
        const summary: Record<number, CategorySummaryItem> = {};
        currentMonthTransactions.forEach((t: Transaction) => {
            if (!summary[t.categoryId]) {
                const category = categories.find((c: Category) => c.id === t.categoryId);
                if (!category) {
                    console.warn('[Reports] Category not found for transaction:', t);
                    return;
                }
                summary[t.categoryId] = {
                    category,
                    total: 0,
                    count: 0,
                };
            }
            summary[t.categoryId].total += t.amount;
            summary[t.categoryId].count += 1;
        });
        return Object.values(summary).sort((a: CategorySummaryItem, b: CategorySummaryItem) => b.total - a.total);
    }, [currentMonthTransactions, categories]);

    const accountSummary = useMemo(() => {
        const summary: Record<number, AccountSummaryItem> = {};
        currentMonthTransactions.forEach((t: Transaction) => {
            if (!summary[t.accountId]) {
                const account = accounts.find((a: Account) => a.id === t.accountId);
                if (!account) {
                    console.warn('[Reports] Account not found for transaction:', t);
                    return;
                }
                summary[t.accountId] = {
                    account,
                    total: 0,
                    count: 0,
                };
            }
            summary[t.accountId].total += t.amount;
            summary[t.accountId].count += 1;
        });
        return Object.values(summary).sort((a: AccountSummaryItem, b: AccountSummaryItem) => b.total - a.total);
    }, [currentMonthTransactions, accounts]);

    const expenseCategories = categorySummary.filter(c => c.category?.type === 'expense');
    const incomeCategories = categorySummary.filter(c => c.category?.type === 'income');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Reports - {selectedMonth}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">¥{income.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500">Total Expense</div>
                    <div className="text-2xl font-bold text-red-600">¥{expense.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-sm text-gray-500">Net Savings</div>
                    <div className={`text-2xl font-bold ${income - expense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ¥{(income - expense).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
                    {expenseCategories.length === 0 ? (
                        <p className="text-gray-500">No expenses this month</p>
                    ) : (
                        <div className="space-y-3">
                            {expenseCategories.map((item: CategorySummaryItem) => {
                                const percentage = expense > 0 ? (item.total / expense) * 100 : 0;
                                return (
                                    <div key={item.category?.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="flex items-center gap-2">
                                                <span>{item.category?.icon}</span>
                                                <span>{item.category?.name}</span>
                                            </span>
                                            <span className="text-sm text-gray-500">¥{item.total.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Income by Category</h3>
                    {incomeCategories.length === 0 ? (
                        <p className="text-gray-500">No income this month</p>
                    ) : (
                        <div className="space-y-3">
                            {incomeCategories.map((item: CategorySummaryItem) => {
                                const percentage = income > 0 ? (item.total / income) * 100 : 0;
                                return (
                                    <div key={item.category?.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="flex items-center gap-2">
                                                <span>{item.category?.icon}</span>
                                                <span>{item.category?.name}</span>
                                            </span>
                                            <span className="text-sm text-gray-500">¥{item.total.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Spending by Account</h3>
                {accountSummary.length === 0 ? (
                    <p className="text-gray-500">No transactions this month</p>
                ) : (
                    <div className="space-y-3">
                        {accountSummary.map((item: AccountSummaryItem) => {
                            const percentage = (income + expense) > 0 ? (item.total / (income + expense)) * 100 : 0;
                            return (
                                <div key={item.account.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="flex items-center gap-2">
                                            <span>{item.account.icon}</span>
                                            <span>{item.account.name}</span>
                                        </span>
                                        <span className="text-sm text-gray-500">¥{item.total.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
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