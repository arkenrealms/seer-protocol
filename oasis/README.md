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

## Protocol/testing note
This module has low input validation depth (notably broad `z.any()` fields) and stubbed behavior paths; it is a candidate for contract-tightening and tests around malformed input/result handling.

## 2026-02-18 update
- `getScene` now guards non-object `data` payloads before reading `applicationId`, preventing null/primitive dereference crashes.
- `getPatrons` now checks for an own-property `Oasis.getPatrons` handler and raises deterministic `TRPCError(INTERNAL_SERVER_ERROR)` when the service wiring is unavailable.