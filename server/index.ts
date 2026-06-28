import pool, { initDB } from "./db.js";
const db = pool;
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  generateChatResponse,
  extractAndSaveMemory,
  runCascadeFlow,
} from "./geminiService.js";

const app = express();
const PORT = 3000;

// Initialize SQLite database
initDB();

// Middleware
app.use(express.json());

/**
 * --- API ROUTES ---
 */

// 1. Agents API
app.get("/api/agents", async (req, res) => {
  try {
    const agents = (await db.execute("SELECT * FROM agents") as any[])[0];
    const formatted = agents.map((a: any) => ({
      ...a,
      isCustom: Boolean(a.is_custom),
      capabilities: JSON.parse(a.capabilities),
      systemInstruction: a.system_instruction,
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/agents", async (req, res) => {
  try {
    const { name, role, description, avatar, model, systemInstruction, temperature, capabilities } = req.body;
    if (!name || !role || !description || !systemInstruction) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = "agent_" + Math.random().toString(36).substring(2, 11);
    await db.execute(`
      INSERT INTO agents (id, name, role, description, avatar, model, system_instruction, temperature, capabilities, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [id, name, role, description, avatar || "User", model || "gemini-3.5-flash", systemInstruction, temperature ?? 0.7, JSON.stringify(capabilities || [])]);

    const created = (await db.execute("SELECT * FROM agents WHERE id = ?", [id]) as any[])[0][0] as any;
    res.status(201).json({
      ...created,
      isCustom: true,
      capabilities: JSON.parse(created.capabilities),
      systemInstruction: created.system_instruction,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/agents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute("DELETE FROM agents WHERE id = ? AND is_custom = 1", [id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Custom agent not found or cannot delete system agent." });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Chat Sessions API
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = (await db.execute("SELECT * FROM sessions ORDER BY updated_at DESC") as any[])[0];
    const formatted = sessions.map((s: any) => ({
      id: s.id,
      title: s.title,
      agentId: s.agent_id,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sessions", async (req, res) => {
  try {
    const { title, agentId } = req.body;
    if (!title || !agentId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const id = "session_" + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    await db.execute(`
      INSERT INTO sessions (id, title, agent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `, [id, title, agentId, now, now]);

    res.status(201).json({ id, title, agentId, createdAt: now, updatedAt: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM sessions WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Chat Messages API
app.get("/api/sessions/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = (await db.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC", [sessionId]) as any[])[0];
    const formatted = messages.map((m: any) => {
      // Base message fields
      const msg: any = {
        id: m.id,
        sessionId: m.session_id,
        role: m.role,
        content: m.content,
        thinking: m.thinking || undefined,
        createdAt: m.created_at,
        sources: m.sources ? JSON.parse(m.sources) : undefined,
        cascadeFlowId: m.cascade_flow_id || undefined,
      };

      // If it is a demo-related assistant message, enrich with realistic enterprise runtime analytics
      if (m.role === "assistant" && (sessionId.startsWith("demo_") || m.id.startsWith("demo_msg_"))) {
        if (sessionId.includes("scenario_1")) {
          msg.metadata = {
            selectedModel: "gemini-3.5-flash",
            whySelected: "Low complexity fallback; no active compliance memory nodes detected.",
            estimatedCost: 0.00004,
            actualCost: 0.00004,
            latency: 0.35,
            budgetRemaining: 248.50,
            escalationEvents: "None",
            fallbackEvents: "None",
            routingDecision: "Standard bypass routing",
            qualityScore: 82,
            reflectionHistory: ["Syntax validation passed", "Structural standard checked"]
          };
        } else if (sessionId.includes("scenario_2")) {
          msg.metadata = {
            selectedModel: "gemini-3.1-pro-preview",
            whySelected: "High architectural density. Activated 2 memories in the active system instruction context.",
            estimatedCost: 0.00120,
            actualCost: 0.00115,
            latency: 1.82,
            budgetRemaining: 247.35,
            escalationEvents: "PERSONALIZATION_REWRITE",
            fallbackEvents: "None",
            routingDecision: "Personalized architecture compliance block",
            qualityScore: 98,
            retainedFacts: ["Checkout handler standards required Redis limits", "Query wrapper must use retryTransaction"],
            recalledContext: "Recalled previous team instructions concerning double-charge risk.",
            reflectionHistory: ["Checking token-bucket pattern", "Injecting custom transactional queries"],
            sources: [
              { title: "Team Standard Section 4.1", uri: "https://confluence.enterprise.local/standards/4.1" },
              { title: "Vault: Redis Rate Limiter Pattern", uri: "https://vault.enterprise.local/patterns/rate-limit" }
            ]
          };
        } else if (sessionId.includes("scenario_3")) {
          msg.metadata = {
            selectedModel: "gemini-3.5-flash",
            whySelected: "Trivial utility validation. Promoted direct high-speed routing to Flash.",
            estimatedCost: 0.00002,
            actualCost: 0.00001,
            latency: 0.18,
            budgetRemaining: 247.33,
            escalationEvents: "None",
            fallbackEvents: "None",
            routingDecision: "Bypass to low-latency node",
            qualityScore: 95,
            reflectionHistory: ["Determined low-risk utility", "Analyzing closure scope"]
          };
        } else if (sessionId.includes("scenario_4")) {
          msg.metadata = {
            selectedModel: "gemini-3.1-pro-preview",
            whySelected: "Complex cryptographic threat audit requested. Initiated heavy reasoning.",
            estimatedCost: 0.00350,
            actualCost: 0.00340,
            latency: 2.94,
            budgetRemaining: 243.93,
            escalationEvents: "PRO_REASONING_REWRITE",
            fallbackEvents: "None",
            routingDecision: "Escalate to Pro Reasoning nodes",
            qualityScore: 99,
            reflectionHistory: ["Auditing salt and PBKDF2 parameters", "Validating key length guidelines", "Recommending AES-GCM tags"]
          };
        } else if (sessionId.includes("scenario_5")) {
          msg.metadata = {
            selectedModel: "gemini-3.1-pro-preview",
            whySelected: "User database preference detected in memory vault. Avoided default guidelines.",
            estimatedCost: 0.00150,
            actualCost: 0.00142,
            latency: 1.65,
            budgetRemaining: 242.51,
            escalationEvents: "ORCHESTRATOR_REWRITE",
            fallbackEvents: "None",
            routingDecision: "Preference-based model override",
            qualityScore: 97,
            retainedFacts: ["User rejects Prisma ORM", "User prefers Drizzle ORM schemas"],
            reflectionHistory: ["Evaluating Prisma rules", "Applying Drizzle schema mapping", "Bypassing standard templates"]
          };
        } else {
          // Default demo metadata
          msg.metadata = {
            selectedModel: "gemini-3.1-pro-preview",
            whySelected: "Orchestrated CascadeFlow pipeline alignment.",
            estimatedCost: 0.00220,
            actualCost: 0.00210,
            latency: 2.10,
            budgetRemaining: 240.41,
            escalationEvents: "None",
            fallbackEvents: "None",
            routingDecision: "Cascade execution pipeline routing",
            qualityScore: 98,
            reflectionHistory: ["Alignment mapping complete", "Refining enterprise tone"]
          };
        }
      }

      return msg;
    });
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- INTERACTIVE ENTERPRISE DEMO SEEDING API ---
app.post("/api/demo/seed", async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) {
      return res.status(400).json({ error: "Missing scenario number (1-6)" });
    }

    const scenarioNum = parseInt(scenario, 10);
    const sessionPrefix = `demo_scenario_${scenarioNum}`;
    
    // 1. Delete any existing demo session for this scenario
    await db.execute("DELETE FROM sessions WHERE id LIKE ?", [`${sessionPrefix}%`]);
    
    // 2. Identify agent to use
    let agentId = "architect";
    if (scenarioNum === 3) agentId = "researcher";
    if (scenarioNum === 4) agentId = "analyst";

    const sessionId = `${sessionPrefix}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    let sessionTitle = `Demo Scenario ${scenarioNum}: Architectural Compliance Audit`;

    if (scenarioNum === 1) sessionTitle = "Scenario 1: First Audit (No Memory Guidelines)";
    if (scenarioNum === 2) sessionTitle = "Scenario 2: Fifth Audit (Compliance Memory Active)";
    if (scenarioNum === 3) sessionTitle = "Scenario 3: Low-Cost Fast Routing (Utility Check)";
    if (scenarioNum === 4) sessionTitle = "Scenario 4: Budget-Aware Escalation (SOC2 Audit)";
    if (scenarioNum === 5) sessionTitle = "Scenario 5: Preference Mapping (Drizzle Refactoring)";
    if (scenarioNum === 6) sessionTitle = "Scenario 6: End-to-End Cascade Flow Compliance Execution";

    // Create Session
    await db.execute(`
      INSERT INTO sessions (id, title, agent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `, [sessionId, sessionTitle, agentId, now, now]);

    const userMsgId = `demo_user_${scenarioNum}_${Math.random().toString(36).substring(2, 7)}`;
    const assistantMsgId = `demo_assist_${scenarioNum}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Populate scenario-specific messages & memories
    if (scenarioNum === 1) {
      // Scenario 1: First interaction, no memories. Output is generic.
      const prompt = `Please review this Express controller for architectural compliance:

\`\`\`typescript
app.post('/api/v1/checkout', async (req, res) => {
  const { items, paymentMethodId } = req.body;
  const order = await stripe.paymentIntents.create({
    amount: calculateTotal(items),
    currency: 'usd',
    payment_method: paymentMethodId,
    confirm: true
  });
  await db.insert(orders).values({ id: order.id, status: 'completed' });
  res.json({ success: true, orderId: order.id });
});
\`\`\``;

      const response = `### Architectural Compliance Report: \`/api/v1/checkout\`
**Status:** ✅ APPROVED (Standard Node Router)

I have completed the structural check of the payment checkout router definition.

#### 📊 Structural Audit:
* **Endpoint Naming:** Complies with REST conventions (\`/api/v1/checkout\`).
* **Payment Integration:** Calls Stripe SDK correctly.
* **Database Pipeline:** Uses SQLite/SQL values inserts.

No syntactic issues or runtime memory leaks were identified. The controller is ready to deploy under standard workspace presets.

*Note: There are currently zero enterprise guidelines, rules, or custom compliance memories in the brain trust. The audit was conducted using generic public Node.js presets.*`;

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `, [userMsgId, sessionId, prompt, now]);

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'assistant', ?, ?)
      `, [assistantMsgId, sessionId, response, new Date(Date.now() + 1000).toISOString()]);

    } else if (scenarioNum === 2) {
      // Scenario 2: Fifth interaction. Standard memories are active. Output rejects and refactors.
      // Insert memories first
      const memId1 = `demo_mem_rate_limit_${Math.random().toString(36).substring(2, 7)}`;
      const memId2 = `demo_mem_retry_${Math.random().toString(36).substring(2, 7)}`;
      
      // Delete duplicates first to avoid primary key collisions
      await db.execute("DELETE FROM memories WHERE content LIKE ?", ["%Redis-based token-bucket rate limiting%"]);
      await db.execute("DELETE FROM memories WHERE content LIKE ?", ["%retryTransaction query transactional wrapper%"]);

      await db.execute(`
        INSERT INTO memories (id, content, category, created_at, confidence, agent_id)
        VALUES (?, 'Compliance Standard: All checkout or payment handlers MUST use Redis-based token-bucket rate limiting.', 'instruction', ?, 0.98, 'architect')
      `, [memId1, now]);

      await db.execute(`
        INSERT INTO memories (id, content, category, created_at, confidence, agent_id)
        VALUES (?, 'Compliance Standard: Checkout database inserts must wrap query executions inside our retryTransaction query transactional wrapper.', 'instruction', ?, 0.95, 'architect')
      `, [memId2, now]);

      const prompt = `Please review this Express controller for architectural compliance:

\`\`\`typescript
app.post('/api/v1/checkout', async (req, res) => {
  const { items, paymentMethodId } = req.body;
  const order = await stripe.paymentIntents.create({
    amount: calculateTotal(items),
    currency: 'usd',
    payment_method: paymentMethodId,
    confirm: true
  });
  await db.insert(orders).values({ id: order.id, status: 'completed' });
  res.json({ success: true, orderId: order.id });
});
\`\`\``;

      const thinking = `- Received code compliance review.
- Initializing Cognitive Hindsight Memory lookup...
- FOUND: 2 active enterprise compliance memory constraints in active context!
  - Rule 1: Redis-based token-bucket rate limiting is MANDATORY on all checkout handlers.
  - Rule 2: Checkout database inserts MUST use the custom retryTransaction wrapper.
- Auditing prompt code against recalled rules...
  - Violation 1: Missing Redis rate-limiting middleware.
  - Violation 2: Raw db.insert call is vulnerable to transient network failures; not wrapped in retryTransaction.
- Action: Reject controller compliance. Construct optimized, compliant refactored code.`;

      const response = `### Architectural Compliance Report: \`/api/v1/checkout\`
**Status:** 🚨 CRITICAL COMPLIANCE REJECTION

*Hindsight Memory Subsystem Active: Automatically loaded 2 enterprise compliance rules from the memory vault.*

The code submitted violates several strict security and operational compliance standards established for our production environment.

---

#### 🚨 Detected Violations:

1. **Missing Double-Charge Rate Limiting Standard (Sec 4.1):**
   Checkout handlers are strictly required to enforce Redis token-bucket limits to prevent client-side multi-click charging.
2. **Transient DB Failure Vulnerability (Sec 8.2):**
   Checkout inserts must be wrapped in our resilient transactional retry handler (\`retryTransaction\`) to recover gracefully from network bottlenecks.

---

#### 🛠️ Refactored, Compliant Code:

\`\`\`typescript
import { rateLimiter } from '@/lib/rate-limiter';
import { retryTransaction } from '@/db/pool';

// Enforce Redis token-bucket limiting (max 5 hits / minute)
app.post('/api/v1/checkout', rateLimiter({ limit: 5, window: '60s' }), async (req, res) => {
  const { items, paymentMethodId } = req.body;

  // Wrap inside resilient database retry transactional wrapper
  const result = await retryTransaction(async (tx) => {
    const order = await stripe.paymentIntents.create({
      amount: calculateTotal(items),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true
    });
    return await tx.insert(orders).values({ id: order.id, status: 'completed' });
  });

  res.json({ success: true, orderId: result.id });
});
\`\`\`

**Aether Memory Influence:**
Recalled memories dynamically injected Redis and retryTransaction standards. Compliance audit accuracy improved by 100%.`;

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `, [userMsgId, sessionId, prompt, now]);

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, thinking, created_at)
        VALUES (?, ?, 'assistant', ?, ?, ?)
      `, [assistantMsgId, sessionId, response, thinking, new Date(Date.now() + 1000).toISOString()]);

    } else if (scenarioNum === 3) {
      // Scenario 3: Cheap model routing
      const prompt = "Verify that this utility helper is closure-safe and doesn't leak memory: `const makeCounter = () => { let count = 0; return () => ++count; };` ";
      const response = `### Utility Scope & Reference Audit
**Status:** ✅ COMPLIED

The closure definition:
\`\`\`javascript
const makeCounter = () => { let count = 0; return () => ++count; };
\`\`\`
is completely clean. The \`count\` variable is correctly scoped inside the closure environment, and the returned function retains the reference without leaking variables into global GC contexts.

---

**CascadeFlow Cost Optimizer Decision:**
* **Complexity Category:** Low Syntax/Utility Check
* **Model Selected:** **gemini-3.5-flash**
* **Cost:** $0.00001 (Bypassed expensive reasoning engines, saving 98.4%)
* **Latency:** 0.18s`;

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `, [userMsgId, sessionId, prompt, now]);

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'assistant', ?, ?)
      `, [assistantMsgId, sessionId, response, new Date(Date.now() + 1000).toISOString()]);

    } else if (scenarioNum === 4) {
      // Scenario 4: Escalation
      const prompt = "Analyze our core OAuth compliance auth provider for cryptographic threat vulnerabilities under SOC2 Section CC7.";
      const thinking = `- Analyzed prompt context: OAuth cryptographic review, SOC2 compliance security.
- Query Complexity Analysis: CRITICAL. Cryptographic threat model.
- Routing Escalation Event triggered: High risk, requires maximum model logic.
- Routed to: gemini-3.1-pro-preview with HIGH Thinking level.
- Commencing security audit...`;

      const response = `### SOC2 Security & Cryptographic Compliance Audit
**Status:** ⚠️ AUDIT WARNING (Escalated to High-Reasoning Pro Node)

I have performed a SOC2 compliance and cryptographic threat review on your authentication provider.

#### 🔒 Cryptographic Review Findings:
* **Key Generation Strategy:** Uses standard HMAC-SHA256. Fully secure.
* **Vulnerability detected (CC7.1):** PBKDF2 iterations are capped at 10,000. Under modern NIST and SOC2 standards, a minimum of 600,000 iterations is highly recommended for credential protection.
* **Solution:** Replace PBKDF2 with **argon2id** or increase the iterations parameter:

\`\`\`typescript
const iterations = 600000; // Updated to SOC2 guidelines
\`\`\`

**Routing Audit Log:**
* **Complexity Filter:** Critical Security review.
* **Model Selected:** **gemini-3.1-pro-preview** (High-Thinking enabled).
* **Latency:** 2.94s (Heavy logic compilation).
* **Cost:** $0.00340. Priority budget allocation granted.`;

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `, [userMsgId, sessionId, prompt, now]);

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, thinking, created_at)
        VALUES (?, ?, 'assistant', ?, ?, ?)
      `, [assistantMsgId, sessionId, response, thinking, new Date(Date.now() + 1000).toISOString()]);

    } else if (scenarioNum === 5) {
      // Scenario 5: Memory affecting routing
      const memId = `demo_mem_drizzle_${Math.random().toString(36).substring(2, 7)}`;
      await db.execute("DELETE FROM memories WHERE content LIKE ?", ["%prefers Drizzle ORM%"]);
      
      await db.execute(`
        INSERT INTO memories (id, content, category, created_at, confidence, agent_id)
        VALUES (?, 'Workspace Rule: The team strictly prefers Drizzle ORM over Prisma ORM for relational schemas due to cold start latencies.', 'preference', ?, 0.99, 'architect')
      `, [memId, now]);

      const prompt = "Refactor this database order table definition for PostgreSQL compliance: `model Order { id Int @id; status String; created DateTime }` ";
      const thinking = `- Check database preferences in hindsight memories.
- RECALLED: "The team strictly prefers Drizzle ORM over Prisma ORM."
- Refactor task matches database structure. I must bypass default Prisma templates and output a Drizzle ORM TypeScript definition instead.`;

      const response = `### Resilient Schema Refactoring: PostgreSQL Relational Table
**Status:** ✅ REFACTORED (Using Drizzle ORM)

*Hindsight Memory Subsystem Active: Recalled teammate's active preference to use Drizzle ORM rather than Prisma.*

Here is your orden table refactored into compliance with Drizzle ORM conventions to ensure sub-millisecond container startup:

\`\`\`typescript
import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: integer('id').primaryKey(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
\`\`\`

**Influence Audit:**
* **Avoided Path:** Standard Prisma schema output (Bypassed due to recalled engineering rule).
* **Drizzle Standard Applied:** Automatically mapped types to Drizzle.`;

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `, [userMsgId, sessionId, prompt, now]);

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, thinking, created_at)
        VALUES (?, ?, 'assistant', ?, ?, ?)
      `, [assistantMsgId, sessionId, response, thinking, new Date(Date.now() + 1000).toISOString()]);

    } else if (scenarioNum === 6) {
      // Scenario 6: CascadeFlow Run Seeding
      const prompt = "Inspect and optimize the transaction cascade pool allocator.";
      const response = `### CascadeFlow Transaction Allocator Optimization Complete

The transactional pool allocation has been restructured to handle database clustering and connection queuing.

#### ⚙️ Cascade Nodes Run Logs:
1. **Planning Step:** Analyzed thread allocator bottlenecks. Formulated dynamic pool-scaling strategy.
2. **Retrieval Step:** Checked connection count thresholds. No cached database blocks needed.
3. **Execution Step:** Compiled node pools using high-reasoning. Enabled keep-alive timeouts.
4. **Refinement Step:** Formatted thread allocator logs for enterprise telemetry. Ready to apply.`;

      const cascadeRunId = `cascade_demo_${Math.random().toString(36).substring(2, 7)}`;
      
      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at, cascade_flow_id)
        VALUES (?, ?, 'user', ?, ?, ?)
      `, [userMsgId, sessionId, prompt, now, cascadeRunId]);

      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at, cascade_flow_id)
        VALUES (?, ?, 'assistant', ?, ?, ?)
      `, [assistantMsgId, sessionId, response, new Date(Date.now() + 1000).toISOString(), cascadeRunId]);

      // Save CascadeFlow Run steps in database
      const steps = [
        { id: "planning", label: "Cognitive Alignment & Planning", description: "Deconstructing pool scaling constraints.", status: "completed", output: "Devised dynamic queue allocation schema.", duration: 340 },
        { id: "retrieval", label: "Information Gathering", description: "Recalled active pool allocator memories.", status: "completed", output: "Located active pool constraints.", duration: 210 },
        { id: "execution", label: "Generative Logic Generation", description: "Executing pool refactor inside reasoning engine.", status: "completed", output: "Completed thread pool controller layout.", duration: 1220 },
        { id: "refinement", label: "Refinement & Alignment", description: "Polishing code for compliance tags.", status: "completed", output: "Pool optimizer polished successfully.", duration: 410 }
      ];

      await db.execute(`
        INSERT INTO cascade_runs (id, prompt, agent_id, status, created_at, steps)
        VALUES (?, ?, ?, 'completed', ?, ?)
      `, [cascadeRunId, prompt, agentId, now, JSON.stringify(steps)]);
    }

    res.status(201).json({ success: true, sessionId });
  } catch (err: any) {
    console.error("Demo seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Messaging Core & Pipelines
app.post("/api/chat/send", async (req, res) => {
  try {
    const { sessionId, agentId, message, enableThinking, enableSearch, useCascadeFlow } = req.body;

    if (!sessionId || !agentId || !message) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const now = new Date().toISOString();
    const userMessageId = "msg_" + Math.random().toString(36).substring(2, 11);

    // Save user message to database
    await db.execute(`
      INSERT INTO messages (id, session_id, role, content, created_at)
      VALUES (?, ?, 'user', ?, ?)
    `, [userMessageId, sessionId, message, now]);

    // Update session timestamp
    await db.execute("UPDATE sessions SET updated_at = ? WHERE id = ?", [now, sessionId]);

    // If cascadeflow execution is selected:
    if (useCascadeFlow) {
      const cascadeResult = await runCascadeFlow({ prompt: message, agentId });
      const assistantMessageId = "msg_" + Math.random().toString(36).substring(2, 11);
      const assistantNow = new Date().toISOString();

      // Save final cascade output as the assistant message linked to cascadeFlowId
      await db.execute(`
        INSERT INTO messages (id, session_id, role, content, created_at, cascade_flow_id)
        VALUES (?, ?, 'assistant', ?, ?, ?)
      `, [assistantMessageId, sessionId, cascadeResult.finalOutput, assistantNow, cascadeResult.runId]);

      // Extract and save memory in background
      extractAndSaveMemory(agentId, message, cascadeResult.finalOutput);

      return res.json({
        userMessage: {
          id: userMessageId,
          sessionId,
          role: "user",
          content: message,
          createdAt: now,
        },
        assistantMessage: {
          id: assistantMessageId,
          sessionId,
          role: "assistant",
          content: cascadeResult.finalOutput,
          createdAt: assistantNow,
          cascadeFlowId: cascadeResult.runId,
        },
        cascadeFlow: {
          id: cascadeResult.runId,
          prompt: message,
          agentId,
          steps: cascadeResult.steps,
          status: "completed",
        },
      });
    }

    // Standard Gemini Generation Pipeline (Optionally with Search or Pro High-Thinking)
    const result = await generateChatResponse({
      sessionId,
      agentId,
      userMessage: message,
      enableThinking,
      enableSearch,
    });

    const assistantMessageId = "msg_" + Math.random().toString(36).substring(2, 11);
    const assistantNow = new Date().toISOString();

    // Save assistant message to database
    await db.execute(`
      INSERT INTO messages (id, session_id, role, content, thinking, created_at, sources)
      VALUES (?, ?, 'assistant', ?, ?, ?, ?)
    `, [assistantMessageId, sessionId, result.content, result.thinking || null, assistantNow, result.sources ? JSON.stringify(result.sources) : null]);

    // Extract and save cognitive hindsight memory in the background
    extractAndSaveMemory(agentId, message, result.content);

    return res.json({
      userMessage: {
        id: userMessageId,
        sessionId,
        role: "user",
        content: message,
        createdAt: now,
      },
      assistantMessage: {
        id: assistantMessageId,
        sessionId,
        role: "assistant",
        content: result.content,
        thinking: result.thinking,
        createdAt: assistantNow,
        sources: result.sources,
      },
    });
  } catch (err: any) {
    console.error("Express send message error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Memories API
app.get("/api/memories", async (req, res) => {
  try {
    const memories = (await db.execute("SELECT * FROM memories ORDER BY created_at DESC") as any[])[0];
    const formatted = memories.map((m: any) => ({
      id: m.id,
      content: m.content,
      category: m.category,
      createdAt: m.created_at,
      confidence: m.confidence,
      agentId: m.agent_id,
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/memories", async (req, res) => {
  try {
    const { content, category, agentId } = req.body;
    if (!content || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = "mem_" + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    await db.execute(`
      INSERT INTO memories (id, content, category, created_at, confidence, agent_id)
      VALUES (?, ?, ?, ?, 1.0, ?)
    `, [id, content, category, now, agentId || "manual"]);

    res.status(201).json({ id, content, category, createdAt: now, confidence: 1.0, agentId: agentId || "manual" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/memories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM memories WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/memories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, category, confidence } = req.body;
    await db.execute(`
      UPDATE memories
      SET content = COALESCE(?, content),
          category = COALESCE(?, category),
          confidence = COALESCE(?, confidence)
      WHERE id = ?
    `, [content, category, confidence, id]);

    const updated = (await db.execute("SELECT * FROM memories WHERE id = ?", [id]) as any[])[0][0] as any;
    if (!updated) {
      return res.status(404).json({ error: "Memory not found" });
    }

    res.json({
      id: updated.id,
      content: updated.content,
      category: updated.category,
      createdAt: updated.created_at,
      confidence: updated.confidence,
      agentId: updated.agent_id,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. CascadeFlow Runs API
app.get("/api/cascade-runs", async (req, res) => {
  try {
    const runs = (await db.execute("SELECT * FROM cascade_runs ORDER BY created_at DESC") as any[])[0];
    const formatted = runs.map((r: any) => ({
      id: r.id,
      prompt: r.prompt,
      agentId: r.agent_id,
      status: r.status,
      createdAt: r.created_at,
      steps: JSON.parse(r.steps),
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/cascade-runs/:id", async (req, res) => {
  try {
    const run = (await db.execute("SELECT * FROM cascade_runs WHERE id = ?", [req.params.id]) as any[])[0][0] as any;
    if (!run) {
      return res.status(404).json({ error: "Run not found." });
    }
    res.json({
      id: run.id,
      prompt: run.prompt,
      agentId: run.agent_id,
      status: run.status,
      createdAt: run.created_at,
      steps: JSON.parse(run.steps),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * --- VITE MIDDLEWARE SETUP ---
 */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server booted successfully. Access at http://localhost:${PORT}`);
  });
}

startServer();
