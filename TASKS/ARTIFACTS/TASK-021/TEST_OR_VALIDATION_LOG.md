# TASK-021 Aggregate Test and Validation Log

Status: PASS
runtime: Node 24.18.0 / npm 11.16.0 / PHP 8.3.32 / WordPress 7.0.2 / SCF 6.9.2 / GDHE Site 0.7.0

## Product Configuration authority

- CMS/Python full-root exact decimal matrix:
  `4.3=true`, `5.8=true`, `6.7=true`, `6.05=false`;
- four-Schema closure, four positive documents, seven negatives and one current
  runtime Golden: PASS;
- current Golden remains exactly
  `GDHEPRD000172 / 6 m / Ivory White / piece`;
- final determinism SHA-256:
  `c4e88b48d4e02d79bf1e5d5abdb55f2c564d5757305d03f806ad96032b39b7f5`;
- final manifest SHA-256:
  `11f3db81c1b962c387f731d9c171d2f370ba60bdc3391cc10ec991247120ac09`;
- final checksum-stream SHA-256:
  `fe611983112944edcf214d88a9aefac6cc4fa4b9258f07670870414a919204ca`;
- direct checksum and independent manifest expansion: `20/20 PASS`;
- Product Configuration v1 handoff: `17/17 PASS`;
- final two CMS lifecycles used different database IDs, retained an identical
  Golden hash, cleaned `15 posts / 0 terms / 0 uploads` per round and left zero
  Fixture residue.

## Frontend

- direct closure: `4 files / 14 tests PASS`;
- full Vitest: `40 files / 422 tests PASS`;
- CMS verifier: `16 schemas / 2 success / 2 errors PASS`;
- ProductCard verifier: `8 schemas / 3 success / 6 errors PASS`;
- Product Configuration v1 verifier: `4 schemas / 1 success / 6 errors PASS`;
- Product Configuration v2 verifier: PASS;
- QuoteLine v2 verifier: PASS;
- ESLint: PASS;
- TypeScript: PASS;
- Next.js 16.2.11 production build: PASS;
- routes: `/`, `/_not-found`, `/icon.svg`, `/integration/cms`, `/products`,
  `/products/fgd-x15-pvc`;
- CMS integration production smoke: PASS;
- ProductList production smoke: production final 404, zero CMS request;
- Product Detail production smoke: production final 404, zero CMS request.

## Browser, visual and security

- real preview HTML/Flight contains no Article Number, stable internal UUID,
  raw internal enum, `sales_follow_up`, WordPress/Feishu marker, secret or
  diagnostic;
- production state uses `latestDraft` / `PublicQuoteDraft` /
  `LatestPublicQuoteDraftSummary`; old line names are absent from production;
- QuoteLine v2 builder has zero production caller;
- one-latest replacement, invalid-retention, zero network/storage/submission
  and refresh-clears semantics: PASS;
- responsive/keyboard/network evidence at 1440/1024/768/390/320 and reduced
  motion: PASS;
- Visual Round 2: `PASS / severe=0 / obvious=0 / detail=0`;
- evidence inventory: `23/23 PASS` with historical encoding disclosure
  preserved.

## WordPress and governance

- WordPress Core checksum: PASS;
- official SCF checksum: PASS;
- GDHE Site active version: `0.7.0`;
- database tables: `12/12 PASS`;
- Adversarial Round 2 final: `PASS / P0=0 / P1=0 / P2=0`;
- Round 1 `FAIL / 0 / 2 / 1` and visual histories preserved;
- project validation, message validation, strict lane audit and
  `git diff --check`: PASS;
- port 3000 listener: absent;
- generated `.next`: moved to recoverable Trash after final build.

The first final-validation CMS/handoff command group was accidentally invoked
from `QA/TASK-021`, so project-root relative paths were not found. The visual
inventory in that same invocation still passed 23/23. The CMS/handoff commands
were immediately rerun from the repository root and passed without product or
authority mutation. This was an operator working-directory error, not a
contract or test failure.
