import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import CircularProgress from '../CircularProgress';
import EmptyState from '../EmptyState';

export default function SimulatorView() {
    const { appData } = useAppContext();
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [mode, setMode] = useState<'bunk' | 'attend'>('bunk');

    if (!appData) return <EmptyState />;

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const toggleDay = (day: string) => {
        setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const subjectsToHandle: Record<string, number> = {};
    selectedDays.forEach(day => {
        const classes = appData.timetable[day] || [];
        classes.forEach(c => {
            const cWords = c.subject.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 1);
            const cTypePrefix = c.type.toLowerCase().substring(0, 3);

            let bestMatch: typeof appData.attendance[0] | null = null;
            let maxScore = 0;

            appData.attendance.forEach(a => {
                const aNameNorm = a.name.toLowerCase();
                let score = 0;

                cWords.forEach(w => {
                    if (aNameNorm.includes(w.toLowerCase())) score += 1;
                });

                const aTypePrefix = a.type.toLowerCase().substring(0, 3);
                if (aTypePrefix === cTypePrefix) {
                    score += 2;
                } else {
                    score -= 5;
                }

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = a;
                }
            });

            if (bestMatch && maxScore > 0) {
                subjectsToHandle[bestMatch.name] = (subjectsToHandle[bestMatch.name] || 0) + 1;
            }
        });
    });

    let totalAttended = 0;
    let totalConducted = 0;
    const affectedSubjects: { name: string, type: string, oldPct: number, newPct: number, isCriticalDrop: boolean, isRecovery: boolean }[] = [];

    appData.attendance.forEach(s => {
        const count = subjectsToHandle[s.name] || 0;
        const newConducted = s.conducted + count;
        const addedAttended = mode === 'attend' ? count : 0;
        const newAttended = s.attended + addedAttended;

        totalAttended += newAttended;
        totalConducted += newConducted;

        if (s.conducted === 0 || count === 0) return;

        const oldPct = (s.attended / s.conducted) * 100;
        const newPct = (newAttended / newConducted) * 100;

        const isCriticalDrop = mode === 'bunk' && newPct < 75 && oldPct >= 75;
        const isRecovery = mode === 'attend' && newPct >= 75 && oldPct < 75;
        affectedSubjects.push({ name: s.name, type: s.type || 'CLASS', oldPct, newPct, isCriticalDrop, isRecovery });
    });

    const weeklyProjectedAggregate = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : (appData.aggregate || 0);
    const totalClassesHandled = Object.values(subjectsToHandle).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <section className="bg-card rounded-3xl p-6 border border-border mt-8">
                <h2 className="section-header mb-6 text-center">Weekly Schedule Simulator</h2>
                
                {/* Mode Toggle UI */}
                <div className="flex justify-center mb-6">
                    <div className="flex bg-secondary p-1 rounded-2xl border border-border">
                        <button 
                            onClick={() => setMode('bunk')}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'bunk' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/70'}`}
                        >
                            Miss Classes 
                        </button>
                        <button 
                            onClick={() => setMode('attend')}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'attend' ? 'bg-system-green text-white shadow-sm' : 'text-muted-foreground hover:text-foreground/70'}`}
                        >
                            Attend Classes
                        </button>
                    </div>
                </div>

                <p className="text-center text-[13px] text-muted-foreground mb-8">
                    {mode === 'bunk' 
                        ? 'Select days to simulate skipping all classes scheduled on those days.' 
                        : 'Select days to simulate successfully attending all scheduled classes.'}
                </p>

                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-4 py-3 rounded-full text-xs font-bold transition-all shadow-sm ${selectedDays.includes(day)
                                ? mode === 'bunk' ? 'bg-foreground text-background scale-[1.05]' : 'bg-system-green text-white scale-[1.05]'
                                : 'bg-secondary/70 text-muted-foreground hover:bg-secondary outline outline-1 outline-border'
                                }`}
                        >
                            {day.substring(0, 3)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col items-center space-y-8">
                    <CircularProgress percentage={weeklyProjectedAggregate} size={240} strokeWidth={18} />

                    {selectedDays.length > 0 && (
                        <div className="w-full space-y-4 pt-4">
                            <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                                <p className="text-sm font-medium">
                                    You will {mode === 'bunk' ? 'skip' : 'attend'} <span className={`font-bold ${mode === 'attend' ? 'text-system-green' : 'text-foreground'}`}>{totalClassesHandled} classes</span> across {selectedDays.length} day(s).
                                </p>
                            </div>

                            {affectedSubjects.length > 0 && (
                                <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-5 px-1 text-center">Projected Subject Changes</p>
                                    <div className="space-y-3">
                                        {affectedSubjects.map((subj, i) => (
                                          <div key={i} className="bg-card p-5 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm flex items-center justify-between transition-all hover:scale-[1.01]">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                                                  {subj.type}
                                                </span>
                                                <h3 className="font-semibold text-sm line-clamp-1 pr-4">{subj.name}</h3>
                                              </div>
                                              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold tabular-nums">
                                                <span className={subj.oldPct >= 75 ? 'text-system-green' : 'text-system-red'}>
                                                    {subj.oldPct.toFixed(1)}%
                                                </span>
                                                <span className="text-muted-foreground/60">→</span>
                                                <span className={`font-bold text-[13px] ${subj.newPct >= 75 ? 'text-system-green' : 'text-system-red'}`}>
                                                    {subj.newPct.toFixed(2)}%
                                                </span>
                                              </div>
                                            </div>
                                            
                                            <div className="text-right flex flex-col items-end">
                                              {subj.isCriticalDrop && (
                                                <div className="text-[10px] font-bold text-system-red bg-system-red/10 px-2 py-1 rounded-md uppercase tracking-widest mt-0.5">Critical Drop</div>
                                              )}
                                              {subj.isRecovery && (
                                                <div className="text-[10px] font-bold text-system-green bg-system-green/10 px-2 py-1 rounded-md uppercase tracking-widest mt-0.5">Recovered</div>
                                              )}
                                              {!subj.isCriticalDrop && !subj.isRecovery && (
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Stable</div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
