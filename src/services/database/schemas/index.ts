import { DEFAULT_CATEGORIES, CategoryQueries, CATEGORY_INDEXES } from './Category';
import { SAMPLE_TRANSACTIONS, TransactionQueries, TRANSACTION_INDEXES } from './Transaction';
import { SAMPLE_BUDGETS, BudgetQueries, BUDGET_INDEXES } from './Budget';
import { SAMPLE_BANK_BALANCES, BankBalanceQueries, BANK_BALANCE_INDEXES } from './BankBalance';

// 集中管理数据库表结构
export const SCHEMA_VERSIONS = {
  v1: '1.0.0',
  // 未来版本在这里添加
};

// 按照依赖关系排序的表创建语句
export const SCHEMAS = {
  // 先创建没有外键依赖的表
  categories: CategoryQueries.CREATE_TABLE,
  budgets: BudgetQueries.CREATE_TABLE,
  bank_balances: BankBalanceQueries.CREATE_TABLE,
  // 最后创建有外键依赖的表
  transactions: TransactionQueries.CREATE_TABLE,
}; 

export const SCHEMAS_SAMPLE_DATA = {
    categories: DEFAULT_CATEGORIES,
    transactions: SAMPLE_TRANSACTIONS,
    budgets: SAMPLE_BUDGETS,
    bank_balances: SAMPLE_BANK_BALANCES,
  }

export const SCHEMAS_VERSION = "1.0.0"

export const CHECK_TABLES_EXISTS = CategoryQueries.COUNT_ALL;

export const SCHEMAS_INDEXES = [
  ...CATEGORY_INDEXES,
  ...TRANSACTION_INDEXES,
  ...BUDGET_INDEXES,
  ...BANK_BALANCE_INDEXES
]