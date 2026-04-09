Use the repo-local OSpec Lite authoring pack to fill or refresh project documentation.

1. Read `{{authoringPackRoot}}/fill-project-docs.md` first.
2. Read `{{authoringPackRoot}}/project-brief.md` and `{{authoringPackRoot}}/repo-reading-checklist.md`.
3. Fill `{{authoringPackRoot}}/evidence-map.md` before editing the final docs.
4. Update `AGENTS.md`, `CLAUDE.md`, `{{docsRoot}}/*`, and `{{agentDocsRoot}}/*` from evidence.
5. Mark uncertain conclusions as `推断` or `待确认`.
6. If `$ARGUMENTS` is provided, treat it as the priority area to inspect first, but still keep the final docs globally consistent.
7. Run `oslite docs verify .` before stopping when the command is available in the environment.
