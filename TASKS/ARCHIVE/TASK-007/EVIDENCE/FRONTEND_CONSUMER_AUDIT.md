# TASK-007 前端只读消费审计

- Task: `TASK-007`
- Lane: `frontend`
- Round 1 message: `MSG-TASK-007-FRONTEND-READONLY-CONSUMER-AUDIT`
- Round 2 message: `MSG-TASK-007-FRONTEND-CONSUMER-READAUDIT-R2`
- Current single-finding message: `MSG-TASK-007-FRONTEND-COLLECTION-TOTAL-READAUDIT-R3`
- 审计日期: 2026-07-24
- 当前审计范围: 只复核 collection total 跨页不变量，不重开已关闭 finding
- 产品代码状态: 只读，未修改 `frontend/**`、依赖、测试或环境文件
- 当前审计结论: `PASS`
- 当前 Findings: `P0=0`, `P1=0`, `P2=1`
- Round 2 baseline: `FAIL`, `P0=0`, `P1=1`, `P2=1`
- Round 1 baseline: `FAIL`, `P0=1`, `P1=5`, `P2=3`

## Current R3 single-finding re-audit

唯一开放的 collection total P1 已关闭。相同 `service` type、`service_family:task-007-a2-cnc` filter、`title_asc` sort 和 `perPage=2` 下，冻结三页结果为：

| Golden | page | items | total |
| --- | ---: | ---: | ---: |
| `collection-service.json` | 1 | 2 | 3 |
| `collection-service-page-2.json` | 2 | 1 | 3 |
| `collection-service-page-3-empty.json` | 3 | 0 | 3 |

代码和测试证据：

- `cms/wp-content/plugins/gdhe-site/includes/public-api.php:381-394` 的 `gdhe_collection_complete_total()` 在 terminal empty page 的原查询 `found_posts` 为零时，使用完全相同的 type/filter/sort 约束执行 page 1 count query。
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php:475` 将该完整匹配数写入公开 collection `total`。
- `cms/wp-content/plugins/gdhe-site/tests/a2-contract-test.php:123-131` 明确断言 items 为 `2/1/0`，且三页 totals 严格等于 `3/3/3`。
- `COLLECTION_DETERMINISM.json` 冻结 `pageSizes: [2,1,0]`、`crossPageTotals: [3,3,3]` 和 `totalInvariant: true`。
- Contract R4 runtime summary 保存同一不变量；两轮 lifecycle 使用不同内部 WordPress IDs，仍得到 13/13 相同 Golden hashes。

Fresh read-only validation：

| Check | Result |
| --- | --- |
| exact R3 request ack | PASS，原消息已移动到 `done` |
| Golden type/filter/sort equality | PASS |
| Golden totals | PASS，`3/3/3` |
| Golden item lengths | PASS，`2/1/0` |
| runtime assertion | PASS，存在显式跨页 total equality 断言 |
| collection evidence | PASS，与 Golden 一致 |
| frozen handoff checksums | PASS，46/46 |
| terminal Golden SHA-256 | PASS，`c13895539889bc0e2f20693e905d6bb166cf8064e3a776b876e1eb60a6a66250` |
| collection evidence SHA-256 | PASS，`5f8309a3575cabe90614207eccc3e0989a28049a3ca75d2287c9171ba3c49c13` |
| prohibited frontend scope | PASS，`frontend/**` 未修改 |

最终 consumer audit 结论为 `PASS`，当前计数 `P0=0`, `P1=0`, `P2=1`。既有 P2 仅为生产媒体 HTTPS origin、Next Image allowlist、redirect 和不可达策略的部署门，不阻塞当前 REST consumer contract；本轮没有重开任何已关闭 finding。

GraphQL threshold 仍只属于未来 Planner-owned PoC/ADR，不授权本任务安装或实施 GraphQL。本 PASS 也不授权 product adapter、adversarial review、task transition、commit、push、merge、accept 或 close；后续门禁仍由 Planner 控制。

以下 Round 2 与 Round 1 内容作为历史审计轨迹保留；其中旧 FAIL 与旧 finding counts 不代表当前结论。

## 0. Round 2 R3 re-audit 结论

R3 已关闭 Round 1 的 HTML 安全、七模块子合同、canonical publicPath、error/header matrix、UUIDv4 和 payload bounds 缺口，但 collection terminal page 暴露了一个仍未关闭的分页一致性 P1。当前 REST R3 合同因此仍不足以直接作为未来 adapter 的冻结消费合同。

同一 `service_family:task-007-a2-cnc`、`title_asc`、`perPage=2` 查询的冻结结果为：

| Golden | page | items | total |
| --- | ---: | ---: | ---: |
| `collection-service.json` | 1 | 2 | 3 |
| `collection-service-page-2.json` | 2 | 1 | 3 |
| `collection-service-page-3-empty.json` | 3 | 0 | 0 |

`total` 是 collection envelope 的分页元数据；相同筛选与排序下，它不能因为请求越过末页而从 3 变为 0。当前实现直接读取 `WP_Query.found_posts`，而冻结 terminal-page Golden 已证明该值在越界空页发生漂移。测试只断言 page 1 的 `total === 3`，没有断言 page 2 和 terminal page 保持相同 total。

精确证据：

- `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/golden/collection-service-page-3-empty.json:10` 冻结 `total: 0`。
- `cms/wp-content/plugins/gdhe-site/includes/public-api.php:459` 直接把当前查询的 `found_posts` 写入公开 `total`。
- `cms/wp-content/plugins/gdhe-site/tests/a2-contract-test.php:123-126` 只检查三页 item 数量和 page 1 total，缺少跨页 total invariant。

最小关闭门：

1. 冻结 `total` 为同一 filter/sort 查询的完整匹配数，并让 page 1、page 2、terminal empty page 一致返回 3。
2. 增加跨页 total invariant 断言，重新生成受影响 Golden、determinism evidence、manifest 和 checksums。
3. 再做一次只针对该 P1 的 frontend read-only re-audit。

### 0.1 Round 1 findings closure matrix

| Round 1 finding | R3 判定 | 直接证据 |
| --- | --- | --- |
| P0-1 safe HTML authority | CLOSED | `gdhe_sanitize_public_html()` 使用显式 `wp_kses` allowlist；rich text、split media、accordion 在公开序列化前统一改写为 `safeHtml`；resolve-home 恶意样本不含脚本、危险标签、事件属性或危险协议 |
| P1-1 七模块、link/CTA/template | CLOSED | resolve-home 覆盖 7/7 module types；18 Schema 包含严格共享 link Schema；`templateKey` 为闭合 enum；4 valid 与 4 invalid module fixtures 符合预期 |
| P1-2 canonical publicPath | CLOSED | 共享 `public-path.schema.json` 被 page、reference、navigation、route 和 link 复用；runtime producer 使用同一 validator；正负 path matrix PASS |
| P1-3 error/cache/header | CLOSED | 10 canonical error bodies 通过 error Schema；四端点 200/304/error 由代码与 contract test 覆盖；handoff 冻结 transport status 与 `Retry-After` passthrough policy |
| P1-4 collection determinism | OPEN, P1 | 多 item、sort、filter、tie-break、page size 已证明，但 terminal empty page 的 total 从 3 漂移到 0 |
| P1-5 GraphQL threshold | CLOSED in TASK-007 | benchmark trigger 已正确隔离为未来 Planner-owned PoC/ADR；未安装、实现或采用 GraphQL；它不是本任务授权 |
| P2-1 payload bounds | CLOSED | page modules、relations、navigation depth/items、routes 和 collection items 均有机器上限及 negative boundary evidence |
| P2-2 UUIDv4 Schema | CLOSED | 共享 UUIDv4 regex Schema 被全部公开 identifier 合同复用，错误和边界 fixture 均验证 |
| P2-3 production media origin | DEFERRED, P2 | 本地 fixture URL 可消费；生产 HTTPS origin、Next Image allowlist、redirect 和不可达策略仍是部署门 |

### 0.2 消费与协议门

- 当前 R3 REST contract：`FAIL`，因 collection `total` 跨页不一致。
- 当前 finding 计数：`P0=0`, `P1=1`, `P2=1`。
- GraphQL：阈值已触发，但只形成未来 Planner-owned PoC/ADR 门；不授权 TASK-007 安装 GraphQL。
- Product adapter：本审计不授权实现。即使上述 P1 关闭，实际 adapter 仍需等待 Planner 对协议 PoC/ADR 的独立决策或明确的受控实现派发。
- WordPress 隔离：13 Golden 和 10 error fixtures 未出现 WordPress numeric ID、Core REST、SCF、postmeta、数据库结构、用户或凭据；两轮 lifecycle 使用不同内部 IDs 仍得到 13/13 相同 hashes。
- 产品范围：`frontend/**` 保持只读；未启动 adversarial review、GraphQL、commit、push、merge、accept 或 close。

### 0.3 Fresh R3 validation

| Check | Result |
| --- | --- |
| exact R2 request ack | PASS，原消息已移动到 `done` |
| frozen handoff checksums | PASS，46/46 |
| JSON parse | PASS，artifacts、13 Golden 和 18 Schema 全部可解析 |
| frozen schema validation | PASS，13 success、10 error、8 module fixtures；5 个 boundary negatives 符合预期 |
| seven-module coverage | PASS，resolve-home 为 7/7 |
| safeHtml malicious-content scan | PASS，危险标签、事件属性和 `javascript:` 未出现在 public DTO |
| canonical path matrix | PASS |
| four-endpoint header evidence | PASS，200/304/error 代码与测试覆盖 |
| internal CMS field scan | PASS，公开 Golden/error/module fixtures 未见 WordPress ID 或 CMS 内部结构 |
| collection cross-page invariant | FAIL，page 3 total 为 0，而 page 1/2 为 3 |
| prohibited frontend scope | PASS，`frontend/**` 无本 Lane 修改 |

以下第 1 至第 10 节保留 Round 1 原始审计基线，供本轮逐项追踪；其 `P0=1, P1=5, P2=3` 不是当前计数。

## 1. 结论

当前 handoff 已经形成可靠的 REST-first 正例基线，但还不足以授权未来 frontend adapter 开始实现。

已通过的消费门：

- API `1`、Content Schema `2.0.0`、Module Schema `1.0.0` 和 Fixture `TASK-007-A2-R2` 已固定。
- 14 份 Draft 2020-12 Schema 与 9 份 Golden 的 SHA-256 均与 handoff 一致。
- 两个完整 Fixture 生命周期使用不同 WordPress post/attachment IDs，仍得到完全相同的 9 份 Golden。
- page、reference、media、navigation 和 route ID 使用持久化 UUIDv4；公开 Schema/Golden 未出现 WordPress database ID。
- `resolve`、`collection`、`navigation`、`route-manifest` 均为匿名只读 GDHE REST DTO。
- 9 份 Golden 未出现 Core REST、SCF、postmeta、数据库、用户或凭据字段。
- 404、不兼容 Schema、route conflict 和 contract invariant 已有稳定应用级错误码。
- Preview、Webhook/cache invalidation、GraphQL adoption、多语言和产品 UI 均仍被明确延后。

阻塞点不是 UUID 或 Golden 再次漂移，而是一个 HTML 安全 P0，以及模块子结构、canonical route、错误/cache headers、collection 排序分页和已触发 GraphQL 比较门五个 P1。修复后应重新生成对应 Schema、Golden/negative samples、checksums 和测试证据，再做 frontend 窄复核。

本结论只是 consumer-contract audit，不是 adversarial review，不授权 frontend 实现、GraphQL、任务验收或 Git 交付。

## 2. 冻结包完整性与隔离边界

### 2.1 版本和 checksum

| Boundary | 冻结值 | 审计结果 |
| --- | --- | --- |
| GDHE REST API | `1` | PASS |
| Content Schema | `2.0.0` | PASS |
| Module Schema | `1.0.0` | PASS |
| Fixture revision | `TASK-007-A2-R2` | PASS |
| Contract test | `TASK-007-A2-CONTRACT-R2` | PASS |
| `gdhe-site` | `0.3.1` | PASS |
| Handoff evidence files | 10/10 checksum | PASS |
| JSON Schemas | 14/14 checksum 与 manifest 一致 | PASS |
| Golden documents | 9/9 checksum 与 manifest 一致 | PASS |

`HANDOFF_CHECKSUMS.sha256` 保存相对文件名，必须从 `TASKS/ARTIFACTS/TASK-007/` 执行。从仓库根执行会因路径基准不同失败；切换到正确目录后 10/10 为 `OK`。

### 2.2 UUID 和 WordPress 隔离

`DETERMINISTIC_GOLDEN_REVISION.json` 证明：

- 两轮 WordPress post 和 attachment ID 不同。
- 两轮 9/9 Golden hashes 完全一致。
- `publicContractUsesDatabaseIds` 为 `false`。
- 每轮 cleanup 后 TASK posts、postmeta、terms 和 uploads 均为零。

公开 page、content reference、media、navigation 和 route manifest 的 `id` 均为 UUID 字符串。对 Golden 与 Schema 的敏感词扫描未发现 `acf`、SCF、postmeta、database、WordPress 内部字段、用户或凭据依赖。

未来 adapter 可以只依赖 server-only `WORDPRESS_API_URL`、`/wp-json/gdhe/v1/*`、API/Schema 版本和 normalized DTO。它不需要 Core REST、SCF field keys、postmeta、数据库表、WordPress numeric ID 或认证凭据。Preview 是未来独立认证边界，不得混入公共 client。

## 3. Golden 到未来 DTO/route 的映射

| Golden | Future DTO responsibility | Future route responsibility | 审计结果 |
| --- | --- | --- | --- |
| `resolve-home.json` | Page envelope；root UUID、`standard` template、featured media、`hero`、`rich_text`、structured `data_table`、Service/Material relations | 英语根 `/`；固定应用路由优先，未知路由不得回退首页 | 正例可消费；受 P0/P1 module contract 阻塞 |
| `resolve-service.json` | Service envelope；`hero`、`rich_text`、Material/Case Study references | `/services/task-007-a2-precision-machining/`；CMS 404 才映射 `notFound()` | 正例可消费；canonical path Schema 阻塞 |
| `resolve-case-study.json` | Case Study envelope；`hero`、`rich_text`、Service/Material references | `/case-studies/task-007-a2-aerospace-bracket/` | 正例可消费；canonical path Schema 阻塞 |
| `resolve-material.json` | Material envelope；`hero`、structured `data_table`、Service reference | `/materials/task-007-a2-aluminum-6061/` | 正例可消费；module contract 阻塞 |
| `collection-service.json` | Service reference collection | Service listing/filter source | Shape 可消费；排序分页证据阻塞 |
| `collection-case-study.json` | Case Study reference collection | Case Study listing/filter source | Shape 可消费；排序分页证据阻塞 |
| `collection-material.json` | Material reference collection | Material listing/filter source | Shape 可消费；排序分页证据阻塞 |
| `navigation.json` | Recursive navigation envelope | 未来 global shell 数据源；TASK-007 不实现 shell | 平面正例可消费；深度/数量边界为 P2 |
| `route-manifest.json` | Route manifest envelope | build candidate enumeration and path invalidation input | Shape 可消费；canonical path 和数量边界未完全冻结 |

路由错误映射必须保持：

- `gdhe_not_found` 的权威 `404` 才进入 Next.js `notFound()`。
- `400`、`409`、`500`、timeout、invalid JSON 和 runtime-schema failure 都不是 404。
- 不存在或未发布路径不得回退首页。
- Preview、多语言和产品页面实现均不在本审计范围。

## 4. Findings

### P0-1：公开 module HTML 没有冻结且可验证的安全输出边界

**证据**

- `field-groups.v2.json` 将 `rich_text.body`、`split_media.body` 和 `accordion.answer` 定义为 WYSIWYG。
- Golden 的 `rich_text.body` 已包含 HTML。
- `includes/public-api.php` 的 `gdhe_build_content_envelope()` 直接调用 `gdhe_normalize_public_modules()`。
- `includes/modules.php` 的 `gdhe_normalize_public_modules()` 复制 module data，仅处理 media 和 table shape，没有调用 HTML sanitizer。
- 现有 `gdhe_rest_sanitize_value()` 使用 `wp_kses_post()`，但只用于 transitional Core REST projection，不用于新的 `/gdhe/v1` page DTO。
- 三份相关 module Schema 只把正文定义为任意 string；handoff 未声明它们是 safe HTML、plain text 还是需要 frontend 再清洗。

**影响**

future adapter 无法安全决定将正文作为文本、已清洗 HTML 或待清洗 HTML。若产品组件将当前 Golden 模式用于 `dangerouslySetInnerHTML`，未受冻结规则约束的 CMS 标记会进入公开站安全边界。

**关闭门**

CMS contract 必须选择并冻结一个方向：

1. CMS 端使用明确 allowlist 归一化为 `safeHtml`，在公开 endpoint 返回前清洗，并加入恶意标签、属性和协议正负测试。
2. DTO 只返回 plain text 或结构化 rich text，frontend 不渲染任意 HTML。

随后更新 Schema、Golden、negative fixtures、checksums 和文档，并证明脚本、事件属性、危险 URL scheme 和不允许标签 fail closed。

### P1-1：七模块的机器可读子结构没有完全冻结

**证据**

- page Schema 允许七种 module，但四份 resolve Golden 只覆盖 `hero`、`rich_text`、`data_table` 三种。
- `card_grid.items[].link`、`hero.primary_cta`、`hero.secondary_cta` 和 `cta_banner.primary_cta` 只是无属性约束的 object。
- Golden 只展示一个推测形状 `{title, url, target}`，但 Schema 没有 required fields、URL scheme、target enum 或 `additionalProperties: false`。
- `templateKey` 仍是任意非空 string，没有冻结 template discriminant enum。

**影响**

frontend runtime validator 无法从机器合同生成安全且穷尽的 discriminated union；未知 link、CTA 和 template 需要 adapter 自行猜测。缺少 `accordion`、`card_grid`、`split_media`、`cta_banner` 正例也无法建立七模块 canonical contract tests。

**关闭门**

- 为 link/CTA 定义独立严格 Schema，冻结 label/title、URL、target、internal/external 规则和允许协议。
- 冻结 `templateKey` enum 或 unknown-template fail-closed 规则。
- 为剩余四种 module 增加 valid Golden 和 invalid samples。
- 重新生成 checksums 和 Schema validation。

### P1-2：canonical publicPath 的 Schema 与 endpoint validator 不一致

**证据**

- endpoint `gdhe_validate_public_path()` 要求根路径或 lowercase ASCII path、首尾 `/`，并拒绝 double slash 与 dot segment。
- page、content-reference、navigation 和 route-manifest Schema 使用更宽的 `^/(?:[^?#]*/)?$`，会接受 endpoint 明确拒绝的 double slash、dot segment、空格或 uppercase。
- `gdhe_content_reference()` 返回 public path 时没有复用 canonical validator；collection 和 relations 可能产生 Schema-valid 但 endpoint-invalid 的路径。

**影响**

只用冻结 JSON Schema 的 frontend validator 不能保证 `publicPath` 可安全作为 canonical route key、cache key 或内部链接。resolve、collection、relations、navigation 和 route manifest 存在不同有效性口径。

**关闭门**

冻结单一 `public-path.schema.json`，让所有 path producer 与 endpoint normalization 复用同一规则。加入 root、正常 path、double slash、dot segment、uppercase、encoded separator、query、fragment 和长度边界测试。

### P1-3：错误与 cache/ETag 证据不足以冻结 transport adapter

**证据**

- `error.schema.json` 存在，但 9 份 Golden 全是成功响应，没有 canonical error body fixtures。
- A2 contract test 对 error 只断言 status、code 和必需字段存在，没有用 error Schema 验证完整 response。
- test 只对 resolve 断言 ETag 和 matching ETag 的 304；未对四 endpoint 逐一断言 `Cache-Control`、ETag、304 headers，也未断言 resolve `Last-Modified`。
- handoff 只写 public cache headers，没有冻结当前 implementation 的 `public, max-age=60`。
- 304 implementation 返回 ETag，但没有同步 success response 的 `Cache-Control`。
- TASK-005 transport boundary 要求区分 401/403/429/502/503、`Retry-After` 和 transient upstream failure；当前没有冻结这些情况如何进入 frontend typed errors。

**影响**

future adapter 可解析 happy path，却不能仅用 handoff 建立完整 error/header contract tests，也无法稳定区分 authoritative 404、contract invariant、rate limit 和 upstream unavailable。

**关闭门**

- 增加每个稳定 application error 的 canonical body fixture，并通过 error Schema。
- 冻结四 endpoint 的 success/304/error header matrix，包括 ETag、Last-Modified、Cache-Control、Content-Type 和 request ID 口径。
- 明确 401/403/429/502/503 属于 GDHE envelope、WordPress/proxy passthrough 还是 frontend transport error，并冻结 `Retry-After`。
- 对四 endpoint 逐一测试 200 与 conditional request。

### P1-4：collection Golden 不能证明分页和排序确定性

**证据**

- 三份 collection Golden 各只有一个 item，`page=1`、`perPage=10`、`total=1`。
- Service request 使用 `title_asc`，但单 item 不能证明排序。
- Case Study 和 Material 使用默认 `modified_desc`，同样只有单 item。
- 没有 page 2、空末页、`per_page` 边界、相同 title/modified 的 tie-break 或多 item filter 正例。
- response 不回显 sort/filter，consumer 只能依赖请求上下文。

**影响**

collection envelope shape 可以建模，但稳定分页和排序没有可重放的多记录证据。future adapter 的 cache key、分页 UI 和 prefetch 不能把单 item Golden 当成确定性证明。

**关闭门**

为至少一个 collection 建立 3 个以上 published items，覆盖 `title_asc`、`modified_desc`、tie-break、page 1/page 2/empty terminal page、filter 正例和 `per_page` 边界。冻结 request definitions 与对应 Golden/assertions，并明确 sort/filter 是否必须回显。

### P1-5：架构定义的 GraphQL 比较门已经触发但尚未决策

**证据**

- `BENCHMARK.json` 四个 fixture p95 为 `760.829`、`825.983`、`766.912`、`818.364` ms，均超过架构第 5.1 节的 `500 ms` 比较门。
- 架构要求任一 fixture 超门时启动独立 GraphQL PoC 与新 ADR，而不是直接在生产采用 GraphQL。
- handoff 正确记录该门已触发，并确认 A2 没有安装或启用 GraphQL。

**影响**

REST DTO 仍可作为合同基线，但在 PoC/ADR 结论前，不应把未来产品 adapter 的长期协议锁定为已最终裁决。这个 finding 不授权本 Lane 启动 GraphQL。

**关闭门**

Planner 创建独立、只比较同一四 fixture 的 PoC/ADR 任务；先确认 benchmark 环境是否代表生产同区域运行，再按插件、多语言、SEO、preview、权限和许可证门决定继续 REST 或替换 ADR。frontend implementation 需等待协议结论，或由 Planner 明确限定为可丢弃的 REST technical proof。

### P2-1：navigation 与 route manifest 缺少数量和深度上限

`navigation.schema.json` 对 top-level items 和 recursive children 没有 `maxItems` 或最大深度；`route-manifest.schema.json` 对 routes 没有 `maxItems`。page relations 也没有 key allowlist、`maxProperties` 或每组 `maxItems`。这不阻止小 fixture 解析，但 future validator 需要防御无限递归和超大 payload。

### P2-2：机器 Schema 只声明 UUID，未编码 UUIDv4

实现用 `gdhe_is_uuid_v4()` 严格检查，Golden 也是 UUIDv4，确定性证据通过；但 JSON Schema 只使用 `format: "uuid"`，不能表达版本 4 约束。建议使用 UUIDv4 regex 或等价共享 Schema。

### P2-3：媒体 origin 与 Next Image allowlist 属于未冻结部署门

Golden 媒体 URL 固定为本地 `http://127.0.0.1:8080/`，适合作为 Fixture，但不是生产 origin。future adapter 可把它作为 absolute URI 消费；接入 Next Image 前仍需冻结 CMS/media origin、HTTPS、remote pattern、redirect 和不可达媒体策略。本项不要求 TASK-007 修改 frontend 环境。

## 5. Boundary 审计汇总

| Boundary | 当前证据 | 判定 |
| --- | --- | --- |
| `resolve` success DTO | 4 representative Golden，page Schema，UUIDv4 deterministic proof | PASS，受 P0/P1 child-contract 约束 |
| `resolve` 404/409/500 | runtime matrix 有 status/code | PARTIAL，缺 error Golden/Schema/header validation |
| `collection` shape | 3 Golden，strict envelope | PASS |
| `collection` pagination/sort/filter | 一条记录/集合，positive request 存在 | FAIL，P1 |
| `navigation` | 4 个 flat item，recursive Schema | PARTIAL，深度/数量未冻结 |
| `route-manifest` | 4 条按 path 排序 route | PARTIAL，publicPath Schema 不一致且无数量上限 |
| success cache | code 当前为 ETag 与 `public, max-age=60`，resolve 有 Last-Modified | PARTIAL，handoff/header tests 未冻结完整语义 |
| conditional request | resolve matching ETag 返回 304 | PARTIAL，未覆盖全部 endpoint/header |
| error cache | code 为 `no-store` | PARTIAL，未在 frozen error fixtures/header matrix 验证 |
| secrets/browser isolation | anonymous GET，DTO 不含凭据，未来 CMS URL server-only | PASS |
| Core REST/SCF/database isolation | Schema/Golden 无内部依赖，numeric IDs 仅 cleanup evidence | PASS |

## 6. Deferred boundary confirmation

| Boundary | 审计确认 |
| --- | --- |
| Preview/Draft Mode | Deferred；公共 client 不得携带身份或凭据 |
| Webhook/cache invalidation | Deferred；当前 max-age/ETag 不等于生产 tag invalidation |
| GraphQL | 未采用、未安装；比较门已触发，必须独立 PoC/ADR |
| Multilingual/SEO | Deferred；当前仅 `en`，其他 locale 返回明确 400 |
| Product UI | Deferred；未授权 homepage、global shell、components 或 route implementation |
| Frontend implementation | Blocked；本审计没有修改 `frontend/**` |
| Adversarial review | 未启动；由 Planner 在消费缺口处置后独立派发 |
| Git delivery | 未授权；没有 commit、push、merge、accept 或 close |

## 7. 建议的最小修订顺序

1. 关闭 P0 HTML 安全 authority，并添加 malicious-content contract tests。
2. 严格冻结 link/CTA/template 和剩余四模块 Golden。
3. 统一 canonical publicPath Schema 与所有 producer。
4. 增加 error Golden 与四 endpoint cache/header matrix。
5. 增加 multi-item collection pagination/sort/filter determinism evidence。
6. 由 Planner 独立处理已触发的 GraphQL PoC/ADR gate。
7. 修订 handoff versions/checksums 后，再派发 frontend read-only re-audit。

在 P0 和全部 P1 关闭前，不应派发正式 server-only Next.js adapter 实现。

## 8. Fresh validation evidence

| Check | Result |
| --- | --- |
| project status / lane registration | TASK-007 `IN_PROGRESS`; frontend session registered |
| original lane message ack | PASS，消息移动到 `done` |
| handoff evidence checksum | PASS，正确目录下 10/10 `OK` |
| Schema SHA-256 | PASS，14/14 与 manifest 一致 |
| Golden SHA-256 | PASS，9/9 与 manifest 一致 |
| Golden/Schema internal-field scan | PASS，未发现 Core REST/SCF/postmeta/database/credential dependency |
| deterministic UUID evidence | PASS，两轮 DB IDs 不同，9/9 hashes 相同 |
| module coverage comparison | 3/7 module types represented in resolve Golden |
| open-object scan | 4 个 link/CTA object 缺少机器字段约束 |
| route/navigation limit scan | navigation/children/routes/relations limits 缺失 |
| prohibited frontend scope | `frontend/**`、dependencies、tests、env 保持只读 |

## 9. Evidence map

| Evidence | Used conclusion |
| --- | --- |
| `TASKS/ACTIVE/TASK-007-english-api-dto-fixture.md`，sections “目标”, “执行批次与门禁”, “验收标准”, “约束”, “当前状态” | A1/A2 gates, security requirements, audit-only authorization |
| `TASKS/ARCHIVE/TASK-007/EVIDENCE/machine/CONTRACT_AND_HANDOFF_MANIFEST.md` | fixed versions, endpoint/error matrix, checksums, benchmark, cleanup and deferrals |
| `TASKS/ARCHIVE/TASK-007/EVIDENCE/DETERMINISTIC_GOLDEN_REVISION.json` | two-lifecycle ID change and 9/9 Golden determinism |
| `TASKS/ARCHIVE/TASK-007/OUTPUTS/CONTRACT_RUNTIME_SUMMARY.json` | 9 positive, 14 negative, ETag and fail-closed summary |
| `TASKS/ARCHIVE/TASK-007/EVIDENCE/SCHEMA_VALIDATION.json` | 9 positive Golden validated against Draft 2020-12 schemas |
| `TASKS/ARCHIVE/TASK-007/EVIDENCE/BENCHMARK.json` | origin request graph, payloads, p50/p95 and triggered comparison gate |
| `TASKS/ARTIFACTS/TASK-007/golden/*.json` | exact representative page, collection, navigation and route DTOs |
| `cms/wp-content/plugins/gdhe-site/config/schemas/**/*.json` | strict envelopes plus HTML/link/path/limit gaps |
| `cms/wp-content/plugins/gdhe-site/includes/public-api.php`, `modules.php`, `rest.php` | normalization, error/cache behavior, path rules and sanitizer boundary |
| `cms/wp-content/plugins/gdhe-site/tests/a2-contract-test.php`, `a2-schema-validate.py` | positive/error/header/schema assertions and missing coverage |
| `docs/cms/REST_CONTRACT.md`，sections “Public DTO endpoints” and “Deferred boundaries” | public request grammar and explicit deferrals |
| `TASKS/ARCHIVE/TASK-005/OUTPUTS/FRONTEND_INTEGRATION_BOUNDARY.md`，sections 3 through 6 | server-only adapter, runtime validation and freeze gates |
| `docs/architecture/headless-wordpress-nextjs-contract.md`，sections 3, 5, 8, 9 and 14 | route/data boundary, error/cache, GraphQL comparison and order |

## 10. Planner handoff

Planner should treat this audit as `FAIL` for frontend consumability and route the P0/P1 findings back to the owning CMS/contract Lane. This audit itself does not modify task state and does not start adversarial review。

After contract revision:

1. verify the new handoff checksum set。
2. confirm all P0/P1 findings are covered by machine Schema and reproducible fixtures/tests。
3. dispatch a narrow frontend read-only re-audit。
4. only after consumer audit clears, dispatch independent adversarial review。
5. do not start product frontend or Git delivery before governed gates permit it。
