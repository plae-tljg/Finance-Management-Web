export interface Transaction {
    id: number;
    amount: number;        // 金额
    categoryId: number;    // 关联的类别ID（如：餐饮、交通等）
    accountId: number;     // 关联的账户ID（银行、现金、数字钱包等）
    budgetId: number;      // 关联的预算ID
    description: string | null;
    date: string;         // 交易日期
    type: 'income' | 'expense';  // 类型：收入或支出
    createdAt: string;
    updatedAt: string;
};

// 可选：添加一些示例交易数据用于测试
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const SAMPLE_TRANSACTIONS: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { amount: 15000, categoryId: 5, accountId: 1, budgetId: 0, description: '工资', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, type: 'income' },
    { amount: 2000, categoryId: 8, accountId: 1, budgetId: 0, description: '奖金', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, type: 'income' },
    { amount: 45, categoryId: 1, accountId: 4, budgetId: 1, description: '早餐', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`, type: 'expense' },
    { amount: 35, categoryId: 1, accountId: 3, budgetId: 1, description: '午餐', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`, type: 'expense' },
    { amount: 120, categoryId: 2, accountId: 4, budgetId: 2, description: '地铁月票', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, type: 'expense' },
    { amount: 280, categoryId: 3, accountId: 4, budgetId: 3, description: '网购日用品', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-07`, type: 'expense' },
    { amount: 150, categoryId: 4, accountId: 4, budgetId: 4, description: '周末电影', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-09`, type: 'expense' },
    { amount: 800, categoryId: 6, accountId: 1, budgetId: 5, description: '家用开支', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`, type: 'expense' },
    { amount: 56, categoryId: 1, accountId: 3, budgetId: 1, description: '朋友聚餐', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-12`, type: 'expense' },
    { amount: 200, categoryId: 2, accountId: 3, budgetId: 2, description: '打车费', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`, type: 'expense' },
    { amount: 320, categoryId: 3, accountId: 5, budgetId: 3, description: '新衣服', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-18`, type: 'expense' },
    { amount: 88, categoryId: 1, accountId: 4, budgetId: 1, description: '生日聚餐', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-20`, type: 'expense' },
    { amount: 1500, categoryId: 6, accountId: 2, budgetId: 5, description: '家具维修', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-22`, type: 'expense' },
    { amount: 500, categoryId: 4, accountId: 5, budgetId: 4, description: '游戏充值', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`, type: 'expense' },
];

export const TransactionFields = {
  UPDATABLE: ['amount', 'categoryId', 'accountId', 'budgetId', 'description', 'date', 'type'] as const,
  REQUIRED: ['amount', 'categoryId', 'accountId', 'budgetId', 'date', 'type'] as const,
  OPTIONAL: ['description'] as const
} as const;

export type UpdatableFields = typeof TransactionFields.UPDATABLE[number];  // 'amount' | 'categoryId' | 'accountId' | 'budgetId' | 'description' | 'date' | 'type'
export type RequiredFields = typeof TransactionFields.REQUIRED[number];  // 'amount' | 'categoryId' | 'accountId' | 'budgetId' | 'date' | 'type'

export const TRANSACTION_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(categoryId)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(accountId)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_budget ON transactions(budgetId)'
]

export const TransactionQueries = {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        categoryId INTEGER NOT NULL,
        accountId INTEGER NOT NULL,
        budgetId INTEGER NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (accountId) REFERENCES accounts(id),
        FOREIGN KEY (budgetId) REFERENCES budgets(id)
      )
    `,
    
    INSERT: `
      INSERT INTO transactions (
        amount, 
        categoryId, 
        accountId,
        budgetId, 
        description, 
        date, 
        type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    
    UPDATE: `
      UPDATE transactions 
      SET amount = COALESCE(?, amount),
          categoryId = COALESCE(?, categoryId),
          accountId = COALESCE(?, accountId),
          budgetId = COALESCE(?, budgetId),
          description = COALESCE(?, description),
          date = COALESCE(?, date),
          type = COALESCE(?, type),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    
    DELETE: 'DELETE FROM transactions WHERE id = ?',
    
    FIND_BY_ID: 'SELECT * FROM transactions WHERE id = ?',
    
    FIND_ALL: 'SELECT * FROM transactions ORDER BY date DESC',
    
    FIND_BY_CATEGORY_ID: 'SELECT * FROM transactions WHERE categoryId = ? ORDER BY date DESC',
    
    FIND_BY_BUDGET_ID: 'SELECT * FROM transactions WHERE budgetId = ? ORDER BY date DESC',
    
    FIND_BY_DATE_RANGE: 'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
    
    COUNT_ALL: 'SELECT COUNT(*) as count FROM transactions',
  
    FIND_ALL_WITH_CATEGORY: `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon
      FROM transactions t
      LEFT JOIN categories c ON t.categoryId = c.id
      ORDER BY t.date DESC
    `,
  
    FIND_BY_ID_WITH_CATEGORY: `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon
      FROM transactions t
      LEFT JOIN categories c ON t.categoryId = c.id
      WHERE t.id = ?
    `,
  
    FIND_BY_DATE_RANGE_WITH_CATEGORY: `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon
      FROM transactions t
      LEFT JOIN categories c ON t.categoryId = c.id
      WHERE t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `,
  
    GET_TOTAL_BY_TYPE: `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = ?
    `,
  
    GET_SUMMARY_BY_CATEGORY: `
      SELECT 
        t.categoryId,
        c.name as categoryName,
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN categories c ON t.categoryId = c.id
      WHERE t.date BETWEEN ? AND ?
      GROUP BY t.categoryId, c.name
      ORDER BY total DESC
    `,
  
    GET_SUMMARY_BY_BUDGET: `
      SELECT
        b.id as budgetId,
        b.name as budgetName,
        COALESCE(SUM(t.amount), 0) as totalSpent,
        b.amount as budgetAmount,
        CASE
          WHEN COALESCE(SUM(t.amount), 0) > b.amount THEN 1
          ELSE 0
        END as isExceeded
      FROM budgets b
      LEFT JOIN transactions t ON b.id = t.budgetId
      WHERE t.date BETWEEN ? AND ?
      GROUP BY b.id, b.name, b.amount
    `,

    FIND_ALL_WITH_RELATIONS: `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon,
             a.name as accountName, a.icon as accountIcon, a.type as accountType
      FROM transactions t
      LEFT JOIN categories c ON t.categoryId = c.id
      LEFT JOIN accounts a ON t.accountId = a.id
      ORDER BY t.date DESC
    `,

    FIND_BY_DATE_RANGE_WITH_RELATIONS: `
      SELECT t.*, c.name as categoryName, c.icon as categoryIcon,
             a.name as accountName, a.icon as accountIcon, a.type as accountType
      FROM transactions t
      LEFT JOIN categories c ON t.categoryId = c.id
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `,

    GET_SUMMARY_BY_ACCOUNT: `
      SELECT
        t.accountId,
        a.name as accountName,
        a.icon as accountIcon,
        a.type as accountType,
        COALESCE(SUM(t.amount), 0) as total,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.date BETWEEN ? AND ?
      GROUP BY t.accountId, a.name, a.icon, a.type
      ORDER BY total DESC
    `,

    GET_MONTHLY_SUMMARY: `
      SELECT
        strftime('%Y-%m', t.date) as month,
        t.type,
        COALESCE(SUM(t.amount), 0) as total
      FROM transactions t
      WHERE t.date BETWEEN ? AND ?
      GROUP BY strftime('%Y-%m', t.date), t.type
      ORDER BY month
    `,

    generateUpdateQuery: (fields: string[]): string => {
      const setClause = fields.map(field => {
        const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbField} = ?`;
      }).join(', ');
      
      return `UPDATE transactions SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    }
} as const; 

