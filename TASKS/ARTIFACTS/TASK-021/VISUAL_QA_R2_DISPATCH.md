# TASK-021 Visual QA Round 2 Dispatch

## Preserved history

Visual Round 1 remains `FAIL / severe=1 / obvious=1 / detail=1`. Preserve all ten Round 1 evidence files, reports, logs, encodings, dimensions and hashes.

## Target

Planner-owned same-origin preview: `http://127.0.0.1:3000/products/fgd-x15-pvc`.

## Narrow retest

1. In a fresh clean Chrome Guest context loaded through `127.0.0.1`, verify the configurator hydrates: standard `6 m` reveals `Ivory White`; Custom Length reveals its input; invalid native Enter stays on the canonical URL and produces stable inline errors.
2. Complete one valid standard configuration and one valid custom `5.8 m` configuration using native keyboard controls. Verify the second result replaces the same latest draft and no external/storage/submission side effect occurs.
3. Inspect complete document/Flight bytes and visible DOM for Article Number, product UUID, `articleNumber`, WordPress/Feishu/internal/diagnostic markers. All must be absent.
4. Verify local font and HMR assets no longer return 403/invalid HTTP response, and the clean Console has no unexpected error.
5. Reconfirm no external, WordPress or Feishu browser request; all current requests remain same-origin.
6. Reconfirm the preserved responsive baseline at 1440/1024/768/390/320, including no horizontal overflow, readable density, focus, CTA and reduced-motion.

## Verdict and scope

Return PASS only for `severe=0 / obvious=0 / detail=0`; otherwise return FAIL/BLOCKED with fresh evidence. Write only QA/TASK-021 Round 2 evidence, the canonical visual report and visual_qa lane records. Do not edit frontend/CMS/task authority, server configuration, Round 1 bytes, review, Git, deployment or deferred features.
