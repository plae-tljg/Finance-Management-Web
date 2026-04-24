import { Button } from '../ui/Button';
import { ImportComponent } from '../import/ImportComponent';
import type { ImportResult } from '../../services/import';

interface ImportExportPanelProps {
  onImportComplete: (result: ImportResult) => void;
  onExportAll: () => void;
  onExportCategories: () => void;
  onExportBudgets: () => void;
  onExportTransactions: () => void;
  onExportBankBalances: () => void;
  categoryCount: number;
  budgetCount: number;
  transactionCount: number;
  bankBalanceCount: number;
}

export function ImportExportPanel({
  onImportComplete,
  onExportAll,
  onExportCategories,
  onExportBudgets,
  onExportTransactions,
  onExportBankBalances,
  categoryCount,
  budgetCount,
  transactionCount,
  bankBalanceCount,
}: ImportExportPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📥 Import Data</h3>
        <ImportComponent onImportComplete={onImportComplete} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📤 Export Data</h3>
          <Button size="sm" variant="primary" onClick={onExportAll}>
            Export All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Categories ({categoryCount})</span>
            <Button size="sm" variant="ghost" onClick={onExportCategories}>📤</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Budgets ({budgetCount})</span>
            <Button size="sm" variant="ghost" onClick={onExportBudgets}>📤</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Transactions ({transactionCount})</span>
            <Button size="sm" variant="ghost" onClick={onExportTransactions}>📤</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Bank Balances ({bankBalanceCount})</span>
            <Button size="sm" variant="ghost" onClick={onExportBankBalances}>📤</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
