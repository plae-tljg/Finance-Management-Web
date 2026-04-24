import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { AppState, AppAction } from '../types/app';
import { appReducer, initialState } from '../types/app';
import { useDatabase } from './DatabaseContext';
import { useRepositories } from './RepositoryContext';

interface AppStateContextValue {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    actions: {
        loadAllData: () => Promise<void>;
        addLog: (message: string) => void;
        clearLogs: () => void;
    };
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { dbService, isReady } = useDatabase();
    const { categoryRepo, budgetRepo, transactionRepo, accountRepo, accountBalanceRepo, isReady: reposReady } = useRepositories();

    const addLog = useCallback((message: string) => {
        dispatch({ type: 'ADD_LOG', payload: message });
    }, []);

    const clearLogs = useCallback(() => {
        dispatch({ type: 'CLEAR_LOGS' });
    }, []);

    const loadAllData = useCallback(async () => {
        if (!dbService || !isReady || !reposReady) return;
        if (!categoryRepo || !budgetRepo || !transactionRepo || !accountRepo || !accountBalanceRepo) return;

        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const [categories, budgets, transactions, accounts, accountBalances] = await Promise.all([
                categoryRepo.findAll(),
                budgetRepo.findAll(),
                transactionRepo.findAll(),
                accountRepo.findAll(),
                accountBalanceRepo.findAll(),
            ]);

            dispatch({
                type: 'LOAD_ALL_DATA',
                payload: { categories, budgets, transactions, accounts, accountBalances },
            });

            addLog('Data loaded successfully');
        } catch (error) {
            addLog(`Failed to load data: ${error}`);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [dbService, isReady, reposReady, categoryRepo, budgetRepo, transactionRepo, accountRepo, accountBalanceRepo, addLog]);

    useEffect(() => {
        if (isReady && dbService && reposReady) {
            loadAllData();
        }
    }, [isReady, dbService, reposReady, loadAllData]);

    const value: AppStateContextValue = {
        state,
        dispatch,
        actions: {
            loadAllData,
            addLog,
            clearLogs,
        },
    };

    return (
        <AppStateContext.Provider value={value}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('useAppState must be used within an AppStateProvider');
    }
    return context;
}

export function useAppDispatch() {
    const { dispatch } = useAppState();
    return dispatch;
}