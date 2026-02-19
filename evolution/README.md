# arken/packages/seer/packages/protocol/src/modules/evolution

Evolution protocol module for Seer.

## Contents
- `evolution.router.ts` — tRPC procedures and auth middleware for Evolution operations.
- `evolution.service.ts` — large business-logic implementation (round processing, rewards, payments, chest monitoring, world records).
- `evolution.schema.ts` / `evolution.types.ts` / `evolution.models.ts` — schema/types/model wiring.
- `index.ts` — module exports.

## Notes
- This module currently has mixed strict and permissive contracts (`z.any` still present on several procedures).
- Service layer is monolithic and contains substantial legacy/commented code blocks.
- `updateSettings` uses mutation semantics and now resolves through own-property descriptor lookup, returning a deterministic internal error if `Evolution.updateSettings` is unavailable.
- `updateConfig` now uses the same own-property descriptor guard pattern, preserving method context and emitting deterministic internal errors when wiring is missing.
- Router imports `TRPCError` from `@trpc/server` explicitly to keep guarded error throws type-safe and runtime-safe.
