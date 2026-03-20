import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';
import EmptyState from '../EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export interface TimeSlot {
  time: string;
  subject: string;
  type?: string;
  teacher?: string;
}

export default function TimetableView() {
  const { appData } = useAppContext();
  
  const getCurrentDay = () => {
    const d = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    return d === 'Sunday' ? 'Monday' : d;
  };
  
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentDay());

  if (!appData || !appData.timetable) {
    return (
      <div className="animate-fade-in">
        <h2 className="section-header px-1 mb-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</h2>
        <EmptyState />
      </div>
    );
  }

  const currentSlots: TimeSlot[] = appData.timetable?.[selectedDay] || [];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <h2 className="section-header px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</h2>

      {/* MATCHED DASHBOARD: bg-card, adaptive border */}
      <div className="flex bg-card p-1.5 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-[12px] transition-all min-h-[44px] ${
              selectedDay === day
                ? 'bg-blue-500/10 dark:bg-blue-500/20 shadow-sm border border-blue-500/20 text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="space-y-3 relative min-h-[200px]">
        <AnimatePresence mode="wait">
          {currentSlots.length > 0 ? (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {currentSlots.map((slot) => (
                <div key={`${slot.time}-${slot.subject}`} className="flex gap-4 items-center">
                  <div className="w-14 text-right">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">{slot.time}</span>
                  </div>
                  {/* MATCHED DASHBOARD: identical card styling and hover animation */}
                  <div className="flex-1 bg-card p-5 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm transition-all hover:scale-[1.01]">
                    <h4 className="font-semibold text-sm text-foreground">{slot.subject}</h4>
                    <div className="flex gap-3 mt-2 items-center">
                      {/* MATCHED DASHBOARD: pill styling */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                        {slot.type || 'CLASS'}
                      </span>
                      {slot.teacher && <p className="text-xs text-muted-foreground">{slot.teacher}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center p-8 mt-10 text-sm font-medium text-muted-foreground bg-card rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm"
            >
              System Idle: No Sessions Scheduled.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}