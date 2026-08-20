# TASK-012 Frontend 可实施性审计

result: PASS_WITH_ENTRY_GATES
task_id: TASK-012
lane: frontend
message: MSG-TASK-012-FRONTEND-FEASIBILITY-AUDIT
audited_at: 2026-07-26T12:45:33+08:00
scope: READ_ONLY_PRODUCT_AND_CONTRACT_AUDIT

## 1. 结论

新路线的前端顺序可实施。真实产品分类、产品卡片、产品详情 Hero、技术参数、公开下载和产品询盘 CTA 是形成视觉基线的最小业务闭环；它同时验证内容模型、服务端消费、页面节奏、响应式、可访问性、SEO、媒体和转化，不应退回孤立 `/foundation/ui`。

“阶段 2 纵向切片”和“阶段 5 产品系统”不冲突：

- 阶段 2 只用少量代表产品证明一条端到端路径及最小设计语言；
- 阶段 5 才把已证明的模式扩展到完整分类/系列、筛选分页、边界状态和全部产品。

当前基础能够复用，但尚不能直接开始正式产品页面。阶段 1 必须先关闭真实产品资料、IA/URL/CTA、产品卡片投影和 SEO 合同缺口；阶段 3 必须先冻结部署拓扑并建立生产相似 Staging。不得用前端临时拼装、逐卡 N+1 `/resolve` 或 CMS 原始字段绕过这些门。

本审计没有发现需要改变 TASK-012 路线方向的 P0/P1/P2；下文“阻断项”是后续候选阶段的进入门，不是本任务已授权的实施或当前产品缺陷修复。

## 2. 当前可复用事实

| 当前事实 | 可复用能力 | 尚未交付 |
|---|---|---|
| TASK-008 | 前端本地、可校验的 Page Schema 3/error 16-Schema `/resolve` 闭包；Page/Product 成功样本 | collection/navigation/route-manifest 的本地快照与运行时消费 |
| TASK-009 | server-only、匿名单次 GET、固定 5000 ms、`no-store`、零重试、类型化错误 | 生产缓存、ISR、Preview、Webhook |
| TASK-010 | 对 unknown 响应做严格运行时校验，返回调用方隔离且深度不可变的真实 wrapper | 产品 DTO、SEO DTO、列表 DTO |
| TASK-011 | 真实 WordPress → Transport → Validator → Adapter → Server Component 的一次请求闭环 | 正式页面、产品组件、SEO、图片、缓存、Preview |
| 当前 App Router | `/` 是静态 foundation placeholder；`/integration/cms` 是 default-off、`noindex` 的动态技术页 | 正式公共路由、全局壳层和视觉系统 |

冻结 Product Schema 已包含 model、productCode、分类/系列/安装类型、规格、Article Number、finish、安装、控制、兼容性、gallery、video、询盘 CTA、五组 relations；download 类型具有公开文件 DTO。Hero、data table 和 CTA 模块也已存在。因此详情纵切有真实合同基础。

但当前 Product collection item 只有 `id/type/title/publicPath`，不含产品卡片常需的图片、型号/产品号或摘要；当前 Page Schema 3 也没有 `seo` 字段。TASK-007 CMS 权威包包含 collection/navigation/route-manifest 合同和 Golden，TASK-008～011 的前端闭包只消费 `/resolve` Page/error。以上差异必须由阶段 1 的证据和合同决策处理。

## 3. 最小真实产品纵向切片

### 3.1 建议最小闭环

1. 一个真实产品分类/系列入口，具有规范 URL 和可验证 collection total。
2. 同页产品卡片，至少表达真实图片、名称、型号/产品号、目标链接和已冻结 CTA 语义。
3. 一个正式产品详情路由，包含 Hero、定位/特性、结构化参数、Article Number/finish/兼容性和媒体。
4. 一个真实公开下载关系或 download 页面，显示文件名、类型、版本/日期和大小。
5. 一个产品询盘 CTA，目标和最低数据合同已由业务确认。
6. 真实 404、空集合、缺媒体/Alt、无下载和 CMS/合同失败状态。
7. 从首模板同时验证 Metadata、canonical、robots、Breadcrumb、允许的 JSON-LD、图片策略和 WCAG 2.2 AA。

阶段 2 建议从阶段 1 的 10～20 个产品中选 2～3 个压力样本：一个规格/Article Number 密集、一个媒体/finish 密集、一个下载/关系密集。它们足以证明视觉与合同；不得把完整筛选、Mega Menu、首页或所有产品迁移塞入该切片。

### 3.2 当前进入阻断

- **产品资料门**：尚无已授权、可公开、版权清晰且字段完整的 10～20 个真实产品包，也未选择 2～3 个纵切样本。
- **IA/转化门**：一级/二级分类、系列关系、URL/slug、页面类型、主辅 CTA 及其数据合同尚未冻结。
- **列表/卡片合同门**：现有 collection reference 不足以支撑有业务辨识度的产品卡片。阶段 1 必须决定并证实最小 normalized card projection；禁止逐卡 `/resolve` 形成 N+1，也禁止读取 raw WordPress/SCF。
- **SEO 合同门**：当前 Page Schema 3 没有 normalized `SeoDocument`。正式模板前必须冻结 title/description/canonical/robots/OG/breadcrumb/JSON-LD 所需来源和缺省规则。
- **媒体门**：生产 HTTPS 媒体 origin、精确 Next Image allowlist、授权/Alt 完整性和部署平台图片优化结果尚未冻结。

## 4. 技术 SEO 从首模板开始

技术 SEO 是正式模板的完成条件，不是所有页面完成后的独立补丁。第一个产品详情和分类模板应同时具有：

- 唯一 title、description、H1；
- 公开站绝对 HTTPS self-canonical；
- `index,follow` 只用于已发布公共页，技术页/Preview/Staging 为 `noindex`；
- 可见 Breadcrumb 与 `BreadcrumbList` 一致；
- OG/Twitter 文本和图片来自同一 normalized authority；
- 仅在可见业务证据成立时输出 `Product`；不得输出虚构价格、评分、库存或评价；
- slug 变化、撤回和删除进入 route-manifest、Sitemap、redirect/404 生命周期。

必须在阶段 1 冻结公开 canonical origin、SEO 字段责任和 fallback。当前 root metadata 与技术页 `noindex` 仅是基础证据，不是正式 SEO 实现。Sitemap/robots 可在正式路由集合存在后完成，但首模板不能先以错误 canonical、重复 metadata 或临时 JSON-LD 上线。

## 5. Preview、缓存、Webhook 与 Staging 的依赖顺序

建议把候选阶段 3 内部冻结为以下顺序：

1. **部署拓扑与 Staging 基座**：目标 Linux/架构、HTTPS、域名、环境/密钥、WordPress 网络、日志、图片 origin 和 Sharp fixture。
2. **Preview**：WordPress capability、短时签名/nonce、最小权限服务账号、Next Draft Mode、`private/no-store/noindex` 和退出流程；只在受保护 Staging 验证。
3. **公开缓存/ISR 与最后成功语义**：定义缓存所有者、tag/path、TTL、构建/运行时失败、显式撤回和无历史缓存时的行为。
4. **Webhook 失效**：在 tag/path 依赖已冻结后实现签名、时间窗、防重放、幂等、有限重试和旧/新路径失效。
5. **联合演练**：publish/update/slug/withdraw/delete、无效 Schema、CMS 断网、Webhook 丢失/重复、多实例一致性和恢复。

Staging 必须先于这些能力的完成声明；Preview 和公开缓存是两条隔离路径，Webhook 依赖缓存/tag 已存在，不能先实现一个没有失效对象的 Webhook。当前 TASK-009 Transport 的 `no-store`、5000 ms 和零重试应保持不变；生产缓存属于验证/Adapter 之后的公开数据或渲染层，不应通过重新开放 Transport 注入参数或重试来实现。

## 6. 最后成功缓存与失败降级

候选缓存任务必须满足：

- 只有通过 Runtime Validator 并完成 normalized Adapter 的结果才能成为新的已知良好版本。
- CMS 断网、超时、429/5xx、非 JSON、未知 Schema 或新内容合同失败，不得用空页、首页、伪 404 或无效新值覆盖旧版本。
- 已有有效公开页时，运行时/再验证失败保留最后成功页面并产生可追踪告警；没有历史成功版本时返回受控 503/错误态。
- 真实未知路径继续是 404；Transport 404 仍需与已验证 error envelope 一致，不能把上游故障降级为 404。
- 显式撤回、删除和 slug 变更是权威生命周期事件，应移除 Sitemap/公开路由并按冻结策略执行 404/410/单跳 redirect；不能无限保留已撤回内容。
- 构建时必需内容不可用应让构建失败，不得生成空站；运行时再验证失败的 stale 行为必须在锁定的 Next.js 16.2.11 和目标部署拓扑上用故障注入证明，不能只引用框架假设。

## 7. WCAG 2.2 AA 与四验收视口

1440、1024、768、390 px 应作为同一真实纵切的验收视口，而不是机械等同于四个 CSS breakpoint。每个视口至少检查布局、图片裁切、参数表、下载、CTA、焦点顺序和横向溢出。

WCAG 2.2 AA 从阶段 2 进入完成定义：

- landmark、标题层级、列表、表格 caption/header 和链接/按钮语义；
- 全键盘操作、可见且不被遮挡的焦点、合理目标尺寸；
- 文本/非文本对比、错误和状态不只依赖颜色；
- 当前语境 Alt；装饰图 `alt=""`，缺失必需 Alt 时 fail closed；
- 200%/400% zoom、reflow、文本间距、reduced motion 和屏幕阅读器人工抽查；
- 自动化 accessibility 检查加人工键盘/读屏检查。

四个截图视口不替代 WCAG 1.4.10 的 320 CSS px reflow 证明；可把 320 px 作为辅助合规测试，但不新增第五个视觉基线视口。

## 8. 产品系统先于正式首页

该顺序正确。产品分类、卡片、详情、规格、下载和询盘会先证明字体层级、容器、按钮、媒体比例、数据密度、错误状态和 CTA。正式首页随后复用这些已验证能力，只新增首页特有编排。

如果首页先行，容易再次使用虚构摘要、临时卡片或未冻结 CTA，且会把产品合同缺口拖到后期。全局 Header/Footer 可在阶段 3 后、完整产品系统前建立，但导航数据必须来自阶段 1 冻结的 IA，不得自动展开全部 taxonomy。

## 9. 部署类型影响

部署类型必须最迟在阶段 2 结束、阶段 3 开始前冻结。

| 部署形态 | Sharp/图片 | ISR/缓存/Webhook | 进入门 |
|---|---|---|---|
| 平台托管/Serverless | 需确认目标运行时支持当前 Next 16.2.11 + Sharp 0.35.3、远程图片和缓存配额 | 必须用平台实际 Data/Full Route Cache 与 tag/path 失效语义验证 | 目标区域、运行时、持久缓存、日志和冷启动实测 |
| 单实例 Node 容器/主机 | Linux 架构与 libc 上 fresh build、optimizer、写目录/缓存容量需通过 | 本地缓存较简单，但单点、滚动发布和持久性需明确 | 镜像、存储、进程恢复、备份和回滚 |
| 多实例自托管 | 每个实例都需一致的 Sharp 二进制和图片缓存策略 | 必须有共享 cache/tag 与 replay state；单实例失效不足以保证一致 | 负载均衡、共享缓存、防重放、滚动发布和跨实例故障演练 |

生产媒体只允许精确 HTTPS host/path。当前 Sharp override 仅在 macOS arm64 通过真实 optimizer fixture，Linux glibc/musl 和其他架构仍是部署门。WebP/AVIF、图片 CDN、optimizer cache 和 HTML CDN 只能在部署方案中冻结；首期应维持单一 HTML 缓存权威，避免 Next、CDN 和图片插件多层改写失效。

## 10. 候选阶段与建议进入门

| 候选阶段 | 建议进入门 | 前端退出证据 |
|---|---|---|
| 1. IA/真实目录/CTA | 合法真实资料和业务责任人到位 | URL/slug/CTA、样本矩阵、产品卡片与 SEO Schema gap 决策 |
| 2. 视觉基线/产品纵切 | 阶段 1 冻结；2～3 个产品的媒体、Alt、规格、下载完整 | 正式 server-only 页面闭环、技术 SEO、四视口、WCAG、图片 fixture |
| 3. Preview/cache/Webhook/Staging | 阶段 2 稳定；部署拓扑、HTTPS Staging、密钥/日志可用 | Preview 隔离、最后成功缓存、签名失效、故障/多实例演练 |
| 4. 全局壳层 | IA/navigation contract 与阶段 3 发布链通过 | Header/Mega Menu/Footer 的受控导航、键盘和四视口 |
| 5. 产品系统 | 纵切和缓存/发布模型已证明 | 全分类/系列/详情、筛选分页、空态/错误态和性能 |
| 6. 正式首页 | 产品系统和全局壳层稳定 | 仅复用已证明组件的首页及首屏性能/SEO |
| 7～9. 其余模板至上线 | 各前置模板/数据/隐私/运维门独立确认 | 模板、询盘/分析、上线硬化的独立证据 |
| 10. 多语言 | 服从独立成熟度与授权门 | 不属于本 frontend 审计的当前实施授权 |

## 11. 建议 Planner 写入权威路线图的边界

1. 保留 10 个候选阶段，但补充“阶段 2 是代表性纵切，阶段 5 是全产品系统扩展”。
2. 将阶段 3 内部依赖写为“部署拓扑与 Staging → Preview → 公开缓存/最后成功 → Webhook → 联合演练”。
3. 明确技术 SEO 从第一张正式产品模板开始，且 normalized SEO contract 是阶段 2 进入门。
4. 明确当前 Transport 保持 `no-store`/零重试；缓存只接纳 validated、adapted 的已知良好数据。
5. 明确 390/768/1024/1440 是验收视口而非断点，另需 320 px reflow 与人工可访问性验证。
6. 明确部署类型在阶段 3 前冻结，Linux Sharp、HTTPS media allowlist、ISR/多实例共享缓存是部署门。

## 12. 证据路径

- `TASKS/ACTIVE/TASK-012-roadmap-reprioritization.md`：结构化理解、候选阶段、进入门与非目标。
- `TASKS/ARCHIVE/TASK-012/OUTPUTS/DESIGN.md`：替代矩阵、失败语义与唯一权威边界。
- `TASKS/ARCHIVE/TASK-012/TASK.md`：任务范围、三 Lane 只读核查和后续文档修订门。
- `docs/architecture/headless-wordpress-nextjs-contract.md` 第 3、5、7、8、9、10、14 节：frontend、API/error、SEO、Preview、cache/Webhook、媒体和待替代旧顺序。
- `TASKS/ARCHIVE/TASK-007/EVIDENCE/A3_FRONTEND_CONSUMER_AUDIT.md` 与 `A3_FRONTEND_CONSUMER_REAUDIT_R2.md`：Schema 3、collection/navigation/route-manifest、benchmark 和消费边界。
- `TASKS/ARTIFACTS/TASK-008/PLANNER_SUMMARY.md`：16-Schema Page/error snapshot 范围。
- `TASKS/ARTIFACTS/TASK-009/PLANNER_SUMMARY.md`：固定 `no-store` Transport 与非目标。
- `TASKS/ARTIFACTS/TASK-010/PLANNER_SUMMARY.md`：Runtime Validator 与 opaque wrapper。
- `TASKS/ARTIFACTS/TASK-011/PLANNER_SUMMARY.md`：真实 server-only 技术纵切与明确未交付项。
- `frontend/README.md`、`frontend/src/app/**`、`frontend/src/lib/cms/**`：当前实现事实。
- `frontend/src/lib/cms/contracts/schemas/page.v3.schema.json`、`collection.v3.schema.json` 的 CMS 权威源及 TASK-007 Product collection Golden：详情与列表合同边界。

## 13. 审计边界

本审计未修改 `frontend/**`、`cms/**`、架构契约、活动任务、Planner 文件、依赖、lockfile、环境或运行状态；未实现页面、缓存、Preview、Webhook、Staging 或部署。结论只为 TASK-012 权威路线图修订提供只读前端证据，不是后续候选任务的执行授权、独立审查、用户验收或 Git 交付。
