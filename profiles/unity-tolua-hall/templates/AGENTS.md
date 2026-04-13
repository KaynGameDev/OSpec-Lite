# Agent Guide

{{managedStart}}
## What This Repo Is

- Profile: `{{profileId}}`
- This is the reading and documentation workflow entry for a Unity + ToLua hall repository.
- This profile describes the hall repo itself. Individual subgame modules are expected to live under `Assets/_GameModule/<game>/`.
- Start the startup-chain model from `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`, `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`, and `Assets/_GameCenter/ClientLua/Main.lua`.
- If the user asks to initialize with the `unity-tolua-hall` profile and `.oslite/config.json` is missing, infer the project name, ask the user to confirm it, and then run `oslite init --profile unity-tolua-hall --project-name "<project-name>" --bootstrap-agent <current-host-or-none> .`.
- Fill `{{authoringPackRoot}}/evidence-map.md` before final docs.

## Hard Rules

- Read the repo before you write docs. Do not copy placeholders into final conclusions.
- Mark any conclusion that is not code-confirmed as `Inferred` or `Pending`.
- Treat `Assets/_GameCenter/` as the default hall core.
- If the task depends on subgame logic, look in `Assets/_GameModule/<game>/` first and read that subgame repo's `AGENTS.md` or `CLAUDE.md` before drawing conclusions.
- Treat runtime C# edits as opt-in. Before changing non-Editor C# scripts, ask the user for explicit permission because those changes usually require republishing the APK.
- You may skip that extra permission only when the user explicitly asks for C# changes or the target is a Unity Editor script in an editor-only scope such as `Assets/Editor/`.
- Treat real-money payment code as approval-sensitive. If a change touches payment, order creation, receipt validation, payout, cashier, or channel billing flows, pause and double-check the intended modification with the user before editing.
- Expand `_GameWrap`, `Channel`, `UnityInterface`, and `Tools` only when the code proves they are part of the current task.
- Keep generated wrappers, editor-only directories, and test scenes out of the core hall narrative unless the task directly depends on them.

## High-Risk Areas

- `Assets/_GameCenter/ClientLua/Main.lua`: hall Lua entry and `GameInit / GameStart`.
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`: startup orchestration and host-to-Lua notifications.
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`: login, hall, subgame entry, and return-to-hall coordination.
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`: hall socket lifecycle, reconnect, and request routing.
- `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`: hall hot-update and asset reload flow.
- Payment, cashier, order, receipt-validation, and channel billing paths: treat these as user-confirmation-sensitive even when the code surface looks routine.
- `{{authoringPackRoot}}/project-brief.md`: repo-specific assumptions and exclusions.
- `{{authoringPackRoot}}/evidence-map.md`: evidence-first scratchpad that final docs must follow.

## Read Next

- `{{authoringPackRoot}}/fill-project-docs.md`
- `{{authoringPackRoot}}/doc-contract.md`
- `{{authoringPackRoot}}/project-brief.md`
- `{{authoringPackRoot}}/repo-reading-checklist.md`
- `{{authoringPackRoot}}/evidence-map.md`
{{managedEnd}}
