# Change Playbook

## Before You Start
- Classify the change first: startup, login, hall flow, network, hot update, subgame entry, or native boundary.
- Read `evidence-map.md`, `entrypoints.md`, and `coding-rules.md` before changing behavior.
- If the change adds a Lua class or a complex Lua function, add the needed EmmyLua annotations.
- Before editing non-Editor C# scripts, get explicit user approval unless the user already asked for runtime C# changes.
- Unity Editor scripts in editor-only scopes such as `Assets/Editor/` can be changed without that extra approval when they are the stated target.
- Before editing payment-sensitive areas such as payment, order, receipt, payout, cashier, or billing flows, double-check the intended modification with the user.

## When You Must Update Docs
- When you change `Assets/_GameCenter/ClientLua/Main.lua`, `HallCenter.lua`, `ViewManager.lua`, `Network.lua`, or `ResDownloadManager.lua`
- When you change the startup chain, scene-switch chain, subgame entry chain, or return-to-hall chain
- When you move directory responsibilities or change a team rule such as Lua annotation policy or view/controller structure

## When Not To Expand Core Project Docs
- Editor-only work in `Assets/Editor/`
- generated wrapper updates in `Assets/_GameWrap/Generate/`
- test-scene or throwaway-tool changes that do not affect the hall runtime
- third-party plugin internals that do not change hall behavior or documented boundaries

## Final Checks
- Final docs, not just `evidence-map.md`, have been updated where needed
- No `TBD` placeholders remain in final docs
- Evidence paths still exist
- `oslite docs verify .` has been run
