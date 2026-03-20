import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '@/contexts/AppContext';
import CircularProgress from '../CircularProgress';
import EmptyState from '../EmptyState';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl min-w-[140px]">
        <p className="text-[11px] font-semibold mb-2 text-foreground uppercase tracking-wide border-b border-border pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-[11px] mt-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground capitalize">{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalysisView() {
  const { appData } = useAppContext();
  const [bunkCount, setBunkCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!appData || !appData.attendance?.length) return <EmptyState />;

  const bunkMarginData = appData.attendance.map(s => ({
    name: s.name,
    margin: Math.max(0, Math.floor(s.attended / 0.75 - s.conducted)),
  }));

  // Guard selectedSubject index against stale state when data changes
  const safeIndex = Math.min(selectedSubject, appData.attendance.length - 1);
  const sub = appData.attendance[safeIndex];
  const newConducted = sub.conducted + Math.abs(bunkCount);
  const newAttended = bunkCount < 0 ? sub.attended + Math.abs(bunkCount) : sub.attended;
  const projectedPct = newConducted === 0 ? 0 : Math.max(0, Math.min(100, (newAttended / newConducted) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-20">

      {/* Hypothesis Engine (Moved UP based on user request) */}
      <section className="bg-card rounded-3xl p-6 border border-border mt-8">
        <h2 className="section-header mb-6 text-center">Bunk Hypothesis Engine</h2>

        {/* Custom Subject Selector */}
        <div className="relative mb-8" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-secondary/80 rounded-2xl p-4 flex items-center justify-between text-sm font-medium border border-border outline-none transition-colors hover:bg-secondary active:scale-[0.98]"
          >
            <span className="pr-4 truncate">{appData.attendance[selectedSubject].name}</span>
            <ChevronDown size={18} className={`flex-shrink-0 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] left-0 w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-20 max-h-[220px] overflow-y-auto no-scrollbar"
              >
                {appData.attendance.map((s, i) => (
                  <button
                    key={i}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-secondary/50 ${selectedSubject === i ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground'}`}
                    onClick={() => {
                      setSelectedSubject(i);
                      setBunkCount(0);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Stepper (Bi-Directional Bounds / Dynamically Swaps UI Icons) */}
          <div className="flex items-center gap-8">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setBunkCount(bunkCount - 1)}
              className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center min-h-[44px] shadow-sm active:shadow-md"
            >
              {bunkCount >= 0 ? <Minus size={20} className="text-foreground/80" /> : <Plus size={20} className="text-foreground/80" />}
            </motion.button>
            <div className="text-center min-w-[120px]">
              <motion.span 
                key={Math.abs(bunkCount)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-5xl font-light tabular ${bunkCount < 0 ? 'text-system-green font-medium' : 'text-foreground'}`}
              >
                {Math.abs(bunkCount)}
              </motion.span>
              <p className="text-[10px] text-muted-foreground uppercase mt-1.5 tracking-widest font-bold">
                {bunkCount >= 0 ? "Classes to Skip" : "Classes to Attend"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setBunkCount(bunkCount + 1)}
              className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center min-h-[44px] shadow-sm active:shadow-md"
            >
              {bunkCount >= 0 ? <Plus size={20} className="text-foreground/80" /> : <Minus size={20} className="text-foreground/80" />}
            </motion.button>
          </div>

          <CircularProgress percentage={projectedPct} size={200} strokeWidth={16} />
        </div>
      </section>

      {/* Bunk Margin EDA (Moved DOWN) */}
      <section className="bg-card rounded-3xl p-6 border border-border">
        <h2 className="section-header mb-6 px-1">Safe Bunk Margin (EDA)</h2>
        <div className="w-full" style={{ height: Math.max(300, bunkMarginData.length * 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bunkMarginData} layout="vertical" margin={{ left: -20, right: 20, top: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorMargin" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#34C759" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#34C759" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={150} className="fill-muted-foreground font-medium" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="margin" fill="url(#colorMargin)" radius={[0, 8, 8, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
