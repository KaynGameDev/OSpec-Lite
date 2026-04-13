# Documentation Contract

## Goal
- Produce project docs that are directly useful for future repo reading and code review in a hall repository.
- Make it possible for a new teammate or LLM to reconstruct the hall startup chain, hall flow, network flow, and hot-update flow from the generated docs alone.

## Doc Scope
- `AGENTS.md`
- `CLAUDE.md`
- `.oslite/docs/project/overview.md`
- `.oslite/docs/project/architecture.md`
- `.oslite/docs/project/repo-map.md`
- `.oslite/docs/project/entrypoints.md`
- `.oslite/docs/project/glossary.md`
- `.oslite/docs/project/coding-rules.md`
- `.oslite/docs/agents/quickstart.md`
- `.oslite/docs/agents/change-playbook.md`

## Working Method
- Read the repo first and write docs second.
- Fill `evidence-map.md` before final docs.
- Optimize for future repo reading, entry-point discovery, impact analysis, and code review.
- Write engineering docs, not README-style promotion copy.

## Key Writing Rules
- Anything not code-confirmed must be marked as `Inferred` or `Pending`.
- Do not treat editor-only, generated, test-scene, or one-off helper areas as core hall structure.
- Use `Assets/_GameCenter/FrameWork/Behaviours/Launch.cs`, `Assets/_GameCenter/LuaFramework/Scripts/Main.cs`, and `Assets/_GameCenter/ClientLua/Main.lua` as the default startup anchors.

## Exclusions
- Repo areas outside the current documentation scope
- README expansion work
- Internal details of temporary, generated, or throwaway helper directories
