import { type BankBalance, BankBalanceQueries, SAMPLE_BANK_BALANCES, BANK_BALANCE_INDEXES } from '../schemas/BankBalance';
import { type BaseRepository } from './BaseRepository';
import { type QueryExecutor } from '../types/types';

export class BankBalanceRepository implements BaseRepository<BankBalance> {
  private db: QueryExecutor;

  constructor(db: QueryExecutor) {
    this.db = db;
  }

  async createTable(): Promise<void> {
    await this.db.executeQuery<BankBalance>(BankBalanceQueries.CREATE_TABLE);
  }

  async insertSampleData(): Promise<void> {
    for (const balance of SAMPLE_BANK_BALANCES) {
      await this.create(balance);
    }
  }

  async createIndexes(): Promise<void> {
    for (const index of BANK_BALANCE_INDEXES) {
      await this.db.executeQuery<BankBalance>(index);
    }
  }

  async findById(id: number): Promise<BankBalance | null> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.FIND_BY_ID,
      [id]
    );
    return result.rows._array[0] || null;
  }

  async findAll(): Promise<BankBalance[]> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.FIND_ALL
    );
    return result.rows._array;
  }

  async create(balance: Omit<BankBalance, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankBalance> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.INSERT,
      [balance.year, balance.month, balance.openingBalance, balance.closingBalance]
    );
    
    if (!result.insertId) {
      throw new Error('Failed to create bank balance');
    }

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error('Failed to retrieve created bank balance');
    }
    
    return created;
  }

  async update(id: number, balance: Partial<BankBalance>): Promise<boolean> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.UPDATE,
      [balance.openingBalance, balance.closingBalance, id]
    );
    return (result.changes ?? 0) > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.DELETE,
      [id]
    );
    return (result.changes ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await this.db.executeQuery<{count: number}>(
      BankBalanceQueries.COUNT_ALL
    );
    return result.rows._array[0]?.count ?? 0;
  }

  async findByYearMonth(year: number, month: number): Promise<BankBalance | null> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.FIND_BY_YEAR_MONTH,
      [year, month]
    );
    return result.rows._array[0] || null;
  }

  async findByYear(year: number): Promise<BankBalance[]> {
    const result = await this.db.executeQuery<BankBalance>(
      BankBalanceQueries.FIND_BY_YEAR,
      [year]
    );
    return result.rows._array;
  }

  async initializeYear(year: number): Promise<void> {
    try {
      const existingBalances = await this.findByYear(year);
      if (existingBalances.length > 0) return;

      const balances = Array.from({ length: 12 }, (_, i) => ({
        year,
        month: i + 1,
        openingBalance: 0,
        closingBalance: 0
      }));

      await this.db.transaction(async (tx) => {
        for (const balance of balances) {
          await tx.executeQuery(
            BankBalanceQueries.INSERT,
            [balance.year, balance.month, balance.openingBalance, balance.closingBalance]
          );
        }
      });
    } catch (error) {
      console.error('初始化年度银行余额失败:', error);
      throw error;
    }
  }
} 