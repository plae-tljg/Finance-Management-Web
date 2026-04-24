export interface Account {
    id: number;
    name: string;
    type: 'bank' | 'cash' | 'digital' | 'credit';
    currency: string;
    icon: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AccountCreateInput = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;

export const DEFAULT_ACCOUNTS: AccountCreateInput[] = [
    {
        name: '建设银行',
        type: 'bank',
        currency: 'CNY',
        icon: '🏦',
        isActive: true,
    },
    {
        name: '工商银行',
        type: 'bank',
        currency: 'CNY',
        icon: '🏦',
        isActive: true,
    },
    {
        name: '现金',
        type: 'cash',
        currency: 'CNY',
        icon: '💵',
        isActive: true,
    },
    {
        name: '支付宝',
        type: 'digital',
        currency: 'CNY',
        icon: '💳',
        isActive: true,
    },
    {
        name: '微信钱包',
        type: 'digital',
        currency: 'CNY',
        icon: '💬',
        isActive: true,
    },
    {
        name: '信用卡',
        type: 'credit',
        currency: 'CNY',
        icon: '💳',
        isActive: true,
    },
];

export const AccountFields = {
    UPDATABLE: ['name', 'type', 'currency', 'icon', 'isActive'] as const,
    REQUIRED: ['name', 'type', 'currency', 'icon'] as const,
    OPTIONAL: ['isActive'] as const,
} as const;

export type UpdatableFields = typeof AccountFields.UPDATABLE[number];
export type RequiredFields = typeof AccountFields.REQUIRED[number];

export const ACCOUNT_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type)',
    'CREATE INDEX IF NOT EXISTS idx_accounts_isActive ON accounts(isActive)',
];

export const AccountQueries = {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('bank', 'cash', 'digital', 'credit')),
        currency TEXT NOT NULL DEFAULT 'CNY',
        icon TEXT NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,

    INSERT: `
      INSERT INTO accounts (name, type, currency, icon, isActive)
      VALUES (?, ?, ?, ?, ?)
    `,

    UPDATE: `
      UPDATE accounts
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          currency = COALESCE(?, currency),
          icon = COALESCE(?, icon),
          isActive = COALESCE(?, isActive),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,

    DELETE: 'DELETE FROM accounts WHERE id = ?',

    FIND_BY_ID: 'SELECT * FROM accounts WHERE id = ?',

    FIND_ALL: 'SELECT * FROM accounts ORDER BY type, name',

    FIND_ACTIVE: 'SELECT * FROM accounts WHERE isActive = 1 ORDER BY type, name',

    COUNT_ALL: 'SELECT COUNT(*) as count FROM accounts',

    generateUpdateQuery: (fields: string[]): string => {
        const setClause = fields.map(field => {
            const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            return `${dbField} = ?`;
        }).join(', ');

        return `UPDATE accounts SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    }
} as const;