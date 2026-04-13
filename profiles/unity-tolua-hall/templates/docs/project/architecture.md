# Architecture

## Host Startup Chain
Conclusion:
- TBD: Explain the Unity scene boot, host startup script, and LuaFramework initialization order.
Evidence Files:
- `Assets/_GameCenter/Root/root.unity`
- `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`
- `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`
- `Assets/_GameCenter/ClientLua/Main.lua`
Status:
- Pending
Open Questions:
- TBD: Is there any even-earlier bootstrap scene or platform launcher?

## Lua Init And Hall Entry Chain
Conclusion:
- TBD: Explain how `Main.lua`, `CC.lua`, `HallCenter.lua`, and `ViewManager.CommonEnterMainScene()` cooperate.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/CC.lua`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
Status:
- Pending
Open Questions:
- TBD: What separates pre-login startup from the post-loading hall flow?

## Hall Runtime Chain
Conclusion:
- TBD: Explain how hall runtime state, view management, notifications, timers, and network work together.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
Status:
- Pending
Open Questions:
- TBD: Which managers are truly persistent and which are only on-demand?

## Enter Subgame And Return To Hall Chain
Conclusion:
- TBD: Explain how the hall enters subgames, loads modules, releases hall state, and restores after return.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/LuaFramework/Scripts/Manager/NEO_PARTY_GAMES_GameManager.cs`
- `Assets/_GameModule`
Status:
- Pending
Open Questions:
- TBD: Which parts of subgame architecture stay in the hall repo, and when should documentation switch to a subgame repo's `AGENTS.md` or `CLAUDE.md`?

## Layers And Boundaries
Conclusion:
- TBD: Summarize the boundaries between hall Lua, host C#, native bridge, packaging, and SDK integrations.
Evidence Files:
- `Assets/_GameCenter/FrameWork/Common/Client.cs`
- `Channel`
- `UnityInterface`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
Status:
- Pending
Open Questions:
- TBD: Which boundaries are part of the core runtime path and which are peripheral integrations?
