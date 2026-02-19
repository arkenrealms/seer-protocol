# arken/packages/seer/packages/protocol

Seer protocol package for Arken Realms.

## What it contains
- `src/router.ts`: top-level tRPC router composition.
- `src/modules/*`: Seer domain protocol surfaces (`oasis`, `isles`, `infinite`, `evolution`).
- `src/types.ts`: Seer application/router context typing.

See `ANALYSIS.md` for current reliability and test-focus notes.

  "main": "build/index.js",
  "types": "build/index.d.ts",
  "exports": {
    ".": {
      "types": "./build/index.d.ts",
      "import": "./build/index.js",
      "require": "./build/index.js",
      "default": "./build/index.js"
    },
    "./core/*": {
      "default": "./build/core/*.js",
      "types": "./build/core/*.d.ts"
    },
    "./area/*": {
      "default": "./build/area/*.js",
      "types": "./build/area/*.d.ts"
    },
    "./asset/*": {
      "default": "./build/asset/*.js",
      "types": "./build/asset/*.d.ts"
    },
    "./chain/*": {
      "default": "./build/chain/*.js",
      "types": "./build/chain/*.d.ts"
    },
    "./character/*": {
      "default": "./build/character/*.js",
      "types": "./build/character/*.d.ts"
    },
    "./chat/*": {
      "default": "./build/chat/*.js",
      "types": "./build/chat/*.d.ts"
    },
    "./collection/*": {
      "default": "./build/collection/*.js",
      "types": "./build/collection/*.d.ts"
    },
    "./evolution/*": {
      "default": "./build/evolution/*.js",
      "types": "./build/evolution/*.d.ts"
    },
    "./game/*": {
      "default": "./build/game/*.js",
      "types": "./build/game/*.d.ts"
    },
    "./infinite/*": {
      "default": "./build/infinite/*.js",
      "types": "./build/infinite/*.d.ts"
    },
    "./interface/*": {
      "default": "./build/interface/*.js",
      "types": "./build/interface/*.d.ts"
    },
    "./isles/*": {
      "default": "./build/isles/*.js",
      "types": "./build/isles/*.d.ts"
    },
    "./item/*": {
      "default": "./build/item/*.js",
      "types": "./build/item/*.d.ts"
    },
    "./job/*": {
      "default": "./build/job/*.js",
      "types": "./build/job/*.d.ts"
    },
    "./market/*": {
      "default": "./build/market/*.js",
      "types": "./build/market/*.d.ts"
    },
    "./oasis/*": {
      "default": "./build/oasis/*.js",
      "types": "./build/oasis/*.d.ts"
    },
    "./product/*": {
      "default": "./build/product/*.js",
      "types": "./build/product/*.d.ts"
    },
    "./profile/*": {
      "default": "./build/profile/*.js",
      "types": "./build/profile/*.d.ts"
    },
    "./raffle/*": {
      "default": "./build/raffle/*.js",
      "types": "./build/raffle/*.d.ts"
    },
    "./skill/*": {
      "default": "./build/skill/*.js",
      "types": "./build/skill/*.d.ts"
    },
    "./trek/*": {
      "default": "./build/trek/*.js",
      "types": "./build/trek/*.d.ts"
    },
    "./util/*": {
      "default": "./build/util/*.js",
      "types": "./build/util/*.d.ts"
    },
    "./video/*": {
      "default": "./build/video/*.js",
      "types": "./build/video/*.d.ts"
    }
  },## Local quality-gate status
- Package now includes a local `npm test` script:
  - `node --test --experimental-strip-types test/*.test.ts`
- Current package-local coverage starts with Infinite router method-resolution invariants.
- Follow-up: expand this harness to Isles/Oasis/Evolution boundary checks and malformed payload/auth regressions.
