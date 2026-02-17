# arken/packages/seer/packages/protocol/src/ANALYSIS.md

## Purpose in project context
- Defines Seer-side protocol surface and composes it with `@arken/node` routers.
- Acts as the boundary where Seer domain modules are exposed over tRPC.

## Notable architecture notes
- `router.ts` imports many `@arken/node/modules/*` routers directly, plus Seer-local module routers.
- `types.ts` defines an `Application` shell with partially declared service/model mappings; several properties remain broad (`any`).

## Protocol/test relevance
- Router composition breadth increases blast radius for malformed payload handling and middleware inconsistencies.
- Local module contract strictness (notably Oasis/Isles) directly impacts transport reliability assumptions upstream.

## Risks / gaps
- Extensive `any` use in app/context typing can hide integration drift.
- Some Seer module procedures are permissive or stubbed, weakening deterministic contract behavior.
- Isles module shows likely route-to-service wiring defects that can mask domain ownership boundaries.

## Follow-ups
- [ ] Tighten module schemas and reduce `any` usage in router/type boundaries.
- [ ] Add focused protocol tests around Seer-local module procedures (auth, malformed payloads, output guarantees).
- [ ] Continue deepest-first analysis for remaining module leaves (`infinite`, `evolution`) and roll findings up into `packages/protocol/ANALYSIS.md`.
