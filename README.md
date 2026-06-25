# Marketing Strategy

A go-to-market plan — positioning, GTM motion, channel mix, messaging architecture, segmentation, and the campaign roadmap that ties it all together. The strategy is the layer that grounds writers, campaigners, and outbound agents in "how we go to market".

Install this artifact from the Cinatra marketplace. Once installed, upload or paste your marketing strategy document (Markdown, plain text, or PDF). The artifact classifier reads the document and confirms it is a marketing-strategy type (confidence threshold 0.7); if the classifier scores below that threshold the document is rejected with a rationale explaining which required sections were absent.

Configure the artifact by attaching any agent that consumes strategy context — for example, the Email Outreach agent. No API keys or secrets are required for the artifact itself; credentials belong to the connected agents.

Use the artifact as the shared strategy reference across your workspace. Connected agents read positioning statements, channel priorities, and messaging pillars directly from the uploaded document rather than ad-hoc prompts. Re-upload whenever your GTM direction changes to keep all agents in sync.

The API contract is a JSON matcher response: `{ "matches": boolean, "confidence": number, "rationale": string }`. A `matches: true` result with confidence above 0.7 means the document was accepted. A `matches: false` result or a confidence below 0.7 means the document did not contain sufficient strategy signal; the rationale field names the missing or weak sections.

For development, clone the repository and run `node extension-kind-gate.mjs` from the root to validate the manifest and README before publishing. The matcher skill is defined in `skills/marketing-strategy-matcher/SKILL.md` and the artifact manifest is exported from `src/index.ts`. If the gate reports a README size error or a disallowed heading, edit `README.md` and re-run the gate. If an uploaded document is misclassified, review the confidence guidance in the matcher skill and add representative section headings to the document.

## Works with

- Email Outreach agent

## Capabilities

- Capture positioning, GTM motion, and channel mix in one document
- Ground outbound email copy in the right messaging pillars and positioning
- Brief writers and campaign planners with a shared GTM narrative
- Align in-flight campaigns with the company's stated channel and segmentation choices
