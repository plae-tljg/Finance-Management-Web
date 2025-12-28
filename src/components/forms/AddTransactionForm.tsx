import React, { useState, useEffect } from 'react';
import DatabaseService from '../../services/database/DatabaseService';
import { TransactionRepository } from '../../services/database/repositories/TransactionRepository';
import { CategoryRepository } from '../../services/database/repositories/CategoryRepository';
import { BudgetRepository } from '../../services/database/repositories/BudgetRepository';
import type { Transaction } from '../../services/database/schemas/Transaction';
import type { Category } from '../../services/database/schemas/Category';
import type { Budget } from '../../services/database/schemas/Budget';
import './FormStyles.css';

interface AddTransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>({
    amount: 0,
    categoryId: 0,
    budgetId: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.categoryId > 0) {
      const category = categories.find(c => c.id === formData.categoryId);
      if (category) {
        setFormData(prev => ({ ...prev, type: category.type }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.categoryId, categories]);

  const loadCategories = async () => {
    try {
      const dbService = DatabaseService.getInstance();
      const db = dbService.getDatabase();
      
      if (!db) return;

      const categoryRepo = new CategoryRepository(dbService);
      const cats = await categoryRepo.findAll();
      setCategories(cats);
      
      if (cats.length > 0 && formData.categoryId === 0) {
        setFormData({ ...formData, categoryId: cats[0].id });
      }
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  };

  const loadBudgets = async () => {
    try {
      const dbService = DatabaseService.getInstance();
      const db = dbService.getDatabase();
      
      if (!db) return;

      const budgetRepo = new BudgetRepository(dbService);
      const budgetsData = await budgetRepo.findAll();
      setBudgets(budgetsData);
      
      if (budgetsData.length > 0 && formData.budgetId === 0) {
        setFormData({ ...formData, budgetId: budgetsData[0].id });
      }
    } catch (err) {
      console.error('加载预算失败:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const dbService = DatabaseService.getInstance();
      const db = dbService.getDatabase();
      
      if (!db) {
        throw new Error('数据库未初始化');
      }

      if (formData.categoryId === 0) {
        throw new Error('请选择分类');
      }

      if (formData.budgetId === 0) {
        throw new Error('请选择预算');
      }

      const transactionRepo = new TransactionRepository(dbService);
      await transactionRepo.create(formData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // 重置表单
      setFormData({
        amount: 0,
        categoryId: categories.length > 0 ? categories[0].id : 0,
        budgetId: budgets.length > 0 ? budgets[0].id : 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>添加交易</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>类型 *</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
          required
        >
          <option value="expense">支出</option>
          <option value="income">收入</option>
        </select>
      </div>

      <div className="form-group">
        <label>金额 *</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>

      <div className="form-group">
        <label>分类 *</label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
          required
        >
          <option value="0">请选择分类</option>
          {categories
            .filter(cat => cat.type === formData.type)
            .map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
        </select>
      </div>

      <div className="form-group">
        <label>预算 *</label>
        <select
          value={formData.budgetId}
          onChange={(e) => setFormData({ ...formData, budgetId: parseInt(e.target.value) })}
          required
        >
          <option value="0">请选择预算</option>
          {budgets.map(budget => (
            <option key={budget.id} value={budget.id}>
              {budget.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>描述</label>
        <input
          type="text"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
        />
      </div>

      <div className="form-group">
        <label>日期 *</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? '添加中...' : '添加'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            取消
          </button>
        )}
      </div>
    </form>
  );
};

