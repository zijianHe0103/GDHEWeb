# Local Manual Track Catalog API

版本：1.0.0（TASK-038 实现范围，非生产部署）。

本合同描述本次 REST 语义与权限。字段级机器权威是 [core/src/catalog/contract.ts](../../core/src/catalog/contract.ts)：TypeBox 同时提供输入类型、Ajv 校验和 OpenAPI 3.1，运行时由受控 `GET /openapi.json` 返回。此处不复制完整 JSON Schema，不另存一份 OpenAPI 快照。运行步骤见 [Core README](../../core/README.md)。

## 地址与访问控制

服务仅绑定 `127.0.0.1`，默认端口 3100。所有已实现接口要求 `Authorization: Bearer <service credential>`；无凭据或错误凭据为 401。服务启动时要求两个不同的强服务凭据，不能由调用方另加 role/identity 请求头获取权限。

- **维护凭据**：可创建/修改产品，读取内部维护详情、搜索、CMS 与参考数据。
- **CMS 凭据**：仅能读取 CMS、参考数据、健康检查和 OpenAPI；所有写入以及内部维护详情/搜索为 403。

此为当前本地服务权限，不冻结 SSO、OIDC、用户表或完整 RBAC。未来 WordPress 只能取得 CMS 读取凭据，不应使用维护凭据。CORS 不是身份验证；本任务没有启用浏览器跨域授权。

## 实际接口

| 方法与路径 | 权限 | 结果 |
| --- | --- | --- |
| POST `/v1/catalog/manual-track-products` | 维护 | 201，三表原子创建后的内部维护视图 |
| GET `/v1/catalog/manual-track-products` | 维护 | 有界产品身份搜索页 |
| GET `/v1/catalog/manual-track-products/{id}` | 维护 | 完整内部维护视图 |
| PATCH `/v1/catalog/manual-track-products/{id}` | 维护 | 200，原子更新后的内部维护视图 |
| GET `/v1/cms/products` | CMS/维护 | 有界 CMS 产品选择搜索页 |
| GET `/v1/cms/products/{id}` | CMS/维护 | CMS 识别视图和 `publicFacts` 或 null |
| GET `/v1/catalog/references/categories` | CMS/维护 | Category 参考页，含停用状态 |
| GET `/v1/catalog/references/colors` | CMS/维护 | Color 参考页，含停用状态 |
| GET `/v1/catalog/references/standard-lengths` | CMS/维护 | 当前 active 标准长度，整数字段 `lengthMm` |
| GET `/health/ready` | CMS/维护 | 数据库可访问且产品表可读时 200 |
| GET `/openapi.json` | CMS/维护 | 当前实际接口的 OpenAPI 3.1 |

没有 DELETE、字典写入、匿名公开 Catalog 或 Site 参数接口。当前服务只用于 GDHE 的本地受控工作范围，不宣称 Product 归属于某个 Site，更不宣称自动对所有 Site 可见。

## 创建与 PATCH 语义

创建必须显式提交 `model`、`nameZh`、`nameEn`、`primaryCategoryId`、`status`、`allowsCustomLength`、`quantityUnit` 和 `colors`。`status` 仅 active/inactive，不能省略后自动 active；`quantityUnit` 仅 piece。当前 Core 用 UUIDv4 生成 Product ID，不按型号查询/合并产品。

型号最多 120 个 Unicode code points，中英文名称各最多 240 个；至少包含一个非空白字符，保存时 trim。颜色本次提交最多 100 项，每项明确包含 Color ID、状态、isPublic 和非负 int32 sortOrder；Color ID 按 PostgreSQL UUID 语义去重，大小写变体不能形成重复提交项。颜色数组可为空。

PATCH 是这组允许字段的具体补丁，不是通用字段引擎：

- 至少提交一个允许字段，不接受 null 代替省略。
- 未提交字段保持原值；未提交颜色关系保持原值。
- `colors` 中的每项是该关系的完整新配置，仅对这些 Color ID 执行 upsert；空数组不删除/停用任何关系。
- 停止公开用 isPublic=false；停用用 status=inactive；不物理删除关系。
- ID、familyCode、createdAt、updatedAt、Article Number 和未实现字段不可写。
- Product updated_at 每次保存由服务端维护；实际修改 Track 或颜色项时维护其 updated_at，created_at 不变。
- 同一 Product 的保存由 Product 行更新锁串行化；普通补丁只影响自身提供的字段，未建立版本审批或乐观版本冲突协议。

Category 和 Color 必须已存在。Core 不按名称创建参考记录。外键约束在真实事务内检查，不存在引用返回 409。Product、Track 和颜色配置整体提交或整体回滚；缺少 Track 的既有不完整记录更新返回 409，不自动修造扩展。

active 是 Catalog 生命周期，不是 WordPress 发布状态。对 active Product 的受控保存完成后，其当前事实立即更新；保存 inactive Product 不自动成为公开事实。本版本无编辑草稿副本、审批或发布工作流。

## 搜索与参考数据

产品搜索使用 `q`（可省略，最多 100 code points），对型号、中英文名称做数据库端不区分大小写的字面子串查找；`%`、`_`、反斜线不是调用方通配符。空/纯空白 q 表示有界浏览。

搜索及 Category/Color 参考分页使用 `limit` 1..50（默认 20）、`offset` 0..10000（默认 0）。HTTP query 使用十进制字符串；数组、额外参数和非法数字被拒绝。结果为 `items, limit, offset, hasMore`，不先取全量再分页。产品顺序为 model、ID；参考字典为 code、ID。该排序稳定，但不是跨并发编辑的搜索快照保证。

标准长度不接受分页参数，直接读取全部当前 active 标准字典，按 sortOrder、lengthMm 排序。Core 不再维护或写入第二份五个长度常量。

## 三种视图与 TASK-039 交接

**内部维护详情**含 Product 系统时间、Track 时间和全部颜色关系状态/顺序/时间，仅维护身份可读。搜索为较小的身份列表，不逐产品查询完整颜色集合。

**CMS 选择视图**含 Core Product ID、型号、中英文品名、familyCode、分类识别信息、Product 状态和当前 Track 能力；允许识别 inactive 或缺 Track 记录。CMS 详情的 `publicFacts` 是限定的当前英文事实或 null，不能把其存在解释为页面已发布/完整网站发布资格通过。

**公开事实投影**由可复用的 `CatalogService.getPublicFacts(id)` 提供，无匿名 HTTP 入口。它只返回 ID、型号、英文名称、必要英文分类识别、合法公开颜色、当前 active 标准长度、allowsCustomLength 和 piece 单位；没有中文识别名、内部时间、关系维护状态、重量、Article Number、Spec、成本或库存。按 ID 不存在抛受控 not-found；存在但不可提供事实则返回 null，数据库故障不变成 null。

过滤规则：Product 和 Primary Category 必须 active、Track 必须存在；颜色须同时满足 Color active、关系 active、isPublic=true。详情组合使用只读 repeatable-read 事务，避免一份详情混用多次提交的数据。没有 Site–Product 分配判定。

TASK-039 应使用 CMS 凭据搜索 `/v1/cms/products?q=...`，用返回的 Core Product ID 绑定，随后按 `/v1/cms/products/{id}` 读回；不能按可能重复的型号绑定。只在服务端保存 CMS 凭据，不把维护凭据交给 WordPress。

当前**未落地**媒体、截面尺寸、完整材质/安装参数、系列、兼容关系、Site 分配、公开版本和发布资格。没有 `allowsCustomColor` 不等于业务不支持定制颜色，也不返回虚构 false；后续 Catalog/RFQ 专项补齐。TASK-039 不应因接口缺口自行复制或补造这些事实。WordPress 选择/绑定由 TASK-039 实现，预览、Publication 和 RFQ 不包含在本合同。

## 错误与运行限制

400：非法/额外字段、UUID、枚举、重复颜色或查询；401/403：身份/权限；404：产品或路由不存在；409：引用冲突、不完整产品或写入约束冲突；413：JSON 请求体超过当前 HTTP 100 KiB 限制；503：数据库不可用；500：其他服务故障。准确的响应字段和 code 枚举以 OpenAPI 为准。

对外只返回 statusCode、code、message，不返回原始 SQL、堆栈、连接信息或凭据。对内记录必要事件、数据库错误代码及约束名，不记录 Authorization、请求体、SQL 参数或数据库 URL。本地运行不等于公网生产就绪。
