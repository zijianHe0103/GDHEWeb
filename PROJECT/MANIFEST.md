# Project Manifest

This file is the only project location map. Resolve lower-level files only through this table.

<!-- BEGIN DPG_MANIFEST -->
```json
{
  "business_authorities": {
    "architecture_contract": "docs/architecture/headless-wordpress-nextjs-contract.md",
    "cms_contracts": "docs/cms",
    "domain_context": "PROJECT/CONTEXT.md",
    "frontend_contracts": "docs/frontend",
    "frontend_source": "frontend/src",
    "hard_constraints": "PROJECT/CONSTRAINTS.md",
    "image_generation_site": "external:independent-nested-project-live-main-only",
    "localization_source": "docs/i18n-seo",
    "project_goal": "PROJECT/CHARTER.md",
    "project_usage": "README.md",
    "quality_baseline": "PROJECT/QUALITY.md",
    "reference_research": "docs/reference-site-analysis.md",
    "visual_source": "QA",
    "wordpress_source": "cms/wp-content/plugins/gdhe-site"
  },
  "governance": {
    "active_tasks": "TASKS/ACTIVE",
    "current_state": "PROJECT/STATE.md",
    "decisions": "MEMORY/DECISIONS",
    "event_log": "PROJECT/events.jsonl",
    "lane_registry": "LANES/registry/lanes.json",
    "project_contract": "PROJECT/CHARTER.md",
    "task_archive": "TASKS/ARCHIVE"
  },
  "nested_projects": {},
  "project_id": "independent-site",
  "runtime": {
    "current_messages": "runtime:messages",
    "git_delivery": "runtime:git-delivery",
    "session_bindings": "runtime:session-bindings"
  },
  "schema_version": "DPG-3"
}
```
<!-- END DPG_MANIFEST -->
