import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DatabaseProvider, RepositoryProvider, AppStateProvider } from './contexts';
import { ErrorBoundary } from './components/ui';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Debugger from './pages/Debugger';

function App() {
    return (
        <ErrorBoundary>
            <DatabaseProvider>
                <RepositoryProvider>
                    <AppStateProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="transactions" element={<Transactions />} />
                                    <Route path="budgets" element={<Budgets />} />
                                    <Route path="accounts" element={<Accounts />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="categories" element={<Categories />} />
                                    <Route path="debugger" element={<Debugger />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </AppStateProvider>
                </RepositoryProvider>
            </DatabaseProvider>
        </ErrorBoundary>
    );
}

export default App;