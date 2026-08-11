# TASK-025 Diff or Output Summary

## Product and contract output

- 新增 WordPress Article Number 索引、RelatedProductCard `2.0.0` 与一次 `1..50` 行 MixedQuoteLineValidation `1.0.0` 批量校验。
- 新增 frontend Article Number batch 合同快照、server-only consumer 与 Quote Basket `3.0.0` 合同、迁移和存储实现。
- 更新相关产品、配置器与 Quote Basket 连接点，使标准配置和目录配件携带 Article Number；自定义长度继续人工跟进。
- Article Number 可存在于浏览器数据与请求中，但普通客户 UI 和可访问文本不主动显示。

## Documentation output

- 更新根 README、frontend/CMS 文档、Headless WordPress + Next.js 架构契约、ADR-006 与决策索引。
- 保留 TASK-022/024 冻结合同与历史审核字节；新行为通过版本化新增实现。

## Excluded dirty worktree content

用户自有 `.codex/config.toml`、pre-existing `frontend/tsconfig.json`、TASK-021～024 closure edits 与历史 resume packets 不属于 TASK-025 的自动清理或当前 Git 授权范围。当前没有执行暂存、提交、推送、合并或部署。
