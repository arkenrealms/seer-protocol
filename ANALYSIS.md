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
- Package now has a local `npm test` Jest harness (`jest --runInBand`) for direct-repo regression checks.

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

## 2026-02-17 20:12 PST — resolver hardening + inherited-handler regression
- Added own-property-only method resolution in `src/modules/infinite/infinite.methodResolver.ts`.
- Expanded local tests in `test/infinite.router.test.ts` to cover inherited prototype handler rejection.
- Test gate: `npm test` passed (4/4).
- Jest migration note: attempted bootstrap in this direct package, but local `npm install` is blocked by unresolved `workspace:*` dependency protocol without workspace package-manager bootstrap in this runtime; keep TS tests in place and retry Jest migration when workspace install path is available.

## 2026-02-18 maintenance update
- Added repo-defined package test script: `npm test` -> `jest --runInBand`.
- Added `test/evolution.router.test.ts` to lock `updateSettings` semantics and dispatch hardening.
- Hardened `evolution/evolution.router.ts` `updateSettings` handler resolution:
  - switched to mutation semantics,
  - requires own-property descriptor callable lookup,
  - emits deterministic `TRPCError(INTERNAL_SERVER_ERROR)` when unavailable,
  - preserves method context with `method.call(evolutionService, input, ctx)`.

## 2026-02-19 15:45 PST — where-depth normalization guard
- Hardened `createPrismaWhereSchema` depth handling in both `schema.ts` and `util/schema.ts`.
- Depth is now normalized via `Number.isFinite` + `Math.floor` + `Math.max(0, ...)` before recursion.
- This prevents unbounded recursion from non-finite depth values while preserving existing behavior for valid integer depths.
- Added focused regression lock in `test/schema.depth-normalization.test.ts`.

## 2026-02-19 21:33 PST — root/util query schema parity hardening
- Updated root `schema.ts` query filter operator `mode` to enum-constrained values (`default | insensitive`) to match util schema behavior.
- Hardened root `getQueryInput` pagination envelope to require non-negative integer `skip`/`take`/`limit` values (retaining legacy `limit` alias).
- Added `test/schema.root-query-input.test.ts` to lock these invariants and prevent drift between root and util schema implementations.

## 2026-02-19 23:xx PST — Query export parity follow-up
- Hardened exported `Query` objects in both root `schema.ts` and `util/schema.ts` to enforce non-negative integer `skip`/`take` and include legacy `limit` alias.
- Added regression assertions in existing schema tests so `Query` helper strictness cannot silently drift from `getQueryInput` behavior.

## 2026-02-20 04:xx PST — projection key hygiene hardening
- Hardened both root and util query envelopes so `include`/`select` reject blank or whitespace-only keys.
- Applied shared non-blank boolean-record validation in both exported `Query` and `getQueryInput` envelopes.
- Added behavior-based tests in both root/util schema suites to lock rejection + valid-key acceptance.
- Rationale: malformed projection keys are otherwise accepted and can surface as opaque data-layer query errors; this catches them at protocol boundary.

## 2026-02-20 06:5x PST — pagination alias parity hardening
- Added query-envelope refinement in both root `schema.ts` and `util/schema.ts` so `take` and legacy `limit` cannot conflict when both are present.
- Extended root/util schema regression tests to reject mismatched alias values and accept matching values.
- Rationale: mixed clients still send either alias; explicit parity check prevents ambiguous page sizing and makes pagination behavior deterministic.

## 2026-02-20 09:0x PST — single-alias pagination normalization hardening
- Updated both root `schema.ts` and `util/schema.ts` query envelopes to normalize one-sided `take`/`limit` payloads after validation.
- Expanded root/util schema tests to assert normalized parse output for callers that send only one alias.
- Rationale: many clients still emit one pagination key; normalization at protocol ingress keeps router behavior consistent without adding router-level wrappers.

## 2026-02-20 11:1x PST — cursor key hygiene hardening
- Updated both root `schema.ts` and `util/schema.ts` query envelopes so `cursor` rejects blank/whitespace-only keys.
- Expanded root/util schema tests to verify rejection of malformed cursor maps and acceptance of valid cursor keys.
- Rationale: blank cursor keys create ambiguous pagination state and downstream query failures; protocol-boundary validation keeps cursor behavior deterministic.

## 2026-02-20 13:0x PST — non-empty logical where-clause guard
- Hardened both root and util query schemas so logical operators (`AND`, `OR`, `NOT`) reject empty arrays in both exported `Query` and recursive `createPrismaWhereSchema` paths.
- Added behavior tests in root/util schema suites to assert empty-array rejection and valid non-empty logical clauses.
- Rationale: empty logical arrays are effectively no-op/ambiguous filters that can mask caller bugs; failing fast at protocol ingress improves query determinism.

## 2026-02-20 15:xx PST — reserved key guard for dynamic query maps
- Hardened both root and util query-map validators (`orderBy`, `include`/`select`, `cursor`) to reject reserved keys: `__proto__`, `constructor`, `prototype`.
- Expanded both schema regression suites to lock rejection behavior for these keys.
- Rationale: these keys are common prototype-pollution vectors in dynamic object payloads; protocol-layer rejection prevents polluted envelopes from reaching router/service execution paths.

## 2026-02-21 01:4x PST — pagination-default envelope determinism
- Updated both root and util query envelope schemas so pagination defaults are expressed as `optional().default(...)` for `skip`, `take`, and legacy `limit`.
- Removed `querySchema.partial()` from `getQueryInput` now that all fields are already intentionally optional.
- Rationale: with `.partial()` in place, empty query objects bypassed default materialization; deterministic defaulted envelopes reduce router/service branching and avoid implicit pagination drift.

## 2026-02-21 03:3x PST — empty where-operator object rejection
- Hardened both root (`schema.ts`) and util (`util/schema.ts`) query filter operator schemas to reject empty operator objects such as `{ where: { name: {} } }`.
- Applied the same non-empty-operator check inside recursive `createPrismaWhereSchema` field-filter builders to keep deep where-clause behavior in parity.
- Added behavior tests in both root/util schema suites to assert rejection and preserve valid `equals` operator acceptance.
- Rationale: empty operator maps are ambiguous no-op filters that can silently hide caller bugs and produce inconsistent filtering behavior downstream.

## 2026-02-20 21:1x PST — non-plain where shorthand normalization fix
- Hardened `createPrismaWhereSchema` in both root `schema.ts` and `util/schema.ts` to treat only plain records as operator objects.
- Non-plain objects (for example boxed primitives and class instances) are now normalized through shorthand equality (`{ equals: value }`) instead of being stripped into empty operator payloads.
- Expanded util/root schema tests to lock non-plain shorthand rejection behavior for string fields.
- Rationale: non-plain object filters previously parsed as empty operator maps due to broad object detection, silently dropping caller filter intent and causing inconsistent query behavior.

## 2026-02-20 23:xx PST — empty membership-array guard in where filters
- Hardened query operator contracts in both root `schema.ts` and `util/schema.ts` to reject empty `in` / `notIn` arrays.
- Applied the same `.min(1)` enforcement in recursive `createPrismaWhereSchema` operator builders so deep/nested where clauses follow identical rules.
- Expanded root/util behavior suites to verify rejection for empty arrays and acceptance for non-empty arrays.
- Rationale: empty membership arrays are ambiguous no-op filters; rejecting them at protocol ingress prevents silent caller mistakes and keeps filter semantics deterministic.

## 2026-02-21 04:xx PST — strict where-key enforcement parity
- Applied strict unknown-key rejection to both root and util query-where schemas (`QueryWhereSchema` + `createPrismaWhereSchema`).
- Rationale: protocol boundary should fail fast on mistyped where keys rather than silently dropping them.

## 2026-02-21 06:1x PST — non-empty where-envelope enforcement
- Hardened both root (`schema.ts`) and util (`util/schema.ts`) where schemas to reject empty where objects (`{ where: {} }`) in top-level `QueryWhereSchema` and recursive `createPrismaWhereSchema` paths.
- Expanded root/util schema behavior tests to lock rejection and preserve valid non-empty where parsing.
- Rationale: empty where envelopes are ambiguous no-op filters that can mask client bugs and accidentally broaden result sets; protocol-level rejection keeps filtering intent explicit.

## 2026-02-21 12:0x PST — non-blank string pattern operator enforcement
- Hardened both root (`schema.ts`) and util (`util/schema.ts`) filter operator schemas so `contains`, `startsWith`, and `endsWith` require trimmed non-empty string values.
- Applied the same contract in recursive `createPrismaWhereSchema` operator builders to keep nested where behavior aligned with top-level `Query` parsing.
- Expanded root/util schema behavior tests to reject blank/whitespace-only values while preserving acceptance for valid non-empty values.
- Rationale: blank pattern operators are effectively ambiguous no-op filters; failing fast at protocol ingress prevents silent caller mistakes and improves query determinism.

## 2026-02-21 14:0x PST — finite pagination-number guard
- Hardened both root and util query envelopes so `skip`, `take`, and legacy `limit` require finite numbers in addition to existing integer/non-negative checks.
- Why: `z.number().int()` can still permit `Infinity` values; allowing non-finite pagination inputs can leak invalid page bounds into router/data-layer logic.
- Added matching behavior tests in both root/util schema suites to lock rejection of `±Infinity` pagination inputs.
