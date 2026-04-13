# Evidence Map

## Core Area Decision
Conclusion:
- TBD: Explain whether the hall core is really centered in `Assets/_GameCenter/`, and how `_GameModule`, `Channel`, `UnityInterface`, and `Tools` should be classified.
Evidence Files:
- `Assets/_GameCenter`
- `Assets/_GameModule`
- `Channel`
- `UnityInterface`
Status:
- Pending
Open Questions:
- TBD: Which boundaries belong in the final hall narrative, and when should a reader switch to a subgame repo's `AGENTS.md` or `CLAUDE.md`?

## Host Startup Chain
Conclusion:
- TBD: Trace the real startup chain from Unity scene boot through host startup into Lua preparation.
Evidence Files:
- `Assets/_GameCenter/Root/root.unity`
- `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`
- `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`
- `Assets/_GameCenter/ClientLua/Main.lua`
Status:
- Pending
Open Questions:
- TBD: Is there any earlier bootstrap scene or platform launcher that must be included?

## Lua Init And Hall Entry Chain
Conclusion:
- TBD: Explain the actual order between `Main.lua`, `CC.lua`, `HallCenter.lua`, and `ViewManager.CommonEnterMainScene()`.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/CC.lua`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/_Resources/HallScene/main.unity`
Status:
- Pending
Open Questions:
- TBD: What else must be ready before the hall can enter its main flow?

## Hall Flow And View Switching
Conclusion:
- TBD: Describe the hall's steady-state flow, main view stack, and replace/open/close coordination points.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/ClientLua/View/ViewCenter.lua`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
Status:
- Pending
Open Questions:
- TBD: Which views are true flow entry points and which are only secondary panels?

## Network Entry
Conclusion:
- TBD: Explain the hall socket lifecycle, request flow, push dispatch, reconnect path, and back-to-login triggers.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
- `Assets/_GameCenter/FrameWork/IO/NEO_PARTY_GAMES_Launcher.cs`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
Status:
- Pending
Open Questions:
- TBD: Are there parallel HTTP or platform-network paths that need to be documented too?

## Resource And Hot-Update Entry
Conclusion:
- TBD: Explain hot update, hall resource download, AssetBundle reload, and hall path baselines.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`
- `Assets/_GameCenter/LuaFramework/Scripts/Manager/NEO_PARTY_GAMES_GameManager.cs`
- `Assets/_GameCenter/LuaFramework/Scripts/Common/NEO_PARTY_GAMES_AppConst.cs`
Status:
- Pending
Open Questions:
- TBD: Where exactly is the boundary between hall assets and subgame assets?

## Enter Subgame And Return To Hall
Conclusion:
- TBD: Explain how the hall enters subgames, changes scenes, releases hall resources, and rebuilds after returning.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/LuaFramework/Scripts/Manager/NEO_PARTY_GAMES_GameManager.cs`
- `Assets/_GameModule`
Status:
- Pending
Open Questions:
- TBD: Which parts of subgame flow remain hall-owned, and which should be delegated to the target subgame repo docs?

## External Boundaries And Plugins
Conclusion:
- TBD: List native bridge, channel, social, payment, tracking, and other integration boundaries.
Evidence Files:
- `Assets/_GameCenter/FrameWork/Common/Client.cs`
- `Channel`
- `UnityInterface`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
Status:
- Pending
Open Questions:
- TBD: Which third-party SDKs are core runtime dependencies and which are peripheral?

## Stack Signals
Conclusion:
- TBD: Confirm the real stack signals such as Unity, ToLua, protobuf, AssetBundle, host bridge, and generated wrappers.
Evidence Files:
- `Assets/_GameCenter/LuaFramework`
- `Assets/_GameCenter/ClientLua/Model/Network`
- `Assets/_GameCenter/FrameWork`
Status:
- Pending
Open Questions:
- TBD: Is there any repo-specific framework or generation chain that deserves its own label?
