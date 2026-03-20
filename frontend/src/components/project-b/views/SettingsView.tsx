import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

function SettingsGroup({ label, children, zIndex = 1 }: { label: string; children: React.ReactNode; zIndex?: number }) {
  return (
    <div className="space-y-2 relative" style={{ zIndex }}>
      <h3 className="section-header px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      {/* MATCHED DASHBOARD: bg-card, adaptive border, softened shadow */}
      <div className="bg-card rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm divide-y divide-black/5 dark:divide-white/5 relative">
        {children}
      </div>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 min-h-[44px]">
      <span className="text-sm font-medium text-foreground/80 whitespace-nowrap mr-4">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        // MATCHED DASHBOARD: adaptive text and placeholder colors
        className="bg-transparent text-right text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none flex-1 min-w-0"
      />
    </div>
  );
}

function SettingsSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between p-4 min-h-[44px]">
      <span className="text-sm font-medium text-foreground/80">{label}</span>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-foreground focus:outline-none min-w-[100px] justify-end outline-none"
        >
          {value}
          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[calc(100%+8px)] right-0 min-w-[140px] bg-card/95 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl shadow-lg overflow-hidden z-50 p-1.5"
            >
              <div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    className={`w-full text-right px-4 py-2.5 text-[13px] rounded-[10px] transition-colors ${
                      value === opt 
                      ? 'bg-secondary text-foreground font-semibold' 
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SettingsView() {
  const {
    theme,
    setTheme,
    syncState,
    triggerSync,
    credentials,
    setCredentials,
    aiConfig,
    setAIConfig,
    injectMockData,
  } = useAppContext();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const YEAR_OPTIONS = ["2027-28", "2026-27", "2025-26", "2024-25"];
  const SEMESTER_OPTIONS = ["1", "2", "Summer", "Winter"];

  const handleSaveConfig = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <h1 className="text-3xl font-bold px-1 tracking-tight">Settings</h1>

      <div className="space-y-8">
        <div className="bg-card rounded-[20px] overflow-hidden border border-black/5 dark:border-white/5 shadow-sm transition-all hover:scale-[1.01]">
          <button
            onClick={() => triggerSync()}
            disabled={syncState.isSyncing}
            className="w-full p-4 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold min-h-[50px] hover:bg-secondary/30 active:bg-secondary/60 transition-colors"
          >
            Run Sync Engine
          </button>
        </div>

        <SettingsGroup label="Appearance" zIndex={40}>
          <div className="flex items-center justify-between p-4 min-h-[44px]">
            <span className="text-sm font-medium text-foreground/80">Dark Mode</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-[51px] h-[31px] rounded-full transition-colors duration-300 relative ${
                theme === 'dark' ? 'bg-system-green' : 'bg-muted-foreground/30'
              }`}
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </SettingsGroup>

        <SettingsGroup label="Credentials" zIndex={30}>
          <SettingsInput
            label="Username"
            value={credentials.username}
            onChange={(v) => setCredentials({ ...credentials, username: v })}
            placeholder="abc.def@vit.edu"
          />
          <SettingsInput
            label="Password"
            value={credentials.password}
            onChange={(v) => setCredentials({ ...credentials, password: v })}
            placeholder="••••••••"
            type="password"
          />
        </SettingsGroup>

        <SettingsGroup label="Target Configuration" zIndex={20}>
          <SettingsSelect
            label="Academic Year"
            value={credentials.year}
            onChange={(v) => setCredentials({ ...credentials, year: v })}
            options={YEAR_OPTIONS}
          />
          <SettingsSelect
            label="Semester"
            value={credentials.semester}
            onChange={(v) => setCredentials({ ...credentials, semester: v })}
            options={SEMESTER_OPTIONS}
          />
        </SettingsGroup>

        <SettingsGroup label="AI Configuration" zIndex={10}>
          <SettingsInput
            label="Gemini API Key"
            value={aiConfig.geminiKey}
            onChange={(v) => setAIConfig({ ...aiConfig, geminiKey: v })}
            placeholder="AIza..."
            type="password"
          />
          <SettingsInput
            label="Model Name"
            value={aiConfig.geminiModel}
            onChange={(v) => setAIConfig({ ...aiConfig, geminiModel: v })}
            placeholder="gemini-2.5-flash"
          />
        </SettingsGroup>

        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="w-full bg-blue-500 text-white rounded-[20px] py-3.5 font-semibold text-sm flex items-center justify-center shadow-md hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <Loader2 size={18} className="animate-spin" />
                <span>Saving Details...</span>
              </motion.div>
            ) : saveSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Saved Successfully</span>
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Save Configuration
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <footer
          className="pt-6 pb-10 flex flex-col items-center text-muted-foreground opacity-40 cursor-pointer hover:opacity-100 transition-opacity"
          onClick={injectMockData}
        >
          <ShieldCheck size={24} className="mb-2" />
          <span className="text-[10px] uppercase tracking-widest font-medium">
            Project-B v1.0.0
          </span>
        </footer>
      </div>
    </div>
  );
}