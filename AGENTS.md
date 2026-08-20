<!-- BEGIN DURABLE_PROJECT_GOVERNANCE_V3 -->
# Agent Operating Rules

## Mandatory entry

After reading this file, the next project file you read must be `PROJECT/MANIFEST.md`.

The manifest is the sole location map. It owns every project-specific path, the read order after entry, runtime locators, business authorities, and nested-project boundaries. Do not infer any location from memory, naming conventions, earlier tasks, tools, or plugin defaults.

## Authority

- Follow the user's current explicit instruction within its authorized scope.
- Treat each fact as having one canonical authority. Other files may reference it, but must not copy or redefine it.
- Treat generated views and historical records as non-authoritative unless the manifest explicitly says otherwise.
- If authorities conflict, a required route is missing, or the requested scope is ambiguous, stop the affected work and ask. Do not choose a convenient fallback.

## Change discipline

- Inspect the current state before editing. Do not rely on stale context.
- Make the smallest change that fully satisfies the confirmed request.
- Preserve unrelated edits, files, data, and local state.
- Do not refactor, reorganize, migrate, or clean adjacent content without explicit scope.
- Do not duplicate source text merely to make another file self-contained.
- When a change makes code or configuration obsolete, remove only the obsolete parts created by that change.

## Verification and claims

- Verify behavior in proportion to the changed risk surface.
- Prefer focused checks for focused changes; do not repeat broad test suites without a concrete reason.
- Distinguish implementation checks, independent review, user acceptance, Git delivery, external-system writes, and deployment. None implies another.
- Report observed evidence and remaining uncertainty. Never claim a test, review, commit, push, merge, installation, or deployment that did not occur.

## Authorization and safety

- Analysis, design, review, and planning do not authorize implementation.
- Local implementation does not authorize commit, push, merge, release, installation, external communication, external-system writes, or deployment.
- Do not expose secrets, personal data, credentials, private backups, or sensitive runtime state.
- Do not use destructive commands, force operations, history rewrites, or broad deletion without explicit authorization and verified targets.
- If completion requires new authority or a materially wider scope, stop and request confirmation.

Do not add project-specific facts or navigation data to this file.
<!-- END DURABLE_PROJECT_GOVERNANCE_V3 -->
