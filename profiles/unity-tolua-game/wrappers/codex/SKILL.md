---
name: oslite-fill-project-docs
description: Fill or refresh OSpec Lite project documentation for a profiled repository by following the repo-local authoring pack. Use when Codex should read the codebase, update docs/agents/authoring/evidence-map.md first, then write AGENTS.md, CLAUDE.md, docs/project/*, docs/agents/*, and finish with docs verification.
---

# OSpec Lite Project Docs

Follow the repo-local authoring pack instead of inventing a new workflow.

1. Read `{{authoringPackRoot}}/fill-project-docs.md` first.
2. Read `{{authoringPackRoot}}/project-brief.md` and `{{authoringPackRoot}}/repo-reading-checklist.md`.
3. Fill `{{authoringPackRoot}}/evidence-map.md` before editing the final docs.
4. Use `{{authoringPackRoot}}/doc-contract.md` as the output contract.
5. Update `AGENTS.md`, `CLAUDE.md`, `{{docsRoot}}/*`, and `{{agentDocsRoot}}/*` from evidence, not from guesses.
6. Mark uncertain conclusions as `推断` or `待确认`.
7. Keep temporary or helper directories out of the core project narrative unless the repo clearly treats them as first-class architecture.
8. Run `oslite docs verify .` before stopping when the command is available in the environment.
