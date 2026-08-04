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

## TASK-020 local consumer

The contract bytes remain independent and immutable. TASK-020 consumes them in
the local-only FGD X15+PVC detail route through a fixed server-only Transport,
exact four-Schema runtime Validator, authentic wrapper and deeply frozen public
DTO. The TASK-020 visible form historically demonstrated one latest in-memory
configuration result. TASK-021 now defines the live browser-side result
precisely as a `PublicQuoteDraft`, not a complete QuoteLine. It is constructed
from public DTO facts and primitive form values and excludes Article Number,
stable internal Product UUID and internal resolution enums.

CMS detail-ready orchestration performs one `/resolve` request followed by one
fixed `/product-configurations` request and zero ProductCard or per-option
requests. Configuration failure leaves the detail visible and exposes only a
sanitized navigation fallback. Production mode remains fail-closed at 404.

## TASK-021 public draft and future server conversion

Add to Quote replaces one latest browser-memory public quote draft. Refresh
clears it; there is no network request, persistence, submission or external
write. QuoteLine 2.0.0 remains an isolated future server-side conversion
contract. A separately authorized final Request a Quote flow will re-resolve
the eligible option and create the complete resolved or `sales_follow_up` line
without exposing internal identity to browser storage or Next/Flight bytes.

## Deferred capabilities

The local consumer does not create a basket, 30-day browser storage, contact
form, submission endpoint, server-side revalidation service, WordPress
QuoteLine storage, Feishu access, email, Webhook, deployment or production
publication.
