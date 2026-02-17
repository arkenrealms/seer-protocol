# arken/packages/seer/packages/protocol/src/ANALYSIS.md

## Purpose in project context
- Defines Seer-side protocol surface and composes it with `@arken/node` routers.
- Acts as the boundary where Seer domain modules are exposed over tRPC.

## Notable architecture notes
- `router.ts` imports many `@arken/node/modules/*` routers directly, plus Seer-local module routers.
- `router.ts` still includes permissive/stubbed root procedures (`info`, `auth`, `banProfile`) with weak output/authorization guarantees.
- `types.ts` defines an `Application` shell with partially declared service/model mappings; several properties remain broad (`any`).
- `index.ts` initializes dotenv at package load and re-exports module surfaces, coupling environment side effects to import-time behavior.

## Protocol/test relevance
- Router composition breadth increases blast radius for malformed payload handling and middleware inconsistencies.
- Local module contract strictness (notably Oasis/Isles) directly impacts transport reliability assumptions upstream.

## Risks / gaps
- Extensive `any` use in app/context typing can hide integration drift.
- Root-level procedures (`auth`, `banProfile`, `info`) are weakly constrained and can bypass the stricter module-level schema discipline expected in production tRPC surfaces.
- Some Seer module procedures are permissive or stubbed, weakening deterministic contract behavior.
- Isles and Infinite modules both show likely route-to-service wiring defects that can mask domain ownership boundaries.
- Evolution module is high-impact but monolithic; mixed `z.any` contracts and auth/transaction inconsistencies increase reliability risk.
- Import-time `dotenv.config()` in `index.ts` can introduce test/runtime coupling surprises across hosts.

## Follow-ups
- [ ] Tighten module schemas and reduce `any` usage in router/type boundaries.
- [ ] Add focused protocol tests around Seer-local module procedures (auth, malformed payloads, output guarantees).
- [ ] Harden root-level procedures in `router.ts` (`auth`, `banProfile`, `info`) with explicit schemas, middleware, and deterministic outputs.
- [x] Continue deepest-first analysis for remaining module leaf (`evolution`) and roll findings up into `packages/protocol/ANALYSIS.md`.
- [x] Complete source-level analysis for `src/index.ts`, `src/router.ts`, and `src/types.ts` and roll findings upward.
- [ ] Add Evolution-focused tests for payment transaction/session lifecycle and party membership invariants.
