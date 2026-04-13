# Unity + ToLua Hall Profile

`unity-tolua-hall` is an OSpec Lite profile for Unity + ToLua hall repositories.

It does not hard-code project facts. Instead, it initializes a hall repo into a repeatable workflow that helps Codex / Claude Code read the repo, fill project docs, and review risky changes with the right hall-specific anchors.

## Best Fit

Use this profile when:
- this is the hall repo, not an individual game repo
- the hall runtime is centered in `Assets/_GameCenter/`
- the startup chain runs through `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`, `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`, and `Assets/_GameCenter/ClientLua/Main.lua`
- any game submodule is expected to live under `Assets/_GameModule/<game>/`
- agents should switch to the target subgame repo and read its `AGENTS.md` or `CLAUDE.md` before reasoning about subgame-specific logic
- the repo also contains hall-adjacent boundaries like `_GameModule`, `_GameWrap`, `Channel`, `UnityInterface`, and `Tools`

## Recommended Prompt

```text
Help me use the unity-tolua-hall profile to init ospec-lite. If the repo is not initialized yet, infer the project name and ask me to confirm it first. Then fill evidence-map before the final docs, and finish with oslite docs verify.
```

## Expected Agent Flow

1. Check whether the repo is already initialized for `unity-tolua-hall`.
2. If not, infer the project name and ask the user to confirm it.
3. Run `oslite init --profile unity-tolua-hall ...`.
4. Fill `.oslite/docs/agents/authoring/evidence-map.md` first.
5. Then backfill `AGENTS.md`, `CLAUDE.md`, `.oslite/docs/project/*`, and `.oslite/docs/agents/*`.
6. Finish with `oslite docs verify .`.

## Notes

- This profile locks in hall-specific entry anchors such as `Assets/_GameCenter/ClientLua/Main.lua`.
- It also tells agents to treat `Assets/_GameModule/<game>/` as the starting point for subgame logic and to read that game repo's agent instructions first.
- It tells agents to ask for permission before changing non-Editor C# scripts, because runtime C# edits usually require an APK republish.
- It tells agents to double-check any real-money payment-related change with the user before editing payment, order, receipt, payout, cashier, or billing paths.
- Everything else should come from repo reading and evidence, not from template guesses.
- In non-interactive environments, pass both `--project-name` and `--bootstrap-agent`.
