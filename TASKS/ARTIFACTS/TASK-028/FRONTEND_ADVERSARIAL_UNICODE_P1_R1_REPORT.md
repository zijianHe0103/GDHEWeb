# TASK-028 Frontend Adversarial Unicode P1 Narrow Revision Report

Completed: 2026-08-12

Request: `MSG-TASK-028-FRONTEND-ADVERSARIAL-UNICODE-P1-R1`

Outcome: `PASS_FOR_PLANNER_RECHECK`

## Preserved review history and scope

- The unique complete adversarial review remains
  `FAIL / P0=0 / P1=1 / P2=1`.
- The exact request, narrow dispatch and canonical review were read before
  mutation; the request was then ACKed.
- The required reopen preflight safely rejected because TASK-028 was already
  `NEEDS_REVISION`; no Planner-owned state changed.
- This revision closes only P1-1. Planner-owned P2 consolidated evidence was
  not created or edited, and no review or bounded-closure claim was made.

## Verified cause

The visible form passed each frozen Unicode code-point maximum directly to the
native HTML `maxlength` attribute. Browsers enforce that attribute in UTF-16
code units, so an otherwise valid Full Name containing 120 astral characters
has length 240 at the HTML boundary and is stopped before the exact customer
normalizer can evaluate it.

The existing `normalizeRfqCustomer` already applies the frozen Schema's exact
Unicode code-point limits and never truncates input. It required no change.

## Strict RED

The direct production-presentation regression was added first and run alone:

```text
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/rfq-form-presentation.test.ts \
  -t "lets the exact Unicode code-point limit reach the authoritative customer normalizer"
```

The command exited `1`: the new test failed while eight prior tests were
skipped. Its first failure showed the real rendered Full Name input still
contained `maxLength="120"`. The test independently proves its exact-limit
value contains 120 code points and 240 UTF-16 code units.

## Minimum GREEN

The form presentation now omits native `maxlength` from all ten customer
controls. The unused `TextField` parameter was removed with those attributes.
There is no replacement truncation, coercion, client-side ceiling or new
validator.

The same focused regression then passed `1/1`. It proves:

1. the rendered ready form still exposes exactly ten named customer controls;
2. none exposes a native `maxlength`;
3. 120 non-BMP code points arrive unchanged at `normalizeRfqCustomer` and
   succeed;
4. one additional code point returns only the stable
   `{ field: "fullName", code: "too_long" }` error.

## Preserved boundaries

Field order, labels, required/contact rules, autocomplete/inputmode, error
summary, focus/ARIA, pending state, customer copy, CSS/layout, submission,
intent/intake, Basket clearing/replay, frozen contracts, dependencies, package
and lockfile are unchanged. No CMS, CRM, Feishu, external-system, Git or
deployment action occurred.

## Result

The linked validation log records the fresh focused, RFQ, static, protected,
cleanup, diff and governance gates. The only next step is independent Planner
validation followed by the already-authorized same-reviewer bounded closure
after Planner separately closes P2.
