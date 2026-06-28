import { useState } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";
import {
  Cpu,
  Plus,
  Trash2,
  Sliders,
  Settings,
  MessageSquare,
  ShieldAlert,
  Brain,
  Globe,
  Award,
} from "lucide-react";
import { Agent } from "../types/index.js";

export function AgentHub() {
  const { agents, createCustomAgent, deleteCustomAgent, createSession, setActiveTab } = useAppState();
  const { toast } = useToast();

  const [isDeploying, setIsDeploying] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [capabilities, setCapabilities] = useState<string[]>(["Hindsight Memory"]);

  const handleDeployAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !description.trim() || !systemInstruction.trim()) {
      toast("Please fulfill all core specifications.", "error");
      return;
    }

    try {
      await createCustomAgent({
        name: name.trim(),
        role: role.trim(),
        description: description.trim(),
        model,
        avatar: "Cpu",
        systemInstruction: systemInstruction.trim(),
        temperature,
        capabilities,
      });

      // Reset
      setName("");
      setRole("");
      setDescription("");
      setSystemInstruction("");
      setTemperature(0.7);
      setCapabilities(["Hindsight Memory"]);
      setIsDeploying(false);
    } catch (err) {}
  };

  const handleToggleCapability = (cap: string) => {
    if (capabilities.includes(cap)) {
      setCapabilities((prev) => prev.filter((c) => c !== cap));
    } else {
      setCapabilities((prev) => [...prev, cap]);
    }
  };

  const handleInitializeSession = async (agent: Agent) => {
    try {
      const sessId = await createSession(`Chat with ${agent.name}`, agent.id);
      setActiveTab("chat");
    } catch (err) {}
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-6 md:p-8 text-zinc-200 font-sans relative">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight font-sans">
              Agent Deployment Hub
            </h1>
            <p className="text-sm text-zinc-450">
              Provision, configure, and orchestrate specialized cognitive driver environments.
            </p>
          </div>
          <button
            onClick={() => setIsDeploying(!isDeploying)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Deploy Custom Intelligence</span>
          </button>
        </div>

        {/* Deploy Agent Form (Collapsible Overlay Panel) */}
        {isDeploying && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-md font-semibold text-zinc-100 mb-1 tracking-tight">
              Provision Cognitive Agent Blueprint
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              Establish identity specifications, instruction matrices, and capability authorizations.
            </p>

            <form onSubmit={handleDeployAgent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-1.5">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hephaestus"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-1.5">
                    Domain Role / Focus
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Database Engineering Strategist"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-1.5">
                    Strategic Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how this agent assists the user..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-1.5">
                      Base Model Engine
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Resilient & Fast)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-1.5 flex justify-between">
                      <span>Inference Temp</span>
                      <span className="font-sans text-indigo-400 font-bold">{temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex-1 flex flex-col min-h-0">
                  <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-1.5">
                    Core System Instruction Matrix
                  </label>
                  <textarea
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    rows={6}
                    placeholder="Specify character persona directives, guardrails, and instruction boundaries..."
                    className="w-full flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-550 uppercase block mb-2">
                    Authorized Subsystems
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Hindsight Memory", "Web Search", "Code Generation", "Performance Diagnostics"].map((cap) => {
                      const active = capabilities.includes(cap);
                      return (
                        <button
                          key={cap}
                          type="button"
                          onClick={() => handleToggleCapability(cap)}
                          className={`px-3 py-1.5 border rounded-xl text-xs transition-all cursor-pointer ${
                            active
                              ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300"
                              : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          }`}
                        >
                          {cap}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 border-t border-zinc-800 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeploying(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-all border border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10"
                >
                  Deploy Intelligence Matrix
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 rounded-2xl p-5 shadow-lg flex flex-col relative overflow-hidden transition-all group"
            >
              {/* Head Section */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
                    {agent.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight leading-tight">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-medium leading-none mt-1">{agent.role}</p>
                  </div>
                </div>

                {agent.isCustom ? (
                  <button
                    onClick={() => deleteCustomAgent(agent.id)}
                    className="p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 border border-rose-500/10 hover:border-rose-500/25 transition-all cursor-pointer shrink-0"
                    title="Offload custom agent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span className="text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold px-2 py-0.5 rounded font-mono">
                    SYSTEM
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 flex-1 leading-relaxed mb-4">
                {agent.description}
              </p>

              {/* Capabilities and Specs info */}
              <div className="flex flex-col gap-2.5 mb-5 border-t border-zinc-800 pt-3 text-[11px]">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="font-medium">Engine Config</span>
                  <span className="font-mono text-zinc-300 font-medium">{agent.model}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="font-medium">System Temp</span>
                  <span className="font-mono text-zinc-300 font-medium">{agent.temperature}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-500 block mb-1.5">Authorized Systems</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-lg text-[10px] font-semibold"
                      >
                        {cap === "Hindsight Memory" && <Brain className="h-2.5 w-2.5 text-indigo-400" />}
                        {cap === "Web Search" && <Globe className="h-2.5 w-2.5 text-emerald-400" />}
                        {cap !== "Hindsight Memory" && cap !== "Web Search" && <Award className="h-2.5 w-2.5 text-sky-400" />}
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => handleInitializeSession(agent)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 font-semibold text-xs rounded-xl border border-zinc-700 transition-all cursor-pointer shadow-md"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Initialize Cognitive Session</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AgentHub;
