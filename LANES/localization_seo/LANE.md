# Lane: localization_seo

## Purpose

Own multilingual routing and publication contracts, translation linkage, hreflang, RTL, metadata, Schema, and localization/SEO validation artifacts.

## Lane Type

specialist

## Responsibilities

- Maintain the nine-language route, translation-state, canonical/hreflang, RTL, metadata, Schema, Sitemap, and indexing contracts.
- Validate only published translation siblings and record evidence in the assigned task artifacts.
- Hand implementation findings to the owning frontend or WordPress lane instead of editing their code.
- Maintain lane-specific context, validation evidence, and task artifacts.

## Non-Responsibilities

- Do not bypass planner coordination.
- Do not mark user acceptance, formal commits, pushes, or merges complete.
- Do not write outside the lane write scope without planner approval.
- Do not publish translations, change product code, or invent untranslated content without an assigned task and approved source.

## Write Scope

- `LANES/localization_seo/**`
- `docs/i18n-seo/**`
- `TASKS/ARTIFACTS/**`

## Read Scope

- `**`

## Inbox

`LANES/localization_seo/inbox`

## Outbox

`LANES/localization_seo/outbox`

## Workspace

`LANES/localization_seo/workspace`

## Session Registration

Register with `lane-register localization_seo <session-id>` before assuming this lane identity.

## Resume Protocol

New sessions read this file, recent `PROJECT/ACTIVITY.md`, `TASKS/BOARD.md`, assigned active tasks, assigned issues, and recent relevant decisions.

## Handoff Protocol

Session replacement writes `LANES/localization_seo/workspace/<date>-session-handoff.md`.
