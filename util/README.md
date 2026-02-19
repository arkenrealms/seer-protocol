# arken/packages/seer/packages/protocol/util/README.md

Shared schema/util helpers for protocol routers and tests.

## Highlights
- `schema.ts` exports Zod query envelope helpers (`getQueryInput`, `getQueryOutput`) and shared common schemas.
- Query envelopes now accept both `take` (preferred) and legacy `limit` for pagination compatibility.
