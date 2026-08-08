# TASK-023 WordPress Adversarial UUID P1 Round 1

## Result

The sole WordPress P1 is locally closed. RelatedProductCard aggregation no
longer publishes the first eligible post when a later distinct eligible post
claims the same public UUID. Ownership is now collected across the unique
candidate posts and source before any item is emitted; every conflicting card
and action fails closed.

ProductCard `1.0.0`, REST API `1`, RelatedProductCard Schema `1.0.0`, endpoint,
query, response fields and the four positive Golden bytes are unchanged.

## Strict TDD

- RED Fixture: 12 removable posts, including two distinct independently
  eligible published targets with public UUID
  `60000000-0000-4000-8000-000000000002`.
- RED relation order: unrelated accessory, first UUID owner, second UUID owner,
  unrelated detail, repeated first owner, unrelated accessory.
- RED result: exit `1`, exact failure
  `Distinct eligible posts sharing one public UUID did not all fail closed.`
- Minimum GREEN: de-duplicate candidate post IDs, project eligible candidates,
  collect UUID ownership, then emit only UUIDs with exactly one distinct post
  owner.
- GREEN result: conflict owners and both action paths absent; unrelated public
  IDs remain in exact stored order `...0003`, `...0004`, `...0005`.

## Determinism and cleanup

- lifecycle 1 post IDs: `3332–3343`;
- lifecycle 2 post IDs: `3344–3355`;
- database IDs changed and 4/4 Golden SHA-256 values were identical;
- each lifecycle removed exactly 12 posts and 3 terms;
- final task posts, marker/source meta, option, terms, termmeta and uploads: all
  zero.

Golden SHA-256 values:

- `zero.json`: `10c511e8e8bdf7c2ee294c9f2562fbeadf4d0002eb549ff9b60b7c9574d0b805`
- `one.json`: `1c337364157486db1c09cf56d99152db0cdc4ce3f4f3c50a4792caf42e203b2b`
- `three.json`: `e260f2c66b21fe709e834519bf8ae3f128d1a9cf54dc3ab79aa98e35ad6ce780`
- `four-plus.json`: `5359939897c49200644497fde7a0e145a0e8e3656e8425450ef1db5a447472e1`

## Handoff and boundaries

- Schema closure: 9/9; Goldens: 4/4; negatives: 7/7;
- handoff: 26/26 exact SHA-256;
- manifest: `48f3d356a17b37d802364ec89f9eed3e343a3ef78cd355baabd005b4050aabe0`;
- checksum stream: `f460c3122ad0e3a3c7322d9290ef940a6c3bbe9725e976b4cc881cb9e15b658e`;
- ProductCard 8-file closure, inline positive, 6 negatives and 8 runtime
  Goldens remain valid;
- ProductCard/CMS/TASK-014 protected hashes are exact; after the later evidence
  revision the full shared tree is 21/27 because five authorized concurrent
  frontend/Quote Basket files differ and generated `frontend/next-env.d.ts`
  adds one protected drift outside this Lane;
- WordPress Core checksums, official SCF `6.9.2` checksums, 12-table database,
  35 PHP files, 50 JSON files, 19 Python AST files, secret, cache-residue and
  diff gates pass.

No frontend, UI, Basket, ProductCard authority, real data, visual evidence,
Planner authority, Git, deployment or external-system work is included. This is
a controlled execution checkpoint, not review or acceptance.

## Later evidence-authority note

The subsequent error-evidence determinism revision did not change this UUID
behavior. It superseded only the handoff identities above with manifest
`809fe879374e604553311217e6085f5f2b605c4a78bcb00258b8c6b2965cf51e`
and checksum stream
`fc3552dc84c8e6eacb954654b4d858a326eab03261eda02da440aa48bddfde90`.
