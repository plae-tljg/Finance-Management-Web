import type { Category } from '../services/database/schemas/Category';
import type { Budget } from '../services/database/schemas/Budget';
import type { Transaction } from '../services/database/schemas/Transaction';
import type { Account } from '../services/database/schemas/Account';
import type { AccountBalance } from '../services/database/schemas/AccountBalance';

export interface AppState {
    categories: Category[];
    budgets: Budget[];
    transactions: Transaction[];
    accounts: Account[];
    accountBalances: AccountBalance[];
    isLoading: boolean;
    selectedMonth: string;
    dbVersion: string;
    logs: string[];
}

export type AppAction =
    | { type: 'SET_CATEGORIES'; payload: Category[] }
    | { type: 'ADD_CATEGORY'; payload: Category }
    | { type: 'UPDATE_CATEGORY'; payload: Category }
    | { type: 'DELETE_CATEGORY'; payload: number }
    | { type: 'SET_BUDGETS'; payload: Budget[] }
    | { type: 'ADD_BUDGET'; payload: Budget }
    | { type: 'UPDATE_BUDGET'; payload: Budget }
    | { type: 'DELETE_BUDGET'; payload: number }
    | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
    | { type: 'DELETE_TRANSACTION'; payload: number }
    | { type: 'SET_ACCOUNTS'; payload: Account[] }
    | { type: 'ADD_ACCOUNT'; payload: Account }
    | { type: 'UPDATE_ACCOUNT'; payload: Account }
    | { type: 'DELETE_ACCOUNT'; payload: number }
    | { type: 'SET_ACCOUNT_BALANCES'; payload: AccountBalance[] }
    | { type: 'ADD_ACCOUNT_BALANCE'; payload: AccountBalance }
    | { type: 'UPDATE_ACCOUNT_BALANCE'; payload: AccountBalance }
    | { type: 'DELETE_ACCOUNT_BALANCE'; payload: number }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SELECTED_MONTH'; payload: string }
    | { type: 'SET_DB_VERSION'; payload: string }
    | { type: 'ADD_LOG'; payload: string }
    | { type: 'CLEAR_LOGS' }
    | { type: 'LOAD_ALL_DATA'; payload: {
        categories: Category[];
        budgets: Budget[];
        transactions: Transaction[];
        accounts: Account[];
        accountBalances: AccountBalance[];
    }};

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, action.payload] };
        case 'UPDATE_CATEGORY':
            return {
                ...state,
                categories: state.categories.map(c =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };
        case 'DELETE_CATEGORY':
            return {
                ...state,
                categories: state.categories.filter(c => c.id !== action.payload),
            };
        case 'SET_BUDGETS':
            return { ...state, budgets: action.payload };
        case 'ADD_BUDGET':
            return { ...state, budgets: [...state.budgets, action.payload] };
        case 'UPDATE_BUDGET':
            return {
                ...state,
                budgets: state.budgets.map(b =>
                    b.id === action.payload.id ? action.payload : b
                ),
            };
        case 'DELETE_BUDGET':
            return {
                ...state,
                budgets: state.budgets.filter(b => b.id !== action.payload),
            };
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.payload };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [action.payload, ...state.transactions] };
        case 'UPDATE_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.map(t =>
                    t.id === action.payload.id ? action.payload : t
                ),
            };
        case 'DELETE_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.filter(t => t.id !== action.payload),
            };
        case 'SET_ACCOUNTS':
            return { ...state, accounts: action.payload };
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [...state.accounts, action.payload] };
        case 'UPDATE_ACCOUNT':
            return {
                ...state,
                accounts: state.accounts.map(a =>
                    a.id === action.payload.id ? action.payload : a
                ),
            };
        case 'DELETE_ACCOUNT':
            return {
                ...state,
                accounts: state.accounts.filter(a => a.id !== action.payload),
            };
        case 'SET_ACCOUNT_BALANCES':
            return { ...state, accountBalances: action.payload };
        case 'ADD_ACCOUNT_BALANCE':
            return { ...state, accountBalances: [...state.accountBalances, action.payload] };
        case 'UPDATE_ACCOUNT_BALANCE':
            return {
                ...state,
                accountBalances: state.accountBalances.map(ab =>
                    ab.id === action.payload.id ? action.payload : ab
                ),
            };
        case 'DELETE_ACCOUNT_BALANCE':
            return {
                ...state,
                accountBalances: state.accountBalances.filter(ab => ab.id !== action.payload),
            };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_SELECTED_MONTH':
            return { ...state, selectedMonth: action.payload };
        case 'SET_DB_VERSION':
            return { ...state, dbVersion: action.payload };
        case 'ADD_LOG': {
            const timestamp = new Date().toLocaleTimeString();
            return { ...state, logs: [...state.logs, `[${timestamp}] ${action.payload}`] };
        }
        case 'CLEAR_LOGS':
            return { ...state, logs: [] };
        case 'LOAD_ALL_DATA':
            return {
                ...state,
                categories: action.payload.categories,
                budgets: action.payload.budgets,
                transactions: action.payload.transactions,
                accounts: action.payload.accounts,
                accountBalances: action.payload.accountBalances,
            };
        default:
            return state;
    }
}

export const initialState: AppState = {
    categories: [],
    budgets: [],
    transactions: [],
    accounts: [],
    accountBalances: [],
    isLoading: false,
    selectedMonth: new Date().toISOString().slice(0, 7),
    dbVersion: '1.0.0',
    logs: [],
};