# arken/packages/seer/packages/protocol/ANALYSIS.md

## Folder purpose
- Seer protocol package exposing tRPC router composition and Seer domain module contracts.

## This run (deepest-first chunk)
- Initialized submodule content.
- Completed leaf analysis for `src/modules/oasis`, `src/modules/isles`, `src/modules/infinite`, and `src/modules/evolution`.
- Completed next-level source analysis for `src/index.ts`, `src/router.ts`, and `src/types.ts` (post-leaf upward merge).
- Added generated-metadata docs after direct lock-metadata review:
  - `.rush/{README.md,ANALYSIS.md}`
  - `.rush/temp/{README.md,ANALYSIS.md}`
- Completed package-root operational config pass:
  - `package.json`
  - `tsconfig.json`
  - `.eslintrc`
  - `.prettierrc`
  - `.editorconfig`
- Added maintainer docs:
  - `src/README.md`, `src/ANALYSIS.md`
  - `src/modules/README.md`, `src/modules/ANALYSIS.md`
  - `src/modules/oasis/{README.md,ANALYSIS.md}`
  - `src/modules/isles/{README.md,ANALYSIS.md}`
  - `src/modules/infinite/{README.md,ANALYSIS.md}`
  - `src/modules/evolution/{README.md,ANALYSIS.md}`

## Protocol/test relevance
- Root `src/router.ts` includes permissive/stubbed top-level procedures (`auth`, `banProfile`, `info`) that need the same hardening expected from module routers.
- `oasis` currently has permissive inputs (`z.any`) and stubbed procedure behavior.
- `isles` appears to have router/service coupling defects (procedures routed through Evolution service path) and extensive commented legacy code.
- `infinite` shows similar coupling and placeholder-service behavior (procedures routed through Evolution service path, weak output guarantees).
- `evolution` centralizes critical reward/payment/round flows but still carries permissive contracts (`z.any`) and large monolithic logic that raises change risk.
- Root router composes many node+seer routers, so module-level contract gaps can propagate widely.
- Package-level strictness is intentionally relaxed (`noImplicitAny: false`, `strictNullChecks: false`) and eslint disables many safety rules, which increases protocol/type drift risk without compensating tests.
- `scripts` in `package.json` are empty, so protocol package checks rely on external workspace orchestration instead of local guard commands.

## Next chunk
- Continue rotation to `forge` after this seer package-root pass.
- In Seer follow-up, map local test/typecheck invocation surfaces for `protocol` + `node` packages and propose concrete package-level guard scripts.
- Add/expand test coverage for malformed payload, auth boundary mismatches, and transaction invariants (starting with Evolution payment/party flows).
