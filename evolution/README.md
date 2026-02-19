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
- `updateSettings` uses mutation semantics for stateful writes.
- `updateConfig` uses mutation semantics and remains admin-gated.
- `monitorParties` remains query-based and admin-gated.
