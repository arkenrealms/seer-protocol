# arken/packages/seer/packages/protocol

Seer protocol package for Arken Realms.

## What it contains
- `src/router.ts`: top-level tRPC router composition.
- `src/modules/*`: Seer domain protocol surfaces (`oasis`, `isles`, `infinite`, `evolution`).
- `src/types.ts`: Seer application/router context typing.

See `ANALYSIS.md` for current reliability and test-focus notes.

## Local quality-gate status
- Package now includes a local `npm test` script:
  - `node --test --experimental-strip-types test/*.test.ts`
- Current package-local coverage starts with Infinite router method-resolution invariants.
- Follow-up: expand this harness to Isles/Oasis/Evolution boundary checks and malformed payload/auth regressions.
