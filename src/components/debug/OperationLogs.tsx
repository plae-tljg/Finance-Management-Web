import { useRef, useEffect } from 'react';
import { Button } from '../ui/Button';

interface OperationLogsProps {
  logs: string[];
  onClear: () => void;
}

export function OperationLogs({ logs, onClear }: OperationLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📝 Operation Logs</h3>
        <Button size="sm" variant="ghost" onClick={onClear}>
          🗑️ Clear
        </Button>
      </div>
      <div className="p-4 h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No logs yet</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-gray-700 dark:text-gray-300 break-all">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
