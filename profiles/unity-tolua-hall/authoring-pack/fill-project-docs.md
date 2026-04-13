# Fill Project Docs

## When The User Simply Says "use the unity-tolua-hall profile to init ospec-lite"
1. Check whether the repo is already initialized for `unity-tolua-hall`.
2. If not initialized:
   - infer the project name from the repo name, README, and visible product naming
   - ask the user to confirm that inferred project name
   - if the user did not specify a bootstrap agent, default to the current host agent; if unclear, use `none`
   - run `oslite init --profile unity-tolua-hall --project-name "<project-name>" --bootstrap-agent <codex|claude-code|none> .`
3. If already initialized, do not rerun `init`.

## Phase 1: Read The Repo And Fill The Evidence Map
1. Read `project-brief.md` first.
2. Use `repo-reading-checklist.md` to explore the repo.
3. Fill `evidence-map.md` before touching the final docs.
4. Build the startup-chain mental model from `Launch.cs`, `Main.cs`, and `Main.lua`.
5. Validate hall / subgame transitions through `ViewManager.lua`.
6. If the task requires subgame logic, switch into `Assets/_GameModule/<game>/` and read that subgame repo's `AGENTS.md` or `CLAUDE.md` before writing conclusions about the game.

## Phase 2: Backfill The Final Docs From Evidence
1. Update `AGENTS.md`, `CLAUDE.md`, `.oslite/docs/project/*`, and `.oslite/docs/agents/*`.
2. For key sections, use the shared evidence structure: `Conclusion / Evidence Files / Status / Open Questions`.
3. Never write a conclusion as confirmed when there is no code evidence for it.
4. Keep editor-only, generated, test-scene, and throwaway helper areas out of the core hall docs.
5. Keep subgame-specific conclusions scoped to the relevant `Assets/_GameModule/<game>/` repo instead of mixing them into the hall narrative without evidence.

## Stop Checklist
- `project-brief.md` reviewed
- `evidence-map.md` filled for the important sections
- no `TBD` placeholders left in the final docs
- every evidence path really exists
- `oslite docs verify .` has been run
