import { useState } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";
import {
  MessageSquare,
  Cpu,
  Brain,
  Activity,
  Settings as SettingsIcon,
  Plus,
  Search,
  Trash2,
  Sun,
  Moon,
  ChevronRight,
  PanelLeftClose,
  ChevronDown,
} from "lucide-react";

export function Sidebar() {
  const {
    sessions,
    currentSessionId,
    selectSession,
    deleteSession,
    createSession,
    agents,
    activeTab,
    setActiveTab,
    isSidebarOpen,
    toggleSidebar,
    theme,
    setTheme,
    toggleCommandPalette,
  } = useAppState();

  const { toast } = useToast();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [selectedAgentForNewChat, setSelectedAgentForNewChat] = useState("");
  const [newChatTitle, setNewChatTitle] = useState("");

  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentForNewChat) {
      toast("Please select an agent to drive the session.", "error");
      return;
    }

    const agent = agents.find((a) => a.id === selectedAgentForNewChat);
    const title = newChatTitle.trim() || `Chat with ${agent?.name || "Agent"}`;

    try {
      await createSession(title, selectedAgentForNewChat);
      setIsNewChatModalOpen(false);
      setSelectedAgentForNewChat("");
      setNewChatTitle("");
      setActiveTab("chat");
    } catch (err) {
      // toast is already fired in AppStateProvider
    }
  };

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-80 shrink-0 bg-[#09090B] border-r border-[#18181B] flex flex-col h-screen text-zinc-300 select-none relative z-20">
      {/* 1. Header */}
      <div className="p-4 border-b border-[#18181B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/15">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="font-semibold text-zinc-100 font-sans tracking-tight text-sm block">
              Aether Agent
            </span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider font-semibold uppercase">
              v1.0 Cognitive
            </span>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* 2. Fast search Ctrl+K bar */}
      <div className="px-3 pt-3">
        <button
          onClick={toggleCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-xl text-left text-xs text-zinc-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            <span className="group-hover:text-zinc-400 transition-colors">Search platform...</span>
          </div>
          <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* 3. Navigation Links */}
      <div className="p-3 flex flex-col gap-0.5 border-b border-[#18181B]">
        <button
          onClick={() => setActiveTab("chat")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-zinc-800/50 border border-zinc-700/50 text-white"
              : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span>Chat Playground</span>
        </button>

        <button
          onClick={() => setActiveTab("agents")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "agents"
              ? "bg-zinc-800/50 border border-zinc-700/50 text-white"
              : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Cpu className="h-4 w-4 shrink-0" />
          <span>Agent Hub</span>
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "memory"
              ? "bg-zinc-800/50 border border-zinc-700/50 text-white"
              : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Brain className="h-4 w-4 shrink-0" />
          <span>Cognitive Memory</span>
        </button>

        <button
          onClick={() => setActiveTab("cascadeflow")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "cascadeflow"
              ? "bg-zinc-800/50 border border-zinc-700/50 text-white"
              : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Activity className="h-4 w-4 shrink-0" />
          <span>CascadeFlow Runs</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-zinc-800/50 border border-zinc-700/50 text-white"
              : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <SettingsIcon className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </button>
      </div>

      {/* 4. Recent Chats Section */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 pt-4">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500">
            Recent Workspaces
          </span>
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-1 rounded bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
            title="Deploy new session"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-zinc-500 mb-2">No active sessions.</p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Create First Chat
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5">
            {sessions.map((session) => {
              const agent = agents.find((a) => a.id === session.agentId);
              const isActive = currentSessionId === session.id && activeTab === "chat";

              return (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? "bg-zinc-800/50 text-zinc-100 font-medium"
                      : "hover:bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <button
                    onClick={() => {
                      selectSession(session.id);
                      setActiveTab("chat");
                    }}
                    className="flex-1 flex items-center gap-2 text-left min-w-0 cursor-pointer"
                  >
                    <div className="h-5.5 w-5.5 rounded bg-zinc-850 text-zinc-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 border border-zinc-800">
                      {agent?.name ? agent.name.substring(0, 1) : "A"}
                    </div>
                    <span className="truncate flex-1 block">{session.title}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-all shrink-0 cursor-pointer"
                    title="Archive workspace"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Footer User / Profile */}
      <div className="p-4 border-t border-[#18181B] bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8.5 w-8.5 bg-zinc-850 text-zinc-300 border border-zinc-850 rounded-xl flex items-center justify-center font-bold text-sm">
            S
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-zinc-200 block truncate leading-tight">
              Siddharth G.
            </span>
            <span className="text-[9px] text-zinc-500 block truncate">
              siddharthgoudgilakathi@gmail.com
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
            toast(`Switched theme to ${theme === "dark" ? "Light" : "Dark"}`, "info");
          }}
          className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Toggle system theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-sky-400" />}
        </button>
      </div>

      {/* Deploy New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-lg font-semibold text-zinc-100 mb-1 tracking-tight font-sans">
              Initialize New Agent Workspace
            </h2>
            <p className="text-xs text-zinc-400 mb-5 leading-normal">
              Select an specialized cognitive agent and optionally specify custom titles to bootstrap the workspace environment.
            </p>

            <form onSubmit={handleCreateNewChat} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1.5">
                  Cognitive Driver
                </label>
                <div className="flex flex-col gap-1.5">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgentForNewChat(agent.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedAgentForNewChat === agent.id
                          ? "bg-indigo-600/10 border-indigo-600/30"
                          : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700/80"
                      }`}
                    >
                      <div className="h-7 w-7 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {agent.name.substring(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200">{agent.name}</p>
                        <p className="text-[11px] text-zinc-400 font-medium leading-tight">{agent.role}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{agent.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1.5">
                  Workspace Title
                </label>
                <input
                  type="text"
                  placeholder="Optional title, e.g. Design System Drafting..."
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700/50"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewChatModalOpen(false);
                    setSelectedAgentForNewChat("");
                    setNewChatTitle("");
                  }}
                  className="flex-1 py-2.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all font-medium border border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all font-semibold shadow-lg shadow-indigo-600/15"
                >
                  Deploy Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
export default Sidebar;
