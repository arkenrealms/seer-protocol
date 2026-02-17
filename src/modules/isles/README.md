# arken/packages/seer/packages/protocol/src/modules/isles

Isles-specific Seer protocol surface.

## What lives here
- `isles.router.ts`: tRPC procedures exposed under `isles`.
- `isles.service.ts`: service implementation shell for router handlers.
- `isles.schema.ts` / `isles.models.ts` / `isles.types.ts`: schema/model/type scaffolding and exports.

## Current behavior snapshot
- Router currently exposes `saveRound`, `interact`, and `getScene`.
- All three handlers are wired to `ctx.app.service.Evolution.saveRound` (likely placeholder coupling).
- Inputs remain broad (`z.any()` for large payload segments).
- `isles.router.ts` also contains a very large block of commented legacy transport/game logic.

## Protocol/testing note
This module currently has weak boundary guarantees and likely miswired handler routes. It should be treated as high-priority for schema tightening, router/service wiring cleanup, and focused module contract tests.
