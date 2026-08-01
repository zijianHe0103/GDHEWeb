# TASK-020 Frontend Custom-length P1 Round 1 Checkpoint

status: `PASS_FOR_NARROW_ADVERSARIAL_ROUND_2`
checked_at: `2026-08-01T12:25:13Z`

## Scope

The revision changes only:

- `frontend/src/lib/product-configuration/build-quote-line.ts`;
- `frontend/tests/product-configuration-quote-builder.test.ts`;
- existing TASK-020 frontend evidence and frontend lane worklog.

The builder now parses an already-canonical one-decimal string into integer
tenths, requires that scaled value to be a positive safe integer, divides by
ten and checks that multiplying the result by ten reproduces the same tenths.
No Product Configuration or QuoteLine authority byte changed.

## Independently Reproduced Finding Closure

- focused builder suite: `1 file / 13 tests PASS`;
- `9999999999999999.9` returns only the sanitized
  `{ field: "customLength", code: "invalid" }` result;
- a 400-digit positive integer followed by `.9` returns the same closed error;
- ordinary `5.8` remains a successful custom line with `articleNumber: null`,
  `resolution: sales_follow_up` and frozen QuoteLine Schema validity;
- standard selection, color, installation, base packaging, Logo, protection,
  quantity and latest-result behavior remain covered by the unchanged suite.

The frontend evidence preserves the strict RED: the prior focused run had
`11` passing tests and exactly the two disclosed failures, one rounded success
and one Infinity success, before the production guard was added.

## Current-byte Regression Gates

- full Vitest: `35 files / 406 tests PASS`;
- CMS verifier: `16 / 2 / 2 PASS`;
- ProductCard verifier: `8 / 3 / 6 PASS`;
- Product Configuration verifier: `4 / 1 / 6 PASS`;
- ESLint and TypeScript: `PASS`;
- clean production build: `PASS`;
- CMS integration, ProductList and Product Detail production smokes: `PASS`;
- package, lockfile, next-env, protected media and icon hashes reproduce;
- Product Configuration snapshot: `7` files,
  `df7391c60fd16c3db00daa8f81f0e1d7410198ebc2930d4322734e64fe01499f`;
- QuoteLine authority: `10` files,
  `5bb1382d71316690c5b65754ad006343d04b22c34c3ad282bd97112cbd14bf6f`;
- CMS plugin: `76` files,
  `ded3f93e3d89b903f8e3fba0e687547f7c22d234b87bfc80e2563f73348de098`;
- visual evidence hashes: `20/20 PASS`;
- no port-3000 listener or probe residue;
- Planner's fresh `.next` was moved to the recoverable Trash path
  `/Users/arron/.Trash/gdhe-task020-custom-length-planner-build-20260801T1221Z`;
- `git diff --check`, governance project, messages and strict lane audit PASS.

One initial Planner protected-diff command incorrectly included known
TASK-020-controlled product-detail files and therefore reported their expected
task diff. The corrected command used only frozen paths and passed with exact
hashes; no file was changed by either read-only check.

## Gate Result

The Round 1 custom-length P1 is closed for a narrow independent Round 2 review.
This checkpoint is not review PASS, final validation, user acceptance, Git
delivery or deployment.
