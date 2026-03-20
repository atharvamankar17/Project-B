import { LayoutGrid, ChartColumn, Calendar, Info, Settings, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'dash' | 'analysis' | 'simulator' | 'timetable' | 'settings';

const tabs: { id: TabId; icon: React.ReactNode }[] = [
  { id: 'dash', icon: <LayoutGrid size={22} /> },
  { id: 'analysis', icon: <ChartColumn size={22} /> },
  { id: 'simulator', icon: <Wand2 size={22} /> },
  { id: 'timetable', icon: <Calendar size={22} /> },
  { id: 'settings', icon: <Settings size={22} /> },
];

interface Props {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ active, onTabChange }: Props) {
  return (
    <div className="absolute bottom-6 left-6 right-6 glass-surface rounded-[2rem] py-2 px-3 flex justify-between items-center z-40 shadow-2xl border border-black/5 dark:border-white/10 backdrop-blur-3xl">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative p-2.5 flex items-center justify-center transition-all duration-300 z-10 outline-none ${isActive ? 'text-system-blue' : 'text-muted-foreground hover:text-foreground hover:scale-105'
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavActiveBadge"
                className="absolute inset-0 bg-system-blue/15 dark:bg-system-blue/20 rounded-[14px] -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}
            <motion.div
              animate={{ scale: isActive ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {tab.icon}
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}
