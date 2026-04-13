# Coding Rules

## Naming And Annotation
Conclusion:
- TBD: Summarize naming patterns, view / controller naming, and comment / annotation expectations in this hall repo.
Evidence Files:
- `Assets/_GameCenter/ClientLua/CC.lua`
- `Assets/_GameCenter/ClientLua/View`
- `Assets/_GameCenter/ClientLua/Model`
Status:
- Pending
Open Questions:
- TBD: Are there additional directory-level naming constraints?

## Runtime C# Change Policy
Conclusion:
- TBD: Explain the team's rule that packaged runtime C# changes should only happen with explicit user approval, while Unity Editor scripts are the main exception.
Evidence Files:
- `Assets/_GameCenter/FrameWork`
- `Assets/_GameCenter/LuaFramework/Scripts`
- `Assets/Editor`
Status:
- Pending
Open Questions:
- TBD: Which directories count as safely editor-only in this repo's current structure?

## Payment Change Policy
Conclusion:
- TBD: Explain the team's rule that real-money payment, order, receipt-validation, payout, cashier, and billing changes must be double-checked with the user before editing.
Evidence Files:
- `Assets/_GameCenter/ClientLua`
- `Assets/_GameCenter/FrameWork`
- `Channel`
- `UnityInterface`
Status:
- Pending
Open Questions:
- TBD: Which payment-related directories, modules, and SDK bridges are considered approval-sensitive in this repo?

## Module Wiring And Require Conventions
Conclusion:
- TBD: Explain the `CC.Init()` / `CC.SetFileRequire()` conventions and how Manager / Define / DataMgr modules are wired.
Evidence Files:
- `Assets/_GameCenter/ClientLua/CC.lua`
- `Assets/_GameCenter/ClientLua/Main.lua`
Status:
- Pending
Open Questions:
- TBD: Which modules must be accessed through `CC` and which are expected to be required directly?

## View And Controller Boundaries
Conclusion:
- TBD: Explain how View, controller, and ViewManager responsibilities are split.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/ClientLua/View`
Status:
- Pending
Open Questions:
- TBD: Which views are special cases that do not follow the usual ViewManager path?

## Lifecycle And Notification Cleanup
Conclusion:
- TBD: Explain how pause / resume / back, notification cleanup, timers, and view teardown are supposed to be handled.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/ClientLua/Common`
Status:
- Pending
Open Questions:
- TBD: Is there a shared unregister / dispose pattern that should be called out?

## Resource, Hot-Update, And Scene Risk
Conclusion:
- TBD: Summarize the risky rules around hot update, downloads, AssetBundle reload, scene switches, and subgame entry.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`
- `Assets/_GameCenter/LuaFramework/Scripts/Manager/NEO_PARTY_GAMES_GameManager.cs`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
Status:
- Pending
Open Questions:
- TBD: Which changes are most likely to break both the hall and subgames at once?

## Common Review Traps
Conclusion:
- TBD: Summarize the most common regression traps such as global-state side effects, reconnect state drift, auto-enter side effects, and missed cleanup.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
- `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`
Status:
- Pending
Open Questions:
- TBD: Which project-specific traps still need to be added?
