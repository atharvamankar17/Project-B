import { Database } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 min-h-[60vh]">
      <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center">
        <Database size={32} />
      </div>
      <div>
        <h3 className="text-sm font-semibold">System Idle</h3>
        <p className="text-xs text-muted-foreground">Run Sync Engine from Settings.</p>
      </div>
    </div>
  );
}
