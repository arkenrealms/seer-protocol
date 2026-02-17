# arken/packages/seer/packages/protocol/ANALYSIS.md

## Folder purpose
- Seer protocol package exposing tRPC router composition and Seer domain module contracts.

## This run (deepest-first chunk)
- Initialized submodule content.
- Completed leaf analysis for `src/modules/oasis`, `src/modules/isles`, `src/modules/infinite`, and `src/modules/evolution`.
- Added maintainer docs:
  - `src/README.md`, `src/ANALYSIS.md`
  - `src/modules/README.md`, `src/modules/ANALYSIS.md`
  - `src/modules/oasis/{README.md,ANALYSIS.md}`
  - `src/modules/isles/{README.md,ANALYSIS.md}`
  - `src/modules/infinite/{README.md,ANALYSIS.md}`
  - `src/modules/evolution/{README.md,ANALYSIS.md}`

## Protocol/test relevance
- `oasis` currently has permissive inputs (`z.any`) and stubbed procedure behavior.
- `isles` appears to have router/service coupling defects (procedures routed through Evolution service path) and extensive commented legacy code.
- `infinite` shows similar coupling and placeholder-service behavior (procedures routed through Evolution service path, weak output guarantees).
- `evolution` centralizes critical reward/payment/round flows but still carries permissive contracts (`z.any`) and large monolithic logic that raises change risk.
- Root router composes many node+seer routers, so module-level contract gaps can propagate widely.

## Next chunk
- Start deepest-first pass in `src/modules` test-adjacent surfaces or `packages/node` submodule to map cross-package protocol boundaries.
- Add/expand test coverage for malformed payload, auth boundary mismatches, and transaction invariants (starting with Evolution payment/party flows).
