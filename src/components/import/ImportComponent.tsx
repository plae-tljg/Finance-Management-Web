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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setResult(null);

    try {
      const importResult = await importService.importFromFile(file);
      setResult(importResult);
      
      if (onImportComplete) {
        onImportComplete(importResult);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
        imported: { categories: 0, budgets: 0, transactions: 0, bankBalances: 0 },
        errors: [error instanceof Error ? error.message : '未知错误']
      });
    } finally {
      setIsImporting(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="import-component">
      <button
        onClick={handleImportClick}
        disabled={isImporting}
        className="btn btn-primary"
      >
        {isImporting ? '导入中...' : '📥 导入数据'}
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
            <div>分类: {result.imported.categories} 条</div>
          )}
          {result.imported.budgets > 0 && (
            <div>预算: {result.imported.budgets} 条</div>
          )}
          {result.imported.transactions > 0 && (
            <div>交易: {result.imported.transactions} 条</div>
          )}
          {result.imported.bankBalances > 0 && (
            <div>银行余额: {result.imported.bankBalances} 条</div>
          )}
          {result.errors.length > 0 && (
            <div className="import-errors">
              <strong>错误:</strong>
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

