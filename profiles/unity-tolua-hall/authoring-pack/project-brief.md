# Project Brief

## Basics
- Project name: `{{projectName}}`
- Document language: `{{documentLanguage}}`
- Profile: `{{profileId}}`
- Bootstrap agent: `{{bootstrapAgent}}`

## Candidate Core Directories
- `Assets/_GameCenter/ClientLua/`
- `Assets/_GameCenter/FrameWork/`
- `Assets/_GameCenter/LuaFramework/`
- `Assets/_GameCenter/_Resources/`

## Explicitly Excluded Directories
- `Assets/Editor/`
- `Assets/_GameWrap/Generate/`
- `Assets/Common/Unity-Logs-Viewer/Reporter/Test/`

## Known Entry Hints
- Host startup baseline: `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs` -> `Assets/_GameCenter/LuaFramework/Scripts/Main.cs` -> `Assets/_GameCenter/ClientLua/Main.lua`
- Scene baseline: `Assets/_GameCenter/Root/root.unity` and `Assets/_GameCenter/_Resources/HallScene/main.unity`

## Other Repo-Specific Hints
- Keep the core hall narrative centered on `Assets/_GameCenter/`.
- This profile is for the hall repo. Treat individual subgame modules under `Assets/_GameModule/<game>/` as separate reading scopes.
- If the task moves into a subgame, start by reading that subgame repo's `AGENTS.md` or `CLAUDE.md` before documenting or changing the subgame flow.
- Runtime C# changes normally require an APK republish, so agents should ask for explicit permission before editing non-Editor C# scripts.
- Unity Editor scripts in editor-only scopes such as `Assets/Editor/` are the main exception and do not need that extra approval when they are the stated target.
- This hall repo owns real-money payment responsibilities. If a change touches payment, order, receipt, payout, cashier, or billing code, agents should double-check the intended modification with the user before editing.
- Treat `Assets/_GameModule/`, `Channel/`, `UnityInterface/`, and `Tools/` as boundary areas unless the task proves they belong in the current hall flow.
- Mark anything not yet code-confirmed as `Inferred` or `Pending`.
