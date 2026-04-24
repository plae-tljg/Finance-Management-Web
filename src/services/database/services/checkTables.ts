import { SCHEMAS } from '../schemas';

export const checkTableExists = (db: any, tableName: string) => {
    const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
    return result.length > 0 && result[0].values.length > 0;
}

export const checkIfDataExists = (db: any) => {
    const result = db.exec("SELECT COUNT(*) as count FROM categories");
    return result.length > 0 && result[0].values.length > 0;
}

export const checkIsDatabaseInitialized = (db: any): boolean => {
    try {
        const newTables = ['categories', 'accounts', 'account_balances', 'budgets', 'transactions'];
        for (const tableName of newTables) {
            const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
            if (result.length === 0 || result[0].values.length === 0) {
                console.log(`Table '${tableName}' not found, database needs initialization`);
                return false;
            }
        }
        return true;
    } catch (error) {
        console.warn('检查数据库初始化状态时出错:', error);
        return false;
    }
}

export const checkTableExistsAll = (db: any): boolean => {
    const tableNames = Object.keys(SCHEMAS);
    for (const tableName of tableNames) {
        const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
        if (result.length === 0 || result[0].values.length === 0) {
            return false;
        }
    }
    return true;
}