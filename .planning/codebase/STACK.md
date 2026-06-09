# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript — `src/index.ts`, `tsconfig.json`

**Secondary:**
- YAML — GitHub Actions workflows in `.github/workflows/`
- Markdown — `skills/marketing-strategy-matcher/SKILL.md`, `README.md`

## Runtime

**Environment:**
- Node.js 24 (pinned in `.github/workflows/ci.yml`)

**Package Manager:**
- pnpm (managed via corepack; no version pinned in `package.json`)
- Lockfile: not committed (CI runs `pnpm install --no-frozen-lockfile`)

## Frameworks

**Core:**
- None — this is a content/manifest extension, not an application framework

**Testing:**
- Not applicable — tests are run inside the Cinatra monorepo, not standalone

**Build/Dev:**
- TypeScript compiler (`tsc`) — configured in `tsconfig.json`, targets `dist/`

## Key Dependencies

**Critical:**
- `@cinatra-ai/sdk-extensions` — provides the `SemanticArtifactManifest` type imported in `src/index.ts`; declared as an optional peerDependency (never on a public registry; resolved only inside the Cinatra monorepo)

**Infrastructure:**
- None — no runtime dependencies or devDependencies declared in `package.json`

## Configuration

**TypeScript (`tsconfig.json`):**
- `target`: ES2023
- `module`: ESNext
- `moduleResolution`: bundler
- `strict`: true, `noImplicitAny`: false
- `verbatimModuleSyntax`: true
- `outDir`: `dist/`, `rootDir`: `src/`
- Declarations + source maps enabled

**Package (`package.json`):**
- `"type": "module"` — ESM-only package
- `"main"` / `"types"`: `./src/index.ts` — source-level entry (not compiled dist)
- `cinatra.apiVersion`: `cinatra.ai/v1`, `cinatra.kind`: `artifact`
- Accepted MIME types: `text/markdown`, `text/plain`, `application/pdf`
- `matcherConfidenceThreshold`: 0.7

**npm config (`.npmrc`):**
- `.npmrc` file is present — contents not read (may contain registry or auth config)

## Platform Requirements

**Development:**
- Node.js 24+, corepack enabled, pnpm
- Must be developed inside the Cinatra monorepo workspace (standalone install not supported due to unresolvable `@cinatra-ai/*` peers)

**Production:**
- Published to `registry.cinatra.ai` via the Cinatra Marketplace release pipeline (see `.github/workflows/release.yml`)
- Release is triggered by a GitHub Release tag matching `v<package.json.version>`

---

*Stack analysis: 2026-06-09*
