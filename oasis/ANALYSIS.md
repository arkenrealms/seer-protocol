# arken/packages/seer/packages/protocol/src/modules/oasis/ANALYSIS.md

## Purpose in project context
- Provides the Oasis game-domain adapter inside Seer protocol routing.
- Bridges Seer RPC calls to Arken node models/services.

## Notable files and responsibilities
- `oasis.router.ts`
  - Declares `getPatrons`, `interact`, and `getScene` procedures.
  - Uses Arken role/error middleware for `getPatrons` only.
- `oasis.service.ts`
  - Implements `getPatrons` via Mongo aggregate pipeline across `Item -> Character -> Profile`.
- `oasis.types.ts`
  - Re-exports router/service types and mapping placeholders.

## Protocol/test relevance
- `getPatrons` output is schema-constrained (`Profile[]`), but query input is not explicitly constrained in this module.
- `interact` and `getScene` accept broad shapes (`z.any()` fields), creating weak contract guarantees.
- Hardcoded `applicationId` branch behavior implies environment-specific coupling that should be codified in tests.

## Risks / gaps
- Overuse of `z.any()` weakens boundary validation.
- Stub mutation (`interact`) may mask integration failures.
- Console logging in service path may leak noisy runtime data.

## Follow-ups
- [ ] Replace broad `z.any()` payloads with explicit schemas for Oasis interactions.
- [ ] Add protocol tests for malformed inputs and unauthorized role paths.
- [ ] Add behavioral tests for `applicationId` scene/auth branching to avoid silent drift.
- [ ] Clarify whether `interact` is intentionally stubbed or missing implementation.
- [x] Normalize top-of-file path headers to `arken/...` across Oasis module source files (`index.ts`, router/service/schema/models/types).