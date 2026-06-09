# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
marketing-strategy-artifact/
├── src/
│   └── index.ts              # Single TypeScript entry point; exports SemanticArtifactManifest
├── skills/
│   └── marketing-strategy-matcher/
│       └── SKILL.md          # LLM classification prompt for the matcher skill
├── .github/
│   └── workflows/
│       ├── ci.yml            # Build, typecheck, pack, kind-gate CI pipeline
│       └── release.yml       # Release workflow
├── .planning/
│   └── codebase/             # GSD codebase map documents (this directory)
├── package.json              # Extension manifest: cinatra kind=artifact, peer deps
├── tsconfig.json             # Standalone strict TypeScript config (targets src/)
├── .npmrc                    # npm/pnpm registry config (existence noted; not read)
├── LICENSE                   # Apache-2.0
└── README.md                 # Project documentation
```

## Directory Purposes

**`src/`:**
- Purpose: TypeScript source for the artifact extension
- Contains: One file — the typed manifest export
- Key files: `src/index.ts`

**`skills/`:**
- Purpose: Cinatra skill definitions consumed by the platform's LLM runtime
- Contains: One skill subdirectory per registered skill; each contains a `SKILL.md`
- Key files: `skills/marketing-strategy-matcher/SKILL.md`

**`skills/marketing-strategy-matcher/`:**
- Purpose: The matcher skill that classifies documents as marketing-strategy artifacts
- Contains: `SKILL.md` — frontmatter (`name`, `description`) plus full LLM prompt and output contract

**`.github/workflows/`:**
- Purpose: GitHub Actions CI/CD pipelines
- Contains: `ci.yml` (main gate), `release.yml` (publish flow)

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents written by the mapper agent
- Generated: Yes (by `/gsd-map-codebase`)
- Committed: Yes (planning artifacts are committed)

## Key File Locations

**Entry Points:**
- `src/index.ts`: TypeScript module entry; exports `marketingStrategyArtifactManifest`

**Configuration:**
- `package.json`: Extension registration (`cinatra` field), peer dependencies, ESM module config
- `tsconfig.json`: Standalone TypeScript compiler config (target ES2023, moduleResolution bundler, outDir dist)
- `.npmrc`: Registry configuration (existence noted)

**Core Logic:**
- `src/index.ts`: Manifest constant (accepted MIME types, skill references, confidence threshold)
- `skills/marketing-strategy-matcher/SKILL.md`: Classification rules and output contract

**CI:**
- `.github/workflows/ci.yml`: Dependency-shape validation, typecheck, pack dry-run, kind-gate

## Naming Conventions

**Files:**
- TypeScript sources: camelCase (`index.ts`)
- Skills: kebab-case directory names matching the skill ID segment (`marketing-strategy-matcher/`)
- Skill content files: uppercase (`SKILL.md`)
- Workflows: lowercase kebab-case (`ci.yml`, `release.yml`)

**Directories:**
- Skill directories: kebab-case, matching the skill name declared in `package.json` matchers array

**Exported identifiers:**
- Manifest constant: camelCase, descriptive, suffixed with `Manifest` — `marketingStrategyArtifactManifest`
- Type imports: PascalCase from SDK — `SemanticArtifactManifest`

## Where to Add New Code

**New matcher skill:**
- Create directory: `skills/<skill-name>/`
- Add prompt file: `skills/<skill-name>/SKILL.md` with frontmatter `name` and `description`
- Register in manifest: add skill ID to `skills.matchers` array in both `src/index.ts` and `package.json` `cinatra.artifact.skills.matchers`

**New accepted MIME type:**
- Update `accepts.file.mimeTypes` in `src/index.ts` AND `package.json` `cinatra.artifact.accepts.file.mimeTypes` — both must stay in sync

**Confidence threshold change:**
- Update `matcherConfidenceThreshold` in `src/index.ts` AND `package.json` `cinatra.artifact.matcherConfidenceThreshold`

**Utilities:**
- Not applicable — this package has no utility layer. All logic is in the LLM skill prompt.

## Special Directories

**`dist/`:**
- Purpose: TypeScript compiler output (declarations, source maps, JS)
- Generated: Yes (by `tsc`)
- Committed: No (generated artifact)

**`.planning/`:**
- Purpose: GSD planning and codebase map documents
- Generated: Yes (by GSD tooling)
- Committed: Yes

---

*Structure analysis: 2026-06-09*
