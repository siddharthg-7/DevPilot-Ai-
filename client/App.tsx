import { useAppState, AppStateProvider } from "./providers/AppStateProvider.js";
import { ToastProvider } from "./providers/ToastProvider.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { Sidebar } from "./layouts/Sidebar.js";
import { CommandPalette } from "./components/CommandPalette.js";
import { ChatPlayground } from "./pages/ChatPlayground.js";
import { AgentHub } from "./pages/AgentHub.js";
import { MemoryVault } from "./pages/MemoryVault.js";
import { CascadeMonitor } from "./pages/CascadeMonitor.js";
import { Settings } from "./pages/Settings.js";
import { PanelLeftOpen, Cpu, Search, Sparkles } from "lucide-react";

function DashboardContent() {
  const { activeTab, isSidebarOpen, toggleSidebar, toggleCommandPalette } = useAppState();

  return (
    <div className="flex h-screen w-screen bg-[#09090B] overflow-hidden text-zinc-100 font-sans">
      {/* 1. Collapsed sidebar trigger indicator if sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-30 p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 text-zinc-400 hover:text-white transition-all shadow-lg shadow-indigo-500/5 cursor-pointer flex items-center justify-center"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      {/* 2. Application Sidebar Layout */}
      <Sidebar />

      {/* 3. Main Operational Window */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#09090B]">
        {/* Mobile top-bar (shown only on small screen sizes when sidebar is closed) */}
        <div className="lg:hidden h-14 bg-zinc-900 border-b border-[#18181B] flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <div className="h-5 w-5" /> // spacing spacer for the absolute expand button
            )}
            <span className="font-semibold text-xs tracking-tight text-zinc-200">
              Aether Agent
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCommandPalette}
              className="p-1.5 rounded-lg hover:bg-zinc-800/30 text-zinc-400 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Dynamic page tab switching */}
        {activeTab === "chat" && <ChatPlayground />}
        {activeTab === "agents" && <AgentHub />}
        {activeTab === "memory" && <MemoryVault />}
        {activeTab === "cascadeflow" && <CascadeMonitor />}
        {activeTab === "settings" && <Settings />}
      </div>

      {/* 4. Global Command Palette overlay */}
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppStateProvider>
          <DashboardContent />
        </AppStateProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
