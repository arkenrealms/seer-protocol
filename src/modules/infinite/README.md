# arken/packages/seer/packages/protocol/src/modules/infinite

Infinite protocol module for Seer.

## Current surface
- `saveRound` (query)
- `interact` (mutation)
- `getScene` (mutation)

## Notes
- Router now resolves handlers via `ctx.app.service.Infinite` first (`saveRound`/`interact`/`getScene`) with legacy fallback to `ctx.app.service.Evolution.saveRound` when Infinite wiring is absent.
- Input contracts are still permissive (`z.any()` fields), and service implementation remains mostly placeholder/logging behavior.
- `infinite.router.ts` contains a large commented legacy block that should be split or removed after migration validation.
