# Project Manifest

This file is the only project location map. Resolve lower-level files only through this table.

<!-- BEGIN DPG_MANIFEST -->
```json
{
  "business_authorities": {
    "architectural_decisions": [
      "MEMORY/DECISIONS.md",
      "MEMORY/DECISIONS"
    ],
    "architecture_contract": "docs/architecture/headless-wordpress-nextjs-contract.md",
    "cms_content_model": "docs/cms/CONTENT_MODEL.md",
    "cms_operations_rollback": "docs/cms/OPERATIONS_AND_ROLLBACK.md",
    "cms_rest_contract": "docs/cms/REST_CONTRACT.md",
    "frontend_product_configuration_contract": "docs/frontend/PRODUCT_CONFIGURATION_AND_QUOTE_LINE_CONTRACT.md",
    "frontend_source": "frontend/src",
    "image_generation_site": "external:independent-nested-project-live-main-only",
    "localization_source": "docs/i18n-seo",
    "project_usage": "README.md",
    "quote_basket_contract": "docs/frontend/QUOTE_BASKET_CONTRACT.md",
    "reference_research": "docs/reference-site-analysis.md",
    "visual_source": "QA",
    "wordpress_source": "cms/wp-content/plugins/gdhe-site"
  },
  "governance": {
    "active_tasks": "TASKS/ACTIVE",
    "current_state": "PROJECT/STATE.md",
    "event_log": "PROJECT/events.jsonl",
    "lane_registry": "LANES/registry/lanes.json",
    "project_contract": "PROJECT/CONTRACT.md",
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
