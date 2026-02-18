# arken/packages/seer/packages/protocol/src/modules/infinite

Infinite protocol module for Seer.

## Current surface
- `saveRound` (query)
- `interact` (mutation)
- `getScene` (mutation)
- `infinite.methodResolver.ts` (shared method-resolution helper used by router + tests)

## Notes
- Router dispatch now uses method-matched Evolution handlers directly:
  - `saveRound` -> `Evolution.saveRound`
  - `interact` -> `Evolution.interact`
  - `getScene` -> `Evolution.getScene`
- Missing handlers now fail with explicit unavailable-handler errors instead of cross-method routing.
- Input contracts are still permissive (`z.any()` fields), and service implementation remains mostly placeholder/logging behavior.
- `infinite.router.ts` contains a large commented legacy block that should be split or removed after migration validation.
