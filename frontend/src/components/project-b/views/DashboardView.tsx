import { useAppContext } from '@/contexts/AppContext';
import CircularProgress from '../CircularProgress';
import EmptyState from '../EmptyState';

function AttendanceStatus({ attended, conducted }: { attended: number; conducted: number }) {
  if (conducted === 0) return null;
  const p = (attended / conducted) * 100;
  const exactPercent = p.toFixed(2) + '%';

  if (p > 75) {
    const bunksLeft = Math.floor(attended / 0.75 - conducted);
    return (
      <div className="text-right">
        <div className="text-[13px] font-bold text-system-green tabular">{exactPercent}</div>
        <div className="text-[10px] font-bold text-muted-foreground/80 tabular mt-0.5 uppercase">SAFE: {bunksLeft} LEFT</div>
      </div>
    );
  }
  if (Math.abs(p - 75) < 0.5) {
    return (
      <div className="text-right">
        <div className="text-[13px] font-bold text-system-orange tabular">{exactPercent}</div>
        <div className="text-[10px] font-bold text-muted-foreground/80 tabular mt-0.5 uppercase">BORDERLINE</div>
      </div>
    );
  }
  const needed = Math.ceil((0.75 * conducted - attended) / 0.25);
  return (
    <div className="text-right">
      <div className="text-[13px] font-bold text-system-red tabular">{exactPercent}</div>
      <div className="text-[10px] font-bold text-muted-foreground/80 tabular mt-0.5 uppercase">CRITICAL: +{needed} MORE</div>
    </div>
  );
}

export default function DashboardView() {
  const { appData } = useAppContext();
  if (!appData || !appData.attendance?.length) return <EmptyState />;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col items-center py-4">
        <h2 className="section-header mb-6">System Overview</h2>
        <CircularProgress percentage={appData.aggregate} />
      </header>

      <div className="space-y-3">
        {appData.attendance.map((sub, i) => (
          <div key={i} className="bg-card p-5 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm flex items-center justify-between transition-all hover:scale-[1.01]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                  {sub.type}
                </span>
                <h3 className="font-semibold text-sm">{sub.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground tabular">{sub.attended} / {sub.conducted} sessions</p>
            </div>
            <AttendanceStatus attended={sub.attended} conducted={sub.conducted} />
          </div>
        ))}
      </div>
    </div>
  );
}
