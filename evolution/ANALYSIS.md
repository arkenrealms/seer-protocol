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

## 2026-02-18 maintenance update
- Hardened `info` dispatch to use own-property descriptor method resolution (`Object.getOwnPropertyDescriptor(...).value`) and deterministic `TRPCError(INTERNAL_SERVER_ERROR)` fallback when `Evolution.info` wiring is missing/non-callable.
- Hardened `updateSettings` dispatch to use own-property descriptor method resolution (`Object.getOwnPropertyDescriptor(...).value`) and deterministic `TRPCError(INTERNAL_SERVER_ERROR)` fallback when handler wiring is missing/non-callable.
- Applied the same guarded-dispatch pattern to `updateConfig` so admin config writes fail deterministically (instead of throwing raw `TypeError`) when `Evolution.updateConfig` is absent/non-callable.
- Added package-local Jest guard coverage in `test/evolution.router.test.ts` to keep guarded dispatch behavior from regressing for `updateConfig`, `monitorParties`, and `updateSettings`.
- Hardened `monitorParties` to use own-property descriptor guarded dispatch + deterministic unavailable-handler `TRPCError`, matching the safer dispatch pattern used by other critical routes.
- Fixed missing `TRPCError` import in `evolution.router.ts`; previously this handler referenced `TRPCError` without importing it from `@trpc/server`, creating a compile/runtime risk once transpilation executes this path.

## Maintenance notes
- 2026-02-17: Normalized top-of-file path headers in module source files to `arken/...` for `evolution.models.ts`, `evolution.schema.ts`, `evolution.types.ts`, `evolution.service.ts`, and `evolution.router.ts`.
- 2026-02-17 (rotation seer): Fixed `leaveParty` guard inversion in `evolution.service.ts` (`if (!profile.partyId) throw 'Not in a party'`) so users currently in a party can leave successfully.
