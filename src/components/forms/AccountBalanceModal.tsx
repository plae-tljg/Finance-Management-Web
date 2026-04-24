import React, { useState, useMemo } from 'react';
import { useAccountBalanceRepository, useTransactionRepository, useAppState } from '../../contexts';
import type { Account } from '../../services/database/schemas/Account';
import type { AccountBalance } from '../../services/database/schemas/AccountBalance';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AccountBalanceModalProps {
    account: Account;
    balances: AccountBalance[];
    onSuccess: () => void;
    onCancel: () => void;
}

export const AccountBalanceModal: React.FC<AccountBalanceModalProps> = ({
    account,
    balances,
    onSuccess,
    onCancel,
}) => {
    const balanceRepo = useAccountBalanceRepository();
    const transactionRepo = useTransactionRepository();
    const { actions } = useAppState();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [editingBalances, setEditingBalances] = useState<Record<string, {
        openingBalance: number;
        closingBalance: number;
        isModified: boolean;
    }>>(() => {
        const init: Record<string, any> = {};
        balances.forEach(b => {
            const key = `${b.year}-${b.month}`;
            init[key] = {
                openingBalance: b.openingBalance,
                closingBalance: b.closingBalance,
                isModified: false,
            };
        });
        return init;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const months = useMemo(() => {
        const result = [];
        for (let year = currentYear; year >= currentYear - 2; year--) {
            const maxMonth = year === currentYear ? currentMonth : 12;
            for (let month = maxMonth; month >= 1; month--) {
                result.push({ year, month });
            }
        }
        return result;
    }, [currentYear, currentMonth]);

    const computeAutoBalance = async (year: number, month: number, openingBalance: number) => {
        if (!transactionRepo) return openingBalance;

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, '0')}-01`;

        const transactions = await transactionRepo.findByDateRange(startDate, endDate);
        const accountTransactions = transactions.filter(t => t.accountId === account.id);

        let balance = openingBalance;
        accountTransactions.forEach(t => {
            if (t.type === 'income') {
                balance += t.amount;
            } else {
                balance -= t.amount;
            }
        });

        return balance;
    };

    const handleOpeningBalanceChange = (key: string, value: number) => {
        setEditingBalances(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                openingBalance: value,
                closingBalance: prev[key]?.closingBalance ?? value,
                isModified: true,
            }
        }));
    };

    const handleClosingBalanceChange = (key: string, value: number) => {
        setEditingBalances(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                closingBalance: value,
                isModified: true,
            }
        }));
    };

    const handleAutoCompute = async (key: string, openingBalance: number) => {
        const [year, month] = key.split('-').map(Number);
        const computedClosing = await computeAutoBalance(year, month, openingBalance);

        setEditingBalances(prev => ({
            ...prev,
            [key]: {
                openingBalance,
                closingBalance: computedClosing,
                isModified: true,
            }
        }));
    };

    const handleAutoComputeAll = async () => {
        for (const key of Object.keys(editingBalances)) {
            const [year, month] = key.split('-').map(Number);
            const openingBalance = editingBalances[key]?.openingBalance ?? 0;
            const computedClosing = await computeAutoBalance(year, month, openingBalance);

            setEditingBalances(prev => ({
                ...prev,
                [key]: {
                    openingBalance,
                    closingBalance: computedClosing,
                    isModified: true,
                }
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!balanceRepo) return;

        setError(null);
        setIsSubmitting(true);

        try {
            for (const key of Object.keys(editingBalances)) {
                const [year, month] = key.split('-').map(Number);
                const data = editingBalances[key];

                if (!data.isModified) continue;

                await balanceRepo.upsert({
                    accountId: account.id,
                    year,
                    month,
                    openingBalance: data.openingBalance,
                    closingBalance: data.closingBalance,
                });
            }

            await actions.loadAllData();
            onSuccess();
        } catch (err) {
            console.error('[AccountBalanceModal] Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to save balances');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatKey = (year: number, month: number) => `${year}-${month}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {account.icon} {account.name} - Monthly Balances
                </h3>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAutoComputeAll}
                >
                    Auto Compute All
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="max-h-96 overflow-y-auto space-y-3">
                {months.map(({ year, month }) => {
                    const key = formatKey(year, month);
                    const data = editingBalances[key];
                    const isPast = year < currentYear || (year === currentYear && month < currentMonth);
                    const monthLabel = `${year}-${String(month).padStart(2, '0')}`;

                    return (
                        <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-20 font-medium text-gray-700">{monthLabel}</div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Opening</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data?.openingBalance ?? 0}
                                    onChange={e => handleOpeningBalanceChange(key, parseFloat(e.target.value) || 0)}
                                    onBlur={() => {
                                        if (isPast) {
                                            handleAutoCompute(key, data?.openingBalance ?? 0);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Closing</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data?.closingBalance ?? 0}
                                    onChange={e => handleClosingBalanceChange(key, parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            {isPast && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleAutoCompute(key, data?.openingBalance ?? 0)}
                                    className="mt-5"
                                >
                                    Auto
                                </Button>
                            )}
                            {data?.isModified && (
                                <span className="text-xs text-blue-500 mt-5">Modified</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
};
