# Repo Map

## Main Code Directories
Conclusion:
- TBD: List the directories that truly hold the hall's core code.
Evidence Files:
- `Assets/_GameCenter/ClientLua`
- `Assets/_GameCenter/FrameWork`
- `Assets/_GameCenter/LuaFramework`
- `Assets/_GameCenter/_Resources`
Status:
- Pending
Open Questions:
- TBD: Are there any other core directories that need to be included?

## Responsibility Guide
Conclusion:
- TBD: Explain what `_GameCenter`, `_GameModule`, `_GameWrap`, `Channel`, and `UnityInterface` each own.
Evidence Files:
- `Assets/_GameCenter`
- `Assets/_GameModule`
- `Assets/_GameWrap`
- `Channel`
- `UnityInterface`
Status:
- Pending
Open Questions:
- TBD: When should readers stay in the hall docs, and when should they switch to a subgame repo's `AGENTS.md` or `CLAUDE.md`?

## Change Navigation
Conclusion:
- TBD: Group the main change surfaces by startup, hall flow, network, hot update, and native boundary.
Evidence Files:
- `Assets/_GameCenter/ClientLua/Main.lua`
- `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
- `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
- `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`
- `Assets/_GameCenter/FrameWork/Common/Client.cs`
Status:
- Pending
Open Questions:
- TBD: Which common change hotspots are still missing from this map?

## Non-Core Areas
Conclusion:
- TBD: List the directories that should normally stay out of the core hall narrative.
Evidence Files:
- `Assets/Editor`
- `Assets/_GameWrap/Generate`
- `Assets/Common/Unity-Logs-Viewer/Reporter/Test`
- `Tools`
Status:
- Pending
Open Questions:
- TBD: Are there any other areas that should be explicitly excluded?
