import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Sparkles, MessageSquare, Sun, Moon, Trash2, Cpu, X } from "lucide-react";
import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    toggleCommandPalette,
    agents,
    sessions,
    selectSession,
    createSession,
    theme,
    setTheme,
  } = useAppState();

  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        toggleCommandPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        toggleCommandPalette();
      }
    };

    if (isCommandPaletteOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  // Filter items
  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.role.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleAgentClick = async (agentId: string) => {
    // Check if we already have a session for this agent
    const existing = sessions.find((s) => s.agentId === agentId);
    if (existing) {
      selectSession(existing.id);
    } else {
      const agent = agents.find((a) => a.id === agentId);
      if (agent) {
        await createSession(`Bespoke ${agent.name} Workspace`, agentId);
      }
    }
    toggleCommandPalette();
  };

  const handleSessionClick = (sessionId: string) => {
    selectSession(sessionId);
    toggleCommandPalette();
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    toast(`Switched theme mode to ${theme === "dark" ? "Light" : "Dark"}`, "info");
    toggleCommandPalette();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          ref={paletteRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
            <Search className="h-5 w-5 text-zinc-450 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search agents, chats, actions, settings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-zinc-100 placeholder-zinc-550 text-sm focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-450 font-mono">
              ESC
            </kbd>
            <button
              onClick={toggleCommandPalette}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-450 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[350px] overflow-y-auto p-3 flex flex-col gap-4">
            {/* 1. System Actions */}
            <div>
              <span className="px-3 text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1">
                System Actions
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={handleThemeToggle}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-left text-sm text-zinc-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Moon className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
                    )}
                    <span>Switch to {theme === "dark" ? "Light Theme" : "Dark Theme"}</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono group-hover:text-zinc-350">Action</span>
                </button>
              </div>
            </div>

            {/* 2. Agents List */}
            {filteredAgents.length > 0 && (
              <div>
                <span className="px-3 text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1">
                  Cognitive Agents
                </span>
                <div className="flex flex-col gap-0.5">
                  {filteredAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentClick(agent.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-left text-sm text-zinc-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          {agent.name.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-200">{agent.name}</p>
                          <p className="text-xs text-zinc-450 line-clamp-1">{agent.role}</p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono group-hover:text-zinc-350">Deploy</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Conversations List */}
            {filteredSessions.length > 0 && (
              <div>
                <span className="px-3 text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1">
                  Active Chats
                </span>
                <div className="flex flex-col gap-0.5">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionClick(session.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-left text-sm text-zinc-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-zinc-450 shrink-0" />
                        <span className="truncate max-w-[400px] text-zinc-250">{session.title}</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono group-hover:text-zinc-350">Open</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredAgents.length === 0 && filteredSessions.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-sm">
                No matching agents or sessions located.
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <div className="flex items-center gap-1">
              <span>Use</span>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 font-sans text-[10px]">
                ↑↓
              </kbd>
              <span>to navigate,</span>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 font-sans text-[10px]">
                Enter
              </kbd>
              <span>to select</span>
            </div>
            <span>Aether System Core</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default CommandPalette;
