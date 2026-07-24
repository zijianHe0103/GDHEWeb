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
- Do not edit WordPress core, `wp-config.php`, third-party plugin source/themes, existing database backups, or frontend code. A confirmed task may authorize creation of a new task-scoped backup in an explicit ignored path and installation/activation of a verified official plugin in an explicit runtime path; this never authorizes source modification.

## Write Scope

- `LANES/wordpress_cms/**`
- `cms/wp-content/plugins/gdhe-site/**`
- `cms/wp-content/plugins/secure-custom-fields/**`（仅限 TASK-004 从已验证的 WordPress 官方包安装和激活 SCF；禁止修改源码或纳入 Git）
- `cms/wp-content/mu-plugins/gdhe-*.php`
- `docs/cms/**`
- `TASKS/ARTIFACTS/**`
- `.local/backups/TASK-004/**`（仅限 TASK-004 新建的备份、插件状态快照与校验文件；不得改写既有备份）
- `.local/backups/TASK-007/**`（仅限 TASK-007 新建的备份、迁移 inventory、插件/config 状态快照与校验文件；不得改写既有 TASK-004 备份）

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
