# arken/packages/seer/packages/protocol

Seer protocol package for Arken Realms.

## What it contains
- `src/router.ts`: top-level tRPC router composition.
- `src/modules/*`: Seer domain protocol surfaces (`oasis`, `isles`, `infinite`, `evolution`).
- `src/types.ts`: Seer application/router context typing.

See `ANALYSIS.md` for current reliability and test-focus notes.

## Local quality-gate status
- This package currently has no local `scripts` guardrails (`test`, `lint`, `typecheck`).
- Under the active maintenance policy, source edits in this repo should be paired with runnable local tests.
- Short-term bootstrap target: add package-local `npm test` coverage for router/service boundary invariants before additional runtime changes.
