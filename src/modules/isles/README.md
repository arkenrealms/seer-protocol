# arken/packages/seer/packages/protocol/src/modules/isles

Isles-specific Seer protocol surface.

## What lives here
- `isles.router.ts`: tRPC procedures exposed under `isles`.
- `isles.methodResolver.ts`: own-property-safe service method resolver with Isles-first, Evolution-compatible fallback behavior.
- `isles.service.ts`: service implementation shell for router handlers.
- `isles.schema.ts` / `isles.models.ts` / `isles.types.ts`: schema/model/type scaffolding and exports.

## Current behavior snapshot
- Router exposes `saveRound`, `interact`, and `getScene`.
- Handler resolution now goes through `resolveIslesMethod`:
  - prefers `ctx.app.service.Isles[method]`,
  - falls back to `ctx.app.service.Evolution[method]` when method-matched,
  - only uses `Evolution.saveRound` as a compatibility fallback for `saveRound` itself.
- Inputs remain broad (`z.any()` for large payload segments).
- `isles.router.ts` still contains a very large block of commented legacy transport/game logic.

## Protocol/testing note
This module currently has weak boundary guarantees and likely miswired handler routes. It should be treated as high-priority for schema tightening, router/service wiring cleanup, and focused module contract tests.
