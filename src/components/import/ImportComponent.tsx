import React, { useRef } from 'react';
import { importService, type ImportResult } from '../../services/import';
import './ImportComponent.css';

interface ImportComponentProps {
  onImportComplete?: (result: ImportResult) => void;
}

export const ImportComponent: React.FC<ImportComponentProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  console.log('[ImportComponent] Rendering, isImporting:', isImporting);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[ImportComponent] No file selected');
      return;
    }

    console.log('[ImportComponent] File selected:', file.name);
    setIsImporting(true);
    setResult(null);

    try {
      console.log('[ImportComponent] Calling importService.importFromFile...');
      const importResult = await importService.importFromFile(file);
      console.log('[ImportComponent] Import result:', importResult);
      setResult(importResult);

      if (onImportComplete) {
        console.log('[ImportComponent] Calling onImportComplete callback');
        onImportComplete(importResult);
      }
    } catch (error) {
      console.error('[ImportComponent] Import failed:', error);
      setResult({
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: { categories: 0, budgets: 0, transactions: 0, accounts: 0, accountBalances: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    console.log('[ImportComponent] Import button clicked');
    fileInputRef.current?.click();
  };

  return (
    <div className="import-component">
      <button
        onClick={handleImportClick}
        disabled={isImporting}
        className="btn btn-primary"
      >
        {isImporting ? 'Importing...' : '📥 Import Data'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {result && (
        <div className={`import-result ${result.success ? 'success' : 'error'}`}>
          <div className="result-message">{result.message}</div>
          {result.imported.categories > 0 && (
            <div>Categories: {result.imported.categories}</div>
          )}
          {result.imported.accounts > 0 && (
            <div>Accounts: {result.imported.accounts}</div>
          )}
          {result.imported.accountBalances > 0 && (
            <div>Account Balances: {result.imported.accountBalances}</div>
          )}
          {result.imported.budgets > 0 && (
            <div>Budgets: {result.imported.budgets}</div>
          )}
          {result.imported.transactions > 0 && (
            <div>Transactions: {result.imported.transactions}</div>
          )}
          {result.errors.length > 0 && (
            <div className="import-errors">
              <strong>Errors:</strong>
              <ul>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};