import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in the environment.");
  process.exit(1);
}

// Establish the MySQL Connection Pool
const pool = mysql.createPool({
  uri: DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Bootstrap tables
export async function initDB() {
  // Create Agents table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS agents (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      avatar VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL,
      system_instruction TEXT NOT NULL,
      temperature FLOAT DEFAULT 0.7,
      capabilities TEXT NOT NULL,
      is_custom TINYINT DEFAULT 0
    )
  `);

  // Create Chat Sessions table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      agent_id VARCHAR(255) NOT NULL,
      created_at VARCHAR(255) NOT NULL,
      updated_at VARCHAR(255) NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `);

  // Create Chat Messages table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(255) PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      thinking LONGTEXT,
      created_at VARCHAR(255) NOT NULL,
      sources TEXT,
      cascade_flow_id VARCHAR(255),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
  `);

  // Create Memories (Hindsight Memory) table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS memories (
      id VARCHAR(255) PRIMARY KEY,
      content TEXT NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at VARCHAR(255) NOT NULL,
      confidence FLOAT DEFAULT 1.0,
      agent_id VARCHAR(255) NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `);

  // Create Cascade Flow Runs table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cascade_runs (
      id VARCHAR(255) PRIMARY KEY,
      prompt TEXT NOT NULL,
      agent_id VARCHAR(255) NOT NULL,
      status VARCHAR(255) NOT NULL,
      created_at VARCHAR(255) NOT NULL,
      steps LONGTEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `);

  // Seed default agents if none exist
  const [rows] = await pool.execute("SELECT COUNT(*) as count FROM agents");
  const count = (rows as any[])[0].count;
  
  if (count === 0) {
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

    const insertQuery = `
      INSERT INTO agents (id, name, role, description, avatar, model, system_instruction, temperature, capabilities, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const agent of defaultAgents) {
      await pool.execute(insertQuery, [
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
      ]);
    }
  }

  // Migrate existing agent models to gemini-2.5-flash
  await pool.execute(`
    UPDATE agents 
    SET model = 'gemini-2.5-flash' 
    WHERE model IN ('gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite')
  `);
}

export default pool;
