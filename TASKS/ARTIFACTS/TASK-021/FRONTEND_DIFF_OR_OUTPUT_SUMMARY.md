# TASK-021 Frontend Diff or Output Summary

Date: 2026-08-04

## Added

- Product Configuration v2 snapshot, verifier, Validator/Adapter/load surface and DTO;
- QuoteLine v2 Schema, samples, manifest, verifier and TypeScript surface;
- pure v2 choice projection, builder and preview;
- focused v2 contract/consumer/presentation tests;
- TASK-021 frontend execution evidence.

## Updated

- Product Configuration Transport gained a private version selector with fixed public v1 and v2 calls; v1 request behavior remains unchanged;
- Product Detail orchestration consumes the v2 loader;
- ProductConfigurator renders Track Length then Color and no Installation while preserving Packaging, Quantity and one latest in-memory result;
- directly corresponding route, interaction, summary, server-only and documentation tests.

## Explicitly unchanged

- every Product Configuration 1.0.0 and QuoteLine 1.0.0 authority byte;
- `frontend/package.json`, `frontend/package-lock.json`, protected image and environment files;
- ProductCard, ProductList, unrelated Product Detail facts/layout, CMS/WordPress/database/Feishu;
- root README, Planner state, visual QA, review, Git and deployment.
