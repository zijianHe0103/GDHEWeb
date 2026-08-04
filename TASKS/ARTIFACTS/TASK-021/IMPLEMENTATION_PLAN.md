# TASK-021 Implementation Plan

## A1 Planner design and baseline

- Freeze REQUIREMENTS and DESIGN.
- Record v1 schema/sample hashes, branch/base, routes, package/lock, protected image and generated-file state.
- Validate DPG project/messages/lanes and diff.
- Gate: only WordPress dispatch after PASS.

## A2 WordPress Product Configuration 2.0.0

1. RED: missing v2 root Schema and exact `schema=2.0.0` route behavior.
2. GREEN: add the minimum closed v2 Schema closure and route selection while preserving v1.
3. RED: installation field/accessory present in v2 output.
4. GREEN: v2 configuration policy contains only packaging and custom length.
5. RED: duplicate same-product length/color candidates map to multiple Article Numbers.
6. GREEN: fail closed for the entire product; preserve distinct-product independence and global Article Number uniqueness.
7. Prove current one-option Golden, normalized errors, ETag/304, two different WordPress-ID lifecycles, exact cleanup and zero residue.
8. Produce versioned handoff/checksums and execution report.

## A3 Planner CMS checkpoint

- Independently validate v2 Schema/Golden/error closure and runtime route.
- Reproduce ambiguity and internal-field negatives.
- Reprove v1 exact hashes and existing A3/ProductCard regressions.
- Only PASS unlocks frontend.

## A4 Frontend v2 contract and runtime

1. RED/GREEN: independent v2 snapshot/verifier bound to the CMS handoff.
2. RED/GREEN: isolated future server-side QuoteLine 2.0.0 schema/samples/verifier; v1 remains immutable.
3. RED/GREEN: fixed v2 Transport, exact Schema Validator, authentic wrapper, deep readonly Adapter and server-only build negatives.
4. RED/GREEN: pure length/color projection and unique option resolver, including 0/1/N and duplicate ambiguity.

## A5 Visible configurator

1. RED: current form shows a Standard/Custom mode and Installation before Packaging.
2. GREEN: one Track Length fieldset with real standard choices plus sibling Custom Length; conditional input; Color next; no Installation.
3. RED/GREEN: standard and custom public quote-draft builder paths, safe custom precision and packaging/quantity regressions; no internal identity or resolution enum enters the draft.
4. RED/GREEN: customer-readable `LatestPublicQuoteDraftSummary` without Installation, Article Number or QuoteLine-created claim. Keep the isolated QuoteLine 2.0.0 builder only as a future server conversion contract test surface.
5. Prove one resolve, one v2 configuration, zero per-option/ProductCard/browser-WordPress requests and production 404.

## A6 Regression and documentation

- Focused TASK-021 tests and all TASK-019/020 v1 regressions.
- All contract verifiers, full Vitest, lint, typecheck, production build and smokes.
- Protected hashes, package/lock, image, routes, generated files, internal leakage, diff and DPG gates.
- Update CMS/frontend/root documentation only after behavior passes.

## A7 Visual QA and review

- Preview server owned by Planner.
- Capture 1440/1024/768/390 and 320 CSS px default, standard, custom and error states.
- Verify keyboard order, radio behavior, input visibility, focus, aria and reduced motion.
- Fix severe/obvious differences through narrow RED/GREEN only.
- Run one independent adversarial review after visual PASS and Planner pre-review validation.

## A8 Final gate

- Planner fresh final validation and Summary.
- Checked `prepare-awaiting-user` only after execution, visual, review, documentation and evidence are complete.
- Wait for exact user acceptance; no Git delivery or deployment beforehand.
