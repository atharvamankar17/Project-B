import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import EmptyState from '../EmptyState'; // Ensure this path is correct

// Backend sends full names, so we must use full names for the state
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export default function TimetableView() {
  const { appData } = useAppContext();
  const getCurrentDay = () => {
    const d = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    return d === 'Sunday' ? 'Monday' : d;
  };
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentDay());
  // ==========================================
  // THE BULLETPROOF SHIELD
  // If there's no data, stop rendering and show the Empty State immediately.
  // ==========================================
  if (!appData || !appData.timetable) {
    return (
      <div className="animate-fade-in">
        <h2 className="section-header px-1 mb-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</h2>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <h2 className="section-header px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</h2>

      {/* Swipeable / Clickable Day Selector */}
      <div className="flex bg-[#12141A] p-1.5 rounded-[16px] border border-white/5 shadow-inner">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-[12px] transition-all min-h-[44px] ${selectedDay === day
              ? 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] border border-blue-500/30 text-blue-400'
              : 'text-white/40 hover:text-white/80'
              }`}
          >
            {/* Slice 'Monday' to 'Mon' for the UI text */}
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Timetable List */}
      <div className="space-y-4">
        {/* Safely check if the specific day has classes using dynamic optional chaining */}
        {appData.timetable?.[selectedDay]?.length ? (
          appData.timetable[selectedDay].map((slot: any, i: number) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-14 text-right">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">{slot.time}</span>
              </div>
              <div className="flex-1 bg-[#12141A] p-4 rounded-3xl border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <h4 className="text-sm font-semibold text-white/90">{slot.subject}</h4>
                <div className="flex gap-3 mt-2 items-center">
                  <span className="text-[10px] font-bold tracking-wide text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/10">
                    {slot.type || 'CLASS'}
                  </span>
                  {slot.teacher && <p className="text-[11px] text-white/50">{slot.teacher}</p>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center p-8 mt-10 text-sm font-medium text-white/40 bg-[#12141A] rounded-3xl border border-white/5 shadow-inner">
            System Idle: No Sessions Scheduled.
          </div>
        )}
      </div>
    </div>
  );
}