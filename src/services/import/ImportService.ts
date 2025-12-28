import DatabaseService from '../database/DatabaseService';
import { CategoryRepository } from '../database/repositories/CategoryRepository';
import { BudgetRepository } from '../database/repositories/BudgetRepository';
import { TransactionRepository } from '../database/repositories/TransactionRepository';
import { BankBalanceRepository } from '../database/repositories/BankBalanceRepository';
import type { Category } from '../database/schemas/Category';
import type { Budget } from '../database/schemas/Budget';
import type { Transaction } from '../database/schemas/Transaction';
import type { BankBalance } from '../database/schemas/BankBalance';

export interface ImportData {
  categories?: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[];
  budgets?: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>[];
  transactions?: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[];
  bankBalances?: Omit<BankBalance, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    categories: number;
    budgets: number;
    transactions: number;
    bankBalances: number;
  };
  errors: string[];
}

class ImportService {
  private static instance: ImportService | null = null;

  private constructor() {}

  public static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  /**
   * 从 JSON 文件导入数据
   */
  async importFromFile(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data: ImportData = JSON.parse(text);
      return await this.importData(data);
    } catch (error) {
      return {
        success: false,
        message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
        imported: { categories: 0, budgets: 0, transactions: 0, bankBalances: 0 },
        errors: [error instanceof Error ? error.message : '未知错误']
      };
    }
  }

  /**
   * 导入数据到数据库
   */
  async importData(data: ImportData): Promise<ImportResult> {
    const dbService = DatabaseService.getInstance();
    const db = dbService.getDatabase();
    
    if (!db) {
      throw new Error('数据库未初始化');
    }

    const result: ImportResult = {
      success: true,
      message: '导入完成',
      imported: { categories: 0, budgets: 0, transactions: 0, bankBalances: 0 },
      errors: []
    };

    try {
      // 导入类别
      if (data.categories && data.categories.length > 0) {
        const categoryRepo = new CategoryRepository(dbService);
        for (const category of data.categories) {
          try {
            await categoryRepo.create(category);
            result.imported.categories++;
          } catch (error) {
            result.errors.push(`导入类别失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        }
      }

      // 导入预算
      if (data.budgets && data.budgets.length > 0) {
        const budgetRepo = new BudgetRepository(dbService);
        for (const budget of data.budgets) {
          try {
            await budgetRepo.create(budget);
            result.imported.budgets++;
          } catch (error) {
            result.errors.push(`导入预算失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        }
      }

      // 导入交易
      if (data.transactions && data.transactions.length > 0) {
        const transactionRepo = new TransactionRepository(dbService);
        for (const transaction of data.transactions) {
          try {
            await transactionRepo.create(transaction);
            result.imported.transactions++;
          } catch (error) {
            result.errors.push(`导入交易失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        }
      }

      // 导入银行余额
      if (data.bankBalances && data.bankBalances.length > 0) {
        const bankBalanceRepo = new BankBalanceRepository(dbService);
        for (const balance of data.bankBalances) {
          try {
            await bankBalanceRepo.create(balance);
            result.imported.bankBalances++;
          } catch (error) {
            result.errors.push(`导入银行余额失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
        result.message = `部分导入失败，已导入 ${result.imported.categories + result.imported.budgets + result.imported.transactions + result.imported.bankBalances} 条记录`;
      } else {
        result.message = `成功导入 ${result.imported.categories + result.imported.budgets + result.imported.transactions + result.imported.bankBalances} 条记录`;
      }
    } catch (error) {
      result.success = false;
      result.message = `导入失败: ${error instanceof Error ? error.message : '未知错误'}`;
      result.errors.push(error instanceof Error ? error.message : '未知错误');
    }

    return result;
  }
}

export default ImportService;
export const importService = ImportService.getInstance();

