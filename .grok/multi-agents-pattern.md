**Multi-Agent Orchestration Patterns**  
**(Cache-Optimized Edition – 2026)**

Here are the **most effective multi-agent patterns** used in production today, specifically adapted for **maximum prompt cache efficiency** (following the “same warmed prefix + branch only at the tail” principle).

### 1. Hierarchical (Manager → Specialist Workers) — Most Recommended

**Best for**: Complex projects, software engineering, research + execution, content pipelines.

**How it works**:
- One **Manager** agent creates a plan.
- It then spawns multiple **specialist workers** that all share the exact same prefix.
- Manager aggregates results at the end.

**Cache Strategy**:
- The **shared prefix** (system + tools + repo context + policies) is identical for Manager + all Workers.
- Only the final user message changes (“Plan the feature” vs “Implement auth module” vs “Write tests”).

**Message Structure Example**:

```json
// Shared Prefix (identical for everyone)
[
  {"role": "system", "content": "[Full system instructions + tools + schemas + stable context]"},
  
  // Manager call
  {"role": "user", "content": "Break this feature request into subtasks and assign to specialists."}
  
  // Later: Worker calls (exact same prefix above)
  {"role": "user", "content": "Implement the authentication module following the plan."}
]
```

**Frameworks**: LangGraph (best control), CrewAI (easiest), AutoGen

**Cache Benefit**: Extremely high — one big prefix warmed once, then cheap parallel/sequential worker calls.

---

### 2. Parallel Map-Reduce (Fan-out → Fan-in)

**Best for**: Independent subtasks that can run simultaneously (code review, multiple research angles, A/B testing ideas).

**How it works**:
- One coordinator fans out the **same shared prefix** + different task instructions to many workers in parallel.
- A reducer agent combines the results.

**Cache Strategy**:
- All parallel workers use **exactly the same prefix**.
- Only the last message differs.

**Example**:
```json
// All workers receive this exact prefix
[
  {"role": "system", ...},           // shared
  {"role": "user", "content": "Analyze this codebase from the security perspective."},
  {"role": "user", "content": "Analyze this codebase from the performance perspective."},
  {"role": "user", "content": "Analyze this codebase from the maintainability perspective."}
]
```

**Cache Benefit**: Massive savings when running 5–20 parallel agents.

---

### 3. Sequential Pipeline (Chain of Agents)

**Best for**: Step-by-step processes (Research → Plan → Implement → Test → Document).

**How it works**:
- Agent A outputs → becomes input for Agent B, etc.
- To stay cache-efficient, each step should still reuse as much of the original prefix as possible.

**Cache Strategy**:
- Keep the **core shared prefix** (tools, context, policies) in every step.
- Only append the new output from the previous agent as the new “tail”.

**Pro Tip**: Use `x-grok-conv-id` or `prompt_cache_key` with a stable conversation ID across the entire pipeline.

---

### 4. Supervisor / Router + Specialists

**Best for**: Systems with many specialized agents (e.g., 10+ different tools/domains).

**How it works**:
- A lightweight **Supervisor** decides which specialist to call.
- The Supervisor uses a very small prompt.
- The chosen specialist receives the **full shared prefix** + specific task.

**Cache Strategy**:
- The Supervisor prompt is tiny and cheap.
- All specialists share one heavy, well-cached prefix.

This is one of the **most cache-efficient** patterns for large agent teams.

---

### 5. Debate / Multi-Agent Critique (Peer Review)

**Best for**: High-quality output (writing, architecture decisions, code review, research synthesis).

**How it works**:
- Multiple agents with different roles critique and improve each other’s output.
- Often uses rounds of discussion.

**Cache Strategy**:
- All debate participants share the **same base prefix** (problem statement + tools + evaluation criteria).
- Only the “current proposal + critique request” changes per turn.

**Example Flow**:
1. Writer agent produces draft (shared prefix + “Write first draft”)
2. Critic 1: shared prefix + “Critique the draft for clarity”
3. Critic 2: shared prefix + “Critique the draft for technical accuracy”
4. Synthesizer: shared prefix + “Combine all feedback into final version”

---

### 6. Recursive / Tree of Agents (Advanced)

**Best for**: Very large or open-ended problems (e.g., building an entire application from a vague spec).

**How it works**:
- Top-level agent decomposes the problem.
- It recursively spawns sub-teams that themselves use the same patterns.

**Cache Strategy**:
- Every level reuses the **global shared prefix**.
- Only the decomposition/task description changes at each level.

This is where the cache savings become **exponential**.

---

### Quick Decision Matrix

| Pattern              | Cache Efficiency | Complexity | Best Framework     | Latency     | Use When...                          |
|----------------------|------------------|------------|--------------------|-------------|--------------------------------------|
| Hierarchical         | ★★★★★           | Medium     | LangGraph / CrewAI | Medium      | Most real-world projects             |
| Parallel Map-Reduce  | ★★★★★           | Low        | Any                | Low         | Independent subtasks                 |
| Sequential Pipeline  | ★★★★            | Low        | CrewAI / LangGraph | Medium-High | Step-by-step processes               |
| Supervisor + Specialists | ★★★★★        | Medium     | LangGraph          | Low         | Many specialized agents              |
| Debate / Critique    | ★★★★            | High       | AutoGen            | High        | Quality > speed                      |
| Recursive            | ★★★★★           | Very High  | LangGraph          | Variable    | Very large problems                  |

---

### Implementation Tips (Cache-First)

1. **Always define the Shared Prefix once** at the top of your orchestrator.
2. Pass the **exact same message list prefix** to every subagent call.
3. Use a **stable `prompt_cache_key` / `x-grok-conv-id`** for the entire workflow.
4. Never let tool results or dynamic context leak into the cached prefix.
5. Monitor cache hit rate per pattern — Hierarchical and Parallel usually win.
