# Repo Reading Checklist

## Top-Level Structure
- Confirm whether `Assets/_GameCenter/` is the true hall core.
- Separate `ClientLua/`, `FrameWork/`, `LuaFramework/`, and `_Resources/` responsibilities.
- Confirm whether individual subgame modules are mounted under `Assets/_GameModule/<game>/`.
- If subgame code is needed, read the target subgame repo's `AGENTS.md` or `CLAUDE.md` before documenting its flow.
- Classify `_GameModule`, `_GameWrap/Generate`, `Channel`, `UnityInterface`, and `Tools` as subgame, generated, packaging, native bridge, or tooling boundaries.

## Startup And Flow
- Use `Assets/_GameCenter/ClientLua/Main.lua` as the default Lua startup anchor.
- Trace the host startup path from `Launch.cs` to `Main.cs` to `Main.lua`.
- Find the real order between `CC.Init()`, `HallCenter.InitBeforeLogin()`, `HallCenter.InitAfterLoading()`, and `ViewManager.CommonEnterMainScene()`.
- Confirm where login, hall enter, subgame enter, return to hall, and reconnect transitions actually happen.

## Resources And Network
- Identify the hall long-connection entry, request / push dispatch, and reconnect path in `Network.lua` and `NEO_PARTY_GAMES_Launcher.cs`.
- Identify the hot-update, download, asset reload, and subgame-load path in `ResDownloadManager.lua` and `NEO_PARTY_GAMES_GameManager.cs`.
- Confirm the path / config baseline in `NEO_PARTY_GAMES_AppConst.cs`.

## Lifecycle
- Find how pause, resume, back, screen events, and low-memory callbacks bridge into Lua.
- Find where view cleanup, notification cleanup, timers, downloaders, and scene-switch cleanup close out.
- Confirm what gets released or rebuilt when entering a subgame or returning to the hall.

## Boundaries And Stack
- Identify native bridge and SDK boundaries such as `Client.cs`, `Channel`, `UnityInterface`, Firebase, Facebook, Adjust, or payment integrations.
- Confirm the repo-level stack signals: Unity, ToLua, protobuf, AssetBundle, and host bridge patterns.
