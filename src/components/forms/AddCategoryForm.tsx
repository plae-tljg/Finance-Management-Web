import React, { useState } from 'react';
import DatabaseService from '../../services/database/DatabaseService';
import { CategoryRepository } from '../../services/database/repositories/CategoryRepository';
import type { Category } from '../../services/database/schemas/Category';
import './FormStyles.css';

interface AddCategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    icon: '',
    type: 'expense',
    sortOrder: 0,
    isDefault: false,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const categoryRepo = new CategoryRepository(dbService);
      await categoryRepo.create(formData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // 重置表单
      setFormData({
        name: '',
        icon: '',
        type: 'expense',
        sortOrder: 0,
        isDefault: false,
        isActive: true
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>添加分类</h3>
      
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
        <label>图标 *</label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="例如: 🍚"
          required
        />
      </div>

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
        <label>排序顺序</label>
        <input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          />
          默认分类
        </label>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          激活
        </label>
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

