import { useState, useEffect } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import {
  Activity,
  Cpu,
  Clock,
  CheckCircle,
  Play,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { CascadeFlowRun } from "../types/index.js";
import * as api from "../services/api.js";

export function CascadeMonitor() {
  const { cascadeRuns, agents, setActiveTab } = useAppState();
  const [expandedRuns, setExpandedRuns] = useState<{ [id: string]: boolean }>({});
  const [localRuns, setLocalRuns] = useState<CascadeFlowRun[]>(cascadeRuns);

  // Sync state if global list changes
  useEffect(() => {
    setLocalRuns(cascadeRuns);
  }, [cascadeRuns]);

  // Expand helper
  const toggleRun = (id: string) => {
    setExpandedRuns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper to calculate total runtime
  const calculateTotalTime = (steps: any[]) => {
    return steps.reduce((sum, s) => sum + (s.duration || 0), 0);
  };

  // Compute stats
  const totalRunsCount = localRuns.length;
  const completedRunsCount = localRuns.filter((r) => r.status === "completed").length;
  const successRate = totalRunsCount > 0 ? Math.round((completedRunsCount / totalRunsCount) * 100) : 100;

  const totalRuntimeSum = localRuns.reduce((sum, r) => sum + calculateTotalTime(r.steps), 0);
  const avgDuration = totalRunsCount > 0 ? (totalRuntimeSum / totalRunsCount / 1000).toFixed(2) : "0.00";

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 md:p-8 text-zinc-200 font-sans relative">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight font-sans flex items-center gap-2.5">
              <Activity className="h-7 w-7 text-amber-400" />
              <span>cascadeflow Runtime Intelligence</span>
            </h1>
            <p className="text-sm text-zinc-450 mt-1">
              Deconstruct complex prompt intents into four cascading cognitive nodes. Monitor latency and plan outcomes.
            </p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 border border-zinc-750 rounded-xl text-amber-400 shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                Total Cascade Pipeline Executions
              </span>
              <span className="text-xl font-bold text-zinc-150 font-mono mt-0.5 block">
                {totalRunsCount} runs
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 border border-zinc-750 rounded-xl text-emerald-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                Node Convergence Rate
              </span>
              <span className="text-xl font-bold text-zinc-150 font-mono mt-0.5 block">
                {successRate}% Success
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-zinc-800 border border-zinc-750 rounded-xl text-sky-400 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                Mean Pipeline Latency
              </span>
              <span className="text-xl font-bold text-zinc-150 font-mono mt-0.5 block">
                {avgDuration}s
              </span>
            </div>
          </div>
        </div>

        {/* Cascade Runs Log */}
        {localRuns.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Flame className="h-8 w-8 text-zinc-650 mx-auto mb-4 animate-pulse" />
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">
              Runtime Log Clear
            </h3>
            <p className="text-xs text-zinc-550 max-w-sm mx-auto leading-relaxed mb-4">
              CascadeFlow is deactivated by default to conserve latency. Toggle the "CascadeFlow" execution trigger in the chat headers to deconstruct complex queries!
            </p>
            <button
              onClick={() => setActiveTab("chat")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-zinc-700 cursor-pointer"
            >
              <Play className="h-3 w-3" /> Execute First Pipeline
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {localRuns.map((run) => {
              const runAgent = agents.find((a) => a.id === run.agentId);
              const totalDurationMs = calculateTotalTime(run.steps);
              const isExpanded = expandedRuns[run.id] || false;

              return (
                <div
                  key={run.id}
                  className="bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-2xl overflow-hidden shadow-lg transition-all"
                >
                  {/* Summary row */}
                  <button
                    onClick={() => toggleRun(run.id)}
                    className="w-full flex items-start md:items-center justify-between p-5 text-left transition-colors hover:bg-zinc-800/20"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider ${
                          run.status === "completed"
                            ? "bg-emerald-950/10 text-emerald-400 border border-emerald-900/20"
                            : run.status === "running"
                              ? "bg-amber-950/10 text-amber-400 border border-amber-900/20 animate-pulse"
                              : "bg-rose-950/10 text-rose-400 border border-rose-900/20"
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ID: {run.id}
                        </span>
                        <span className="text-zinc-700 text-[10px]">•</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Driver: {runAgent ? runAgent.name : "Aether Core"}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-zinc-150 line-clamp-1 leading-relaxed">
                        "{run.prompt}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                          Pipeline latency
                        </span>
                        <span className="text-xs font-bold text-zinc-300 font-mono mt-0.5 block">
                          {(totalDurationMs / 1000).toFixed(2)}s
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                    </div>
                  </button>

                  {/* Expanded timeline details */}
                  {isExpanded && (
                    <div className="border-t border-zinc-850 bg-zinc-950/40 p-5">
                      <h4 className="text-[10px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-4">
                        Pipeline Nodes Execution Timeline
                      </h4>

                      <div className="relative border-l border-zinc-800 pl-6 ml-3 flex flex-col gap-6">
                        {run.steps.map((step, sIdx) => {
                          const isActive = step.status === "active";
                          const isCompleted = step.status === "completed";
                          const isFailed = step.status === "failed";

                          return (
                            <div key={step.id} className="relative">
                              {/* Glowing Status Dot */}
                              <div className={`absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all bg-zinc-950 ${
                                isCompleted
                                  ? "border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/10"
                                  : isActive
                                    ? "border-amber-550 text-amber-400 shadow-md shadow-amber-500/20 animate-pulse"
                                    : isFailed
                                      ? "border-rose-500 text-rose-400"
                                      : "border-zinc-800 text-zinc-650"
                              }`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${
                                  isCompleted
                                    ? "bg-emerald-400"
                                    : isActive
                                      ? "bg-amber-400"
                                      : isFailed
                                        ? "bg-rose-400"
                                        : "bg-zinc-800"
                                }`} />
                              </div>

                              {/* Node Information */}
                              <div className="flex flex-col gap-1 md:flex-row md:items-start justify-between">
                                <div className="flex-1">
                                  <span className={`text-xs font-semibold leading-none ${isActive ? "text-amber-400" : isCompleted ? "text-zinc-200" : "text-zinc-500"}`}>
                                    {step.label}
                                  </span>
                                  <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                                    {step.description}
                                  </p>

                                  {/* Step output summary if completed */}
                                  {step.output && (
                                    <div className="mt-2.5 bg-zinc-950 border border-zinc-850 rounded-xl p-3 max-w-2xl">
                                      <span className="text-[9px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1">
                                        Node payload outcome
                                      </span>
                                      <p className="text-[11px] text-zinc-300 font-mono leading-tight whitespace-pre-wrap">
                                        {step.output}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <span className="text-[10px] text-zinc-500 font-mono mt-1 shrink-0">
                                  {step.duration ? `+${(step.duration / 1000).toFixed(2)}s` : "--"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default CascadeMonitor;
