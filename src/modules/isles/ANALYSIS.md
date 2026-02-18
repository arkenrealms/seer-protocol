# arken/packages/seer/packages/protocol/src/modules/isles/ANALYSIS.md

## Purpose in project context
- Provides the Isles game-domain adapter surface inside Seer protocol routing.
- Intended to expose Isles RPC procedures via tRPC with Seer auth/error middleware.

## Notable files and responsibilities
- `isles.router.ts`
  - Declares `saveRound`, `interact`, and `getScene` procedures.
  - Applies role + error middleware and now resolves handlers through `resolveIslesMethod` (Isles-first, method-matched Evolution fallback).
  - Contains a ~3.6k-line commented legacy block that obscures active behavior.
- `isles.methodResolver.ts`
  - Provides own-property-only callable resolution for Isles/Evolution services.
  - Preserves service `this` context via `Reflect.apply` to avoid method binding drift.
  - Blocks cross-method misrouting (`getScene`/`interact` no longer silently delegate to `Evolution.saveRound`).
- `isles.service.ts`
  - Defines `Service` methods (`saveRound`, `interact`, `getScene`), but active router paths do not call them.
  - `saveRound`/`interact` currently only log and return no explicit payload.
- `isles.types.ts` / `isles.schema.ts` / `isles.models.ts`
  - Mostly scaffolding and re-export structure.

## Protocol/test relevance
- Router contract is still partially inconsistent (`saveRound` remains a `.query` despite write-like semantics).
- Misrouting risk is reduced: `interact`/`getScene` no longer default to `Evolution.saveRound`; method resolution now requires explicit callable ownership per method.
- Input schemas rely heavily on `z.any()`, reducing transport-level validation reliability.
- Large commented legacy code increases maintenance and review risk for protocol safety changes.

## Risks / gaps
- Likely copy/paste wiring errors (`Isles` routes delegated to `Evolution` service).
- Incomplete service implementations can cause undefined response shapes if rewired without tests.
- Commented legacy code creates high noise-to-signal ratio and drift risk.

## Follow-ups
- [ ] Rewire router handlers to a concrete Isles service boundary (`ctx.app.service.Isles` or local `Service`) and verify expected procedure types (`query` vs `mutation`).
- [ ] Replace broad `z.any()` payload fields with explicit request/response schemas.
- [ ] Add protocol tests for malformed payloads, auth role enforcement, and deterministic response shape.
- [ ] Split or remove the commented legacy block into archival docs to improve maintainability.
