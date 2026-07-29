# TASK-012 Planner 独立检查点

checked_at: 2026-07-26T05:10:23Z
result: PASS_TO_ADVERSARIAL_REVIEW
task_state: IN_PROGRESS
acceptance_state: NOT_ACCEPTED
git_state: DIRTY

## 结论

权威路线图修订满足 TASK-012 的实施门，可以进入独立对抗审查。该结论不是用户验收，也不授权提交、推送、合并、后续阶段实施或部署。

## 独立核验

### 1. 路线与决策

- 第 14 节是唯一后续实施顺序，明确保留 TASK-001～011。
- 新顺序为真实产品/IA/URL/CTA → 代表产品纵切 → Staging/Preview/cache/Webhook → 受控壳层 → 产品系统 → 首页 → 其余模板 → 转化/分析/隐私 → 上线加固 → 成熟度门后的多语言。
- 技术 SEO 从首个正式模板进入完成定义；产品系统先于正式首页。
- RapidDirect、产品型同业与 GDHE 真实资料的职责已分开；主 CTA 必须先冻结，不机械复制 Instant Quote。
- proposed ADR-006 只记录顺序和多语言触发门，不授权采购、安装、PoC、公开路由或实施。

### 2. 冲突修复

- 将历史“下一任务目录输入”改为未来目标目录并显式服从第 14 节。
- 将 Home/Service/Case/Material Fixture 的历史“下一阶段”指令改为真实产品阶段中有证据才可提出的独立 GraphQL 复评门；REST-first 与量化门保持。
- 将历史 TypeScript DTO 示例与当前 TASK-007～011 Schema 3 消费事实分开。
- 修正归档 TASK-011 底部残留的 `NOT_ACCEPTED / waiting user acceptance`，使其与头部、Board、Archive Index 和远端交付事实一致为 `CLOSED / ACCEPTED / MERGED`。

### 3. Schema 19/16

Planner 从当前 CMS 五个根重新递归解析本地 `$ref`，并从前端 manifest 两个根独立解析：

```json
{
  "cmsCount": 19,
  "frontendCount": 16,
  "cmsOnly": [
    "collection.v3.schema.json",
    "navigation.schema.json",
    "route-manifest.schema.json"
  ],
  "frontOnly": [],
  "a3FilesEqual": true,
  "a3HashesEqual": true,
  "manifestSourcesEqual": true,
  "manifestByteHashParity": true
}
```

因此差异只表示 CMS 完整根集合与前端 `/resolve` 消费闭包不同，不是合同丢失。

### 4. 权限与范围

- executor 的三个临时权威文档写范围已从 registry、executor Lane 文件和渲染视图收回。
- `frontend/**`、`cms/**`、`.local/**`、package/lockfile、数据库、依赖与运行环境零差异。
- 没有真实产品导入、页面/SEO/Preview/cache/Webhook/询盘/多语言实现、采购或部署。

## 门禁结果

- Schema graph、A3 file/hash、frontend source/snapshot/manifest parity：PASS。
- 权威文档本机绝对路径扫描：PASS。
- 12 个相关 Markdown 文件本地链接存在性：PASS。
- TASK-011 archive/Board/index/current-state 一致性：PASS。
- `git diff --check`：PASS。
- governance project validate：PASS。
- lane registry validate：PASS。
- lane messages validate：PASS。
- strict lane audit：PASS。

## 下一步

只允许发起 TASK-012 adversarial review。Reviewer PASS 前不得进行最终 Planner 验证或 `prepare-awaiting-user`。
