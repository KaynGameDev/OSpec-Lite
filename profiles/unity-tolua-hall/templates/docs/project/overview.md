# Project Overview

## What This Project Is
Conclusion:
- TBD: Explain what kind of hall / host repo this is and which common responsibilities it owns.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/CC.lua`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
Status:
- Pending
Open Questions:
- TBD: Which responsibilities should stay in the core hall narrative and which should be boundary-only notes?

## Core Areas
Conclusion:
- TBD: Summarize the formal split between hall core, host layer, LuaFramework, subgame support, and external boundaries.
Evidence Files:
- `Assets/_GameCenter`
- `Assets/_GameModule`
- `Channel`
- `UnityInterface`
Status:
- Pending
Open Questions:
- TBD: Which parts of subgame behavior belong in this hall repo narrative, and which should redirect readers to a game repo's `AGENTS.md` or `CLAUDE.md`?

## Main Flow
Conclusion:
- TBD: Summarize the real top-level flow from host startup to login / hall entry to subgame entry / return.
Evidence Files:
- `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`
- `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
Status:
- Pending
Open Questions:
- TBD: Which side flows need their own callout, such as reconnect, hot update, or auto-enter?

## First Read Recommendation
Conclusion:
- TBD: Give the smallest useful reading order for a new engineer picking up this hall repo, including when to switch into a subgame repo.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
- `Assets/_GameModule`
Status:
- Pending
Open Questions:
- TBD: Which directories only matter for specialized tasks and can be delayed?
