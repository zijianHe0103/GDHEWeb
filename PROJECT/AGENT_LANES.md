# Agent Lanes

schema: DPG-LANES-1.0.0

This Markdown file is a rendered view. The machine-readable source of truth is `LANES/registry/lanes.json`.

| lane | lane_type | purpose | current_session | status | write_scope | worklog | workspace |
|---|---|---|---|---|---|---|---|
| adversarial_reviewer | adversarial_reviewer | Challenge assumptions, inspect omissions and risk, verify evidence, and return PASS/FAIL/P0/P1/P2 findings. | task001_adversarial_review | registered | `TASKS/ARTIFACTS/*/ADVERSARIAL_REVIEW_REPORT.md`<br>`LANES/adversarial_reviewer/**` | `LANES/adversarial_reviewer/worklog.md` | `LANES/adversarial_reviewer/workspace` |
| executor | executor | Execute assigned work, produce deliverables, write execution reports, and request adversarial review. |  | unregistered | `TASKS/ARTIFACTS/**`<br>`LANES/executor/**` | `LANES/executor/worklog.md` | `LANES/executor/workspace` |
| frontend | specialist | Own the independent TypeScript frontend, reusable UI, routing, CMS data access, frontend tests, and frontend documentation. |  | unregistered | `LANES/frontend/**`<br>`frontend/**`<br>`docs/frontend/**`<br>`TASKS/ARTIFACTS/**` | `LANES/frontend/worklog.md` | `LANES/frontend/workspace` |
| localization_seo | specialist | Own multilingual routing and publication contracts, translation linkage, hreflang, RTL, metadata, Schema, and localization/SEO validation artifacts. |  | unregistered | `LANES/localization_seo/**`<br>`docs/i18n-seo/**`<br>`TASKS/ARTIFACTS/**` | `LANES/localization_seo/worklog.md` | `LANES/localization_seo/workspace` |
| planner | planner | Top-level planning, requirement clarification, task decomposition, lane dispatch, and final user reporting. | 019f857b-3e04-73d2-9335-edcff61b30ed | registered | `PROJECT/**`<br>`TASKS/**`<br>`MEMORY/**`<br>`LANES/**` | `LANES/planner/worklog.md` | `LANES/planner/workspace` |
| visual_qa | specialist | Own reference-site comparison evidence, four-viewport screenshots, accessibility, interaction, performance, and graded visual-difference reports. |  | unregistered | `LANES/visual_qa/**`<br>`QA/**`<br>`TASKS/ARTIFACTS/**` | `LANES/visual_qa/worklog.md` | `LANES/visual_qa/workspace` |
| wordpress_cms | specialist | Own GDHE WordPress content models, custom CMS extensions, controlled APIs, permissions, and CMS documentation without editing WordPress core. |  | unregistered | `LANES/wordpress_cms/**`<br>`cms/wp-content/plugins/gdhe-site/**`<br>`cms/wp-content/mu-plugins/gdhe-*.php`<br>`docs/cms/**`<br>`TASKS/ARTIFACTS/**` | `LANES/wordpress_cms/worklog.md` | `LANES/wordpress_cms/workspace` |
