# TASK-012 WordPress/CMS feasibility audit

- Message: `MSG-TASK-012-WORDPRESS-FEASIBILITY-AUDIT`
- Lane: `wordpress_cms`
- Mode: read-only
- Result: `FEASIBLE_WITH_ENTRY_GATES`

## 1. Executive outcome

The product-first roadmap is implementable without reopening the delivered
REST transport, UUID, safe-HTML, canonical-path, error, module or public DTO
foundations.

The next CMS activity should be a controlled mapping exercise using 10–20
legally usable, representative GDHE products. It must produce a field-by-field
gap report before any Schema change. It must not begin as a bulk import.

Four decisions block production product entry:

1. whether a variant is a separate `product`, a nested option, or an Article
   Number row;
2. how accessories are distinguished from generic related products;
3. how current, superseded and withdrawn document versions are represented;
4. how editor constraints are aligned with the public contract, especially
   type/template pairing and the current relationship `50` authoring limit
   versus `20` public DTO limit.

Preview and publication Webhook are separately feasible, but neither exists in
the current plugin. Both require frontend, deployment, identity/secret and
failure-recovery decisions before CMS implementation.

## 2. Current verified facts

| Boundary | Current fact |
|---|---|
| WordPress | `7.0.2` |
| SCF | active `6.9.2` |
| GDHE Site | active `0.4.2` |
| REST / Content / Module versions | `1` / `3.0.0` / `1.0.0` |
| Public types | native `page`, native `post`, `product`, `market`, `reference`, `support_article`, `download` |
| Internal type | `site_settings`, no public route |
| Taxonomies | `product_category`, `product_series`, `installation_type`, `support_topic`, `document_type` |
| Public endpoints | `schema`, `resolve`, `collection`, `navigation`, `route-manifest` |
| Current real product inventory | `0` products and `0` terms in all five Schema 3 taxonomies |
| A3 Fixture residue | manifest `[]` |
| Preview endpoint/bridge | absent; `previewBridgeDeferred: true` |
| GDHE publication Webhook | absent |

The local database contains no evidence that real GDHE products fit the
current model. TASK-007 proved deterministic synthetic contract behavior, not
real catalog fitness.

Architecture contract sections 4, 5 and 14 retain historical Schema 1/service
examples and the pre-TASK-007 implementation order. For current implementation
facts, the Schema 3 plugin, `docs/cms/**` and accepted TASK-007 final artifacts
are authoritative. TASK-012 may revise the roadmap but must not silently
reintroduce the superseded service/material model.

## 3. Real-product stress cohort

Select 10–20 actual GDHE products from authoritative business material. A
12–16 product cohort is recommended because one product may cover several
roles while still spanning at least three categories, two series and two
installation types.

| Required cohort role | What must be proven | Current support or gap |
|---|---|---|
| Simple single-order-number product | minimum valid envelope and editing effort | supported |
| Product with regional Article Numbers | exact number/region mapping and ordering | structure exists; region is free text |
| Product with dimensional variants | whether dimensions are specs, order rows or separate products | policy unresolved |
| Finish/colour-driven variants | mapping among finish code, Article Number, media and availability | finishes exist, but no cross-row identity |
| Multiple installation options | taxonomy versus product-level prose/spec distinction | taxonomy and prose exist |
| Manual, corded, motorised or control variants | control semantics and compatibility | free text/list only |
| Compatibility-heavy system | motors, controls and constraints | bounded strings only; no typed target relation |
| Accessory-rich product | required/optional accessory roles and quantities | no accessory relation role |
| Product that is itself an accessory | category/series/URL behavior | possible as `product`; business rule not frozen |
| Product with multiple document types | brochure/manual/certificate relationships | first-class `download` supported |
| Product with multiple document revisions | current/superseded/withdrawn selection | version/date exist; lifecycle link/status absent |
| Media-rich product | featured media, gallery, HTTPS video and alt boundaries | up to 20 gallery items; production origin deferred |
| Specification-heavy product | stable keys, units, ordering and duplicate-key behavior | up to 50 rows; uniqueness/unit vocabulary not enforced |
| Market/reference/support-connected product | bidirectional public eligibility | five relation arrays supported |
| Unpublished/discontinued/internal-only case | public fail-closed and internal data ownership | publication states fail closed; no product-internal field contract |
| Deliberate invalid duplicate | duplicate product code, Article Number, slug/path or relation | path conflict is covered; business-key uniqueness is not |

Every selected product must be mapped across:

- title, slug, canonical path, model and product code;
- category, series and installation type;
- positioning, 1–20 features and 1–50 specification rows;
- 1–30 Article Numbers and 0–30 finishes;
- installation, control and 0–30 compatibility entries;
- gallery/video, related markets/references/support/downloads and inquiry CTA;
- product owner, source document, media/file rights and missing-material owner.

Boundary assertions for the later controlled validation task:

1. public UUIDs remain independent of WordPress IDs;
2. Article Number and product-code duplicates are reported, not silently
   accepted;
3. variant-level specifications, finishes, files and compatibility are not
   flattened until their identity policy is approved;
4. only current public files are returned; superseded/private files and
   filesystem paths never leak;
5. costs, supplier data, ERP state, stock, internal notes, unpublished
   certifications and editorial comments remain outside the public DTO;
6. 21st relation, gallery item or module and other limit negatives fail at the
   editor boundary or have an explicitly documented handling rule;
7. published content with incomplete details, wrong template, invalid module,
   invalid path, invalid relation/media/file or missing taxonomy remains
   fail-closed.

## 4. Controlled modular editing

### Existing usable foundation

- One code-owned SCF field group registers the common envelope, type details
  and seven fixed module layouts.
- Modules are limited to 20 and use generated, persistent UUIDv4 IDs plus
  Module Schema `1.0.0`.
- `data_table` uses 1–12 unique columns, 1–100 stable-ID rows and exact ordered
  cells.
- Rich text passes the GDHE `wp_kses` allowlist; links and CTAs use a closed
  normalizer.
- Public construction rejects wrong type/template pairs and incomplete
  details. Anonymous responses do not expose generic SCF or postmeta.

### Authoring gaps to close before bulk entry

- Type-specific groups are registered together across Page/Post and all public
  CPTs; no field-level conditional authoring policy is frozen for hiding or
  requiring only the applicable detail group.
- `template_key` is editor-selectable even though runtime pairing is strict.
  A wrong selection makes content fail closed instead of giving an adequate
  publish-time explanation.
- SCF relationship controls allow 50 values per group while public output
  exposes at most 20 per relationship key.
- Article Number, product code and specification-key uniqueness are not
  enforced as business keys.
- Reorder, duplicate, revision, autosave and module/table identity behavior was
  validated synthetically, but not with non-technical editors and real product
  density.

The next task should test these gaps with draft/local content and propose only
the minimum editor guardrails justified by the cohort. New module layouts are
not an entry requirement; structured product facts should remain in product
details rather than being duplicated into page modules.

## 5. Preview feasibility

The architecture contract is sufficient as a security intent, but there is no
current Preview route, HMAC signer, Application Password reader or Next.js
Draft Mode bridge.

Required dependencies before implementation:

- confirmed frontend Draft Mode entry/exit route and preview rendering path;
- HTTPS WordPress and Next.js staging origins;
- a revocable, least-privilege technical identity;
- server-only key storage, key ID/rotation and log redaction;
- token claims for content ID, locale, target path, issued/expiry time and
  single-use nonce;
- revision/autosave selection rules and a Schema 3 preview DTO;
- capability checks in both token issuance and draft read;
- `private, no-store`, `noindex`, secure cookie and referer/analytics leakage
  tests;
- replay, expiry, wrong-content, wrong-path, revoked-user and invalid-Schema
  negatives.

Recommended entry gate: implement Preview only after the real cohort has
proven the draft authoring shape and a target Staging type can provide HTTPS,
secrets and server-to-server connectivity. Anonymous published endpoints must
remain unchanged.

## 6. Publication Webhook feasibility

No GDHE Webhook hook, signer, delivery queue or retry state exists. A safe
implementation depends on the frontend cache/tag contract and Staging
endpoint, not only WordPress hooks.

The future contract must cover:

- publish, update, unpublish, trash/delete, slug/parent change;
- taxonomy, relation, curated navigation and settings change;
- immutable event UUID, occurred-at time, key ID, timestamp and body HMAC;
- old and new canonical paths plus affected content/collection/navigation
  tags;
- deletion events that retain enough pre-delete identity to invalidate old
  paths;
- durable delivery state, bounded retry/backoff, idempotency, replay defense,
  observability and manual replay;
- invalid new content never replacing the last known-good frontend cache.

Recommended entry gate: freeze frontend cache tags, stale-retention behavior,
deletion/redirect rules, deployment topology and a reachable signed Staging
receiver before adding WordPress hooks. Do not use synchronous
fire-and-forget publication requests as the production design.

## 7. Exact 19/16 Schema accounting

The counts describe different closures.

### CMS authority: 19 files

Roots:

- `page.v3.schema.json`
- `collection.v3.schema.json`
- `navigation.schema.json`
- `route-manifest.schema.json`
- `error.schema.json`

Recursively following every non-fragment local `$ref` produces:

```text
collection.v3.schema.json
content-reference.schema.json
error.schema.json
file-reference.schema.json
link.schema.json
media-reference.schema.json
modules/accordion.schema.json
modules/card-grid.schema.json
modules/cta-banner.schema.json
modules/data-table.schema.json
modules/hero.schema.json
modules/rich-text.schema.json
modules/split-media.schema.json
navigation.schema.json
page.v3.schema.json
public-path.schema.json
route-manifest.schema.json
safe-html.schema.json
uuid-v4.schema.json
```

### Frontend `/resolve` closure: 16 files

Roots are `page.v3.schema.json` and `error.schema.json`. Its closure is the
same list except:

- `collection.v3.schema.json`
- `navigation.schema.json`
- `route-manifest.schema.json`

Machine recomputation returned CMS `19`, frontend `/resolve` `16`,
`cmsOnly` exactly those three files and `frontendOnly` empty. All 16 frontend
snapshot files matched both their manifest hashes and current CMS source
bytes. The 61-entry TASK-007 handoff checksum set also passed.

Therefore the difference records the intentionally narrower frontend
`/resolve` consumer scope delivered by TASK-008/010/011. It is not a missing
Schema or permission to expand the current frontend consumer.

## 8. Blockers and recommended candidate gates

### Blocking facts

| ID | Blocker | Applies before |
|---|---|---|
| `CMS-B1` | no approved real GDHE cohort/source pack, rights record or content owner | real-product mapping |
| `CMS-B2` | variant and accessory identity/relationship policy unresolved | product entry or Schema revision |
| `CMS-B3` | document current/superseded/withdrawn lifecycle unresolved | production downloads |
| `CMS-B4` | editor/public limits and type-specific guardrails are misaligned | bulk authoring |
| `CMS-B5` | no immutable task backup/draft-only rollback plan exists for real-content validation | any WordPress mutation |
| `CMS-B6` | no HTTPS Staging, preview identity, secret storage or frontend Draft Mode receiver | Preview |
| `CMS-B7` | no frozen frontend cache tags/stale policy, signed receiver or durable delivery design | Webhook |

These do not block TASK-012 roadmap documentation. They are entry gates for
future confirmed tasks.

### Recommended sequence

1. **Real-product inventory and mapping task:** read authoritative source
   packs, select 10–20 products, produce the mapping/gap/ownership matrix and
   decide variant, accessory, document and internal-field semantics. No Schema
   mutation until the gap report is accepted.
2. **Narrow CMS authoring revision, only if evidenced:** align editor/public
   limits and conditional guardrails; add only approved data structures with
   migration, backup, rollback, Golden and frontend-consumer impact evidence.
3. **Real-product draft/local validation:** immutable backup, controlled IDs,
   draft/local publication window, public-contract checks, exact cleanup or
   explicit content retention decision.
4. **Preview task:** CMS signer/reader plus frontend Draft Mode and Staging
   validation.
5. **Webhook/cache/Staging task:** event/outbox delivery plus frontend
   idempotent invalidation and last-known-good recovery.

No candidate should modify the frozen REST/API foundation merely to make the
roadmap appear complete.

## 9. Evidence paths

- `TASKS/ARTIFACTS/TASK-007/PLANNER_SUMMARY.md`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/CONTRACT_AND_HANDOFF_MANIFEST.md`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/A3_SCHEMA_VALIDATION.json`
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/A3_DETERMINISTIC_GOLDEN.json`
- `TASKS/ARCHIVE/TASK-007/OUTPUTS/FOREST_PRODUCT_MODEL_REVISION.md`
- `frontend/src/lib/cms/contracts/manifest.json`
- `frontend/src/lib/cms/server/validation/registry.ts`
- `docs/cms/CONTENT_MODEL.md`
- `docs/cms/REST_CONTRACT.md`
- `cms/wp-content/plugins/gdhe-site/config/content-model.json`
- `cms/wp-content/plugins/gdhe-site/config/schema.v3.json`
- `cms/wp-content/plugins/gdhe-site/config/field-groups.v3.json`
- `cms/wp-content/plugins/gdhe-site/includes/modules.php`
- `cms/wp-content/plugins/gdhe-site/includes/public-details.php`
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php`
- `cms/wp-content/plugins/gdhe-site/includes/fixtures-a3.php`
- `docs/architecture/headless-wordpress-nextjs-contract.md` sections 4, 5,
  8, 9 and 14
- `MEMORY/DECISIONS/ADR-004-headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS/ADR-005-english-first-scf-wpml-deferral.md`

## 10. Validation

- live WordPress/plugin versions and zero product/taxonomy/A3 Fixture state:
  PASS, read-only;
- CMS transitive graph recomputation: PASS, `19`;
- frontend `/resolve` closure recomputation: PASS, `16`;
- frontend manifest/source/snapshot checksum parity: PASS, `16/16`;
- TASK-007 handoff checksum verification: PASS, `61/61`;
- explicit repository-relative evidence paths: present;
- absolute-path scan of this report: zero;
- `cms/**` and `frontend/**` Git status: clean;
- Markdown structure and whitespace/diff check: PASS;
- controlled-message validation: PASS;
- DPG project validation: PASS;
- strict lane audit: completed with one `MEDIUM / QUEUE_MESSAGES_PENDING`
  signal from concurrent controlled messages; no write-scope or registry
  issue was reported.

Planner, project-state and active-task changes visible in the shared worktree
belong to the concurrent Planner flow and were preserved without edit or
rollback.

## 11. Scope result

This audit performed no product entry, Preview, Webhook, multilingual,
contract expansion or runtime mutation. It did not modify CMS, WordPress,
database, frontend, architecture, active-task or Planner-owned files.
