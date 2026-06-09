# Testing Patterns

**Analysis Date:** 2026-06-09

## Repository Context

This is a Cinatra source-mirror extension repo (kind: `artifact`). It declares `@cinatra-ai/sdk-extensions` as an optional peer dependency — a host-internal package that exists only in the cinatra monorepo and is not published to any registry. As a result, standalone install, typecheck, and test execution are intentionally skipped in CI; the monorepo owns all test execution for this repo.

## Test Framework

**Runner:**
- Not applicable — no test files exist in this repo (`find` reveals no `*.test.*` or `*.spec.*` files)
- The CI `Test` step runs `corepack pnpm test --if-present`, which is a no-op for source mirrors with host-internal peers

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
# Standalone test execution is skipped for this source mirror.
# Tests run in the cinatra monorepo context, not here.
# The CI gate documents this explicitly in .github/workflows/ci.yml lines 114-123.
```

## Test File Organization

**Location:**
- No test files present in this repo

**Naming:**
- Not applicable

## Test Structure

**Suite Organization:**
- Not applicable — no tests defined in this repo

## Mocking

**Framework:** Not applicable

**What to Mock:**
- Not applicable

## Fixtures and Factories

**Test Data:**
- Not applicable

## Coverage

**Requirements:** Not enforced in this repo — the monorepo owns coverage targets

**View Coverage:**
```bash
# Not applicable standalone; run from the cinatra monorepo
```

## Test Types

**Unit Tests:**
- Not present in this repo; monorepo tests the manifest constant and pack parity

**Integration Tests:**
- CI enforces two structural gates instead of traditional integration tests:
  1. **Dependency shape gate** (`ci.yml` lines 47–69): validates that no `@cinatra-ai/*` packages leaked into `dependencies`/`devDependencies`/`optionalDependencies`, and that all first-party peers are marked `optional: true` in `peerDependenciesMeta`
  2. **Pack dry-run** (`ci.yml` lines 125–127): `npm pack --dry-run` validates publish payload shape without resolving peers

**E2E Tests:**
- Not used in this repo

## CI Test Behavior

The CI pipeline (`ci.yml`) implements a **source-mirror detection pattern**:

- If `peerDependencies` contains any `@cinatra-ai/*` or `@cinatra/*` package → sets `first_party=1`, skips install/typecheck/test
- If no first-party peers → sets `first_party=0`, runs full install + typecheck + `pnpm test --if-present`

This means any future addition of a local test suite (e.g., for a pure-JS utility with no first-party peers) would automatically be picked up by CI without workflow changes.

## Pack Parity Contract

The monorepo enforces that the manifest constant exported from `src/index.ts` is byte-equal to the `cinatra.artifact` field in `package.json`. This is a form of snapshot/parity testing owned by the monorepo, not by test files in this repo. When modifying the manifest, both `src/index.ts` and `package.json` must be updated together.

---

*Testing analysis: 2026-06-09*
