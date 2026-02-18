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
- `updateSettings` is mutation-based (not query) so user preference writes stay aligned with write semantics.
- `getScene` now resolves `Evolution.getScene` via own-property descriptor lookup and raises a deterministic internal error when the handler is missing/non-callable.
- `info` now uses the same own-property descriptor guard path and deterministic unavailable-handler error for safer service wiring failures.
- `monitorParties` now also resolves through an own-property descriptor guard and deterministic unavailable-handler error to prevent null/miswired service crashes.
- `updateGameStats` now resolves via own-property descriptor lookup and emits a deterministic unavailable-handler error instead of failing with ambiguous runtime call errors.
