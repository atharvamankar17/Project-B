import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

export default function SyncOverlay() {
  const { syncState } = useAppContext();

  return (
    <AnimatePresence>
      {syncState.isSyncing && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-[#050505]/95 overflow-hidden"
        >
          <div className="relative w-full max-w-[280px] flex flex-col items-center z-10">
            
            {/* Elegant Minimalist Spinner */}
            <div className="mb-10 text-system-blue opacity-90">
              <Loader2 size={44} strokeWidth={1.5} className="animate-spin drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            </div>

            {/* Typography Section */}
            <div className="w-full text-center space-y-3 mb-12">
              <h2 className="text-[14px] font-bold text-white tracking-[0.25em] uppercase font-sans drop-shadow-md">
                Synchronizing
              </h2>
              <div className="h-4 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={syncState.message}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -15, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="text-[11px] font-medium text-white/50 uppercase tracking-widest font-sans"
                  >
                    {syncState.message}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Basic Linear Progress Bar */}
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase">Progress</span>
                <span className="text-[10px] font-bold text-white/80 tabular-nums">
                  {Math.round(syncState.progress)}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-system-blue rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, syncState.progress)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.4 }}
                />
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
