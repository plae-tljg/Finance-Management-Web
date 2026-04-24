import { Button } from '../ui/Button';

interface DataOverviewProps {
  categoryCount: number;
  budgetCount: number;
  transactionCount: number;
  bankBalanceCount: number;
  onAddCategory: () => void;
  onAddBudget: () => void;
  onAddTransaction: () => void;
  onAddBankBalance: () => void;
  onExportCategories: () => void;
  onExportBudgets: () => void;
  onExportTransactions: () => void;
  onExportBankBalances: () => void;
}

export function DataOverview({
  categoryCount,
  budgetCount,
  transactionCount,
  bankBalanceCount,
  onAddCategory,
  onAddBudget,
  onAddTransaction,
  onAddBankBalance,
  onExportCategories,
  onExportBudgets,
  onExportTransactions,
  onExportBankBalances,
}: DataOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
          <span className="text-2xl">📂</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{categoryCount}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={onAddCategory}>➕ Add</Button>
          <Button size="sm" variant="ghost" onClick={onExportCategories}>📤</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budgets</h3>
          <span className="text-2xl">💰</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{budgetCount}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={onAddBudget}>➕ Add</Button>
          <Button size="sm" variant="ghost" onClick={onExportBudgets}>📤</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</h3>
          <span className="text-2xl">💳</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{transactionCount}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={onAddTransaction}>➕ Add</Button>
          <Button size="sm" variant="ghost" onClick={onExportTransactions}>📤</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Balances</h3>
          <span className="text-2xl">🏦</span>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{bankBalanceCount}</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="ghost" onClick={onAddBankBalance}>➕ Add</Button>
          <Button size="sm" variant="ghost" onClick={onExportBankBalances}>📤</Button>
        </div>
      </div>
    </div>
  );
}
