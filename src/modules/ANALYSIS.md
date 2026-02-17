# arken/packages/seer/packages/protocol/src/modules/ANALYSIS.md

## Purpose
- Leaf-domain protocol surfaces used by Seer (`evolution`, `infinite`, `isles`, `oasis`).

## Bottom-up summary (this pass)
- Deep analysis completed for `oasis/`, `isles/`, and `infinite/` leaf folders.
- `oasis` mixes production-like query logic with stubbed mutation behavior and permissive inputs.
- `isles` currently appears miswired (routes delegated to Evolution service) with broad schemas and substantial commented legacy code.
- `infinite` currently appears similarly wiring-incomplete: procedures route through Evolution service path, service methods are mostly placeholder, and contracts remain permissive.

## Cross-module implications
- Module contract quality appears uneven; stricter schema discipline should be aligned across all module folders.
- Router composition in parent `src/router.ts` means weak validation in one module can affect overall protocol reliability expectations.

## Follow-ups
- [ ] Run the same leaf-first analysis for remaining module leaves: `evolution/`.
- [ ] Standardize per-module README + ANALYSIS structure for maintainers.
- [ ] Introduce protocol boundary tests per module (input shape, auth middleware, output guarantees).
- [ ] Prioritize Isles/Infinite router-service rewiring and schema hardening before shipping new endpoints.
