import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// 1. UPDATED INTERFACES TO MATCH PYTHON EXACTLY
export interface Subject {
  name: string;
  attended: number;
  conducted: number;
  type: string;
  percentage?: number;       // Added for calculator.py compatibility
  bunks_available?: number;  // Added for calculator.py compatibility
  status?: string;           // Added for calculator.py compatibility
}

export interface TimetableSlot {
  time: string;
  subject: string;
  type: string; // Swapped 'room' for 'type'
  teacher?: string;
}

export interface AppData {
  aggregate?: number;
  attendance: Subject[]; // Swapped 'subjects' for 'attendance'
  timetable: Record<string, TimetableSlot[]>;
}

interface AIConfig {
  geminiKey: string;
  geminiModel: string;
}

interface Credentials {
  username: string;
  password: string;
  year: string;
  semester: string;
}

interface SyncState {
  isSyncing: boolean;
  progress: number;
  message: string;
}

interface AppContextType {
  appData: AppData | null;
  setAppData: (data: AppData | null) => void;
  aiConfig: AIConfig;
  setAIConfig: (config: AIConfig) => void;
  credentials: Credentials;
  setCredentials: (creds: Credentials) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  syncState: SyncState;
  triggerSync: () => void;
  injectMockData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// 2. UPDATED MOCK DATA TO MATCH THE NEW INTERFACES
const MOCK_DATA: AppData = {
  aggregate: 82,
  attendance: [
    { name: 'Advanced Algorithms', attended: 32, conducted: 36, type: 'Theory', percentage: 88, bunks_available: 4, status: 'Safe' },
    { name: 'Distributed Systems', attended: 24, conducted: 30, type: 'Theory', percentage: 80, bunks_available: 2, status: 'Safe' },
    { name: 'Machine Learning Lab', attended: 12, conducted: 12, type: 'Lab', percentage: 100, bunks_available: 3, status: 'Safe' },
    { name: 'Cloud Computing', attended: 18, conducted: 28, type: 'Theory', percentage: 64, bunks_available: -3, status: 'Critical' },
    { name: 'Computer Networks', attended: 24, conducted: 32, type: 'Theory', percentage: 75, bunks_available: 0, status: 'Borderline' },
  ],
  timetable: {
    Monday: [
      { time: '09:00', subject: 'Advanced Algorithms', type: 'Theory', teacher: 'Dr. Sharma' },
      { time: '11:00', subject: 'Distributed Systems', type: 'Theory', teacher: 'Prof. Gupta' },
    ],
    Tuesday: [
      { time: '09:00', subject: 'Computer Networks', type: 'Theory', teacher: 'Prof. Singh' },
      { time: '11:00', subject: 'Machine Learning Lab', type: 'Lab', teacher: 'Dr. Kumar' },
    ],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData | null>(() => {
    const saved = localStorage.getItem('pb_appData');
    return saved ? JSON.parse(saved) : null;
  });
  const [aiConfig, setAIConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('pb_aiConfig');
    return saved ? JSON.parse(saved) : { geminiKey: '', geminiModel: 'gemini-1.5-flash' };
  });
  const [credentials, setCredentials] = useState<Credentials>(() => {
    const saved = localStorage.getItem('pb_credentials');
    return saved ? JSON.parse(saved) : { username: '', password: '', year: '2025-26', semester: '2' };
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [syncState, setSyncState] = useState<SyncState>({ isSyncing: false, progress: 0, message: '' });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);

  // Offline Native State Persistence Bridges
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { if (appData) localStorage.setItem('pb_appData', JSON.stringify(appData)); }, [appData]);
  useEffect(() => { localStorage.setItem('pb_aiConfig', JSON.stringify(aiConfig)); }, [aiConfig]);
  useEffect(() => { localStorage.setItem('pb_credentials', JSON.stringify(credentials)); }, [credentials]);

  const triggerSync = useCallback(async () => {
    setSyncState({ isSyncing: true, progress: 0, message: 'Initializing Secure Handshake...' });

    // Start polling the backend for real-time progress
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/status`);
        const data = await res.json();
        setSyncState(prev => ({ ...prev, progress: data.progress, message: data.message }));
      } catch {
        // Fail silently on polling errors
      }
    }, 500);

    try {
      // 3. STATLESS SECURE POST HANDSHAKE (No Backend Credential DB Tracking Needed)
      const res = await fetch(`http://${window.location.hostname}:5000/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const responseJson = await res.json();

      if (responseJson.success) {
        console.log("✅ Data successfully fetched and mapped:", responseJson.data);
        setAppData(responseJson.data); // <-- This is the magic fix!
      } else {
        console.error("❌ Sync Error from Backend:", responseJson.error);
        alert(`SYNC ENGINE HALTED:\n\n${responseJson.error || "An unknown error occurred."}`);
      }

    } catch (error) {
      console.error("❌ Network Error:", error);
      alert(`SYNC ENGINE HALTED:\n\nNetwork connection failed. Could not reach backend.`);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => setSyncState({ isSyncing: false, progress: 0, message: '' }), 500);
    }
  }, [credentials]);

  const injectMockData = useCallback(() => setAppData(MOCK_DATA), []);

  return (
    <AppContext.Provider value={{ appData, setAppData, aiConfig, setAIConfig, credentials, setCredentials, theme, setTheme, syncState, triggerSync, injectMockData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}