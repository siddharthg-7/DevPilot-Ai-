import { useState, useEffect } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import { useToast } from "../providers/ToastProvider.js";
import { AnimatePresence, motion } from "motion/react";
import {
  Brain,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Bookmark,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Search,
  Filter,
  TrendingUp,
  Sliders,
  ChevronRight,
  Edit2,
  Check,
  RefreshCw,
  Layers,
  Activity,
  ArrowRight,
  Info
} from "lucide-react";

// Circular confidence indicator component
function CircularConfidenceGauge({ 
  confidence, 
  size = 90, 
  strokeWidth = 7, 
  showGlow = true 
}: { 
  confidence: number; 
  size?: number; 
  strokeWidth?: number; 
  showGlow?: boolean; 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (confidence * circumference);
  
  // Custom theme colors based on score
  let strokeColor = "#f59e0b"; // amber
  let textColor = "text-amber-400";
  let textLabel = "Unstable";

  if (confidence >= 0.85) {
    strokeColor = "#10b981"; // emerald
    textColor = "text-emerald-400";
    textLabel = "Cardinal";
  } else if (confidence >= 0.55) {
    strokeColor = "#6366f1"; // indigo
    textColor = "text-indigo-400";
    textLabel = "Reinforced";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-zinc-850"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ 
            stroke: strokeColor,
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: showGlow ? `drop-shadow(0 0 3px ${strokeColor}44)` : "none"
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-base font-bold font-mono tracking-tighter ${textColor}`}>
          {Math.round(confidence * 100)}%
        </span>
        <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">
          {textLabel}
        </span>
      </div>
    </div>
  );
}

export function MemoryVault() {
  const { memories, addManualMemory, updateMemory, deleteMemory, agents, isLoadingMemories } = useAppState();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"preference" | "instruction" | "fact" | "insight">("preference");
  
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "preference" | "instruction" | "fact" | "insight">("all");
  
  // Selected memory for Timeline Evolution Side-panel
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);

  // Inline editing state for the detailed panel
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<"preference" | "instruction" | "fact" | "insight">("preference");
  const [editConfidence, setEditConfidence] = useState(1.0);

  // Auto-select first memory when list loads
  useEffect(() => {
    if (memories.length > 0 && !selectedMemoryId) {
      setSelectedMemoryId(memories[0].id);
    }
  }, [memories, selectedMemoryId]);

  // Handle selected memory changes to prefill editor
  const selectedMemory = memories.find((m) => m.id === selectedMemoryId) || (memories.length > 0 ? memories[0] : null);

  useEffect(() => {
    if (selectedMemory) {
      setEditContent(selectedMemory.content);
      setEditCategory(selectedMemory.category);
      setEditConfidence(selectedMemory.confidence);
      setIsEditing(false);
    }
  }, [selectedMemoryId, selectedMemory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast("Memory statement cannot be blank.", "error");
      return;
    }

    try {
      await addManualMemory(content.trim(), category);
      setContent("");
      setIsAdding(false);
    } catch (err) {}
  };

  const handleUpdate = async () => {
    if (!selectedMemory) return;
    if (!editContent.trim()) {
      toast("Memory content cannot be empty", "error");
      return;
    }
    try {
      await updateMemory(selectedMemory.id, editContent.trim(), editCategory, editConfidence);
      setIsEditing(false);
    } catch (err) {}
  };

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "preference":
        return "bg-purple-950/20 border-purple-900/45 text-purple-300";
      case "instruction":
        return "bg-amber-950/20 border-amber-900/45 text-amber-300";
      case "fact":
        return "bg-emerald-950/20 border-emerald-900/45 text-emerald-300";
      case "insight":
        return "bg-sky-950/20 border-sky-900/45 text-sky-300";
      default:
        return "bg-zinc-800 border-zinc-700 text-zinc-300";
    }
  };

  // Filter memories
  const filteredMemories = memories.filter((mem) => {
    const matchesSearch = mem.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || mem.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate simulated but context-realistic 3-stage evolution timeline
  const getEvolutionStages = (mem: typeof selectedMemory) => {
    if (!mem) return [];
    const dateObj = new Date(mem.createdAt);
    const formatDate = (hoursAgo: number) => {
      const d = new Date(dateObj.getTime() - hoursAgo * 60 * 60 * 1000);
      return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const currentConf = mem.confidence;
    const initialConf = Math.min(Math.round(currentConf * 45), 45) / 100;
    const reinforcedConf = Math.min(Math.round(currentConf * 78), 75) / 100;

    return [
      {
        id: "step1",
        stage: "Stage 1: Dynamic Observation",
        title: "Discovered Statement",
        desc: `Aether extracted a raw cognitive seed of type '${mem.category}' during real-time dialog processing.`,
        confidence: initialConf,
        timestamp: formatDate(18),
        status: "Raw Seed"
      },
      {
        id: "step2",
        stage: "Stage 2: Multi-Turn Reinforcement",
        title: "Cross-Session Validation",
        desc: "Aligned statement semantics with subsequent context structures. Discovered active reiteration pattern.",
        confidence: reinforcedConf,
        timestamp: formatDate(6),
        status: "Reinforced"
      },
      {
        id: "step3",
        stage: "Stage 3: Hindsight Consolidation",
        title: "Permanent Believed Parameter",
        desc: "Consolidated statement permanently into Aether hindsight memory matrix as an active agent override system.",
        confidence: currentConf,
        timestamp: formatDate(0),
        status: "Active Parameter"
      }
    ];
  };

  const selectedEvolutionSteps = getEvolutionStages(selectedMemory);

  return (
    <div className="flex-1 overflow-y-auto bg-[#09090B] p-5 md:p-8 text-zinc-200 font-sans relative">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight font-sans flex items-center gap-2.5">
              <Brain className="h-6 w-6 text-indigo-400" />
              <span>Cognitive Memory Vault</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Hindsight memory nodes continuously extracted from chats to personalize your agents' systems.
            </p>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Log Memory Manually</span>
          </button>
        </div>

        {/* Manual Input Form */}
        {isAdding && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 shadow-2xl">
            <h2 className="text-xs font-semibold text-zinc-100 mb-1 tracking-tight">
              Log Custom Hindsight Statement
            </h2>
            <p className="text-[11px] text-zinc-500 mb-4">
              Directly inject key facts or system preferences into the Aether background brain trust.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[9px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1.5">
                    Memory Statement (Third-Person Perspective)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. The user prefers responsive CSS styling and SOLID architect systems."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-1.5">
                    Subsystem Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="preference">Preference (Vibe/Themes)</option>
                    <option value="fact">Fact (Location/Domain data)</option>
                    <option value="instruction">Instruction (Layout guidelines)</option>
                    <option value="insight">Insight (Analytical preference)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold border border-zinc-750 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10"
                >
                  Integrate Fact
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Brain Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-xl text-indigo-400 shrink-0">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                Log Cardinality
              </span>
              <span className="text-base font-bold text-zinc-200 font-mono mt-0.5 block">
                {memories.length} nodes
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-xl text-emerald-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                Confidence Threshold
              </span>
              <span className="text-base font-bold text-zinc-200 font-mono mt-0.5 block">
                98.4% Mean
              </span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-2.5 bg-zinc-850 border border-zinc-800 rounded-xl text-sky-400 shrink-0">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-zinc-500 block">
                Aether System Alignment
              </span>
              <span className="text-base font-bold text-zinc-200 font-mono mt-0.5 block">
                Optimized
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column split workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: List with search and filtering */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Filters */}
            <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-4 flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search extracted context..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Filtering Pills */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all border ${
                    activeCategory === "all"
                      ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                      : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  All Categories
                </button>
                {(["preference", "fact", "instruction", "insight"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all border uppercase tracking-wider font-mono ${
                      activeCategory === cat
                        ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                        : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Memories List */}
            {isLoadingMemories ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-16 bg-zinc-900 rounded-2xl w-full border border-zinc-850" />
                <div className="h-16 bg-zinc-900 rounded-2xl w-full border border-zinc-850" />
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-10 text-center">
                <Bookmark className="h-7 w-7 text-zinc-700 mx-auto mb-3" />
                <h3 className="text-xs font-semibold text-zinc-300 mb-1">
                  No memory nodes matched
                </h3>
                <p className="text-[11px] text-zinc-550 max-w-xs mx-auto leading-relaxed">
                  Try refining your search query or logging a custom hindsight statement above.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredMemories.map((mem) => {
                  const originAgent = agents.find((a) => a.id === mem.agentId);
                  const isSelected = selectedMemoryId === mem.id;

                  // Dynamic indicator styles based on score
                  let confidenceColor = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                  if (mem.confidence >= 0.85) {
                    confidenceColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  } else if (mem.confidence >= 0.55) {
                    confidenceColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
                  }

                  return (
                    <div
                      key={mem.id}
                      onClick={() => setSelectedMemoryId(mem.id)}
                      className={`group border rounded-2xl p-4 shadow-sm flex items-start gap-4 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 border-indigo-500/40 shadow-indigo-950/10"
                          : "bg-zinc-900/60 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      {/* Compact Circular Confidence Ring */}
                      <div className="shrink-0 pt-0.5 select-none">
                        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-[10px] font-mono font-bold ${confidenceColor}`}>
                          {Math.round(mem.confidence * 100)}%
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Category tag & metadata */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 border rounded text-[9px] font-bold font-mono uppercase tracking-wide ${getCategoryStyles(mem.category)}`}>
                            {mem.category}
                          </span>
                          <span className="text-zinc-800 text-[10px]">•</span>
                          <span className="text-zinc-500 text-[9px] flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(mem.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Statement */}
                        <p className="text-[11px] font-medium text-zinc-100 leading-relaxed font-sans mb-1.5 group-hover:text-white transition-colors">
                          "{mem.content}"
                        </p>

                        {/* Extracted by info */}
                        <span className="text-[10px] text-zinc-550 font-mono">
                          Belief engine:{" "}
                          <span className="text-zinc-400">
                            {originAgent ? originAgent.name : "System / Manual"}
                          </span>
                        </span>
                      </div>

                      {/* Right indicator arrow */}
                      <div className="shrink-0 self-center opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detailed evolution timeline and editing */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {selectedMemory ? (
                <motion.div
                  key={selectedMemory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="bg-zinc-900 border border-zinc-850 rounded-2xl p-5 md:p-6 space-y-6 shadow-xl sticky top-4"
                >
                  {/* Top Panel stats */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-bold font-mono text-indigo-400 uppercase tracking-widest block">
                        Aether Memory Engine
                      </span>
                      <h2 className="text-sm font-semibold text-zinc-100 mt-0.5">
                        Refinement & Evolution
                      </h2>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        ID: {selectedMemory.id}
                      </span>
                    </div>

                    <CircularConfidenceGauge confidence={editConfidence} />
                  </div>

                  {/* Inline text modifier form */}
                  <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Sliders className="h-3 w-3 text-indigo-400" />
                        <span>Cognitive Adjuster</span>
                      </span>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" /> Refine Statement
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdate}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                          >
                            <Check className="h-3 w-3" /> Save Changes
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">
                            Refined Text Statement
                          </label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">
                              Category type
                            </label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as any)}
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-750"
                            >
                              <option value="preference">Preference</option>
                              <option value="fact">Fact</option>
                              <option value="instruction">Instruction</option>
                              <option value="insight">Insight</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">
                              Confidence: {Math.round(editConfidence * 100)}%
                            </label>
                            <input
                              type="range"
                              min="0.10"
                              max="1.00"
                              step="0.05"
                              value={editConfidence}
                              onChange={(e) => setEditConfidence(parseFloat(e.target.value))}
                              className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-3"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-350 italic font-medium leading-relaxed font-sans">
                          "{selectedMemory.content}"
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-zinc-850/50 pt-3 text-[10px] font-mono">
                          <div>
                            <span className="text-zinc-550 block">Belief category</span>
                            <span className="text-zinc-300 font-semibold mt-0.5 block uppercase">{selectedMemory.category}</span>
                          </div>
                          <div>
                            <span className="text-zinc-550 block">Status lock</span>
                            <span className={`font-semibold mt-0.5 block ${selectedMemory.confidence >= 0.85 ? "text-emerald-400" : "text-indigo-400"}`}>
                              {selectedMemory.confidence >= 0.85 ? "STABILIZED BELIEF" : "REINFORCED SEED"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Evolution timeline section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-zinc-250 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      <span>Refinement Timeline Journey</span>
                    </h3>

                    {/* Timeline visualization utilizing motion */}
                    <div className="relative pl-5 border-l border-zinc-800 space-y-5 ml-2 pt-1">
                      {selectedEvolutionSteps.map((step, idx) => {
                        const isLast = idx === selectedEvolutionSteps.length - 1;
                        return (
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.3 }}
                            className="relative"
                          >
                            {/* Dot timeline connector */}
                            <div className={`absolute -left-[25.5px] top-1.5 h-3 w-3 rounded-full border-2 bg-zinc-900 ${
                              isLast 
                                ? "border-emerald-500 animate-pulse" 
                                : "border-zinc-700"
                            }`} />

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 font-mono">
                                  {step.stage}
                                </span>
                                <span className="text-[9px] text-zinc-550 font-mono">
                                  {step.timestamp}
                                </span>
                              </div>

                              <h4 className="text-xs font-semibold text-zinc-200">
                                {step.title}
                              </h4>
                              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                                {step.desc}
                              </p>

                              {/* Progress bar confidence */}
                              <div className="flex items-center gap-2 pt-1">
                                <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      step.confidence >= 0.85 
                                        ? "bg-emerald-500" 
                                        : step.confidence >= 0.55 
                                        ? "bg-indigo-500" 
                                        : "bg-amber-500"
                                    }`}
                                    style={{ width: `${step.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-[9px] text-zinc-450 font-mono font-bold shrink-0">
                                  Score: {Math.round(step.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* System influence details */}
                  <div className="border-t border-zinc-850 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-zinc-400">
                        Aether Context Injection: <span className="text-emerald-400 font-bold">ACTIVE</span>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        deleteMemory(selectedMemory.id);
                        setSelectedMemoryId(null);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 border border-rose-500/10 hover:border-rose-500/20 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Evict Node
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-10 text-center sticky top-4 flex flex-col items-center justify-center min-h-[300px]">
                  <Layers className="h-8 w-8 text-zinc-700 mb-3 animate-bounce" />
                  <h3 className="text-xs font-semibold text-zinc-300 mb-1">
                    Select a memory node
                  </h3>
                  <p className="text-[11px] text-zinc-550 max-w-xs leading-relaxed">
                    Choose any hindsight node on the left to inspect its multi-session cognitive timeline, adjust its properties, and observe its belief confidence vector.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MemoryVault;
