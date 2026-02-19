# arken/packages/seer/packages/protocol/src/modules/oasis

Oasis-specific Seer protocol surface.

## What lives here
- `oasis.router.ts`: tRPC procedures exposed under `oasis`.
- `oasis.service.ts`: service implementation used by router handlers.
- `oasis.schema.ts` / `oasis.models.ts` / `oasis.types.ts`: type/model scaffolding and exports.

## Current behavior snapshot
- `getPatrons` aggregates top "Founder's Cube" holders and returns related profiles.
- `interact` is currently a stub mutation returning `{ status: 1 }`.
- `getScene` returns a hardcoded object payload for one application id.
- `getScene` now guards `input.data` shape before reading `applicationId`, preventing runtime `TypeError` when clients send non-object payloads under current permissive schema.

## Protocol/testing note
This module has low input validation depth (notably broad `z.any()` fields) and stubbed behavior paths; it is a candidate for contract-tightening and tests around malformed input/result handling.

`getPatrons` now uses own-property descriptor guarded dispatch on `ctx.app.service.Oasis.getPatrons` and emits a deterministic internal error when handler wiring is unavailable.