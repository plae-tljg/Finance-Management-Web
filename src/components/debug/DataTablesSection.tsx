import { DataTable } from '../ui/DataTable';
import type { Column } from '../ui/DataTable';
import type { Category } from '../../services/database/schemas/Category';
import type { Budget } from '../../services/database/schemas/Budget';
import type { Transaction } from '../../services/database/schemas/Transaction';
import type { BankBalance } from '../../services/database/schemas/BankBalance';

interface DataTablesSectionProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  bankBalances: BankBalance[];
  isLoading?: boolean;
}

const categoryColumns: Column<Category>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'icon', header: 'Icon' },
  {
    key: 'type',
    header: 'Type',
    render: (value) => (
      <span className={value === 'income' ? 'text-green-600' : 'text-red-600'}>
        {value === 'income' ? 'Income' : 'Expense'}
      </span>
    ),
  },
  { key: 'sortOrder', header: 'Sort' },
  {
    key: 'isDefault',
    header: 'Default',
    render: (value) => (value ? '✅' : '❌'),
  },
  {
    key: 'isActive',
    header: 'Active',
    render: (value) => (value ? '✅' : '❌'),
  },
];

const budgetColumns: Column<Budget>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'categoryId', header: 'Category ID' },
  {
    key: 'amount',
    header: 'Amount',
    render: (value) => `¥${value}`,
  },
  { key: 'period', header: 'Period' },
  { key: 'month', header: 'Month' },
];

const transactionColumns: Column<Transaction>[] = [
  { key: 'id', header: 'ID' },
  {
    key: 'amount',
    header: 'Amount',
    className: 'font-medium',
    render: (value, item) => (
      <span className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
        {item.type === 'income' ? '+' : '-'}¥{value}
      </span>
    ),
  },
  { key: 'categoryId', header: 'Category ID' },
  { key: 'budgetId', header: 'Budget ID' },
  { key: 'description', header: 'Description' },
  { key: 'date', header: 'Date' },
  {
    key: 'type',
    header: 'Type',
    render: (value) => (
      <span className={value === 'income' ? 'text-green-600' : 'text-red-600'}>
        {value === 'income' ? 'Income' : 'Expense'}
      </span>
    ),
  },
];

const bankBalanceColumns: Column<BankBalance>[] = [
  { key: 'id', header: 'ID' },
  { key: 'year', header: 'Year' },
  { key: 'month', header: 'Month' },
  {
    key: 'openingBalance',
    header: 'Opening',
    render: (value) => `¥${value}`,
  },
  {
    key: 'closingBalance',
    header: 'Closing',
    render: (value) => `¥${value}`,
  },
];

export function DataTablesSection({
  categories,
  budgets,
  transactions,
  bankBalances,
  isLoading = false,
}: DataTablesSectionProps) {
  return (
    <div className="space-y-6">
      <DataTable
        data={categories}
        columns={categoryColumns}
        title="📂 Categories"
        emptyMessage="No categories yet"
        isLoading={isLoading}
      />

      <DataTable
        data={budgets}
        columns={budgetColumns}
        title="💰 Budgets"
        emptyMessage="No budgets yet"
        isLoading={isLoading}
      />

      <DataTable
        data={transactions}
        columns={transactionColumns}
        title="💳 Transactions"
        emptyMessage="No transactions yet"
        isLoading={isLoading}
      />

      <DataTable
        data={bankBalances}
        columns={bankBalanceColumns}
        title="🏦 Bank Balances"
        emptyMessage="No bank balances yet"
        isLoading={isLoading}
      />
    </div>
  );
}
