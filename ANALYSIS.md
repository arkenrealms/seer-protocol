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
- Revalidated `.rush/temp/shrinkwrap-deps.json` from source and refreshed lock-shape notes (workspace entry + mixed transitive-major presence) for generated-only ownership clarity.
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

## Guard-script mapping (this chunk)
- Verified package-level script surface is empty (`scripts: {}`), so local quality gates are currently implicit/ambient.
- Proposed package-local guard commands to reduce drift and make CI intentions explicit:
  - `typecheck`: `tsc --noEmit -p tsconfig.json`
  - `lint`: `eslint "src/**/*.{ts,tsx}"`
  - `test:protocol`: run focused protocol suites once available in this package/workspace.
- Recommendation: add these as no-op-safe scripts in a follow-up commit, then wire CI/PR checks to package-local commands instead of implicit workspace behavior.

## Next chunk
- Continue rotation to `sigil-protocol` after this seer-protocol package-root pass (per direct-repo rotation order).
- Apply same guard-script mapping approach to `packages/seer/packages/node` and compare strictness gaps.
- Add/expand test coverage for malformed payload, auth boundary mismatches, and transaction invariants (starting with Evolution payment/party flows).

## 2026-02-17 17:32 PST — maintenance gate alignment (docs-only)
- Re-read package root source (`src/router.ts`, `src/types.ts`, `src/index.ts`) after loading all in-scope `.md` docs.
- Confirmed this direct repo still lacks package-local runnable test harness/scripts (`package.json` has empty `scripts`).
- Under current source-change gate, deferred runtime code edits in this chunk.
- Updated maintainer docs to make test-gate blocker explicit and keep rotation continuity.
- Required bootstrap before next source change in this repo:
  1) add local test script(s),
  2) ensure non-interactive execution path in cron context,
  3) then apply small protocol hardening changes with pass/fail evidence.
