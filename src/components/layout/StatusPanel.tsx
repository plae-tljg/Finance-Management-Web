import { StatCard } from '../ui/Card';

interface StatusPanelProps {
  isReady: boolean;
  database: unknown;
  isInitialized: boolean;
  version: string;
  tableCount: number;
}

export function StatusPanel({ isReady, database, isInitialized, version, tableCount }: StatusPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Hook Status"
        value={isReady ? 'Ready' : 'Loading...'}
        icon={isReady ? '✅' : '⏳'}
      />
      <StatCard
        title="Connection"
        value={database ? 'Connected' : 'Disconnected'}
        icon={database ? '✅' : '❌'}
      />
      <StatCard
        title="Initialization"
        value={isInitialized ? 'Initialized' : 'Not Initialized'}
        icon={isInitialized ? '✅' : '❌'}
      />
      <StatCard
        title="Version"
        value={version || 'Unknown'}
        icon="📋"
      />
      <StatCard
        title="Tables"
        value={tableCount}
        icon="🗄️"
      />
    </div>
  );
}
