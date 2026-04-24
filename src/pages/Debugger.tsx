import { useState, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { importService, type ImportResult } from '../services/import/ImportService';

export default function Debugger() {
    const { state, actions } = useAppState();
    const { categories, budgets, transactions, accounts, accountBalances } = state;

    const [activeTable, setActiveTable] = useState<string>('categories');
    const [importStatus, setImportStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    console.log('[Debugger] Rendering, data counts:', {
        categories: categories.length,
        accounts: accounts.length,
        accountBalances: accountBalances.length,
        budgets: budgets.length,
        transactions: transactions.length
    });

    const exportTable = (tableName: string, data: unknown[]) => {
        console.log(`[Debugger] Exporting table: ${tableName}, records: ${data.length}`);
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log(`[Debugger] Export complete: ${tableName}`);
    };

    const exportAll = () => {
        console.log('[Debugger] Export all tables started');
        const allData = {
            categories,
            accounts,
            accountBalances,
            budgets,
            transactions,
            exportedAt: new Date().toISOString()
        };
        console.log('[Debugger] Export all data prepared:', Object.keys(allData));
        const jsonData = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-all-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('[Debugger] Export all complete');
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.log('[Debugger] No file selected for import');
            return;
        }

        console.log('[Debugger] Import file selected:', file.name);
        setImportStatus('Importing...');

        try {
            console.log('[Debugger] Import file selected:', file.name);
            setImportStatus('Clearing existing data...');

            const result: ImportResult = await importService.importFromFile(file);
            console.log('[Debugger] Import result:', result);

            if (result.success) {
                setImportStatus(`Import complete: ${result.imported.categories} categories, ${result.imported.accounts} accounts, ${result.imported.accountBalances} balances, ${result.imported.budgets} budgets, ${result.imported.transactions} transactions. Refreshing state...`);
                await actions.loadAllData();
                setImportStatus(`Import complete: ${result.imported.categories} categories, ${result.imported.accounts} accounts, ${result.imported.accountBalances} balances, ${result.imported.budgets} budgets, ${result.imported.transactions} transactions. Done!`);
            } else {
                setImportStatus(`Import failed: ${result.message}. ${result.errors.length} errors.`);
            }
        } catch (err) {
            console.error('[Debugger] Import error:', err);
            setImportStatus(`Import error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const tableConfigs = [
        { key: 'categories', label: 'Categories', data: categories, count: categories.length },
        { key: 'accounts', label: 'Accounts', data: accounts, count: accounts.length },
        { key: 'account_balances', label: 'Account Balances', data: accountBalances, count: accountBalances.length },
        { key: 'budgets', label: 'Budgets', data: budgets, count: budgets.length },
        { key: 'transactions', label: 'Transactions', data: transactions, count: transactions.length },
    ];

    const activeConfig = tableConfigs.find(t => t.key === activeTable) || tableConfigs[0];

    const renderTable = () => {
        const data = activeConfig.data as unknown[];
        if (data.length === 0) {
            return <div className="p-8 text-center text-gray-500">No data in this table</div>;
        }

        const columns = Object.keys(data[0] as Record<string, unknown>);

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col} className="px-4 py-3 text-left text-sm font-semibold text-gray-600 capitalize">
                                    {col.replace(/([A-Z])/g, '_$1').replace(/^_/, '')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col} className="px-4 py-3 text-sm">
                                        {String((row as Record<string, unknown>)[col] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Database Debugger</h2>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => exportTable(activeTable, activeConfig.data)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Export {activeConfig.label}
                    </button>
                    <button
                        onClick={exportAll}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Export All
                    </button>
                    <label className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer">
                        Import All
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {importStatus && (
                <div className="bg-orange-100 border border-orange-400 text-orange-800 px-4 py-3 rounded">
                    {importStatus}
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex flex-wrap gap-2">
                    {tableConfigs.map(table => (
                        <button
                            key={table.key}
                            onClick={() => setActiveTable(table.key)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTable === table.key
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {table.label} ({table.count})
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">{activeConfig.label}</h3>
                    <span className="text-sm text-gray-500">{activeConfig.count} records</span>
                </div>
                {renderTable()}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Database Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {tableConfigs.map(table => (
                        <div key={table.key} className="border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{table.count}</div>
                            <div className="text-sm text-gray-500">{table.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}