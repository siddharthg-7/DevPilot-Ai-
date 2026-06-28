import { useState } from "react";
import { useAppState } from "../providers/AppStateProvider.js";
import { Brain, Calendar, Info, HelpCircle, Shield, Network, Eye } from "lucide-react";

interface Node {
  id: string;
  label: string;
  category: "preference" | "instruction" | "fact" | "insight";
  when: string;
  why: string;
  effect: string;
  source: string;
  confidence: number;
  x: number;
  y: number;
}

export function MemoryNetworkGraph() {
  const { memories, agents } = useAppState();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Fallback nodes if user has empty workspace memories
  const fallbackNodes: Node[] = [
    {
      id: "mem_1",
      label: "Double-Charge rate-limiter mandatory",
      category: "instruction",
      when: "2026-06-25T10:14:00Z",
      why: "Standardized API gateway rate limit requirements under Sec 4.1.",
      effect: "Ensures the router rejects raw API routes and injects Redis-based token-bucket middleware automatically.",
      source: "Astraea (Lead Architect Audit)",
      confidence: 0.98,
      x: 150,
      y: 110,
    },
    {
      id: "mem_2",
      label: "PostgreSQL transaction retry standard",
      category: "instruction",
      when: "2026-06-25T11:05:00Z",
      why: "Mitigates transient SQLite/Postgre connection failures under heavy pool stress.",
      effect: "Bypasses standard insert blocks to wrap operations inside retryTransaction helper.",
      source: "Astraea (Lead Architect Audit)",
      confidence: 0.95,
      x: 230,
      y: 180,
    },
    {
      id: "mem_3",
      label: "ORM Preference: Drizzle over Prisma",
      category: "preference",
      when: "2026-06-26T14:22:00Z",
      why: "Prisma increases container cold boot latencies by up to 2.4s.",
      effect: "Bypasses default Prisma schema models, forcing outputs directly into Pg-Core Drizzle layouts.",
      source: "Solon (Performance Monitor)",
      confidence: 0.99,
      x: 80,
      y: 200,
    },
    {
      id: "mem_4",
      label: "Budget constraint limits capped to $250",
      category: "fact",
      when: "2026-06-27T08:00:00Z",
      why: "Keeps AI token spend managed safely within sandbox budgets.",
      effect: "Forces routing fallback to lightweight models if monthly billing caps are near.",
      source: "System (Budget Controller)",
      confidence: 0.92,
      x: 270,
      y: 80,
    },
  ];

  // Map database memories if available, positioning them in an elegant circle
  const activeMemories = memories.length > 0 ? memories.map((mem, index) => {
    const angle = (index / memories.length) * 2 * Math.PI;
    const radius = 90;
    const x = 160 + radius * Math.cos(angle);
    const y = 140 + radius * Math.sin(angle);
    const originAgent = agents.find((a) => a.id === mem.agentId);

    return {
      id: mem.id,
      label: mem.content.length > 35 ? mem.content.substring(0, 35) + "..." : mem.content,
      category: mem.category,
      when: mem.createdAt,
      why: "Dynamically extracted by cognitive hindight during live chat execution.",
      effect: "Injected dynamically into systemic routing context templates to improve relevance.",
      source: originAgent ? originAgent.name : "Aether Cognitive Engine",
      confidence: mem.confidence || 0.95,
      x,
      y
    } as Node;
  }) : fallbackNodes;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "preference": return "#38bdf8"; // sky
      case "instruction": return "#fbbf24"; // amber
      case "fact": return "#34d399"; // emerald
      case "insight": return "#a78bfa"; // purple
      default: return "#94a3b8"; // slate
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-[#18181B] pb-3 mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">
            Hindsight Memory Graph
          </h3>
          <p className="text-[11px] text-zinc-450 mt-1">
            Visual map of cognitive nodes extracted during interactions. Hover or click nodes to audit metadata.
          </p>
        </div>
        <Network className="h-4.5 w-4.5 text-indigo-400" />
      </div>

      {/* SVG Canvas Container */}
      <div className="relative bg-black border border-zinc-900 rounded-2xl h-64 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <svg className="w-full h-full relative z-10" viewBox="0 0 340 280">
          {/* Node connections */}
          <g>
            {activeMemories.map((node, i) => {
              // Connect nodes back to the center brain node
              const color = getCategoryColor(node.category);
              return (
                <line
                  key={`line-${node.id}`}
                  x1={160}
                  y1={140}
                  x2={node.x}
                  y2={node.y}
                  stroke={color}
                  strokeWidth="0.8"
                  strokeDasharray="4,4"
                  className="opacity-40 animate-pulse"
                />
              );
            })}
          </g>

          {/* Central Cognitive Brain Node */}
          <g transform="translate(160, 140)" className="cursor-pointer">
            <circle r="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" className="animate-pulse" />
            <Brain className="h-5 w-5 text-indigo-400 -translate-x-2.5 -translate-y-2.5 pointer-events-none" />
          </g>

          {/* Individual Memory Nodes */}
          {activeMemories.map((node) => {
            const color = getCategoryColor(node.category);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedNode(node)}
              >
                {/* Ring highlight on hover or select */}
                <circle
                  r={isSelected ? "12" : "10"}
                  fill="transparent"
                  stroke={color}
                  strokeWidth="1.5"
                  className={`opacity-0 group-hover:opacity-100 transition-all ${isSelected ? "opacity-100" : ""}`}
                />
                
                {/* Actual node center */}
                <circle
                  r="6"
                  fill={color}
                  className="transition-all transform group-hover:scale-125"
                />

                {/* Micro tooltip label (hidden on small viewports but fine in SVG) */}
                <text
                  y="-14"
                  textAnchor="middle"
                  fill="#d4d4d8"
                  fontSize="7.5"
                  fontWeight="600"
                  fontFamily="monospace"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 p-0.5 rounded pointer-events-none"
                >
                  {node.label.length > 20 ? node.label.substring(0, 18) + "..." : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-3 z-20 flex gap-2.5 flex-wrap pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]" />
            <span className="text-[8px] font-mono text-zinc-500">Instruction</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
            <span className="text-[8px] font-mono text-zinc-500">Preference</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
            <span className="text-[8px] font-mono text-zinc-500">Fact</span>
          </div>
        </div>

        {/* Active Nodes counter */}
        <div className="absolute top-2 right-3 z-20 pointer-events-none">
          <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg">
            Nodes: {activeMemories.length}
          </span>
        </div>
      </div>

      {/* Expanded Node Inspector Panel */}
      {selectedNode ? (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 shadow-xl animate-fadeIn relative">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 text-[10px] font-mono"
          >
            [dismiss]
          </button>
          
          <div className="flex items-start gap-3">
            <div
              className="p-1.5 rounded-lg border text-white mt-0.5"
              style={{ backgroundColor: `${getCategoryColor(selectedNode.category)}15`, borderColor: getCategoryColor(selectedNode.category) }}
            >
              <Brain className="h-4 w-4" style={{ color: getCategoryColor(selectedNode.category) }} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider block mb-1" style={{ color: getCategoryColor(selectedNode.category) }}>
                {selectedNode.category} Node Inspector
              </span>
              <h4 className="text-xs font-semibold text-zinc-150 leading-tight mb-2.5">
                "{selectedNode.label}"
              </h4>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-zinc-850 pt-2.5 text-[10px] leading-relaxed">
                <div>
                  <span className="text-zinc-500 font-mono block uppercase text-[8px] tracking-wide font-bold">
                    When Stored:
                  </span>
                  <span className="text-zinc-300 font-mono flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3 text-zinc-500" />
                    {new Date(selectedNode.when).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 font-mono block uppercase text-[8px] tracking-wide font-bold">
                    Confidence Interval:
                  </span>
                  <span className="text-indigo-400 font-mono font-bold block mt-0.5">
                    {(selectedNode.confidence * 100).toFixed(1)}% Sure
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-zinc-500 font-mono block uppercase text-[8px] tracking-wide font-bold">
                    Why Stored:
                  </span>
                  <p className="text-zinc-300 font-sans mt-0.5">
                    {selectedNode.why}
                  </p>
                </div>

                <div className="col-span-2">
                  <span className="text-zinc-500 font-mono block uppercase text-[8px] tracking-wide font-bold">
                    Effect on Responses:
                  </span>
                  <p className="text-zinc-300 font-sans mt-0.5 italic">
                    {selectedNode.effect}
                  </p>
                </div>

                <div className="col-span-2">
                  <span className="text-zinc-500 font-mono block uppercase text-[8px] tracking-wide font-bold">
                    Source Anchor:
                  </span>
                  <span className="text-zinc-400 font-mono block mt-0.5">
                    {selectedNode.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-center">
          <HelpCircle className="h-5 w-5 text-zinc-600 mx-auto mb-1.5" />
          <p className="text-[10px] text-zinc-500 font-sans max-w-xs mx-auto">
            Click any individual outer node on the SVG canvas above to inspect details (Why/When stored, affect on response).
          </p>
        </div>
      )}
    </div>
  );
}
