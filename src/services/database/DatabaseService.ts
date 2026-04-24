import initSqlJs, { type Database } from 'sql.js';
import { type QueryExecutor, type DatabaseQueryResult } from './types/types';
import { checkTableExistsAll } from './services/checkTables';

const DB_STORAGE_KEY = 'finance_db_data';

export type DatabaseEvent = 'transaction_updated' | 'budget_updated' | 'category_updated';

class DatabaseService implements QueryExecutor {
    private static instance: DatabaseService | null = null;
    private database: Database | null = null;
    private eventListeners: Map<DatabaseEvent, Set<() => void>> = new Map();
    private isResetting = false;
    private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  
    private constructor() {}
  
    public static getInstance(): DatabaseService {
      if (!DatabaseService.instance) {
        DatabaseService.instance = new DatabaseService();
      }
      return DatabaseService.instance;
    }

    // 初始化数据库
    async initialize(createTablesFn?: (db: Database) => Promise<void>): Promise<void> {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });

        const savedData = this.loadFromStorage();
        if (savedData) {
          this.database = new SQL.Database(savedData);
          console.log('[DatabaseService] Loaded existing database from storage');
        } else {
          this.database = new SQL.Database();
          console.log('[DatabaseService] Created new database');
        }
        
        if (createTablesFn) {
          await createTablesFn(this.database);
        }
        
        this.saveToStorage();
        console.log('数据库初始化完成');
      } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
      }
    }

    async executeQuery<T>(
        query: string, 
        params: any[] = []
      ): Promise<DatabaseQueryResult<T>> {
        if (!this.database) {
          throw new Error('数据库未初始化');
        }
    
        try {
          if (!query.trim().toUpperCase().startsWith('SELECT')) {
            // 对于非SELECT查询，使用run方法
            this.database.run(query, params);
            this.scheduleSave();
            
            if (query.includes('transactions')) {
              this.emit('transaction_updated');
            } else if (query.includes('budgets')) {
              this.emit('budget_updated');
            } else if (query.includes('categories')) {
              this.emit('category_updated');
            }
            
            // 尝试获取最后插入的ID（如果表有自增主键）
            let lastInsertId: number | undefined;
            try {
              const result = this.database.exec('SELECT last_insert_rowid() as id');
              if (result.length > 0 && result[0].values.length > 0) {
                lastInsertId = result[0].values[0][0] as number;
              }
            } catch {
              // 忽略错误
            }
            
            return {
              rows: {
                _array: [],
                length: 0
              },
              changes: 1, // 假设成功执行
              insertId: lastInsertId
            };
          } else {
            const result = this.database.exec(query, params);
            const rows = result.length > 0 ? result[0].values : [];
            const columns = result.length > 0 ? result[0].columns : [];
            
            // 将结果转换为对象数组
            const objects = rows.map(row => {
              const obj: any = {};
              columns.forEach((col, index) => {
                obj[col] = row[index];
              });
              return obj;
            });
            
            return {
              rows: {
                _array: objects as T[],
                length: objects.length
              }
            };
          }
        } catch (error) {
          console.error('执行查询失败:', error);
          throw error;
        }
    }

    // 实现事务方法
    async transaction<T>(callback: (tx: QueryExecutor) => Promise<T>): Promise<T> {
      if (!this.database) {
        throw new Error('数据库未初始化');
      }

      try {
        this.database.run('BEGIN TRANSACTION');
        const result = await callback(this);
        this.database.run('COMMIT');
        return result;
      } catch (error) {
        this.database.run('ROLLBACK');
        throw error;
      }
    }

    // 事件监听器管理
    on(event: DatabaseEvent, callback: () => void): void {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, new Set());
      }
      this.eventListeners.get(event)!.add(callback);
    }

    off(event: DatabaseEvent, callback: () => void): void {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    }

    private emit(event: DatabaseEvent): void {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.forEach(callback => callback());
      }
    }

    // 获取数据库实例
    getDatabase(): Database | null {
      return this.database;
    }

    // 保存数据库到localStorage
    saveToStorage(): void {
      if (!this.database) return;
      
      try {
        const data = this.database.export();
        const base64 = btoa(String.fromCharCode.apply(null, Array.from(data)));
        localStorage.setItem(DB_STORAGE_KEY, base64);
        console.log('[DatabaseService] Database saved to storage');
      } catch (error) {
        console.error('[DatabaseService] Failed to save database to storage:', error);
      }
    }

    // 从localStorage加载数据库
    loadFromStorage(): Uint8Array | null {
      try {
        const base64 = localStorage.getItem(DB_STORAGE_KEY);
        if (!base64) return null;
        
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        console.log('[DatabaseService] Database loaded from storage');
        return bytes;
      } catch (error) {
        console.error('[DatabaseService] Failed to load database from storage:', error);
        return null;
      }
    }

    // 清除存储的数据库
    clearStorage(): void {
      localStorage.removeItem(DB_STORAGE_KEY);
      console.log('[DatabaseService] Database storage cleared');
    }

    // 延迟保存（防抖，避免频繁写入）
    scheduleSave(): void {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.saveToStorage();
        this.saveTimeout = null;
      }, 500);
    }

    // 检查表是否存在
    checkTableExists(tableName: string): boolean {
      if (!this.database) return false;
      
      try {
        const result = this.database.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
        return result.length > 0 && result[0].values.length > 0;
      } catch {
        return false;
      }
    }

    // 获取数据库版本
    getDatabaseVersion(): string {
      if (!this.database) return '1.0.0';
      
      try {
        const result = this.database.exec("SELECT value FROM database_info WHERE key='version'");
        return result.length > 0 ? result[0].values[0][0] as string : '1.0.0';
      } catch {
        return '1.0.0';
      }
    }

    // 检查数据库是否已经初始化
    isDatabaseInitialized(): boolean {
      if (!this.database) return false;
      
      try {
        // 检查核心表是否存在
        const hasTables = checkTableExistsAll(this.database);
        if (!hasTables) {
          return false;
        }
        
        // 检查是否有数据
        const categoriesResult = this.database.exec('SELECT COUNT(*) as count FROM categories');
        const categoriesCount = categoriesResult.length > 0 ? categoriesResult[0].values[0][0] as number : 0;
        
        return categoriesCount > 0;
      } catch (error) {
        console.warn('检查数据库初始化状态时出错:', error);
        return false;
      }
    }

    // 重置数据库
    async resetDatabase(): Promise<void> {
      if (this.isResetting) return;
      
      this.isResetting = true;
      try {
        if (this.database) {
          this.database.close();
          this.database = null;
        }
        // 重置时不自动初始化，需要外部调用
      } finally {
        this.isResetting = false;
      }
    }

    // 关闭数据库
    closeDatabase(): void {
      if (this.database) {
        this.database.close();
        this.database = null;
      }
    }
}

export default DatabaseService;

export const databaseService = DatabaseService.getInstance();

export const initializeDatabaseService = async (createTablesFn?: (db: Database) => Promise<void>) => {
  await databaseService.initialize(createTablesFn);
};

/*
使用示例:

// 获取数据库服务实例
const dbService = DatabaseService.getInstance();

// 初始化数据库
await dbService.initialize();

// 执行查询
const result = await dbService.executeQuery('SELECT * FROM categories');

// 插入数据
await dbService.executeQuery(
  'INSERT INTO categories (name, type, color) VALUES (?, ?, ?)',
  ['工资', 'income', '#4CAF50']
);

// 使用事务
await dbService.transaction(async (tx) => {
  await tx.executeQuery('INSERT INTO categories (name, icon, type, sortOrder, isDefault, isActive) VALUES (?, ?, ?, ?, ?, ?)', 
    ['餐饮', '🍚', 'expense', 1, true, true]);
  await tx.executeQuery('INSERT INTO categories (name, icon, type, sortOrder, isDefault, isActive) VALUES (?, ?, ?, ?, ?, ?)', 
    ['交通', '🚌', 'expense', 2, true, true]);
});

// 监听事件
dbService.on('transaction_updated', () => {
  console.log('交易记录已更新');
});

// 检查表是否存在
const hasTable = dbService.checkTableExists('categories');

// 获取数据库版本
const version = dbService.getDatabaseVersion(); // 返回字符串格式，如 "1.0.0"

// 关闭数据库
dbService.closeDatabase();

// 完整示例请参考: src/services/database/examples/DatabaseUsageExample.ts
*/