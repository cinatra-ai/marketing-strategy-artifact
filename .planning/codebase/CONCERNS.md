# Codebase Concerns

**Analysis Date:** 2026-06-09

## Tech Debt

**Strict TypeScript partially relaxed:**
- Issue: `tsconfig.json` sets `"strict": true` but immediately overrides it with `"noImplicitAny": false`, undermining strict mode's primary value.
- Files: `tsconfig.json`
- Impact: Implicit `any` types can slip through undetected, reducing type safety guarantees across `src/`.
- Fix approach: Remove `"noImplicitAny": false` and resolve any resulting type errors in `src/index.ts`.

**`jsx` compiler option configured but unused:**
- Issue: `tsconfig.json` sets `"jsx": "react-jsx"` and `"lib": ["ES2023", "DOM", "DOM.Iterable"]`, but the repo contains no `.tsx` files and no React dependency exists.
- Files: `tsconfig.json`
- Impact: Misleads future contributors into thinking React/JSX is in use; adds noise to compiler config; DOM lib pulls in unnecessary type surface.
- Fix approach: Remove `"jsx"` option and trim `"lib"` to `["ES2023"]` unless DOM types are genuinely needed.

**`noEmit: false` with no build script:**
- Issue: `tsconfig.json` sets `"noEmit": false` and defines `"outDir": "dist"`, but `package.json` has no `build` or `compile` script, and `"main"` points to `./src/index.ts` (a TypeScript source file, not a compiled output).
- Files: `tsconfig.json`, `package.json`
- Impact: The package is not actually compiled before publish; consumers receive raw `.ts` source. The `dist/` directory is never populated in CI.
- Fix approach: Either set `"noEmit": true` (typecheck-only) or add a `build` script that runs `tsc` and point `"main"` to `dist/index.js`.

**`main` and `types` both point to TypeScript source:**
- Issue: `package.json` sets `"main": "./src/index.ts"` and `"types": "./src/index.ts"`. This only works if the consuming monorepo resolves `.ts` files directly (e.g., via `ts-node` or bundler path mapping).
- Files: `package.json`
- Impact: The package is not self-contained as a publishable npm artifact. Any consumer outside the cinatra monorepo that installs from the registry will receive broken import paths.
- Fix approach: Build to `dist/` and set `"main": "./dist/index.js"`, `"types": "./dist/index.d.ts"`, or use `"exports"` field for ESM.

**Pack parity enforced by comment, not test:**
- Issue: `src/index.ts` comments that the typed export is "mirrored in package.json `cinatra.artifact` — the pack parity test pins them byte-equal", but no test file exists in this repo to enforce that invariant.
- Files: `src/index.ts`, `package.json`
- Impact: The manifest in `package.json` and the TypeScript export can silently diverge. The parity check only runs inside the cinatra monorepo, not in this standalone repo's CI.
- Fix approach: Add a standalone parity test (e.g., a simple Node script or Vitest test) that compares the exported manifest object against `package.json`'s `cinatra.artifact` section.

## Known Bugs

**No lockfile committed:**
- Symptoms: CI runs `pnpm install --no-frozen-lockfile` for standalone repos with no first-party peers. This repo has `@cinatra-ai/sdk-extensions` as a peer and is classified as a source mirror — install is skipped. However, if the peer classification logic ever changes, the absence of a lockfile means non-deterministic dependency resolution.
- Files: `.github/workflows/ci.yml`
- Trigger: If `first_party` env var is incorrectly set to `0`.
- Workaround: CI skips install for this repo class, masking the gap.

## Security Considerations

**`.npmrc` present:**
- Risk: `.npmrc` exists and is committed to the repo. Currently only contains `auto-install-peers=false` (no tokens), but the file pattern is the standard location for registry auth tokens.
- Files: `.npmrc`
- Current mitigation: File contains no auth tokens at this time.
- Recommendations: Add `.npmrc` to pre-commit review policy; ensure registry tokens are never written to this file, using environment-injected npm config instead.

**Release workflow uses `secrets: inherit` broadly:**
- Risk: `release.yml` passes all org secrets to the reusable workflow via `secrets: inherit`. If the reusable workflow at `cinatra-ai/.github` is ever compromised or changed to log secrets, all inherited secrets are exposed.
- Files: `.github/workflows/release.yml`
- Current mitigation: `id-token: write` scope is granted for OIDC provenance; `contents: read` limits write access to the repo.
- Recommendations: Enumerate only required secrets explicitly (e.g., `CINATRA_MARKETPLACE_VENDOR_TOKEN`) rather than inheriting all.

**Release workflow references mutable `@main` ref:**
- Risk: `release.yml` pins the reusable workflow at `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main`, a mutable branch ref. A breaking or malicious change to `main` in the `.github` repo immediately affects all releases.
- Files: `.github/workflows/release.yml`
- Current mitigation: Not applicable.
- Recommendations: Pin to a SHA or a versioned tag (e.g., `@v1`) to make releases reproducible and auditable.

## Performance Bottlenecks

Not applicable — this is a minimal artifact definition repo with a single 25-line TypeScript export and a SKILL.md prompt. No runtime performance surface exists.

## Fragile Areas

**CI source-mirror classification logic:**
- Files: `.github/workflows/ci.yml`
- Why fragile: The entire CI branch (skip install / typecheck / test vs. run them) hinges on a single inline Node.js `process.exit` call checking for `@cinatra-ai/*` peers. If `package.json` peer declarations change (e.g., peer is removed or renamed), the classification silently flips and CI behavior changes with no explicit signal.
- Safe modification: When changing `peerDependencies`, manually verify CI still classifies this repo correctly as a source mirror.
- Test coverage: No automated test covers the classification logic itself.

**Manifest parity between `src/index.ts` and `package.json`:**
- Files: `src/index.ts`, `package.json`
- Why fragile: The `cinatra.artifact` block in `package.json` and the `marketingStrategyArtifactManifest` export in `src/index.ts` must remain byte-equal. This is enforced only by monorepo-level tests, not by anything in this repo.
- Safe modification: Always update both locations in lockstep when changing `mimeTypes`, `matchers`, or `matcherConfidenceThreshold`.
- Test coverage: No standalone parity test exists in this repo.

## Scaling Limits

Not applicable — this is a static artifact definition with no server, database, or runtime throughput concern.

## Dependencies at Risk

**`@cinatra-ai/sdk-extensions` is unversioned and unresolvable standalone:**
- Risk: The peer dependency is declared as `"*"` (any version) and is not published to any public registry. It only resolves inside the cinatra monorepo workspace.
- Impact: Any attempt to install or typecheck this package outside the monorepo will fail with an unresolved peer error.
- Migration plan: This is an intentional architectural constraint (source-mirror pattern). No migration needed unless the package is intended to be independently publishable.

## Missing Critical Features

**No standalone test suite:**
- Problem: The repo contains zero test files. The only validation is the monorepo-level pack parity test (referenced in a code comment) and CI's `npm pack --dry-run`.
- Blocks: Cannot verify locally that the manifest export matches `package.json`; cannot catch regressions in the SKILL.md classifier prompt without monorepo context.
- Priority: Medium — low risk today given the repo's simplicity, but grows as the artifact definition evolves.

**No `exports` field in `package.json`:**
- Problem: The package uses `"type": "module"` and ESM but lacks a `"exports"` field. This means Node.js ESM resolution falls back to `"main"`, which points to a `.ts` source file — invalid for published packages.
- Blocks: Correct ESM consumption by any toolchain that respects `"exports"` over `"main"`.
- Priority: High if this package is ever published to a registry for external consumption.

## Test Coverage Gaps

**Manifest parity not tested standalone:**
- What's not tested: That `marketingStrategyArtifactManifest` in `src/index.ts` matches `package.json`'s `cinatra.artifact` block exactly.
- Files: `src/index.ts`, `package.json`
- Risk: Silent divergence between the runtime export and the package metadata, causing the wrong matcher or threshold to be applied at runtime vs. what the registry indexes.
- Priority: High

**SKILL.md classifier prompt not tested:**
- What's not tested: That `skills/marketing-strategy-matcher/SKILL.md` correctly classifies boundary-case documents (e.g., a GTM plan that is 80% ICP material, which the prompt explicitly says should return `matches:false`).
- Files: `skills/marketing-strategy-matcher/SKILL.md`
- Risk: Prompt regressions (e.g., after edits to the confidence guidance or boundary rules) go undetected.
- Priority: Medium

---

*Concerns audit: 2026-06-09*
