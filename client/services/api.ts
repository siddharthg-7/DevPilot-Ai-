import { Agent, ChatSession, ChatMessage, MemoryItem, CascadeFlowRun } from "../types/index.js";

const API_BASE = "/api";

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`);
  if (!res.ok) throw new Error("Failed to load agents");
  return res.json();
}

export async function createAgent(agent: Omit<Agent, "id" | "isCustom">): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agent),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create agent");
  }
  return res.json();
}

export async function deleteAgent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/agents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete agent");
}

export async function fetchSessions(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error("Failed to load sessions");
  return res.json();
}

export async function createSession(title: string, agentId: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, agentId }),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete session");
}

export async function fetchMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json();
}

export interface ChatSendResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  cascadeFlow?: CascadeFlowRun;
}

export async function sendChatMessage({
  sessionId,
  agentId,
  message,
  enableThinking,
  enableSearch,
  useCascadeFlow,
}: {
  sessionId: string;
  agentId: string;
  message: string;
  enableThinking: boolean;
  enableSearch: boolean;
  useCascadeFlow: boolean;
}): Promise<ChatSendResponse> {
  const res = await fetch(`${API_BASE}/chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      agentId,
      message,
      enableThinking,
      enableSearch,
      useCascadeFlow,
    }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to send message");
  }
  return res.json();
}

export async function fetchMemories(): Promise<MemoryItem[]> {
  const res = await fetch(`${API_BASE}/memories`);
  if (!res.ok) throw new Error("Failed to load memories");
  return res.json();
}

export async function createMemory(content: string, category: string, agentId?: string): Promise<MemoryItem> {
  const res = await fetch(`${API_BASE}/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, category, agentId }),
  });
  if (!res.ok) throw new Error("Failed to save memory");
  return res.json();
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/memories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete memory");
}

export async function updateMemory(id: string, content: string, category: string, confidence: number): Promise<MemoryItem> {
  const res = await fetch(`${API_BASE}/memories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, category, confidence }),
  });
  if (!res.ok) throw new Error("Failed to update memory");
  return res.json();
}

export async function fetchCascadeFlowRuns(): Promise<CascadeFlowRun[]> {
  const res = await fetch(`${API_BASE}/cascade-runs`);
  if (!res.ok) throw new Error("Failed to load runs");
  return res.json();
}

export async function fetchCascadeFlowRunDetails(id: string): Promise<CascadeFlowRun> {
  const res = await fetch(`${API_BASE}/cascade-runs/${id}`);
  if (!res.ok) throw new Error("Failed to load run details");
  return res.json();
}
