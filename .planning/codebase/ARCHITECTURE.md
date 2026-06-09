<!-- refreshed: 2026-06-09 -->
# Architecture

**Analysis Date:** 2026-06-09

## System Overview

```text
┌──────────────────────────────────────────────────────────────┐
│              Cinatra Monorepo (host runtime)                  │
│  resolves @cinatra-ai/sdk-extensions, runs tests/typecheck   │
└───────────────────────┬──────────────────────────────────────┘
                        │ optional peer dep
                        ▼
┌──────────────────────────────────────────────────────────────┐
│        @cinatra-ai/marketing-strategy-artifact (this repo)   │
│                                                              │
│  src/index.ts  ──exports──▶  SemanticArtifactManifest        │
│  (manifest: accepts, skills, threshold)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │ references skill by ID
                        ▼
┌──────────────────────────────────────────────────────────────┐
│   skills/marketing-strategy-matcher/SKILL.md                 │
│   (LLM prompt: classify doc as marketing-strategy or not)    │
└──────────────────────────────────────────────────────────────┘
                        │ emits JSON
                        ▼
┌──────────────────────────────────────────────────────────────┐
│   { matches: boolean, confidence: number, rationale: string }│
│   Platform evaluates confidence >= 0.7 → artifact accepted   │
└──────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Artifact Manifest | Declares accepted MIME types, skill references, and confidence threshold | `src/index.ts` |
| Skill Prompt | LLM classification prompt — determines if a document is a marketing-strategy artifact | `skills/marketing-strategy-matcher/SKILL.md` |
| Package Manifest | Cinatra extension metadata (kind: artifact), peer dependency declarations | `package.json` |
| CI Pipeline | Validates dependency shape, typechecks, packs dry-run, runs kind-specific gates | `.github/workflows/ci.yml` |

## Pattern Overview

**Overall:** Cinatra Stage D "bytes-only matcher" artifact extension — a source-mirror package extracted from the Cinatra monorepo.

**Key Characteristics:**
- No connectorRef, no templates, no agentDependencies — pure classification artifact
- Single TypeScript entry point exports one typed manifest constant
- Classification logic lives entirely in a SKILL.md prompt (LLM-driven, not code-driven)
- The platform (monorepo host) owns install, typecheck, and test execution; CI skips these for source mirrors
- Manifest is duplicated in both `src/index.ts` (typed export) and `package.json` `cinatra.artifact` field — CI pack-parity test pins them byte-equal

## Layers

**Manifest Layer:**
- Purpose: Typed TypeScript declaration of the artifact's acceptance criteria and skill references
- Location: `src/index.ts`
- Contains: Single exported `SemanticArtifactManifest` constant
- Depends on: `@cinatra-ai/sdk-extensions` (optional peer, type-only import)
- Used by: Cinatra platform runtime at artifact-match time

**Skill Layer:**
- Purpose: LLM prompt that classifies whether an attached document is a Marketing Strategy artifact
- Location: `skills/marketing-strategy-matcher/SKILL.md`
- Contains: Semantic classification rules, positive/negative examples, confidence bands, output JSON contract
- Depends on: Nothing (plain Markdown, consumed by LLM runtime)
- Used by: Cinatra platform when the matcher skill is invoked

**Package Metadata Layer:**
- Purpose: Extension registration with the Cinatra platform — declares kind, API version, and inline artifact config
- Location: `package.json` (the `cinatra` field)
- Contains: `cinatra.apiVersion`, `cinatra.kind`, `cinatra.artifact` (mirrors `src/index.ts`)
- Depends on: Nothing
- Used by: Cinatra extraction/registration tooling

## Data Flow

### Primary Classification Path

1. Platform receives an uploaded file (text/markdown, text/plain, or application/pdf) — evaluated against manifest `accepts.file.mimeTypes` (`src/index.ts` line 16–18)
2. Platform invokes matcher skill `@cinatra-ai/marketing-strategy-artifact:marketing-strategy-matcher` — resolved to `skills/marketing-strategy-matcher/SKILL.md`
3. LLM evaluates document against the SKILL.md prompt; emits `{ matches, confidence, rationale }` JSON
4. Platform compares `confidence` to `matcherConfidenceThreshold: 0.7` (`src/index.ts` line 23) — artifact accepted if threshold met

**State Management:**
- Stateless — no runtime state, no database, no caching. Each classification is a single LLM call.

## Key Abstractions

**SemanticArtifactManifest:**
- Purpose: Platform contract type describing what files an artifact accepts and which skills classify them
- Examples: `src/index.ts`
- Pattern: Single typed constant export; mirrored in `package.json` for pack-parity validation

**Matcher Skill:**
- Purpose: Encapsulated LLM classification prompt registered under a namespaced skill ID
- Examples: `skills/marketing-strategy-matcher/SKILL.md`
- Pattern: Frontmatter declares `name` and `description`; body is the full classifier prompt with output contract

## Entry Points

**TypeScript Export:**
- Location: `src/index.ts`
- Triggers: Imported by Cinatra platform runtime or monorepo workspace
- Responsibilities: Exports `marketingStrategyArtifactManifest` — the single authoritative manifest object

**Package Registration:**
- Location: `package.json` (`cinatra` field)
- Triggers: Read by Cinatra extension tooling during registration/extraction
- Responsibilities: Declares extension kind, API version, and inline copy of artifact config

## Architectural Constraints

- **Threading:** Not applicable — no runtime process; classification is executed by the platform's LLM runtime
- **Global state:** None — no module-level singletons or shared mutable state
- **Circular imports:** None — single source file with no intra-repo imports
- **Source mirror constraint:** First-party `@cinatra-ai/*` deps must be optional peerDependencies only; direct/dev deps cause CI failure (enforced in `.github/workflows/ci.yml`)
- **Pack parity:** `src/index.ts` manifest and `package.json` `cinatra.artifact` must be byte-equal; validated by CI dry-run pack step

## Anti-Patterns

### Promoting peer deps to direct dependencies

**What happens:** A `@cinatra-ai/*` package is added to `dependencies` or `devDependencies` instead of `peerDependencies`.
**Why it's wrong:** These packages are not published to any registry; only the monorepo workspace resolves them. Promoting them breaks CI (exit 2) and makes the package non-installable standalone.
**Do this instead:** Declare under `peerDependencies` with `peerDependenciesMeta[pkg].optional = true`, as `@cinatra-ai/sdk-extensions` is declared in `package.json`.

### Diverging manifest copies

**What happens:** The `cinatra.artifact` block in `package.json` is updated without updating `src/index.ts` (or vice versa).
**Why it's wrong:** The pack-parity CI step treats them as a single source of truth; divergence is a latent bug where the runtime manifest and the registration metadata disagree.
**Do this instead:** Always update both `src/index.ts` and the `cinatra.artifact` field in `package.json` together.

## Error Handling

**Strategy:** Not applicable at the library level — no runtime error paths exist in this package.

**Patterns:**
- CI enforces correctness via structural checks (dependency shape, typecheck, pack dry-run) rather than runtime guards

## Cross-Cutting Concerns

**Logging:** Not applicable — no runtime code
**Validation:** Structural validation performed by CI (`ci.yml`); confidence threshold enforced by platform at runtime
**Authentication:** Not applicable — no external API calls

---

*Architecture analysis: 2026-06-09*
