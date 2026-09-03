# GDHE Core Database Architecture

status: accepted
implementation_status: not_implemented
authority_scope: TASK-035 phase-one database skeleton and database evolution baseline

## 1. 文档定位

本文档冻结 GDHE 第一阶段官网纵向链路所需的核心数据库骨架、长期关系和数据库演进原则。它是架构权威，不是数据库已经实施的证明，也不批准创建 PostgreSQL、Drizzle Schema、Migration、NestJS 模块或迁移现有数据。

后续任何物理数据库变更必须通过独立专项任务更新当前权威，并经过候选 SQL 审查、真实 PostgreSQL 验证和正式验收。

## 2. 设计目标与第一性原理

第一阶段只支撑以下完整链路：

```text
一个 Manual Track Product
→ WordPress 编辑产品详情页
→ WordPress 发布正式页面版本
→ Core Application 组合页面与产品事实
→ Next.js 展示
→ 客户选择公开颜色、长度、数量和商业要求
→ 提交 RFQ
→ PostgreSQL 保存原始询价
```

设计遵守以下判断标准：

- 只建立这条链路实际使用的结构；
- 正式业务事实只有一个权威来源；
- 关系型主干和可查询事实使用关系型列与约束；
- 只有受控、整体版本化的文档或历史快照使用 JSONB；
- 原始客户事实与后续销售确认事实分离；
- 数据访问工具不得迫使业务模型削弱 PostgreSQL 约束；
- 现有 WordPress、Next.js 与 MySQL RFQ 只作为迁移资产保留，不能反向定义目标模型。

第一阶段不包括销售确认重量、Product Spec 或 Article Number 解析、自动报价、ERP 下单、生产、库存、成本、完整 CRM、飞书同步和布带纵向链路。

## 3. 第一阶段实际表范围

第一阶段目标骨架仅包含：

```text
site.sites

catalog.categories
catalog.products
catalog.colors
catalog.product_colors
catalog.track_products
catalog.track_standard_lengths

publication.pages
publication.page_versions

rfq.requests
rfq.request_lines
rfq.idempotency_records
```

本任务只记录这些目标表，不创建它们。

以下结构明确后置，而不是被否定：

```text
catalog.product_specs
catalog.track_weight_options
catalog.track_product_specs

catalog.tape_products
catalog.tape_nail_types
catalog.tape_engineering_specs
catalog.tape_product_specs

audit.*
integration.*
crm.*
erp.*
```

## 4. Site 业务域

`site.sites` 表示平台中的稳定网站身份。第一阶段只有当前 GDHE 官网一条记录，至少需要表达稳定 Site ID、稳定 Site Key 和当前状态；具体字段名、主键类型、域名、品牌、多语言和部署配置尚未冻结。

`publication.pages.site_id` 和 `rfq.requests.site_id` 引用该实体。正式页面与 RFQ 必须明确所属网站，不能在多个表中重复硬编码 `gdhe`。

## 5. Catalog 第一阶段结构

### 5.1 categories

`catalog.categories` 第一阶段只支持层级分类。当前路径为 `Curtain Tracks > Manual Tracks`。Product 只绑定一个 Primary Category；多对多分类、多分类排序、多网站映射、分类版本和继承均后置。

### 5.2 products

`catalog.products` 保存跨系统共用的产品款式身份和最小公共事实。逻辑上表达 Core Product ID、`family_code`、型号、中英文品名、Primary Category、状态和时间信息；具体字段类型、ID 方案、状态值和型号唯一性未冻结。

Core Product ID 是 WordPress、Next.js、Core Application 及未来 CRM/ERP 识别同一 Product 的稳定技术身份。型号、名称、Slug、WordPress Post ID 和 Article Number 均不能替代它。

`family_code` 决定 Product 使用哪一种品类专属结构，例如 track、tape、motor 或 accessory；它与网站 Category 不同。

products 不保存品类专属规格、Article Number、WordPress 营销内容、SEO、库存、成本或生产流水，也不得增加用于容纳所有未来规格的万能 `technical_data` JSONB。

### 5.3 colors 与 product_colors

`catalog.colors` 是跨产品共享的颜色字典，逻辑上包含稳定 Color ID、code、中英文名称和状态。显示名称不是稳定关联键。

`catalog.product_colors` 表示 Product 支持的颜色、当前是否允许公开选择、状态和展示顺序。第一阶段不增加 `is_orderable`。停止公开颜色时优先改变公开状态，不删除具有历史意义的关系。

Product Allowed Configuration 与未来 Product Spec 的颜色事实必须分开：前者表示原则上允许选择，后者表示某个 Article Number 实际使用的颜色。

### 5.4 track_products

`catalog.track_products` 是 Product 的轨道品类子表，`product_id` 同时为主键和指向 `catalog.products.id` 的外键。它保存当前官网需要的轨道 Product 级事实和公开配置能力，例如截面事实、是否允许定制长度和数量单位；具体完整字段清单不在本任务冻结。

它不保存 Article Number、Product Spec、销售确认重量、报价、包装要求、ERP 库存与生产数据或 WordPress 页面文案。现有 WordPress Product Details 只能用于字段盘点，不能原样复制。

### 5.5 track_standard_lengths

`catalog.track_standard_lengths` 保存 Manual Track 当前通用标准长度及展示顺序和状态：

- 4300 mm；
- 5800 mm；
- 6000 mm；
- 6300 mm；
- 6700 mm。

第一阶段不建立 Length Policy、Policy Version、继承、覆盖、条件规则引擎或 Product 专属例外系统。只有真实产品证明存在例外时，才通过后续任务增加 Product 与标准长度之间的关系。

## 6. Product Spec 与未来 ERP 的长期关系

Product 表示官网产品款式；Product Spec 表示 ERP、报价、订单和生产能够唯一识别的具体成品。Article Number 属于 Product Spec，不属于 Product。

长期关系为：

```text
Product → Product Spec → 品类专属 Product Spec
```

轨道具体成品的业务身份由 Product、Nominal Weight、Color 和 Finished Length 共同形成，并对应一个 Article Number。未来 `catalog.product_specs` 只保存跨产品族的具体成品身份和所属 Product，不复制型号、名称、Category、图片、页面、SEO 或完整 Product 事实。

轨道重量属于销售确认和 ERP 使用的工程规格。`catalog.track_weight_options` 与 `catalog.track_product_specs` 第一阶段不创建；未来需要通过必要的复合唯一约束和复合外键保证 Product、Weight Option、Color 和 Product Spec 属于同一 Product。

Product Spec 只为旧 ERP 已存在、实际使用、正式投产或正式分配 Article Number 的组合创建，不预生成理论笛卡尔积。官网自定义长度 RFQ 不创建 Product Spec。

布带已经证明产品族必须使用并联的专属规格结构。其长期规格包括宽度、钉距、钉子种类、厚度、颜色和卷长，但最终表名、工程规格分层、复合外键、卷长单位、状态和唯一约束继续后置。不得用万能 JSONB 或 EAV 保存影响 Article Number、报价和生产的布带规格。

## 7. Publication 结构

WordPress 保存草稿、Gutenberg 编辑状态、WordPress 修订和未正式发布内容。PostgreSQL 保存 Core Application 接受的不可变正式发布版本、当前正式版本和当前公开路径。

### 7.1 pages

`publication.pages` 保存稳定 Page 身份与当前发布状态，逻辑上表达 Page ID、site、page kind、Primary Product、来源系统、来源记录、当前发布版本、当前路径和时间信息；具体类型未冻结。

第一阶段必须保存稳定 WordPress 来源身份，并在逻辑上保证 `site_id + source_system + source_record_id` 唯一。它决定同一 WordPress 页面再次发布时是增加版本还是创建新 Page，Core Application 不得扫描 Page Version 历史猜测页面身份。

`page_kind` 第一阶段只覆盖必要的 product、standard、article 和 resource 类型，不提前建立完整体系。`primary_product_id` 绑定 Product，不绑定 Product Spec，普通页面可为空。

`current_published_version_id` 为空表示当前未公开；它必须指向同一 Page 的 Page Version。该不变量优先由数据库结构保证，必要时使用自定义 SQL Migration。`current_path` 在同一 Site 内逻辑唯一，完整多语言路由结构后置。

### 7.2 page_versions

`publication.page_versions` 保存不可变正式发布版本，逻辑上表达 Page、版本号、稳定来源版本身份、路径、文档 Schema Version、受控 `published_document`、来源发布时间及必要元数据。

`page_id + source_version_key` 逻辑唯一，用于防止同一 WordPress 正式修订重复投递。source version key 的具体来源由未来 WordPress Bridge 任务确定。

`published_document` 可保存页面模块、营销文案、SEO、展示覆盖、营销媒体引用、基准媒体选择、相关产品展示、CTA、FAQ 和页面级设置。它不得保存 WordPress 原始 Post、ACF/Gutenberg 原始数据库结构、Shortcode、插件内部数据、完整 Catalog Product、Product Spec 或 Article Number。

公开视图始终由当前 Page Version 与当前公开 Catalog Facts 组合。Page Version 不复制正式产品名称、当前技术参数、允许颜色、标准长度、Product Spec 或 Article Number。

### 7.3 发布、回滚与取消发布

一次正式发布在同一 PostgreSQL 事务中验证 Page 来源、来源版本、Primary Product 和发布文档，创建不可变 Page Version，并切换当前版本和路径；任一步骤失败整体回滚，不破坏现有正式页面。Audit 表尚未设计，不是当前已确认步骤。

回滚只切换当前版本指针并恢复该版本路径，不修改或删除历史版本，也不回滚 Catalog 当前事实。取消发布将当前版本和路径置空，历史版本保留。

第一阶段不建立 routes、redirects、page module/SEO/media 分表、通用 Page Product Reference Index、多语言路由子系统或 Event Sourcing。

## 8. RFQ 结构

### 8.1 requests

`rfq.requests` 保存整张原始询价 Header，逻辑上表达 RFQ ID、公开 reference、Site、locale、contract version、当前合同确定的十个客户与公司字段、intent、message、source channel 和提交时间。

十个客户字段使用普通关系型列，便于查询、筛选、CRM 转化和分析，不整体塞入 customer JSONB。第一阶段不创建 CRM Account/Contact，也不因邮箱相同自动合并客户。

### 8.2 request_lines 与 line_snapshot

`rfq.request_lines` 保存每个客户产品需求。关系型主干表达 Line ID、Request、line number、Product、正整数 quantity、quantity unit、适用时的 source Page、snapshot Schema Version、单一 `line_snapshot` 和时间信息。

数据库必须保证 Request、Product 的真实外键，适用时 Source Page 外键，`quantity > 0`，以及 `request_id + line_number` 唯一。

第一阶段使用一个不可变 `line_snapshot`，而不是三个独立 JSONB。其内部逻辑区分 `productDisplaySnapshot`、`requestedConfiguration`、`commercialRequirements`、`sourcePath` 和 `customerLineNote`。

line snapshot 必须由 NestJS 在 Catalog 校验后生成，不能直接保存浏览器原始 Payload；只保留客户提交时必要的有限显示事实，不包含完整 Catalog、Product Spec、Article Number、重量、报价、成本、库存或生产信息。

原始 RFQ 保存客户最初事实。销售后续确认重量、Product Spec、Article Number 或报价时必须创建独立销售或报价记录，不得覆盖原始 RFQ；这些后续表不在本任务设计。

### 8.3 原子提交与幂等

整张 RFQ 的幂等处理、request、全部 lines、服务端快照和可重放成功回执必须在同一 PostgreSQL 事务中提交。任一 Line 无效则整体回滚，不允许部分保存 Basket。

`rfq.idempotency_records` 只负责防止同一请求重复创建、检测同 key 不同 Payload、关联 RFQ，并保存可重放公开响应。逻辑上表达 scope、key、request hash、request、响应 Schema Version、状态、受控 response document、创建和过期时间；`scope + idempotency_key` 唯一。

目标 PostgreSQL 幂等表不复制当前 MySQL RFQ Intake 的外部 Stub Sink 状态机，包括 resolving、delivery pending/indeterminate、attempt count 或 row version 状态矩阵。飞书、邮件和 CRM 的未来异步状态属于 Integration/Outbox 领域，不属于 RFQ 幂等记录。

## 9. JSONB、数值与单位

第一阶段 JSONB 只用于：

- `publication.page_versions.published_document`；
- `rfq.request_lines.line_snapshot`；
- `rfq.idempotency_records.response_document`。

这些文档由服务端生成或规范化、写入前通过运行时合同校验，并由相邻普通列保存明确 Schema Version。不得用 JSONB 保存 Product、Spec、Article Number、颜色关系、工程规格、报价、生产、库存或成本。第一阶段不默认增加 GIN Index、数据库 JSON Schema 扩展、JSONB Trigger 或通用 JSON 验证框架。

精确匹配、唯一性和金额不得使用浮点数。轨道长度用 mm 整数、轨道米重用 g/m 整数、数量用整数、时间用 `timestamptz`，未来金额用 `numeric/decimal`；其他产品族按真实精度选择整数最小单位，不机械规定所有长度一律使用毫米。

## 10. 数据访问工具基线

Drizzle ORM 是第一阶段条件性首选。数据库实施前必须通过一次最小 PostgreSQL 兼容性验证；通过后采用，不再泛化选型。只有多 Schema、复合外键、自定义 SQL Migration、事务或 Schema/Migration 一致性出现明确可复现失败，才能重新提交工具选择。

PostgreSQL Driver 第一阶段优先 `node-postgres`，但不是不可替换的长期硬约束。一个事务内所有查询必须使用同一事务连接上下文。

不得引入通用 Repository/Base CRUD/Universal Entity/Universal Mapper/Unit of Work、第三方通用 NestJS Drizzle 框架或 CRUD Generator。业务模块只建立聚焦的数据操作。

## 11. Drizzle 最小兼容性验证

后续独立任务至少验证：多 PostgreSQL Schema；主键、唯一与复合唯一；复合外键；CHECK；JSONB；Page 当前版本属于同一 Page；多表事务回滚；并发 RFQ 幂等；Drizzle Kit 候选 SQL；自定义 SQL Migration；空库初始化；上一版本升级。

若 Drizzle Kit 无法正确生成约束，应保留正确数据库模型并使用自定义 SQL Migration，不得删除约束、把核心规格改成 JSONB 或修改业务模型迁就 ORM。验证通过后不增加 Schema/Migration Hash、Baseline、Freeze Contract 或自定义 Migration Framework。

## 12. Migration 基线

正式流程为：

```text
修改 Drizzle Schema
→ 生成候选 SQL Migration
→ 人工审查 SQL
→ 必要时补充 Custom SQL Migration
→ 空库执行
→ 从上一版本升级执行
→ 验证约束和事务
→ 提交 Schema 与 Migration
→ 部署阶段独立执行 Migration
→ 再启动或切换应用版本
```

候选 SQL 必须检查错误 rename、数据删除、NOT NULL/UNIQUE 与旧数据冲突、外键、回填顺序、类型转换和锁表风险。共享开发、Staging 与 Production 禁止用 `drizzle-kit push` 作为正式变更；普通 NestJS 启动不得自动迁移；已进入共享环境的 Migration 不得修改，只能新增修正 Migration。高风险变更必须有真实恢复方式，但不强制不安全的形式化 Down Migration。

## 13. 数据库角色与访问边界

Migration Role 执行 Schema、表、约束与正式 Migration。Application Role 只允许 Core Application 必要的 SELECT、INSERT、UPDATE 和明确授权的 DELETE，不拥有任意 DDL 权限。Next.js、WordPress 和飞书不得持有 PostgreSQL 凭据。具体角色名、托管权限和凭据管理方式由部署任务决定。

## 14. 约束、删除与状态

OpenAPI/请求层验证结构和格式；NestJS 验证业务规则、权限与状态流转；PostgreSQL 保证不可绕过的主键、外键、必要复合外键、NOT NULL、唯一性、数值范围、当前路径唯一、RFQ 行号唯一、正数量和幂等 key 唯一。

不把复杂流程强行写成数据库逻辑，第一阶段不为跨产品族完整性增加触发器。

不得机械使用 `ON DELETE CASCADE`。Product、Page、Page Version、RFQ、Color 和未来 Product Spec 等有独立历史价值的实体默认不级联删除。也不建立全表通用 Soft Delete 或统一的 deleted 字段；业务停用优先使用领域明确的状态，具体集合由对应任务确定。

## 15. 索引原则

索引由真实查询路径驱动。第一阶段已知访问路径包括 Site + Current Path、Page + Version Number、Page + Source Version Key、Site + WordPress Source Identity、Request + Line Number、Scope + Idempotency Key。

不得为所有字段、外键、状态或 JSONB 机械建索引，也不为未来报表提前堆积索引或重复主键/唯一索引。其他索引在真实查询和数据规模出现后通过 PostgreSQL `EXPLAIN` 决定。

## 16. 权威层级与 API 隔离

权威层级为：

```text
架构权威文档
→ 当前 Drizzle 目标映射
→ 已审查 SQL Migration 这一正式结构变更路径
→ 运行 PostgreSQL 的环境实际状态与验证证据
```

运行数据库不能因人工修改而反向成为架构事实；Drizzle Schema 与 Migration 不得长期不一致。

Database Row 不得直接作为 REST/OpenAPI DTO 返回，必须经过 `Database Row → Domain Projection/Adapter → API DTO`，避免内部状态泄漏并保持 API 与数据库演进解耦。

## 17. 测试要求

纯业务规则和纯函数测试不需要数据库。Migration、外键、复合外键、UNIQUE、CHECK、JSONB、事务、并发幂等和实际 SQL 查询必须使用与目标主版本尽量一致的真实 PostgreSQL；不得用 SQLite 模拟，也不得只凭 Mock Repository 声称数据库约束已验证。

## 18. 明确未决定事项

以下事项继续后置，不得据本文档自行补全：

- UUID v4、UUID v7 或整数主键；
- Product Model 是否全局唯一；
- Category 是否最终多对多；
- Product 全部技术字段；
- Product Spec、Track Weight 与布带的实际 DDL；
- Product Spec 状态和每条外键的删除动作；
- 完整索引清单；
- Audit、Outbox、CRM、ERP；
- 媒体资产表与对象存储；
- 旧 MySQL RFQ 迁移方式；
- PostgreSQL 托管平台、连接池、备份恢复和保留周期；
- 精确 Drizzle 版本与最终 PostgreSQL Driver；
- NestJS 目录结构。

推荐的下一候选任务是“PostgreSQL 与 Drizzle 最小兼容性验证”。它只是待讨论候选，不因本文档自动创建或获得实施授权。

## 19. 当前迁移资产说明

现有 Product Detail、Product Configuration、Quote Basket、RFQ 合同、WordPress 读取链路和本地 MySQL `persistent_stub` 继续作为字段需求、行为证据和迁移资产保留。MySQL 的外部 Stub Sink 交付状态机不是目标 PostgreSQL RFQ 模型。任何替换都必须经过专项设计、验证、验收和渐进迁移，在此之前不得删除现有有效实现。
