import { CategoryRepository, BudgetRepository, BankBalanceRepository, TransactionRepository } from '../repositories';
import { checkIfDataExists } from './checkTables';
import { type Database } from 'sql.js';
import DatabaseService from '../DatabaseService';

const repositories = [
    CategoryRepository,
    BudgetRepository,
    BankBalanceRepository,
    TransactionRepository
]

export const createTables = async (db: Database, insertSampleData: boolean = false) => {
    // 使用DatabaseService实例作为QueryExecutor
    const dbService = DatabaseService.getInstance();
    for (const RepositoryClass of repositories) {
        const repository = new RepositoryClass(dbService);
        await repository.createTable();
        if (insertSampleData) {
            await repository.insertSampleData();
        }
    }
}

export const insertSampleData = async (db: Database) => {
    if (checkIfDataExists(db)) {
        console.log(`🔨 数据库中已存在数据，跳过插入样例数据`);
        return;
    }

    const dbService = DatabaseService.getInstance();
    for (const RepositoryClass of repositories) {
        const repository = new RepositoryClass(dbService);
        console.log(`🔨 插入样例数据: ${repository.constructor.name}`);
        await repository.insertSampleData();
    }
}

export const insertSampleDataWithCheck = async (db: Database) => {
    if (checkIfDataExists(db)) {
        console.log(`🔨 数据库中已存在数据，跳过插入样例数据`);
        return;
    }

    const dbService = DatabaseService.getInstance();
    for (const RepositoryClass of repositories) {
        const repository = new RepositoryClass(dbService);
        console.log(`🔨 插入样例数据: ${repository.constructor.name}`);
        await repository.insertSampleData();
    }
}

export const createIndex = async (db: Database) => {
    const dbService = DatabaseService.getInstance();
    for (const RepositoryClass of repositories) {
        const repository = new RepositoryClass(dbService);
        await repository.createIndexes();
    }
}

export const initializeDatabaseFull = async (db: Database) => {
    if (!db) {
        throw new Error('数据库连接未初始化');
    }
    await createTables(db, true);
    await createIndex(db);

    if (checkIfDataExists(db)) {
        console.log(`🔨 数据库中已存在数据，跳过初始化`);
        return;
    }

    await insertSampleData(db);
    console.log(`✅ 样例数据插入完成`);

    console.log(`✅ 数据库初始化完成`);
    
}