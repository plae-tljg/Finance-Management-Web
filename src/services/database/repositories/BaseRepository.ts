export interface BaseRepository<T> {
    findById(id: number): Promise<T | null>;  // 根据ID查找记录
    findAll(): Promise<T[]>;  // 查找所有记录
    create(entity: Omit<T, 'id'>): Promise<T>;  // 创建记录
    update(id: number, entity: Partial<T>): Promise<boolean>;  // 更新记录
    delete(id: number): Promise<boolean>;  // 删除记录
    count(): Promise<number>;   // 返回记录数
    createTable(): Promise<void>;  // 创建表
    insertSampleData(): Promise<void>;  // 插入样例数据
    createIndexes(): Promise<void>;  // 创建索引
};  