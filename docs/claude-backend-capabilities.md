# Claude for Backend Development & Operations

**Findings + Action Plan**
**Prepared:** 2026-05-18
**Branch:** `claude/research-backend-capabilities-fbpAw`
**Source:** Research agent sweep of Anthropic docs, Claude Agent SDK docs, Claude Code on the web docs, and 2025-2026 production case studies.

---

## TL;DR

Claude (Claude Code CLI + Claude API + Claude Agent SDK) is now production-viable for 70-80% of backend boilerplate, multi-file refactors, IaC generation, CI/CD wiring, and scheduled automations. It is **not** ready to be left alone for security-critical decisions, destructive DB migrations, secret rotation, or unattended production deploys. The right adoption pattern is a phased rollout that starts with interactive dev work behind PR review, then layers in scheduled routines, then long-running Agent SDK / Managed Agents workers — each step gated on measured ROI and explicit human-approval points.

**Expected outcome at the end of a 3-month rollout:** 20-40% faster PR turnaround, 50-70% of code changes Claude-authored, nightly dependency PRs running unattended, and a security-review skill in every PR pipeline.

---

## 1. What Claude can do well today

| Capability | Verdict | Notes |
|---|---|---|
| REST API scaffolding (controllers, DTOs, validation, tests) | Strong | 70-80% boilerplate generation |
| GraphQL schemas + resolvers | Strong | Handles nested queries, type-safe codegen |
| DB schema design (Prisma/Drizzle/SQLAlchemy/ActiveRecord) | Strong | Best with declarative schema-first tools |
| Dockerfile + multi-stage builds | Strong | Production-quality on first attempt |
| Kubernetes manifests (Deployments, HPA, PDB, NetworkPolicy) | Strong | Includes resource limits + probes |
| Terraform / IaC | Strong | Correct HCL first attempt for standard architectures; PR-based plan review required |
| Multi-file refactors across a codebase | Strong | Cross-file consistency, including tests |
| Writing + debugging tests | Strong | Unit, integration, e2e; reads error output and retries |
| Git operations + semantic commits + PRs | Strong | Native to Claude Code |
| CI/CD pipelines (GitHub Actions, GitLab CI) | Good | Complex conditional logic still benefits from review |
| Query optimization (N+1, eager loading, pooling, caching) | Good | Understands ORM idioms |
| Dependency updates + conflict resolution | Strong | Run as a nightly routine |

## 2. Where Claude still needs heavy human oversight

- **Security-critical code** — Veracode 2025 found 45% of AI-generated code samples failed security tests. The `/security-review` skill helps but is not a substitute for a human reviewer.
- **Destructive DB migrations** — column drop/rename/type-change, batched backfills on large tables. Always staged + reviewed.
- **Production deploys** — `terraform plan` review before any `apply`; never auto-deploy to prod.
- **IAM policies + auth flows** — review every line.
- **Cost-affecting infra decisions** — instance sizing, batch sizes, anything that scales spend.
- **Complex architecture** — monolith vs microservices, distributed system tradeoffs. Claude can articulate; humans decide.

## 3. Not yet feasible

- **24/7 autonomous operation** from Claude Code CLI — use Agent SDK or Managed Agents API instead.
- **Autonomous secret rotation** — requires human approval; integrate with Vault/Secrets Manager and treat rotation as a human-gated workflow.
- **Full security review without a human expert** — multi-agent OWASP scanners help, don't replace.
- **Codebases >100K lines in a single session** — context fills fast (effective usable context is ~40-50% of advertised limit under load). Split via subagents or component-scoped sessions.

---

## 4. The tooling landscape (what to actually set up)

### 4.1 Claude Code (CLI) — interactive dev
- Multi-file refactors, test loops, git/PR creation.
- Extended via **subagents** (parallel focused work in fresh contexts), **hooks** (pre/post tool-use shell commands), and **MCP servers** (external tools — GitHub, Prisma, Terraform, internal APIs).

### 4.2 Claude Code on the Web — async cloud sessions
- Each session runs in an isolated VM on Anthropic infra.
- Sessions persist across tab close; credentials live outside the sandbox.
- **Agent View** (research preview, May 2026): unified dashboard for in-flight sessions, runs independent of the terminal that launched them.

### 4.3 Claude Code Routines — scheduled automation
- Launched April 2026.
- Cron-like schedules or webhook triggers.
- One-time setup: prompt + repo + connectors.
- Use cases: nightly dependency audits, issue triage, PR review, docs sync.

### 4.4 Claude Agent SDK — long-running services in your infra
- Python + TypeScript.
- Same agent loop as Claude Code, programmatic.
- Good for queue workers, webhook handlers, scheduled jobs you own.
- Built-in tools: Read/Write/Edit/Bash/Monitor/Glob/Grep/WebSearch/WebFetch/AskUserQuestion.

### 4.5 Managed Agents — Anthropic-hosted production agents
- REST API; Anthropic operates the sandbox and session state.
- Preferred over Agent SDK for production long-running services.
- Common path: prototype with Agent SDK → graduate to Managed Agents.

### 4.6 Observability
- `CLAUDE_CODE_ENABLE_TELEMETRY=1` exports traces/metrics/logs via OpenTelemetry.
- Destinations: Honeycomb, Datadog, Grafana, Langfuse, self-hosted collectors.
- Track per-session: token usage, tool invocations, cost, duration.

### 4.7 Security
- `/security-review` skill (Feb 2026): OWASP 2025 Top 10 + ASVS 5.0, spawns parallel specialist agents (vuln detection, authz, secret scanning, supply chain, IaC, AI-pattern detection, business-logic flaws).
- **Watch:** Check Point disclosed CVE-2025-59536 (CVSS 8.7) and CVE-2026-21852 (CVSS 5.3) — repository-level config files can execute as part of Claude's execution layer. Audit `.github/`, git hooks, pre-commit configs before running Claude on untrusted repos.

---

## 5. Cost framework

**Pricing (May 2026)**

| Model | Input / Output (per 1M tokens) |
|---|---|
| Haiku 4.5 | $1 / $5 |
| Sonnet 4.6 | $3 / $15 |
| Opus 4.7 | $5 / $25 |

**Per-developer monthly estimate (Sonnet 4.6)**

| Usage | Tokens/mo | Cost |
|---|---|---|
| Light (1-2 hr/day) | 20M | $60-90 |
| Medium (4-6 hr/day) | 50M | $150-200 |
| Heavy (8 hr/day) | 100M | $300-400 |
| Multi-agent team (3 agents) | 200M+ | $600-900 |

**Optimization levers**
- **Batch API:** -50% on async workloads.
- **Prompt caching:** -90% on repeated contexts (huge for schema docs, CLAUDE.md, internal API references).
- **Model choice:** default to Sonnet 4.6; reserve Opus for architectural calls.
- **Weekly limits:** automatic cutoff prevents runaway spend.

Stacked, Batch + caching can take eligible workloads to ~95% off.

---

## 6. Action Plan

A four-phase rollout. Each phase has explicit exit criteria — do not skip ahead until the prior phase is measurably working.

### Phase 1 — Foundation & Safety (Weeks 1-2)

**Goal:** guardrails in place, team trained, baseline metrics captured.

- [ ] Install Claude Code CLI; configure API keys (prefer API key over subscription credits for production attribution).
- [ ] Write `CLAUDE.md` at repo root: coding standards, framework choices, "never do X" list, internal API conventions.
- [ ] Configure `.claude/settings.json` with restrictive defaults (see §7).
- [ ] Install `/security-review` skill; add pre-commit `detect-secrets` or `trufflehog`.
- [ ] Create a GitHub Actions workflow that runs `claude -p "review this PR"` on every PR with `allowedTools` limited to Read/Edit. **Do not enable auto-merge.**
- [ ] Run two team demos: one on a non-critical feature, one on a bug fix. Show: writing the prompt, reading the plan, when to interrupt.
- [ ] Start tracking: PR review time, lines changed/session, cost/task. Establish a manual-dev control group.

**Exit criteria:** team can describe the review checklist; CI passes Claude review on at least 3 merged PRs; cost dashboard live.

### Phase 2 — Interactive Development (Weeks 3-6)

**Goal:** Claude is the default for non-critical backend work.

- [ ] Pilot Claude for new feature dev — REST endpoint + schema + tests in one session, human-reviewed before merge.
- [ ] Pilot cross-codebase refactors (where Claude has the clearest advantage over manual work).
- [ ] Standardize approval gates:
  - DB migrations → DBA review
  - Security changes → security team review
  - Production deploys → ops approval
  - Tests must pass before human review starts
- [ ] Author repo-local skills: `/review-pr`, `/update-schema`, `/audit-security`. Commit them to `.claude/skills/`.
- [ ] Weekly retros: what worked, what slowed us down, what to add to `CLAUDE.md`.

**Exit criteria:** ≥50% of merged PRs touched by Claude; no security incidents traced to AI-generated code; team retros report net-positive productivity.

### Phase 3 — Automation & Scaling (Weeks 7-12)

**Goal:** scheduled tasks unattended, CI/CD review automated, optional queue workers.

- [ ] Stand up Claude Code Routines:
  - Nightly dependency audit → PR with updates → CI verifies.
  - Weekly security scan (full repo).
  - Documentation sync after merges to main.
- [ ] Expand CI/CD: auto-implement issues from templates; auto-comment review findings (still no auto-merge).
- [ ] If you have queue-based work (email send, image resize, data sync), prototype one worker with Agent SDK. Extensive logging + cost monitoring before letting it touch production.
- [ ] Cost controls: monthly token budgets per project; weekly variance review; evaluate Batch API for any async workload.
- [ ] Graduate permissions deliberately: read-only → file edits → shell commands. Track regressions.

**Exit criteria:** at least one routine has run unattended for 2 weeks; weekly cost variance under 20% of budget; auto-review PR comments are signal not noise (measured by reviewer feedback).

### Phase 4 — Production Integration (Week 13+)

**Goal:** infra + long-running automation, with humans firmly in the loop for anything irreversible.

- [ ] Production deploy workflow: Claude generates Dockerfile / Terraform / k8s manifests → human reviews `terraform plan` → human triggers apply. Never auto-deploy to prod.
- [ ] Observability: OpenTelemetry export → Datadog/Grafana → alerts on cost overruns, error rate, session duration spikes.
- [ ] Migrate stable Routines → Managed Agents for production scale (avoids subscription weekly limits).
- [ ] Threat-model any Claude-written infra with security; pentest customer-facing APIs Claude built.
- [ ] Document the patterns that worked → codify into shared skills → onboard new team members against them.

**Exit criteria:** one Managed Agent in production with on-call coverage; security sign-off on Claude-touched infra; runbooks exist for "agent went wrong" scenarios.

---

## 7. Default permissions (drop-in `.claude/settings.json`)

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Bash:npm install",
      "Bash:npm test",
      "Bash:npm run build",
      "Bash:git status",
      "Bash:git diff",
      "Bash:git log"
    ],
    "block": [
      "Bash:sudo",
      "Bash:rm -rf",
      "Bash:terraform apply",
      "Bash:kubectl apply",
      "Bash:aws * delete*"
    ]
  }
}
```

## 8. Risk levels & escalation

| Risk | Examples | Approval |
|---|---|---|
| Low | Style, comments, test additions | Code review |
| Medium | Feature impl, bug fix, refactor | Code + tech lead |
| High | DB migrations, API changes, CI/CD | Code + lead + architect |
| Critical | Prod deploy, auth changes, DR | Code + lead + architect + ops |

## 9. Always-human-review list

1. Database schema changes (even when tests pass — verify backward compat).
2. Production deployments — review the plan, then apply.
3. Auth, payments, data-access controls.
4. Major dependency upgrades — read the changelog.
5. Anything that changes infra cost.
6. Anything that touches secrets — Claude never creates them; external secret manager only.
7. Business-logic policy (pricing, approvals, eligibility).

---

## 10. First-week starter pack

If you want to start tomorrow, do these five things:

1. Create `CLAUDE.md` at repo root with the team's stack, conventions, and a short "never do X" list.
2. Drop in the `.claude/settings.json` above.
3. Install `/security-review`. Run it on the current branch and triage findings.
4. Add a GitHub Action that runs `claude -p "review this PR"` on PR open with read-only tools and posts a comment. No auto-merge.
5. Pick one routine to schedule for week 2: nightly `npm outdated` → PR with updates. Measure success after two weeks before scheduling anything else.

---

## Sources

Anthropic docs (code.claude.com, docs.claude.com, platform.claude.com), Claude Agent SDK docs, Claude Code on the Web docs, and 2025-2026 production write-ups (Vercel, Railway, GitLab, Snyk, Prisma, SigNoz, Penligent, Verdent, Check Point Research CVE disclosures, Veracode 2025 AI code-quality study). Full URL list available in the research transcript.
