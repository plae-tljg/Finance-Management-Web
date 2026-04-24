import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { type Database } from 'sql.js';
import DatabaseService from '../services/database/DatabaseService';
import { initializeDatabaseFull, checkIsDatabaseInitialized } from '../services/database/services';

interface DatabaseState {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  database: Database | null;
  isInitialized: boolean;
}

interface DatabaseContextValue extends DatabaseState {
  dbService: DatabaseService | null;
  resetDatabase: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DatabaseState>({
    isReady: false,
    isLoading: false,
    error: null,
    database: null,
    isInitialized: false,
  });

  const dbServiceRef = useRef<DatabaseService | null>(null);
  const isInitializingRef = useRef(false);

  const createTables = useCallback(async (db: Database): Promise<void> => {
    if (!db) return;
    await initializeDatabaseFull(db);
  }, []);

  const isDatabaseInitialized = useCallback((db: Database): boolean => {
    return checkIsDatabaseInitialized(db);
  }, []);

  const initializeDatabaseService = useCallback(async (): Promise<void> => {
    if (isInitializingRef.current || state.isReady) return;

    try {
      isInitializingRef.current = true;
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const dbService = DatabaseService.getInstance();
      dbServiceRef.current = dbService;

      await dbService.initialize(async (db: Database) => {
        if (isDatabaseInitialized(db)) {
          console.log('Database already initialized, skipping...');
          return;
        }
        await createTables(db);
      });

      const database = dbService.getDatabase();
      const isInitialized = dbService.isDatabaseInitialized();

      if (database) {
        setState({
          isReady: true,
          isLoading: false,
          error: null,
          database,
          isInitialized,
        });
      } else {
        throw new Error('Failed to get database instance');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isReady: false,
      }));
    } finally {
      isInitializingRef.current = false;
    }
  }, [state.isReady, createTables, isDatabaseInitialized]);

  const resetDatabase = useCallback(async (): Promise<void> => {
    if (!dbServiceRef.current) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await dbServiceRef.current.resetDatabase();
      await initializeDatabaseService();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [initializeDatabaseService]);

  useEffect(() => {
    initializeDatabaseService();
  }, [initializeDatabaseService]);

  const value: DatabaseContextValue = {
    ...state,
    dbService: dbServiceRef.current,
    resetDatabase,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

export function useDatabaseService() {
  const { dbService, isReady, isLoading, error } = useDatabase();
  return { dbService, isReady, isLoading, error };
}
