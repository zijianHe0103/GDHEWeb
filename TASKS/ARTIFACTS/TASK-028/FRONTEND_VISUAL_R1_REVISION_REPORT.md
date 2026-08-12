# TASK-028 Frontend Visual R1 Narrow Revision Report

Completed: 2026-08-12

Request: `MSG-TASK-028-FRONTEND-VISUAL-R1-REVISION`

Outcome: `PASS_FOR_PLANNER_CHECKPOINT`

## Governance and scope

- The exact revision request and frozen dispatch were read and ACKed before
  mutation.
- The requested `task_transition.py reopen` preflight was attempted and safely
  rejected because TASK-028 is already `IN_PROGRESS`; it made no mutation.
- Historical Visual QA Round 1 remains `FAIL / severe 1 / obvious 2 / detail 0`.
  This report closes implementation evidence for S1/O1/O2 only; it does not
  claim Visual QA PASS.

## S1 closure

The browser client now posts to exactly `/api/rfq/intent` and
`/api/rfq/intake`. Both requests remain same-origin relative URLs and preserve
`POST`, JSON content type, `cache: "no-store"`, `redirect: "error"`, one new
intent followed by one intake, duplicate suppression and the existing explicit
replay behavior. No legacy, per-line or external endpoint was added.

## O1 closure

The existing frozen public-customer Schema validator now collects all Schema
errors. Existing mapping, field order, per-field deduplication and sanitized
`{ field, code }` output are unchanged. An empty form deterministically yields:

1. `fullName / required`;
2. `companyName / required`;
3. `countryRegion / required`;
4. `city / required`;
5. `contactMethods / at_least_one_required`.

The presentation regression proves all five repair messages, summary anchors,
four `aria-invalid` inputs, stable `aria-describedby` values, the contact-group
description and focusable summary without Ajv or raw diagnostic output.

## O2 closure

The existing ten-field form now includes one visible, keyboard-focusable
`Privacy Policy` link before `Submit Request`. It targets the actual local
`#rfq-privacy-policy` section, which is programmatically focusable and states
only the current truth: contact and RFQ details are processed by the local
non-production Stub, are not sent to Feishu, CRM or email, and are not stored
in durable production storage. There is no external URL, new route or claim of
an approved production legal policy.

## Preserved boundaries

- no CSS, field order, Basket, RFQ contract, intent/intake server gate,
  clearing/retry logic, package, lockfile, CMS, CRM, Feishu, email, database or
  external service change;
- no Visual QA execution, complete review, acceptance, Git delivery or
  deployment;
- production and disabled/unset modes remain final 404 through the existing
  Route/page gates.

## Result

All implementation and regression gates in the linked validation log passed.
The only next step is an independent Planner checkpoint followed by the
already-frozen narrow Visual QA Round 2.
