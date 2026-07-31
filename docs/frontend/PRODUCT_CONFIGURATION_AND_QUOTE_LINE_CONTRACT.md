# Product Configuration Snapshot and QuoteLine Contract

TASK-019 adds two deliberately separate offline contract boundaries.

## Product Configuration authority snapshot

`frontend/src/lib/cms/product-configuration-contract/` is an exact local copy
of the frozen WordPress `ProductConfigurationDocument 1.0.0` consumer inputs:

- four local Draft 2020-12 Schema files;
- one exact FGD X15+PVC success Golden;
- six normalized error samples rebuilt from fixed selectors;
- one closed manifest bound to the canonical TASK-019 handoff and checksum
authority.

The verifier uses Node.js built-ins only. It checks the two authority file
identities and hashes, requires the repository root and every authority path
segment to be a canonical non-symlink directory or regular file, checks all 17
authority checksums, exact snapshot inventory and bytes, local `$ref` closure,
endpoint/query/version identity and frozen public semantics. It reports
sanitized failures without absolute repository paths.

```sh
cd frontend
node scripts/verify-product-configuration-contract.mjs
npm test -- tests/product-configuration-contract-snapshot.test.ts
```

No frontend runtime module may import `cms/**` or `TASKS/**`; those repository
paths are verifier-time authority only.

## QuoteLine 1.0.0

`frontend/src/lib/quote-contract/` owns the Next.js inquiry-domain contract,
not WordPress. The closed Schema has exactly two selection branches:

- resolved standard Article Number;
- unresolved custom length with `articleNumber: null` and
  `resolution: sales_follow_up`.

The complete line identity includes stable product identity, selection,
installation method and all track packaging choices. Quantity is excluded from
identity and is accumulated when otherwise identical lines merge. Resolved and
custom branches never merge; different custom lengths or any configuration
difference remain separate. Comparison and merge do not mutate caller input.
Quantity must be a positive JavaScript safe integer no greater than
`9007199254740991`. The merge helper rejects invalid caller quantities and any
sum beyond that representation boundary before returning a line; this is not
a business MOQ or commercial maximum.

```sh
cd frontend
npm test -- tests/quote-line-contract.test.ts
```

## Deferred capabilities

This contract does not authorize a visible configurator, basket, 30-day browser
storage, contact form, submission endpoint, server-side revalidation service,
WordPress QuoteLine storage, Feishu access, email, Webhook, deployment or
production publication.
