# arken/packages/seer/packages/protocol/src/modules/infinite/ANALYSIS.md

## Purpose
- Defines the Seer tRPC protocol boundary for Infinite-domain interactions.

## File-level findings (deepest-first)
- `index.ts`: barrel export only.
- `infinite.router.ts`:
  - Active procedures (`saveRound`, `interact`, `getScene`) resolve Infinite-owned handlers first via shared resolver.
  - Fallback now matches by method name on Evolution service (`Evolution[method]`), with `saveRound` compatibility fallback retained only for `saveRound` calls.
  - Uses permissive schemas (`round: z.any()`, `lastClients: z.any()`, `data: z.any()`), reducing contract determinism.
  - Contains very large commented legacy block (thousands of lines), increasing maintenance/search noise.
- `infinite.service.ts`:
  - `saveRound` and `interact` only log and do not return explicit typed outputs.
  - `getScene` returns app-id-gated mock object payload.
- `infinite.schema.ts` / `infinite.models.ts`:
  - Placeholder imports with no concrete schema/model definitions.
- `infinite.types.ts`:
  - Exports broad placeholder mappings and commented type derivations.
- Source header hygiene:
  - Module source files now use normalized top-of-file path headers in `arken/...` format.

## Protocol/test relevance
- Router/service ownership is partially hardened: Infinite handlers are now preferred, with Evolution fallback retained for compatibility during migration.
- Weak input/output contracts increase risk of runtime drift and client/server mismatch.

## Risks / gaps
- [ ] Infinite service methods remain placeholder and still rely on fallback behavior in deployments where Infinite service wiring is incomplete.
- [ ] Missing explicit output contracts in service methods.
- [ ] Large commented legacy payload in router obscures active logic.
- [ ] No module-level protocol tests for auth/input/output behavior.

## Follow-ups
- [ ] Complete migration by implementing concrete Infinite service methods and removing Evolution fallback path.
- [ ] Replace `z.any()` with strict schemas for `round`, `lastClients`, and `getScene.data`.
- [ ] Trim/migrate commented legacy block into archival docs or separate history note.
- [ ] Add focused tests for malformed payloads, auth guard behavior, and output-shape guarantees.
- [x] Add package-local regression tests for Infinite method-resolution fallback invariants.
