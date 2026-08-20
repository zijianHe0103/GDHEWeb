# TASK-014 Adversarial Review Report

review_round: `2`
reviewed_at: `2026-07-30T05:13:53Z`
reviewer_lane: `adversarial_reviewer`
request: `MSG-TASK-014-ADVERSARIAL-REVIEW-R2`
mode: `INDEPENDENT_READ_ONLY_REVIEW`
verdict: PASS
p0: `0`
p1: `0`
p2: `0`
planner_final_validation_allowed: `YES_AFTER_CONTROLLED_REVIEW_RECOVERY`

## Outcome

TASK-014 final Round 2 verdict is PASS with P0=0, P1=0 and P2=0. Both
Round 1 P1 defects are closed: public references are field-role aware while
retaining identity and complete-target validation, and both native-integer and
offset-overflow pagination requests fail before query and slicing through the
normalized 400 no-store contract. The reviewer bytecode residue and the
Planner-detected Schema-only old namespace are also closed.

The direct regressions reproduce the frozen ProductCard and A3 evidence,
current runtime, cleanup, integrity and governance gates. Planner final
validation is allowed after controlled review recovery. PASS is not user
acceptance and does not authorize TASK-015, frontend implementation, Git
delivery or deployment.

The complete Round 1 FAIL history remains below, followed by the Round 2
closure evidence.

## Round 1 Historical Outcome

reviewed_at: `2026-07-30T04:18:57Z`
request: `MSG-TASK-014-ADVERSARIAL-REVIEW-R1`
verdict: `FAIL`
p0: `0`
p1: `2`
p2: `1`
planner_final_validation_allowed: `NO`

TASK-014 is additive at the route and Schema-manifest level, and the frozen
evidence reproduces the intended closed DTO, four action cells, one-request
ProductCard projection, deterministic pagination samples, A3 regression,
cleanup record and checksum handoff.

The review nevertheless found two independently reproducible P1 defects:

1. public taxonomy references bind a UUID to a resolvable path, but do not bind
   the reference role to the frozen category, series or application route
   authority; the current Fixture and Golden handoff consequently publish route
   shapes that conflict with TASK-013;
2. an anonymous digit-only `page` value larger than the native integer range is
   accepted by request validation, saturates during the cast and overflows the
   pagination offset to a float, causing `array_slice` to throw `TypeError`
   instead of returning the documented normalized pagination error.

The final scope check also found one reviewer-created P2 residue: importing two
validation scripts generated two untracked Python bytecode cache files inside
the protected CMS test tree. The reviewer attempted exact cleanup, but the lane
write-scope hook correctly refused it. Planner must perform the exact cleanup
before revision validation.

Planner final validation is not allowed. A narrow CMS revision, fresh
validation and a controlled Round 2 review are required.

## Findings

### P1-1 — Reference identity is not bound to its frozen route role

Severity: `P1`

The frozen TASK-013 route authority requires:

- series pages at `/series/` and `/series/{series-slug}/`;
- application pages at `/applications/` and
  `/applications/{application-slug}/`;
- product categories under the confirmed product group/subcategory hierarchy,
  not an invented `/products/category/{slug}/` namespace.

Evidence:

- `TASKS/ARCHIVE/TASK-013/OUTPUTS/URL_AND_CANONICAL_CONTRACT.md:7-23`
  freezes the exact route map;
- `TASKS/ARCHIVE/TASK-013/OUTPUTS/OPEN_DECISIONS.md:38-64` records the confirmed
  route decision;
- `cms/wp-content/plugins/gdhe-site/includes/fixtures-task014.php:183-218`
  instead freezes primary category
  `/products/category/task-014-card-products/` and series
  `/products/series/task-014-series/`;
- the same invalid series path is asserted as the positive identity-bound
  result in
  `cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php:193-215`
  and is present in the ProductCard Goldens and runtime evidence;
- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php:24-76`
  checks only exact keys, syntactic public path, unique resolution, complete
  target envelope and UUID equality. The shared helper receives no reference
  role and therefore cannot enforce category, series or application route
  authority.

This is not a cosmetic Fixture issue. The handoff represents these references
as canonical public identities, while the runtime accepts any otherwise valid
public Page as any of the three reference roles. UUID-to-path binding closes the
earlier mismatch defect but does not close role-to-authority binding.

Reproduction:

```text
TASK-013 series authority: /series/{series-slug}/
TASK-014 accepted Golden: /products/series/task-014-series/
```

Narrow revision:

- make reference validation field-aware;
- require series and application references to use their confirmed route
  shapes and require primary category to use a confirmed product
  group/subcategory route;
- retain UUID, unique-path and full-envelope validation;
- replace the invalid synthetic routes, add negative role/path cases, then
  regenerate the eight Goldens, runtime/determinism evidence and all handoff
  checksums.

### P1-2 — Oversized digit-only page values escape fail-closed pagination

Severity: `P1`

`gdhe_product_card_integer_param` accepts any digit-only string and immediately
casts it to `int`. The range check rejects values below one but applies no
upper-bound or overflow-safe offset check. Pagination later evaluates
`($page - 1) * $per_page` and passes the result to `array_slice`.

Evidence:

- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php:289-294`
  performs the lossy cast;
- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php:322-326`
  accepts the saturated positive integer;
- `cms/wp-content/plugins/gdhe-site/includes/product-cards.php:366-379`
  computes the unchecked offset;
- `cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php:244-265`
  covers zero, decimal and `per_page=101`, but not native-integer or offset
  overflow;
- `TASKS/ARCHIVE/TASK-014/OUTPUTS/DESIGN.md:30-39` and
  `docs/cms/REST_CONTRACT.md:30` promise that invalid pagination fails closed
  with the normalized error envelope.

Independent PHP 8.3 reproduction, using the exact parser and offset expression:

```text
input: 100 digit characters, all "9"
parsed page: 9223372036854775807
computed offset: 9.223372036854776E+20
result: TypeError: array_slice(): Argument #2 ($offset) must be of type int, float given
```

The route is anonymous, so a caller can trigger this before any ProductCard
consumer exists. The behavior violates the error/cache contract and creates an
avoidable public availability failure.

Narrow revision:

- validate the complete decimal text without a saturating cast;
- reject values that cannot produce an integer-safe offset, returning
  `gdhe_invalid_pagination` with status 400 and `Cache-Control: no-store`;
- add native-integer overflow and offset-overflow request negatives;
- if an explicit maximum page is introduced, synchronize the Schema, design
  and REST documentation before regenerating evidence and checksums.

### P2-1 — Reviewer validation left two protected-scope bytecode caches

Severity: `P2`

The no-write Python import used to independently traverse the ProductCard and
A3 Schema graphs generated:

```text
cms/wp-content/plugins/gdhe-site/tests/__pycache__/product-card-schema-test.cpython-311.pyc
cms/wp-content/plugins/gdhe-site/tests/__pycache__/a3-schema-validate.cpython-311.pyc
```

Both files are untracked. Their SHA-256 values at detection were:

```text
4783ebac228863a71e39c29119732ca2f21df30616681cd64c3dd11e028f1709
ae0d3291b7cc649565fec7d0225ac20587ee87e455c70baaa72a08d0f5182a72
```

The reviewer attempted to remove only those two files and their now-generated
directory. The DPG write-scope hook correctly blocked the command because the
reviewer may not write the CMS tree. No alternate deletion method was used.

Narrow recovery:

- Planner deletes exactly these two untracked bytecode files and removes the
  empty cache directory;
- verify that no other protected file changed and record the cleanup before
  dispatching implementation revision or Round 2.

## Passed boundaries

The following checks passed and must remain regression gates:

- additive route and manifest changes; existing Content Schema `3.0.0` roots
  and endpoint implementation were not rewritten;
- exact independent ProductCard eight-file transitive Schema closure;
- all eight current ProductCard Goldens validate against that closure;
- all 25 frozen handoff checksums match exact current bytes;
- legacy A3 traversal remains 19 files and all 15 frozen Goldens validate;
- closed ProductCard Schema objects and the current Golden leakage scan exclude
  WordPress/database/attachment IDs, raw meta/ACF/SCF, Feishu identifiers,
  internal Article Number resolution, supplier/cost/price data and internal
  media paths;
- current implementation contains no ProductCard call to `/resolve`, HTTP
  client, curl or fetch; the one-item sample is one collection request with one
  complete card;
- current success samples reproduce zero, one and N item responses, invariant
  totals, sorting and eligibility-before-pagination for the covered values;
- all four kind/lifecycle action cells and detail/accessory path behavior match
  the TASK-013 Round 2 contract;
- protected HTTPS media structure, local-only `test_candidate` gating and
  production-data non-authorization are preserved;
- current error samples, ETag, public cache header and conditional 304 evidence
  pass for covered cases;
- two frozen Fixture lifecycles report different database IDs, identical eight
  Golden hashes, exact 19-post/3-term cleanup and zero recorded TASK-014/A3
  residue;
- frontend Round 1 history is preserved; its missing real one-item and non-empty
  relation evidence is genuinely present in Round 2;
- PHP lint passed for every GDHE Site PHP file; all 49 current plugin/TASK-014
  JSON files parsed; no protected frontend, dependency, Core, SCF, theme,
  environment or configuration diff was found before the two reviewer-created
  bytecode caches described in P2-1;
- governance project validation, controlled-message validation, strict lane
  audit and Git whitespace validation passed before this report.

## Review limitations

The current local MySQL service was unavailable during the final reviewer
read-only probe, so no new Fixture lifecycle or database mutation was attempted.
Both the pre-probe and post-probe read-only database commands failed before
connection. This does not block the FAIL verdict because both P1 findings are
independently reproducible from current code and frozen authority.

The immutable TASK-014 SQL backup remains readable: 179205 bytes, SHA-256
`1b9f7def6c333284e324719e3fd43e68a8201100a96a7eba47aa48588635cb98`,
with its dump completion marker. Fresh Round 2 validation must restore local
database availability and repeat the exact runtime/residue gates after the
narrow revision.

## Scope and authorization

This report makes no business-deliverable repair and changes no product code,
CMS content, frontend, authority, task state, database, external system, Git
state or deployment. The two untracked generated bytecode caches are disclosed
as P2-1 and remain pending exact Planner cleanup because reviewer write scope
forbids their removal.

The production media origin and future Next Image allowlist remain an explicit
later visible-page/deployment gate. They are outside this CMS/API contract task
and are not counted as a current P2.

## Required next step

Planner should acknowledge this response, exactly remove the two disclosed
bytecode caches, record TASK-014 as needing the two narrow implementation
revisions, dispatch only those corrections, require fresh complete validation
and then request the configured final Round 2. No frontend implementation,
acceptance, commit, push, merge or deployment is authorized.

## Round 2 Final Review

### Final verdict

PASS. P0=0, P1=0, P2=0. Planner final validation is allowed after controlled
review recovery.

### P1-1 closure — Role-aware public references

The finding is closed.

- TASK-013 freezes primary category families at
  `/products/curtain-track-systems/` and `/products/accessories/`, each with at
  most one child, plus `/series/` and `/applications/` hub/detail routes
  (`TASKS/ARCHIVE/TASK-013/OUTPUTS/URL_AND_CANONICAL_CONTRACT.md:7-19`).
- `gdhe_product_card_reference_path_matches_role()` implements those exact
  three role families and fails unknown roles
  (`cms/wp-content/plugins/gdhe-site/includes/product-cards.php:24-40`).
- The shared reference validator still requires exact keys, UUIDv4, a valid
  public path, exactly one target, target UUID equality and a complete public
  envelope before projection
  (`cms/wp-content/plugins/gdhe-site/includes/product-cards.php:42-80`).
- Product projection passes fixed roles at the three call sites rather than a
  caller-controlled role
  (`cms/wp-content/plugins/gdhe-site/includes/product-cards.php:259-269`).
- The synthetic source now uses the correct category, series and application
  paths
  (`cms/wp-content/plugins/gdhe-site/includes/fixtures-task014.php:183-218`).
- The runtime contract test uses valid published targets to reject a wrong-role
  target independently for all three fields, while retaining mismatched-UUID
  rejection
  (`cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php:60-129`).
- A 15-case direct PHP matrix independently accepted all allowed hub/child
  shapes and rejected cross-role targets, both old namespaces and deeper
  descendants.
- Current runtime evidence records all three role and identity negatives as
  true and preserves one non-empty identity-bound series and application
  positive
  (`TASKS/ARCHIVE/TASK-014/EVIDENCE/PRODUCT_CARD_RUNTIME_VALIDATION.json:21-45`).

An exact scan of active ProductCard production code, Fixture, contract and
Schema tests, all eight Goldens, runtime/Schema/determinism JSON and machine
handoff found zero `/products/category/` or `/products/series/` values. The
Schema-only positive now uses the correct curtain-track child path
(`cms/wp-content/plugins/gdhe-site/tests/product-card-schema-test.py:70-74`).

### P1-2 closure — Pagination overflow

The finding is closed.

- Decimal text is normalized and compared to `PHP_INT_MAX` before integer
  conversion (`cms/wp-content/plugins/gdhe-site/includes/product-cards.php:310-325`).
- After the existing page/per-page bounds, multiplication safety is checked
  with `intdiv` before offset construction, query and `array_slice`
  (`cms/wp-content/plugins/gdhe-site/includes/product-cards.php:347-361`,
  `400-414`).
- The runtime test carries both required negatives and requires every error to
  have the normalized envelope and `Cache-Control: no-store`
  (`cms/wp-content/plugins/gdhe-site/tests/product-card-contract-test.php:37-49`,
  `295-325`).
- Against the actual WordPress runtime connected to `127.0.0.1:3307`, a
  100-digit page and `page=PHP_INT_MAX, per_page=100` each returned HTTP 400,
  `gdhe_invalid_pagination`, detail field `page`, the full error envelope and
  `Cache-Control: no-store`. Neither request raised `TypeError`.

The frozen error fixture contains both normalized cases
(`frontend/src/lib/cms/product-card-contract/fixtures/PRODUCT_CARD_ERROR_FIXTURES.json:54-78`).
A separate anonymous `per_page=1` runtime request returned 200, ProductCard
Schema 1.0.0, an empty zero-residue collection, `public, max-age=60`, ETag and
request ID. The parameterized legacy collection route plus resolve,
navigation, route manifest and the additive ProductCard route were all
registered concurrently.

### P2 closure — Reviewer bytecode residue

The finding is closed. Exact post-revision scans found:

```text
plugin .pyc files: 0
plugin __pycache__ entries: 0
TASK-014 upload files: 0
```

All Python review imports used `PYTHONDONTWRITEBYTECODE=1` and `python3 -B`.
The ProductCard and A3 validators were executed with their artifact writes
intercepted in memory; both generated reports matched the frozen JSON exactly.
A final post-validation scan still found zero repository bytecode.

### Direct regression evidence

| Gate | Independent Round 2 result |
|---|---|
| ProductCard Schema closure | PASS: exact 8 files |
| ProductCard success Goldens | PASS: 8/8 |
| Request negatives | PASS: 11 normalized fixtures; two overflow cases also reproduced on 3307 |
| Invalid/unpublished exclusions | PASS: 12/12 recorded true |
| Handoff integrity | PASS: 25/25 SHA-256 entries |
| Zero/one/N and pagination | PASS: current zero runtime; frozen one item; totals 4 and page counts 2/2/0 |
| Action matrix | PASS: both detail states view retained product; active/discontinued no-detail accessory targets remain RFQ/contact |
| Reference identity | PASS: UUID, unique target, complete envelope and positive non-empty relations preserved |
| Leakage and protected media | PASS: closed Goldens and tests retain database/internal-field exclusion and HTTPS protected media |
| Determinism | PASS: two recorded lifecycles use different database IDs with identical 8/8 hashes |
| A3 regression | PASS: no-write reproduction of 19-file graph, 15/15 Goldens and 6/6 negatives matched frozen evidence |
| Runtime and cleanup | PASS: WordPress 7.0.2; GDHE Site 0.5.0 and SCF 6.9.2 active; 12-table DB check; TASK-014/A3 database counts all zero; uploads zero |
| Core and SCF integrity | PASS: official checksum verification succeeded |
| Service boundary | PASS: only 127.0.0.1:3307 was listening; no 3306 listener was started |
| Protected scope | PASS: frontend, package/lock, Core/SCF/theme and TASK-007 protected status/diff checks show no TASK-014 regression |
| Syntax | PASS: all GDHE Site PHP lint; 9 Python files AST-parse; 36 plugin JSON files parse |
| Governance | PASS: project validation, controlled messages, strict lane audit with zero issues, and Git whitespace check |

The runtime fixtures were not recreated by this reviewer because doing so
would write the shared database and regenerate business evidence. The
role/path logic and overflow behavior were reproduced without fixtures, the
current zero-residue endpoint was exercised read-only, and the complete
fresh two-lifecycle evidence was independently checked through exact
checksums, Schema revalidation and internal consistency. This limitation does
not leave a current finding.

### Scope and authorization

Round 2 changed no business deliverable, product code, CMS content, frontend,
authority, Planner-owned state, database, dependency, environment, external
system, Git state or deployment. It did not start TASK-015.

Planner may proceed only to controlled review recovery and final validation.
PASS remains distinct from user acceptance and from commit, push, merge or
deployment authorization.
