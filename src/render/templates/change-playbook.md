# Change Playbook

## Start A Change

1. Create a change with `oslite change new <slug> .`
2. Capture the request in `request.md`
3. Write the intended approach in `plan.md`

## Plan Before Editing

- Clarify scope, affected files, and expected risks.
- Do not start broad refactors without writing them down first.

## Record Applied Work

- Update `apply.md` with the files you changed and any deviation from plan.
- Move the change status to `applied` when the implementation is complete locally.

## Record Verification

- Add checks, manual validation notes, and remaining risks to `verify.md`.
- Move the change status to `verified` after validation.

## Archive When Done

- Archive only after the change status is `verified`.
- Use `oslite change archive <path>` to move the change into history.
