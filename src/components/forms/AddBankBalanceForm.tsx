import React, { useState } from 'react';
import DatabaseService from '../../services/database/DatabaseService';
import { BankBalanceRepository } from '../../services/database/repositories/BankBalanceRepository';
import type { BankBalance } from '../../services/database/schemas/BankBalance';
import './FormStyles.css';

interface AddBankBalanceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AddBankBalanceForm: React.FC<AddBankBalanceFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Omit<BankBalance, 'id' | 'createdAt' | 'updatedAt'>>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    openingBalance: 0,
    closingBalance: 0
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

      const bankBalanceRepo = new BankBalanceRepository(dbService);
      await bankBalanceRepo.create(formData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // 重置表单
      const now = new Date();
      setFormData({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        openingBalance: 0,
        closingBalance: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h3>添加银行余额</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label>年份 *</label>
        <input
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
          min="2000"
          max="2100"
          required
        />
      </div>

      <div className="form-group">
        <label>月份 *</label>
        <input
          type="number"
          value={formData.month}
          onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || 1 })}
          min="1"
          max="12"
          required
        />
      </div>

      <div className="form-group">
        <label>期初余额 *</label>
        <input
          type="number"
          step="0.01"
          value={formData.openingBalance}
          onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>

      <div className="form-group">
        <label>期末余额 *</label>
        <input
          type="number"
          step="0.01"
          value={formData.closingBalance}
          onChange={(e) => setFormData({ ...formData, closingBalance: parseFloat(e.target.value) || 0 })}
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

