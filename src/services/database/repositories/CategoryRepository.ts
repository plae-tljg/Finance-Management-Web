import { type Category, CategoryFields, type UpdatableFields, CategoryQueries, DEFAULT_CATEGORIES, CATEGORY_INDEXES } from '../schemas/Category';
import { type BaseRepository } from './BaseRepository';
import { type QueryExecutor } from '../types/types';

export class CategoryRepository implements BaseRepository<Category> {
  private db: QueryExecutor;

  constructor(db: QueryExecutor) {
    this.db = db;
  } 

  async createTable(): Promise<void> {
    await this.db.executeQuery<Category>(CategoryQueries.CREATE_TABLE);
  }

  async insertSampleData() {
    for (const category of DEFAULT_CATEGORIES) {
      await this.create(category);
    }
  }

  async createIndexes(): Promise<void> {
    for (const index of CATEGORY_INDEXES) {
      await this.db.executeQuery<Category>(index);
    }
  }

  async findById(id: number): Promise<Category | null> {
    const result = await this.db.executeQuery<Category>(CategoryQueries.FIND_BY_ID, [id]);
    return result.rows._array[0] || null;
  } 

  async findAll(): Promise<Category[]> {
    const result = await this.db.executeQuery<Category>(CategoryQueries.FIND_ALL);
    return result.rows._array || [];
  }

  async findAllWithType(): Promise<(Category & { typeName: string })[]> {
    const result = await this.db.executeQuery<Category & { typeName: string }>(CategoryQueries.FIND_BY_TYPE_WITH_NAME);
    return result.rows._array;  // this currently is wrong sql
  }

  async findByType(type: 'income' | 'expense'): Promise<Category[]> {
    const result = await this.db.executeQuery<Category>(CategoryQueries.FIND_BY_TYPE, [type]);
    return result.rows._array;
  }

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const { name, icon, type, sortOrder = 0, isDefault = false, isActive = true } = category;   
    
    const result = await this.db.executeQuery<Category>(
      CategoryQueries.INSERT,
      [name, icon, type, sortOrder, isDefault, isActive]
    );

    if (!result.insertId) {
      throw new Error('Failed to create category');
    }

    return {
      id: result.insertId,
      ...category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async update(id: number, entity: Partial<Category>): Promise<boolean> {
    const updates: { fields: string[]; values: any[] } = {
      fields: [],
      values: []
    };
    
    Object.entries(entity).forEach(([field, value]) => {
      if (value !== undefined && CategoryFields.UPDATABLE.includes(field as UpdatableFields)) { // as UpdatableFields is for older version
        updates.fields.push(field);
        updates.values.push(value);
      }
    });
    
    if (updates.fields.length === 0) return false;
    
    const query = CategoryQueries.generateUpdateQuery(updates.fields);
    updates.values.push(id);
    
    const result = await this.db.executeQuery<never>(query, updates.values);
    return (result.changes ?? 0) > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.executeQuery<never>(
      CategoryQueries.DELETE,
      [id]
    );
    return (result.changes ?? 0) > 0;
  }

  async count(): Promise<number> {
    const result = await this.db.executeQuery<{count: number}>(
      CategoryQueries.COUNT_ALL
    );
    return result.rows._array[0]?.count ?? 0;
  }
}