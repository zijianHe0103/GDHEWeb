# TASK-028 Visual QA Overflow Bounded Closure Dispatch

message_id: `MSG-TASK-028-VISUAL-QA-OVERFLOW-CLOSURE`

## History

- Preserve Visual Round 1 `FAIL / severe 1 / obvious 2 / detail 0` and its twenty evidence hashes.
- Preserve Visual Round 2 `FAIL / severe 0 / obvious 1 / detail 0` and its forty-two evidence hashes.
- This is not Visual Round 3 and must not repeat the complete state matrix. It is a bounded closure of the sole Round 2 overflow finding.

## Planner runtime

- Use only Planner-owned `http://127.0.0.1:3000/request-a-quote` at PID `64211`.
- The page is local Stub mode and returns HTTP 200. Port 18080 is intentionally clear because no submission is authorized or needed.
- Seed only the same frozen ready-mixed Basket used in Round 2. Do not submit the form, start another server or request a runtime switch.

## Exact closure checks

1. At 390 CSS px, prove `innerWidth == clientWidth == scrollWidth == 390`; measure `#rfq-privacy-policy` inside the parent form/panel with no right-edge overflow, clipping or overlap.
2. At 320 CSS px, prove `innerWidth == clientWidth == scrollWidth == 320` and the same policy containment.
3. Capture one screenshot at each width plus an exact browser metric/DOM/focus record.
4. Recheck only the directly adjacent regression: the visible Privacy Policy link remains before Submit Request in native keyboard order, Enter still targets the same-page `#rfq-privacy-policy` section and focus reaches that target.
5. Confirm the local policy copy and zero external/WordPress/Feishu/analytics request boundary remain unchanged. Do not re-run accepted, processing, retry or the five-width matrix.

## Evidence and result

- Store new bounded evidence under `QA/TASK-028/overflow-closure/**` with exact actual encoding, dimensions and SHA-256.
- Add a bounded closure section/artifact without rewriting historical verdicts or evidence.
- Return one linked `PASS`, `FAIL` or `BLOCKED_NO_VISUAL_EVIDENCE` with severe/obvious/detail counts for this finding only.
- Do not edit frontend, task/Planner authority, CMS, dependencies, Git, deployment or external systems; do not start adversarial review.
