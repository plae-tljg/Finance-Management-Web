import { CHECK_TABLES_EXISTS, SCHEMAS } from '../schemas';

export const checkTableExists = (db: any, tableName: string) => {
    const result = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
    return result.length > 0 && result[0].values.length > 0;
}

export const checkIfDataExists = (db: any) => {
    const result = db.exec(CHECK_TABLES_EXISTS);
    return result.length > 0 && result[0].values.length > 0;
}

export const checkIsDatabaseInitialized = (db: any): boolean => {
    try {
        // 检查是否存在 database_info 表
        const infoTableResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='database_info'");
        if (infoTableResult.length === 0) {
        return false;
        }
        
        // 检查是否有版本信息
        const versionResult = db.exec("SELECT value FROM database_info WHERE key='version'");
        if (versionResult.length === 0) {
        return false;
        }
        
        // 检查是否有数据
        const hasData = checkIfDataExists(db);
        
        return hasData;
    } catch (error) {
        console.warn('⚠️ 检查数据库初始化状态时出错:', error);
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