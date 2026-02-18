# arken/packages/seer/packages/protocol/src/modules/isles

Isles-specific Seer protocol surface.

## What lives here
- `isles.router.ts`: tRPC procedures exposed under `isles`.
- `isles.methodResolver.ts`: own-property-safe service method resolver with Isles-first, Evolution-compatible fallback behavior.
- `isles.service.ts`: service implementation shell for router handlers.
- `isles.schema.ts` / `isles.models.ts` / `isles.types.ts`: schema/model/type scaffolding and exports.

## Current behavior snapshot
- Router exposes `saveRound`, `interact`, and `getScene`.
- `saveRound` is now a mutation (write semantics) to align transport intent with round persistence behavior.
- Router dispatch now uses method-matched Evolution handlers directly:
  - `saveRound` -> `Evolution.saveRound`
  - `interact` -> `Evolution.interact`
  - `getScene` -> `Evolution.getScene`
- Missing handlers now fail with explicit unavailable-handler errors instead of misrouting.
- Evolution handlers are now invoked with preserved service context (`method.call(ctx.app.service.Evolution, ...)`) to avoid `this`-binding runtime errors.
- Inputs remain broad (`z.any()` for large payload segments).
- `isles.router.ts` still contains a very large block of commented legacy transport/game logic.

## Protocol/testing note
This module currently has weak boundary guarantees and likely miswired handler routes. It should be treated as high-priority for schema tightening, router/service wiring cleanup, and focused module contract tests.

## 2026-02-18 note
- Evolution handler selection now requires own-property checks before invocation to avoid inherited/prototype method dispatch.
