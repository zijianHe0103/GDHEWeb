# TASK-012 真实产品优先的实施路线图重排
accepted_at: 2026-07-29T06:52:10Z

task_id: TASK-012
status: CLOSED
owner_lane: planner
assigned_lanes: [executor, wordpress_cms, frontend, localization_seo]
review_lane: adversarial_reviewer
linked_issues: []
artifacts_dir: TASKS/ARTIFACTS/TASK-012
acceptance_state: ACCEPTED
git_status: MERGED
document_impact: RESOLVED
readme_impact: NOT_APPLICABLE
project_type: software
recovery_recorded_at: 2026-07-29T06:48:17Z

## 原始请求

> 我认为这里得出来的思路更为准确，也更为正确。现在请你先理解它所有的描述、内容方向以及方式，然后再按照它的这个任务顺序去逐步推进。可以先把这里的一个整体任务顺序，储存在之前的整体任务流程当中去。

输入依据：

- 用户提供的评估文本：`/Users/arron/.codex/attachments/92859a4d-caa0-47ef-817f-2352f75f44e2/pasted-text.txt`
- 已接受架构契约：`docs/architecture/headless-wordpress-nextjs-contract.md`
- 当前实施事实：TASK-001 至 TASK-011 的正式交付物、Git `main` 与本地 WordPress 运行现场

## 结构化理解

- Headless WordPress + Next.js、WordPress `wp-admin`、SCF、REST-first 与结构化 CMS 方向保持不变，不推倒 TASK-001 至 TASK-011。
- 当前主要风险已经从“技术链路能否工作”转为“真实 GDHE 产品是否适配 CMS、信息架构/URL/CTA 是否正确、编辑/预览/缓存/部署是否能支撑生产”。
- 原路线图中“先做孤立视觉基线，再做真实页面”的顺序被取消；后续视觉系统必须在真实产品分类、产品卡片、产品详情、参数、下载和询盘 CTA 场景中形成。
- RapidDirect 只作为页面节奏、信任、交互、响应式与转化参考；Forest、Silent Gliss 等产品型同业作为目录和技术信息组织参考；GDHE 真实资料是唯一业务内容权威。
- SEO 基础、Preview、缓存/Webhook 和 Staging 必须提前，不再等所有页面完成后集中补做。
- 完整多语言仍在英语站稳定后实施；但固定“三个月”改为以 URL、Schema、Preview、发布流程、内容完整度和目标市场准备度为启动门。任何提前的小型多语言 PoC、WPML/ACFML 采购或安装仍需独立任务和明确授权。
- 本任务只修订权威路线图和决策边界，不导入真实产品、不改 CMS Schema、不实现页面、Preview、缓存、Webhook、SEO、询盘、多语言或部署。

## 目标

- 将用户确认的新方向写入现有整体实施流程，并明确其取代 TASK-005 路线图中哪些后续顺序。
- 将后续主线调整为：真实产品/信息架构/转化基线优先，真实产品纵向切片形成视觉基线，Preview/缓存/Staging 提前，产品系统优先于正式首页。
- 明确 TASK-011 已完成并归档，避免代码事实与治理状态继续分叉。
- 统一 TASK-007 “19-file Schema graph”与 TASK-011 “16 Schema closure”的统计口径。
- 明确任务、Git 和项目状态的事实源边界，降低重复状态维护导致的漂移。
- 记录后续候选阶段的目标、依赖、非目标和进入门；真实产品相关业务规则在用户提供权威资料并逐项确认前不得称为冻结，也不提前创建或实施后续任务。

## 非目标

- 不重新选择 WordPress、Next.js、SCF、REST 或 WPGraphQL。
- 不修改 `frontend/**`、`cms/**`、WordPress 数据库、插件、正式内容或运行配置。
- 不导入 10～20 个真实产品；它属于下一项“英语站信息架构、真实目录与转化基线”任务。
- 不建立设计令牌、组件、产品卡片、产品详情页或首页。
- 不实现 Preview、Draft Mode、ISR、缓存、Webhook、Staging、SEO、询盘、CRM、分析或多语言。
- 不购买或安装 WPML、ACFML 或其他商业插件。
- 不承诺具体部署平台；只把尽早冻结部署类型和建立 Staging 作为后续进入门。
- 不继续扩张 Contract Snapshot、Validator、wrapper 或其他通用底层能力。
- 不提交、推送、合并或部署，除非后续收到正式交付口令。

## 交付物

- 更新 `docs/architecture/headless-wordpress-nextjs-contract.md` 的后续实施顺序，使其成为新路线图权威来源。
- 如需记录对 ADR-004/ADR-005 的实施顺序影响，新增一份窄范围 ADR，并更新 `MEMORY/DECISIONS.md`；不得重写已接受架构本身。
- 在路线图中记录以下候选阶段，不提前建立对应活动任务：
  1. 英语站信息架构、真实目录与转化基线。
  2. 视觉基线与真实产品纵向切片。
  3. Preview、缓存、Webhook 与 Staging。
  4. 全局 Header、受控导航、Mega Menu 与 Footer。
  5. 产品分类、系列与详情系统。
  6. 正式首页。
  7. 其余页面模板。
  8. 询盘、CRM/协作系统、分析和隐私。
  9. 上线加固。
  10. 小型多语言 PoC 与后续完整多语言建设的条件门。
- `TASKS/ARTIFACTS/TASK-012/` 下的路线图差异、冲突处理、执行、验证、审查和 Planner Summary。
- 同步 `PROJECT/STATE.md`、`TASKS/BOARD.md`、`PROJECT/ACTIVITY.md` 和相关 Lane 记录。

## 后续候选阶段的冻结要求

### 阶段 1：英语站信息架构、真实目录与转化基线

- 当前状态为 `TASK012_SCOPE_CONFIRMED_REVIEW_REQUIRED`：用户确认 TASK-012 只收口已确认的业务合同、询价/同步/媒体规则、权威实施路线图和未来进入门；当前测试记录不作为最终生产目录。10～20 个最终生产产品数据验收是正式批量导入、产品模板业务冻结和 Schema 业务冻结前的强制后续门，不是 TASK-012 路线图收口时需要伪造的数据。通过该门前不得批量发布正式产品或声称 Schema 业务冻结。下一步仅为 fresh validation 和当前修订版独立对抗审查。TASK-007 Schema 3 仍只是技术合同基线。
- 样本必须覆盖：普通手动轨道、电动轨道、医用轨道、S-fold/Ripplefold、罗马杆或特殊系统、顶装/墙装、多长度/颜色/表面处理、主产品/配件/备件/套装、电机/遥控/控制协议/兼容关系、多份安装说明/型录/技术图纸，以及停产/替代/升级型号。
- 必须基于真实样本确认：产品与变体、型号与 Article Number、配件角色、各产品实际所属系列和应用、技术参数单位/排序/分组、下载版本/语言/失效替换、公开与内部字段、MOQ/包装/交期/OEM/ODM/样品，以及 Excel 批量导入和更新。
- 已确认主转化路径为 B2B quotation request：用户选择型号、规格、配件等必要选项后索取报价；网站不提供直接下单、购物车结算或在线支付。可独立询价的配件可以脱离主产品进入报价请求。
- 已确认配件页面身份按产品类型处理：同款同型号且出厂配套的电机与遥控器共用一个组合页面；布带、transparent tape、线珠等独立大类建立类型页；封口、走珠、顶码和墙码等只作为相关配件。类型页下展示真实规格，不为每个规格单独建页。
- 已确认方案 A：飞书多维表格持续作为型号、Article Number、规格和可用状态的结构化产品主数据权威；WordPress 负责营销文案、SEO、公开媒体和页面编排。产品主数据只从飞书单向流向网站侧；客户提交 quotation request 后在飞书新增记录，由业务员在飞书完成报价。
- 已确认飞书主数据字段在 `wp-admin` 中可见但只读，只能在飞书修改；产品介绍、SEO、公开图片和页面模块继续在 `wp-admin` 编辑。产品读取拓扑冻结为“飞书产品主数据 → 受控同步 → WordPress 只读镜像 → GDHE REST API → Next.js”；公开页面不逐请求直连飞书，quotation request 通过独立受控入口写入飞书。
- 已确认成本、采购价、内部销售底价、利润/利润率、供应商信息、库存数据和客户专属报价仅保存在飞书，绝不进入 WordPress、GDHE REST API、Next.js、公开缓存或应用日志；未来产品同步采用公开字段白名单，而不是“同步后隐藏”。
- 已确认内部备注和业务审核记录同样只保存在飞书，不进入网站同步；WordPress 只保留自身对公开文案、SEO、图片和页面模块的编辑修订历史，不复制飞书业务审核记录。
- 已确认第一批公开产品字段白名单：产品名称、型号、Article Number、真实可选规格、尺寸、颜色、表面处理、技术参数、安装方式、兼容关系、在售/停产状态、产品图片和当前有效资料。白名单字段仍须通过记录发布资格、数据校验和 WordPress 发布状态门。
- 已确认 B2B 信息粒度和编辑权威：MOQ 不在官网特别展示，如内部需要只留飞书；整柜交期公开口径为“收到客户定金，并确认订单、包装和生产资料后，通常为 `30–40 天`”；包装材料选项按产品类别维护且每类相对固定；所有产品均可提供样品；公司可提供 OEM 和 ODM。包装、交期、样品和 OEM/ODM 全部由 WordPress 维护，不进入飞书产品主数据同步。当前已知产品类别的包装合同已完整确认，真实记录分配留待代表产品核对。
- 用户提供的飞书字段截图与说明已确认六个轨道包装相关来源标签及业务含义：常规、纸盒、打字（客户 Logo 印刷）、套袋、大收缩膜、对扣。轨道包装完整基数规则已确认：基础包装必须三选一；Logo 印刷可选；保护/排列方式可不选，选择时套袋/对扣二选一。真实记录分配仍待代表产品核对。
- 已确认布带和用户所称“线珠”不适用上述轨道包装合同：官网只展示纸箱常规包装；特殊组合包装不公开、不作为 RFQ 自助选项，由业务员针对已有需求单独提供。同名“常规包装”必须按产品类别区分，不能合并成全局选项。
- 已确认同款、同型号且出厂配套的电机和遥控器采用固定纸箱包装；官网只展示固定包装说明，不向客户提供包装选择。
- 已确认封口、走珠、顶码、墙码等小型相关配件同样采用固定纸箱包装；官网不提供包装选择。
- 已确认产品领域统一使用“配件”角色，不区分“备件”或“套装成员”；使用可筛选的“配件类别”组织顶码、墙码、走珠、封口、布带、线珠等类别。配件类别不决定页面身份，独立详情页与相关配件展示仍按已确认的混合公开规则处理。用户确认“强码”是“墙码”的笔误，系统只保留“墙码”规范类别。
- 已确认配件类别基数为多对一：每个具体配件必须且只能属于一个配件类别，同一 Article Number 不得同时归入多个类别；一个类别可以包含多个配件。
- 已确认配件不强制“一件一个独立型号”。布带按“型号 → 多个规格/Article Number”组织：型号由颜色和钉子材质共同决定；同一型号下宽度、钉距、长度不同会产生独立 Article Number。宽度和钉距统一使用毫米（mm），长度使用米（m）；钉距包含 170mm 及更多值，长度包括 30m、40m、50m、60m 等。封口、顶码、吊码、走珠等其他配件通常同时有型号和 Article Number，但不能把“通常”写成全局强制。
- 已确认线珠型号由颜色和具体珠型共同决定。珠型包括尚飞大方珠系列的单扣、双扣、大圆扣，以及用户所称佳丽斯中方珠/珠系列的单扣佳丽斯中方珠、双扣佳丽斯中方珠、小圆扣佳丽斯珠。常见珠距为 6cm、6.6cm、7cm、8cm、10.2cm；10.2cm 只记录为双扣常见值，不设排他约束。珠距和卷长共同确定具体规格；任一变化都产生独立 Article Number，但不改变型号。
- 已确认电机与遥控器共用一个产品页面，但分别保留各自全公司唯一的 Article Number，不创建额外组合 Article Number。客户可以只选择电机、只选择遥控器或同时选择两者，并分别填写可以不同的数量。
- 已确认飞书必须具有显式的网站发布资格；只有业务方标记为“允许发布”、Article Number 有效且对应真实存在规格的记录才进入同步范围，其他记录默认排除。该字段尚未在真实 Base 中创建。
- 已确认发布生命周期采用“首次审核、存量自动、重大变更例外审核”：首次同步创建 WordPress 草稿并人工发布；已发布产品普通主数据变更通过校验后自动同步且保持公开；Article Number、型号归属、记录删除和撤销发布资格不自动覆盖或下线；校验失败保留最后成功数据。
- 已确认停产产品保留原 URL 和公开页面，标记 `Discontinued`；有替代型号时展示替代产品链接；常规询价 CTA 改为 `Contact Us for Replacement`，不因停产直接删除页面。
- 已确认产品与产品系列、产品与应用场景均为多对多关系；多个系列或应用入口指向同一产品身份和 canonical 详情页，不复制产品记录、规格或 Article Number。
- 已确认技术参数按分组、名称、值、单位和显示顺序结构化保存；第一阶段统一使用公制单位，不按市场自动换算英制。
- 已确认网站内容层只保存当前有效产品资料；当前文件记录类型、版本号、语言和生效日期，可关联多个产品；失效旧版本只在极空间归档，不在 WordPress、飞书网站镜像或公开媒体中重复保存。
- 冻结一级/二级导航、URL Map、Slug 规则、页面类型、访客类型、主/辅 CTA、首页模块、产品详情内容、SEO 字段、内容责任人和素材缺口。
- 输出 CMS Schema 缺口报告；未经证据不得直接改 Schema。
- 在真实样本、业务规则和必要 Schema 修订完成确认前，Header、URL、产品模板和 SEO 保持阻塞。

### 阶段 2：视觉基线与真实产品纵向切片

- 设计令牌和基础组件必须由真实产品分类、产品卡片、详情 Hero、技术参数、下载资料和产品询盘 CTA 共同验证。
- 从真实 WordPress 内容贯通至正式 Next.js 页面，不使用孤立 `/foundation/ui` 作为唯一验收。
- 1440、1024、768、390 是验收视口，不强制等同于四个 CSS 断点。
- WCAG 2.2 AA 基础、键盘、焦点、Alt、图片比例与加载策略进入验收。

### 阶段 3：Preview、缓存、Webhook 与 Staging

- 建立签名 Preview、Next.js Draft Mode、`noindex/no-store` 草稿读取。
- 冻结公开缓存/ISR、tag/path 失效、内容校验失败不覆盖旧缓存、CMS 故障保留最后成功页面、删除/重定向策略。
- 尽早在目标 Staging 类型验证 Linux 构建、Sharp、图片域名、HTTPS、环境变量、日志和 WordPress 网络连接。

### 阶段 4 至阶段 10

- 信息架构冻结后才开发受控导航、Mega Menu、Header 和 Footer；不得自动展开全部 taxonomy。
- 产品系统先于正式首页；首页复用已经被产品页面证明的组件。
- 技术 SEO 从第一张正式页面开始，内容 SEO 持续迭代。
- 询盘主语义已确认为 B2B quotation request；英语站统一主询价 CTA 为 `Request a Quote`，停产产品继续使用 `Contact Us for Replacement`。正常产品先加入可继续添加多个产品的询价清单，最后统一填写联系信息并一次提交；重复行处理和最小数据合同继续逐项确认，复杂表单/上传/CRM 在独立任务实施。
- 已确认所有加入 quotation request 的产品和配件 RFQ 行项目都必须填写数量；未填写数量的行项目不能提交。官网数量单位固定为轨道按“支”、布带和线珠按“卷”、电机、遥控器及其他配件按“个”。长度换算字段按 Article Number 保存在飞书产品主数据中；飞书报价系统只读取所选 Article Number 及数量并计算总长度和包装件数，该计算不属于官网实现范围。系统统一使用 `Article Number`，不创建 `Part Number` 字段或别名。
- 已确认所有官网 RFQ 行项目的数量只能是大于零的整数，最小值为 `1`；空值、`0`、负数和小数均无效。
- 已确认询价清单按 `Article Number + 完整公开配置` 识别行项目：相同 Article Number 且全部配置相同则合并并累加数量；任一配置不同则保留独立行。
- 完整多语言不再仅按日历等待；必须满足明确产品与发布成熟度门。任何早期 PoC 不等于购买、上线或生成未审核公开语言页面。

## 验收标准

- 权威路线图明确声明 TASK-001 至 TASK-011 保留，不进行架构回退。
- 旧的“孤立 UI 基线先行”顺序被明确取代，新的真实产品优先顺序只有一处权威定义。
- 路线图明确产品系统先于正式首页，Preview/缓存/Webhook/Staging 和技术 SEO 被提前。
- 路线图明确 RapidDirect、产品型同业参考与 GDHE 内容权威的不同职责。
- 路线图明确主 CTA 需在 Header/Hero/产品模板之前冻结，且不机械复制 RapidDirect 的 Instant Quote。
- 路线图明确 TASK-007 真实产品压力验证所需的 10～20 个样本与关键边界。
- 路线图说明 19 是 TASK-007 CMS 侧完整 transitive Schema graph 文件数，16 是 TASK-008/010/011 前端 `/resolve` 本地闭包数量；不存在合同丢失的含义。
- 路线图明确 Git commit/远端分支是代码交付事实，`TASKS/BOARD.md` 是任务状态视图，`PROJECT/STATE.md` 只记录当前总体状态；不得复制每项任务全部历史。
- TASK-011 在项目状态、任务板、归档索引和任务文件中一致为 `CLOSED / ACCEPTED / MERGED`。
- 截图和证据引用使用仓库相对路径；不得把 `/Users/...` 绝对路径写入新的权威路线图。
- 多语言触发门的新表述与旧的固定三个月规则之间的替代关系清楚；本任务不采购、不安装、不执行 PoC。
- 不修改产品代码、运行环境、CMS 数据库、依赖或 lockfile。
- 文档链接、Markdown、治理、Lane、消息、Git scope 和 `git diff --check` 全部通过。
- 独立 adversarial review 最终为 PASS，P0/P1/P2 均为 0。

## 允许修改范围

- `docs/architecture/headless-wordpress-nextjs-contract.md`
- `MEMORY/DECISIONS.md`
- 如确有必要，`MEMORY/DECISIONS/ADR-006-*.md`
- `PROJECT/STATE.md`
- `PROJECT/ACTIVITY.md`
- `TASKS/BOARD.md`
- `TASKS/ACTIVE/TASK-012-roadmap-reprioritization.md`
- `TASKS/ARTIFACTS/TASK-012/**`
- `TASKS/ARCHIVE/INDEX.md`
- `TASKS/ARCHIVE/TASK-011-minimal-cms-integration-page.md`
- `LANES/planner/**`
- `LANES/executor/**`
- `LANES/wordpress_cms/**`
- `LANES/frontend/**`
- `LANES/localization_seo/**`
- `LANES/adversarial_reviewer/**`
- 当前任务所需的 `LANES/registry/events.jsonl` 与 `LANES/messages/**`

## 禁止修改范围

- `frontend/**`
- `cms/**`
- `.local/**`
- WordPress 数据库、插件状态、内容、用户、凭据和运行配置
- `frontend/package.json`、`frontend/package-lock.json`
- 生产、Staging、域名、GitHub 配置或外部 SaaS
- 用户提供的附件原文件

## 约束与假设

- 当前指令被理解为：评估文本的总体方向取代原 TASK-012 候选，而不是推翻已接受架构。
- 评估文本中的外部事实和版本化官方行为在实施时必须重新核实；本次 intake 不把其链接或表述直接当作已验证项目事实。
- “Silent Gliss 等同业参考”只进入候选研究范围，不自动成为需要复制的网站。
- 后续真实产品任务需要用户或业务方提供可合法使用的 GDHE 产品资料；资料不足时必须输出缺口，不用虚构内容填充。
- 主转化动作已确认为 B2B quotation request，不在线下单或支付；英语站统一主 CTA 为 `Request a Quote`，点击后先加入多产品询价清单，最后统一填写联系信息并提交。辅助 CTA 和重复行处理仍需后续逐项确认。
- 早期多语言 PoC 若需要商业许可证、真实译文或外部服务，必须单独确认权限、采购和范围。

## 验证计划

1. 对照现有架构契约第 14 节、ADR-003/004/005 与 TASK-005 边界，建立逐条替代/保留矩阵。
2. 只读核对 TASK-007 Schema graph、TASK-008 snapshot closure 和 TASK-011 验证口径，形成 19/16 解释证据。
3. 更新唯一权威实施顺序，并检查是否存在相互冲突的旧“下一步”表述。
4. 由 wordpress_cms、frontend、localization_seo Lane 对各自后续阶段做只读可实施性检查；不得修改产品代码。
5. 运行 Markdown/链接/绝对路径、项目状态一致性、受保护范围、Git diff 和 DPG 治理校验。
6. 由 adversarial_reviewer 独立挑战真实产品依赖、SEO/Preview/缓存前置、部署与多语言门是否存在遗漏或冲突。

## 文档影响

`RESOLVED`（需求阶段）：本任务本身只修改权威路线图、决策边界与治理状态。实施完成后仍需以实际差异和审查确认是否保持 `RESOLVED`。

## README 影响

`NOT_APPLICABLE`：本任务不改变当前已交付产品的运行或使用方式，只改变未来实施顺序。如执行中发现 README 存在把旧路线写成当前使用流程的内容，应停止并重新判断为 `UPDATED`。

## 分支和 Worktree

- 分支：`codex/TASK-012-roadmap-reprioritization`
- Worktree：当前共享项目工作区
- 基线：本地与远端 `main` 的 TASK-011 正式提交 `90e6deaadc05c85df51a56bec4062b657ba65917`

## 当前状态

`ACCEPTED / ACCEPTED / FORMAL_COMMIT_PENDING`。用户于 2026-07-29T06:52:10Z 使用精确口令正式验收 TASK-012。追加独立 closure review 为 `PASS / P0=0 / P1=0 / P2=0`，Planner fresh final validation 和 checked acceptance preparation 全部通过。当前只执行正式提交、任务分支推送、合并 `main` 与推送 `main`。

2026-07-26T04:55:36Z scope recovery：Executor 的第一次 `apply_patch` 被 Hook 安全拒绝，因为任务允许范围与注册表范围不一致；未产生权威文件改动。Planner 临时授予仅限 TASK-012 的三个精确权威文档范围。

2026-07-26T05:05:48Z scope rollback：受控 execution response 已投递并 ACK；三个临时范围已从 registry、executor `LANE.md` 和渲染视图全部收回，strict lane audit 通过。

2026-07-26T05:20:17Z review recovery：`task_transition.py reopen` 因 helper 只接受 `AWAITING_USER` 而安全拒绝且无 mutation；未伪造中间验收状态，Planner 按项目既有受控先例将真实状态从 `UNDER_REVIEW` 同步为 `NEEDS_REVISION`。

## 下一步

执行正式 Git 交付：提交并推送 `codex/TASK-012-roadmap-reprioritization`，随后合并并推送 `main`。不得开始下一任务或业务实施。

## Adversarial Review

Round 1：`FAIL / P0=0 / P1=2 / P2=0`。Round 2：`PASS / P0=0 / P1=0 / P2=0`，只对 2026-07-26T05:31:03Z 的旧版路线范围有效。用户随后补充了未满足的真实产品确认要求，因此该 PASS 保留为历史证据，但不是当前修订版的 final verdict；新修订完成后仍需独立复核。

## Validation Evidence

此前 Planner validation 证明 Schema `19/16`、A3/manifest hash 与 byte parity、端点源码/Preview absence、受保护范围和治理检查通过；它没有使用 GDHE 真实产品验证产品模型。当前修订版 fresh validation 已通过：Schema contract、受保护范围、Markdown 本地链接、绝对路径、`git diff --check`、project/registry/messages 和 strict lane audit 均 PASS；详见 `TASKS/ARTIFACTS/TASK-012/REAL_PRODUCT_VALIDATION_GATE.md` 与 `TASKS/ARTIFACTS/TASK-012/TEST_OR_VALIDATION_LOG.md`。

## Recovery Entry 2026-07-26T05:20:17Z

- Reason: Round 1 adversarial review found two P1 documentation contradictions: four accepted TASK-007 endpoints were labeled unimplemented, and the multilingual PoC entry gate required its own compatibility output.
- Next step: Revise only those two authority-document boundaries, run fresh validation, then dispatch Round 2.

## Review Recovery Entry 2026-07-26T05:31:03Z

- Result: Round 2 final PASS, P0=0, P1=0, P2=0; both Round 1 P1 findings are closed.
- Next step: Planner final fresh validation and checked prepare-awaiting-user only.

## Lane Plan

| lane | responsibility | write_scope | expected_artifacts | status |
|---|---|---|---|---|
| planner | 冻结新顺序、处理与既有 ADR/路线图的替代关系、维护门禁并最终综合 | `PROJECT/**`、`TASKS/**`、`MEMORY/**`、`LANES/planner/**` | replacement matrix、task state、Planner Summary | ACCEPTED; FORMAL_GIT_DELIVERY_IN_PROGRESS |
| executor | 需求确认后窄改权威路线图和必要 ADR，不改产品代码 | `docs/architecture/headless-wordpress-nextjs-contract.md`、必要 `MEMORY/DECISIONS/**`、TASK-012 artifacts、lane records | roadmap diff、execution report | COMPLETE; response ACKed; temporary scope rolled back |
| wordpress_cms | 只读核查真实产品验证、Preview/Webhook 与 Schema 统计边界是否可实施 | TASK-012 artifacts、lane records | CMS feasibility audit | COMPLETE; response ACKed |
| frontend | 只读核查真实产品纵切、SEO/cache/Staging 与视觉阶段依赖 | TASK-012 artifacts、lane records | frontend feasibility audit | COMPLETE; response ACKed |
| localization_seo | 只读核查技术 SEO 前置和多语言 PoC/完整发布门 | TASK-012 artifacts、lane records | SEO/localization boundary audit | COMPLETE; response ACKed |
| adversarial_reviewer | 对业务交付物只读，挑战顺序、冲突、遗漏和证据 | canonical review report、reviewer lane records | PASS/FAIL/P0/P1/P2 report | PASS; P0=0 P1=0 P2=0 |

## Recovery Entry 2026-07-26T05:35:32Z

- Reason: Synchronize Board and human-readable current-state narratives after the checked AWAITING_USER transition; no roadmap, review, validation or product change.
- Next step: Update only the current acceptance-view narratives, rerun final governance checks, then execute checked prepare-awaiting-user again.

## Recovery Entry 2026-07-26T09:25:50Z

- Reason: User identified that TASK-012 did not confirm the real GDHE product cohort or the product/variant/Article Number/accessory/document/B2B/import business rules before treating the product-validation gate as sufficiently frozen.
- Next step: Separate confirmed roadmap direction from unconfirmed real-product business decisions; record a human-required real-product validation gate and request the authoritative 10-20 product cohort/source materials before any Schema business freeze or downstream Header, URL, product template, and SEO assumptions.

## Recovery Entry 2026-07-29T06:48:17Z

- Reason: Synchronize human-readable current-state narratives after successful checked prepare; review, validation and business deliverables are unchanged.
- Next step: Update only current acceptance-view narratives, rerun governance validation, then execute checked prepare-awaiting-user again.
