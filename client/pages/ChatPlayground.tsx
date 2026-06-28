import { useEffect, useRef, useState } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";
import {
  Send,
  Cpu,
  Globe,
  Activity,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Maximize2,
  Sparkles,
  Terminal,
  Brain,
  TrendingUp,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import Markdown from "react-markdown";
import { InteractiveDemoController } from "../components/InteractiveDemoController.js";
import { MemoryNetworkGraph } from "../components/MemoryNetworkGraph.js";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard.js";
import { DeveloperConsole } from "../components/DeveloperConsole.js";

export function ChatPlayground() {
  const {
    activeAgent,
    messages,
    sendMessage,
    isSending,
    enableThinking,
    setEnableThinking,
    enableSearch,
    setEnableSearch,
    useCascadeFlow,
    setUseCascadeFlow,
    isLoadingMessages,
    setActiveTab,
    sessions,
  } = useAppState();

  const { toast } = useToast();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedThinking, setExpandedThinking] = useState<{ [msgId: string]: boolean }>({});
  const [splitOpen, setSplitOpen] = useState(true);
  const [cockpitTab, setCockpitTab] = useState<"demo" | "hindsight" | "cascade" | "inspector">("demo");

  // Derive the active metadata and content from the last assistant response
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const activeMsgMetadata = (lastAssistantMsg as any)?.metadata || null;
  const activeMsgContent = lastAssistantMsg?.content || "";

  // Auto scroll to bottom when messages load or change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const textToSend = input;
    setInput("");
    await sendMessage(textToSend);
  };

  const toggleThinking = (msgId: string) => {
    setExpandedThinking((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!activeAgent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#09090B] text-zinc-400 font-sans relative overflow-hidden">
        <div className="max-w-md w-full text-center flex flex-col items-center relative z-10">
          <div className="h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 shadow-indigo-600/10">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
            Initialize Workspace
          </h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Aether Agent Platform requires a cognitive driver session to begin processing instructions. Deploy a session from the sidebar or fast-switch using the keyboard command center.
          </p>
          <button
            onClick={() => {
              const root = document.querySelector("[title='Deploy new session']") as HTMLElement;
              root?.click();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            Deploy First Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#09090B] text-zinc-200 relative overflow-hidden font-sans">
      {/* 1. Workspace Header */}
      <header className="px-6 py-4 border-b border-[#18181B] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20 backdrop-blur-sm relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl flex items-center justify-center font-bold text-sm shadow-md shrink-0">
            {activeAgent.name.substring(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight leading-tight">
                {activeAgent.name}
              </h2>
              <span className="text-[9px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 font-mono font-bold leading-none">
                FLASH 2.5
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-none mt-1">{activeAgent.role}</p>
          </div>
        </div>

        {/* Cognitive Toggles */}
        <div className="flex items-center flex-wrap gap-2 md:gap-3">
          {/* Pro Thinking Toggle */}
          <button
            onClick={() => {
              setEnableThinking(!enableThinking);
              if (!enableThinking) {
                toast("High-Thinking Pro mode activated. Invoking gemini-2.5-flash reasoning nodes.", "success");
              } else {
                toast("High-Thinking mode deactivated.", "info");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              enableThinking
                ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-500/5"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200"
            }`}
            title="Invokes 3.1 Pro High-Thinking Reasoning"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>High-Thinking</span>
          </button>

          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => {
              setEnableSearch(!enableSearch);
              if (!enableSearch) {
                toast("Google Search Grounding activated. Live web indexes will be compiled.", "success");
              } else {
                toast("Google Search Grounding deactivated.", "info");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              enableSearch
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-500/5"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200"
            }`}
            title="Activates Google Web Search Grounding"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Web Search</span>
          </button>

          {/* CascadeFlow Toggle */}
          <button
            onClick={() => {
              setUseCascadeFlow(!useCascadeFlow);
              if (!useCascadeFlow) {
                toast("CascadeFlow Execution Pipeline activated. Complex queries will deconstruct into a 4-step logic waterfall.", "success");
              } else {
                toast("CascadeFlow Pipeline deactivated.", "info");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              useCascadeFlow
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-md shadow-amber-500/5"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200"
            }`}
            title="Deconstructs query into a 4-step reasoning pipeline"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>CascadeFlow</span>
          </button>

          {/* System Cockpit Toggle */}
          <button
            onClick={() => setSplitOpen(!splitOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              splitOpen
                ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-500/5"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200"
            }`}
            title="Toggle system cockpit split panel"
          >
            {splitOpen ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
            <span>System Cockpit</span>
          </button>
        </div>
      </header>

      {/* Main workspace dual-pane body container */}
      <div className="flex-1 flex overflow-hidden w-full h-full relative">
        {/* Left: Interactive Chat Canvas */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 relative z-10">
            {isLoadingMessages ? (
              <div className="flex-1 flex flex-col gap-6 items-center justify-center">
                <div className="flex flex-col gap-3 w-full max-w-2xl animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-10 bg-zinc-900 rounded-xl w-full" />
                  <div className="h-24 bg-zinc-900 rounded-xl w-3/4" />
                </div>
                <div className="flex flex-col gap-3 w-full max-w-2xl animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-1/4" />
                  <div className="h-16 bg-zinc-900 rounded-xl w-2/3" />
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
                <Cpu className="h-10 w-10 text-zinc-800 mb-4 animate-pulse" />
                <p className="text-sm text-zinc-300 font-semibold mb-1 font-sans">
                  Enterprise Compliance Workspace
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm font-sans">
                  This environment is loaded with the custom compliance database engine. Use the <strong className="text-indigo-400">System Cockpit Scenarios</strong> panel on the right to instantly test our advanced AI features.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  const isExpanded = expandedThinking[m.id] || false;

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {/* Avatar */}
                      {!isUser && (
                        <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                          {activeAgent.name.substring(0, 1)}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={`max-w-[85%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
                        {/* User Meta / Agent Meta */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 px-1">
                          <span>{isUser ? "OPERATOR (User)" : activeAgent.name.toUpperCase()}</span>
                          <span>•</span>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Content Box */}
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border ${
                            isUser
                              ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                              : "bg-zinc-950/40 border-zinc-900 text-zinc-300"
                          }`}
                        >
                          {/* Accordion Thinking Box */}
                          {m.thinking && (
                            <div className="mb-3.5 border border-indigo-500/20 bg-indigo-500/5 rounded-xl overflow-hidden max-w-2xl w-full">
                              <button
                                onClick={() => toggleThinking(m.id)}
                                className="w-full flex items-center justify-between px-3 py-2 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/10 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
                                  <span>Aether Pro Thinking Core</span>
                                </div>
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>

                              {isExpanded && (
                                <div className="px-3 pb-3 pt-1 border-t border-indigo-500/10 max-h-[200px] overflow-y-auto">
                                  <pre className="text-[11px] font-mono text-indigo-400 whitespace-pre-wrap leading-tight">
                                    {m.thinking}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actual markdown content */}
                          <div className="prose prose-zinc prose-invert text-zinc-200 text-xs max-w-none leading-relaxed">
                            <Markdown>{m.content}</Markdown>
                          </div>

                          {/* Grounds Sources citation links */}
                          {m.sources && m.sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-zinc-900">
                              <span className="text-[10px] font-bold font-mono tracking-wider text-emerald-500 uppercase block mb-1.5">
                                Google Grounding Citations
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {m.sources.map((src, sIdx) => (
                                  <a
                                    key={sIdx}
                                    href={src.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg text-xs font-semibold transition-colors"
                                  >
                                    <Globe className="h-3 w-3 shrink-0" />
                                    <span className="truncate max-w-[120px] text-[10px]">{src.title}</span>
                                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CascadeFlow details reference */}
                          {m.cascadeFlowId && (
                            <div className="mt-3 flex">
                              <button
                                onClick={() => setActiveTab("cascadeflow")}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/25 text-amber-300 hover:bg-amber-500/25 transition-all text-[10px] font-bold rounded-lg cursor-pointer"
                              >
                                <Activity className="h-3 w-3" />
                                <span>Executed via CascadeFlow • View Nodes</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-750 text-zinc-400 flex items-center justify-center shadow-sm mt-1 shrink-0">
                          <User className="h-4.5 w-4.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inference Skeleton Loading indicator */}
            {isSending && (
              <div className="w-full max-w-3xl mx-auto flex gap-4 justify-start">
                <div className="h-8 w-8 rounded-lg bg-zinc-850 border border-zinc-800 text-zinc-300 font-mono font-bold flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                  {activeAgent.name.substring(0, 1)}
                </div>

                <div className="flex-1 flex flex-col gap-2 max-w-[85%] items-start">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activeAgent.name.toUpperCase()} (COMPILING INTELLIGENCE...)
                  </span>

                  <div className="w-full bg-zinc-950/40 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                    {/* Cascade Flow interactive loader */}
                    {useCascadeFlow ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                          <Activity className="h-3.5 w-3.5 animate-spin" />
                          <span>CascadeFlow Pipeline Executing...</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          <div className="h-1 bg-amber-500/30 rounded animate-pulse" />
                          <div className="h-1 bg-amber-500/10 rounded" />
                          <div className="h-1 bg-amber-500/10 rounded" />
                          <div className="h-1 bg-amber-500/10 rounded" />
                        </div>
                        <span className="text-[10px] text-zinc-550 font-mono">
                          Running multi-step pipeline (Planning -&gt; Retrieve -&gt; Exec -&gt; Polishing)
                        </span>
                      </div>
                    ) : (
                      <>
                        {enableThinking && (
                          <div className="h-6 bg-indigo-500/5 border border-indigo-500/10 rounded-lg w-1/2 flex items-center px-2 animate-pulse">
                            <BrainCircuit className="h-3.5 w-3.5 text-indigo-400/40 mr-1.5 animate-spin" />
                            <div className="h-2 bg-indigo-500/10 rounded w-2/3" />
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5 animate-pulse">
                          <div className="h-3 bg-zinc-800 rounded w-full" />
                          <div className="h-3 bg-zinc-800 rounded w-11/12" />
                          <div className="h-3 bg-zinc-800 rounded w-4/5" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer Panel */}
          <footer className="p-4 border-t border-[#18181B] bg-zinc-950/10 shrink-0 relative z-10">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="relative bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-2xl overflow-hidden transition-all shadow-xl">
                {/* Active Subsystem indicator ribbon */}
                <div className="flex items-center gap-3 px-4 py-1.5 bg-zinc-950/40 border-b border-[#18181B] text-[10px] font-mono text-zinc-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cognitive: ACTIVE</span>
                  </span>
                  <span>•</span>
                  {useCascadeFlow ? (
                    <span className="text-amber-400 flex items-center gap-1 font-bold">
                      <Activity className="h-3 w-3" /> CASCADEFLOW ACTIVE
                    </span>
                  ) : (
                    <>
                      {enableThinking && (
                        <span className="text-indigo-400 flex items-center gap-1 font-bold">
                          <BrainCircuit className="h-3 w-3" /> PRO THINKING ACTIVE
                        </span>
                      )}
                      {enableThinking && enableSearch && <span>•</span>}
                      {enableSearch && (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Globe className="h-3 w-3" /> WEB SEARCH ACTIVE
                        </span>
                      )}
                      {!enableThinking && !enableSearch && (
                        <span className="text-zinc-500">STANDARD INFERENCE MODEL</span>
                      )}
                    </>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Instruct ${activeAgent.name}... (Press Enter to send, Shift+Enter for newline)`}
                  className="w-full bg-transparent px-4 py-3.5 text-zinc-100 placeholder-zinc-700 text-xs focus:outline-none resize-none font-sans"
                />

                {/* Composer Footer Actions */}
                <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Press <kbd className="px-1 bg-zinc-850 border border-zinc-700 rounded text-zinc-400">Ctrl+K</kbd> to switch agents instantly
                  </span>

                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                      input.trim() && !isSending
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </footer>
        </div>

        {/* Right Pane: Collapsible Enterprise Control Cockpit */}
        {splitOpen && (
          <div className="w-[380px] lg:w-[420px] border-l border-[#18181B] bg-zinc-950 h-full flex flex-col shrink-0 relative z-20 overflow-y-auto">
            {/* Header / Tabs */}
            <div className="p-4 border-b border-[#18181B] bg-zinc-950 sticky top-0 z-30 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold font-mono tracking-wider text-zinc-450 uppercase flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  System Cockpit
                </span>
                <span className="text-[9px] bg-zinc-900 border border-zinc-850 text-zinc-500 font-mono px-2 py-0.5 rounded-full font-bold">
                  Compliance Hub
                </span>
              </div>
              
              {/* Quick Tab Select */}
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                <button
                  onClick={() => setCockpitTab("demo")}
                  className={`py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                    cockpitTab === "demo" ? "bg-zinc-850 text-indigo-400 font-bold border border-zinc-800/40" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Interactive Scenarios"
                >
                  Scenarios
                </button>
                <button
                  onClick={() => setCockpitTab("hindsight")}
                  className={`py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                    cockpitTab === "hindsight" ? "bg-zinc-850 text-indigo-400 font-bold border border-zinc-800/40" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Memory Graph"
                >
                  Mem Graph
                </button>
                <button
                  onClick={() => setCockpitTab("cascade")}
                  className={`py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                    cockpitTab === "cascade" ? "bg-zinc-850 text-indigo-400 font-bold border border-zinc-800/40" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Runtime & Costs"
                >
                  Metrics
                </button>
                <button
                  onClick={() => setCockpitTab("inspector")}
                  className={`py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                    cockpitTab === "inspector" ? "bg-zinc-850 text-indigo-400 font-bold border border-zinc-800/40" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Context Inspector"
                >
                  Logs
                </button>
              </div>
            </div>

            {/* Active Tab Panel */}
            <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
              {cockpitTab === "demo" && <InteractiveDemoController />}
              {cockpitTab === "hindsight" && <MemoryNetworkGraph />}
              {cockpitTab === "cascade" && <AnalyticsDashboard activeMsgMetadata={activeMsgMetadata} />}
              {cockpitTab === "inspector" && <DeveloperConsole activeMsgMetadata={activeMsgMetadata} activeMsgContent={activeMsgContent} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ChatPlayground;
