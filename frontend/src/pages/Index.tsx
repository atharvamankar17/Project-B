import { useState } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import BottomNav, { type TabId } from '@/components/project-b/BottomNav';
import SyncOverlay from '@/components/project-b/SyncOverlay';
import ChatSheet from '@/components/project-b/ChatSheet';
import DashboardView from '@/components/project-b/views/DashboardView';
import AnalysisView from '@/components/project-b/views/AnalysisView';
import SimulatorView from '@/components/project-b/views/SimulatorView';
import TimetableView from '@/components/project-b/views/TimetableView';
import SettingsView from '@/components/project-b/views/SettingsView';

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dash');

  return (
    <div className="max-w-md mx-auto h-screen relative overflow-hidden bg-background text-foreground">
      <SyncOverlay />

      <main className="h-full overflow-y-auto no-scrollbar pb-32 pt-12 px-5">
        {activeTab === 'dash' && <DashboardView />}
        {activeTab === 'analysis' && <AnalysisView />}
        {activeTab === 'simulator' && <SimulatorView />}
        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      <ChatSheet />
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function Index() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
