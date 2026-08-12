# TASK-028 Frontend Visual R2 Overflow Narrow Revision Report

Completed: 2026-08-12

Request: `MSG-TASK-028-FRONTEND-VISUAL-R2-OVERFLOW-REVISION`

Outcome: `PASS_FOR_PLANNER_CHECKPOINT`

## Preserved history and scope

- Visual QA Round 1 remains `FAIL / severe 1 / obvious 2 / detail 0`.
- Visual QA Round 2 remains `FAIL / severe 0 / obvious 1 / detail 0`.
- The exact request and dispatch were read and ACKed before mutation.
- The required task-transition preflight was attempted and safely rejected
  because TASK-028 was already `IN_PROGRESS`; no Planner-owned state changed.
- This revision closes only the local source cause for the Round 2 nested
  Privacy Policy overflow. It does not claim Visual QA PASS.

## Focused RED

The production CSS/source regression was added first and run alone:

```text
PATH=/Users/arron/.nvm/versions/node/v24.18.0/bin:/usr/bin:/bin:/usr/sbin:/sbin \
npm test -- tests/rfq-form-presentation.test.ts \
  -t "keeps the nested Privacy Policy section within the form inline size"
```

The command exited `1`: one focused test failed and seven prior tests were
skipped. The failure showed that the actual local CSS did not contain a
direct-child policy-section rule with both `box-sizing: border-box` and
`min-width: 0`. This reproduced the code cause identified by Visual Round 2,
not a screenshot fixture.

## Minimum GREEN

Only the RFQ form-local stylesheet gained this selector:

```css
.panel form > section {
  box-sizing: border-box;
  min-width: 0;
}
```

The selector reaches the existing nested semantic `#rfq-privacy-policy`
section without changing its DOM, ID, link, focusability, copy or behavior. It
keeps the global section rule intact and adds no clipping or overflow hiding.
The direct focused rerun exited `0` with one test PASS and seven skipped; the
complete presentation file then passed `1 file / 8 tests`.

## Focused validation

- RFQ plus Quote Basket: `36 files / 195 tests PASS`.
- ESLint: `npm run lint`, exit `0`.
- TypeScript: `npx tsc --noEmit --incremental false`, exit `0`.
- A0 protected stream: `47` exact paths, the two previously authorized A4
  Basket browser files differ, and there are zero new blocking differences.
- `package.json`, `package-lock.json`, `tsconfig.json` and production
  `next-env.d.ts` retain their protected hashes. The latter is
  `7b550dda9686c16f36a17bf9051d5dbf31e98555b30d114ac49fc49a1e712651`.
- Planner stopped its owned runtimes and moved generated `.next` recoverably;
  `.next` and `tsconfig.tsbuildinfo` are absent and ports `3000` and `18080`
  are clear.
- Diff, Markdown and DPG project/message/strict-lane gates are recorded after
  the final evidence update.

The dispatch explicitly limits validation to these focused gates unless a
local failure requires a wider regression. All focused gates passed, so no
runtime, Visual QA, full review, build, deployment or external integration was
started.

## Preserved behavior

The Round 2 S1/O1/O2 fixes and accepted-clear, accepted-changed-retain,
processing-retain, no-automatic-retry, explicit-replay, keyboard, focus,
`aria-live`, reduced-motion, privacy and network boundaries remain unchanged.
There is no endpoint, validator, domain, Basket, route, customer-copy,
contract, CMS, dependency or external-system change.

## Next gate

Stop for Planner verification. Only the separately authorized bounded Visual
closure retest at 390 and 320 CSS px may determine whether the historical
Round 2 finding is visually closed.
