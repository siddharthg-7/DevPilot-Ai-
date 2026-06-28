import { useState } from "react";
import { Terminal, Copy, Shield, GitFork, History, FileCode, CheckCircle } from "lucide-react";
import { useToast } from "../providers/ToastProvider.js";

interface Version {
  v: string;
  date: string;
  author: string;
  prompt: string;
}

export function DeveloperConsole({ activeMsgMetadata, activeMsgContent }: { activeMsgMetadata?: any; activeMsgContent?: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"context" | "prompt" | "steps">("context");

  const meta = activeMsgMetadata || {
    escalationEvents: "None",
    fallbackEvents: "None",
    routingDecision: "Standard system prompt validation",
    retainedFacts: [],
    recalledContext: "No specialized memories triggered for this interaction.",
    reflectionHistory: ["Syntax validation passed", "Structural standard checked"]
  };

  const systemInstruction = `You are Astraea, the Principal AI Solutions Architect & Lead Compliance Auditor.
Your workspace constraints are continuously personalized by the Aether Hindsight Memory subsystem.
Do not provide generic Node.js code templates if custom memories establish local organizational standards (e.g., Redis limiting, Drizzle overrides).
Output reviews strictly labeling 'APPROVED' or 'CRITICAL REJECTION' to enforce standards.`;

  const promptVersions: Version[] = [
    {
      v: "v1.2.0 (Active)",
      date: "2026-06-25",
      author: "Solon (Optimizer)",
      prompt: "Review the provided Express code handler block for compliance with our active Hindsight memories. Highlight rate limiting (Sec 4.1) and db transactional pool wrappers."
    },
    {
      v: "v1.1.0",
      date: "2026-06-18",
      author: "Astraea (Architect)",
      prompt: "Check the Express controller for syntax security and general standards."
    },
    {
      v: "v1.0.0",
      date: "2026-05-10",
      author: "System Core",
      prompt: "Perform general code review."
    }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied code to clipboard!", "success");
  };

  return (
    <div className="flex flex-col gap-4 text-zinc-300">
      <div className="border-b border-[#18181B] pb-3 mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
            Context & Execution Inspector
          </h3>
          <p className="text-[11px] text-zinc-450 mt-1">
            Audit the exact parameters, systems instructions, and reflection logs driving this interaction.
          </p>
        </div>
        <Terminal className="h-4.5 w-4.5 text-indigo-400" />
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-950 border border-zinc-900 rounded-lg p-0.5">
        <button
          onClick={() => setActiveTab("context")}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "context" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Context
        </button>
        <button
          onClick={() => setActiveTab("prompt")}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "prompt" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Prompt History
        </button>
        <button
          onClick={() => setActiveTab("steps")}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "steps" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Reflection Logs
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "context" && (
        <div className="flex flex-col gap-3.5">
          {/* Active System Instruction */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
            <div className="flex items-center justify-between text-zinc-500 mb-1.5">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Active System Instructions</span>
              <button onClick={() => handleCopy(systemInstruction)} className="p-1 hover:text-zinc-300 transition-colors">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <pre className="text-[9.5px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap select-all">
              {systemInstruction}
            </pre>
          </div>

          {/* Dynamic Recalled Contexts */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
              Recalled Cognitive Hindsight Context
            </span>
            <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-[10px] text-zinc-300 leading-relaxed font-sans">
              {meta.recalledContext}
              {meta.retainedFacts && meta.retainedFacts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-800 flex flex-col gap-1 text-[9px] font-mono">
                  <span className="text-indigo-400 font-bold block uppercase tracking-wider text-[8px]">Injected Rule nodes:</span>
                  {meta.retainedFacts.map((fact: string, idx: number) => (
                    <span key={idx} className="flex items-center gap-1 text-zinc-400">
                      • {fact}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Raw User Query */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
              Sanitized Prompt Parameters
            </span>
            <p className="text-[10px] font-sans text-zinc-400 truncate">
              {activeMsgContent ? `"${activeMsgContent.substring(0, 150)}..."` : '"Please review our payment handler checkout controller..."'}
            </p>
          </div>
        </div>
      )}

      {activeTab === "prompt" && (
        <div className="flex flex-col gap-3">
          {promptVersions.map((v, i) => (
            <div key={i} className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex flex-col gap-2 relative">
              <div className="flex items-center justify-between text-[10px]">
                <span className={`font-mono font-bold ${i === 0 ? "text-indigo-400" : "text-zinc-500"}`}>
                  {v.v}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {v.date} by {v.author}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-zinc-400 font-sans">
                "{v.prompt}"
              </p>
              {i === 0 && (
                <span className="absolute bottom-3 right-3 text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1.5 py-0.5 rounded-full border border-emerald-900/30">
                  Active in Session
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "steps" && (
        <div className="flex flex-col gap-3">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col gap-3">
            <span className="text-zinc-500 font-mono text-[9px] uppercase font-bold tracking-wider block">
              Cognitive Reflection History
            </span>

            <div className="relative border-l border-zinc-800 ml-2 pl-4 flex flex-col gap-4">
              {meta.reflectionHistory && meta.reflectionHistory.map((step: string, idx: number) => (
                <div key={idx} className="relative text-[10px] font-sans text-zinc-300">
                  <div className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full bg-zinc-950 border border-indigo-500 flex items-center justify-center">
                    <CheckCircle className="h-2 w-2 text-indigo-400 fill-current" />
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 block">Step {idx + 1}</span>
                  <p className="mt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sandbox Escalation Parameters */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 grid grid-cols-2 gap-4 text-[10px] font-mono">
            <div>
              <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-bold block mb-0.5">Escalation State:</span>
              <span className={`font-bold ${meta.escalationEvents !== "None" ? "text-amber-400" : "text-zinc-400"}`}>
                {meta.escalationEvents}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase text-[8px] tracking-wider font-bold block mb-0.5">Fallback State:</span>
              <span className="font-bold text-zinc-400">
                {meta.fallbackEvents}
              </span>
            </div>
            <div className="col-span-2 border-t border-zinc-900 pt-2 flex items-center justify-between">
              <span>Routing Decisions:</span>
              <span className="text-indigo-400 font-bold">{meta.routingDecision}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fork Section / Branching */}
      <div className="border-t border-zinc-900 pt-4 mt-1 flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <GitFork className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-200">Conversation Branching</span>
        </div>
        <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
          Need to experiment with a different direction? Branch/fork the thread from this specific checkpoint to spin up a child audit session in SQLite.
        </p>
        <button
          onClick={() => toast("Created conversational child fork in database!", "success")}
          className="flex items-center justify-center gap-1.5 w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 py-2 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
        >
          <GitFork className="h-3.5 w-3.5" />
          <span>Fork Conversation from Checkpoint</span>
        </button>
      </div>
    </div>
  );
}
