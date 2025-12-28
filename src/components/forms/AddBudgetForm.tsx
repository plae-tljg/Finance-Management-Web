import React, { useState, useEffect } from 'react';
import DatabaseService from '../../services/database/DatabaseService';
import { BudgetRepository } from '../../services/database/repositories/BudgetRepository';
import { CategoryRepository } from '../../services/database/repositories/CategoryRepository';
import type { Budget } from '../../services/database/schemas/Budget';
import type { Category } from '../../services/database/schemas/Category';
import './FormStyles.css';

interface AddBudgetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddBudgetForm: React.FC<AddBudgetFormProps> = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    categoryId: 0,
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    month: new Date().toISOString().slice(0, 7),
    isRegular: false,
    isBudgetExceeded: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const budgetRepo = new BudgetRepository(dbService);
      await budgetRepo.create(formData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // 重置表单
      const now = new Date();
      setFormData({
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : 0,
        amount: 0,
        period: 'monthly',
        startDate: now.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        month: now.toISOString().slice(0, 7),
        isRegular: false,
        isBudgetExceeded: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>添加预算</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>名称 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
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
        <label>周期 *</label>
        <select
          value={formData.period}
          onChange={(e) => setFormData({ ...formData, period: e.target.value as Budget['period'] })}
          required
        >
          <option value="daily">每日</option>
          <option value="weekly">每周</option>
          <option value="monthly">每月</option>
          <option value="yearly">每年</option>
        </select>
      </div>

      <div className="form-group">
        <label>开始日期 *</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>结束日期 *</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>月份 *</label>
        <input
          type="month"
          value={formData.month}
          onChange={(e) => setFormData({ ...formData, month: e.target.value })}
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

