# TASK-004 Round 1 revision report

Date: 2026-07-23
Lane: `wordpress_cms`
Scope: exactly two P1 findings from Adversarial Review Round 1

## Result

Both P1 findings are remediated and locally validated. No P2 planner-document remediation was performed by this lane, and no deferred TASK-005 work was added.

## Recovery gate

The required fresh ignored backup was created before revision writes at:

`/Users/arron/Storage/Personal/ObsidianWorkSpace/茂洋/独立站/.local/backups/TASK-004/revision-r1-20260723T020107Z`

The SQL file is 145,687 bytes with SHA-256 `d8400025263596236553d95830be97395bf8c78a3602a3b6c8444009eb61f821`. Plugin/capability snapshots before and after parsed successfully. SQL structure, hash verification, Git ignore and database integrity passed. No destructive restore was run.

## P1-1 capability lifecycle

`gdhe_site_deactivate` now calls the existing versioned capability applicator with `remove_cap`. Activation continues to call it with `add_cap`.

The exact matrix test proved:

- active before test: administrator 28 of 28; editor 14 of 14
- after deactivation: administrator 0 of 28; editor 0 of 14
- after reactivation: administrator 28 of 28; editor 14 of 14
- final plugin state: active, GDHE Site 0.1.1

Only capabilities listed in `config/capabilities.json` were touched. No user record changed.

## P1-2 reference visibility

For anonymous and all `view` contexts:

- relationship targets require `publish` plus a publicly viewable post type
- attachment targets require image type, a public URL, valid attachment status and a published publicly viewable parent
- invalid/non-public relationship IDs are removed
- invalid/non-public media references become `null`

For `context=edit`, editorial references remain only when the current user can edit the parent item.

The temporary fixture proved:

- parent draft denial: internal and real HTTP 401
- anonymous published relationship output: published ID 10 only; draft 11, private 12 and pending/withdrawn 13 absent
- anonymous media output: public attachment 15 retained; attachment 16 on private parent removed
- authenticated `view`: same fail-closed output as anonymous
- authorized `edit`: relationships 10/11/12/13 and attachments 15/16 retained
- six-key allowlist preserved; `acf` and `meta` absent

## Cleanup

Exact fixture posts 9 through 13, attachment posts 15 and 16, revisions 14 and 17 and all associated postmeta were deleted. Database queries reported zero residue. No upload file was created. Final Service count is zero and `wp db check` passed.

## Deferred scope preserved

No full DTO, module ID/version, structured data table, route resolution, preview bridge, webhook, multilingual, SEO, frontend or deployment behavior was implemented. SCF source, WordPress Core/theme, credentials, users, planner files and the canonical reviewer report were not edited.
