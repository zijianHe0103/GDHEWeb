# TASK-020 Aggregate Test and Validation Log

Status: PASS
runtime: Node 24.18.0 / npm 11.16.0 / PHP 8.3.32 / WordPress 7.0.2

## Frontend

- custom-length production-builder focused: `1 file / 13 tests PASS`;
- TASK-020 plus frozen QuoteLine/icon focused evidence: `12 files / 108 tests PASS`;
- full Vitest: `35 files / 406 tests PASS`;
- ESLint: PASS;
- TypeScript: PASS;
- Next.js 16.2.11 clean production build: PASS;
- routes: `/`, `/_not-found`, `/icon.svg`, `/integration/cms`, `/products`,
  `/products/fgd-x15-pvc`;
- CMS integration production smoke: PASS;
- ProductList production smoke: PASS, production final 404, zero CMS request;
- Product Detail production smoke: PASS, production final 404, zero CMS request.

## Contract and numeric boundaries

- CMS verifier: `16 schemas / 2 success / 2 error PASS`;
- ProductCard verifier: `8 schemas / 3 success / 6 error PASS`;
- Product Configuration verifier: `4 schemas / 1 success / 6 error PASS`;
- Product Configuration handoff: `17/17 PASS`;
- standard GDHEPRD000172 line: frozen QuoteLine Schema-valid;
- ordinary custom `5.8`: exact and frozen QuoteLine Schema-valid;
- `9999999999999999.9`: fail closed with customLength invalid;
- 400-digit `.9`: fail closed with customLength invalid;
- maximum exact safe scaled tenths `900719925474099.1`: PASS and JSON stable;
- next unsafe scaled value: rejected;
- whitespace/newline/sign/leading-zero/zero/trailing-dot/missing-whole/
  two-decimal custom forms: rejected.

## WordPress and protected state

- WordPress Core checksum: PASS;
- official SCF checksum: PASS;
- database: 12/12 tables PASS;
- Product Configuration snapshot: exact 7-file frozen aggregate;
- QuoteLine authority: exact 10-file frozen aggregate;
- GDHE Site CMS plugin: exact 76-file frozen aggregate;
- package, lockfile, production next-env, protected image and icon hashes: PASS;
- protected baseline Git diff: empty;
- port 3000 listener: absent;
- generated `.next`: moved to recoverable Trash after final build.

## Visual and browser

- 1440/1024/768/390 and 320 reflow evidence: PASS;
- default, invalid, standard and custom replacement states: PASS;
- labels, associated errors, live region, native focus/keyboard and target size:
  PASS;
- Favicon Visual Round 2: `PASS / severe 0 / obvious 0 / detail 0`;
- clean Guest icon 200, favicon.ico 0 request/404, Console 0;
- native Enter Network delta 0 and all inspected URLs local same-origin;
- evidence inventory: `20/20 PASS` with actual encodings truthfully disclosed.

## Governance

- Adversarial Round 2 final: `PASS / P0=0 / P1=0 / P2=0`;
- Round 1 and all historical Planner/visual outcomes preserved;
- `git diff --check`: PASS;
- project validation: PASS;
- message validation: PASS;
- strict lane audit: PASS.

An earlier inventory invocation from repository root failed only because the
inventory paths are relative to `QA/TASK-020`; the corrected canonical-directory
run passed 20/20 without evidence mutation. An earlier protected-diff command
included allowed TASK-020 files and showed their expected task diff; the
corrected frozen-only command passed. These were read-only command-scope errors,
not product or validation failures.
