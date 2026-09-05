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
    "architecture_contract": "docs/architecture/GDHE_TARGET_ARCHITECTURE.md",
    "catalog_api_contract": "docs/architecture/CATALOG_API_CONTRACT.md",
    "cms_content_model": "docs/cms/CONTENT_MODEL.md",
    "cms_operations_rollback": "docs/cms/OPERATIONS_AND_ROLLBACK.md",
    "cms_rest_contract": "docs/cms/REST_CONTRACT.md",
    "core_database_architecture": "docs/architecture/CORE_DATABASE_ARCHITECTURE.md",
    "core_database_source": "database",
    "core_source": "core",
    "frontend_product_configuration_contract": "docs/frontend/PRODUCT_CONFIGURATION_AND_QUOTE_LINE_CONTRACT.md",
    "frontend_source": "frontend/src",
    "image_generation_site": "external:independent-nested-project-live-main-only",
    "localization_source": "docs/i18n-seo",
    "project_usage": "README.md",
    "product_master_logical_model": "docs/architecture/PRODUCT_MASTER_LOGICAL_MODEL.md",
    "public_product_flow_contract": "docs/architecture/PUBLIC_PRODUCT_FLOW_CONTRACT.md",
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
