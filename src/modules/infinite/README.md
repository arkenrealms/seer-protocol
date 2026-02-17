# arken/packages/seer/packages/protocol/src/modules/infinite

Infinite protocol module for Seer.

## Current surface
- `saveRound` (query)
- `interact` (mutation)
- `getScene` (mutation)

## Notes
- Router procedures currently delegate to `ctx.app.service.Evolution.saveRound` for all three operations.
- Input contracts are permissive (`z.any()` fields), and service implementation is mostly placeholder/logging behavior.
- `infinite.router.ts` contains a large commented legacy block that should be split or removed after migration validation.
