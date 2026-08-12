# TASK-028 Visual QA Round 2 Dispatch

message_id: MSG-TASK-028-VISUAL-QA-R2
scope: narrow retest after S1/O1/O2 frontend revision, plus the accepted-first and processing-second states that S1 previously blocked

## Authority and history

- Read the active TASK-028 card, canonical `VISUAL_QA_REPORT.md`, `QA/TASK-028/BROWSER_INTERACTION_LOG.md`, `FRONTEND_VISUAL_R1_REVISION_PLANNER_CHECKPOINT.md` and the four frontend revision artifacts.
- Preserve Visual QA Round 1 as `FAIL / severe 1 / obvious 2 / detail 0` and preserve all twenty Round 1 evidence files and hashes.
- This is one narrow Round 2, not a new complete review and not permission to edit product code.

## Planner-owned runtime

- Planner will provide the accepted-sink local runtime at `http://127.0.0.1:3000/request-a-quote/` and delayed loopback TASK-025 mixed-validation fixture at port `18080`.
- Seed only the exact current `ready-mixed.json` under the existing Quote Basket key. Do not invent product facts.
- Finish all accepted-sink evidence first. Then send one controlled request to Planner to restart only the same Next runtime with `GDHE_RFQ_STUB_SINK_OUTCOME=indeterminate`; do not start a second server or edit configuration.

## Required Round 2 closure

### S1 and previously blocked state matrix

1. Confirm a valid native browser submit makes exactly one slashless `/api/rfq/intent` POST followed by one slashless `/api/rfq/intake` POST, with no 308, redirect follow, retry, polling, external request or legacy/per-line call.
2. Capture the authentic pending state during the delayed mixed validation and confirm repeated activation does not create another attempt.
3. Confirm accepted + unchanged Basket clears exactly the submitted Basket and renders only the customer-safe receipt.
4. Repeat with a second-tab Basket mutation while pending; accepted must retain the entire changed Basket with no partial deletion.
5. After the controlled processing restart, confirm processing retains the Basket, exposes only the explicit retry path, and an explicit unchanged retry reuses the live attempt without a new intent or automatic/background retry.

### O1

1. Submit the completely empty customer form through the real UI.
2. The focused error summary must expose exactly the four required-field repair messages plus the contact-method-group message in stable order.
3. Full Name, Company Name, Country/Region and City must each expose the corresponding visible error, `aria-invalid=true` and stable `aria-describedby`; the contact group must retain its guidance/error association.

### O2

1. Native Tab must reach the visible Privacy Policy link before Submit Request with visible focus.
2. Enter/activation must target the actual same-page `#rfq-privacy-policy` section; the section copy must remain customer-safe and clearly local/non-production.
3. Confirm no external policy request, new route, production legal claim, protected identity or private intent material.

## Regression matrix

- Recheck ready/form/error/result layout at 1440, 1024, 768, 390 and 320 CSS px; the new policy section must not add horizontal overflow, clipping or overlapping controls.
- Recheck keyboard quantity/remove/all fields, submission/retry, focus visibility, aria-live, reduced motion and 320 reflow.
- Inspect visible text, accessible output, HTML, Console and Network for the existing protected-field and zero-browser-WordPress/Feishu/external/analytics boundaries.
- Record exact request counts and exact filenames, real encoding, dimensions and SHA-256 for every new Round 2 evidence file.

## Result and stop gate

- Return one linked response with `PASS`, `FAIL` or `BLOCKED_NO_VISUAL_EVIDENCE`, and severe/obvious/detail counts.
- Write only under `QA/TASK-028/**`, TASK-028 visual artifacts and visual_qa worklog.
- Do not edit frontend/CMS/product/Planner authority, dependencies, Git or external systems; do not claim review, acceptance, deployment or production readiness.
- If processing requires the runtime switch, pause only for the controlled Planner restart and then continue the same Round 2.
