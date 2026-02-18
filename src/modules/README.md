# arken/packages/seer/packages/protocol/src/modules

Domain modules composed into Seer protocol router.

## Modules
- `evolution/`
- `infinite/`
- `isles/`
- `oasis/`

Each module owns router/service/type/model/schema files and is mounted by `src/router.ts`.

Shared helper:
- `methodResolver.ts` centralizes own-property-safe service method resolution used by Isles/Infinite resolvers, including shared saveRound-only compatibility fallback wiring.