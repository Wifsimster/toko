# Subagents — Golden Rules

Tokō ships project-scoped Claude Code subagents in `.claude/agents/`. Each agent is a markdown file with YAML frontmatter that Claude Code loads automatically. These rules govern how new agents are added and how existing ones must stay shaped.

## The Golden Rules

1. **Single responsibility.** One agent, one job. If you can describe the agent with the word "and", split it.
2. **Action-oriented `description`.** The `description` must say *what* the agent does and *when* to use it, in one sentence. Claude Code uses this string to decide whether to invoke the agent — vague descriptions get ignored.
3. **Minimal `tools` allowlist.** Grant only the tools the agent actually uses. Read-only reviewers must not have `Edit` or `Write`. Never grant `Bash` to an agent that does not run commands.
4. **Model matches task weight.** `haiku` for lookups and reviews, `sonnet` for code generation, `opus` only when reasoning depth is genuinely required.
5. **Explicit scope and non-scope.** The system prompt lists which directories the agent owns and which it must not touch. When work spills outside scope, the agent reports back instead of editing.
6. **Tokō conventions are baked in.** All agents enforce: French user-facing strings, `parentId` ownership checks on child data, Zod validators from `@focusflow/validators`, no new dependencies without prompt approval.
7. **No overlap with built-ins.** Do not duplicate `Explore`, `Plan`, or `general-purpose`. Project agents exist to encode Tokō-specific workflows, not generic ones.
8. **Deterministic output format.** Each agent ends with an "Output format" section so the orchestrator can parse results without re-reading files.

## Current agents

| File | Purpose | Tools | Model |
|------|---------|-------|-------|
| `drizzle-migration-writer.md` | Adds/edits Drizzle schema + Zod validator + generates migration | Read, Edit, Write, Glob, Grep, Bash | sonnet |
| `hono-route-author.md` | Adds Hono API route with auth + Zod + parentId check | Read, Edit, Write, Glob, Grep, Bash | sonnet |
| `tanstack-route-scaffolder.md` | Adds TanStack Router page + React Query hook + shadcn UI | Read, Edit, Write, Glob, Grep, Bash | sonnet |
| `i18n-fr-reviewer.md` | Read-only scan for non-French user-facing strings | Read, Glob, Grep, Bash | haiku |

## Adding a new agent

1. Create `.claude/agents/<kebab-name>.md`.
2. Frontmatter must include `name`, `description`, `tools`, `model`.
3. Body sections, in this order: scope, required steps, constraints, output format.
4. Run a dry invocation and confirm the agent stays inside its declared scope before merging.
5. Update the table above.

## Deleting an agent

Delete the file and remove its row from the table. No deprecation period — agents are cheap to recreate.
