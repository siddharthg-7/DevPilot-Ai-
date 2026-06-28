export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string; // Lucide icon name or emoji
  model: string;
  systemInstruction: string;
  temperature: number;
  capabilities: string[];
  isCustom: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  thinking?: string; // High-thinking mode reasoning block
  createdAt: string;
  sources?: GroundingSource[];
  cascadeFlowId?: string; // Optional reference to a cascadeflow run
}

export interface MemoryItem {
  id: string;
  content: string;
  category: "preference" | "instruction" | "fact" | "insight";
  createdAt: string;
  confidence: number;
  agentId: string;
}

export interface CascadeStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "active" | "completed" | "failed";
  output?: string;
  duration?: number;
}

export interface CascadeFlowRun {
  id: string;
  prompt: string;
  agentId: string;
  steps: CascadeStep[];
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
}

export interface AppState {
  agents: Agent[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  memories: MemoryItem[];
  cascadeRuns: CascadeFlowRun[];
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  isCommandPaletteOpen: boolean;
}
