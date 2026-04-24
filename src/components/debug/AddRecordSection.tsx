import { useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AddCategoryForm, AddBudgetForm, AddTransactionForm } from '../forms';

type RecordType = 'category' | 'budget' | 'transaction' | null;

interface AddRecordSectionProps {
  onSuccess: () => void;
}

const modalTitles: Record<string, string> = {
  category: 'Add Category',
  budget: 'Add Budget',
  transaction: 'Add Transaction',
};

export function AddRecordSection({ onSuccess }: AddRecordSectionProps) {
  const [showForm, setShowForm] = useState<RecordType>(null);

  const handleSuccess = () => {
    setShowForm(null);
    onSuccess();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">➕ Add Record</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => setShowForm('category')}>
          ➕ Category
        </Button>
        <Button variant="primary" onClick={() => setShowForm('budget')}>
          ➕ Budget
        </Button>
        <Button variant="primary" onClick={() => setShowForm('transaction')}>
          ➕ Transaction
        </Button>
      </div>

      <Modal
        isOpen={showForm === 'category'}
        onClose={() => setShowForm(null)}
        title={modalTitles.category}
      >
        <AddCategoryForm onSuccess={handleSuccess} onCancel={() => setShowForm(null)} />
      </Modal>

      <Modal
        isOpen={showForm === 'budget'}
        onClose={() => setShowForm(null)}
        title={modalTitles.budget}
      >
        <AddBudgetForm onSuccess={handleSuccess} onCancel={() => setShowForm(null)} />
      </Modal>

      <Modal
        isOpen={showForm === 'transaction'}
        onClose={() => setShowForm(null)}
        title={modalTitles.transaction}
      >
        <AddTransactionForm onSuccess={handleSuccess} onCancel={() => setShowForm(null)} />
      </Modal>
    </div>
  );
}