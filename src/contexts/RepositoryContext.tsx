import { createContext, useContext, useMemo } from 'react';
import { useDatabase } from './DatabaseContext';
import { CategoryRepository } from '../services/database/repositories/CategoryRepository';
import { BudgetRepository } from '../services/database/repositories/BudgetRepository';
import { TransactionRepository } from '../services/database/repositories/TransactionRepository';
import { AccountRepository } from '../services/database/repositories/AccountRepository';
import { AccountBalanceRepository } from '../services/database/repositories/AccountBalanceRepository';
import type { Category } from '../services/database/schemas/Category';
import type { Budget } from '../services/database/schemas/Budget';
import type { Transaction } from '../services/database/schemas/Transaction';
import type { Account } from '../services/database/schemas/Account';
import type { AccountBalance } from '../services/database/schemas/AccountBalance';

interface Repositories {
    categoryRepo: CategoryRepository | null;
    budgetRepo: BudgetRepository | null;
    transactionRepo: TransactionRepository | null;
    accountRepo: AccountRepository | null;
    accountBalanceRepo: AccountBalanceRepository | null;
}

interface RepositoryContextValue extends Repositories {
    isReady: boolean;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export function RepositoryProvider({ children }: { children: React.ReactNode }) {
    const { dbService, isReady } = useDatabase();

    const repositories = useMemo<Repositories>(() => {
        if (!dbService) {
            return {
                categoryRepo: null,
                budgetRepo: null,
                transactionRepo: null,
                accountRepo: null,
                accountBalanceRepo: null,
            };
        }

        return {
            categoryRepo: new CategoryRepository(dbService),
            budgetRepo: new BudgetRepository(dbService),
            transactionRepo: new TransactionRepository(dbService),
            accountRepo: new AccountRepository(dbService),
            accountBalanceRepo: new AccountBalanceRepository(dbService),
        };
    }, [dbService]);

    const value = useMemo(() => ({
        ...repositories,
        isReady,
    }), [repositories, isReady]);

    return (
        <RepositoryContext.Provider value={value}>
            {children}
        </RepositoryContext.Provider>
    );
}

export function useRepositories() {
    const context = useContext(RepositoryContext);
    if (!context) {
        throw new Error('useRepositories must be used within a RepositoryProvider');
    }
    return context;
}

export function useCategoryRepository(): CategoryRepository | null {
    const { categoryRepo, isReady } = useRepositories();
    if (!isReady || !categoryRepo) {
        return null;
    }
    return categoryRepo;
}

export function useBudgetRepository(): BudgetRepository | null {
    const { budgetRepo, isReady } = useRepositories();
    if (!isReady || !budgetRepo) {
        return null;
    }
    return budgetRepo;
}

export function useTransactionRepository(): TransactionRepository | null {
    const { transactionRepo, isReady } = useRepositories();
    if (!isReady || !transactionRepo) {
        return null;
    }
    return transactionRepo;
}

export function useAccountRepository(): AccountRepository | null {
    const { accountRepo, isReady } = useRepositories();
    if (!isReady || !accountRepo) {
        return null;
    }
    return accountRepo;
}

export function useAccountBalanceRepository(): AccountBalanceRepository | null {
    const { accountBalanceRepo, isReady } = useRepositories();
    if (!isReady || !accountBalanceRepo) {
        return null;
    }
    return accountBalanceRepo;
}

export type { Category, Budget, Transaction, Account, AccountBalance };