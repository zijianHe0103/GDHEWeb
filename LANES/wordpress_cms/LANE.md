# Lane: wordpress_cms

## Purpose

Own GDHE WordPress content models, custom CMS extensions, controlled APIs, permissions, and CMS documentation without editing WordPress core.

## Lane Type

specialist

## Responsibilities

- Implement confirmed GDHE-owned WordPress plugin or MU Plugin tasks.
- Maintain CPT, taxonomy, fields, relationships, publication state, API, permissions, migrations, tests, and `docs/cms/**`.
- Treat live database changes as external state requiring explicit scope, backup, verification, and rollback.
- Maintain lane-specific context, worklog, validation evidence, and task artifacts.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, or merges complete.
- Do not write outside the lane write scope without planner approval.
- Do not edit WordPress core, `wp-config.php`, third-party plugins/themes, database backups, or frontend code.

## Write Scope

- `LANES/wordpress_cms/**`
- `cms/wp-content/plugins/gdhe-site/**`
- `cms/wp-content/mu-plugins/gdhe-*.php`
- `docs/cms/**`
- `TASKS/ARTIFACTS/**`

## Read Scope

- `**`

## Inbox

`LANES/wordpress_cms/inbox`

## Outbox

`LANES/wordpress_cms/outbox`

## Worklog

`LANES/wordpress_cms/worklog.md`

## Workspace

`LANES/wordpress_cms/workspace`

## Session Registration

Register with `lane-register wordpress_cms <session-id>` before assuming this lane identity.

## Resume Protocol

New sessions read this file, recent lane worklog, recent `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, assigned active tasks, assigned issues, and recent relevant decisions.

## Handoff Protocol

Session replacement writes `LANES/wordpress_cms/workspace/<date>-session-handoff.md`.
