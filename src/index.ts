import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/marketing-strategy-artifact` defines the marketing-strategy
// artifact extension. A semantic work product describing HOW a company reaches
// its target market: positioning, GTM motion, channel mix, messaging
// architecture, and campaign roadmap. Distinct from the ICP (the audience
// itself) and from the brand-voice guide (the writing style only).
//
// Same Stage D shape as siblings: bytes-only matcher, no connectorRef, no
// templates, no agentDependencies. The typed export below is mirrored in
// package.json `cinatra.artifact` — the pack parity test pins them byte-equal.
export const marketingStrategyArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/markdown", "text/plain", "application/pdf"],
    },
  },
  skills: {
    matchers: [
      "@cinatra-ai/marketing-strategy-artifact:marketing-strategy-matcher",
    ],
  },
  matcherConfidenceThreshold: 0.7,
};
