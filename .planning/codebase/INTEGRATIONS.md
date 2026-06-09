# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Cinatra Marketplace:**
- Service: `registry.cinatra.ai` — the Cinatra extension registry where this artifact is published
  - SDK/Client: Not applicable (publish is handled by the central reusable GitHub Actions workflow `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml`)
  - Auth: `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret (referenced in `.github/workflows/release.yml` via `secrets: inherit`)

**Cinatra Monorepo / SDK:**
- Service: `@cinatra-ai/sdk-extensions` — internal Cinatra monorepo package providing the `SemanticArtifactManifest` type
  - SDK/Client: TypeScript import in `src/index.ts`
  - Auth: Not applicable (resolved as a workspace peer inside the monorepo, never via a public registry)

## Data Storage

**Databases:**
- Not applicable — this is a stateless artifact manifest extension with no database

**File Storage:**
- Not applicable

**Caching:**
- Not applicable

## Authentication & Identity

**Auth Provider:**
- Not applicable at runtime — the extension itself has no auth; the publish pipeline uses the `CINATRA_MARKETPLACE_VENDOR_TOKEN` GitHub org secret for marketplace submission

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Not applicable — no runtime process; CI build logs surface via GitHub Actions

## CI/CD & Deployment

**Hosting:**
- `registry.cinatra.ai` (Cinatra Marketplace)

**CI Pipeline:**
- GitHub Actions
  - `.github/workflows/ci.yml` — build, typecheck (skipped for source-mirror repos), pack dry-run, kind-specific gate; triggers on push/PR to `main`
  - `.github/workflows/release.yml` — delegates to `cinatra-ai/.github` reusable workflow on GitHub Release publish; grants `id-token: write` for build-provenance attestation

## Environment Configuration

**Required env vars:**
- `CINATRA_MARKETPLACE_VENDOR_TOKEN` — GitHub org secret; required only for the release pipeline, not for local development

**Secrets location:**
- GitHub org-level secrets (not stored in this repo)

## Webhooks & Callbacks

**Incoming:**
- Not applicable

**Outgoing:**
- Not applicable — the artifact extension is a passive manifest; it is invoked by the Cinatra platform's matcher pipeline when a file is attached, but does not make outbound webhook calls itself

---

*Integration audit: 2026-06-09*
