# Quickstart

## Suggested Read Order
1. `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`
2. `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`
3. `Assets/_GameCenter/ClientLua/Main.lua`
4. `Assets/_GameCenter/ClientLua/CC.lua`
5. `Assets/_GameCenter/ClientLua/Model/HallCenter.lua`
6. `Assets/_GameCenter/ClientLua/Model/Manager/ViewManager.lua`
7. `Assets/_GameCenter/ClientLua/Model/Network/Network.lua`
8. `Assets/_GameCenter/ClientLua/Model/ResDownload/ResDownloadManager.lua`

## Suggested Search Keywords
- `GameInit`
- `InitBeforeLogin`
- `CommonEnterMainScene`
- `EnterGame`
- `ReloadHallAssetBundles`
- `_hallServerTag`
- `NotificationToLua`
- `EmmyLua`

## Review Priorities
- Check whether the startup chain `Launch.cs` -> `Main.cs` -> `Main.lua` still holds.
- Check whether hall flow ownership still lives in `HallCenter.lua` and `ViewManager.lua`.
- Check whether `Network.lua` still handles connect / reconnect / disconnect transitions safely.
- Check whether `ResDownloadManager.lua` and `NEO_PARTY_GAMES_GameManager.cs` still keep update / reload side effects under control.
- Check that new Lua classes and complex functions include EmmyLua annotations when needed.
- Pause for explicit permission before changing packaged runtime C# scripts; Editor-only scripts are the main exception.
- Pause to double-check with the user before changing real-money payment, order, receipt, payout, cashier, or billing flows.

## Time Sinks To Avoid
- `Assets/Editor/`
- `Assets/_GameWrap/Generate/`
- `Assets/Common/Unity-Logs-Viewer/Reporter/Test/`
- deep third-party plugin internals unless the task explicitly depends on them
