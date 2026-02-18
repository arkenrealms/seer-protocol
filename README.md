# arken/packages/seer/packages/protocol

Seer protocol package for Arken Realms.

## What it contains
- `evolution/`, `isles/`, `infinite/`, `oasis/`: game-domain tRPC routers/services.
- `router.ts`: top-level router composition.
- `types.ts`: shared router/application context typing.
- `test/`: package-local Jest regression tests.

## Local quality gate
- `npm test` (runs `jest --runInBand`)

## Current maintenance focus
- Hardening router dispatch against missing/miswired service handlers.
- Preserving deterministic error messaging and method-context invocation semantics.
