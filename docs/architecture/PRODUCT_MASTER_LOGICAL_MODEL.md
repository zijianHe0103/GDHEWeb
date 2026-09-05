# GDHE 产品主数据逻辑业务模型

status: ACCEPTED
task_id: TASK-033
authority_level: LOGICAL_BUSINESS_MODEL

## 1. 文档目的与边界

本文档记录 TASK-033 已确认的产品主数据逻辑业务模型，供未来 GDHE 独立站、内部 ERP、CRM 和其他系统共同引用。

本文档定义长期业务概念、职责边界和已经确认的产品族规则，但不是物理数据库设计、API 设计或迁移方案。本文出现的 `Product`、`Product Spec` 等名称是业务概念名称，不自动等同于未来的表名、类名、接口名或目录名。

本轮不实施数据库、API、NestJS、Next.js、WordPress、ERP、RFQ 合同或现有数据迁移，也不删除或废弃任何现有能力。

## 2. 总体逻辑模型

GDHE 各业务入口共用统一产品主数据域。“共用统一产品数据库”不表示把所有产品和规格存放在一张万能表中。

产品主数据逻辑上至少区分：

1. `Product`；
2. `Product Spec`；
3. 共享字典及 `Product Allowed Configuration`；
4. 品类专属的工程规格和 Spec Detail 结构。

这些概念共同构成产品主数据，但承担不同职责。未来物理模型必须保留这些职责边界，不能为了表面扁平而重复公共数据或制造大量无意义空字段。

## 3. Product

`Product` 表示官网展示和人员识别的产品款式、型号及公共身份。

其跨系统公共信息可以包括：

- Core Product ID；
- 型号；
- 中文品名；
- 英文品名；
- 产品分类；
- 系列；
- 公共技术事实；
- 产品状态。

官网产品卡片、产品详情页和 WordPress 页面均绑定 `Product`。`Product` 不是某个具体成品规格，也不以 `Article Number` 作为自身身份。

## 4. Product Spec

`Product Spec` 表示 ERP、报价、生产及未来库存系统能够唯一识别的具体成品规格。

已确认边界：

- `Article Number` 属于 `Product Spec`，不属于 `Product`；
- `Product Spec` 关联 `Product`，但不复制 `Product` 的完整公共信息；
- ERP 页面可以通过关联查询扁平展示 `Article Number`、型号、中英文品名和各项规格；
- 底层不得为每个 `Product Spec` 重复保存整套 `Product` 公共字段。

只有真实存在、旧 ERP 已存在、实际使用过或已正式进入生产的具体规格才创建为 `Product Spec`。不得提前生成共享字典和允许配置的全部理论组合。

## 5. 共享字典与允许配置

颜色等可跨产品复用的值使用统一共享目录。当前颜色字典及允许关系的最小物理结构见 `core_database_architecture` 的 TASK-037 七表基础；其他字典继续按真实需求确定。

必须区分以下两个概念：

### Product Allowed Configuration

表示某个 `Product` 原则上允许客户或销售使用哪些配置。它可以支撑公开选项、销售可选范围和业务校验，但不代表每个允许组合都已经有实际成品规格或 `Article Number`。

### Product Spec

表示某个真实 `Article Number` 实际对应的具体配置。

允许配置与实际规格不得混为一体。系统不得仅根据“某颜色可用”和“某长度可用”就推导该组合一定存在 `Article Number`。

## 6. 品类专属工程规格与 Spec Detail

不同产品族的规格组成明显不同。长期模型不得建立一张同时包含轨道、布带、电机和全部配件字段、并依靠大量空值区分产品族的万能规格结构。

采用的逻辑方向是：

- 公共 `Product`；
- 公共 `Product Spec`；
- 按业务需要建立的品类专属工程规格和 Spec Detail。

未来其他产品族是否需要专属结构，应依据其 `Article Number` 组成、生产方式和必填约束单独决定。不提前为每种配件建立专属结构。

## 7. 已验证产品族：轨道

### 7.1 逻辑组成

- `Product` 表示轨道款式和型号；
- 轨道工程规格当前主要包含单位米重；
- 轨道 `Product Spec` 的具体身份由重量规格、颜色和成品长度共同组成；
- `Article Number` 属于该 `Product Spec`。

包装方式、Logo 和保护方式不属于轨道 `Product Spec`，除非未来业务确认其中某项会改变 `Article Number`。

### 7.2 第一阶段已确认规则

- 分类：`Curtain Tracks > Manual Tracks`；
- 标准长度：`4300 mm`、`5800 mm`、`6000 mm`、`6300 mm`、`6700 mm`；
- 颜色和长度可以作为官网公开询价选项；
- 重量规格影响成本、报价和生产；
- 第一阶段官网不公开展示重量规格，也不让客户直接选择；
- 销售与客户建联后再确认重量；
- 官网原始 RFQ 不强制解析 `Product Spec` 或 `Article Number`。

## 8. 已验证产品族：布带

- `Product` 表示官网展示的布带款式或系列；
- 布带工程规格包括织带宽度、钉子间距、钉子种类和织带厚度；
- 布带 `Product Spec` 再组合工程规格、颜色和整卷米数；
- `Article Number` 属于该 `Product Spec`。

轨道和布带的专属工程规格不得塞入同一张包含大量空字段的万能结构。

## 9. RFQ、销售确认与 ERP 边界

### 9.1 客户原始 RFQ

官网原始 RFQ保存客户当时提交的事实：

- `Product`；
- 客户选择的颜色；
- 客户选择的长度；
- 数量；
- 其他公开询价要求。

原始 RFQ 不保存尚未确认的轨道重量，也不要求已经存在或解析出 `Article Number`。

### 9.2 销售确认与规格解析

销售与客户沟通后，再确认重量等内部规格。完整规格确认后，系统或 ERP 才解析已有 `Product Spec`，或按未来受控流程创建 `Product Spec`，并取得 `Article Number`。

客户原始 RFQ 与销售确认后的报价规格必须分别保存。销售确认结果不得覆盖客户最初提交的数据。

## 10. WordPress 与 ERP 边界

### WordPress

- 绑定 `Product`；
- 管理页面、营销文案、布局、图片和 SEO；
- 不管理 `Product Spec`、`Article Number`、报价、生产和库存。

### ERP

- 使用 `Product Spec` 和 `Article Number`；
- 未来管理报价、订单、生产、库存和成本。

WordPress 和 ERP 是并行系统，共同引用统一产品主数据，但不建立在彼此的数据表之上。

## 11. 现有 GDHEWeb 资产与长期模型的关系

现有代码中的以下能力可以作为字段需求和迁移资产参考：

- Product Configuration；
- `articleNumberOptions`；
- 颜色和长度选择；
- Custom Length；
- Quote Line；
- RFQ 快照。

当前通过 Product、Color 和 Length 直接解析 `Article Number` 的方式不符合长期目标，因为轨道重量在官网阶段尚未确认。不得将现有 Product Configuration V2 原样复制为新的长期产品模型。

该结论不授权本轮修改现有 RFQ 合同或运行代码。现有有效实现继续保留，直到后续专项任务完成替代设计、迁移、验证和验收。

## 12. 明确保留为后续专项设计的事项

以下为 TASK-033 留给后续专项的事项。其中 ORM/迁移工具已由 TASK-036 验证，Site / Manual Track Catalog 七表由 TASK-037 实施，当前物理选择统一通过 Manifest 的 `core_database_architecture` 与 `core_database_source` 发现。以下列表只适用于尚未被这些专项覆盖的部分：

- PostgreSQL 的物理表、Schema、字段名和字段类型；
- 主键、外键、唯一约束、索引和历史版本策略；
- 字典、允许配置和专属规格的物理组织方式；
- 产品状态、规格状态及审批流程；
- 其他产品族是否需要专属规格结构；
- API 形式、路径、DTO 和权限；
- 原始 RFQ 到销售确认规格的工作流；
- `Product Spec` 的解析、创建、审核和 `Article Number` 分配机制；
- 旧 ERP、飞书、WordPress 及现有 GDHEWeb 数据的映射和迁移方式；
- ERP 的报价、订单、生产、库存和成本实现。

任何后续实施任务都必须重新确认其专项范围，不得从本文档自动推导物理设计或直接编码。
