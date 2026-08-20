# TASK-029 A0 Design

## A0 result

`PASS_FOR_A0_CHECKPOINT`. This is a design and read-only environment result,
not a migration or runtime result. No database object, account, dependency or
product source was created or changed during A0.

## Verified local environment

| Concern | Read-only result | Consequence |
|---|---|---|
| Server | MySQL `8.4.10`, Homebrew, TCP `127.0.0.1:3307` | Supported local integration target |
| Existing WordPress database | logical `GDHE`, 12 base tables, `utf8mb4_unicode_ci` | Protected and excluded |
| Target database | `gdhe_rfq` absent | A1 must create it only through explicit migration |
| Storage engine | InnoDB default; transactions, XA and savepoints supported | Transactional repository is feasible |
| Server isolation | `REPEATABLE-READ` | Runtime connections must explicitly use `READ COMMITTED` |
| Time zone | server/session `SYSTEM`; local time is UTC+08:00 | Runtime connections must explicitly set `time_zone='+00:00'` |
| SQL mode | lacks a strict mode | Runtime connections must explicitly set a frozen strict session mode |
| Packet limit | 64 MiB | Above the independently enforced 256 KiB HTTP limit |
| Transport | `require_secure_transport=OFF` | Acceptable only for loopback local proof; production TLS remains a deployment gate |
| Identifier behavior | `lower_case_table_names=2` | All new schema/table identifiers are lowercase |
| WordPress account | privileges are limited to the WordPress database | It is not reused for RFQ |
| Platform integrity | WordPress 7.0.2, SCF 6.9.2, GDHE Site 0.7.0; Core/SCF/DB checks pass | A1 must preserve these baselines |
| Frontend runtime | project authority is Node 24.x; local target Node 24.18.0/npm 11.16.0 exists | All TASK-029 gates use the fixed Node 24 path |

The local machine has an existing migration-authority context. Its
authentication material is intentionally not copied into the repository,
artifacts, logs or application configuration. It may be used only by explicit
migration commands. It must never be used by Next.js runtime code.

## Database boundary

The target Schema is exactly `gdhe_rfq`, default character set `utf8mb4` and
default collation `utf8mb4_0900_bin`. It contains only the two v1 tables below.
No foreign key, query, trigger, view, stored routine or cross-schema grant may
reference WordPress `GDHE`.

### `rfq_schema_migrations`

| Column | Logical type | Rule |
|---|---|---|
| `version` | ASCII string, max 64 | primary key; versioned filename identity |
| `checksum` | `BINARY(32)` | SHA-256 of the exact migration input |
| `applied_at` | `DATETIME(3)` | UTC |

### `rfq_intake_records`

| Column | Logical type | Rule |
|---|---|---|
| `key_fingerprint` | `BINARY(32)` | primary key; SHA-256 of the key; raw key is never stored |
| `rfq_id` | `BINARY(16)` | unique RFC 4122 UUID v4 identity |
| `public_reference` | `CHAR(16) CHARACTER SET ascii COLLATE ascii_bin` | unique `RFQ-[A-Z2-9]{12}` |
| `contract_version` | ASCII string | exactly `2.0.0` in v1 |
| `payload_key_version` | ASCII string, max 64 | frozen digest-key version |
| `payload_digest` | `BINARY(32)` | versioned HMAC digest |
| `comparison_token` | `BINARY(32)` | frozen comparison token |
| `basket_snapshot_token` | `BINARY(32)` | frozen Basket snapshot token |
| `state` | ASCII string | exact RFQ state from the frozen state matrix |
| `delivery_state` | ASCII string | exact delivery state from the frozen state matrix |
| `delivery_attempt_count` | unsigned tiny integer | only 0 or 1 |
| `authoritative_document` | nullable JSON | only an authentic RFQ 2.0 authoritative document; null before one exists |
| `public_document_kind` | ASCII string | exactly `receipt` or `error` |
| `public_document` | JSON | authentic customer-safe RFQ 2.0 receipt/error persisted from reservation onward |
| `initial_http_status` | unsigned small integer | exactly 201, 202 or 409; accepted replay maps stored 201 to 200 |
| `created_at` | `DATETIME(3)` | first durable reservation UTC timestamp |
| `expires_at` | `DATETIME(3)` | exactly `created_at + 2592000000 ms` |
| `last_transition_at` | `DATETIME(3)` | UTC; monotonic within the record |
| `row_version` | unsigned bigint | starts at 1 and increments on every successful CAS |

Indexes are limited to the primary key, unique `rfq_id`, unique
`public_reference`, and one operational `(state, expires_at)` index. There is
no customer, contact, Article Number or product index because the repository
is not CRM or cross-key deduplication.

## Persisted JSON whitelist

`authoritative_document` is accepted only after the current server-only RFQ
2.0 validator and semantic binding. `public_document` is accepted only after
the current public receipt/error validator. Arbitrary request JSON, raw HTTP
body, raw idempotency key, intent/challenge token, HMAC secret, database
credential, SQL diagnostic and raw downstream error are forbidden.

At reservation time the runtime persists one authentic `processing` receipt
with the assigned Public Reference, received time, line count, source Basket
snapshot/token and retry hint. This gives every crash-state replay a stable
customer-safe public result without recomputing or re-running downstream work.

## Runtime connection contract

- A single minimal dependency may be added in A1: `mysql2`; no ORM or second
  framework is authorized.
- Runtime configuration is server-only and supplied by environment/local
  secret material. No `.env*` file or password is committed.
- Every acquired connection verifies the expected server and selects only
  `gdhe_rfq`, then sets `time_zone='+00:00'`, transaction isolation
  `READ COMMITTED`, and a frozen strict SQL mode.
- Runtime account name: `gdhe_rfq_app` at loopback. Runtime privileges are only
  `SELECT`, `INSERT` and `UPDATE` on `gdhe_rfq.rfq_intake_records`; no DDL,
  `GRANT`, cross-schema access or runtime `DELETE`.
- Migration/verification authority is separate. Test cleanup uses that
  authority and exact TASK-029 key fingerprints only.
- Production host, TLS, backup, HA, secret manager and managed database remain
  explicit deployment gates.

## Atomic repository contract

1. `lookup` reads exactly one primary-key row and returns an authentic closed
   result: `miss`, `replay`, `conflict`, or `recovery_required`.
2. `reserve` is one atomic insert. A duplicate-key race is re-read and
   classified; it never becomes an unstructured database error.
3. Two same-key/same-payload contenders converge on the stored Public
   Reference and public document. The loser executes zero mixed validation and
   zero Sink call.
4. Same-key/different-payload returns conflict without changing the row.
5. `transition` is compare-and-set on exact fingerprint, expected state and
   `row_version`, validates both JSON documents before SQL, increments version
   once and returns only a closed result.
6. Unknown/malformed rows, ambiguous commit outcome, timeout or connection
   failure fail closed as processing/temporary unavailable; no blind retry of
   a non-idempotent transition or Sink delivery is allowed.

## Expiry

- Replay never changes `created_at` or `expires_at`.
- Expired `accepted` and `rejected_before_delivery` rows are eligible for
  explicit, exact maintenance cleanup and later key reuse.
- Expired `idempotency_reserved`, `resolving_lines`, `delivery_pending` and
  `delivery_indeterminate` rows remain `recovery_required`; request traffic
  cannot delete, resume or resend them.
- TASK-029 implements no scheduled retention worker. Its tests may delete only
  their exact marked rows after read-only target confirmation.
