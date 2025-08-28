export interface BankBalance {
    id: number;
    year: number;
    month: number;
    openingBalance: number;
    closingBalance: number;
    createdAt: string;
    updatedAt: string;
};

export const SAMPLE_BANK_BALANCES: Omit<BankBalance, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        year: 2025,
        month: 7,
        openingBalance: 1000,
        closingBalance: 1000
    },
    {
        year: 2025,
        month: 8,
        openingBalance: 1000,
        closingBalance: 1200
    },
];

export const BankBalanceFields = {
  UPDATABLE: ['year', 'month', 'openingBalance', 'closingBalance'] as const,
} as const;

export type UpdatableFields = typeof BankBalanceFields.UPDATABLE[number];  // 'year' | 'month' | 'openingBalance' | 'closingBalance'

export const BANK_BALANCE_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_bank_balances_year_month ON bank_balances(year, month)',
]

export const BankBalanceQueries = {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS bank_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        openingBalance DECIMAL(10,2) NOT NULL,
        closingBalance DECIMAL(10,2) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, month)
      )
    `,
  
    INSERT: `
      INSERT INTO bank_balances (year, month, openingBalance, closingBalance) 
      VALUES (?, ?, ?, ?)
    `,
  
    UPDATE: `
      UPDATE bank_balances 
      SET openingBalance = COALESCE(?, openingBalance),
          closingBalance = COALESCE(?, closingBalance),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
  
    FIND_BY_ID: `
      SELECT * FROM bank_balances 
      WHERE id = ?
    `,
  
    DELETE: `
      DELETE FROM bank_balances 
      WHERE id = ?
    `,
  
    COUNT_ALL: `
      SELECT COUNT(*) as count 
      FROM bank_balances
    `,
  
    FIND_BY_YEAR_MONTH: `
      SELECT * FROM bank_balances 
      WHERE year = ? AND month = ?
    `,
  
    FIND_ALL: `
      SELECT * FROM bank_balances 
      ORDER BY year DESC, month DESC
    `,
  
    FIND_BY_YEAR: `
      SELECT * FROM bank_balances 
      WHERE year = ?
      ORDER BY month ASC
    `,
}; 