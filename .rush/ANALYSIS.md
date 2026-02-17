# arken/packages/seer/packages/protocol/.rush/ANALYSIS.md

## Folder purpose in project context
Rush workspace cache/lock metadata boundary for `packages/protocol`.

## Notable files and responsibilities
- `temp/shrinkwrap-deps.json`: generated package graph + integrity map used by Rush installs.

## Protocol/test relevance
- Not runtime protocol logic.
- Indirectly affects reproducibility of protocol package dependency resolution.

## Risks / gaps / follow-ups
- Manual edits can desynchronize install determinism from declared workspace state.
- Keep regeneration ownership explicit (Rush commands), avoid ad-hoc patching in this folder.
