@AGENTS.md

## Claude Code notes

- Project conventions live in `AGENTS.md` (imported above).
- No comments in code, ever: the why goes in commits and PRs. Only the tool
  directives listed under "No comments in code" in `AGENTS.md` stay.
- Claude Code subagents for this repo are defined in `.claude/agents/`
  (`drizzle-migration-writer`, `hono-route-author`, `i18n-fr-reviewer`,
  `tanstack-route-scaffolder`).
