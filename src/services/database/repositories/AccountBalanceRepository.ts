import type { BaseRepository } from './BaseRepository';
import type { AccountBalance } from '../schemas/AccountBalance';
import type { AccountBalanceCreateInput } from '../schemas/AccountBalance';
import { AccountBalanceQueries, ACCOUNT_BALANCE_INDEXES } from '../schemas/AccountBalance';
import type { QueryExecutor } from '../types/types';

export class AccountBalanceRepository implements BaseRepository<AccountBalance> {
    private db: QueryExecutor;

    constructor(db: QueryExecutor) {
        this.db = db;
    }

    async createTable(): Promise<void> {
        await this.db.executeQuery(AccountBalanceQueries.CREATE_TABLE);
        for (const indexQuery of ACCOUNT_BALANCE_INDEXES) {
            await this.db.executeQuery(indexQuery);
        }
    }

    async createIndexes(): Promise<void> {
        for (const indexQuery of ACCOUNT_BALANCE_INDEXES) {
            await this.db.executeQuery(indexQuery);
        }
    }

    async findById(id: number): Promise<AccountBalance | null> {
        const result = await this.db.executeQuery<AccountBalance>(AccountBalanceQueries.FIND_BY_ID, [id]);
        return result.rows.length > 0 ? result.rows._array[0] : null;
    }

    async findAll(): Promise<AccountBalance[]> {
        const result = await this.db.executeQuery<AccountBalance>(AccountBalanceQueries.FIND_ALL);
        return result.rows._array;
    }

    async findByAccount(accountId: number): Promise<AccountBalance[]> {
        const result = await this.db.executeQuery<AccountBalance>(AccountBalanceQueries.FIND_BY_ACCOUNT, [accountId]);
        return result.rows._array;
    }

    async findByAccountYearMonth(accountId: number, year: number, month: number): Promise<AccountBalance | null> {
        const result = await this.db.executeQuery<AccountBalance>(AccountBalanceQueries.FIND_BY_ACCOUNT_YEAR_MONTH, [accountId, year, month]);
        return result.rows.length > 0 ? result.rows._array[0] : null;
    }

    async findByYearMonth(year: number, month: number): Promise<(AccountBalance & { accountName: string; accountIcon: string; accountType: string })[]> {
        const result = await this.db.executeQuery<AccountBalance & { accountName: string; accountIcon: string; accountType: string }>(
            AccountBalanceQueries.FIND_BY_YEAR_MONTH, [year, month]
        );
        return result.rows._array;
    }

    async getLatestByAccount(accountId: number): Promise<AccountBalance | null> {
        const result = await this.db.executeQuery<AccountBalance>(AccountBalanceQueries.GET_LATEST_BY_ACCOUNT, [accountId]);
        return result.rows.length > 0 ? result.rows._array[0] : null;
    }

    async create(entity: AccountBalanceCreateInput): Promise<AccountBalance> {
        const existing = await this.findByAccountYearMonth(entity.accountId, entity.year, entity.month);
        if (existing) {
            await this.update(existing.id, entity);
            return (await this.findById(existing.id))!;
        }

        const result = await this.db.executeQuery(AccountBalanceQueries.INSERT, [
            entity.accountId,
            entity.year,
            entity.month,
            entity.openingBalance,
            entity.closingBalance,
        ]);
        const newId = result.insertId!;
        return (await this.findById(newId))!;
    }

    async upsert(entity: AccountBalanceCreateInput): Promise<AccountBalance> {
        const existing = await this.findByAccountYearMonth(entity.accountId, entity.year, entity.month);
        if (existing) {
            await this.update(existing.id, entity);
            return (await this.findById(existing.id))!;
        }
        return this.create(entity);
    }

    async update(id: number, entity: Partial<AccountBalance>): Promise<boolean> {
        const fields = Object.keys(entity) as (keyof AccountBalance)[];
        if (fields.length === 0) return false;

        const values = fields.map(f => (entity as Record<string, unknown>)[f]);
        values.push(id);

        const query = AccountBalanceQueries.generateUpdateQuery(fields as string[]);
        const result = await this.db.executeQuery(query, values);
        return (result.changes ?? 0) > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.db.executeQuery(AccountBalanceQueries.DELETE, [id]);
        return (result.changes ?? 0) > 0;
    }

    async count(): Promise<number> {
        const result = await this.db.executeQuery<{ count: number }>(AccountBalanceQueries.COUNT_ALL);
        return result.rows.length > 0 ? result.rows._array[0].count : 0;
    }

    async insertSampleData(): Promise<void> {
        const { SAMPLE_ACCOUNT_BALANCES } = await import('../schemas/AccountBalance');
        for (const balance of SAMPLE_ACCOUNT_BALANCES) {
            await this.create(balance);
        }
    }
}