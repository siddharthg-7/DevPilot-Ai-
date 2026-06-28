import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Agent, ChatSession, ChatMessage, MemoryItem, CascadeFlowRun } from "../types/index.js";
import * as api from "../services/api.js";
import { useToast } from "./ToastProvider.js";

interface AppContextType {
  agents: Agent[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  memories: MemoryItem[];
  cascadeRuns: CascadeFlowRun[];
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  isCommandPaletteOpen: boolean;
  activeTab: "chat" | "agents" | "memory" | "cascadeflow" | "settings";
  setActiveTab: (tab: "chat" | "agents" | "memory" | "cascadeflow" | "settings") => void;
  activeAgent: Agent | null;
  isLoadingAgents: boolean;
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  isLoadingMemories: boolean;
  isSending: boolean;
  enableThinking: boolean;
  enableSearch: boolean;
  useCascadeFlow: boolean;
  selectSession: (id: string | null) => void;
  createSession: (title: string, agentId: string) => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  createCustomAgent: (agent: Omit<Agent, "id" | "isCustom">) => Promise<void>;
  deleteCustomAgent: (id: string) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  addManualMemory: (content: string, category: "preference" | "instruction" | "fact" | "insight") => Promise<void>;
  updateMemory: (id: string, content: string, category: "preference" | "instruction" | "fact" | "insight", confidence: number) => Promise<void>;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleCommandPalette: () => void;
  setEnableThinking: (val: boolean) => void;
  setEnableSearch: (val: boolean) => void;
  setUseCascadeFlow: (val: boolean) => void;
  loadAllBaseData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [cascadeRuns, setCascadeRuns] = useState<CascadeFlowRun[]>([]);

  // Config flags
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [useCascadeFlow, setUseCascadeFlow] = useState(false);

  // Loading states
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setThemeState] = useState<"light" | "dark">("dark");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "agents" | "memory" | "cascadeflow" | "settings">("chat");

  // Sync theme with HTML class
  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    localStorage.setItem("aether-theme", newTheme);
    const root = window.document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Initialize theme and basic static states
  useEffect(() => {
    const savedTheme = localStorage.getItem("aether-theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }

    // Responsive auto-sidebar close on smaller viewports
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch initial data: agents, sessions, memories, cascadeRuns
  const loadAllBaseData = async () => {
    try {
      setIsLoadingAgents(true);
      setIsLoadingSessions(true);
      setIsLoadingMemories(true);

      const [agentsData, sessionsData, memoriesData, cascadeRunsData] = await Promise.all([
        api.fetchAgents(),
        api.fetchSessions(),
        api.fetchMemories(),
        api.fetchCascadeFlowRuns(),
      ]);

      setAgents(agentsData);
      setSessions(sessionsData);
      setMemories(memoriesData);
      setCascadeRuns(cascadeRunsData);

      // Select first session by default if available
      if (sessionsData.length > 0) {
        setCurrentSessionId(sessionsData[0].id);
      }
    } catch (err: any) {
      toast(`Error boot-strapping platform data: ${err.message}`, "error");
    } finally {
      setIsLoadingAgents(false);
      setIsLoadingSessions(false);
      setIsLoadingMemories(false);
    }
  };

  useEffect(() => {
    loadAllBaseData();
  }, []);

  // Fetch session messages when currentSessionId changes
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const msgs = await api.fetchMessages(currentSessionId);
        setMessages(msgs);
      } catch (err: any) {
        toast(`Error loading conversation history: ${err.message}`, "error");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentSessionId]);

  // Derived current agent
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const activeAgent = currentSession ? agents.find((a) => a.id === currentSession.agentId) || null : null;

  // Global operations
  const selectSession = (id: string | null) => {
    setCurrentSessionId(id);
  };

  const createSession = async (title: string, agentId: string): Promise<string> => {
    try {
      const newSession = await api.createSession(title, agentId);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      toast(`Bespoke session "${title}" created successfully.`, "success");
      return newSession.id;
    } catch (err: any) {
      toast(`Failed to create session: ${err.message}`, "error");
      throw err;
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await api.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast("Session deleted successfully.", "success");
    } catch (err: any) {
      toast(`Failed to delete session: ${err.message}`, "error");
    }
  };

  const sendMessage = async (text: string) => {
    if (!currentSessionId || !activeAgent || !text.trim() || isSending) return;

    // Save temporary optimistic user message
    const tempUserMsgId = "temp_" + Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessage = {
      id: tempUserMsgId,
      sessionId: currentSessionId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const response = await api.sendChatMessage({
        sessionId: currentSessionId,
        agentId: activeAgent.id,
        message: text,
        enableThinking,
        enableSearch,
        useCascadeFlow,
      });

      // Update message list with final official database-saved messages
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== tempUserMsgId)
          .concat([response.userMessage, response.assistantMessage])
      );

      // If cascadeflow was utilized, append to list of cascadeRuns
      if (response.cascadeFlow) {
        setCascadeRuns((prev) => [response.cascadeFlow!, ...prev]);
        toast(`CascadeFlow execution completed successfully.`, "success");
      }

      // Refresh memories in background to capture dynamically extracted insights
      const updatedMemories = await api.fetchMemories();
      const newMemoryAdded = updatedMemories.length > memories.length;
      if (newMemoryAdded) {
        const difference = updatedMemories.filter(m => !memories.some(prev => prev.id === m.id));
        difference.forEach(m => {
          toast(`Cognitive memory logged: "${m.content}"`, "success");
        });
      }
      setMemories(updatedMemories);

    } catch (err: any) {
      // Revert user message and notify
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsgId));
      toast(`Execution error: ${err.message}`, "error");
    } finally {
      setIsSending(false);
    }
  };

  const createCustomAgent = async (agentData: Omit<Agent, "id" | "isCustom">) => {
    try {
      const created = await api.createAgent(agentData);
      setAgents((prev) => [...prev, created]);
      toast(`Custom intelligence "${created.name}" deployed successfully.`, "success");
    } catch (err: any) {
      toast(`Failed to deploy agent: ${err.message}`, "error");
    }
  };

  const deleteCustomAgent = async (id: string) => {
    try {
      await api.deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      toast("Agent offloaded successfully.", "success");
    } catch (err: any) {
      toast(`Failed to delete agent: ${err.message}`, "error");
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast("Memory removed from brain trust.", "success");
    } catch (err: any) {
      toast(`Failed to clear memory: ${err.message}`, "error");
    }
  };

  const addManualMemory = async (content: string, category: "preference" | "instruction" | "fact" | "insight") => {
    try {
      const created = await api.createMemory(content, category, "manual");
      setMemories((prev) => [created, ...prev]);
      toast("Manual hindsight memory integrated.", "success");
    } catch (err: any) {
      toast(`Failed to log memory: ${err.message}`, "error");
    }
  };

  const updateMemory = async (id: string, content: string, category: "preference" | "instruction" | "fact" | "insight", confidence: number) => {
    try {
      const updated = await api.updateMemory(id, content, category, confidence);
      setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast("Memory node refined successfully.", "success");
    } catch (err: any) {
      toast(`Failed to update memory: ${err.message}`, "error");
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleCommandPalette = () => setIsCommandPaletteOpen((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        agents,
        sessions,
        currentSessionId,
        messages,
        memories,
        cascadeRuns,
        isSidebarOpen,
        theme,
        isCommandPaletteOpen,
        activeTab,
        setActiveTab,
        activeAgent,
        isLoadingAgents,
        isLoadingSessions,
        isLoadingMessages,
        isLoadingMemories,
        isSending,
        enableThinking,
        enableSearch,
        useCascadeFlow,
        selectSession,
        createSession,
        deleteSession,
        sendMessage,
        createCustomAgent,
        deleteCustomAgent,
        deleteMemory,
        addManualMemory,
        updateMemory,
        toggleSidebar,
        setTheme,
        toggleCommandPalette,
        setEnableThinking,
        setEnableSearch,
        setUseCascadeFlow,
        loadAllBaseData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
