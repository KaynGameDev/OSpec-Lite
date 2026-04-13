# Entrypoints

## Host Startup Entry
Conclusion:
- TBD: Explain the host-side startup anchor and why it is the beginning of the hall startup chain.
Evidence Files:
- `Assets/_GameCenter/Root/root.unity`
- `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`
- `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`
- `Assets/_GameCenter/ClientLua/Main.lua`
Status:
- Pending
Open Questions:
- TBD: If anything runs before `root.unity`, document it here.

## Lua Startup Entry
Conclusion:
- TBD: Explain how `Main.lua` enters `GameInit / GameStart` and how `CC.Init()` assembles hall runtime modules.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/CC.lua`
Status:
- Pending
Open Questions:
- TBD: Is there any extra Lua bootstrap or hot-reload entry that belongs here?

## Hall Main Flow Entry
Conclusion:
- TBD: Explain where login, hall main-scene entry, and primary hall view startup really begin.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/_Resources/HallScene/main.unity`
Status:
- Pending
Open Questions:
- TBD: Which views are true flow entries and which are later feature pages?

## Network Entry
Conclusion:
- TBD: Explain the unified entry for socket lifecycle, requests, push dispatch, and reconnect.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
- `Assets/_GameCenter/FrameWork/IO/NEO_PARTY_GAMES_Launcher.cs`
Status:
- Pending
Open Questions:
- TBD: Are there parallel HTTP or platform-network entries that also need coverage?

## Resource And Hot-Update Entry
Conclusion:
- TBD: Explain the entry points for hall hot update, resource download, AssetBundle reload, and path baselines.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`
- `Assets/_GameCenter/LuaFramework/Scripts/Manager/NEO_PARTY_GAMES_GameManager.cs`
- `Assets/_GameCenter/LuaFramework/Scripts/Common/NEO_PARTY_GAMES_AppConst.cs`
Status:
- Pending
Open Questions:
- TBD: What evidence is still missing for the hall-vs-subgame asset boundary?

## Enter Subgame And Return To Hall Entry
Conclusion:
- TBD: Explain the key entry points for `EnterGame`, scene changes, return-to-hall, and resource reset, including when to hand off to a subgame repo.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/LuaFramework/Scripts/Manager/NEO_PARTY_GAMES_GameManager.cs`
- `Assets/_GameModule`
Status:
- Pending
Open Questions:
- TBD: Which subgame-entry details are hall-owned, and which should be documented from the target game repo's `AGENTS.md` or `CLAUDE.md`?
