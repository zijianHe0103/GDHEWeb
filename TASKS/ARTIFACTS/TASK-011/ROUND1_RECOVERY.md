# TASK-011 Round 1 Recovery

- Recorded at: `2026-07-25T20:05:52Z`
- Review verdict: `FAIL`
- Findings: `P0=0 / P1=1 / P2=0`
- Task state: `NEEDS_REVISION`

## Confirmed P1

The exported production Adapter trusts `validated.body` at runtime. An
ordinary structural object without the TASK-010 private brand can be passed to
the real Adapter and produces a frozen DTO. The current negative test only
checks TypeScript compilation and does not execute the forged input.

## Narrowest safe revision

The runtime authenticity decision must remain owned by the module that owns
the private Validator brand. The narrow candidate is:

1. add a private, module-owned identity registry for wrappers created by the
   Validator;
2. expose a success-body accessor that accepts `unknown`, verifies membership
   and kind, and returns the already validated immutable body;
3. make the Adapter call that accessor before reading fields;
4. add executable raw-unknown, ordinary-object, wrong-kind and valid-wrapper
   tests with stable non-leaking errors;
5. preserve exactly one Schema validation and all TASK-010 wrapper,
   server-only and serialization guarantees.

This requires a narrow change to
`frontend/src/lib/cms/server/validation/index.ts`, which the active task
explicitly protects and says must be reconfirmed if Adapter work proves it
necessary. No implementation has been made pending that confirmation.

## Cleanup

The reviewer-generated `.next` directory and `tsconfig.tsbuildinfo` file were
removed by Planner after the reviewer hook correctly rejected cleanup outside
reviewer write scope. No build or server residue remains.

## Boundary

No business source fix, CMS change, Fixture recreation, Git action,
deployment or later task was started.
