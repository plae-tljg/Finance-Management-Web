export interface AccountBalance {
    id: number;
    accountId: number;
    year: number;
    month: number;
    openingBalance: number;
    closingBalance: number;
    createdAt: string;
    updatedAt: string;
};

export const SAMPLE_ACCOUNT_BALANCES: Omit<AccountBalance, 'id' | 'createdAt' | 'updatedAt'>[] = [
    { accountId: 1, year: 2025, month: 1, openingBalance: 15000, closingBalance: 18500 },
    { accountId: 1, year: 2025, month: 2, openingBalance: 18500, closingBalance: 22000 },
    { accountId: 1, year: 2025, month: 3, openingBalance: 22000, closingBalance: 19800 },
    { accountId: 2, year: 2025, month: 1, openingBalance: 8000, closingBalance: 9200 },
    { accountId: 2, year: 2025, month: 2, openingBalance: 9200, closingBalance: 10500 },
    { accountId: 2, year: 2025, month: 3, openingBalance: 10500, closingBalance: 8800 },
    { accountId: 3, year: 2025, month: 1, openingBalance: 500, closingBalance: 320 },
    { accountId: 3, year: 2025, month: 2, openingBalance: 320, closingBalance: 150 },
    { accountId: 3, year: 2025, month: 3, openingBalance: 150, closingBalance: 450 },
    { accountId: 4, year: 2025, month: 1, openingBalance: 2000, closingBalance: 1850 },
    { accountId: 4, year: 2025, month: 2, openingBalance: 1850, closingBalance: 2100 },
    { accountId: 4, year: 2025, month: 3, openingBalance: 2100, closingBalance: 1600 },
    { accountId: 5, year: 2025, month: 1, openingBalance: 3000, closingBalance: 2800 },
    { accountId: 5, year: 2025, month: 2, openingBalance: 2800, closingBalance: 3100 },
    { accountId: 5, year: 2025, month: 3, openingBalance: 3100, closingBalance: 2500 },
    { accountId: 6, year: 2025, month: 1, openingBalance: -2000, closingBalance: -3500 },
    { accountId: 6, year: 2025, month: 2, openingBalance: -3500, closingBalance: -2800 },
    { accountId: 6, year: 2025, month: 3, openingBalance: -2800, closingBalance: -4200 },
];

export const AccountBalanceFields = {
    UPDATABLE: ['accountId', 'year', 'month', 'openingBalance', 'closingBalance'] as const,
} as const;

export type UpdatableFields = typeof AccountBalanceFields.UPDATABLE[number];

export const ACCOUNT_BALANCE_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_account_balances_account ON account_balances(accountId)',
    'CREATE INDEX IF NOT EXISTS idx_account_balances_year_month ON account_balances(year, month)',
    'CREATE INDEX IF NOT EXISTS idx_account_balances_account_year_month ON account_balances(accountId, year, month)',
];

export const AccountBalanceQueries = {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS account_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountId INTEGER NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        openingBalance DECIMAL(10,2) NOT NULL,
        closingBalance DECIMAL(10,2) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(accountId, year, month),
        FOREIGN KEY (accountId) REFERENCES accounts(id)
      )
    `,

    INSERT: `
      INSERT INTO account_balances (accountId, year, month, openingBalance, closingBalance)
      VALUES (?, ?, ?, ?, ?)
    `,

    UPDATE: `
      UPDATE account_balances
      SET openingBalance = COALESCE(?, openingBalance),
          closingBalance = COALESCE(?, closingBalance),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,

    FIND_BY_ID: `
      SELECT * FROM account_balances
      WHERE id = ?
    `,

    DELETE: `
      DELETE FROM account_balances
      WHERE id = ?
    `,

    COUNT_ALL: `
      SELECT COUNT(*) as count
      FROM account_balances
    `,

    FIND_BY_ACCOUNT_YEAR_MONTH: `
      SELECT * FROM account_balances
      WHERE accountId = ? AND year = ? AND month = ?
    `,

    FIND_BY_ACCOUNT: `
      SELECT * FROM account_balances
      WHERE accountId = ?
      ORDER BY year DESC, month DESC
    `,

    FIND_ALL: `
      SELECT ab.*, a.name as accountName, a.icon as accountIcon, a.type as accountType
      FROM account_balances ab
      LEFT JOIN accounts a ON ab.accountId = a.id
      ORDER BY a.type, a.name, year DESC, month DESC
    `,

    FIND_BY_YEAR_MONTH: `
      SELECT ab.*, a.name as accountName, a.icon as accountIcon, a.type as accountType
      FROM account_balances ab
      LEFT JOIN accounts a ON ab.accountId = a.id
      WHERE ab.year = ? AND ab.month = ?
      ORDER BY a.type, a.name
    `,

    FIND_BY_YEAR: `
      SELECT ab.*, a.name as accountName, a.icon as accountIcon, a.type as accountType
      FROM account_balances ab
      LEFT JOIN accounts a ON ab.accountId = a.id
      WHERE ab.year = ?
      ORDER BY a.type, a.name, ab.month
    `,

    GET_LATEST_BY_ACCOUNT: `
      SELECT * FROM account_balances
      WHERE accountId = ?
      ORDER BY year DESC, month DESC
      LIMIT 1
    `,

    generateUpdateQuery: (fields: string[]): string => {
        const setClause = fields.map(field => {
            const dbField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            return `${dbField} = ?`;
        }).join(', ');

        return `UPDATE account_balances SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    }
} as const;

export type AccountBalanceCreateInput = Omit<AccountBalance, 'id' | 'createdAt' | 'updatedAt'>;