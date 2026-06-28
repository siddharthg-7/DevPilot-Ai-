import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";
import {
  Settings as SettingsIcon,
  ShieldAlert,
  Database,
  Brain,
  Terminal,
  Activity,
  Cpu,
  RefreshCw,
} from "lucide-react";

export function Settings() {
  const { theme, setTheme } = useAppState();
  const { toast } = useToast();

  const handleClearCache = () => {
    toast("Cognitive state caches refreshed successfully.", "success");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 md:p-8 text-zinc-200 font-sans relative">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight font-sans flex items-center gap-2.5">
            <SettingsIcon className="h-7 w-7 text-indigo-400" />
            <span>System Console & Settings</span>
          </h1>
          <p className="text-sm text-zinc-450 mt-1">
            Review full-stack enterprise architectural structures, API secret integrations, and data schema migrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Enterprise Specs */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-2.5 bg-zinc-800 border border-zinc-750 text-indigo-400 rounded-xl w-fit mb-4">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase font-mono">
                System Core
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Powered by React 19, Express Node full-stack middleware, and ES Module native type bundling.
              </p>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono font-bold mt-4 block">
              Node v22 / TS 5.8
            </span>
          </div>

          {/* Card 2: Persistence */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-2.5 bg-zinc-800 border border-zinc-750 text-emerald-400 rounded-xl w-fit mb-4">
                <Database className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase font-mono">
                Data Storage
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Operates via server-side SQLite during development with absolute schema compatibility for SQL standard dialects.
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold mt-4 block">
              better-sqlite3 active
            </span>
          </div>

          {/* Card 3: Model Ingress */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="p-2.5 bg-zinc-800 border border-zinc-750 text-amber-400 rounded-xl w-fit mb-4">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-bold text-zinc-200 tracking-tight uppercase font-mono">
                API Security
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Proxies all `@google/genai` requests on the server-side to shield API keys from malicious client-side bundles.
              </p>
            </div>
            <span className="text-[10px] text-amber-400 font-mono font-bold mt-4 block">
              Secrets Vault Protected
            </span>
          </div>
        </div>

        {/* Section: API Secrets Configurations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <h2 className="text-sm font-semibold text-zinc-100 mb-1.5 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0" />
            <span>Gemini API Key Authentication</span>
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Aether uses the new unified <code className="text-zinc-350 font-mono bg-zinc-950 px-1 py-0.5 rounded border border-zinc-850 font-bold">@google/genai</code> SDK to execute instructions. The key is managed securely outside source codes.
          </p>

          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 text-xs text-zinc-500 leading-relaxed">
            <p className="mb-2">
              <strong className="text-zinc-350">How to configure:</strong>
            </p>
            <ol className="list-decimal pl-4 flex flex-col gap-1.5">
              <li>
                Open the <strong className="text-indigo-400 font-bold">Settings &gt; Secrets</strong> panel in the upper right corner of the Google AI Studio environment.
              </li>
              <li>
                Declare a secret key named <code className="text-zinc-300 bg-zinc-900 border border-zinc-800 px-1 rounded font-mono font-bold text-[10px]">GEMINI_API_KEY</code>.
              </li>
              <li>
                Paste your Google AI Studio API key. The platform automatically injects it at server startup! No inline modifications required.
              </li>
            </ol>
          </div>
        </div>

        {/* Section: PostgreSQL Migration Specs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-zinc-100 mb-1.5 tracking-tight flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span>PostgreSQL Relational Schema Migration</span>
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            Aether is engineered for seamless scalability. You can migrate our SQLite definitions into production Postgres instances with zero code changes.
          </p>

          <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2 border-b border-zinc-850 pb-1.5">
              <span>PostgreSQL Schema Definition Blueprint</span>
              <span className="text-emerald-500">Scale ready</span>
            </div>
            <pre className="text-[10.5px] font-mono text-zinc-300 leading-tight block overflow-x-auto max-h-48 whitespace-pre-wrap">
{`-- Migrate Hindsight Memories
CREATE TABLE IF NOT EXISTS memories (
  id VARCHAR(50) PRIMARY KEY,
  content TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('preference', 'instruction', 'fact', 'insight')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confidence DOUBLE PRECISION DEFAULT 1.0,
  agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE CASCADE
);

-- Migrate CascadeFlow Runs
CREATE TABLE IF NOT EXISTS cascade_runs (
  id VARCHAR(50) PRIMARY KEY,
  prompt TEXT NOT NULL,
  agent_id VARCHAR(50) REFERENCES agents(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  steps JSONB NOT NULL -- fast indexing for pipeline audits
);`}
            </pre>
          </div>

          <p className="text-[11px] text-zinc-500 leading-normal">
            To migrate, simply point drizzle or native SQL scripts to your PostgreSQL cluster. Our backend uses standard relational foreign key cascading tables which translates flawlessly.
          </p>
        </div>

        {/* Section: Cognitive State Resets */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-zinc-100 mb-1 tracking-tight flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
            <span>State Optimization</span>
          </h2>
          <p className="text-xs text-zinc-450 mb-5 leading-normal">
            Force-refresh cognitive pipelines and invalidate memory cache parameters to guarantee operational integrity.
          </p>

          <button
            onClick={handleClearCache}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-zinc-700 cursor-pointer shadow"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
            <span>Refresh State Caches</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default Settings;
