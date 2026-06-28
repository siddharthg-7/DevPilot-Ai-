import { Activity, Clock, BadgeCent, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";

interface MetricRowProps {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: string;
}

function MetricCard({ label, value, sub, icon: Icon, color }: MetricRowProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-90 shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
            {label}
          </span>
          <span className="text-sm font-bold text-zinc-200 mt-0.5 block truncate font-mono">
            {value}
          </span>
        </div>
      </div>
      <div className="text-[10px] text-zinc-450 font-mono text-right shrink-0">
        {sub}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ activeMsgMetadata }: { activeMsgMetadata?: any }) {
  // Grab active message details if present, otherwise default to system averages
  const meta = activeMsgMetadata || {
    selectedModel: "gemini-2.5-flash",
    actualCost: 0.00142,
    estimatedCost: 0.00150,
    latency: 1.65,
    budgetRemaining: 242.51,
    qualityScore: 97,
    whySelected: "Baseline architectural compliance orchestration."
  };

  const budgetTotal = 250.00;
  const budgetSpent = budgetTotal - meta.budgetRemaining;
  const budgetPct = (budgetSpent / budgetTotal) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-[#18181B] pb-3 mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
            Runtime & Cost Analytics
          </h3>
          <p className="text-[11px] text-zinc-450 mt-1">
            Real-time telemetry of billing, model selection, latency, and compliance scores.
          </p>
        </div>
        <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Active Node"
          value={meta.selectedModel}
          sub="Orchestrated"
          icon={Activity}
          color="text-indigo-400 bg-indigo-500"
        />

        <MetricCard
          label="Audit Latency"
          value={`${meta.latency.toFixed(2)}s`}
          sub="Compile time"
          icon={Clock}
          color="text-amber-400 bg-amber-500"
        />

        <MetricCard
          label="Actual Session Cost"
          value={`$${meta.actualCost.toFixed(5)}`}
          sub={`Est: $${meta.estimatedCost.toFixed(5)}`}
          icon={BadgeCent}
          color="text-emerald-400 bg-emerald-500"
        />

        <MetricCard
          label="Compliance Assurance"
          value={`${meta.qualityScore}/100`}
          sub="Security index"
          icon={ShieldCheck}
          color="text-sky-400 bg-sky-500"
        />
      </div>

      {/* Active Model Routing Justification */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-[11px] leading-relaxed text-zinc-400">
        <span className="font-bold font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">
          Model Selection Context
        </span>
        <p className="font-sans text-zinc-300">
          {meta.whySelected}
        </p>
      </div>

      {/* Budget Tracker Meter */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 uppercase text-[9px] font-bold tracking-wider">
            Sandbox Billing Limit Caps
          </span>
          <span className="text-zinc-300 font-bold">
            ${meta.budgetRemaining.toFixed(2)} / ${budgetTotal.toFixed(2)} Left
          </span>
        </div>

        {/* Meter bar */}
        <div className="h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${100 - budgetPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Spent: ${budgetSpent.toFixed(2)}</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Budget Safeguards Secured
          </span>
        </div>
      </div>

      {/* Latency Allocation Graph (Waterfalls) */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col gap-3">
        <span className="text-zinc-500 font-mono text-[9px] uppercase font-bold tracking-wider block">
          Telemetry Latency Breakdown (Waterfalls)
        </span>

        <div className="flex flex-col gap-2.5 text-[10px] font-mono">
          {/* Step 1 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>1. Cognitive Intent Analysis</span>
              <span className="text-zinc-500">12%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500/80 rounded-full" style={{ width: "12%" }} />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>2. Memory Vault Grounding</span>
              <span className="text-zinc-500">18%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500/80 rounded-full" style={{ width: "18%" }} />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>3. Primary Model Inference</span>
              <span className="text-zinc-500">60%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500/80 rounded-full" style={{ width: "60%" }} />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span>4. Quality Alignment / Reflection</span>
              <span className="text-zinc-500">10%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500/80 rounded-full" style={{ width: "10%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
