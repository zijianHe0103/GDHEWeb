# Planner synchronization proposal for TASK-004

This file supplies exact evidence for planner-owned ADR and architecture updates. The `wordpress_cms` lane did not edit `MEMORY/**`, `PROJECT/**` or the accepted architecture contract.

## Proposed ADR-005 decision

1. Adopt WordPress.org Secure Custom Fields as the current structured-field runtime for the English-first CMS foundation.
2. Keep GDHE content types, taxonomies, capabilities, field keys and REST projection in the GDHE-owned `gdhe-site` plugin; SCF UI state is not authoritative.
3. Supersede only ADR-004's implementation recommendation for ACF Pro/Polylang Pro. Preserve ADR-004's REST-first boundary, WordPress-as-CMS role, Next.js public renderer and security separations.
4. Keep English as the only enabled locale. Defer WPML Multilingual CMS and ACFML procurement, compatibility PoC and activation until three months after monitored production launch of the English site.
5. Freeze schema version `1.0.0`, six public types, one internal settings type, four taxonomies, six public field keys and seven module names as the TASK-004 foundation.
6. Defer full DTO, route resolution, navigation, preview bridge, webhook/cache, inquiry and deployment behavior to later confirmed tasks.

## Evidence to cite

- Official SCF API and executable package header both report 6.9.2.
- Official compatibility: WordPress 6.2 minimum, tested through 7.0.2, PHP 7.4 minimum.
- Package SHA-256: `40f72fa0d1829c8be89e5f8902b4d5625a40ede91884e55c4e8c5b72fd1ed799`.
- Official plugin checksum verification passed after installation.
- Upstream `readme.txt` stable tag remains 6.9.1 and should be recorded as a metadata inconsistency.
- Runtime fixture proved draft denial, authenticated access, revision/autosave preservation, preview generation, published anonymous REST, protected-meta removal and cleanup.

## Architecture contract sections

- Section 4: replace the unimplemented ACF Pro/Polylang recommendation with the verified SCF 6.9.2 English-only foundation and the later WPML/ACFML PoC gate.
- Section 5: synchronize the implemented post-type/taxonomy list and the internal `site_settings` boundary.
- Section 6: record `config/field-groups.v1.json` as the versioned SCF-equivalent source and freeze the six public field keys plus seven module names.
- Section 14: retain REST-first, add `/gdhe/v1/schema` as minimal discovery only, and state that Core public type responses use the allowlisted `gdhe` object while generic `acf` and `meta` containers are removed.

Official source URLs and access date are recorded in `EXECUTION_REPORT.md` and `docs/cms/OPERATIONS_AND_ROLLBACK.md`.
