# Claude Code Project Memory

{{managedStart}}
## Shared Instructions Import

@AGENTS.md

## Claude Code Notes

- If the user asks to initialize with the `unity-tolua-hall` profile and `.oslite/config.json` is missing, infer the project name, ask the user to confirm it, and then run `oslite init --profile unity-tolua-hall --project-name "<project-name>" --bootstrap-agent claude-code .`. If the host is unclear, use `none`.
- Read @{{authoringPackRoot}}/fill-project-docs.md first.
- Fill @{{authoringPackRoot}}/evidence-map.md before finalizing `.oslite/docs/project/*` and `.oslite/docs/agents/*`.
- Use the hall startup anchors in `Launch.cs`, `Main.cs`, and `Main.lua` as the default first-read path.
{{managedEnd}}
