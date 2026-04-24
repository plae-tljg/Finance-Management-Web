import { Button } from '../ui/Button';

interface HeaderProps {
  onRefresh: () => void;
  onTest: () => void;
  onExportAll: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export function Header({ onRefresh, onTest, onExportAll, onReset, isLoading }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Finance Manager</span>
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onRefresh} isLoading={isLoading}>
            🔄 Refresh
          </Button>
          <Button variant="secondary" onClick={onTest} isLoading={isLoading}>
            🧪 Test
          </Button>
          <Button variant="primary" onClick={onExportAll} isLoading={isLoading}>
            📤 Export All
          </Button>
          <Button variant="danger" onClick={onReset} isLoading={isLoading}>
            🗑️ Reset DB
          </Button>
        </div>
      </div>
    </header>
  );
}
