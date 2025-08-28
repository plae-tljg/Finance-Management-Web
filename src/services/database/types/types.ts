// 数据库查询结果类型
export interface DatabaseQueryResult<T> {
    rows: {
      _array: T[];
      length: number;
    };
    insertId?: number;
    changes?: number;
}

// 查询执行器类型
export interface QueryExecutor {
executeQuery<T>(query: string, params?: any[]): Promise<DatabaseQueryResult<T>>;
transaction<T>(callback: (tx: QueryExecutor) => Promise<T>): Promise<T>;
} 