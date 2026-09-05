# GDHE Public Product Flow Contract

status: ACCEPTED
task_id: TASK-034
authority_level: LOGICAL_SYSTEM_CONTRACT
related_authorities: `PROJECT/CONTRACT.md`、`docs/architecture/PRODUCT_MASTER_LOGICAL_MODEL.md`

## 1. 文档目的与非实施边界

本文档记录 GDHE 官网第一条公开产品纵向链路的长期业务合同：

1. Catalog → WordPress；
2. Core Publication → Next.js；
3. Next.js → RFQ。

本文档定义系统职责、逻辑交换内容、公开与内部数据边界、原始业务语义和现有实现的迁移方向。文中的逻辑字段、对象和流程名称用于表达业务合同，不自动成为最终 API 字段名、Request/Response、OpenAPI Schema、数据库表、类名或目录名。

本任务不实施 API、PostgreSQL、ORM、迁移、WordPress 插件、Gutenberg 区块、Next.js 页面、RFQ 合同或业务代码、身份认证、部署、CRM、ERP 或飞书集成，也不删除任何现有有效实现。

## 2. 第一阶段纵向链路

第一阶段只服务当前 GDHE 官网：

```text
Core Catalog Product
→ WordPress 搭建产品详情页
→ WordPress 发布正式页面版本
→ Core Application 组合页面与产品事实
→ Next.js 展示正式产品页面
→ 客户选择颜色、长度、数量及商业要求
→ 客户提交 RFQ
→ Core Application 保存原始询价
```

第一阶段不包含销售确认重量、Product Spec 选择、Article Number 解析、自动报价、ERP 下单、生产、库存、成本、飞书或完整 CRM 流程。

## 3. 全链路共同原则

- Product 及其事实由 Catalog 权威维护；页面和展示内容由 WordPress 权威维护；正式业务校验和数据保存由 Core Application 完成。
- 系统关系使用稳定身份，不使用可能变化或只在单一系统内有效的显示文本、Slug 或数据库 ID。
- 内部数据只有经过明确批准的公开投影才能进入 CMS 编辑或公开页面合同。
- WordPress 不复制维护 Product 事实；正式页面版本也不复制完整 Product 事实。
- Next.js 不自行拼装多个内部系统响应，也不承担全平台共享的核心业务规则。
- 客户提交的数据属于不可信输入；Core Application 重新验证并生成可信快照。
- 客户原始提交和销售后续确认分别保存，任何后续业务结果都不得覆盖原始事实。

## 4. Catalog → WordPress

### 4.1 Primary Product 绑定

每个 WordPress 产品详情页第一阶段绑定一个主产品，逻辑身份为 Primary Core Product ID。

以下内容不能作为正式系统关联键：

- 型号；
- 中文品名；
- 英文品名；
- Slug；
- WordPress Post ID；
- Article Number。

运营人员可以用型号和中英文名称搜索、识别产品，但系统关系必须落在稳定 Core Product ID 上。一个产品详情页第一阶段只绑定一个 Primary Product。

页面可以额外引用相关产品、推荐配件、You May Also Need 或对比产品；这些是附加引用，不改变 Primary Product 的唯一绑定。

### 4.2 面向 CMS 的 Catalog 只读投影

WordPress 不访问完整内部 Catalog。Core Catalog 应提供一个面向 CMS 编辑场景的受控只读产品视图。

用于运营人员选择和内部识别的信息，逻辑上可以包括：

- Core Product ID；
- 型号；
- 中文品名；
- 英文正式名称；
- 产品类型；
- 分类路径；
- 系列；
- 产品状态；
- 当前网站使用资格。

中文品名可以在 WordPress 后台用于内部识别，不代表它自动进入英文官网。

针对 Manual Track，已经批准公开的 Product 事实概念上可以包括：

- 正式型号和英文产品名称；
- 分类与系列；
- 材质；
- 截面尺寸；
- 安装方式；
- 其他批准公开的技术事实；
- 公开允许颜色；
- 公开标准长度；
- 是否允许自定义长度；
- 公开兼容和配件关系；
- 产品状态；
- 产品基准技术资产。

Catalog 中存在某项数据，不代表该数据自动进入 WordPress 投影。

### 4.3 WordPress 不接收的内部数据

CMS 产品编辑合同不得包含：

- Product Spec；
- Article Number；
- 轨道重量规格；
- 成本和报价；
- 库存和生产数据；
- ERP 状态；
- 内部备注；
- 供应链信息；
- 其他未批准公开的工程或商业数据。

轨道重量是后续可协商的正式规格，但第一阶段不在官网展示，也不由 WordPress 管理。

### 4.4 WordPress 自有职责

WordPress 负责产品页面营销内容、页面结构和网站级展示，例如：

- 产品简介、定位、卖点、优势、应用场景、详细说明和 FAQ；
- Hero、图文、功能、事实、图片、视频、FAQ、CTA 和相关产品模块；
- 页面区块顺序及非必要模块显隐；
- 展示标题、Short Display Name、Hero Heading、Subtitle、Badge、Section Label、CTA 和产品卡片短标题；
- SEO Title、Meta Description、Slug、Canonical、Open Graph；
- 页面草稿、修订和正式发布版本；
- 营销媒体及页面内编排。

网站路由、Slug 和 SEO 属于 Publication，不属于 Catalog Product 的固有事实。

### 4.5 不复制 Product 事实

WordPress 中的事实区块只能保存 Product 引用、数据来源、展示方式、模块标题以及排列和显示设置，不能复制维护型号、正式名称、技术参数、允许颜色、标准长度、兼容关系或产品状态。

例如颜色区块可以声明使用当前 Primary Product、以色块展示并设置模块标题，但不能直接保存 White、Black 等事实值。长度区块也不能重复维护 `4300 mm`、`5800 mm`、`6000 mm`、`6300 mm`、`6700 mm`；实际值由 Catalog 根据 Product ID 提供。

### 4.6 Presentation Override

WordPress 可以覆盖当前网站或页面的展示方式，例如 Display Title、Short Display Name、Hero Heading、Subtitle、Badge、Section Label、页面级图片顺序、CTA、页面标签、SEO 和事实模块显隐。

WordPress 不能覆盖型号、Article Number、材质、截面尺寸、技术参数、允许颜色集合、标准长度、安装事实、兼容关系、产品状态、Product Spec 或重量规格。展示覆盖不得写回 Catalog。

### 4.7 产品关系

兼容、必需配件、推荐配件、替代等关系属于 Catalog 事实。Catalog 提供合法关系集合。

WordPress 可以决定是否展示、选择合法子集、调整展示顺序、设置模块标题和卡片样式；不能创建不存在的关系、把不兼容配件标为兼容、修改 Replacement 关系或改变关系业务类型。

### 4.8 Product Configurator Block

WordPress 可以决定当前页面是否显示配置器，并保存配置器标题、说明和布局。

配置器使用的公开允许颜色、标准长度、自定义长度规则、数量单位和其他公开配置规则来自 Catalog。WordPress 不参与 Article Number、Product Spec、RFQ 业务校验或 ERP 处理。

### 4.9 媒体职责

Catalog 管理产品截面图、尺寸图、工程图、标准结构图、颜色标准样本和技术文件引用等基准技术资产。

WordPress 管理 Hero、应用场景、Gallery、视频、案例图片、页面图片顺序以及营销用途说明和 Alt Text。WordPress 可以引用 Catalog 基准技术资产，但不能修改基准资产本身。

## 5. Core Publication → Next.js

### 5.1 正式运行时边界

正式生产环境的 Next.js 产品详情页只读取 Core Public API，不调用 WordPress REST API、WordPress 数据库、Catalog 数据库或其他内部数据库。

WordPress 暂时不可用时，已经正式发布的官网页面仍应能够运行。具体缓存、存储和故障恢复实现留待专项设计。

### 5.2 单一 Published Product Page View

产品详情页第一阶段使用一个完整、受控、版本化的 Published Product Page View。Next.js 不在首屏分别调用 WordPress、Catalog、Publication、媒体和关系接口后自行拼装。

Core Application 统一组合：

- Publication 正式页面版本；
- Catalog 当前公开 Product 事实；
- 公开配置规则；
- 产品关系；
- Catalog 基准技术资产；
- WordPress 营销媒体；
- 合法 Presentation Override。

### 5.3 Publication 正式页面版本

WordPress 发布结果逻辑上提供网站、语言、路由、Slug、展示标题、简介、卖点、应用场景、页面模块、FAQ、CTA、SEO、营销媒体、基准资产页面选择和排序、展示覆盖、相关产品展示选择、页面版本以及 Primary Product 引用。

WordPress 内容只有重新发布形成新的正式页面版本后，才改变正式页面内容。

### 5.4 Catalog 当前公开事实

Core Application 在组合页面时读取 Catalog 当前公开有效的 Product 身份、正式名称、型号、分类、系列、材质、截面尺寸、安装方式、公开技术事实、允许颜色、标准长度、自定义长度规则、合法关系、产品状态和基准技术资产。

Catalog Product 事实正式更新后，引用该 Product 的页面自动使用新事实，不要求 WordPress 重新发布。

### 5.5 Core Application 组合职责

Core Application 负责验证 Product 是否允许在当前网站公开，读取正式页面版本和当前公开 Product 事实，应用合法展示覆盖，解析事实模块和媒体引用，验证关系，排除内部数据并生成最终公开页面合同。

Next.js 不负责判断 Product 是否可公开、字段是否可覆盖、关系是否合法、颜色是否允许、Product 是否停用或 WordPress 引用是否有效。

### 5.6 页面版本与 Product 事实分别管理

正式页面版本保存 Primary Product 引用、页面内容、布局、展示覆盖、媒体引用、关系展示选择、SEO 和页面版本信息，不保存 Product 名称、技术参数、颜色、长度、安装方式、兼容关系或状态的完整副本。

正式渲染逻辑为：

```text
Published Page Version
+ Current Public Catalog Product Facts
= Final Published Product Page View
```

页面从较新版本回滚到旧版本时，只回滚布局、营销文案、SEO、展示覆盖、媒体编排和关系展示选择，不回滚 Product 当前正式名称、技术参数、允许颜色、长度规则或产品状态。第一阶段不要求页面绑定历史 Product 版本。

### 5.7 不消费 WordPress 原始结构

Next.js 不直接消费 WordPress Post、ACF/SCF 原始字段、Gutenberg 数据库存储、PHP Shortcode 或第三方插件结构。WordPress 发布内容必须转换成 GDHE 自有、受控、版本化的页面模块合同；具体模块 Schema 后续设计。

### 5.8 公开页面逻辑内容

Published Product Page View 逻辑上包括：

- 页面身份：网站、语言、路由和页面类型；
- SEO：标题、Meta Description、Canonical、Open Graph 和其他正式数据；
- Product 身份：公开身份、型号、正式名称和分类；
- 公开事实：技术事实、颜色、长度规则、安装方式和合法关系；
- Presentation：展示标题、简介、页面模块、FAQ、CTA 和覆盖；
- Media：基准技术资产、营销媒体以及最终选择和顺序；
- Public Configuration：颜色、标准长度、自定义长度能力、数量单位和官网允许收集的配置；
- Related Content：相关产品、推荐配件及其他经过 Catalog 验证的关系。

公开页面合同不得包含 Product Spec、Article Number、轨道重量、成本、报价、库存、生产数据、ERP 状态、内部备注、数据库结构或 WordPress 内部 ID。

### 5.9 公开媒体投影

Next.js 不需要知道媒体内部来源。Core Application 将 Catalog、WordPress 或未来对象存储中的合法媒体统一转换成公开媒体对象，逻辑上至少提供公开 URL、尺寸、Alt Text 和媒体用途；普通公开合同不暴露内部来源信息。

## 6. Next.js → RFQ

### 6.1 原始询价语义

官网 RFQ 保存客户在页面上实际看到并提交的原始需求。它不是最终 ERP Product Spec、正式报价、销售订单、生产工单、库存预留或商业合同。

第一阶段逻辑流程为：

```text
客户打开产品详情页
→ 选择公开配置
→ 加入 Quote Basket
→ 填写客户与公司信息
→ Next.js 提交 RFQ
→ Core Application 重新验证 Product 与配置
→ 保存原始 RFQ 及 RFQ Lines
→ 返回公开回执
```

### 6.2 RFQ Header

现有十个客户字段、Intent、回执、幂等和提交状态原则上继续作为迁移资产保留，本任务不重新设计。Header 逻辑上包含客户姓名、公司、国家或地区、邮箱、电话或其他联系方式、客户 Intent、整体留言、来源网站、页面语言、提交时间和提交渠道。

### 6.3 RFQ Line 与 Product 身份

每个产品需求形成独立 RFQ Line。第一阶段轨道行逻辑上包含 Core Product ID、客户请求颜色、客户请求长度、数量、Commercial Requirements、客户行备注以及服务端生成的提交快照。

正式 Product 关联使用 Core Product ID，不使用型号、中英文品名、WordPress Post ID、Slug 或 Article Number。型号和名称快照必须由服务端根据 Product ID 生成。

### 6.4 颜色

标准颜色提交稳定 Color ID，不只提交可能翻译或调整的显示文本。Core Application 验证颜色存在、属于当前 Product 的公开允许颜色，并允许用于当前网站询价。

第一阶段允许 Custom Color Description，逻辑上表达定制类型、客户描述以及客户提供的色号或要求。定制颜色不会自动创建共享 Color、Product Spec 或 Article Number。标准颜色和定制颜色不能同时成为同一行最终选择。

### 6.5 长度

长度区分 Standard Length 与 Custom Length。核心业务语义统一使用整数毫米；前端负责将毫米转换成客户可读的米制显示。

Core Application 验证标准长度属于当前 Product 的公开允许长度；定制长度则验证 Product 允许定制、数值为正并符合允许精度和范围。具体字段名、精度上限和范围后续专项设计。

### 6.6 数量和 Commercial Requirements

第一阶段轨道数量单位为 piece，数量必须为正整数，单位来自 Catalog 产品规则，浏览器不能任意指定其他单位。

包装不属于 Product 或 Product Spec。现有包装能力长期归入 RFQ Line 的 Commercial Requirements，可表达基础包装、Logo、单支套袋或两支配对以及其他包装和商业要求。不同 RFQ Lines 可以拥有不同商业要求。

### 6.7 公开阶段排除的数据

公开 RFQ 不提交 Product Weight、Product Spec ID、Article Number、成本、报价、库存、生产要求、ERP 状态、销售负责人、客户最终确认的内部工程规格或内部备注。

轨道重量由销售与客户建联后确认。仅依靠 Product、Color 和 Length 不能唯一解析 Article Number，因为相同颜色和长度可能对应多个重量规格。

### 6.8 服务端重新验证与可信快照

Core Application 必须重新验证 Product 的存在、公开询价资格和网站资格；标准/定制颜色规则；标准/定制长度规则；正整数数量和单位；Commercial Requirements 的产品族允许范围。

验证失败不得静默修正、使用默认值或吞掉错误。

验证通过后，服务端生成可信 RFQ Line Snapshot。逻辑上可以记录 Product ID、提交时型号和正式名称、Color ID 和当时颜色名、标准或定制颜色、长度类型和毫米值、数量单位和数量、Commercial Requirements、来源网站和页面以及提交时公开配置版本。

浏览器传入的名称、型号和显示文本不能直接成为可信快照。即使名称、颜色名、Slug 或允许长度后来改变，系统仍应能够还原客户提交时看到和选择的内容。

### 6.9 原始 RFQ 与销售确认结果

原始 RFQ Line 永久表达客户最初需求。销售确认重量、正式规格、Article Number 和报价时，应形成独立的 Sales Confirmed Line、Quotation Line 或未来确认的等价业务记录。

```text
Original RFQ Line
→ Sales Confirmed / Quotation Line
```

销售结果和客户后续变更不得覆盖最初提交事实；具体历史版本和变更模型留待后续设计。

### 6.10 Basket 原子性、幂等和回执

一个 RFQ 可以包含一条或多条 Lines。整张 RFQ 原子提交：全部行合法才保存，任意一行不合法则整张不保存、返回对应行错误并保持 Basket 不变，不允许五条中只保存四条。

现有幂等、并发、跨重启恢复、提交回执和 Basket 精确清理语义继续作为迁移资产保留。同一次客户提交因网络重试重复发送时只能创建一张 RFQ。只有 Core Application 明确确认整张 RFQ 保存成功后，Next.js 才清除本次已提交的 Basket 内容。

成功响应只返回客户需要的公开回执，例如 Public RFQ Reference、提交时间、已接收行数、回执状态和后续联系说明，不返回数据库内部 ID、Product Spec ID、Article Number、CRM 内部状态、销售负责人或 ERP 状态。

## 7. 当前实现与长期目标的差异

现有 Product Detail、Product Configuration、Quote Basket、RFQ 表单与 Header、配置快照、幂等、并发、跨重启恢复、公开回执、Runtime Validator、DTO Adapter 和 server-only Transport 原则上继续作为迁移资产保留。

已确认的长期差异包括：

1. 当前 WordPress 同时承载产品事实、营销内容和 Article Number；长期由 Catalog 负责产品事实、WordPress 负责内容与页面、Product Spec 负责 Article Number。
2. 当前 WordPress Product Details 的 Model、Product Code、Specifications、Article Numbers、Finishes、Compatibility、Gallery 和 Marketing Content 不能原样成为新 CMS 合同。
3. 当前 Product + Color + Length 直接解析 Article Number 的方式不符合长期目标，因为官网阶段尚未确认重量；长期公开 RFQ 不强制包含 Article Number。
4. 当前包装属于 Product Configuration；长期归入 RFQ Line Commercial Requirements。
5. 当前 Next.js 产品详情运行时直接读取 WordPress CMS；长期正式链路为 Next.js → Core Public API → Published Product Page View。

这些差异只记录迁移方向，不授权本任务修改现有代码、合同或数据流。

## 8. 明确保留为后续设计的事项

TASK-034 本身不冻结下列实现。后续 TASK-035 已确认数据库骨架，TASK-036 已验证并采用 Drizzle 工具链，TASK-037 当前只实施 Site / Manual Track Catalog 七表；这些后续进展通过 Manifest 的 `core_database_architecture` 与 `core_database_source` 路由发现，不更改本文的业务逻辑合同。

- 最终 API 形式、路径、Request/Response 字段和 OpenAPI Schema；
- PostgreSQL 表、Schema、字段、类型、约束和索引；
- Catalog CMS 投影和 Core Public API 的物理实现；
- WordPress 发布、预览、回滚、同步和失败恢复机制；
- Gutenberg 区块 Schema 与页面模块 Schema；
- Next.js 页面组件和缓存策略；
- RFQ Header/Line/Snapshot 的物理存储和迁移；
- 身份认证、权限、审计和部署；
- Product Spec 解析、Article Number 分配、销售确认和 ERP 流程；
- CRM 与飞书集成。

其余具体机制继续由后续任务分别确认；已接受的逻辑职责不表示接口、发布桥接或业务模块已经实现。本文不构成后续任务的自动实施授权。
