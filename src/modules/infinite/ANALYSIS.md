# arken/packages/seer/packages/protocol/src/modules/infinite/ANALYSIS.md

## Purpose
- Defines the Seer tRPC protocol boundary for Infinite-domain interactions.

## File-level findings (deepest-first)
- `index.ts`: barrel export only.
- `infinite.router.ts`:
  - Active procedures (`saveRound`, `interact`, `getScene`) exist, but all delegate to `ctx.app.service.Evolution.saveRound`.
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
- Current module behavior is likely wiring-incomplete and relies on Evolution service path.
- Weak input/output contracts increase risk of runtime drift and client/server mismatch.

## Risks / gaps
- [ ] Procedure-to-service ownership mismatch (`Infinite` router routed through `Evolution` service).
- [ ] Missing explicit output contracts in service methods.
- [ ] Large commented legacy payload in router obscures active logic.
- [ ] No module-level protocol tests for auth/input/output behavior.

## Follow-ups
- [ ] Rewire Infinite procedures to Infinite-owned service methods.
- [ ] Replace `z.any()` with strict schemas for `round`, `lastClients`, and `getScene.data`.
- [ ] Trim/migrate commented legacy block into archival docs or separate history note.
- [ ] Add focused tests for malformed payloads, auth guard behavior, and output-shape guarantees.
