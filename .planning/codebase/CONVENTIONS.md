# Coding Conventions

**Analysis Date:** 2026-06-09

## Repository Type

This is a Cinatra extension repo (kind: `artifact`) — a source mirror extracted from the cinatra monorepo. It contains a single TypeScript source file (`src/index.ts`) and one skill definition (`skills/marketing-strategy-matcher/SKILL.md`). Conventions are minimal by design; the repo's primary contract is its `package.json` manifest shape and the SKILL.md prompt content.

## Naming Patterns

**Files:**
- TypeScript source files: camelCase, e.g. `index.ts`
- Skill directories: kebab-case, e.g. `marketing-strategy-matcher/`
- Skill definition files: `SKILL.md` (uppercase)
- Workflow files: kebab-case, e.g. `ci.yml`, `release.yml`

**Functions/Variables:**
- Exported constants: camelCase, descriptive noun phrase — e.g. `marketingStrategyArtifactManifest` (`src/index.ts`)
- No functions defined; this repo exports a single typed constant

**Types:**
- Imported from `@cinatra-ai/sdk-extensions` using `import type` (type-only imports enforced by `verbatimModuleSyntax`)
- Type name in use: `SemanticArtifactManifest` (PascalCase, from SDK)

**Package Names:**
- Scoped under `@cinatra-ai/`, kebab-case: `@cinatra-ai/marketing-strategy-artifact`
- Skill references follow `<package-name>:<skill-name>` format: `@cinatra-ai/marketing-strategy-artifact:marketing-strategy-matcher`

## Code Style

**Formatting:**
- No Prettier or ESLint config detected — formatting is not enforced via tooling in this repo
- The monorepo owns linting/formatting for source mirrors; standalone enforcement is not applicable here

**Linting:**
- Not detected (no `.eslintrc*`, `eslint.config.*`, or `biome.json`)

**TypeScript config:** `tsconfig.json`
- `strict: true` with `noImplicitAny: false` (strict mode minus implicit any)
- `verbatimModuleSyntax: true` — requires `import type` for type-only imports (enforced)
- `isolatedModules: true` — each file must be independently transpilable
- `module: ESNext`, `moduleResolution: bundler`
- `target: ES2023`

## Import Organization

**Pattern observed in `src/index.ts`:**
- Type-only imports first, using `import type { ... } from "..."` syntax
- No runtime imports in source; all imports are type-level

**Path Aliases:**
- None defined in `tsconfig.json` — bare package imports only

## Error Handling

- Not applicable — this repo contains no runtime logic, only a static manifest constant and a SKILL.md prompt

## Logging

- Not applicable — no runtime code

## Comments

**Style:**
- Block comments at file top explain purpose and architectural context (see `src/index.ts` lines 3–11)
- CI workflow files use extensive inline comments explaining branching logic (see `.github/workflows/ci.yml`)
- Comments describe WHY (architecture rationale), not what the code does line-by-line

**JSDoc/TSDoc:**
- Not used — the exported constant has no JSDoc annotation

## Module Design

**Exports:**
- Single named export per file: `export const marketingStrategyArtifactManifest` from `src/index.ts`
- No default exports
- `package.json` `"main"` and `"types"` both point to `./src/index.ts` (source, not compiled dist — the monorepo consumes the source directly)

**Barrel Files:**
- `src/index.ts` serves as the sole entry point; no subdirectory barrel files

## Manifest Parity Convention

A critical project-specific rule: the typed export in `src/index.ts` must be **byte-equal** to the `cinatra.artifact` section in `package.json`. The comment in `src/index.ts` explicitly states this is enforced by a pack parity test in the monorepo. When editing either location, update both in lockstep.

## Dependency Shape Convention

First-party `@cinatra-ai/*` packages MUST be declared as optional `peerDependencies` only — never in `dependencies`, `devDependencies`, or `optionalDependencies`. The CI gate (`ci.yml`) enforces this and fails with exit code 2 on violation.

---

*Convention analysis: 2026-06-09*
