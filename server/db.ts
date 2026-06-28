import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "database.db");

// Establish the SQLite Connection
const db = new Database(DB_PATH);

// Enable foreign key support
db.pragma("foreign_keys = ON");

// Bootstrap tables
export function initDB() {
  // Create Agents table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT NOT NULL,
      avatar TEXT NOT NULL,
      model TEXT NOT NULL,
      system_instruction TEXT NOT NULL,
      temperature REAL DEFAULT 0.7,
      capabilities TEXT NOT NULL, -- JSON array
      is_custom INTEGER DEFAULT 0
    )
  `).run();

  // Create Chat Sessions table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `).run();

  // Create Chat Messages table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      thinking TEXT,
      created_at TEXT NOT NULL,
      sources TEXT, -- JSON array of grounding sources
      cascade_flow_id TEXT, -- optional reference
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `).run();

  // Create Memories (Hindsight Memory) table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      agent_id TEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `).run();

  // Create Cascade Flow Runs table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS cascade_runs (
      id TEXT PRIMARY KEY,
      prompt TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      status TEXT NOT NULL, -- pending, running, completed, failed
      created_at TEXT NOT NULL,
      steps TEXT NOT NULL, -- JSON array of CascadeStep
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `).run();

  // Seed default agents if none exist
  const count = db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number };
  if (count.count === 0) {
    const defaultAgents = [
      {
        id: "architect",
        name: "Astraea",
        role: "Senior AI Solutions Architect",
        description: "Specializes in enterprise full-stack system architecture, API designs, and SOLID principles.",
        avatar: "Cpu",
        model: "gemini-2.5-flash",
        system_instruction: "You are Astraea, a world-class Staff Software Architect. Focus on robust, production-ready system designs, high quality code, and explaining complex software concepts with maximum clarity and elegance.",
        temperature: 0.2,
        capabilities: JSON.stringify(["Hindsight Memory", "High-Thinking", "Code Generation"]),
        is_custom: 0
      },
      {
        id: "researcher",
        name: "Veritas",
        role: "Cognitive Research Analyst",
        description: "Specializes in deep research, technical synthesis, and web-grounded validation.",
        avatar: "Search",
        model: "gemini-2.5-flash",
        system_instruction: "You are Veritas, an analytical research agent. You use Google Search grounding to verify facts, cross-reference data, and present synthesized intelligence in structured, bite-sized briefings.",
        temperature: 0.5,
        capabilities: JSON.stringify(["Hindsight Memory", "Web Search", "Data Synthesis"]),
        is_custom: 0
      },
      {
        id: "writer",
        name: "Calliope",
        role: "Creative Copywriter & Strategist",
        description: "Crafts copy, newsletters, and clear documentation with distinctive rhythm and flow.",
        avatar: "PenTool",
        model: "gemini-2.5-flash",
        system_instruction: "You are Calliope, an expert writer and strategist. Write engaging copy with premium typography, elegant prose, and flawless structure. Avoid cliché words or typical AI greeting patterns.",
        temperature: 0.8,
        capabilities: JSON.stringify(["Hindsight Memory", "Content Strategy"]),
        is_custom: 0
      },
      {
        id: "analyst",
        name: "Solon",
        role: "Cascade Runtime Optimizer",
        description: "Handles complex multi-stage debugging, performance tuning, and algorithm optimizations.",
        avatar: "Terminal",
        model: "gemini-2.5-flash",
        system_instruction: "You are Solon, a performance analyst. You analyze complex issues step-by-step using cascade intelligence workflows, measuring cost, latency, and bottleneck patterns.",
        temperature: 0.1,
        capabilities: JSON.stringify(["High-Thinking", "Performance Diagnostics", "CascadeFlow"]),
        is_custom: 0
      }
    ];

    const insertAgent = db.prepare(`
      INSERT INTO agents (id, name, role, description, avatar, model, system_instruction, temperature, capabilities, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const agent of defaultAgents) {
      insertAgent.run(
        agent.id,
        agent.name,
        agent.role,
        agent.description,
        agent.avatar,
        agent.model,
        agent.system_instruction,
        agent.temperature,
        agent.capabilities,
        agent.is_custom
      );
    }
  }

  // Migrate existing agent models to gemini-2.5-flash to bypass quota/high-demand issues
  db.prepare(`
    UPDATE agents 
    SET model = 'gemini-2.5-flash' 
    WHERE model IN ('gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite')
  `).run();
}

export default db;
