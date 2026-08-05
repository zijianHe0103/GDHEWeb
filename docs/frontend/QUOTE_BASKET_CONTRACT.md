# Quote Basket Public Contract

TASK-022 establishes the browser-local Quote Basket foundation and its first
FGD X15+PVC visible slice. It is a
non-payment RFQ collection, not a shopping cart, checkout, order or submitted
inquiry. Product-page integration and the local Basket UI are implemented;
final submission remains a separate, unimplemented checkpoint.

## Public authority

`QuoteBasketDocument 1.0.0` is a closed frontend-owned document containing:

- a positive safe-integer revision, browser-generated UUIDv4 writer/mutation
  identifiers, canonical UTC update/expiry timestamps and public items;
- technical UUIDv4 entry identifiers and canonical creation timestamps;
- customer-readable product model, name, canonical public path and approved
  local `/test-candidates/` image facts;
- standard/custom selection, canonical public length and color, customer labels
  for packaging/protection, Logo choice, quantity unit and positive safe-integer
  quantity.

The runtime validator rejects unknown or accessor/symbol fields, duplicate
entry IDs, duplicate public identities, non-canonical dates/paths, unsafe
quantities, unsupported versions and non-approved media. Returned documents
are caller-isolated and deeply frozen.

Article Number, stable Product/Media/WordPress/Feishu identity, raw CMS or SCF
data, server resolution enums, commercial data, PII, secrets and diagnostics
are outside this contract. A future server-side Request a Quote flow must treat
every stored item as untrusted public input and re-resolve it before creating a
complete QuoteLine.

## Identity and immutable operations

Merge identity is exactly public product path, standard/custom selection,
length, color code and label, base-packaging label, Logo choice, protection
label or null, and quantity unit. Quantity and refreshed product display fields
are not identity.

Equal identity preserves `entryId` and `createdAt`, refreshes public display
facts and safely adds quantity. Any identity difference creates a new line.
Quantity changes and removal target exactly one entry. Every operation returns
a new deeply immutable document; invalid or overflowing operations fail
atomically. The public summary contains line count only and never combines
quantities across units.

## Browser storage and expiry

- key: `gdhe.quote-basket.v1`;
- retention: `2_592_000_000` ms (30 days) from the latest successful mutation;
- encoded UTF-8 payload ceiling: `262_144` bytes (256 KiB).

Reads never extend retention. Every successful add, merge, quantity change or
remove reads the latest valid stored snapshot first, advances the revision and
refreshes expiry. Corrupt, expired, unsupported, extra-field or oversized data
is rejected as a whole and removed where possible. Quota/security failures use
stable sanitized public errors and do not replace the caller's current legal
snapshot.

## Same-origin tab reconciliation

Browser `storage` events may supply a complete candidate snapshot. A valid
candidate is adopted only when it is strictly newer by lexicographic comparison
of revision, update timestamp, writer ID and mutation ID. Stale, unrelated,
missing or invalid events leave the current legal snapshot unchanged.

This is deterministic last-writer-wins reconciliation of whole snapshots. It
is not transactional cross-tab merging: two concurrent tabs can both derive
from the same prior revision, and the deterministic winner can replace the
other complete snapshot. Server sync, cross-device recovery and conflict-free
distributed merging are not claimed.

## Local product and page integration

The FGD X15+PVC server page projects only model, customer name, canonical
public path and the approved local protected image before the data enters the
Client Component. A valid Add to Quote action adds or merges through the same
validated storage API, stays on the product page, announces the result, shows
line count and links to `View Quote Basket`. Invalid forms perform no Basket
write; storage failures retain the previous in-memory document and expose only
a fixed public message.

`/request-a-quote/` is a local `preview`/`cms` route with
`noindex,nofollow`. It hydrates from validated storage, renders empty or one/N
public rows, and supports absolute positive-safe-integer quantity updates and
exact-line removal. The row image is the approved repository-local protected
candidate. Production mode returns final 404.

The visible disabled `Request a Quote` control is explanatory only. There is
no contact form, final RFQ endpoint, WordPress/Feishu request, email, checkout,
payment or external write in TASK-022.
