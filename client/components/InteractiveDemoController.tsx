import { useState } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";
import { Play, Sparkles, Brain, Cpu, ShieldAlert, BadgeCent, Activity } from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  badge: string;
  badgeColor: string;
  icon: any;
  description: string;
  outcome: string;
}

export function InteractiveDemoController() {
  const { selectSession, setActiveTab, loadAllBaseData } = useAppState();
  const { toast } = useToast();
  const [runningId, setRunningId] = useState<number | null>(null);

  const scenarios: Scenario[] = [
    {
      id: 1,
      title: "1st Interaction (Standard Bypass)",
      badge: "No Memory",
      badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
      icon: ShieldAlert,
      description: "User requests a code review. Lacking active hindsight memories, the cheap Flash model reviews basic syntax but misses tribal standard policies completely.",
      outcome: "Outcomes are generic. Non-compliance rate-limiting violations slip through unnoticed."
    },
    {
      id: 2,
      title: "5th Interaction (Cognitive Hindsight)",
      badge: "Hindsight Personalized",
      badgeColor: "bg-indigo-950/40 text-indigo-300 border-indigo-900/30",
      icon: Brain,
      description: "Identical review query. Hindsight automatically retrieves relevant Redis limits and transaction retry policies from the memory vault, injecting them into the system instruction.",
      outcome: "Code is strictly rejected. Pro model generates custom compliant refactored solutions."
    },
    {
      id: 3,
      title: "Model Cost Optimization Check",
      badge: "Cost-Optimized Flash",
      badgeColor: "bg-emerald-950/40 text-emerald-300 border-emerald-900/30",
      icon: BadgeCent,
      description: "A simple utility closure syntax check is dispatched. CascadeFlow intelligence routes to Gemini 3.5 Flash directly, avoiding billing overload.",
      outcome: "98.5% cost reduction achieved in 180ms without sacrificing analytical precision."
    },
    {
      id: 4,
      title: "Budget-Aware SOC2 Audit Escalation",
      badge: "Complexity Escalated",
      badgeColor: "bg-amber-950/40 text-amber-300 border-amber-900/30",
      icon: Cpu,
      description: "An intricate OAuth token cryptographic audit is requested. The orchestrator automatically flags critical risk thresholds, escalating from standard Flash to Gemini 3.1 Pro.",
      outcome: "In-depth cryptographic audit trace generated with complete budget verification and reasoning steps."
    },
    {
      id: 5,
      title: "Active Preference Overrides",
      badge: "Drizzle Schema Alignment",
      badgeColor: "bg-sky-950/40 text-sky-300 border-sky-900/30",
      icon: Sparkles,
      description: "The user asks to refactor a database schema. Knowing the team hates Prisma and prefers Drizzle (recalled from active memories), it overrides defaults.",
      outcome: "Outputs clean Drizzle Pg-Core structures directly instead of typical Prisma templates."
    },
    {
      id: 6,
      title: "End-to-End Cascade Flow Audit",
      badge: "Fully Auditable Run",
      badgeColor: "bg-rose-950/40 text-rose-300 border-rose-900/30",
      icon: Activity,
      description: "Deconstructs a complex pool allocation request into 4 distinct pipeline steps: Planning -> Retrieval -> Execution -> Refinement.",
      outcome: "Provides step-by-step latency, cost allocation, and micro-cognitive reflection details."
    }
  ];

  const handlePlayScenario = async (scenarioId: number) => {
    setRunningId(scenarioId);
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioId })
      });

      if (!res.ok) {
        throw new Error("Failed to seed demo state.");
      }

      const data = await res.json();
      
      // Reload sessions globally
      await loadAllBaseData();
      
      // Select the newly created demo session
      await selectSession(data.sessionId);
      
      // Jump to Chat tab
      setActiveTab("chat");
      
      toast(`Scenario ${scenarioId} successfully seeded! Check the System Cockpit panel on the right.`, "success");
    } catch (err: any) {
      toast(err.message || "Error running demo scenario", "error");
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-zinc-300">
      <div className="border-b border-[#18181B] pb-3 mb-2">
        <h3 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
          Enterprise Workflow Controller
        </h3>
        <p className="text-[11px] text-zinc-450 mt-1">
          Click any scenario to programmatically seed SQLite, load the audit history, and monitor runtime stats.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrentRunning = runningId === sc.id;

          return (
            <div
              key={sc.id}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-3.5 rounded-xl transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg group-hover:border-zinc-700 transition-colors shrink-0 text-zinc-400 group-hover:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold text-zinc-200 tracking-tight block">
                      {sc.title}
                    </span>
                    <span className={`px-1.5 py-0.5 border rounded text-[8px] font-mono font-bold tracking-wide ${sc.badgeColor}`}>
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-sans mb-2">
                    {sc.description}
                  </p>
                  <p className="text-[10px] text-indigo-400/80 font-mono flex items-center gap-1 leading-snug">
                    <span className="font-bold">OUTCOME:</span> {sc.outcome}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-zinc-900/60 mt-3 pt-2">
                <button
                  disabled={runningId !== null}
                  onClick={() => handlePlayScenario(sc.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md shadow-indigo-600/5 cursor-pointer"
                >
                  {isCurrentRunning ? (
                    <span className="h-2.5 w-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 fill-current" />
                  )}
                  <span>{isCurrentRunning ? "Seeding..." : "Launch Demo Scenario"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
