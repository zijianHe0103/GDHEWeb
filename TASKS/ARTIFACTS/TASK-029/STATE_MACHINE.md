# TASK-029 Persistent State Machine

## Valid cells

| State | Delivery state | Attempt count | Authoritative JSON | Public result |
|---|---|---:|---|---|
| `idempotency_reserved` | `not_started` | 0 | null | processing receipt / 202 |
| `resolving_lines` | `not_started` | 0 | resolving document when available | same processing receipt / 202 |
| `delivery_pending` | `pending` | 1 | pending document required | same processing receipt / 202 |
| `accepted` | `accepted` | 1 | accepted document required | accepted receipt / initial 201, replay 200 |
| `delivery_indeterminate` | `indeterminate` | 1 | indeterminate document required | processing receipt / 202 |
| `rejected_before_delivery` | `rejected` | 0 | optional | validated public error / 409 |

## Allowed transitions

| From | To | Required effect |
|---|---|---|
| none | `idempotency_reserved` | atomic insert; first and only expiry anchor |
| `idempotency_reserved` | `resolving_lines` | CAS before mixed validation |
| `resolving_lines` | `rejected_before_delivery` | mixed validation failed; zero Sink calls |
| `resolving_lines` | `delivery_pending` | persist complete pending authoritative document and claim attempt 1 before Sink |
| `delivery_pending` | `accepted` | Sink returned accepted; persist accepted document and receipt |
| `delivery_pending` | `delivery_indeterminate` | Sink threw/returned indeterminate or completion is uncertain |
| `delivery_pending` | `rejected_before_delivery` | trusted Stub says no downstream delivery occurred; persist validated error |

All other transitions reject without mutation. `accepted`,
`delivery_indeterminate` and `rejected_before_delivery` are terminal for request
traffic. Crash recovery does not transition automatically.

## Lookup precedence

1. Read/transport/closed RFQ contract gates.
2. Canonical business digest and comparison token.
3. One bounded primary-key lookup.
4. If a row exists and digest/comparison differ: conflict, even if expired.
5. If the row is unexpired and identities match: replay its stored public
   result with zero pre-gate, mixed validation and Sink work.
6. If the row is expired and nonterminal/indeterminate: recovery required.
7. If the row is expired and terminal accepted/rejected: it is eligible only
   for an explicit exact cleanup transaction; request code does not silently
   delete it in TASK-029.
8. Only an actual miss runs the pre-reservation gate and attempts insert.

## Crash windows

| Injection point | Durable state after restart | Request behavior | Automatic Sink resend |
|---|---|---|---|
| before reservation commit | none or committed reservation; ambiguous result is re-read | miss or stored processing | no |
| after reservation, before resolving CAS | reserved | stored processing | no |
| after resolving CAS, before/during mixed validation | resolving | stored processing | no |
| after mixed success, before pending CAS | resolving | stored processing | no |
| after pending CAS, before Sink invocation | pending/attempt 1 | stored processing | no |
| during/after Sink, before outcome persistence | pending/attempt 1 | stored processing and future reconciliation required | no |
| after indeterminate persistence | indeterminate/attempt 1 | stored processing | no |
| after accepted persistence, before HTTP response | accepted/attempt 1 | same receipt; replay HTTP 200 | no |

The intentional conservative tradeoff is that a crash after reservation does
not auto-complete the RFQ. Avoiding duplicate delivery is more important than
automatic completion; a future connector/reconciliation task may add a
controlled operator workflow.
