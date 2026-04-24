import type { BaseRepository } from './BaseRepository';
import type { Account } from '../schemas/Account';
import type { AccountCreateInput } from '../schemas/Account';
import { AccountQueries, ACCOUNT_INDEXES } from '../schemas/Account';
import type { QueryExecutor } from '../types/types';

export class AccountRepository implements BaseRepository<Account> {
    private db: QueryExecutor;

    constructor(db: QueryExecutor) {
        this.db = db;
    }

    async createTable(): Promise<void> {
        await this.db.executeQuery(AccountQueries.CREATE_TABLE);
        for (const indexQuery of ACCOUNT_INDEXES) {
            await this.db.executeQuery(indexQuery);
        }
    }

    async createIndexes(): Promise<void> {
        for (const indexQuery of ACCOUNT_INDEXES) {
            await this.db.executeQuery(indexQuery);
        }
    }

    async findById(id: number): Promise<Account | null> {
        const result = await this.db.executeQuery<Account>(AccountQueries.FIND_BY_ID, [id]);
        return result.rows.length > 0 ? result.rows._array[0] : null;
    }

    async findAll(): Promise<Account[]> {
        const result = await this.db.executeQuery<Account>(AccountQueries.FIND_ALL);
        return result.rows._array;
    }

    async findActive(): Promise<Account[]> {
        const result = await this.db.executeQuery<Account>(AccountQueries.FIND_ACTIVE);
        return result.rows._array;
    }

    async create(entity: AccountCreateInput): Promise<Account> {
        const result = await this.db.executeQuery(AccountQueries.INSERT, [
            entity.name,
            entity.type,
            entity.currency,
            entity.icon,
            entity.isActive ?? true,
        ]);
        const newId = result.insertId!;
        return (await this.findById(newId))!;
    }

    async update(id: number, entity: Partial<Account>): Promise<boolean> {
        const fields = Object.keys(entity) as (keyof Account)[];
        if (fields.length === 0) return false;

        const values = fields.map(f => (entity as Record<string, unknown>)[f]);
        values.push(id);

        const query = AccountQueries.generateUpdateQuery(fields as string[]);
        const result = await this.db.executeQuery(query, values);
        return (result.changes ?? 0) > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.db.executeQuery(AccountQueries.DELETE, [id]);
        return (result.changes ?? 0) > 0;
    }

    async count(): Promise<number> {
        const result = await this.db.executeQuery<{ count: number }>(AccountQueries.COUNT_ALL);
        return result.rows.length > 0 ? result.rows._array[0].count : 0;
    }

    async insertSampleData(): Promise<void> {
        const { DEFAULT_ACCOUNTS } = await import('../schemas/Account');
        for (const account of DEFAULT_ACCOUNTS) {
            await this.create(account);
        }
    }
}