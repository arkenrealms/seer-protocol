# arken/packages/seer/packages/protocol/src/modules/evolution/ANALYSIS.md

## Purpose
- Hosts Evolution-facing protocol endpoints used by Seer and maps them to `ctx.app.service.Evolution` handlers.

## Notable responsibilities
- Router procedures for game config, party management, settings, payment lifecycle, round save, and scene interactions.
- Service implementation for:
  - round persistence and reward distribution,
  - world-record updates,
  - chest event monitoring and chain payment signing,
  - party and profile-side state mutations.

## Protocol/test relevance
- Procedure contracts are uneven:
  - several endpoints still use `z.any()` inputs (`info`, `updateConfig`, `saveRound.round`, etc.),
  - only a subset provide explicit output schemas.
- Auth posture is mixed (`guest` on `saveRound` router, but service checks `admin` role), increasing policy ambiguity.
- High-impact financial/reward logic sits in one large service file with minimal guardrail tests in this package.

## Risks / gaps
- Monolithic `evolution.service.ts` (~1.6k active lines + large commented legacy block in router) increases regression risk and review overhead.
- Transaction/session lifecycle in `processPayments` may be fragile (single session created outside loop, commits/aborts in per-payment flow).
- `leaveParty` appears to have inverted guard (`if (profile.partyId) throw 'Not in a party'`) suggesting potential logic bug.
- Significant use of mutable nested `meta` blobs with broad typing can hide schema drift.

## Follow-ups
- [ ] Replace `z.any` with explicit input/output schemas for high-risk procedures first (`saveRound`, payment endpoints, admin config mutations).
- [ ] Add protocol tests for auth boundary consistency (router role middleware vs service role checks).
- [ ] Add focused tests for payment processing transaction behavior and party join/leave invariants.
- [ ] Split large service concerns into domain slices (rounds/rewards/payments/party/chest) to reduce blast radius.

## Maintenance notes
- 2026-02-17: Normalized top-of-file path headers in module source files to `arken/...` for `evolution.models.ts`, `evolution.schema.ts`, `evolution.types.ts`, `evolution.service.ts`, and `evolution.router.ts`.
- 2026-02-17 (rotation seer): Fixed `leaveParty` guard inversion in `evolution.service.ts` (`if (!profile.partyId) throw 'Not in a party'`) so users currently in a party can leave successfully.
- 2026-02-18 (rotation seer-protocol): Corrected `updateSettings` transport semantics from `.query` to `.mutation` in `evolution.router.ts` and added regression coverage in `test/evolution.router.test.ts`.
- 2026-02-18 (rotation seer-protocol): Hardened `getScene` handler dispatch to use own-property descriptor resolution and deterministic internal-error messaging when `Evolution.getScene` is missing/non-callable.
- 2026-02-18 (rotation seer-protocol): Hardened `info` handler dispatch to use own-property descriptor resolution + deterministic `TRPCError(INTERNAL_SERVER_ERROR)` when `Evolution.info` is missing/non-callable, preventing null/miswired service crashes.
- 2026-02-18 (rotation seer-protocol): Hardened `monitorParties` dispatch with own-property descriptor resolution + deterministic `TRPCError(INTERNAL_SERVER_ERROR)` when `Evolution.monitorParties` is missing/non-callable, avoiding ambiguous null service failures.
