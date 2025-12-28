import React, { useState, useEffect } from 'react';
import { useDatabaseSetup } from '../../hooks/useDatabaseSetup';
import './DatabaseDebugger.css';

interface DatabaseInfo {
  isInitialized: boolean;
  version: string;
  tables: string[];
  categories: any[];
  budgets: any[];
  transactions: any[];
  bankBalances: any[];
}

const DatabaseDebugger: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo>({
    isInitialized: false,
    version: '',
    tables: [],
    categories: [],
    budgets: [],
    transactions: [],
    bankBalances: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 使用 hook 获取数据库功能
  const { 
    isReady, 
    error: dbError, 
    database, 
    isInitialized, 
    dbService,
    resetDatabase 
  } = useDatabaseSetup();

  useEffect(() => {
    if (isReady && dbService) {
      loadDatabaseInfo();
    }
  }, [isReady, dbService]);

  const loadDatabaseInfo = async () => {
    if (!dbService) return;
    
    try {
      setIsLoading(true);
      
      // 检查数据库是否已初始化
      const isInitialized = dbService.isDatabaseInitialized();
      
      // 获取数据库信息
      const version = dbService.getDatabaseVersion();
      const tables = ['categories', 'budgets', 'transactions', 'bank_balances'];
      
      // 查询各表数据
      const categories = await dbService.executeQuery('SELECT * FROM categories');
      const budgets = await dbService.executeQuery('SELECT * FROM budgets');
      const transactions = await dbService.executeQuery('SELECT * FROM transactions');
      const bankBalances = await dbService.executeQuery('SELECT * FROM bank_balances');

      setDbInfo({
        isInitialized,
        version,
        tables,
        categories: categories.rows._array,
        budgets: budgets.rows._array,
        transactions: transactions.rows._array,
        bankBalances: bankBalances.rows._array
      });

      addLog('✅ 数据库信息加载完成');
    } catch (error) {
      addLog(`❌ 加载数据库信息失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleRefresh = () => {
    if (dbService) {
      loadDatabaseInfo();
      addLog('🔄 刷新数据库信息');
    }
  };

  const handleTestDatabase = async () => {
    try {
      setIsLoading(true);
      addLog('🧪 开始运行数据库测试...');
      
      // 运行数据库功能测试
      if (dbService) {
        const db = dbService.getDatabase();
        if (db) {
          addLog('✅ 数据库功能测试完成');
          await loadDatabaseInfo();
        }
      }
      
      addLog('✅ 数据库测试完成');
    } catch (error) {
      addLog(`❌ 数据库测试失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!dbService) return;
    
    if (window.confirm('确定要重置数据库吗？这将删除所有数据！')) {
      try {
        setIsLoading(true);
        addLog('🔄 开始重置数据库...');
        
        await resetDatabase();
        await loadDatabaseInfo();
        
        addLog('✅ 数据库重置完成');
      } catch (error) {
        addLog(`❌ 数据库重置失败: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExportData = (tableName: string, data: any[]) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`📤 导出 ${tableName} 数据完成`);
  };

  return (
    <div className="database-debugger">
      <header className="debugger-header">
        <h1>🔍 数据库调试器</h1>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : '🔄 刷新'}
          </button>
          <button 
            onClick={handleTestDatabase} 
            className="btn btn-primary"
            disabled={isLoading}
          >
            🧪 运行测试
          </button>
          <button 
            onClick={handleResetDatabase} 
            className="btn btn-danger"
            disabled={isLoading}
          >
            🗑️ 重置数据库
          </button>
        </div>
      </header>

      <main className="debugger-main">
        {/* 错误状态 */}
        {dbError && (
          <section className="error-section">
            <div className="error-message">
              <h2>❌ 数据库错误</h2>
              <p>{dbError}</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                🔄 重新加载
              </button>
            </div>
          </section>
        )}
        
        {/* 数据库状态 */}
        <section className="database-status">
          <h2>📊 数据库状态</h2>
          <div className="status-grid">
            <div className="status-card">
              <h3>Hook 状态</h3>
              <p className={isReady ? 'status-success' : 'status-warning'}>
                {isReady ? '✅ 就绪' : '⏳ 加载中...'}
              </p>
            </div>
            <div className="status-card">
              <h3>数据库连接</h3>
              <p className={database ? 'status-success' : 'status-error'}>
                {database ? '✅ 已连接' : '❌ 未连接'}
              </p>
            </div>
            <div className="status-card">
              <h3>初始化状态</h3>
              <p className={isInitialized ? 'status-success' : 'status-error'}>
                {isInitialized ? '✅ 已初始化' : '❌ 未初始化'}
              </p>
            </div>
            <div className="status-card">
              <h3>数据库版本</h3>
              <p>{dbInfo.version || '未知'}</p>
            </div>
            <div className="status-card">
              <h3>表数量</h3>
              <p>{dbInfo.tables.length}</p>
            </div>
          </div>
        </section>

        {/* 数据概览 */}
        <section className="data-overview">
          <h2>📈 数据概览</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>分类</h3>
              <p className="count">{dbInfo.categories.length}</p>
              <button 
                onClick={() => handleExportData('categories', dbInfo.categories)}
                className="btn-export"
              >
                📤 导出
              </button>
            </div>
            <div className="overview-card">
              <h3>预算</h3>
              <p className="count">{dbInfo.budgets.length}</p>
              <button 
                onClick={() => handleExportData('budgets', dbInfo.budgets)}
                className="btn-export"
              >
                📤 导出
              </button>
            </div>
            <div className="overview-card">
              <h3>交易</h3>
              <p className="count">{dbInfo.transactions.length}</p>
              <button 
                onClick={() => handleExportData('transactions', dbInfo.transactions)}
                className="btn-export"
              >
                📤 导出
              </button>
            </div>
            <div className="overview-card">
              <h3>银行余额</h3>
              <p className="count">{dbInfo.bankBalances.length}</p>
              <button 
                onClick={() => handleExportData('bank_balances', dbInfo.bankBalances)}
                className="btn-export"
              >
                📤 导出
              </button>
            </div>
          </div>
        </section>

        {/* 详细数据 */}
        <section className="detailed-data">
          <h2>📋 详细数据</h2>
          
          {/* 分类数据 */}
          <div className="data-section">
            <h3>📂 分类数据</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>名称</th>
                    <th>图标</th>
                    <th>类型</th>
                    <th>排序</th>
                    <th>默认</th>
                    <th>激活</th>
                  </tr>
                </thead>
                <tbody>
                  {dbInfo.categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.icon}</td>
                      <td className={`type-${category.type}`}>
                        {category.type === 'income' ? '收入' : '支出'}
                      </td>
                      <td>{category.sortOrder}</td>
                      <td>{category.isDefault ? '✅' : '❌'}</td>
                      <td>{category.isActive ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 预算数据 */}
          <div className="data-section">
            <h3>💰 预算数据</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>名称</th>
                    <th>分类ID</th>
                    <th>金额</th>
                    <th>周期</th>
                    <th>月份</th>
                  </tr>
                </thead>
                <tbody>
                  {dbInfo.budgets.map(budget => (
                    <tr key={budget.id}>
                      <td>{budget.id}</td>
                      <td>{budget.name}</td>
                      <td>{budget.categoryId}</td>
                      <td>¥{budget.amount}</td>
                      <td>{budget.period}</td>
                      <td>{budget.month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 交易数据 */}
          <div className="data-section">
            <h3>💳 交易数据</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>金额</th>
                    <th>分类ID</th>
                    <th>预算ID</th>
                    <th>描述</th>
                    <th>日期</th>
                    <th>类型</th>
                  </tr>
                </thead>
                <tbody>
                  {dbInfo.transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td className={`amount-${transaction.type}`}>
                        ¥{transaction.amount}
                      </td>
                      <td>{transaction.categoryId}</td>
                      <td>{transaction.budgetId}</td>
                      <td>{transaction.description || '-'}</td>
                      <td>{transaction.date}</td>
                      <td className={`type-${transaction.type}`}>
                        {transaction.type === 'income' ? '收入' : '支出'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 银行余额数据 */}
          <div className="data-section">
            <h3>🏦 银行余额数据</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>年份</th>
                    <th>月份</th>
                    <th>期初余额</th>
                    <th>期末余额</th>
                  </tr>
                </thead>
                <tbody>
                  {dbInfo.bankBalances.map(balance => (
                    <tr key={balance.id}>
                      <td>{balance.id}</td>
                      <td>{balance.year}</td>
                      <td>{balance.month}</td>
                      <td>¥{balance.openingBalance}</td>
                      <td>¥{balance.closingBalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 操作日志 */}
        <section className="operation-logs">
          <h2>📝 操作日志</h2>
          <div className="logs-container">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setLogs([])} 
            className="btn btn-secondary"
          >
            🗑️ 清空日志
          </button>
        </section>
      </main>
    </div>
  );
};

export default DatabaseDebugger;
